from .amadeus_client import amadeus_client

def buscar_actividades(ciudad, fecha):
    """
    Buscar actividades/tours en la ciudad.
    """
    try:
        response = amadeus_client.shopping.activity_offers.get(
            cityCode=ciudad,
            startDate=fecha
        )
        return response.data
    except Exception as e:
        print("Error al buscar actividades:", e)
        return []
