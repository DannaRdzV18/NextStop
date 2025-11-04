from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from ..models import Itinerario, ProveedorAPI, DetalleItinerario
from ...apis_externas.services.amadeus_transfers import buscar_transfers

class TransfersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Buscar opciones de transporte terrestre (autobús, tren, renta de auto)
        """
        id_itinerario = request.query_params.get("id_itinerario")
        origen = request.query_params.get("origen")
        destino = request.query_params.get("destino")
        fecha_salida = request.query_params.get("fecha_salida")

        if not all([id_itinerario, origen, destino, fecha_salida]):
            return Response({"error": "Faltan parámetros"}, status=400)

        try:
            Itinerario.objects.get(id=id_itinerario, usuario=request.user)
        except Itinerario.DoesNotExist:
            return Response({"error": "Itinerario no encontrado"}, status=404)

        resultados = buscar_transfers(origen, destino, fecha_salida)
        return Response(resultados, status=200)

    def post(self, request):
        """
        Guardar transporte seleccionado en el itinerario
        """
        id_itinerario = request.data.get("id_itinerario")
        transfer = request.data.get("transfer")

        if not all([id_itinerario, transfer]):
            return Response({"error": "Faltan parámetros"}, status=400)

        try:
            itinerario = Itinerario.objects.get(id=id_itinerario, usuario=request.user)
        except Itinerario.DoesNotExist:
            return Response({"error": "Itinerario no encontrado"}, status=404)

        proveedor, _ = ProveedorAPI.objects.get_or_create(nombre="Amadeus Transfers", tipo="TRANSPORTE")

        DetalleItinerario.objects.create(
            itinerario=itinerario,
            proveedor=proveedor,
            tipo_item="TRANSPORTE",
            nombre_item=transfer.get("name", "Transporte terrestre"),
            origen=transfer.get("origin", ""),
            destinos=transfer.get("destination", ""),
            fecha_salida=transfer.get("departure_time", ""),
            fecha_llegada=transfer.get("arrival_time", ""),
            costo_estimado=transfer.get("price", {}).get("total", 0),
            personas=request.data.get("personas", 1),
            presupuesto=transfer.get("price", {}).get("total", 0),
            orden=DetalleItinerario.objects.filter(itinerario=itinerario).count() + 1,
        )

        return Response({"mensaje": "Transporte agregado al itinerario"}, status=201)
