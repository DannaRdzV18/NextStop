from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from ..models import Itinerario, ProveedorAPI, DetalleItinerario
from ...apis_externas.services.amadeus_hotels import buscar_hoteles

class HotelesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        id_itinerario = request.query_params.get("id_itinerario")
        ciudad = request.query_params.get("ciudad")
        fecha_entrada = request.query_params.get("fecha_entrada")
        fecha_salida = request.query_params.get("fecha_salida")

        if not all([id_itinerario, ciudad, fecha_entrada, fecha_salida]):
            return Response({"error": "Faltan parámetros"}, status=400)

        try:
            itinerario = Itinerario.objects.get(id=id_itinerario, usuario=request.user)
        except Itinerario.DoesNotExist:
            return Response({"error": "Itinerario no encontrado"}, status=404)

        hoteles = buscar_hoteles(ciudad, fecha_entrada, fecha_salida)
        proveedor, _ = ProveedorAPI.objects.get_or_create(nombre="Hotels.com API", tipo="HOTEL")

        try:
            hotel_seleccionado = hoteles.get("searchResults", {}).get("results", [])[0]
            precio = hotel_seleccionado.get("ratePlan", {}).get("price", {}).get("current", 0)

            DetalleItinerario.objects.create(
                itinerario=itinerario,
                proveedor=proveedor,
                tipo_item="HOTEL",
                origen=ciudad,
                destinos=hotel_seleccionado.get("name", "Hotel sin nombre"),
                fecha_salida=fecha_entrada,
                fecha_llegada=fecha_salida,
                costo_estimado=precio,
                personas=1,
                presupuesto=precio,
                orden=DetalleItinerario.objects.filter(itinerario=itinerario).count() + 1
            )
        except Exception as e:
            return Response({"error": f"No se pudo guardar el hotel: {str(e)}"}, status=500)

        return Response(hoteles)
