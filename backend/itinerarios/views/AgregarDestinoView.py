from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from ..models import Itinerario, DetalleItinerario, ProveedorAPI

class AgregarDestinoView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        id_itinerario = request.data.get("id_itinerario")
        destino = request.data.get("destino")

        if not id_itinerario or not destino:
            return Response({"error": "Faltan parámetros"}, status=400)

        try:
            itinerario = Itinerario.objects.get(id=id_itinerario)
        except Itinerario.DoesNotExist:
            return Response({"error": "Itinerario no encontrado"}, status=404)

        # Crear detalle del destino
        DetalleItinerario.objects.create(
            itinerario=itinerario,
            tipo_item="DESTINO",
            nombre_item=destino.get("ciudad", "Destino"),
            fecha_salida=destino.get("fecha_salida"),
            fecha_llegada=destino.get("fecha_llegada"),
            personas=destino.get("personas", 1),
            info_completa={
                "vuelos": destino.get("info_vuelos", []),
                "hoteles": destino.get("info_hoteles", []),
                "actividades": destino.get("info_actividades", [])
            },
            orden=DetalleItinerario.objects.filter(itinerario=itinerario).count() + 1
        )

        return Response({"mensaje": "Destino guardado como borrador."}, status=201)