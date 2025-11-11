from .amadeus_client import amadeus_client

def buscar_hoteles(ciudad, check_in, check_out, personas=1):
    """
    Buscar hoteles en una ciudad usando Amadeus API.
    Maneja errores de códigos inválidos y no rompe la app.
    """
    try:
        # 🔹 Obtener IDs de hoteles en la ciudad
        hoteles_ciudad = amadeus_client.reference_data.locations.hotels.by_city.get(cityCode=ciudad)
        if not hoteles_ciudad.data:
            print(f"⚠ No se encontraron hoteles para {ciudad}")
            return []

        # 🔹 Tomar solo primeros 5 IDs válidos
        hotel_ids = []
        for h in hoteles_ciudad.data[:5]:
            if 'hotelId' in h:
                hotel_ids.append(h['hotelId'])

        if not hotel_ids:
            print(f"⚠ No hay hotelIds válidos para {ciudad}")
            return []

        # 🔹 Buscar ofertas de esos hoteles
        ofertas = amadeus_client.shopping.hotel_offers_search.get(
            hotelIds=','.join(hotel_ids),
            checkInDate=check_in,
            checkOutDate=check_out,
            adults=personas
        )

        # 🔹 Formatear resultados
        resultados = []
        for item in ofertas.data or []:
            hotel = item.get('hotel', {})
            offer = (item.get('offers') or [{}])[0]
            resultados.append({
                'name': hotel.get('name', 'Sin nombre'),
                'rating': hotel.get('rating', 'N/A'),
                'city': hotel.get('address', {}).get('cityName', ciudad),
                'checkIn': check_in,
                'checkOut': check_out,
                'price': offer.get('price', {}).get('total', 'N/A'),
                'currency': offer.get('price', {}).get('currency', 'USD')
            })

        return resultados

    except Exception as e:
        print("❌ Error al buscar hoteles:", e)
        return []