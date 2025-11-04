import requests
from django.conf import settings

# ------------------------------
# VUELOS
# ------------------------------
def buscar_vuelos_amadeus(origen, destino, fecha_salida, fecha_regreso=None, adultos=1):
    """
    Busca vuelos usando Amadeus API
    """
    url = "https://test.api.amadeus.com/v2/shopping/flight-offers"
    headers = {
        "Authorization": f"Bearer {settings.AMADEUS_TOKEN}"
    }
    params = {
        "originLocationCode": origen,
        "destinationLocationCode": destino,
        "departureDate": fecha_salida,
        "adults": adultos,
    }
    if fecha_regreso:
        params["returnDate"] = fecha_regreso

    response = requests.get(url, headers=headers, params=params)
    if response.status_code == 200:
        return response.json()
    return {"error": response.text}

# ------------------------------
# HOTELES
# ------------------------------
def buscar_hoteles(ciudad, checkin, checkout, adultos=1):
    url = "https://hotels-com-provider.p.rapidapi.com/v1/hotels/search"
    headers = {
        "x-rapidapi-key": settings.RAPIDAPI_HOTELS_KEY,
        "x-rapidapi-host": settings.RAPIDAPI_HOTELS_HOST
    }
    params = {
        "q": ciudad,
        "check_in": checkin,
        "check_out": checkout,
        "adults": adultos
    }

    response = requests.get(url, headers=headers, params=params)
    if response.status_code == 200:
        return response.json()  # Aquí tienes los datos de los hoteles
    else:
        return {"error": response.text}


# ------------------------------
# TRANSPORTE TERRESTRE
# ------------------------------

def obtener_ruta_google_maps(origen, destino):
    """
    Usa Google Maps Directions API
    """
    url = "https://maps.googleapis.com/maps/api/directions/json"
    params = {
        "origin": origen,
        "destination": destino,
        "key": settings.GOOGLE_MAPS_API_KEY
    }
    response = requests.get(url, params=params)
    if response.status_code == 200:
        return response.json()
    return {"error": response.text}
