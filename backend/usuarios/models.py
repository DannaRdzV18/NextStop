from django.db import models

class Rol(models.Model):
    nombre = models.CharField(max_length=50)
    descripcion = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return self.nombre


class Usuario(models.Model):
    nombre = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    password_hash = models.CharField(max_length=128)
    telefono = models.CharField(max_length=20)
    idioma_preferido = models.CharField(max_length=10, default='es')
    moneda_preferida = models.CharField(max_length=10, default='MXN')
    email_verificado = models.BooleanField(default=False)
    codigo_verificacion = models.CharField(max_length=6, blank=True, null=True)
    fecha_registro = models.DateTimeField(auto_now_add=True)
    activo = models.BooleanField(default=True)

    def __str__(self):
        return self.nombre

class UsuarioRol(models.Model):
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    rol = models.ForeignKey(Rol, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('usuario', 'rol')

class Sesion(models.Model):
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    ip_origen = models.CharField(max_length=45)
    user_agent = models.CharField(max_length=255)
    fecha_inicio = models.DateTimeField()
    fecha_expiracion = models.DateTimeField(blank=True, null=True)
    activo = models.BooleanField(default=True)
