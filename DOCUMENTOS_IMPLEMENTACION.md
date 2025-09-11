# Implementación de Gestión de Documentos (Boletas y Facturas)

## Resumen
Se ha implementado una funcionalidad completa para que el administrador pueda ver, descargar y gestionar las boletas de los pedidos realizados por clientes frecuentes y visitantes.

## Funcionalidades Implementadas

### Backend

#### 1. Controlador de Documentos (`backend/src/controllers/document.controller.js`)
- **`getAllDocuments`**: Obtiene todas las boletas y facturas generadas con paginación
- **`downloadDocument`**: Permite descargar documentos individuales
- **`generateDocumentForOrder`**: Genera boletas/facturas para pedidos existentes
- **`getDocumentStats`**: Proporciona estadísticas de documentos
- **`deleteDocument`**: Elimina documentos del sistema

#### 2. Rutas de Documentos (`backend/src/routes/document.routes.js`)
- `GET /api/documents` - Listar documentos
- `GET /api/documents/stats` - Estadísticas de documentos
- `GET /api/documents/download/:filename` - Descargar documento
- `POST /api/documents/generate` - Generar nuevo documento
- `DELETE /api/documents/:filename` - Eliminar documento

#### 3. Integración con Sistema Existente
- Las rutas están protegidas con autenticación y autorización de administrador
- Se integra con el sistema de pedidos existente (Orders y GuestOrders)
- Utiliza el servicio de generación de documentos existente

### Frontend

#### 1. Store de Documentos (`frontend/src/stores/documentStore.js`)
- Gestión de estado para documentos
- Funciones para CRUD de documentos
- Utilidades para formateo de fechas y tamaños de archivo

#### 2. Página de Gestión (`frontend/src/pages/Documents.jsx`)
- **Vista de lista**: Tabla con todos los documentos generados
- **Filtros**: Por tipo de documento (boleta/factura) y búsqueda por texto
- **Estadísticas**: Dashboard con métricas de documentos
- **Acciones**: Ver, descargar y eliminar documentos
- **Generación**: Modal para generar documentos de pedidos existentes

#### 3. Integración con Dashboard
- Nueva sección "Documentos" en el dashboard del administrador
- Acceso desde el menú lateral y botón de acción rápida
- Solo visible para usuarios con rol de administrador

## Características Principales

### 1. Visualización de Documentos
- Lista paginada de todas las boletas y facturas
- Información detallada de cada documento:
  - Nombre del archivo
  - ID del pedido asociado
  - Información del cliente
  - Tipo de documento (boleta/factura)
  - Tamaño del archivo
  - Fecha de creación

### 2. Filtros y Búsqueda
- Filtro por tipo de documento
- Búsqueda por ID de pedido, nombre de cliente o nombre de archivo
- Paginación para manejar grandes cantidades de documentos

### 3. Gestión de Documentos
- **Descarga**: Descarga directa de documentos PDF
- **Eliminación**: Eliminación segura con confirmación
- **Generación**: Crear documentos para pedidos existentes que no tengan boleta

### 4. Estadísticas
- Total de documentos generados
- Cantidad de boletas vs facturas
- Tamaño total de archivos
- Documentos generados en los últimos 30 días
- Tamaño promedio por documento

### 5. Información de Pedidos
- Cada documento muestra información del pedido asociado:
  - Datos del cliente (nombre, teléfono, email)
  - Dirección de entrega
  - Total del pedido
  - Estado del pedido
  - Tipo de pedido (cliente frecuente vs invitado)

## Uso del Sistema

### Para Administradores

1. **Acceder a Documentos**:
   - Ir al Dashboard → Documentos
   - O usar el botón de acción rápida "Documentos"

2. **Ver Documentos**:
   - La lista muestra todos los documentos generados
   - Usar filtros para encontrar documentos específicos
   - Hacer clic en "Ver" para detalles completos

3. **Descargar Documentos**:
   - Hacer clic en el icono de descarga
   - El archivo PDF se descargará automáticamente

4. **Generar Documentos**:
   - Hacer clic en "Generar Documento"
   - Ingresar ID del pedido
   - Seleccionar tipo de pedido y documento
   - El sistema generará el PDF automáticamente

5. **Eliminar Documentos**:
   - Hacer clic en el icono de eliminación
   - Confirmar la acción
   - El documento se eliminará permanentemente

## Archivos Modificados

### Backend
- `backend/src/controllers/document.controller.js` (nuevo)
- `backend/src/routes/document.routes.js` (nuevo)
- `backend/src/index.js` (modificado - agregadas rutas)
- `backend/src/services/documentGenerator.service.js` (modificado - exportación)

### Frontend
- `frontend/src/stores/documentStore.js` (nuevo)
- `frontend/src/pages/Documents.jsx` (nuevo)
- `frontend/src/pages/Dashboard.jsx` (modificado - agregada acción rápida)
- `frontend/src/layouts/DashboardLayout.jsx` (modificado - agregado menú)
- `frontend/src/App.jsx` (modificado - agregada ruta)

## Consideraciones Técnicas

### Seguridad
- Todas las rutas requieren autenticación
- Solo administradores pueden acceder a la gestión de documentos
- Validación de tipos de archivo en descargas

### Rendimiento
- Paginación para manejar grandes cantidades de documentos
- Filtros del lado del servidor para optimizar consultas
- Carga asíncrona de datos

### Compatibilidad
- Funciona con el sistema de pedidos existente
- Compatible con clientes frecuentes y visitantes
- Mantiene la estructura de archivos existente

## Próximos Pasos Sugeridos

1. **Notificaciones**: Enviar notificaciones cuando se generen nuevos documentos
2. **Bulk Operations**: Operaciones masivas (descargar múltiples documentos)
3. **Templates**: Plantillas personalizables para boletas y facturas
4. **Backup**: Sistema de respaldo automático de documentos
5. **Auditoría**: Log de acciones realizadas en documentos

## Conclusión

La implementación proporciona una solución completa para la gestión de documentos, permitiendo a los administradores tener control total sobre las boletas y facturas generadas por el sistema. La interfaz es intuitiva y las funcionalidades cubren todas las necesidades básicas de gestión documental.
