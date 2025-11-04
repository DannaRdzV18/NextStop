from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from ..models import Itinerario, ProveedorAPI, DetalleItinerario
from ...apis_externas.services.amadeus_flights import buscar_vuelos

class VuelosView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        origen = request.query_params.get("origen")
        destino = request.query_params.get("destino")
        fecha_salida = request.query_params.get("fecha_salida")

        if not all([origen, destino, fecha_salida]):
            return Response({"error": "Faltan parámetros"}, status=400)

        vuelos = buscar_vuelos(origen, destino, fecha_salida)
        return Response(vuelos)

    def post(self, request):
        id_itinerario = request.data.get("id_itinerario")
        vuelo = request.data.get("vuelo")
        if not all([id_itinerario, vuelo]):
            return Response({"error": "Faltan parámetros"}, status=400)

        try:
            itinerario = Itinerario.objects.get(id=id_itinerario, usuario=request.user)
        except Itinerario.DoesNotExist:
            return Response({"error": "Itinerario no encontrado"}, status=404)

        proveedor, _ = ProveedorAPI.objects.get_or_create(nombre="Amadeus API", tipo="VUELO")
        DetalleItinerario.objects.create(
            itinerario=itinerario,
            proveedor=proveedor,
            tipo_item="TRANSPORTE",
            origen=vuelo.get("origin", ""),
            destinos=vuelo.get("destination", ""),
            fecha_salida=vuelo.get("departureDate", ""),
            fecha_llegada=vuelo.get("arrivalDate", ""),
            costo_estimado=vuelo.get("price", {}).get("total", 0),
            personas=1,
            presupuesto=vuelo.get("price", {}).get("total", 0),
            orden=DetalleItinerario.objects.filter(itinerario=itinerario).count() + 1
        )
        return Response({"mensaje": "Vuelo agregado al itinerario"})
