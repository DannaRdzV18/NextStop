import requests

BASE_URL = "http://127.0.0.1:8000/api/usuarios/login/"

data = {
    "email": "maussbrian06@gmail.com",
    "password": "MiPassword123!"
}

try:
    resp = requests.post(BASE_URL, json=data)
    print("Status code:", resp.status_code)
    print("Respuesta:", resp.json())
except Exception as e:
    print("Error al hacer la solicitud:", e)
