from django.db import models
from usuarios.models import Usuario

class LogSistema(models.Model):
    TIPO_EVENTO_CHOICES = [
        ('INFO', 'Info'),
        ('WARNING', 'Warning'),
        ('ERROR', 'Error'),
    ]

    usuario = models.ForeignKey(Usuario, on_delete=models.SET_NULL, null=True, blank=True)
    tipo_evento = models.CharField(max_length=7, choices=TIPO_EVENTO_CHOICES)
    descripcion = models.TextField()
    fecha_evento = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.tipo_evento} - {self.descripcion[:50]}"
