from .amadeus_client import amadeus_client

def buscar_transfers(pickup_location, pickup_date):
    """
    Buscar transporte terrestre (traslados, taxis, buses) en la ciudad.
    pickup_location: IATA code del aeropuerto o ciudad.
    pickup_date: fecha en formato YYYY-MM-DD
    """
    try:
        # Llamada a Amadeus con parámetros correctos
        response = amadeus_client.shopping.transfer_offers.get(
            pickupLocation=pickup_location,  # IATA code
            pickupDate=pickup_date
        )

        # Limitar a 3 resultados
        resultados = response.data[:3] if response.data else []

        # Dar formato simple a los resultados
        transfers = []
        for item in resultados:
            transfers.append({
                "id": item.get("id"),
                "type": item.get("type"),
                "pickup": item.get("pickup", {}).get("location", {}).get("iataCode", pickup_location),
                "dropoff": item.get("dropoff", {}).get("location", {}).get("iataCode", "N/A"),
                "pickupDateTime": item.get("pickup", {}).get("dateTime", "N/A"),
                "duration": item.get("duration", "N/A"),
                "price": item.get("price", {}).get("total", "N/A"),
                "currency": item.get("price", {}).get("currency", "USD"),
                "provider": item.get("provider", "N/A")
            })

        return transfers

    except Exception as e:
        print("Error al buscar transfers:", e)
        return []