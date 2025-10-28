from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from apis_externas.services import buscar_vuelos_amadeus, buscar_hoteles, obtener_ruta_google_maps

class VuelosAPIView(APIView):
    def get(self, request):
        origen = request.query_params.get("origen")
        destino = request.query_params.get("destino")
        fecha_salida = request.query_params.get("fecha_salida")
        fecha_regreso = request.query_params.get("fecha_regreso")
        pasajeros = int(request.query_params.get("pasajeros", 1))

        resultados = buscar_vuelos_amadeus(origen, destino, fecha_salida, fecha_regreso, pasajeros)
        if resultados:
            return Response(resultados, status=status.HTTP_200_OK)
        return Response({"error": "No se encontraron vuelos"}, status=status.HTTP_404_NOT_FOUND)


class HotelesAPIView(APIView):
    def get(self, request):
        ciudad = request.query_params.get("ciudad")
        checkin = request.query_params.get("checkin")
        checkout = request.query_params.get("checkout")
        adultos = int(request.query_params.get("adultos", 1))

        resultados = buscar_hoteles(ciudad, checkin, checkout, adultos)
        if resultados:
            return Response(resultados, status=status.HTTP_200_OK)
        return Response({"error": "No se encontraron hoteles"}, status=status.HTTP_404_NOT_FOUND)


class TransporteAPIView(APIView):
    def get(self, request):
        origen = request.query_params.get("origen")
        destino = request.query_params.get("destino")

        resultados = obtener_ruta_google_maps(origen, destino)
        if resultados:
            return Response(resultados, status=status.HTTP_200_OK)
        return Response({"error": "No se pudo obtener la ruta"}, status=status.HTTP_404_NOT_FOUND)
