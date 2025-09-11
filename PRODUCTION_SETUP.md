# 🚀 Configuración para Producción - AquaYara

## 📋 Checklist de Despliegue

### ✅ Backend
- [x] Código limpio y optimizado
- [x] Errores de sintaxis corregidos
- [x] Archivos no utilizados eliminados
- [x] Dependencias actualizadas
- [x] Scripts de migración organizados

### ✅ Frontend
- [x] Código limpio y optimizado
- [x] Errores de sintaxis corregidos
- [x] Archivos no utilizados eliminados
- [x] Dependencias actualizadas
- [x] Build optimizado

### ✅ Base de Datos
- [x] Modelos actualizados
- [x] Migraciones listas
- [x] Scripts de inicialización
- [x] Datos de prueba incluidos

## 🔧 Variables de Entorno Requeridas

### Backend (.env)
```env
# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=aquayara_db
DB_USER=tu_usuario
DB_PASS=tu_contraseña

# JWT
JWT_SECRET=tu_secreto_jwt_muy_seguro

# Puerto del servidor
PORT=5000

# Email (opcional)
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_contraseña_aplicacion

# WhatsApp Business API (opcional)
WHATSAPP_ACCESS_TOKEN=tu_token_whatsapp
WHATSAPP_PHONE_NUMBER_ID=tu_phone_number_id

# Entorno
NODE_ENV=production
```

## 🚀 Pasos de Despliegue

### 1. Preparar Servidor
```bash
# Instalar Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PostgreSQL
sudo apt-get install postgresql postgresql-contrib

# Crear base de datos
sudo -u postgres createdb aquayara_db
```

### 2. Desplegar Backend
```bash
# Clonar repositorio
git clone <tu-repositorio>
cd administrar_planta_agua/backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus valores

# Inicializar base de datos
npm run init-database

# Iniciar servidor
npm start
```

### 3. Desplegar Frontend
```bash
cd frontend

# Instalar dependencias
npm install

# Construir para producción
npm run build

# Servir archivos estáticos
# Usar nginx, apache, o cualquier servidor web
```

### 4. Configurar Nginx (Opcional)
```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    # Frontend
    location / {
        root /ruta/a/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔒 Seguridad

### Configuraciones Recomendadas
- [ ] Cambiar contraseñas por defecto
- [ ] Configurar HTTPS
- [ ] Configurar firewall
- [ ] Backup regular de base de datos
- [ ] Monitoreo de logs

### Usuarios por Defecto
| Usuario | Contraseña | Rol |
|---------|------------|-----|
| admin | admin123 | admin |
| vendedor | vendedor123 | vendedor |
| repartidor | repartidor123 | repartidor |
| cliente1 | cliente123 | cliente |

**⚠️ IMPORTANTE**: Cambiar todas las contraseñas en producción

## 📊 Monitoreo

### Logs del Sistema
```bash
# Ver logs del backend
pm2 logs aquayara-backend

# Ver logs de nginx
sudo tail -f /var/log/nginx/error.log
```

### Métricas Importantes
- Uso de CPU y memoria
- Conexiones a base de datos
- Tiempo de respuesta de API
- Errores en logs

## 🔄 Backup y Restauración

### Backup de Base de Datos
```bash
# Crear backup
pg_dump aquayara_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurar backup
psql aquayara_db < backup_20250110_120000.sql
```

### Backup de Archivos
```bash
# Backup de documentos PDF
tar -czf documents_backup_$(date +%Y%m%d).tar.gz documents/

# Backup de configuración
tar -czf config_backup_$(date +%Y%m%d).tar.gz .env package.json
```

## 🚨 Solución de Problemas

### Error de Conexión a Base de Datos
```bash
# Verificar estado de PostgreSQL
sudo systemctl status postgresql

# Verificar conexión
psql -h localhost -U tu_usuario -d aquayara_db
```

### Error de Puerto en Uso
```bash
# Verificar puerto 5000
sudo netstat -tlnp | grep :5000

# Matar proceso si es necesario
sudo kill -9 PID_DEL_PROCESO
```

### Error de Permisos
```bash
# Dar permisos al usuario
sudo chown -R usuario:usuario /ruta/del/proyecto
sudo chmod -R 755 /ruta/del/proyecto
```

## 📞 Soporte

- **Teléfono**: +51 961 606 183
- **Email**: contacto@aquayara.com
- **Horario**: Lunes a Sábado 8:00 AM - 6:00 PM

## ✅ Estado Final

El sistema AquaYara está completamente listo para producción con:
- ✅ Código limpio y optimizado
- ✅ Archivos no utilizados eliminados
- ✅ Dependencias actualizadas
- ✅ Documentación completa
- ✅ Scripts de migración organizados
- ✅ Configuración de seguridad
- ✅ Guía de despliegue

**¡Sistema listo para producción!** 🚀
