from rest_framework import serializers
from usuarios.models import Usuario

class UsuarioSerializer(serializers.ModelSerializer):
    password_hash = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = Usuario
        fields = [
            'id', 'nombre', 'email', 'telefono', 'idioma_preferido',
            'moneda_preferida', 'email_verificado', 'activo', 'password_hash'
        ]
        read_only_fields = ['id', 'email_verificado', 'activo']

    def create(self, validated_data):
        validated_data.setdefault('telefono', '')
        validated_data.setdefault('idioma_preferido', 'es')
        validated_data.setdefault('moneda_preferida', 'MXN')
        return super().create(validated_data)
