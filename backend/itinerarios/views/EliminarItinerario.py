from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import TokenError
from itinerarios.models import Itinerario

class EliminarItinerarioView(APIView):
    authentication_classes = []
    permission_classes = []

    def delete(self, request, pk):
        # 1. VALIDACIÓN MANUAL DEL TOKEN (Igual que en Crear/Listar)
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return Response({"detail": "No autorizado"}, status=401)
        try:
            token_str = auth_header.split(" ")[1]
            token = AccessToken(token_str)
            usuario_id = token['user_id']
        except TokenError:
            return Response({"detail": "Token inválido"}, status=401)
        # 2. BUSCAR Y BORRAR
        try:
            # Buscamos el itinerario por su ID (pk) Y aseguramos que pertenezca al usuario
            itinerario = Itinerario.objects.get(id=pk, usuario_id=usuario_id)
            # Al ejecutar delete(), Django borrará en cascada los DetalleItinerario asociados
            itinerario.delete()
            return Response({"detail": "Itinerario eliminado correctamente"}, status=200)
        except Itinerario.DoesNotExist:
            return Response(
                {"detail": "El itinerario no existe o no tienes permiso para eliminarlo."},
                status=404
            )
        except Exception as e:
            return Response({"detail": str(e)}, status=500)