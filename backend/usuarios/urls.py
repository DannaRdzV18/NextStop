from django.urls import path
from .views import RegistroUsuarioView, VerificarCorreoView, LoginUsuarioView, VerificarLinkView

urlpatterns = [
    path('registrar/', RegistroUsuarioView.as_view(), name='registrar_usuario'),
    path('verificar/', VerificarCorreoView.as_view(), name='verificar_correo'),
    path('verificar-link/<str:token>/', VerificarLinkView.as_view(), name='verificar_link'),
    path('login/', LoginUsuarioView.as_view(), name='login_usuario'),
]