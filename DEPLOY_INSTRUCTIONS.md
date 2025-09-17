# 🚀 Instrucciones de Deploy - AquaYara

## 📋 Resumen del Sistema

AquaYara es un sistema completo de gestión de planta de agua que incluye:
- **Frontend**: React + Chakra UI (Vercel)
- **Backend**: Node.js + Express + Sequelize (Render)
- **Base de Datos**: PostgreSQL (Supabase)
- **Archivos**: PDFs generados automáticamente

## 🗄️ Base de Datos (Supabase)

### 1. Configuración de Supabase
1. Crear proyecto en [Supabase](https://supabase.com)
2. Obtener las credenciales de conexión:
   - `DATABASE_URL`
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`

### 2. Inicializar la Base de Datos
```bash
# En el directorio backend
npm run deploy-update
```

Este comando:
- ✅ Convierte el Excel de clientes a JSON
- ✅ Sincroniza todos los modelos
- ✅ Importa 79 clientes desde el Excel
- ✅ Crea usuarios básicos
- ✅ Configura productos
- ✅ Establece repartidores

### 3. Datos Importados
- **79 clientes** desde `db_clientes.xlsx`
- **5 usuarios** del sistema
- **2 productos** básicos
- **2 repartidores**
- **Distritos** de Lima

## 🖥️ Backend (Render)

### 1. Configuración en Render
1. Conectar repositorio GitHub
2. Configurar variables de entorno:
   ```env
   NODE_ENV=production
   DATABASE_URL=postgresql://...
   JWT_SECRET=tu_jwt_secret_aqui
   PORT=10000
   ```

### 2. Build Command
```bash
npm install
```

### 3. Start Command
```bash
npm start
```

### 4. Scripts Disponibles
```bash
# Actualizar base de datos con clientes del Excel
npm run deploy-update

# Convertir Excel a JSON
npm run convert-excel

# Seed completo (desarrollo)
npm run seed
```

## 🌐 Frontend (Vercel)

### 1. Configuración en Vercel
1. Conectar repositorio GitHub
2. Configurar variables de entorno:
   ```env
   VITE_API_URL=https://tu-backend.onrender.com
   VITE_APP_NAME=AquaYara
   ```

### 2. Build Settings
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### 3. Deploy Automático
- Push a `main` → Deploy automático
- Push a `develop` → Preview deploy

## 📊 Datos de Clientes

### Archivo Excel: `backend/data/db_clientes.xlsx`
- **79 clientes** importados
- **Datos incluidos**:
  - Nombre completo/Razón social
  - DNI/RUC
  - Teléfono
  - Email
  - Dirección
  - Distrito
  - Recomendaciones
  - Estado (Activo/Nuevo)

### Mapeo de Datos
```javascript
// Ejemplo de mapeo
{
  name: "Corporación YASHIMITSU sac",
  documentType: "RUC",
  documentNumber: "20606719596",
  phone: "942658541",
  email: "yashichirusbel@gmail.com",
  address: "Jr 2 de mayo 1150",
  district: "YARINACOCHA",
  clientStatus: "activo",
  hasCredit: true
}
```

## 🔑 Credenciales de Acceso

### Usuarios del Sistema
- **Admin**: `admin` / `admin123`
- **Vendedor**: `vendedor` / `vendedor123`
- **Repartidor**: `repartidor` / `repartidor123`

### Roles y Permisos
- **Admin**: Acceso completo al sistema
- **Vendedor**: Gestión de pedidos y clientes
- **Repartidor**: Dashboard de entregas y vales

## 🚀 Proceso de Deploy Completo

### 1. Preparar Base de Datos
```bash
# En Supabase, crear proyecto y obtener DATABASE_URL
# Luego en backend:
npm run deploy-update
```

### 2. Deploy Backend
```bash
# En Render:
# 1. Conectar repositorio
# 2. Configurar variables de entorno
# 3. Deploy automático
```

### 3. Deploy Frontend
```bash
# En Vercel:
# 1. Conectar repositorio
# 2. Configurar VITE_API_URL
# 3. Deploy automático
```

## 📱 Características del Sistema

### Dashboard Admin
- ✅ Gestión de clientes (79 importados)
- ✅ Gestión de pedidos
- ✅ Gestión de repartidores
- ✅ Reportes de recaudación
- ✅ Gestión de vales
- ✅ Suscripciones

### Dashboard Repartidor
- ✅ Pedidos asignados
- ✅ Creación de vales
- ✅ Seguimiento de entregas
- ✅ Optimizado para móviles

### Sistema de Pedidos
- ✅ Pedidos de clientes frecuentes
- ✅ Pedidos de invitados
- ✅ Múltiples métodos de pago
- ✅ Generación automática de PDFs
- ✅ Seguimiento de estado

## 🔧 Mantenimiento

### Actualizar Clientes
```bash
# 1. Actualizar Excel en backend/data/db_clientes.xlsx
# 2. Ejecutar:
npm run convert-excel
npm run deploy-update
```

### Backup de Base de Datos
- Supabase maneja backups automáticos
- Exportar datos desde Supabase Dashboard

### Logs y Monitoreo
- **Render**: Logs en dashboard
- **Vercel**: Logs en dashboard
- **Supabase**: Logs en dashboard

## 🆘 Solución de Problemas

### Error de Conexión a BD
```bash
# Verificar DATABASE_URL en Render
# Verificar que Supabase esté activo
```

### Error de Build Frontend
```bash
# Verificar VITE_API_URL
# Verificar que backend esté funcionando
```

### Error de Importación de Clientes
```bash
# Verificar que Excel esté en backend/data/
# Ejecutar: npm run convert-excel
```

## 📞 Soporte

Para problemas técnicos:
1. Verificar logs en Render/Vercel
2. Verificar estado de Supabase
3. Revisar variables de entorno
4. Ejecutar scripts de diagnóstico

---

**✅ Sistema listo para producción con 79 clientes importados desde Excel**