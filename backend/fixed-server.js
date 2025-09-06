const express = require('express');
const cors = require('cors');
const { sequelize } = require('./src/models');

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

// Importar modelos
const { Product, GuestOrder, GuestOrderProduct, District, DeliveryFee } = require('./src/models');

// Rutas básicas
app.get('/', (req, res) => {
  res.json({ message: 'Bienvenido a la API de la Planta de Agua' });
});

// Rutas de productos
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.findAll();
    res.json(products);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Rutas de distritos
app.get('/api/districts', async (req, res) => {
  try {
    const districts = await District.findAll();
    res.json(districts);
  } catch (error) {
    console.error('Error al obtener distritos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Rutas de tarifas de envío
app.get('/api/delivery-fees', async (req, res) => {
  try {
    const deliveryFees = await DeliveryFee.findAll();
    res.json(deliveryFees);
  } catch (error) {
    console.error('Error al obtener tarifas de envío:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Rutas de pedidos de invitados
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

// Ruta para obtener pedidos de invitados
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

// Inicializar base de datos y servidor
async function startServer() {
  try {
    console.log('🔄 Inicializando base de datos...');
    await sequelize.authenticate();
    console.log('✅ PostgreSQL: Conexión establecida correctamente');
    
    // Sincronizar solo si es necesario
    await sequelize.sync({ alter: false });
    console.log('✅ PostgreSQL: Base de datos sincronizada correctamente');
    
    app.listen(PORT, () => {
      console.log(`🚀 Servidor ejecutándose en el puerto ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error al inicializar:', error);
    process.exit(1);
  }
}

startServer();
