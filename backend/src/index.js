const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose'); // Agregar mongoose

// Load environment variables
dotenv.config();

// Conectar a MongoDB para las notificaciones
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/punto_de_venta', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  // bufferMaxEntries: 0, <- REMOVER ESTA LÍNEA
  maxPoolSize: 10,
  minPoolSize: 5,
}).then(() => {
  console.log('✅ MongoDB conectado exitosamente para notificaciones');
}).catch(err => {
  console.error('❌ Error al conectar a MongoDB:', err);
});

// Event listeners para MongoDB
mongoose.connection.on('error', (err) => {
  console.error('❌ Error de conexión MongoDB:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB desconectado');
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB reconectado');
});

// Import database and models
const { sequelize } = require('./models');

// Import routes - Organizadas por funcionalidad
// Autenticación y usuarios
const authRoutes = require('./routes/auth.routes');
const clientAuthRoutes = require('./routes/client.auth.routes');
const deliveryAuthRoutes = require('./routes/delivery.auth.routes');

// Gestión de productos e inventario
const productRoutes = require('./routes/product.routes');
const inventoryRoutes = require('./routes/inventory.routes');

// Gestión de clientes y créditos
const clientRoutes = require('./routes/client.routes');
const creditRoutes = require('./routes/credit.routes');

// Ventas y pedidos
const saleRoutes = require('./routes/sale.routes');
const orderRoutes = require('./routes/order.routes');
const guestOrderRoutes = require('./routes/guestOrder.routes');

// Pagos y facturación
const paymentRoutes = require('./routes/payment.routes');
const guestPaymentRoutes = require('./routes/guestPayment.routes');
const electronicInvoiceRoutes = require('./routes/electronicInvoice.routes');

// Compras y proveedores
const purchaseRoutes = require('./routes/purchase.routes');

// Caja y finanzas
const cashRegisterRoutes = require('./routes/cashRegister.routes');

// Entregas y repartidores
const deliveryPersonRoutes = require('./routes/deliveryPerson.routes');
const deliveryFeeRoutes = require('./routes/deliveryFee.routes');
const deliveryOrdersRoutes = require('./routes/delivery.orders.routes');

// Documentos y notificaciones
const documentRoutes = require('./routes/document.routes');
const notificationRoutes = require('./routes/notification.routes');

// Reportes y análisis
const reportRoutes = require('./routes/report.routes');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Crear directorio para documentos si no existe
const path = require('path');
const fs = require('fs-extra');
const documentsDir = path.join(__dirname, '..', 'documents');
fs.ensureDirSync(documentsDir);

// Configurar directorio de documentos como estático
app.use('/documents', express.static(documentsDir));

// Crear servidor HTTP para WebSocket
const server = require('http').createServer(app);

// Inicializar servicio WebSocket
const WebSocketService = require('./services/websocket.service');
const wsService = new WebSocketService(server);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposedHeaders: ['Content-Disposition']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes - Organizadas por funcionalidad
// Autenticación y usuarios
app.use('/api/auth', authRoutes);
app.use('/api/client-auth', clientAuthRoutes);
app.use('/api/delivery-auth', deliveryAuthRoutes);

// Gestión de productos e inventario
app.use('/api/products', productRoutes);
app.use('/api/inventory', inventoryRoutes);

// Gestión de clientes y créditos
app.use('/api/clients', clientRoutes);
app.use('/api/credits', creditRoutes);

// Ventas y pedidos
app.use('/api/sales', saleRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/guest-orders', guestOrderRoutes);

// Pagos y facturación
app.use('/api/payments', paymentRoutes);
app.use('/api/guest-payments', guestPaymentRoutes);
app.use('/api/electronic-invoices', electronicInvoiceRoutes);

// Compras y proveedores
app.use('/api/purchases', purchaseRoutes);

// Caja y finanzas
app.use('/api/cash-register', cashRegisterRoutes);

// Entregas y repartidores
app.use('/api/delivery-persons', deliveryPersonRoutes);
app.use('/api/delivery-fees', deliveryFeeRoutes);
app.use('/api/delivery-orders', deliveryOrdersRoutes);

// Documentos y notificaciones
app.use('/api/documents', documentRoutes);
app.use('/api/notifications', notificationRoutes);

// Reportes y análisis
app.use('/api/reports', reportRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Bienvenido a la API de la Planta de Agua' });
});

// Función para inicializar ambas bases de datos
async function initializeDatabases() {
  try {
    // Sincronizar PostgreSQL
    await sequelize.sync({ alter: true });
    console.log('✅ PostgreSQL: Base de datos sincronizada correctamente');
    
    // Verificar conexión de MongoDB
    if (mongoose.connection.readyState === 1) {
      console.log('✅ MongoDB: Conexión verificada');
    } else {
      console.log('⚠️  MongoDB: Esperando conexión...');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error al inicializar las bases de datos:', error);
    return false;
  }
}

// Inicializar bases de datos y luego iniciar el servidor
initializeDatabases()
  .then((success) => {
    if (success) {
      console.log('🎉 Todas las bases de datos inicializadas correctamente');
    } else {
      console.log('⚠️  Algunas bases de datos tuvieron problemas al inicializar');
    }
    
    // Importar el controlador de notificaciones para establecer el servicio WebSocket
    const notificationController = require('./controllers/notification.controller');

    // Start server with WebSocket support
    server.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en el puerto ${PORT} with WebSocket support`);
      
      // Establecer el servicio WebSocket en el controlador de notificaciones
      notificationController.setWebSocketService(wsService);
    });
  })
  .catch(error => {
    console.error('❌ Error crítico al inicializar:', error);
    process.exit(1);
  });

// Exportar la aplicación
exports.app = app;