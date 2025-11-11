from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from ..serializers import ItinerarioSerializer
from ..models import Itinerario

class CrearItinerarioView(APIView):
    """
        Endpoint para crear el itinerario de manera manual y epecifica.
        """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ItinerarioSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(usuario=request.user)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


class ListarItinerariosView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        itinerarios = Itinerario.objects.filter(usuario=request.user)
        paginator = PageNumberPagination()
        result_page = paginator.paginate_queryset(itinerarios, request)
        serializer = ItinerarioSerializer(result_page, many=True)
        return paginator.get_paginated_response(serializer.data)
