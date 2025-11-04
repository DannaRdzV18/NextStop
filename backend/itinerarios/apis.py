import requests
from django.conf import settings

def buscar_vuelos(origen, destino, fecha_salida):
    url = "https://test.api.amadeus.com/v1/shopping/flight-offers"
    headers = {"Authorization": f"Bearer {settings.AMADEUS_TOKEN}"}
    params = {"origin": origen, "destination": destino, "departureDate": fecha_salida, "adults": 1}

    try:
        response = requests.get(url, headers=headers, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        if "data" not in data:
            return {"error": "Respuesta sin datos", "raw": data}
        return data
    except requests.exceptions.Timeout:
        return {"error": "Tiempo de espera agotado"}
    except requests.exceptions.HTTPError as e:
        return {"error": f"HTTP error {e.response.status_code}"}
    except requests.exceptions.RequestException as e:
        return {"error": f"Error de red: {str(e)}"}
    except ValueError:
        return {"error": "No se pudo decodificar JSON"}