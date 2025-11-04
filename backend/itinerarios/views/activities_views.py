from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from ..models import Itinerario, ProveedorAPI, DetalleItinerario
from ...apis_externas.services.amadeus_activities import buscar_actividades

class ActivitiesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Buscar actividades recomendadas según ciudad y fechas
        """
        id_itinerario = request.query_params.get("id_itinerario")
        ciudad = request.query_params.get("ciudad")
        fecha_inicio = request.query_params.get("fecha_inicio")
        fecha_fin = request.query_params.get("fecha_fin")

        if not all([id_itinerario, ciudad, fecha_inicio, fecha_fin]):
            return Response({"error": "Faltan parámetros"}, status=400)

        try:
            Itinerario.objects.get(id=id_itinerario, usuario=request.user)
        except Itinerario.DoesNotExist:
            return Response({"error": "Itinerario no encontrado"}, status=404)

        actividades = buscar_actividades(ciudad, fecha_inicio, fecha_fin)
        return Response(actividades, status=200)

    def post(self, request):
        """
        Guardar actividad seleccionada en el itinerario
        """
        id_itinerario = request.data.get("id_itinerario")
        actividad = request.data.get("actividad")

        if not all([id_itinerario, actividad]):
            return Response({"error": "Faltan parámetros"}, status=400)

        try:
            itinerario = Itinerario.objects.get(id=id_itinerario, usuario=request.user)
        except Itinerario.DoesNotExist:
            return Response({"error": "Itinerario no encontrado"}, status=404)

        proveedor, _ = ProveedorAPI.objects.get_or_create(nombre="Amadeus Activities", tipo="DESTINO")

        DetalleItinerario.objects.create(
            itinerario=itinerario,
            proveedor=proveedor,
            tipo_item="DESTINO",
            nombre_item=actividad.get("name", "Actividad turística"),
            destinos=actividad.get("city_name", ""),
            fecha_salida=actividad.get("start_date", ""),
            fecha_llegada=actividad.get("end_date", ""),
            costo_estimado=actividad.get("price", {}).get("amount", 0),
            personas=request.data.get("personas", 1),
            presupuesto=actividad.get("price", {}).get("amount", 0),
            orden=DetalleItinerario.objects.filter(itinerario=itinerario).count() + 1,
        )

        return Response({"mensaje": "Actividad agregada al itinerario"}, status=201)
