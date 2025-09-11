# 🚀 AquaYara - Sistema de Gestión de Planta de Agua

## 📋 Descripción
Sistema completo de gestión para planta de agua purificada con funcionalidades de ventas, pedidos, clientes frecuentes, suscripciones y reportes.

## 🏗️ Arquitectura
- **Backend**: Node.js + Express + Sequelize + PostgreSQL
- **Frontend**: React + Vite + Chakra UI + Zustand
- **Base de Datos**: PostgreSQL

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 18+
- PostgreSQL 12+
- npm o yarn

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Configurar variables de entorno
npm start
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 🔧 Configuración de Base de Datos

### Inicialización Completa
```bash
cd backend
node src/scripts/initDatabase.js
```

### Scripts Disponibles
- `initDatabase.js` - Inicializa completamente la BD
- `cleanDatabase.js` - Limpia la BD
- `seedDistricts.js` - Pobla distritos
- `seedSubscriptionPlans.js` - Crea planes de suscripción

## 👥 Usuarios del Sistema

| Usuario | Contraseña | Rol | Descripción |
|---------|------------|-----|-------------|
| `admin` | `admin123` | admin | Administrador del sistema |
| `vendedor` | `vendedor123` | vendedor | Vendedor |
| `repartidor` | `repartidor123` | repartidor | Repartidor |
| `cliente1` | `cliente123` | cliente | Cliente frecuente |

## 🎯 Funcionalidades Principales

### 👨‍💼 Panel de Administración
- Gestión de clientes frecuentes
- Gestión de productos
- Gestión de pedidos
- Gestión de repartidores
- Gestión de suscripciones
- Reportes y estadísticas
- Gestión de tarifas de envío

### 🛒 Sistema de Pedidos
- Pedidos de clientes frecuentes
- Pedidos de visitantes
- Sistema de vales
- Pagos mensuales
- Generación de PDFs

### 📊 Sistema de Suscripciones
- Planes de suscripción
- Gestión de bonificaciones
- Control de botellas restantes
- Pagos automáticos

### 📱 Panel de Cliente
- Dashboard personalizado
- Historial de pedidos
- Gestión de pagos
- Suscripciones activas

## 🗂️ Estructura del Proyecto

```
administrar_planta_agua/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Controladores de API
│   │   ├── models/         # Modelos de base de datos
│   │   ├── routes/         # Rutas de API
│   │   ├── middlewares/    # Middlewares de autenticación
│   │   ├── services/       # Servicios (PDF, WebSocket)
│   │   ├── scripts/        # Scripts de migración
│   │   └── utils/          # Utilidades
│   ├── data/              # Datos de migración
│   └── documents/         # PDFs generados
├── frontend/
│   ├── src/
│   │   ├── components/    # Componentes reutilizables
│   │   ├── pages/         # Páginas principales
│   │   ├── stores/        # Estado global (Zustand)
│   │   ├── layouts/       # Layouts de aplicación
│   │   └── services/      # Servicios de API
└── README.md
```

## 🔐 Autenticación y Roles

### Roles del Sistema
- **admin**: Acceso completo al sistema
- **vendedor**: Gestión de ventas y pedidos
- **repartidor**: Gestión de entregas
- **cliente**: Acceso a su panel personal

### Middleware de Autenticación
- JWT tokens
- Verificación de roles
- Protección de rutas

## 📊 Modelos de Base de Datos

### Principales
- **Users**: Usuarios del sistema
- **Clients**: Clientes frecuentes
- **Products**: Productos (bidones, botellas)
- **Orders**: Pedidos regulares
- **GuestOrders**: Pedidos de visitantes
- **Vouchers**: Sistema de vales
- **Subscriptions**: Suscripciones de clientes

### Relaciones
- Cliente → Usuario (1:1)
- Cliente → Pedidos (1:N)
- Cliente → Vales (1:N)
- Cliente → Suscripciones (1:N)
- Pedido → Detalles (1:N)

## 🚀 Despliegue

### Variables de Entorno Requeridas
```env
# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=aquayara_db
DB_USER=tu_usuario
DB_PASS=tu_contraseña

# JWT
JWT_SECRET=tu_secreto_jwt

# Email (opcional)
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_contraseña_aplicacion

# WhatsApp (opcional)
WHATSAPP_ACCESS_TOKEN=tu_token
WHATSAPP_PHONE_NUMBER_ID=tu_phone_id
```

### Producción
1. Configurar variables de entorno
2. Ejecutar migraciones
3. Iniciar servidor backend
4. Construir y desplegar frontend

## 📱 Funcionalidades Móviles
- Diseño responsivo
- PWA ready
- Optimizado para móviles

## 🔧 Scripts de Mantenimiento

### Limpieza de Base de Datos
```bash
node src/scripts/cleanDatabase.js
```

### Migración de Clientes
```bash
node src/scripts/migrateCustomExcelClients.js
```

### Envío de Credenciales
```bash
# Email
node src/scripts/sendEmailMessages.js send

# WhatsApp
node src/scripts/sendWhatsAppMessages.js send
```

## 📞 Soporte
- **Teléfono**: +51 961 606 183
- **Email**: contacto@aquayara.com
- **Horario**: Lunes a Sábado 8:00 AM - 6:00 PM

## 🎉 Estado del Proyecto
✅ **Listo para Producción**
- Sistema completamente funcional
- Código limpio y optimizado
- Documentación completa
- Pruebas realizadas

---

**¡Sistema AquaYara listo para usar!** 🚀