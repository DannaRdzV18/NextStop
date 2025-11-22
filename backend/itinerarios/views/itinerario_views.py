from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
# ❌ COMENTAMOS ESTO PARA QUE NO BLOQUEE LA ENTRADA
# from rest_framework.permissions import IsAuthenticated
# from rest_framework_simplejwt.authentication import JWTAuthentication
# ✅ IMPORTACIONES NECESARIAS PARA VALIDACIÓN MANUAL
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import TokenError

from itinerarios.models import DetalleItinerario, Itinerario
from usuarios.models import Usuario
from ..serializers import ItinerarioSerializer


class CrearItinerarioView(APIView):
    # 🔓 Desactivamos la auth automática para evitar el error 401 "User not found"
    # porque Django busca en la tabla incorrecta (auth_user).
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        # ==================================================================
        # 1. VALIDACIÓN MANUAL DEL TOKEN
        # ==================================================================
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return Response({"detail": "Credenciales de autenticación no proveídas."}, status=401)

        token_str = auth_header.split(" ")[1]

        try:
            # Verificamos que el token sea válido y no haya expirado
            token = AccessToken(token_str)
            usuario_id = token['user_id']
        except TokenError as e:
            return Response({"detail": "Token inválido o expirado", "error": str(e)}, status=401)
        except Exception as e:
            return Response({"detail": "Error al procesar el token"}, status=401)

        # ==================================================================
        # 2. BÚSQUEDA EN TU TABLA DE USUARIOS
        # ==================================================================
        try:
            # Buscamos explícitamente en tu modelo 'Usuario' (usuarios_usuario)
            usuario = Usuario.objects.get(id=int(usuario_id))
        except Usuario.DoesNotExist:
            return Response(
                {"detail": f"El usuario con ID {usuario_id} no existe en la base de datos personalizada."},
                status=404
            )

        # ==================================================================
        # 3. LÓGICA DE CREACIÓN DEL ITINERARIO (Tu código original)
        # ==================================================================
        data = request.data
        detalles = data.pop("detalles", [])

        serializer = ItinerarioSerializer(data=data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        # Guardamos asociando el usuario recuperado manualmente
        itinerario = serializer.save(usuario=usuario)

        # --- Detalles ---
        for index, destino in enumerate(detalles):
            DetalleItinerario.objects.create(
                itinerario=itinerario,
                tipo_item="DESTINO",
                nombre_item=destino.get("destinos") or destino.get("nombre", "Destino"),
                dias=destino.get("dias", 1),
                info_completa=destino,
                orden=index + 1,
                origen=destino.get("origen", ""),
                destinos=destino.get("destinos", ""),
                costo_estimado=destino.get("costo_estimado", 0),
                presupuesto=destino.get("presupuesto", 0),
                personas=destino.get("personas", 1),
            )

        return Response(ItinerarioSerializer(itinerario).data, status=201)


class ListarItinerariosView(APIView):
    # 🔓 También desactivamos aquí para que puedas ver los itinerarios
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        # ==================================================================
        # VALIDACIÓN MANUAL (Igual que arriba)
        # ==================================================================
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return Response({"detail": "Credenciales de autenticación no proveídas."}, status=401)

        try:
            token_str = auth_header.split(" ")[1]
            token = AccessToken(token_str)
            usuario_id = token['user_id']
        except TokenError:
            return Response({"detail": "Token inválido o expirado"}, status=401)

        # Validamos que el usuario exista en tu DB antes de buscar sus itinerarios
        if not Usuario.objects.filter(id=usuario_id).exists():
             return Response({"detail": "Usuario no encontrado"}, status=404)

        # ==================================================================
        # LÓGICA ORIGINAL DE LISTADO
        # ==================================================================
        itinerarios = Itinerario.objects.filter(usuario_id=int(usuario_id))

        paginator = PageNumberPagination()
        result_page = paginator.paginate_queryset(itinerarios, request)
        serializer = ItinerarioSerializer(result_page, many=True)
        return paginator.get_paginated_response(serializer.data)