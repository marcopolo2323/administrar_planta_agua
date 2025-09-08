const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { sequelize } = require('./models');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposedHeaders: ['Content-Disposition']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conectar a MongoDB para las notificaciones (opcional)
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 10000,
    maxPoolSize: 10,
    minPoolSize: 5,
  }).then(() => {
    console.log('✅ MongoDB conectado exitosamente para notificaciones');
  }).catch(err => {
    console.log('⚠️  MongoDB no disponible, continuando sin notificaciones:', err.message);
  });
} else {
  console.log('⚠️  MongoDB no configurado, continuando sin notificaciones');
}

// Importar modelos
const { Product, GuestOrder, GuestOrderProduct, District, DeliveryFee } = require('./models');

// Rutas básicas
app.get('/', (req, res) => {
  res.json({ message: 'Bienvenido a la API de la Planta de Agua' });
});

// Importar y usar todas las rutas
const authRoutes = require('./routes/auth.routes');
const clientAuthRoutes = require('./routes/client.auth.routes');
const productRoutes = require('./routes/product.routes');
const clientRoutes = require('./routes/client.routes');
const orderRoutes = require('./routes/order.routes');
const saleRoutes = require('./routes/sale.routes');
const creditRoutes = require('./routes/credit.routes');
const paymentRoutes = require('./routes/payment.routes');
const inventoryRoutes = require('./routes/inventory.routes');
const reportRoutes = require('./routes/report.routes');
const notificationRoutes = require('./routes/notification.routes');
const deliveryFeeRoutes = require('./routes/deliveryFee.routes');
const deliveryPersonRoutes = require('./routes/deliveryPerson.routes');
const districtRoutes = require('./routes/district.routes');
const cashRegisterRoutes = require('./routes/cashRegister.routes');
const electronicInvoiceRoutes = require('./routes/electronicInvoice.routes');
const guestOrderRoutes = require('./routes/guestOrder.routes');
const guestPaymentRoutes = require('./routes/guestPayment.routes');
const deliveryOrdersRoutes = require('./routes/delivery.orders.routes');
const deliveryAuthRoutes = require('./routes/delivery.auth.routes');
const deliveryAssignedRoutes = require('./routes/delivery.assigned.routes');
const voucherRoutes = require('./routes/voucher.routes');
const userRoutes = require('./routes/user.routes');

// Rutas públicas (deben ir antes de las protegidas)
app.get('/api/delivery-fees', async (req, res) => {
  try {
    const deliveryFees = await DeliveryFee.findAll();
    res.json(deliveryFees);
  } catch (error) {
    console.error('Error al obtener tarifas de envío:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Usar las rutas
app.use('/api/auth', authRoutes);
app.use('/api/client', clientAuthRoutes);
app.use('/api/products', productRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/credits', creditRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/delivery-fees', deliveryFeeRoutes);
app.use('/api/delivery-persons', deliveryPersonRoutes);
app.use('/api/districts', districtRoutes);
app.use('/api/cash-register', cashRegisterRoutes);
app.use('/api/electronic-invoices', electronicInvoiceRoutes);
app.use('/api/guest-orders', guestOrderRoutes);
app.use('/api/guest-payments', guestPaymentRoutes);
app.use('/api/delivery-orders', deliveryOrdersRoutes);
app.use('/api/delivery-auth', deliveryAuthRoutes);
app.use('/api/delivery', deliveryAssignedRoutes);
app.use('/api/vouchers', voucherRoutes);
app.use('/api/users', userRoutes);

// Rutas de productos (mantener compatibilidad)
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.findAll();
    res.json(products);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Rutas de distritos (mantener compatibilidad)
app.get('/api/districts', async (req, res) => {
  try {
    const districts = await District.findAll();
    res.json(districts);
  } catch (error) {
    console.error('Error al obtener distritos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});


// Rutas de pedidos de invitados (mantener compatibilidad)
app.post('/api/guest-orders', async (req, res) => {
  try {
    console.log('Datos recibidos:', req.body);
    
    const {
      clientName,
      clientPhone,
      clientEmail,
      deliveryAddress,
      deliveryDistrict,
      deliveryReference,
      deliveryNotes,
      items,
      subtotal,
      deliveryFee,
      total,
      status = 'pendiente'
    } = req.body;

    // Validar datos requeridos
    if (!clientName || !clientPhone || !deliveryAddress || !deliveryDistrict || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Datos requeridos faltantes'
      });
    }

    // Crear el pedido
    const guestOrder = await GuestOrder.create({
      customerName: clientName,
      customerPhone: clientPhone,
      customerEmail: clientEmail,
      deliveryAddress,
      deliveryDistrict,
      deliveryNotes: deliveryNotes || deliveryReference,
      totalAmount: parseFloat(total),
      deliveryFee: parseFloat(deliveryFee),
      status: 'pending',
      paymentMethod: 'cash',
      paymentStatus: 'pending'
    });

    // Crear los productos del pedido
    const orderProducts = await Promise.all(
      items.map(async (item) => {
        return await GuestOrderProduct.create({
          guestOrderId: guestOrder.id,
          productId: item.productId,
          quantity: item.quantity,
          price: parseFloat(item.unitPrice),
          subtotal: parseFloat(item.subtotal)
        });
      })
    );

    // Obtener el pedido completo con productos
    const completeOrder = await GuestOrder.findByPk(guestOrder.id, {
      include: [
        {
          model: GuestOrderProduct,
          as: 'products',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'unitPrice']
            }
          ]
        }
      ]
    });

    res.status(201).json({
      success: true,
      data: completeOrder
    });
  } catch (error) {
    console.error('Error al crear pedido de invitado:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// Ruta para obtener pedidos de invitados (mantener compatibilidad)
app.get('/api/guest-orders', async (req, res) => {
  try {
    const orders = await GuestOrder.findAll({
      include: [
        {
          model: GuestOrderProduct,
          as: 'products',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'unitPrice']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('Error al obtener pedidos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// Rutas de notificaciones (simplificadas)
app.get('/api/notifications', async (req, res) => {
  try {
    // Si MongoDB no está disponible, devolver array vacío
    if (!mongoose.connection.readyState) {
      return res.json([]);
    }
    
    // Aquí iría la lógica de notificaciones
    res.json([]);
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    res.json([]);
  }
});

// Inicializar base de datos y servidor
async function startServer() {
  try {
    console.log('🔄 Inicializando base de datos...');
    await sequelize.authenticate();
    console.log('✅ PostgreSQL: Conexión establecida correctamente');
    
    // Sincronizar solo si es necesario
    await sequelize.sync({ alter: false });
    console.log('✅ PostgreSQL: Base de datos sincronizada correctamente');
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Servidor ejecutándose en el puerto ${PORT}`);
      console.log(`📋 Rutas disponibles:`);
      console.log(`   - POST /api/auth/login - Iniciar sesión`);
      console.log(`   - POST /api/auth/register - Registro de usuarios`);
      console.log(`   - GET /api/products - Obtener productos`);
      console.log(`   - POST /api/products/:id/calculate-price - Calcular precio`);
      console.log(`   - GET /api/districts - Obtener distritos`);
      console.log(`   - GET /api/delivery-fees - Obtener tarifas de envío`);
      console.log(`   - POST /api/guest-orders - Crear pedido de invitado`);
    });
  } catch (error) {
    console.error('❌ Error al inicializar:', error);
    process.exit(1);
  }
}

startServer();
