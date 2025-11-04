from .amadeus_client import amadeus_client

def buscar_hoteles(ciudad, check_in, check_out, adultos=1):
    """
    Buscar hoteles en una ciudad para fechas dadas.
    """
    try:
        response = amadeus_client.shopping.hotel_offers.get(
            cityCode=ciudad,
            checkInDate=check_in,
            checkOutDate=check_out,
            roomQuantity=1,
            adults=adultos
        )
        return response.data
    except Exception as e:
        print("Error al buscar hoteles:", e)
        return []
