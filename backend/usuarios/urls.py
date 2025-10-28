from django.urls import path
from backend.usuarios.views import RegistroUsuarioView, VerificarCorreoView, LoginUsuarioView

urlpatterns = [
    path('registrar/', RegistroUsuarioView.as_view(), name='registrar_usuario'),
    path('verificar/', VerificarCorreoView.as_view(), name='verificar_correo'),
    path('login/', LoginUsuarioView.as_view(), name='login_usuario'),
]