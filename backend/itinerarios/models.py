from django.db import models
from usuarios.models import Usuario

class Itinerario(models.Model):
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    nombre = models.CharField(max_length=150)
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField()
    notas = models.TextField(blank=True, null=True)
    creado_en = models.DateTimeField(auto_now_add=True)

class ProveedorAPI(models.Model):
    TIPO_CHOICES = [
        ('TRANSPORTE','Transporte'),
        ('VUELO','Vuelo'),
        ('HOTEL','Hotel'),
    ]
    nombre = models.CharField(max_length=100)
    url_base = models.CharField(max_length=255)
    tipo = models.CharField(max_length=10, choices=TIPO_CHOICES)
    activo = models.BooleanField(default=True)

class DetalleItinerario(models.Model):
    TIPO_ITEM_CHOICES = [
        ('DESTINO','Destino'),
        ('HOTEL','Hotel'),
        ('TRANSPORTE','Transporte'),
    ]
    itinerario = models.ForeignKey(Itinerario, on_delete=models.CASCADE)
    proveedor = models.ForeignKey(ProveedorAPI, on_delete=models.CASCADE)
    tipo_item = models.CharField(max_length=12, choices=TIPO_ITEM_CHOICES)
    api_id = models.CharField(max_length=100, blank=True, null=True)
    nombre_item = models.CharField(max_length=200)
    origen = models.CharField(max_length=255, blank=True, null=True)
    destinos = models.CharField(max_length=255, blank=True, null=True)
    fecha_salida = models.DateTimeField(blank=True, null=True)
    fecha_llegada = models.DateTimeField(blank=True, null=True)
    costo_estimado = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    orden = models.IntegerField(blank=True, null=True)
    personas = models.IntegerField(default=1)
    presupuesto = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
