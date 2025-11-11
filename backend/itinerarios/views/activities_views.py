from rest_framework.permissions import AllowAny
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from ..models import Itinerario, ProveedorAPI, DetalleItinerario
from apis_externas.services.amadeus_activities import buscar_actividades


class ActivitiesView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        """
        Buscar actividades recomendadas según ciudad y fecha de inicio.
        No requiere un itinerario.
        """
        ciudad = request.query_params.get("ciudad")
        fecha_inicio = request.query_params.get("fecha_inicio")

        # Validar parámetros mínimos requeridos
        if not all([ciudad, fecha_inicio]):
            return Response(
                {"error": "Faltan parámetros (ciudad y fecha_inicio son obligatorios)."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            # Llamar al servicio Amadeus
            actividades = buscar_actividades(ciudad, fecha_inicio)

            if not actividades:
                return Response(
                    {"mensaje": "No se encontraron actividades para esa fecha o ciudad."},
                    status=status.HTTP_200_OK,  # 🔹 Cambiado de 204 → 200
                )

            return Response(actividades, status=status.HTTP_200_OK)
        except Exception as e:
            print("Error al obtener actividades:", e)
            return Response(
                {"error": f"Ocurrió un error al obtener las actividades: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def post(self, request):
        """
        Guardar una actividad seleccionada en el itinerario.
        """
        id_itinerario = request.data.get("id_itinerario")
        actividad = request.data.get("actividad")

        # Validar que se reciba itinerario y actividad
        if not all([id_itinerario, actividad]):
            return Response(
                {"error": "Faltan parámetros (id_itinerario y actividad son obligatorios)."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            itinerario = Itinerario.objects.get(id=id_itinerario)
        except Itinerario.DoesNotExist:
            return Response(
                {"error": "Itinerario no encontrado"},
                status=status.HTTP_404_NOT_FOUND,
            )

        proveedor, _ = ProveedorAPI.objects.get_or_create(
            nombre="Amadeus Activities",
            tipo="DESTINO"
        )

        try:
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
        except Exception as e:
            print("Error al guardar actividad:", e)
            return Response(
                {"error": f"No se pudo guardar la actividad: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response(
            {"mensaje": "Actividad agregada al itinerario correctamente."},
            status=status.HTTP_201_CREATED,
        )