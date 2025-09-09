# AquaYara - Sistema de Gestión de Planta de Agua

Sistema completo de gestión para planta de agua con funcionalidades de ventas, pedidos, clientes frecuentes, sistema de vales y reportes.

## 🚀 Despliegue en Producción

### Frontend (Vercel)
- **URL**: https://aquayara.vercel.app
- **Configuración**: `vercel.json` incluido
- **Variables de entorno**:
  - `VITE_API_URL`: URL del backend en Render

### Backend (Render)
- **URL**: https://aquayara-backend.onrender.com
- **Configuración**: `render.yaml` incluido
- **Base de datos**: PostgreSQL (Supabase)

### Base de Datos (Supabase)
- **Tipo**: PostgreSQL
- **Configuración**: Variables de entorno en Render

## 🛠️ Instalación Local

### Prerrequisitos
- Node.js 18+
- PostgreSQL
- npm o yarn

### Backend
```bash
cd backend
npm install
npm run seed-db  # Poblar base de datos
npm run dev      # Desarrollo
npm start        # Producción
```

### Frontend
```bash
cd frontend
npm install
npm run dev      # Desarrollo
npm run build    # Producción
```

## 📱 Funcionalidades

### Para Administradores
- ✅ Dashboard administrativo responsive
- ✅ Gestión de productos e inventario
- ✅ Gestión de clientes frecuentes
- ✅ Gestión de pedidos y entregas
- ✅ Sistema de vales y crédito
- ✅ Monitoreo de pagos de clientes
- ✅ Reportes y análisis detallados
- ✅ Gestión de repartidores
- ✅ Tarifas de envío por distrito

### Para Clientes Frecuentes
- ✅ Dashboard de cliente
- ✅ Realizar pedidos con crédito
- ✅ Ver historial de pedidos
- ✅ Gestionar vales pendientes
- ✅ Pagos obligatorios a fin de mes

### Para Repartidores
- ✅ Dashboard de repartidor
- ✅ Ver pedidos asignados
- ✅ Actualizar estado de entregas
- ✅ Cobrar vales en efectivo
- ✅ Ver estadísticas de entregas

## 🎨 Branding
- **Logo**: AquaYara integrado en todo el sistema
- **Colores**: Azul (#3182ce) y Teal (#38b2ac)
- **Tagline**: "Agua que encanta"

## 📞 Soporte
- **WhatsApp**: +51 961 606 183
- **Email**: admin@aquayara.com

## 🔧 Tecnologías

### Frontend
- React 18
- Chakra UI
- Zustand (Estado)
- React Router DOM
- Axios

### Backend
- Node.js
- Express.js
- Sequelize (ORM)
- PostgreSQL
- JWT (Autenticación)

## 📄 Licencia
MIT License - AquaYara Team
