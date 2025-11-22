from django.urls import path
from .views.itinerario_views import CrearItinerarioView, ListarItinerariosView
from .views.vuelos_views import VuelosView
from .views.hoteles_views import HotelesView
from .views.generar_itinerario_views import GenerarItinerarioView
from .views.activities_views import ActivitiesView
from .views.EliminarItinerario import EliminarItinerarioView

urlpatterns = [
    path('listar/', ListarItinerariosView.as_view(), name='listar_itinerarios'),
    path('crear/', CrearItinerarioView.as_view(), name='crear_itinerario'),
    path('vuelos/', VuelosView.as_view(), name='buscar_vuelos'),
    path('hoteles/', HotelesView.as_view(), name='buscar_hoteles'),
    path('activities/', ActivitiesView.as_view(), name='buscar_actividades'),
    path('generar/', GenerarItinerarioView.as_view(), name='generar_itinerario'),
    path('eliminar/<int:pk>/', EliminarItinerarioView.as_view(), name='eliminar_itinerario'),
]
