from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Itinerario, ProveedorAPI, DetalleItinerario
from .serializers import ItinerarioSerializer
from .apis import buscar_vuelos

class CrearItinerarioView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        serializer = ItinerarioSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(id_usuario=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ListarItinerariosView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        itinerarios = Itinerario.objects.filter(id_usuario=request.user)
        paginator = PageNumberPagination()
        result_page = paginator.paginate_queryset(itinerarios, request)
        serializer = ItinerarioSerializer(result_page, many=True)
        return paginator.get_paginated_response(serializer.data)

# VUELOS
class VuelosView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Parámetros para búsqueda
        origen = request.query_params.get("origen")
        destino = request.query_params.get("destino")
        fecha_salida = request.query_params.get("fecha_salida")

        if not all([origen, destino, fecha_salida]):
            return Response({"error": "Faltan parámetros"}, status=400)

        # Buscar vuelos
        vuelos = buscar_vuelos(origen, destino, fecha_salida)

        # Retornamos lista completa al frontend para que el usuario elija
        return Response(vuelos)

    def post(self, request):
        # Agregar vuelo seleccionado al itinerario
        id_itinerario = request.data.get("id_itinerario")
        vuelo_seleccionado = request.data.get("vuelo")  # Todo el JSON del vuelo seleccionado

        if not all([id_itinerario, vuelo_seleccionado]):
            return Response({"error": "Faltan parámetros"}, status=400)

        try:
            itinerario = Itinerario.objects.get(id_itinerario=id_itinerario, id_usuario=request.user)
        except Itinerario.DoesNotExist:
            return Response({"error": "Itinerario no encontrado"}, status=404)

        proveedor, _ = ProveedorAPI.objects.get_or_create(nombre="Amadeus API", tipo="vuelos")

        DetalleItinerario.objects.create(
            id_itinerario=itinerario,
            origen=vuelo_seleccionado.get("origin", ""),
            destinos=vuelo_seleccionado.get("destination", ""),
            fecha_salida=vuelo_seleccionado.get("departureDate", ""),
            fecha_llegada=vuelo_seleccionado.get("arrivalDate", ""),
            costo_estimado=vuelo_seleccionado.get("price", {}).get("total", 0),
            personas=1,
            presupuesto=vuelo_seleccionado.get("price", {}).get("total", 0),
            orden=DetalleItinerario.objects.filter(id_itinerario=itinerario).count() + 1
        )

        return Response({"mensaje": "Vuelo agregado al itinerario"})

# HOTELES
class HotelesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Obtener parámetros
        id_itinerario = request.query_params.get("id_itinerario")
        ciudad = request.query_params.get("ciudad")
        fecha_entrada = request.query_params.get("fecha_entrada")
        fecha_salida = request.query_params.get("fecha_salida")

        # Validar parámetros
        if not all([id_itinerario, ciudad, fecha_entrada, fecha_salida]):
            return Response({"error": "Faltan parámetros"}, status=400)

        # Buscar itinerario
        try:
            itinerario = Itinerario.objects.get(id_itinerario=id_itinerario, id_usuario=request.user)
        except Itinerario.DoesNotExist:
            return Response({"error": "Itinerario no encontrado"}, status=404)

        # Llamar a la API externa
        hoteles = buscar_hoteles(ciudad, fecha_entrada, fecha_salida)

        # Guardar proveedor
        proveedor, _ = ProveedorAPI.objects.get_or_create(nombre="Hotels.com API", tipo="hoteles")

        # Guardar primer hotel si existe
        try:
            if "searchResults" in hoteles and "results" in hoteles["searchResults"]:
                hotel_seleccionado = hoteles["searchResults"]["results"][0]
                precio = hotel_seleccionado.get("ratePlan", {}).get("price", {}).get("current", "0")

                DetalleItinerario.objects.create(
                    id_itinerario=itinerario,
                    origen=ciudad,
                    destinos=hotel_seleccionado.get("name", "Hotel sin nombre"),
                    fecha_salida=fecha_entrada,
                    fecha_llegada=fecha_salida,
                    costo_estimado=precio,
                    personas=1,
                    presupuesto=precio,
                    orden=1
                )
        except Exception as e:
            return Response({"error": f"No se pudo guardar el hotel: {str(e)}"}, status=500)

        return Response(hoteles)
