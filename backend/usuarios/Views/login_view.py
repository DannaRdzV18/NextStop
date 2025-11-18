import requests
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.contrib.auth.hashers import check_password
from ..models import Usuario
from django.conf import settings
from rest_framework_simplejwt.tokens import RefreshToken


class LoginUsuarioView(APIView):
    """
    Endpoint para el inicio de sesión de usuarios registrados.
    Incluye verificación de Google reCAPTCHA.
    """
    permission_classes = [AllowAny]

    def verificar_recaptcha(self, token):
        """Verifica el token del reCAPTCHA con la API de Google"""
        if not token:
            return False

        secret_key = getattr(settings, "RECAPTCHA_SECRET_KEY", None)
        if not secret_key:
            print("⚠ No se encontró RECAPTCHA_SECRET_KEY en settings.py")
            return False

        data = {
            'secret': secret_key,
            'response': token
        }

        try:
            response = requests.post("https://www.google.com/recaptcha/api/siteverify", data=data)
            result = response.json()
            return result.get("success", False)
        except Exception as e:
            print(f"❌ Error verificando reCAPTCHA: {e}")
            return False

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        recaptcha_token = request.data.get('recaptcha_token')

        # 🧩 Verificar reCAPTCHA
        if not self.verificar_recaptcha(recaptcha_token):
            if recaptcha_token != "fake-token":  # Permite pruebas locales
                return Response(
                    {'error': 'No pasó la verificación del CAPTCHA'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        if not email or not password:
            return Response({'error': 'Email y contraseña son requeridos.'},
                            status=status.HTTP_400_BAD_REQUEST)

        try:
            usuario = Usuario.objects.get(email=email)
        except Usuario.DoesNotExist:
            return Response({'error': 'Usuario no encontrado.'},
                            status=status.HTTP_404_NOT_FOUND)

        if not usuario.email_verificado:
            return Response({'error': 'Correo no verificado.'},
                            status=status.HTTP_403_FORBIDDEN)

        if not check_password(password, usuario.password_hash):
            return Response({'error': 'Contraseña incorrecta.'},
                            status=status.HTTP_401_UNAUTHORIZED)

        refresh = RefreshToken.for_user(usuario)

        return Response({
            'mensaje': 'Login exitoso',
            'token': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
            'usuario': {
                'id': usuario.id,
                'nombre': usuario.nombre,
                'email': usuario.email,
                'telefono': usuario.telefono,
                'idioma_preferido': usuario.idioma_preferido,
                'moneda_preferida': usuario.moneda_preferida,
            }
        }, status=status.HTTP_200_OK)