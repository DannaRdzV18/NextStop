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


class CrearItinerarioView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        print("🟢 INICIANDO PROCESO DE GUARDADO...")
        try:
            # ==================================================================
            # 1. VALIDACIÓN MANUAL DEL TOKEN
            # ==================================================================
            auth_header = request.headers.get("Authorization")
            if not auth_header or not auth_header.startswith("Bearer "):
                return Response({"detail": "Credenciales no proveídas."}, status=401)

            token_str = auth_header.split(" ")[1]
            try:
                token = AccessToken(token_str)
                usuario_id = token['user_id']
            except TokenError as e:
                return Response({"detail": "Token inválido", "error": str(e)}, status=401)

            # ==================================================================
            # 2. BÚSQUEDA DEL USUARIO
            # ==================================================================
            try:
                usuario = Usuario.objects.get(id=int(usuario_id))
                print(f"✅ Usuario encontrado: {usuario.email}")
            except Usuario.DoesNotExist:
                return Response({"detail": f"Usuario ID {usuario_id} no existe."}, status=404)

            # ==================================================================
            # 3. GUARDADO DEL ITINERARIO (CON PROTECCIÓN)
            # ==================================================================
            # Usamos .copy() para evitar errores si request.data es inmutable
            data = request.data.copy() if hasattr(request.data, 'copy') else request.data
            detalles = data.pop("detalles", [])

            print("📦 Datos recibidos para itinerario:", data)

            serializer = ItinerarioSerializer(data=data)
            if not serializer.is_valid():
                print("❌ Error de validación en Serializer:", serializer.errors)
                return Response(serializer.errors, status=400)

            # Guardamos
            itinerario = serializer.save(usuario=usuario)
            print(f"✅ Itinerario creado con ID: {itinerario.id}")

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

            print("🎉 Todo guardado correctamente")
            return Response(ItinerarioSerializer(itinerario).data, status=201)

        except Exception as e:
            # 🚨 AQUÍ CAPTURAMOS EL ERROR 500 Y LO MOSTRAMOS
            print("🔴 ERROR CRÍTICO EN EL SERVIDOR:")
            traceback.print_exc()  # Imprime la línea exacta en la consola del server
            return Response({
                "detail": "Ocurrió un error interno en el servidor.",
                "error_real": str(e),  # Esto nos dirá qué pasó
                "tipo_error": str(type(e))
            }, status=500)


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