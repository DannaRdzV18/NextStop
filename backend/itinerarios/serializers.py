from rest_framework import serializers
from .models import Itinerario, DetalleItinerario

class DetalleItinerarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = DetalleItinerario
        fields = [
            "origen", "destinos", "fecha_salida", "fecha_llegada",
            "costo_estimado", "orden", "personas", "presupuesto"
        ]

    def validate(self, data):
        if data.get('fecha_llegada') and data.get('fecha_salida'):
            if data['fecha_llegada'] < data['fecha_salida']:
                raise serializers.ValidationError("La fecha de llegada no puede ser antes de la salida.")
        if data.get('costo_estimado', 0) < 0 or data.get('presupuesto', 0) < 0:
            raise serializers.ValidationError("Costo estimado y presupuesto no pueden ser negativos.")
        return data


class ItinerarioSerializer(serializers.ModelSerializer):
    detalles = DetalleItinerarioSerializer(many=True)

    class Meta:
        model = Itinerario
        fields = ["id_itinerario", "nombre", "fecha_inicio", "fecha_fin", "notas", "creado_en", "detalles"]

    def validate(self, data):
        if data['fecha_fin'] < data['fecha_inicio']:
            raise serializers.ValidationError("La fecha fin no puede ser anterior a la fecha inicio.")
        return data

    def create(self, validated_data):
        detalles_data = validated_data.pop('detalles')
        itinerario = Itinerario.objects.create(**validated_data)
        for detalle_data in detalles_data:
            DetalleItinerario.objects.create(id_itinerario=itinerario, **detalle_data)
        return itinerario
