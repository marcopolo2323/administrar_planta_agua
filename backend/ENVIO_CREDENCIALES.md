# 📢 Guía para Enviar Credenciales a Clientes

## 🎯 Resumen
Este sistema te permite enviar las credenciales de acceso a todos tus clientes frecuentes de forma automática y profesional.

## 📊 Estadísticas
- **Total de clientes:** 73
- **Con teléfono:** 73
- **Con email:** 73
- **Con usuario:** 72

## 🚀 Opciones de Envío

### 📱 OPCIÓN 1: WhatsApp Business API (RECOMENDADA)

#### ✅ Ventajas:
- Más personal y directo
- Mayor tasa de lectura
- Fácil de usar
- Los clientes ya lo usan

#### 🔧 Configuración:

1. **Crear cuenta de WhatsApp Business:**
   - Ve a: https://business.whatsapp.com
   - Crea una cuenta de WhatsApp Business
   - Verifica tu número de teléfono

2. **Configurar API de WhatsApp:**
   - Ve a: https://developers.facebook.com
   - Crea una aplicación
   - Configura WhatsApp Business API
   - Obtén tu Access Token
   - Obtén tu Phone Number ID

3. **Configurar variables de entorno:**
   ```bash
   export WHATSAPP_ACCESS_TOKEN="tu_token_aqui"
   export WHATSAPP_PHONE_NUMBER_ID="tu_phone_number_id_aqui"
   ```

#### 📝 Comandos:
```bash
# Mostrar configuración
node src/scripts/sendWhatsAppMessages.js config

# Enviar mensaje de prueba
node src/scripts/sendWhatsAppMessages.js test +51966666666

# Enviar a todos los clientes
node src/scripts/sendWhatsAppMessages.js send
```

### 📧 OPCIÓN 2: Email Marketing

#### ✅ Ventajas:
- Profesional
- Plantilla HTML atractiva
- Seguimiento de emails
- Fácil de configurar

#### 🔧 Configuración:

1. **Configurar Gmail con contraseña de aplicación:**
   - Ve a: https://myaccount.google.com/security
   - Activa la verificación en 2 pasos
   - Genera una contraseña de aplicación
   - Usa esa contraseña en lugar de tu contraseña normal

2. **Configurar variables de entorno:**
   ```bash
   export EMAIL_USER="tu_email@gmail.com"
   export EMAIL_PASS="tu_contraseña_de_aplicacion"
   ```

#### 📝 Comandos:
```bash
# Mostrar configuración
node src/scripts/sendEmailMessages.js config

# Enviar email de prueba
node src/scripts/sendEmailMessages.js test tu_email@gmail.com

# Enviar a todos los clientes
node src/scripts/sendEmailMessages.js send
```

### 🔄 OPCIÓN 3: Ambos Métodos

#### ✅ Ventajas:
- Mayor cobertura de clientes
- Redundancia en caso de fallos
- Diferentes preferencias de clientes

#### 📝 Comando:
```bash
# Enviar por WhatsApp y Email
node src/scripts/sendAllCredentials.js both
```

## 🛠️ Scripts Disponibles

### 📋 Scripts Principales:
- `sendAllCredentials.js` - Script maestro para enviar credenciales
- `sendWhatsAppMessages.js` - Envío por WhatsApp Business API
- `sendEmailMessages.js` - Envío por email
- `communicateCredentials.js` - Generar reportes de credenciales

### 📊 Scripts de Reportes:
- `showCredentialsOptions.js` - Mostrar opciones disponibles
- `migrateCustomExcelClients.js` - Migrar clientes desde Excel

## 📁 Archivos Generados

### 📧 Para Email:
- `data/credenciales_clientes.json` - Datos completos de clientes

### 📱 Para WhatsApp:
- `data/credenciales_whatsapp.json` - Mensajes personalizados
- `data/credenciales_whatsapp.csv` - Archivo CSV para importar

## 🚀 Guía de Uso Rápido

### 1. Configurar WhatsApp Business API:
```bash
# 1. Crear cuenta en business.whatsapp.com
# 2. Configurar API en developers.facebook.com
# 3. Configurar variables de entorno
export WHATSAPP_ACCESS_TOKEN="tu_token"
export WHATSAPP_PHONE_NUMBER_ID="tu_phone_id"

# 4. Probar configuración
node src/scripts/sendWhatsAppMessages.js test +51966666666

# 5. Enviar a todos los clientes
node src/scripts/sendWhatsAppMessages.js send
```

### 2. Configurar Email:
```bash
# 1. Configurar Gmail con contraseña de aplicación
# 2. Configurar variables de entorno
export EMAIL_USER="tu_email@gmail.com"
export EMAIL_PASS="tu_contraseña_de_aplicacion"

# 3. Probar configuración
node src/scripts/sendEmailMessages.js test tu_email@gmail.com

# 4. Enviar a todos los clientes
node src/scripts/sendEmailMessages.js send
```

### 3. Enviar por Ambos Métodos:
```bash
# Configurar ambos servicios y luego:
node src/scripts/sendAllCredentials.js both
```

## 📝 Próximos Pasos

1. **Elegir método de envío** (recomendado: WhatsApp)
2. **Configurar variables de entorno**
3. **Probar con un cliente primero**
4. **Enviar a todos los clientes**
5. **Monitorear resultados**

## 🔧 Solución de Problemas

### Error de WhatsApp:
- Verificar que el token sea válido
- Verificar que el Phone Number ID sea correcto
- Verificar que el número tenga código de país (+51)

### Error de Email:
- Verificar que la contraseña de aplicación sea correcta
- Verificar que la verificación en 2 pasos esté activada
- Verificar que el email sea válido

### Error de Base de Datos:
- Verificar que la base de datos esté funcionando
- Verificar que las credenciales sean correctas
- Verificar que las tablas existan

## 📞 Soporte

- **Teléfono:** +51 961 606 183
- **Email:** contacto@aquayara.com
- **Horario:** Lunes a Sábado 8:00 AM - 6:00 PM

## 🎊 ¡Sistema Listo!

Tu sistema de envío de credenciales está completamente configurado y listo para usar. ¡Solo necesitas configurar las credenciales de los servicios que quieras usar!
