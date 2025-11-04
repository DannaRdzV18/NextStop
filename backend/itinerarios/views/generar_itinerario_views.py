from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from ..models import Itinerario, ProveedorAPI, DetalleItinerario
from ..serializers import ItinerarioSerializer
from ...apis_externas.services.amadeus_flights import buscar_vuelos
from ...apis_externas.services.amadeus_hotels import buscar_hoteles

class GenerarItinerarioView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        data = request.data
        usuario = request.user
        nombre = data.get("nombre")
        ciudad_salida = data.get("ciudad_salida")
        destinos = data.get("destinos", [])  # lista de ciudades
        fecha_inicio = data.get("fecha_inicio")
        fecha_fin = data.get("fecha_fin")
        personas = data.get("personas", 1)

        if not all([nombre, ciudad_salida, destinos, fecha_inicio, fecha_fin]):
            return Response({"error": "Faltan parámetros"}, status=400)

        # Crear itinerario
        itinerario = Itinerario.objects.create(
            usuario=usuario,
            nombre=nombre,
            fecha_inicio=fecha_inicio,
            fecha_fin=fecha_fin
        )

        # Iterar por destinos y generar vuelos + hoteles
        origen_actual = ciudad_salida
        for destino in destinos:
            # Vuelos
            vuelos = buscar_vuelos(origen_actual, destino, fecha_inicio)
            if vuelos.get("data"):
                vuelo = vuelos["data"][0]  # tomar el primero
                proveedor_vuelo, _ = ProveedorAPI.objects.get_or_create(nombre="Amadeus API", tipo="VUELO")
                DetalleItinerario.objects.create(
                    itinerario=itinerario,
                    proveedor=proveedor_vuelo,
                    tipo_item="TRANSPORTE",
                    origen=origen_actual,
                    destinos=destino,
                    fecha_salida=fecha_inicio,
                    fecha_llegada=fecha_inicio,
                    costo_estimado=vuelo.get("price", {}).get("total", 0),
                    personas=personas,
                    presupuesto=vuelo.get("price", {}).get("total", 0),
                    orden=DetalleItinerario.objects.filter(itinerario=itinerario).count() + 1
                )

            # Hoteles
            hoteles = buscar_hoteles(destino, fecha_inicio, fecha_fin)
            if hoteles.get("searchResults", {}).get("results"):
                hotel = hoteles["searchResults"]["results"][0]
                precio = hotel.get("ratePlan", {}).get("price", {}).get("current", 0)
                proveedor_hotel, _ = ProveedorAPI.objects.get_or_create(nombre="Hotels.com API", tipo="HOTEL")
                DetalleItinerario.objects.create(
                    itinerario=itinerario,
                    proveedor=proveedor_hotel,
                    tipo_item="HOTEL",
                    origen=destino,
                    destinos=hotel.get("name", "Hotel sin nombre"),
                    fecha_salida=fecha_inicio,
                    fecha_llegada=fecha_fin,
                    costo_estimado=precio,
                    personas=personas,
                    presupuesto=precio,
                    orden=DetalleItinerario.objects.filter(itinerario=itinerario).count() + 1
                )

            origen_actual = destino  # siguiente vuelo sale de aquí

        serializer = ItinerarioSerializer(itinerario)
        return Response(serializer.data, status=201)
