import requests

BASE_URL = "http://127.0.0.1:8000/api/usuarios/verificar/"

# Datos para verificación
data = {
    "email": "maussbrian06@gmail.com",  # el mismo email usado al registrar
    "codigo": "6533"  # el código que recibiste en tu correo
}

try:
    resp = requests.post(BASE_URL, json=data)
    print("Status code:", resp.status_code)
    print("Respuesta:", resp.json())
except Exception as e:
    print("Error al hacer la solicitud:", e)
