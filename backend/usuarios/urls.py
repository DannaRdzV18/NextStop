from django.urls import path
from .Views.registro_view import RegistroUsuarioView
from .Views.verificar_view import VerificarCorreoView, VerificarLinkView, ReenviarVerificacionView
from .Views.login_view import LoginUsuarioView
from rest_framework_simplejwt.views import TokenRefreshView
from .Views.validar_token_view import ValidarTokenView
from .Views.editar_perfil import EditarPerfilView

urlpatterns = [
    path('registrar/', RegistroUsuarioView.as_view(), name='registrar_usuario'),
    path('verificar/', VerificarCorreoView.as_view(), name='verificar_correo'),
    path('verificar-link/<str:token>/', VerificarLinkView.as_view(), name='verificar_link'),
    path('reenviar-codigo/', ReenviarVerificacionView.as_view(), name='reenviar_codigo'),
    path('login/', LoginUsuarioView.as_view(), name='login_usuario'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path("validar-token/", ValidarTokenView.as_view(), name="validar_token"),
    path('editar/', EditarPerfilView.as_view(), name='editar_perfil'),
]
