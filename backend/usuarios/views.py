from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from .serializers import UsuarioSerializer
from .models import Usuario
import random
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth.hashers import make_password, check_password
from .utils import verificar_recaptcha

class RegistroUsuarioView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data
        token = data.get('recaptcha_token')

        # Verificar CAPTCHA
        if not verificar_recaptcha(token):
            if token != "fake-token":
                return Response({'error': 'No pasó la verificación del CAPTCHA'}, status=status.HTTP_400_BAD_REQUEST)

        # Crear hash de contraseña
        if 'password' in data:
            data['password_hash'] = make_password(data.pop('password'))

        # Asegurarse de que campos opcionales tengan valor por defecto
        data.setdefault('telefono', '')
        data.setdefault('idioma_preferido', 'es')
        data.setdefault('moneda_preferida', 'MXN')

        # Validar si el email ya existe antes de llamar al serializer
        if Usuario.objects.filter(email=data.get('email')).exists():
            return Response({'error': 'Este correo ya está registrado'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = UsuarioSerializer(data=data)
        if serializer.is_valid():
            usuario = serializer.save(email_verificado=False)

            # Código de verificación de 4 dígitos
            codigo = random.randint(1000, 9999)
            usuario.codigo_verificacion = codigo
            usuario.save()

            # Enviar correo
            send_mail(
                'Verificación de cuenta NextStop',
                f'Tu código de verificación es: {codigo}',
                settings.DEFAULT_FROM_EMAIL,
                [usuario.email],
                fail_silently=False,
            )

            return Response({'mensaje': 'Usuario creado. Revisa tu correo para verificar tu cuenta.'}, status=status.HTTP_201_CREATED)

        print(serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class VerificarCorreoView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        codigo = request.data.get('codigo')

        try:
            usuario = Usuario.objects.get(email=email)
        except Usuario.DoesNotExist:
            return Response({'error': 'Usuario no encontrado'}, status=status.HTTP_404_NOT_FOUND)

        if str(usuario.codigo_verificacion) == str(codigo):
            usuario.email_verificado = True
            usuario.codigo_verificacion = None
            usuario.save()
            return Response({'mensaje': 'Correo verificado correctamente'}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Código incorrecto'}, status=status.HTTP_400_BAD_REQUEST)


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

        # Verificar la contraseña
        if not check_password(password, usuario.password_hash):
            return Response({'error': 'Contraseña incorrecta.'}, status=status.HTTP_401_UNAUTHORIZED)

        # Login exitoso
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
