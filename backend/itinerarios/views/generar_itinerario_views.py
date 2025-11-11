from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from ..models import Itinerario, ProveedorAPI, DetalleItinerario
from ..serializers import ItinerarioSerializer

# Servicios de Amadeus
from apis_externas.services.amadeus_flights import buscar_vuelos
from apis_externas.services.amadeus_hotels import buscar_hoteles
from apis_externas.services.amadeus_activities import buscar_actividades
from apis_externas.services.amadeus_transfers import buscar_transfers

# Logger personalizado
from logs.utils.logger import registrar_log


class GenerarItinerarioView(APIView):
    """
    Genera un itinerario completo con vuelos, hoteles, actividades y traslados.
    Soporta tipo_transporte: 'vuelo' o 'terrestre'.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data
        usuario = request.user

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
                tipo_transporte = destino.get("tipo_transporte", "vuelo").lower()

                if not all([ciudad_destino, fecha_llegada, fecha_salida]):
                    registrar_log(usuario, "ERROR", f"Destino con datos incompletos: {destino}")
                    continue

                # === 1. Transporte (vuelos o terrestres) ===
                try:
                    if tipo_transporte == "vuelo":
                        transportes = buscar_vuelos(origen_actual, ciudad_destino, fecha_llegada)[:3]
                        proveedor_nombre, tipo_proveedor = "Amadeus API", "VUELO"
                    elif tipo_transporte == "terrestre":
                        transportes = buscar_transfers(ciudad_destino, fecha_llegada)[:3]
                        proveedor_nombre, tipo_proveedor = "Amadeus API", "TRANSFER"
                    else:
                        registrar_log(usuario, "ERROR", f"Tipo de transporte inválido: {tipo_transporte}")
                        continue

                    proveedor_transporte, _ = ProveedorAPI.objects.get_or_create(nombre=proveedor_nombre, tipo=tipo_proveedor)
                    if not transportes:
                        registrar_log(usuario, "INFO", f"No se encontraron transportes para {ciudad_destino}")
                    else:
                        for transporte in transportes:
                            if tipo_transporte == "vuelo":
                                costo = transporte.get("price", {}).get("total", 0)
                                destino_nombre = ciudad_destino
                            else:
                                costo = transporte.get("price", {}).get("total", 0)
                                destino_nombre = transporte.get("description", "Traslado local")

                            DetalleItinerario.objects.create(
                                itinerario=itinerario,
                                proveedor=proveedor_transporte,
                                tipo_item="TRANSPORTE",
                                origen=origen_actual,
                                destinos=destino_nombre,
                                fecha_salida=fecha_llegada,
                                fecha_llegada=fecha_llegada,
                                costo_estimado=costo,
                                personas=personas,
                                presupuesto=costo,
                                orden=DetalleItinerario.objects.filter(itinerario=itinerario).count() + 1
                            )
                except Exception as e:
                    registrar_log(usuario, "ERROR", f"Error al buscar transportes ({tipo_transporte}): {e}")

                # === 2. Hoteles ===
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

                # === 3. Actividades ===
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
                                tipo_item="ACTIVIDAD",
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

                # Actualizar punto de origen para el siguiente destino
                origen_actual = ciudad_destino

            serializer = ItinerarioSerializer(itinerario)
            registrar_log(usuario, "INFO", f"Itinerario '{nombre}' generado correctamente.")
            return Response(serializer.data, status=201)

        except Exception as e:
            registrar_log(usuario, "ERROR", f"Fallo al generar itinerario: {e}")
            return Response({"error": "Ocurrió un error al generar el itinerario."}, status=500)