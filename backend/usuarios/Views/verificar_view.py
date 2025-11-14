from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from ..models import Usuario, Verificacion
import random, uuid
from django.core.mail import send_mail
from django.conf import settings
from django.shortcuts import redirect

class VerificarCorreoView(APIView):
    """
        Endpoint para verificar el correo del usuario mediante código o token.
        """
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

        if usuario.email_verificado:
            return Response({'mensaje': 'Este correo ya fue verificado.'}, status=status.HTTP_200_OK)

        Verificacion.objects.filter(usuario=usuario, usado=False).update(usado=True)

        codigo = random.randint(1000, 9999)
        token = str(uuid.uuid4())

        Verificacion.objects.create(
            usuario=usuario,
            codigo=str(codigo),
            token=token,
        )

        link_verificacion = f'https://nextstop-app-u9cvd.ondigitalocean.app/api/usuarios/verificar-link/{token}/'
        tiempo = 1

        mensaje = f"""
✉️ Asunto: Verifica tu cuenta en NextStop

Hola {usuario.nombre},

Hemos recibido una solicitud para reenviar tu código de verificación.
Utiliza el siguiente código o haz clic en el enlace para completar la verificación de tu cuenta.

🔢 Código de verificación: {codigo}
🔗 Enlace de verificación: {link_verificacion}

Por motivos de seguridad, este código y enlace expirarán en {tiempo} minuto.
"""

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
            verificacion = Verificacion.objects.get(token=token)
        except Verificacion.DoesNotExist:
            # Redirige al frontend con estado "expirado"
            return redirect("http://localhost:3000/?estado=expirado&mensaje=Token%20inválido%20o%20no%20encontrado")

        usuario = verificacion.usuario

        # Si el correo ya estaba verificado
        if usuario.email_verificado:
            return redirect(f"http://localhost:3000/?estado=exito&mensaje=El%20correo%20{usuario.email}%20ya%20estaba%20verificado")

        # Si está expirado
        if verificacion.expirado():
            verificacion.usado = True
            verificacion.save()
            return redirect("http://localhost:3000/?estado=expirado&mensaje=El%20enlace%20ha%20expirado%20o%20ya%20fue%20usado")

        # Si es válido, marcar como verificado
        usuario.email_verificado = True
        usuario.save()
        verificacion.usado = True
        verificacion.save()

        return redirect(f"http://localhost:3000/?estado=exito&mensaje=El%20correo%20{usuario.email}%20ha%20sido%20verificado%20exitosamente")