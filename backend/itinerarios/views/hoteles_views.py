from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from ..models import Itinerario, ProveedorAPI, DetalleItinerario
from apis_externas.services.amadeus_hotels import buscar_hoteles


class HotelesView(APIView):
    """
    Buscar hoteles en una ciudad (GET)
    o guardar un hotel en un itinerario (POST)
    """
    permission_classes = [AllowAny]

    # 🔹 GET: solo buscar hoteles, no requiere itinerario
    def get(self, request):
        ciudad = request.query_params.get("ciudad")
        fecha_entrada = request.query_params.get("fecha_entrada")
        fecha_salida = request.query_params.get("fecha_salida")
        personas = request.query_params.get("personas", 1)

        if not all([ciudad, fecha_entrada, fecha_salida]):
            return Response({"error": "Faltan parámetros"}, status=400)

        try:
            hoteles = buscar_hoteles(ciudad, fecha_entrada, fecha_salida, personas)
            if hoteles is None:
                hoteles = []
            return Response(hoteles)
        except Exception as e:
            return Response({"error": f"Error al buscar hoteles: {str(e)}"}, status=500)

    # 🔹 POST: guardar un hotel seleccionado en un itinerario
    def post(self, request):
        id_itinerario = request.data.get("id_itinerario")
        hotel = request.data.get("hotel")

        if not all([id_itinerario, hotel]):
            return Response({"error": "Faltan parámetros"}, status=400)

        try:
            itinerario = Itinerario.objects.get(id=id_itinerario)
        except Itinerario.DoesNotExist:
            return Response({"error": "Itinerario no encontrado"}, status=404)

        proveedor, _ = ProveedorAPI.objects.get_or_create(nombre="Hotels.com API", tipo="HOTEL")

        try:
            DetalleItinerario.objects.create(
                itinerario=itinerario,
                proveedor=proveedor,
                tipo_item="HOTEL",
                origen=hotel.get("cityCode", ""),
                destinos=hotel.get("hotel", {}).get("name", "Hotel sin nombre"),
                fecha_salida=hotel.get("checkInDate", ""),
                fecha_llegada=hotel.get("checkOutDate", ""),
                costo_estimado=hotel.get("price", {}).get("total", 0),
                personas=hotel.get("adults", 1),
                presupuesto=hotel.get("price", {}).get("total", 0),
                orden=DetalleItinerario.objects.filter(itinerario=itinerario).count() + 1
            )
        except Exception as e:
            return Response({"error": f"No se pudo guardar el hotel: {str(e)}"}, status=500)

        return Response({"mensaje": "Hotel agregado al itinerario"})