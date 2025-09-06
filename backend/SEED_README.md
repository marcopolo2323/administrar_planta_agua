# 🌱 Seed de Base de Datos - Sistema de Agua Pura

## 📋 Descripción
Este seed crea una base de datos completa con datos de prueba para el sistema de administración de planta de agua.

## ⚠️ Advertencia
**Este proceso ELIMINARÁ todos los datos existentes** en la base de datos. Úsalo solo en desarrollo o cuando quieras empezar desde cero.

## 🚀 Cómo usar

### Opción 1: Usando npm script (Recomendado)
```bash
cd backend
npm run seed
```

### Opción 2: Ejecutando directamente
```bash
cd backend
node seed.js
```

### Opción 3: Solo la función de seed
```bash
cd backend
npm run seed-db
```

## 📊 Datos que se crean

### 👥 Usuarios (4)
- **Admin**: `admin` / `admin123`
- **Vendedor**: `vendedor` / `vendedor123`
- **Repartidor**: `repartidor` / `repartidor123`
- **Cliente**: `cliente1` / `cliente123`

### 👤 Clientes (4)
- Juan Pérez (Cliente frecuente con usuario)
- María López (Cliente frecuente)
- Distribuidora Agua Pura S.A.C. (Empresa)
- Pedro Ramírez (Cliente frecuente)

### 📦 Productos (5)
- Bidón de Agua 20L (S/ 8.00 / S/ 5.00 mayorista)
- Botella de Agua 500ml (S/ 1.50 / S/ 1.20 mayorista)
- Botella de Agua 1L (S/ 2.50 / S/ 2.00 mayorista)
- Paquete de Botellas 500ml x 12 (S/ 15.00 / S/ 12.00 mayorista)
- Paquete de Botellas 1L x 6 (S/ 12.00 / S/ 10.00 mayorista)

### 🚚 Repartidores (3)
- Carlos Mendoza (Moto)
- Ana Torres (Bicicleta)
- Luis García (Moto)

### 💰 Tarifas de Entrega (6 distritos)
- San Isidro: S/ 3.00
- Miraflores: S/ 3.00
- San Borja: S/ 4.00
- Ate: S/ 5.00
- San Miguel: S/ 4.00
- Lima: S/ 6.00

### 🛒 Pedidos
- **2 pedidos de clientes frecuentes** (1 entregado, 1 pendiente)
- **2 pedidos de invitados** (1 entregado, 1 pendiente)

### 🎫 Vales
- **3 vales** (2 entregados, 1 pendiente)

### 🔔 Notificaciones
- **3 notificaciones** de ejemplo

## 🔧 Características del Seed

### ✅ Datos Coherentes
- Todos los pedidos tienen productos válidos
- Los precios son consistentes
- Las direcciones y distritos coinciden
- Los vales corresponden a pedidos reales

### ✅ Sistema de Vales
- Los clientes frecuentes tienen `hasCredit: true`
- Se generan vales automáticamente para pedidos a crédito
- Las deudas se calculan correctamente

### ✅ Precios Mayoristas
- Bidones: 2+ unidades = S/ 5.00 c/u
- Botellas: 10+ unidades = precio mayorista
- Paquetes: 5+ unidades = precio mayorista

### ✅ Estados Realistas
- Pedidos en diferentes estados (pendiente, entregado)
- Vales con estados apropiados
- Notificaciones variadas

## 🎯 Después del Seed

1. **Inicia el servidor**:
   ```bash
   npm start
   ```

2. **Accede al dashboard**:
   - URL: `http://localhost:5000`
   - Usuario: `admin`
   - Contraseña: `admin123`

3. **Prueba el sistema**:
   - Ve pedidos en el dashboard
   - Prueba crear un nuevo pedido
   - Verifica que los vales se generen correctamente

## 🐛 Solución de Problemas

### Error de conexión a MongoDB
```bash
# Asegúrate de que MongoDB esté ejecutándose
sudo systemctl start mongod
```

### Error de conexión a PostgreSQL
```bash
# Verifica que PostgreSQL esté ejecutándose
sudo systemctl start postgresql
```

### Error de permisos
```bash
# Dale permisos de ejecución al script
chmod +x seed.js
```

## 📝 Notas Importantes

- El seed usa `sequelize.sync({ force: true })` que elimina todas las tablas
- Las notificaciones se almacenan en MongoDB
- Los demás datos se almacenan en PostgreSQL
- Todos los usuarios tienen contraseñas simples para desarrollo
- Los datos son realistas pero ficticios

## 🔄 Reiniciar el Seed

Si necesitas volver a ejecutar el seed:

```bash
# Detén el servidor si está corriendo (Ctrl+C)
npm run seed
npm start
```

¡Listo! Tu base de datos estará limpia y con datos de prueba coherentes.
