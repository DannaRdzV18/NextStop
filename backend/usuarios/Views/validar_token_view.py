from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import TokenError
from usuarios.models import Usuario


class ValidarTokenView(APIView):
    # 🔓 Desactivamos la seguridad automática que da problemas
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        """Valida el token manualmente buscando en la tabla correcta."""

        # 1. Extraer el token del encabezado
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return Response({"detail": "Token no proporcionado"}, status=401)

        try:
            # 2. Decodificar y verificar firma criptográfica
            token_str = auth_header.split(" ")[1]
            token = AccessToken(token_str)
            usuario_id = token['user_id']
        except TokenError:
            return Response({"detail": "Token inválido o expirado"}, status=401)

        # 3. Buscar en TU tabla de usuarios (usuarios_usuario)
        try:
            usuario = Usuario.objects.get(id=usuario_id)
        except Usuario.DoesNotExist:
            # Si el token es válido pero el usuario no existe en tu tabla
            return Response({"detail": "Usuario no encontrado en base de datos"}, status=404)

        # 4. Todo correcto, confirmamos al frontend
        return Response({
            "valid": True,
            "usuario": {
                "id": usuario.id,
                "nombre": usuario.nombre,
                "email": usuario.email,
                # Puedes agregar más datos si tu App.js los necesita
            }
        })