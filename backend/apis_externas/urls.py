from django.urls import path
from apis_externas.views import VuelosAPIView, HotelesAPIView

urlpatterns = [
    path("vuelos/", VuelosAPIView.as_view(), name="vuelos_api"),
    path("hoteles/", HotelesAPIView.as_view(), name="hoteles_api"),
]
