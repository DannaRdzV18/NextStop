from .amadeus_client import amadeus_client

def buscar_transfers(ciudad, fecha):
    """
    Buscar transporte terrestre (traslados, taxis, buses) en la ciudad.
    """
    try:
        response = amadeus_client.shopping.transfer_offers.get(
            cityCode=ciudad,
            pickupDate=fecha
        )
        return response.data
    except Exception as e:
        print("Error al buscar transfers:", e)
        return []
