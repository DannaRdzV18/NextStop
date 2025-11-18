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
        # --- DEBUG PRINTS ---
        print("AUTH HEADER:", request.headers.get("Authorization"))
        print("USER:", request.user)
        print("AUTH PAYLOAD:", request.auth)

        # --- Token payload ---
        payload = request.auth
        if payload is None:
            return Response({"detail": "Invalid or missing token"}, status=401)

        # --- Obtener usuario_id del payload y convertir a int ---
        usuario_id = payload.get("usuario_id") or payload.get("user_id")
        if not usuario_id:
            return Response(
                {"detail": "Invalid token payload: missing user_id/usuario_id"},
                status=401
            )

        try:
            usuario = Usuario.objects.get(id=int(usuario_id))
        except Usuario.DoesNotExist:
            return Response(
                {"detail": "User not found", "code": "user_not_found"},
                status=404
            )

        # --- Itinerario ---
        data = request.data
        detalles = data.pop("detalles", [])

        serializer = ItinerarioSerializer(data=data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        itinerario = serializer.save(usuario=usuario)

        # --- Detalles ---
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


class ListarItinerariosView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        payload = request.auth

        usuario_id = payload.get("usuario_id") or payload.get("user_id")
        if not usuario_id:
            return Response(
                {"detail": "Invalid token payload: missing user_id/usuario_id"},
                status=401
            )

        itinerarios = Itinerario.objects.filter(usuario_id=int(usuario_id))

        paginator = PageNumberPagination()
        result_page = paginator.paginate_queryset(itinerarios, request)
        serializer = ItinerarioSerializer(result_page, many=True)
        return paginator.get_paginated_response(serializer.data)