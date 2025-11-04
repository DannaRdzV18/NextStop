from django.db import models
from usuarios.models import Usuario

class Favorito(models.Model):
    TIPO_RECURSO_CHOICES = [
        ('DESTINO','Destino'),
        ('HOTEL','Hotel'),
        ('ITINERARIO','Itinerario'),
        ('TRANSPORTE','Transporte'),
    ]
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    tipo_recurso = models.CharField(max_length=12, choices=TIPO_RECURSO_CHOICES)
    id_recurso_local = models.IntegerField(blank=True, null=True)
    api_id = models.CharField(max_length=100, blank=True, null=True)
    fecha_marcado = models.DateTimeField(auto_now_add=True)
