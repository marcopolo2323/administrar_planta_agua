# 🚀 Scripts de Base de Datos - Sistema de Agua

## 📋 Descripción

Este directorio contiene scripts para gestionar la base de datos del sistema de agua purificada. Todos los scripts están estandarizados para usar nombres de tabla con mayúscula inicial.

## 🗂️ Scripts Disponibles

### 1. 🧹 `cleanDatabase.js`
**Propósito**: Limpia completamente la base de datos eliminando todas las tablas.

```bash
node src/scripts/cleanDatabase.js
```

**¿Cuándo usarlo?**
- Cuando quieras empezar desde cero
- Antes de ejecutar `initDatabase.js`
- Para resolver problemas de esquema

### 2. 🚀 `initDatabase.js`
**Propósito**: Inicializa completamente la base de datos con tablas y datos de prueba.

```bash
node src/scripts/initDatabase.js
```

**¿Qué hace?**
- ✅ Crea todas las tablas con nombres estandarizados
- ✅ Pobla con datos de prueba (usuarios, productos, clientes, etc.)
- ✅ Configura 50+ distritos de Lima
- ✅ Crea repartidores con usuarios asociados

### 3. 📋 `createTables.js`
**Propósito**: Solo crea las tablas sin datos.

```bash
node src/scripts/createTables.js
```

### 4. 🌱 `seedDb.js` (utils)
**Propósito**: Solo pobla con datos de prueba.

```bash
node src/utils/seedDb.js
```

### 5. 🌍 `seedDistricts.js`
**Propósito**: Solo pobla los distritos.

```bash
node src/scripts/seedDistricts.js
```

## 🏗️ Estructura de Tablas

### Tablas Principales
- **Users** - Usuarios del sistema (admin, vendedor, cliente, repartidor)
- **Products** - Productos (bidones y botellas)
- **Clients** - Clientes frecuentes
- **Districts** - Distritos de entrega

### Tablas de Pedidos
- **Orders** - Pedidos regulares de clientes frecuentes
- **OrderDetails** - Detalles de pedidos regulares
- **GuestOrders** - Pedidos de invitados
- **GuestOrderProducts** - Detalles de pedidos de invitados

### Tablas de Delivery
- **DeliveryFees** - Tarifas de envío
- **DeliveryPersons** - Repartidores

## 🔑 Credenciales de Prueba

Después de ejecutar `initDatabase.js`, tendrás estos usuarios:

| Usuario | Contraseña | Rol | Descripción |
|---------|------------|-----|-------------|
| `admin` | `admin123` | admin | Administrador del sistema |
| `vendedor` | `vendedor123` | vendedor | Vendedor |
| `repartidor` | `repartidor123` | repartidor | Repartidor |
| `cliente1` | `cliente123` | cliente | Cliente frecuente |

## 📦 Productos de Prueba

| Producto | Precio Unitario | Precio Mayoreo | Cantidad Mínima |
|----------|----------------|----------------|-----------------|
| Bidón de Agua 20L | S/7.00 | S/5.00 | 2+ unidades |
| Paquete de Botellas | S/10.00 | S/9.00 | 60+ unidades |

## 🌍 Distritos Configurados

El sistema incluye 50+ distritos de Lima con tarifas de envío configuradas:
- Miraflores, San Isidro, La Molina, Surco, etc.
- Tarifas desde S/3.00 hasta S/10.00

## 🚀 Flujo de Trabajo Recomendado

### Para empezar desde cero:
```bash
# 1. Limpiar base de datos
node src/scripts/cleanDatabase.js

# 2. Inicializar completamente
node src/scripts/initDatabase.js

# 3. Iniciar servidor
npm start
```

### Para solo recrear tablas:
```bash
node src/scripts/createTables.js
```

### Para solo poblar datos:
```bash
node src/utils/seedDb.js
node src/scripts/seedDistricts.js
```

## ⚠️ Notas Importantes

1. **Backup**: Siempre haz backup antes de usar `cleanDatabase.js`
2. **Desarrollo**: Estos scripts están diseñados para desarrollo, no producción
3. **Datos**: Los datos de prueba se recrean cada vez que ejecutas `initDatabase.js`
4. **Nombres**: Todas las tablas usan nombres con mayúscula inicial (ej: `Users`, `Products`)

## 🔧 Solución de Problemas

### Error: "relation does not exist"
```bash
# Solución: Limpiar y recrear
node src/scripts/cleanDatabase.js
node src/scripts/initDatabase.js
```

### Error: "duplicate key value"
```bash
# Solución: Limpiar primero
node src/scripts/cleanDatabase.js
node src/scripts/initDatabase.js
```

### Error: "permission denied"
```bash
# Verificar permisos de PostgreSQL
# Asegúrate de que el usuario tenga permisos de DDL
```

## 📞 Soporte

Si tienes problemas con los scripts, verifica:
1. ✅ Conexión a PostgreSQL
2. ✅ Permisos de base de datos
3. ✅ Variables de entorno configuradas
4. ✅ Dependencias instaladas (`npm install`)

---

**¡Sistema listo para usar!** 🎉
