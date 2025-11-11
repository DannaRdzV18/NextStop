from .amadeus_client import amadeus_client

def buscar_actividades(ciudad, fecha):
    """
    Buscar actividades/tours en la ciudad usando latitud y longitud.
    """
    try:
        # 🔹 Primero obtenemos las coordenadas de la ciudad
        location_response = amadeus_client.reference_data.locations.get(
            keyword=ciudad,
            subType='CITY'
        )

        if not location_response.data:
            print(f"⚠ No se encontraron coordenadas para {ciudad}")
            return []

        latitude = location_response.data[0]['geoCode']['latitude']
        longitude = location_response.data[0]['geoCode']['longitude']

        # 🔹 Buscar actividades usando latitud y longitud
        activities_response = amadeus_client.shopping.activities.get(
            latitude=latitude,
            longitude=longitude,
            startDate=fecha,
            radius=10  # radio de búsqueda en km, puedes ajustar
        )

        resultados = []
        for item in activities_response.data[:3]:  # 🔹 Solo los primeros 3 resultados
            resultados.append({
                'name': item.get('name'),
                'type': item.get('type', 'Tour'),
                'duration': item.get('duration', 'N/A'),
                'price': item.get('price', {}).get('total', 'N/A'),
                'currency': item.get('price', {}).get('currency', 'USD')
            })

        return resultados

    except Exception as e:
        print("❌ Error al buscar actividades:", e)
        return []