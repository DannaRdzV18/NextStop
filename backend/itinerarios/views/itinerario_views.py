import traceback  # 👈 IMPORTANTE PARA VER EL ERROR
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination

# Validacion manual
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import TokenError

from itinerarios.models import DetalleItinerario, Itinerario
from usuarios.models import Usuario
from ..serializers import ItinerarioSerializer


# itinerarios/views.py

# ... (imports igual que antes) ...

class CrearItinerarioView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        print("🟢 INICIANDO PROCESO DE GUARDADO...")
        try:
            # 1. VALIDACIÓN MANUAL DEL TOKEN (Esto déjalo igual, funciona bien)
            auth_header = request.headers.get("Authorization")
            if not auth_header or not auth_header.startswith("Bearer "):
                return Response({"detail": "Credenciales no proveídas."}, status=401)

            token_str = auth_header.split(" ")[1]
            try:
                token = AccessToken(token_str)
                usuario_id = token['user_id']
            except TokenError as e:
                return Response({"detail": "Token inválido", "error": str(e)}, status=401)

            try:
                usuario = Usuario.objects.get(id=int(usuario_id))
            except Usuario.DoesNotExist:
                return Response({"detail": f"Usuario ID {usuario_id} no existe."}, status=404)

            # ==================================================================
            # 3. GUARDADO SIMPLIFICADO (AQUÍ ESTÁ EL CAMBIO)
            # ==================================================================

            # ❌ ANTES: Sacabas los detalles y los guardabas manualmente.
            # detalles = data.pop("detalles", [])  <-- ESTO CAUSABA EL ERROR

            # ✅ AHORA: Pasamos los datos COMPLETOS al serializer.
            # Él se encargará de leer 'detalles' y guardarlos gracias a tu nuevo método create()

            serializer = ItinerarioSerializer(data=request.data)  # Pasamos request.data directo

            if not serializer.is_valid():
                print("❌ Error de validación:", serializer.errors)
                return Response(serializer.errors, status=400)

            # Guardamos (El serializer ya sabe guardar los detalles adentro)
            itinerario = serializer.save(usuario=usuario)

            print(f"✅ Itinerario creado exitosamente: {itinerario.id}")
            return Response(ItinerarioSerializer(itinerario).data, status=201)

        except Exception as e:
            # ... (tu manejo de errores 500 igual que antes) ...
            import traceback
            traceback.print_exc()
            return Response({"detail": str(e)}, status=500)


class ListarItinerariosView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        try:
            auth_header = request.headers.get("Authorization")
            if not auth_header or not auth_header.startswith("Bearer "):
                return Response({"detail": "No auth header"}, status=401)

            token_str = auth_header.split(" ")[1]
            token = AccessToken(token_str)
            usuario_id = token['user_id']

            if not Usuario.objects.filter(id=usuario_id).exists():
                return Response({"detail": "Usuario no encontrado"}, status=404)

            itinerarios = Itinerario.objects.filter(usuario_id=int(usuario_id))

            paginator = PageNumberPagination()
            result_page = paginator.paginate_queryset(itinerarios, request)
            serializer = ItinerarioSerializer(result_page, many=True)
            return paginator.get_paginated_response(serializer.data)
        except Exception as e:
            return Response({"detail": str(e)}, status=500)