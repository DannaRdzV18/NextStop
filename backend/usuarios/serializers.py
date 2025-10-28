from rest_framework import serializers
from backend.usuarios.models import Usuario

class UsuarioSerializer(serializers.ModelSerializer):
    password_hash = serializers.CharField(write_only=True)

    class Meta:
        model = Usuario
        fields = ['id', 'nombre', 'email', 'telefono', 'idioma_preferido', 'moneda_preferida', 'email_verificado', 'activo', 'password_hash']
        read_only_fields = ['id', 'email_verificado', 'activo']
