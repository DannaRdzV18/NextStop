from .amadeus_client import amadeus_client

def buscar_vuelos(origen, destino, fecha_salida, fecha_regreso=None, adultos=1):
    """
    Buscar vuelos entre origen y destino.
    """
    try:
        params = {
            "originLocationCode": origen,
            "destinationLocationCode": destino,
            "departureDate": fecha_salida,
            "adults": adultos
        }
        if fecha_regreso:
            params["returnDate"] = fecha_regreso

        response = amadeus_client.shopping.flight_offers_search.get(**params)
        return response.data
    except Exception as e:
        print("Error al buscar vuelos:", e)
        return []
