from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from ..models import Usuario
from django.contrib.auth.hashers import check_password

class LoginUsuarioView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            return Response({'error': 'Email y contraseña son requeridos.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            usuario = Usuario.objects.get(email=email)
        except Usuario.DoesNotExist:
            return Response({'error': 'Usuario no encontrado.'}, status=status.HTTP_404_NOT_FOUND)

        if not usuario.email_verificado:
            return Response({'error': 'Correo no verificado.'}, status=status.HTTP_403_FORBIDDEN)

        if not check_password(password, usuario.password_hash):
            return Response({'error': 'Contraseña incorrecta.'}, status=status.HTTP_401_UNAUTHORIZED)

        return Response({
            'mensaje': 'Login exitoso',
            'usuario': {
                'id': usuario.id,
                'nombre': usuario.nombre,
                'email': usuario.email,
                'telefono': usuario.telefono,
                'idioma_preferido': usuario.idioma_preferido,
                'moneda_preferida': usuario.moneda_preferida,
            }
        }, status=status.HTTP_200_OK)
