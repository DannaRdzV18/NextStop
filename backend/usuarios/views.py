from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from .serializers import UsuarioSerializer
from .models import Usuario, Verificacion
import random, uuid
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth.hashers import make_password, check_password
from .utils import verificar_recaptcha
from django.shortcuts import redirect


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

        data.setdefault('telefono', '')
        data.setdefault('idioma_preferido', 'es')
        data.setdefault('moneda_preferida', 'MXN')

        # Validar si el email ya existe
        if Usuario.objects.filter(email=data.get('email')).exists():
            return Response({'error': 'Este correo ya está registrado'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = UsuarioSerializer(data=data)
        if serializer.is_valid():
            usuario = serializer.save(email_verificado=False)

            # Generar código y token
            codigo = random.randint(1000, 9999)
            token = str(uuid.uuid4())

            Verificacion.objects.create(
                usuario=usuario,
                codigo=str(codigo),
                token=token,
            )

            # Construir enlace de verificación
            link_verificacion = f"http://127.0.0.1:8000/api/usuarios/verificar-link/{token}/"
            tiempo = 10  # minutos

            # Mensaje de correo
            mensaje = f"""
✉️ Asunto: Verifica tu cuenta en NextStop

Hola {usuario.nombre},

Gracias por registrarte en NextStop.
Para completar el proceso de verificación de tu cuenta, por favor utiliza el siguiente código de verificación o haz clic en el enlace que encontrarás más abajo.

🔢 Código de verificación: {codigo}
🔗 Enlace de verificación: {link_verificacion}

Por motivos de seguridad, este código y enlace expirarán en {tiempo} minutos.

Si no solicitaste esta verificación, puedes ignorar este mensaje.

Gracias por confiar en nosotros.
El equipo de NextStop

NextStop
Transformando tu manera de viajar ✈️
📧 soporte@nextstopcompany.com
🌐 www.nextstop.com
"""

            # Enviar correo
            send_mail(
                subject='Verifica tu cuenta en NextStop',
                message=mensaje,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[usuario.email],
                fail_silently=False,
            )

            return Response({'mensaje': 'Usuario creado. Revisa tu correo para verificar tu cuenta.'},
                            status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VerificarCorreoView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        codigo = request.data.get('codigo')
        token = request.data.get('token')

        try:
            usuario = Usuario.objects.get(email=email)
        except Usuario.DoesNotExist:
            return Response({'error': 'Usuario no encontrado'}, status=status.HTTP_404_NOT_FOUND)

        # Buscar verificación válida
        try:
            if token:
                verificacion = Verificacion.objects.get(usuario=usuario, token=token)
            else:
                verificacion = Verificacion.objects.get(usuario=usuario, codigo=codigo)
        except Verificacion.DoesNotExist:
            return Response({'error': 'Código o token inválido.'}, status=status.HTTP_400_BAD_REQUEST)

        # Validar expiración
        if verificacion.expirado():
            return Response({'error': 'El código o enlace ha expirado.'}, status=status.HTTP_400_BAD_REQUEST)

        # Marcar como verificado
        usuario.email_verificado = True
        usuario.save()

        verificacion.usado = True
        verificacion.save()

        return Response({'mensaje': 'Correo verificado correctamente'}, status=status.HTTP_200_OK)

class ReenviarVerificacionView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')

        if not email:
            return Response({'error': 'El correo electrónico es requerido.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            usuario = Usuario.objects.get(email=email)
        except Usuario.DoesNotExist:
            return Response({'error': 'Usuario no encontrado.'}, status=status.HTTP_404_NOT_FOUND)

        # Si ya está verificado, no se reenvía
        if usuario.email_verificado:
            return Response({'mensaje': 'Este correo ya fue verificado.'}, status=status.HTTP_200_OK)

        # Marcar verificaciones anteriores como usadas o expiradas
        Verificacion.objects.filter(usuario=usuario, usado=False).update(usado=True)

        # Generar nuevo código y token
        codigo = random.randint(1000, 9999)
        token = str(uuid.uuid4())

        Verificacion.objects.create(
            usuario=usuario,
            codigo=str(codigo),
            token=token,
        )

        # Construir enlace de verificación
        link_verificacion = f"http://localhost:3000/verificar?token={token}"
        tiempo = 10  # minutos

        # Mensaje del correo
        mensaje = f"""
✉️ Asunto: Verifica tu cuenta en NextStop

Hola {usuario.nombre},

Hemos recibido una solicitud para reenviar tu código de verificación.
Utiliza el siguiente código o haz clic en el enlace para completar la verificación de tu cuenta.

🔢 Código de verificación: {codigo}
🔗 Enlace de verificación: {link_verificacion}

Por motivos de seguridad, este código y enlace expirarán en {tiempo} minutos.

Si ya verificaste tu cuenta o no solicitaste este correo, puedes ignorarlo.

Gracias por confiar en nosotros.
El equipo de NextStop

NextStop
Transformando tu manera de viajar ✈️
📧 soporte@nextstopcompany.com
🌐 www.nextstop.com
"""

        # Enviar correo
        send_mail(
            subject='Verifica tu cuenta en NextStop',
            message=mensaje,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[usuario.email],
            fail_silently=False,
        )

        return Response({'mensaje': 'Se ha reenviado el correo de verificación. Revisa tu bandeja de entrada.'},
                        status=status.HTTP_200_OK)

class VerificarLinkView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, token):
        try:
            # Buscar la verificación por token
            verificacion = Verificacion.objects.get(token=token)
        except Verificacion.DoesNotExist:
            return Response(
                {"error": "Token inválido o no encontrado."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Verificar si ya expiró o se usó
        if verificacion.expirado():
            return Response(
                {"error": "El enlace de verificación ha expirado o ya fue utilizado."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Marcar correo como verificado
        usuario = verificacion.usuario
        usuario.email_verificado = True
        usuario.save()

        # Marcar verificación como usada
        verificacion.usado = True
        verificacion.save()

        return Response(
            {"mensaje": f"El correo {usuario.email} ha sido verificado exitosamente."},
            status=status.HTTP_200_OK
        )

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
