from django.contrib.auth.hashers import make_password
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import TokenError
from ..models import Usuario


class EditarPerfilView(APIView):
    # Desactivamos auth automática para usar tu validación manual probada
    authentication_classes = []
    permission_classes = []

    def patch(self, request):
        # 1. VALIDACIÓN MANUAL DEL TOKEN (La misma que ya te funciona)
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return Response({"detail": "No autorizado"}, status=401)

        try:
            token_str = auth_header.split(" ")[1]
            token = AccessToken(token_str)
            usuario_id = token['user_id']
        except TokenError:
            return Response({"detail": "Token inválido"}, status=401)

        # 2. OBTENER EL USUARIO
        try:
            usuario = Usuario.objects.get(id=usuario_id)
        except Usuario.DoesNotExist:
            return Response({"detail": "Usuario no encontrado"}, status=404)

        # 3. ACTUALIZAR CAMPOS
        data = request.data

        # Actualizamos solo si el campo viene en la petición
        if 'nombre' in data:
            usuario.nombre = data['nombre']

        if 'email' in data:
            # Opcional: Validar que el nuevo email no exista ya en otro usuario
            if Usuario.objects.filter(email=data['email']).exclude(id=usuario.id).exists():
                return Response({"detail": "Este correo ya está en uso por otro usuario."}, status=400)
            usuario.email = data['email']

        if 'telefono' in data:
            usuario.telefono = data['telefono']

        # 4. MANEJO ESPECIAL DE CONTRASEÑA
        if 'password' in data and data['password']:
            # Encriptamos la contraseña antes de guardarla
            usuario.password_hash = make_password(data['password'])

        # 5. GUARDAR CAMBIOS
        usuario.save()

        return Response({
            "detail": "Perfil actualizado correctamente",
            "usuario": {
                "id": usuario.id,
                "nombre": usuario.nombre,
                "email": usuario.email,
                "telefono": usuario.telefono
            }
        }, status=200)