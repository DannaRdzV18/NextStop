from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from ..models import Itinerario, DetalleItinerario

class AgregarDestinoView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        id_itinerario = request.data.get("id_itinerario")
        destino = request.data.get("destino")

        if not id_itinerario or not destino:
            return Response({"error": "Faltan parámetros"}, status=400)

        try:
            itinerario = Itinerario.objects.get(id=id_itinerario)
        except Itinerario.DoesNotExist:
            return Response({"error": "Itinerario no encontrado"}, status=404)

        # ======================================================
        # 🔥 NUEVO: Mapeo automático del formato del frontend
        # ======================================================

        ciudad = destino.get("nombre")  # viene del autocomplete
        dias = destino.get("dias")

        # Fechas: el front NO las manda explícitas, así que no las usamos aún
        fecha_salida = destino.get("fecha_salida") or None
        fecha_llegada = destino.get("fecha_llegada") or None

        # personas: tomamos 1 por ahora
        personas = destino.get("personas", 1)

        # Guardar info completa (vuelos, hoteles, actividades)
        info_completa = {
            "vuelos": destino.get("flights", []),
            "hoteles": destino.get("hotels", []),
            "actividades": destino.get("activities", []),
            "selectedFlight": destino.get("selectedFlight"),
            "selectedHotel": destino.get("selectedHotel"),
            "selectedActivity": destino.get("selectedActivity"),
            "dias": dias
        }

        # ======================================================

        nuevo_orden = DetalleItinerario.objects.filter(itinerario=itinerario).count() + 1

        DetalleItinerario.objects.create(
            itinerario=itinerario,
            tipo_item="DESTINO",
            nombre_item=ciudad or "Destino",
            fecha_salida=fecha_salida,
            fecha_llegada=fecha_llegada,
            personas=personas,
            info_completa=info_completa,
            orden=nuevo_orden
        )

        return Response({"mensaje": "Destino guardado correctamente."}, status=201)