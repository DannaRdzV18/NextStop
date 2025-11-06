from logs.models import LogSistema  # ajusta la ruta si tu app se llama distinto

def registrar_log(usuario=None, tipo="INFO", descripcion=""):
    """
    Registra eventos en la tabla LogSistema.
    """
    try:
        LogSistema.objects.create(
            usuario=usuario if usuario and usuario.is_authenticated else None,
            tipo_evento=tipo,
            descripcion=descripcion
        )
    except Exception as e:
        # Evita que un fallo en el log rompa el flujo del sistema
        print(f"⚠ Error al registrar log: {e}")