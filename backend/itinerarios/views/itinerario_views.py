from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from itinerarios.models import DetalleItinerario
from usuarios.models import Usuario
from ..serializers import ItinerarioSerializer
from ..models import Itinerario

class CrearItinerarioView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        usuario = request.user

        data = request.data
        destinos = data.pop("destinos", [])

        # Crear el itinerario
        serializer = ItinerarioSerializer(data=data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        itinerario = serializer.save(usuario=usuario)

        # Crear detalles
        for index, destino in enumerate(destinos):
            DetalleItinerario.objects.create(
                itinerario=itinerario,
                tipo_item="DESTINO",
                nombre_item=destino.get("nombre", "Destino"),
                dias=destino.get("dias", 1),
                info_completa=destino,
                orden=index + 1,
            )

        return Response(ItinerarioSerializer(itinerario).data, status=201)

class ListarItinerariosView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        itinerarios = Itinerario.objects.filter(usuario=request.user)
        paginator = PageNumberPagination()
        result_page = paginator.paginate_queryset(itinerarios, request)
        serializer = ItinerarioSerializer(result_page, many=True)
        return paginator.get_paginated_response(serializer.data)
