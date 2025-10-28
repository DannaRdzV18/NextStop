# NextStop - Travel Planner 🛫

Plataforma web para planificación de viajes con múltiples destinos, recomendaciones de hoteles y transporte.

## 🚀 Tecnologías

**Frontend:**
- React 18
- CSS3
- React Icons
- React DatePicker

**Backend:**
- Django 5.2
- Django REST Framework
- MySQL
- PyMySQL

## 📋 Prerequisitos

Antes de empezar, asegúrate de tener instalado:

- [Python 3.10+](https://www.python.org/downloads/)
- [Node.js 16+](https://nodejs.org/)
- [MySQL](https://www.mysql.com/downloads/)
- [Git](https://git-scm.com/downloads/)

## 🔧 Instalación

### 1. Clonar el repositorio
```bash
git clone https://github.com/DannaRdzV18/NextStop.git
cd NextStop
```

### 2. Cambiar a la rama de desarrollo
```bash
git checkout dev
```

### 3. Configurar el Backend
```bash
# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
# En Windows:
venv\Scripts\activate
# En Mac/Linux:
source venv/bin/activate

# Instalar dependencias
cd backend
pip install -r requirements.txt
```

### 4. Configurar la Base de Datos

1. Crea una base de datos MySQL llamada `nextstop_db`
2. Edita `backend/config/settings.py` y actualiza las credenciales:
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'nextstop_db',
        'USER': 'tu_usuario',      # Cambiar
        'PASSWORD': 'tu_password',  # Cambiar
        'HOST': 'localhost',
        'PORT': '3306',
    }
}
```

3. Ejecuta las migraciones:
```bash
python manage.py migrate
```

### 5. Configurar el Frontend

Abre **otra terminal** (dejando la del backend activa):
```bash
cd frontend
npm install
```

## ▶️ Ejecutar el Proyecto

### Backend (Terminal 1)
```bash
cd backend
python manage.py runserver
```

El backend estará disponible en: `http://localhost:8000`

### Frontend (Terminal 2)
```bash
cd frontend
npm start
```

El frontend se abrirá automáticamente en: `http://localhost:3000`

## 📁 Estructura del Proyecto
```
NextStop/
├── backend/
│   ├── apps/
│   │   └── core/
│   │       ├── models/         # Modelos (Entidades)
│   │       ├── repositories/   # Capa de Persistencia
│   │       ├── services/       # Lógica de negocio
│   │       ├── controllers/    # APIs/Controladores
│   │       └── serializers/    # DTOs
│   ├── config/                 # Configuración Django
│   └── manage.py
├── frontend/
│   └── src/
│       ├── components/         # Componentes React
│       ├── pages/             # Páginas
│       ├── services/          # Llamadas a API
│       └── assets/            # Imágenes, estilos
└── README.md
```

## 🎨 Características Implementadas

- ✅ Navbar con logo y menú
- ✅ Sistema de autenticación (Login/Registro)
- ✅ Verificación de email con código
- ✅ Formulario de planificación de viajes
- ✅ Selector de fechas con calendario
- ✅ Selector de personas (adultos, niños, mayores)
- ✅ Cards de destinos inspiracionales
- ✅ Diseño responsive

## 🚧 En Desarrollo

- [ ] Sistema de agregar múltiples destinos
- [ ] Integración con Google Maps API
- [ ] Recomendaciones de hoteles
- [ ] Opciones de transporte
- [ ] Generación de itinerario final
- [ ] Exportar itinerario a PDF

## 👥 Equipo

- **Frontend:** [Tu nombre]
- **Backend:** [Nombres de tus compañeros]

## 📝 Notas

- La rama `main` contiene el código estable
- La rama `dev` contiene el desarrollo activo
- Hacer push a `dev` para nuevas funcionalidades

## 🐛 Solución de Problemas

### Error: "MySQL not found"
Instala MySQL y asegúrate de que el servicio esté corriendo.

### Error: "npm not found"
Instala Node.js desde nodejs.org

### Error: "python not found"
Instala Python y agrégalo al PATH del sistema.

### El frontend no se conecta al backend
Verifica que ambos servidores estén corriendo y que CORS esté configurado correctamente.

## 📄 Licencia

Este proyecto es privado y solo para uso académico.