from django.urls import path
from itinerarios.views.vuelos_views import VuelosView
from itinerarios.views.hoteles_views import HotelesView
from itinerarios.views.activities_views import ActivitiesView
from .views.amadeus_locations import BuscarUbicacionesView

urlpatterns = [
    path('vuelos/', VuelosView.as_view(), name='api_vuelos'),
    path('hoteles/', HotelesView.as_view(), name='api_hoteles'),
    path('activities/', ActivitiesView.as_view(), name='api_activities'),
    path("locations/", BuscarUbicacionesView.as_view(), name="buscar_ubicaciones"),
]
