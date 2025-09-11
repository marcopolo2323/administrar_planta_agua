# 🚀 Guía de Despliegue: Vercel + Render + Supabase

## 📋 Resumen del Despliegue

- **Frontend**: Vercel (React + Vite)
- **Backend**: Render (Node.js + Express)
- **Base de Datos**: Supabase (PostgreSQL)

## 🗄️ Paso 1: Configurar Supabase (Base de Datos)

### 1.1 Crear Proyecto en Supabase
1. Ve a [supabase.com](https://supabase.com)
2. Crea una cuenta o inicia sesión
3. Haz clic en "New Project"
4. Elige tu organización
5. Nombre del proyecto: `aquayara-db`
6. Contraseña de la base de datos: `aquayara123456`
7. Región: `South America (São Paulo)`
8. Haz clic en "Create new project"

### 1.2 Configurar Base de Datos
1. Ve al **SQL Editor** en tu proyecto
2. Copia y pega el contenido de `backend/supabase-migration.sql`
3. Haz clic en "Run" para ejecutar la migración
4. Verifica que se hayan creado todas las tablas

### 1.3 Obtener Credenciales
1. Ve a **Settings** > **Database**
2. Copia las siguientes credenciales:
   - **Host**: `db.xxxxxxxxxxxxx.supabase.co`
   - **Database**: `postgres`
   - **User**: `postgres`
   - **Password**: `aquayara123456`
   - **Port**: `5432`

## 🖥️ Paso 2: Desplegar Backend en Render

### 2.1 Preparar Repositorio
1. Sube tu código a GitHub
2. Asegúrate de que el repositorio sea público o conecta tu cuenta de GitHub

### 2.2 Crear Servicio en Render
1. Ve a [render.com](https://render.com)
2. Haz clic en "New +" > "Web Service"
3. Conecta tu repositorio de GitHub
4. Selecciona el repositorio `administrar_planta_agua`
5. Configuración:
   - **Name**: `aquayara-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Free`

### 2.3 Configurar Variables de Entorno
En la sección "Environment Variables", agrega:

```env
NODE_ENV=production
PORT=10000
DB_HOST=db.xxxxxxxxxxxxx.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASS=aquayara123456
JWT_SECRET=tu_jwt_secret_muy_seguro_aqui
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_contraseña_aplicacion
WHATSAPP_ACCESS_TOKEN=tu_token_whatsapp
WHATSAPP_PHONE_NUMBER_ID=tu_phone_number_id
```

### 2.4 Desplegar
1. Haz clic en "Create Web Service"
2. Espera a que se complete el despliegue
3. Anota la URL del servicio: `https://aquayara-backend.onrender.com`

## 🌐 Paso 3: Desplegar Frontend en Vercel

### 3.1 Preparar Frontend
1. Asegúrate de que el frontend esté en la carpeta `frontend/`
2. El archivo `vercel.json` ya está configurado

### 3.2 Crear Proyecto en Vercel
1. Ve a [vercel.com](https://vercel.com)
2. Haz clic en "New Project"
3. Conecta tu repositorio de GitHub
4. Selecciona el repositorio `administrar_planta_agua`
5. Configuración:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 3.3 Configurar Variables de Entorno
En la sección "Environment Variables", agrega:

```env
VITE_API_URL=https://aquayara-backend.onrender.com
```

### 3.4 Desplegar
1. Haz clic en "Deploy"
2. Espera a que se complete el despliegue
3. Anota la URL del frontend: `https://tu-proyecto.vercel.app`

## 🔧 Paso 4: Configuración Final

### 4.1 Actualizar CORS en Backend
En `backend/src/index.js`, asegúrate de que CORS esté configurado:

```javascript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://tu-proyecto.vercel.app'
  ],
  credentials: true
}));
```

### 4.2 Verificar Despliegue
1. **Frontend**: Visita `https://tu-proyecto.vercel.app`
2. **Backend**: Visita `https://aquayara-backend.onrender.com/api/health`
3. **Base de Datos**: Verifica en Supabase que las tablas estén creadas

## 📱 Paso 5: Configurar Dominio Personalizado (Opcional)

### 5.1 En Vercel
1. Ve a tu proyecto en Vercel
2. Ve a **Settings** > **Domains**
3. Agrega tu dominio personalizado
4. Configura los registros DNS según las instrucciones

### 5.2 En Render
1. Ve a tu servicio en Render
2. Ve a **Settings** > **Custom Domains**
3. Agrega tu dominio personalizado
4. Configura los registros DNS según las instrucciones

## 🔒 Paso 6: Configuración de Seguridad

### 6.1 Variables de Entorno Sensibles
- Cambia `JWT_SECRET` por una clave segura
- Configura credenciales reales de email y WhatsApp
- Usa contraseñas seguras para la base de datos

### 6.2 Configuración de Supabase
1. Ve a **Settings** > **API**
2. Configura las políticas de RLS (Row Level Security)
3. Genera una nueva API key si es necesario

## 📊 Paso 7: Monitoreo y Mantenimiento

### 7.1 Logs
- **Render**: Ve a tu servicio > **Logs**
- **Vercel**: Ve a tu proyecto > **Functions** > **Logs**
- **Supabase**: Ve a **Logs** en tu proyecto

### 7.2 Backup
- **Supabase**: Configura backup automático en **Settings** > **Database**
- **Código**: Mantén tu código en GitHub

## 🚨 Solución de Problemas

### Error de Conexión a Base de Datos
1. Verifica que las credenciales de Supabase sean correctas
2. Asegúrate de que la base de datos esté activa
3. Verifica que las tablas se hayan creado correctamente

### Error de CORS
1. Verifica que la URL del frontend esté en la configuración de CORS
2. Asegúrate de que las URLs sean exactas (con/sin www)

### Error de Build
1. Verifica que todas las dependencias estén en `package.json`
2. Asegúrate de que no haya errores de sintaxis
3. Revisa los logs de build en Render/Vercel

## 📞 Soporte

- **Documentación de Supabase**: [supabase.com/docs](https://supabase.com/docs)
- **Documentación de Render**: [render.com/docs](https://render.com/docs)
- **Documentación de Vercel**: [vercel.com/docs](https://vercel.com/docs)

## ✅ Checklist Final

- [ ] Supabase configurado y migración ejecutada
- [ ] Backend desplegado en Render
- [ ] Frontend desplegado en Vercel
- [ ] Variables de entorno configuradas
- [ ] CORS configurado correctamente
- [ ] Pruebas de funcionamiento realizadas
- [ ] Dominio personalizado configurado (opcional)
- [ ] Seguridad configurada

## 🎉 ¡Despliegue Completado!

Tu sistema AquaYara estará disponible en:
- **Frontend**: `https://tu-proyecto.vercel.app`
- **Backend**: `https://aquayara-backend.onrender.com`
- **Base de Datos**: Supabase (acceso desde el dashboard)

**¡Sistema listo para producción!** 🚀
