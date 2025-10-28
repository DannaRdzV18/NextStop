import requests

BASE_URL = "http://127.0.0.1:8000/api/usuarios/registrar/"

# Datos del usuario a registrar
data = {
    "nombre": "Brian Mauss",
    "email": "maussbrian06@gmail.com",
    "password": "MiPassword123!",
    "telefono": "2294163258",
    "idioma_preferido": "es",
    "moneda_preferida": "MXN",
    "recaptcha_token": "fake-token"  # Para pruebas
}

try:
    resp = requests.post(BASE_URL, json=data)
    print("Status code:", resp.status_code)
    print("Respuesta:", resp.json())
except Exception as e:
    print("Error al hacer la solicitud:", e)
