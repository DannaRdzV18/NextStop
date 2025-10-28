from django.urls import path
from backend.itinerarios.views import CrearItinerarioView, ListarItinerariosView, VuelosView, HotelesView

urlpatterns = [
    path('', ListarItinerariosView.as_view(), name='listar_itinerarios'),
    path('crear/', CrearItinerarioView.as_view(), name='crear_itinerario'),
    path('vuelos/', VuelosView.as_view(), name='buscar_vuelos'),
    path('hoteles/', HotelesView.as_view(), name='buscar_hoteles'),
]
