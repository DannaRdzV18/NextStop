from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from rest_framework_simplejwt.authentication import JWTAuthentication

from itinerarios.models import DetalleItinerario
from usuarios.models import Usuario
from ..serializers import ItinerarioSerializer
from ..models import Itinerario

class CrearItinerarioView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):

        payload = request.auth
        usuario_id = payload.get("user_id")  # <--- CORREGIDO

        try:
            usuario = Usuario.objects.get(id=usuario_id)
        except Usuario.DoesNotExist:
            return Response({"detail": "User not found", "code": "user_not_found"}, status=404)

        data = request.data
        detalles = data.pop("detalles", [])

        serializer = ItinerarioSerializer(data=data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        itinerario = serializer.save(usuario=usuario)

        for index, destino in enumerate(detalles):
            DetalleItinerario.objects.create(
                itinerario=itinerario,
                tipo_item="DESTINO",
                nombre_item=destino.get("destinos") or destino.get("nombre", "Destino"),
                dias=destino.get("dias", 1),
                info_completa=destino,
                orden=index + 1,
                origen=destino.get("origen", ""),
                destinos=destino.get("destinos", ""),
                costo_estimado=destino.get("costo_estimado", 0),
                presupuesto=destino.get("presupuesto", 0),
                personas=destino.get("personas", 1),
            )

        return Response(ItinerarioSerializer(itinerario).data, status=201)