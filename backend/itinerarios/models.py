from django.db import models
from usuarios.models import Usuario

class Itinerario(models.Model):
    ESTADO_CHOICES = [
        ('borrador', 'Borrador'),
        ('completado', 'Completado'),
        ('cancelado', 'Cancelado'),
    ]

    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    nombre = models.CharField(max_length=150)
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField()
    notas = models.TextField(blank=True, null=True)
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='borrador')
    creado_en = models.DateTimeField(auto_now_add=True)

    def _str_(self):
        return f"{self.nombre} ({self.usuario})"


class ProveedorAPI(models.Model):
    TIPO_CHOICES = [
        ('VUELO', 'Vuelo'),
        ('HOTEL', 'Hotel'),
        ('ACTIVIDAD', 'Actividad'),
    ]

    nombre = models.CharField(max_length=100)
    url_base = models.CharField(max_length=255, blank=True, null=True)  # opcional si no siempre hay URL
    tipo = models.CharField(max_length=15, choices=TIPO_CHOICES)
    activo = models.BooleanField(default=True)

    def _str_(self):
        return f"{self.nombre} - {self.tipo}"

class DetalleItinerario(models.Model):
    TIPO_ITEM_CHOICES = [
        ('DESTINO', 'Destino'),
        ('HOTEL', 'Hotel'),
        ('TRANSPORTE', 'Transporte'),
        ('ACTIVIDAD', 'Actividad'),
    ]

    itinerario = models.ForeignKey('Itinerario', on_delete=models.CASCADE, related_name='detalles')
    proveedor = models.ForeignKey('ProveedorAPI', on_delete=models.SET_NULL, null=True, blank=True)
    tipo_item = models.CharField(max_length=15, choices=TIPO_ITEM_CHOICES)
    api_id = models.CharField(max_length=100, blank=True, null=True)
    nombre_item = models.CharField(max_length=200)
    origen = models.CharField(max_length=255, blank=True, null=True)
    destinos = models.CharField(max_length=255, blank=True, null=True)

    fecha_salida = models.DateTimeField(blank=True, null=True)
    fecha_llegada = models.DateTimeField(blank=True, null=True)
    dias = models.IntegerField(default=1)

    costo_estimado = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    presupuesto = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    personas = models.IntegerField(default=1)
    orden = models.IntegerField(blank=True, null=True)

    seleccionado = models.BooleanField(default=False)

    info_completa = models.JSONField(blank=True, null=True)

    creado_en = models.DateTimeField(auto_now_add=True)

    def _str_(self):
        return f"{self.nombre_item} ({self.tipo_item}) - Itinerario #{self.itinerario_id}"


class Actividad(models.Model):
    detalle_itinerario = models.ForeignKey(
        DetalleItinerario,
        on_delete=models.CASCADE,
        related_name='actividades'
    )
    nombre = models.CharField(max_length=150)
    tipo = models.CharField(max_length=50, blank=True, null=True)
    costo = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    seleccionado = models.BooleanField(default=False)

    def _str_(self):
        return f"{self.nombre} - {self.detalle_itinerario.nombre_item}"