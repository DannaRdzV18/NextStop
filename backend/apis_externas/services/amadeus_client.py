from amadeus import Client
from django.conf import settings

amadeus_client = Client(
    client_id=settings.AMADEUS_API_KEY,
    client_secret=settings.AMADEUS_API_SECRET
)
