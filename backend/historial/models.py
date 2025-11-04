from django.db import models
from usuarios.models import Usuario

class HistorialBusqueda(models.Model):
    ORIGEN_CHOICES = [
        ('WEB','Web'),
        ('MOBILE','Mobile'),
    ]
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    termino_busqueda = models.CharField(max_length=255)
    fecha_busqueda = models.DateTimeField(auto_now_add=True)
    origen = models.CharField(max_length=6, choices=ORIGEN_CHOICES)
