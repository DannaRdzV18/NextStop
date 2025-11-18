from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.backends import TokenBackend
from django.conf import settings
from itinerarios.models import DetalleItinerario
from usuarios.models import Usuario
from ..serializers import ItinerarioSerializer
from ..models import Itinerario


class CrearItinerarioView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):

        # 1. Decodificar el token manualmente
        raw_token = request.auth
        token_backend = TokenBackend(algorithm=settings.SIMPLE_JWT["ALGORITHM"])
        payload = token_backend.decode(raw_token, verify=False)

        usuario_id = payload.get("usuario_id")
        if not usuario_id:
            return Response({"detail": "usuario_id not found in token"}, status=401)

        # 2. Buscar tu modelo Usuario
        try:
            usuario = Usuario.objects.get(id=usuario_id)
        except Usuario.DoesNotExist:
            return Response(
                {"detail": "User not found", "code": "user_not_found"},
                status=404
            )

        # 3. Procesar datos
        data = request.data
        destinos = data.pop("destinos", [])

        serializer = ItinerarioSerializer(data=data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        itinerario = serializer.save(usuario=usuario)

        # 4. Crear detalles
        for index, destino in enumerate(destinos):
            DetalleItinerario.objects.create(
                itinerario=itinerario,
                tipo_item="DESTINO",
                nombre_item=destino.get("nombre", "Destino"),
                dias=destino.get("dias", 1),
                info_completa=destino,
                orden=index + 1,
            )

        return Response(ItinerarioSerializer(itinerario).data, status=201)


class ListarItinerariosView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):

        # Igual que arriba: decodificar token
        raw_token = request.auth
        token_backend = TokenBackend(algorithm=settings.SIMPLE_JWT["ALGORITHM"])
        payload = token_backend.decode(raw_token, verify=False)

        usuario_id = payload.get("usuario_id")

        itinerarios = Itinerario.objects.filter(usuario_id=usuario_id)

        paginator = PageNumberPagination()
        result_page = paginator.paginate_queryset(itinerarios, request)
        serializer = ItinerarioSerializer(result_page, many=True)
        return paginator.get_paginated_response(serializer.data)