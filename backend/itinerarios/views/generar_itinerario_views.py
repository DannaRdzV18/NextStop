from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from ..models import Itinerario, ProveedorAPI, DetalleItinerario
from ..serializers import ItinerarioSerializer

# Servicios de Amadeus
from apis_externas.services.amadeus_flights import buscar_vuelos
from apis_externas.services.amadeus_hotels import buscar_hoteles
from apis_externas.services.amadeus_activities import buscar_actividades

# Logger personalizado
from logs.utils.logger import registrar_log
from usuarios.models import Usuario

class GenerarItinerarioView(APIView):
    """
    Genera un itinerario completo con vuelos, hoteles y actividades.
    (Ya no maneja transportes terrestres)
    """
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data
        usuario = request.user if request.user.is_authenticated else Usuario.objects.get(id=1)

        nombre = data.get("nombre")
        ciudad_salida = data.get("ciudad_salida")
        destinos = data.get("destinos", [])
        fecha_inicio = data.get("fecha_inicio")
        fecha_fin = data.get("fecha_fin")
        personas = data.get("personas", 1)

        if not all([nombre, ciudad_salida, destinos, fecha_inicio, fecha_fin]):
            registrar_log(usuario, "ERROR", "Intento fallido de generar itinerario: parámetros faltantes.")
            return Response({"error": "Faltan parámetros requeridos."}, status=400)

        try:
            itinerario = Itinerario.objects.create(
                usuario=usuario,
                nombre=nombre,
                fecha_inicio=fecha_inicio,
                fecha_fin=fecha_fin
            )

            origen_actual = ciudad_salida

            for destino in destinos:
                ciudad_destino = destino.get("codigo")
                fecha_llegada = destino.get("fecha_llegada")
                fecha_salida = destino.get("fecha_salida")

                if not all([ciudad_destino, fecha_llegada, fecha_salida]):
                    registrar_log(usuario, "ERROR", f"Destino con datos incompletos: {destino}")
                    continue

                # === 1. VUELOS ===
                try:
                    vuelos = buscar_vuelos(origen_actual, ciudad_destino, fecha_llegada)[:3]
                    proveedor_vuelo, _ = ProveedorAPI.objects.get_or_create(nombre="Amadeus API", tipo="VUELO")

                    if not vuelos:
                        registrar_log(usuario, "INFO", f"No se encontraron vuelos hacia {ciudad_destino}")
                    else:
                        for vuelo in vuelos:
                            costo = vuelo.get("price", {}).get("total", 0)
                            DetalleItinerario.objects.create(
                                itinerario=itinerario,
                                proveedor=proveedor_vuelo,
                                tipo_item="TRANSPORTE",
                                origen=origen_actual,
                                destinos=ciudad_destino,
                                fecha_salida=fecha_llegada,
                                fecha_llegada=fecha_llegada,
                                costo_estimado=costo,
                                personas=personas,
                                presupuesto=costo,
                                orden=DetalleItinerario.objects.filter(itinerario=itinerario).count() + 1
                            )
                except Exception as e:
                    registrar_log(usuario, "ERROR", f"Error al buscar vuelos: {e}")

                # === 2. HOTELES ===
                try:
                    hoteles = buscar_hoteles(ciudad_destino, fecha_llegada, fecha_salida, personas)[:3]
                    proveedor_hotel, _ = ProveedorAPI.objects.get_or_create(nombre="Amadeus API", tipo="HOTEL")

                    if not hoteles:
                        registrar_log(usuario, "INFO", f"No se encontraron hoteles en {ciudad_destino}")
                    else:
                        for hotel in hoteles:
                            precio = hotel.get("offers", [{}])[0].get("price", {}).get("total", 0)
                            DetalleItinerario.objects.create(
                                itinerario=itinerario,
                                proveedor=proveedor_hotel,
                                tipo_item="HOTEL",
                                origen=ciudad_destino,
                                destinos=hotel.get("hotel", {}).get("name", "Hotel sin nombre"),
                                fecha_salida=fecha_llegada,
                                fecha_llegada=fecha_salida,
                                costo_estimado=precio,
                                personas=personas,
                                presupuesto=precio,
                                orden=DetalleItinerario.objects.filter(itinerario=itinerario).count() + 1
                            )
                except Exception as e:
                    registrar_log(usuario, "ERROR", f"Error al buscar hoteles: {e}")

                # === 3. ACTIVIDADES ===
                try:
                    actividades = buscar_actividades(ciudad_destino, fecha_llegada)[:3]
                    proveedor_actividad, _ = ProveedorAPI.objects.get_or_create(nombre="Amadeus API", tipo="ACTIVIDAD")

                    if not actividades:
                        registrar_log(usuario, "INFO", f"No se encontraron actividades en {ciudad_destino}")
                    else:
                        for actividad in actividades:
                            DetalleItinerario.objects.create(
                                itinerario=itinerario,
                                proveedor=proveedor_actividad,
                                tipo_item="DESTINO",
                                origen=ciudad_destino,
                                destinos=actividad.get("name", "Actividad sin nombre"),
                                fecha_salida=fecha_llegada,
                                fecha_llegada=fecha_llegada,
                                costo_estimado=actividad.get("price", {}).get("amount", 0),
                                personas=personas,
                                presupuesto=actividad.get("price", {}).get("amount", 0),
                                orden=DetalleItinerario.objects.filter(itinerario=itinerario).count() + 1
                            )
                except Exception as e:
                    registrar_log(usuario, "ERROR", f"Error al buscar actividades: {e}")

                # Actualizar el punto de origen para el siguiente destino
                origen_actual = ciudad_destino

            serializer = ItinerarioSerializer(itinerario)
            registrar_log(usuario, "INFO", f"Itinerario '{nombre}' generado correctamente.")
            return Response(serializer.data, status=201)

        except Exception as e:
            registrar_log(usuario, "ERROR", f"Fallo al generar itinerario: {e}")
            return Response({"error": "Ocurrió un error al generar el itinerario."}, status=500)