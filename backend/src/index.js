//index.js
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { sequelize } = require('./models');


const app = express();
const PORT = process.env.PORT || 5000;

// CORS debe ser el primer middleware
const allowedOrigins = [
  'https://plantaaguademesaaquayara.vercel.app',
  'https://plantaaguademesaaquayara-git-main-lloyds-projects-25bc7492.vercel.app',
  'https://aquayara.vercel.app',
  'http://localhost:3000'
];
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposedHeaders: ['Content-Disposition']
}));
// Manejar preflight OPTIONS para todos los endpoints
app.options('*', cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposedHeaders: ['Content-Disposition']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Endpoints de sincronización manual (GET para acceso directo)
app.get('/fix-foreign-keys', async (req, res) => {
  try {
    console.log('🔧 Iniciando reparación de foreign keys...');
    const { fixForeignKeys } = require('./scripts/fixForeignKeys');
    await fixForeignKeys();
    res.json({ success: true, message: 'Foreign keys reparadas exitosamente' });
  } catch (error) {
    console.error('❌ Error reparando foreign keys:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/full-sync', async (req, res) => {
  try {
    console.log('🔄 Iniciando sincronización completa...');
    const { fixForeignKeys } = require('./scripts/fixForeignKeys');
    const { addPaymentTypeColumn } = require('./scripts/addPaymentTypeColumn');
    await fixForeignKeys();
    await addPaymentTypeColumn();
    res.json({ success: true, message: 'Sincronización completa exitosa' });
  } catch (error) {
    console.error('❌ Error en sincronización completa:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/run-seed', async (req, res) => {
  try {
    console.log('🌱 Ejecutando seed completo...');
    const { deployUpdate } = require('./scripts/deployUpdate');
    await deployUpdate();
    res.json({ success: true, message: 'Seed ejecutado exitosamente' });
  } catch (error) {
    console.error('❌ Error ejecutando seed:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

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
const { Product, GuestOrder, GuestOrderProduct, District, DeliveryFee, User } = require('./models');

// Rutas básicas
app.get('/', (req, res) => {
  res.json({ message: 'Bienvenido a la API de la Planta de Agua' });
});

// Importar y usar todas las rutas
const authRoutes = require('./routes/auth.routes');
const clientAuthRoutes = require('./routes/client.auth.routes');
const productRoutes = require('./routes/product.routes');
const clientRoutes = require('./routes/client.routes');
const reportRoutes = require('./routes/report.routes');
const deliveryFeeRoutes = require('./routes/deliveryFee.routes');
const deliveryPersonRoutes = require('./routes/deliveryPerson.routes');
const districtRoutes = require('./routes/district.routes');
const guestOrderRoutes = require('./routes/guestOrder.routes');
const deliveryOrdersRoutes = require('./routes/delivery.orders.routes');
const deliveryAuthRoutes = require('./routes/delivery.auth.routes');
const deliveryAssignedRoutes = require('./routes/delivery.assigned.routes');
const voucherRoutes = require('./routes/voucher.routes');
const valeRoutes = require('./routes/vale.routes');
const subscriptionRoutes = require('./routes/subscription.routes');
const userRoutes = require('./routes/user.routes');
const documentRoutes = require('./routes/document.routes');
const resetDatabase = require('./utils/seedDb');
const deployUpdate = require('./scripts/deployUpdate');

//temporal
app.get('/run-seed', async (req, res) => {
  try {
    console.log('🌱 Iniciando seed completo con clientes del Excel...');
    
    // Ejecutar el script de deploy que incluye los clientes del Excel
    await deployUpdate();
    
    res.json({ 
      success: true, 
      message: 'Database seeded successfully with Excel clients!',
      details: 'Se importaron 79 clientes desde el Excel y se configuró todo el sistema'
    });
  } catch (error) {
    console.error('❌ Error en seed:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message
    });
  }
});

// Ruta para importar clientes desde JSON (solo en producción)
app.get('/import-clients', async (req, res) => {
  try {
    console.log('📥 Iniciando importación de clientes desde JSON...');
    
    const importClientsFromJson = require('./scripts/importClientsFromJson');
    const result = await importClientsFromJson();
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Clientes importados exitosamente',
        stats: result.stats
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Error en la importación',
        error: result.error
      });
    }
    
  } catch (error) {
    console.error('❌ Error en importación:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// Ruta para obtener preferencias de cliente por DNI (placeholder)
app.get('/api/client-preferences/dni/:dni', async (req, res) => {
  try {
    const { dni } = req.params;
    
    // Por ahora, devolver que no hay preferencias
    // En el futuro se puede implementar la funcionalidad completa
    res.json({
      success: true,
      data: null,
      message: 'No se encontraron preferencias para este cliente'
    });
    
  } catch (error) {
    console.error('❌ Error al obtener preferencias:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// Ruta para crear preferencias de cliente (placeholder)
app.post('/api/client-preferences', async (req, res) => {
  try {
    const preferencesData = req.body;
    
    // Por ahora, solo confirmar que se recibieron los datos
    // En el futuro se puede implementar la funcionalidad completa
    res.json({
      success: true,
      message: 'Preferencias recibidas (funcionalidad en desarrollo)',
      data: preferencesData
    });
    
  } catch (error) {
    console.error('❌ Error al crear preferencias:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// Ruta para corregir distritos de clientes
app.get('/fix-districts', async (req, res) => {
  try {
    console.log('🔧 Iniciando corrección de distritos...');
    
    const fs = require('fs');
    const path = require('path');
    const Client = require('./models/client.model');
    
    // Leer el archivo JSON
    const jsonPath = path.join(__dirname, '../data/clientes.json');
    const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    console.log(`📊 Datos leídos: ${jsonData.length} registros`);
    
    // Crear un mapa de DNI/RUC a distrito
    const distritoMap = new Map();
    jsonData.forEach(cliente => {
      const documento = cliente['DNI O RUC'] ? String(cliente['DNI O RUC']) : '';
      const distrito = (cliente['Distrito '] || '').trim();
      if (documento && distrito) {
        distritoMap.set(documento, distrito);
      }
    });
    
    console.log(`🗺️ Mapa de distritos creado: ${distritoMap.size} entradas`);
    
    // Actualizar clientes en la base de datos
    const clientes = await Client.findAll();
    
    let actualizados = 0;
    for (const cliente of clientes) {
      if (distritoMap.has(cliente.documentNumber)) {
        const distrito = distritoMap.get(cliente.documentNumber);
        if (cliente.district !== distrito) {
          await cliente.update({ district: distrito });
          actualizados++;
          console.log(`✅ Actualizado: ${cliente.name} - ${distrito}`);
        }
      }
    }
    
    console.log(`\n🎉 Corrección completada: ${actualizados} clientes actualizados`);
    
    res.json({
      success: true,
      message: 'Distritos corregidos exitosamente',
      actualizados: actualizados
    });
    
  } catch (error) {
    console.error('❌ Error en corrección de distritos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// Ruta para sincronizar todas las tablas
app.get('/sync-tables', async (req, res) => {
  try {
    console.log('🔄 Iniciando sincronización de tablas...');
    
    // Sincronizar todas las tablas
    await sequelize.sync({ force: false });
    
    console.log('✅ Tablas sincronizadas exitosamente');
    
    res.json({ 
      success: true, 
      message: 'Tablas sincronizadas exitosamente'
    });
    
  } catch (error) {
    console.error('❌ Error en sincronización:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message
    });
  }
});

// Ruta para migrar Supabase
app.get('/migrate-supabase', async (req, res) => {
  try {
    console.log('🔄 Iniciando migración de Supabase...');
    
    const migrations = [];
    
    // Verificar si la columna reference existe en Clients
    const referenceResult = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'Clients' 
      AND column_name = 'reference'
    `, { type: sequelize.QueryTypes.SELECT });
    
    if (referenceResult.length === 0) {
      console.log('🔄 Agregando columna reference a la tabla Clients...');
      
      await sequelize.query(`
        ALTER TABLE "Clients" 
        ADD COLUMN "reference" VARCHAR(255)
      `);
      
      migrations.push('Columna reference agregada a Clients');
    }
    
    // Verificar si la columna accessToken existe en GuestOrder
    const accessTokenResult = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'GuestOrder' 
      AND column_name = 'accessToken'
    `, { type: sequelize.QueryTypes.SELECT });
    
    if (accessTokenResult.length === 0) {
      console.log('🔄 Agregando columna accessToken a la tabla GuestOrder...');
      
      await sequelize.query(`
        ALTER TABLE "GuestOrder" 
        ADD COLUMN "accessToken" VARCHAR(255) UNIQUE
      `);
      
      migrations.push('Columna accessToken agregada a GuestOrder');
    }
    
    if (migrations.length === 0) {
      res.json({ 
        success: true, 
        message: 'Migración no necesaria: Todas las columnas ya existen'
      });
    } else {
      res.json({ 
        success: true, 
        message: 'Migración completada',
        migrations: migrations
      });
    }
    
  } catch (error) {
    console.error('❌ Error en migración:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message
    });
  }
});

// Ruta para agregar columna paymentType
app.get('/add-payment-type', async (req, res) => {
  try {
    console.log('🔧 Agregando columna paymentType...');
    
    const { addPaymentTypeColumn } = require('./scripts/addPaymentTypeColumn');
    await addPaymentTypeColumn();
    
    res.json({ 
      success: true, 
      message: 'Columna paymentType agregada exitosamente'
    });
    
  } catch (error) {
    console.error('❌ Error al agregar paymentType:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message
    });
  }
});

// Ruta de diagnóstico
app.get('/diagnose', async (req, res) => {
  try {
    console.log('🔍 Iniciando diagnóstico de la base de datos...');
    
    // Verificar conexión
    await sequelize.authenticate();
    
    // Verificar columnas de la tabla Clients
    const columns = await sequelize.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'Clients'
      ORDER BY column_name
    `, { type: sequelize.QueryTypes.SELECT });
    
    // Contar registros (con manejo de errores para tablas que no existen)
    let clientCount = 0;
    let userCount = 0;
    let productCount = 0;
    let guestOrderCount = 0;
    
    try {
      const clientResult = await sequelize.query('SELECT COUNT(*) as count FROM "Clients"', { type: sequelize.QueryTypes.SELECT });
      clientCount = clientResult[0].count;
    } catch (e) {
      console.log('⚠️ Tabla Clients no existe');
    }
    
    try {
      const userResult = await sequelize.query('SELECT COUNT(*) as count FROM "Users"', { type: sequelize.QueryTypes.SELECT });
      userCount = userResult[0].count;
    } catch (e) {
      console.log('⚠️ Tabla Users no existe');
    }
    
    try {
      const productResult = await sequelize.query('SELECT COUNT(*) as count FROM "Products"', { type: sequelize.QueryTypes.SELECT });
      productCount = productResult[0].count;
    } catch (e) {
      console.log('⚠️ Tabla Products no existe');
    }
    
    try {
      const guestOrderResult = await sequelize.query('SELECT COUNT(*) as count FROM "GuestOrder"', { type: sequelize.QueryTypes.SELECT });
      guestOrderCount = guestOrderResult[0].count;
    } catch (e) {
      console.log('⚠️ Tabla GuestOrder no existe');
    }
    
    res.json({
      success: true,
      message: 'Diagnóstico completado',
      data: {
        connection: 'OK',
        tables: {
          clients: {
            count: clientCount,
            columns: columns
          },
          users: {
            count: userCount
          },
          products: {
            count: productCount
          },
          guestOrders: {
            count: guestOrderCount
          }
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error en diagnóstico:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message
    });
  }
});
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
app.use('/api/reports', reportRoutes);
app.use('/api/delivery-fees', deliveryFeeRoutes);
app.use('/api/delivery-persons', deliveryPersonRoutes);
app.use('/api/districts', districtRoutes);
app.use('/api/guest-orders', guestOrderRoutes);
app.use('/api/delivery-orders', deliveryOrdersRoutes);
app.use('/api/delivery-auth', deliveryAuthRoutes);
app.use('/api/delivery', deliveryAssignedRoutes);
app.use('/api/vouchers', voucherRoutes);
app.use('/api/vales', valeRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/documents', documentRoutes);

// Endpoint alternativo para generar PDF
app.post('/api/admin/generate-pdf', async (req, res) => {
  try {
    console.log('📄 Generando PDF desde admin...');
    const { orderData, documentType = 'boleta' } = req.body;
    
    if (!orderData) {
      return res.status(400).json({ 
        success: false, 
        message: 'Datos del pedido requeridos' 
      });
    }

    const { generatePDF } = require('./services/pdfGenerator.service');
    const pdfBuffer = await generatePDF(orderData, documentType);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="boleta_${orderData.id || 'pedido'}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('❌ Error generando PDF:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al generar PDF',
      error: error.message 
    });
  }
});

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
    console.log('🔍 Obteniendo pedidos de visitantes...');
    
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
        },
        {
          model: User,
          as: 'deliveryPerson',
          attributes: ['id', 'username', 'phone'],
          required: false
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    console.log(`🔍 Pedidos de visitantes encontrados: ${orders.length}`);

    // Formatear los datos para incluir información del cliente directamente
    const formattedOrders = orders.map(order => {
      const formatted = {
        ...order.toJSON(),
        clientName: order.customerName,
        clientPhone: order.customerPhone,
        clientEmail: order.customerEmail,
        clientAddress: order.deliveryAddress,
        clientDistrict: order.deliveryDistrict
      };
      
      console.log(`🔍 Pedido visitante ${order.id}:`, {
        clientName: formatted.clientName,
        clientPhone: formatted.clientPhone,
        customerName: order.customerName,
        customerPhone: order.customerPhone
      });
      
      return formatted;
    });

    console.log('🔍 Enviando pedidos de visitantes formateados:', formattedOrders.length);
    res.json({
      success: true,
      data: formattedOrders
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

// Ruta para generar PDF de pago de invitados
app.post('/api/guest-payments/generate-pdf', async (req, res) => {
  try {
    console.log('📄 Generando PDF para pago de invitado...');
    console.log('📄 Método:', req.method);
    console.log('📄 URL:', req.url);
    console.log('📄 Headers:', req.headers);
    const { orderData, documentType = 'boleta' } = req.body;
    
    if (!orderData) {
      return res.status(400).json({ 
        success: false, 
        message: 'Datos del pedido requeridos' 
      });
    }

    console.log('📋 Datos del pedido para PDF:', orderData);
    console.log('📄 Tipo de documento:', documentType);
    
    // Generar PDF real usando el servicio
    const PDFGeneratorService = require('./services/pdfGenerator.service');
    const pdfBuffer = await PDFGeneratorService.generateGuestOrderPDF(orderData, documentType);
    
    // Configurar headers para descarga de PDF
    const fileName = `${documentType}_${orderData.id || 'pedido'}_${Date.now()}.pdf`;
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    
    // Enviar el PDF
    res.send(pdfBuffer);
    
  } catch (error) {
    console.error('❌ Error al generar PDF:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al generar PDF',
      error: error.message 
    });
  }
});

// Ruta para limpiar productos duplicados
app.post('/api/clean-duplicates', async (req, res) => {
  try {
    const { cleanDuplicateProducts } = require('./scripts/cleanDuplicateProducts');
    await cleanDuplicateProducts();
    
    res.json({
      success: true,
      message: 'Limpieza de duplicados completada'
    });
  } catch (error) {
    console.error('Error al limpiar duplicados:', error);
    res.status(500).json({
      success: false,
      message: 'Error al limpiar duplicados',
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
