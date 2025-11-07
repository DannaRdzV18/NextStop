from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
import requests
import traceback
from django.conf import settings

class BuscarUbicacionesView(APIView):
    """
    Autocompletado de ubicaciones (ciudades o aeropuertos) usando Amadeus.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        query = request.query_params.get("query", "")
        if len(query) < 2:
            return Response({"error": "Ingresa al menos 2 letras para buscar."}, status=400)

        try:
            # === Token de Amadeus ===
            token = self.obtener_token_amadeus()
            if not token:
                return Response({"error": "No se pudo obtener el token de Amadeus."}, status=500)

            # === Llamada a Amadeus ===
            url = "https://test.api.amadeus.com/v1/reference-data/locations"
            params = {
                "subType": "CITY,AIRPORT",
                "keyword": query,
                "page[limit]": 10
            }
            headers = {"Authorization": f"Bearer {token}"}

            response = requests.get(url, headers=headers, params=params)

            if response.status_code != 200:
                return Response(
                    {"error": f"Error desde Amadeus ({response.status_code})", "detalle": response.text},
                    status=response.status_code
                )

            data = response.json()

            # === Procesar resultados ===
            resultados = []
            for item in data.get("data", []):
                nombre = item.get("name")
                codigo = item.get("iataCode")
                tipo = item.get("subType")
                pais = item.get("address", {}).get("countryName", "")
                ciudad = item.get("address", {}).get("cityName", "")

                if tipo == "CITY":
                    label = f"{nombre}, {pais}"
                else:
                    label = f"{nombre} ({ciudad}, {pais})"

                resultados.append({
                    "nombre": label,
                    "codigo": codigo,
                    "tipo": tipo
                })

            return Response(resultados, status=200)

        except Exception as e:
            traceback.print_exc()
            return Response({"error": f"Ocurrió un error interno: {str(e)}"}, status=500)

    def obtener_token_amadeus(self):
        """
        Obtiene un token temporal de Amadeus para autenticar las peticiones.
        """
        client_id = getattr(settings, "AMADEUS_API_KEY", None)
        client_secret = getattr(settings, "AMADEUS_API_SECRET", None)

        if not client_id or not client_secret:
            print("⚠ Variables de entorno AMADEUS_API_KEY o AMADEUS_API_SECRET no configuradas.")
            return None

        token_url = "https://test.api.amadeus.com/v1/security/oauth2/token"
        payload = {
            "grant_type": "client_credentials",
            "client_id": client_id,
            "client_secret": client_secret
        }

        response = requests.post(token_url, data=payload)

        if response.status_code == 200:
            return response.json().get("access_token")
        else:
            print("❌ Error al obtener token:", response.text)
            return None