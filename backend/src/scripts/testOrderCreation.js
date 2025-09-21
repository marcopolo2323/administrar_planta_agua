const { GuestOrder, GuestOrderProduct, Product, sequelize } = require('../models');

async function testOrderCreation() {
  console.log('🧪 Probando creación de pedido simplificada...');
  
  try {
    // 1. Verificar que las tablas existen
    console.log('🔍 Verificando tablas...');
    const tables = await sequelize.getQueryInterface().showAllTables();
    console.log('📋 Tablas disponibles:', tables.filter(t => t.includes('Guest')));
    
    // 2. Verificar estructura de GuestOrders
    console.log('🔍 Verificando estructura de GuestOrders...');
    const guestOrderDesc = await sequelize.getQueryInterface().describeTable('GuestOrders');
    console.log('📋 Columnas de GuestOrders:', Object.keys(guestOrderDesc));
    
    // 3. Verificar estructura de GuestOrderProducts
    console.log('🔍 Verificando estructura de GuestOrderProducts...');
    const guestOrderProductDesc = await sequelize.getQueryInterface().describeTable('GuestOrderProducts');
    console.log('📋 Columnas de GuestOrderProducts:', Object.keys(guestOrderProductDesc));
    
    // 4. Crear pedido SIN transacción para ver si funciona
    console.log('🧪 Creando pedido de prueba SIN transacción...');
    
    const orderData = {
      customerName: 'Test Cliente',
      customerPhone: '123456789',
      customerEmail: 'test@test.com',
      deliveryAddress: 'Test Address',
      deliveryDistrict: 'MANANTAY',
      deliveryNotes: '',
      totalAmount: 17.00,
      subtotal: 17.00,
      deliveryFee: 0.00,
      status: 'pending',
      paymentMethod: 'contraentrega',
      paymentType: 'efectivo',
      paymentStatus: 'pending',
      clientId: null,
      subscriptionId: null,
      accessToken: 'test-token-' + Date.now()
    };
    
    console.log('📦 Datos del pedido:', orderData);
    
    const guestOrder = await GuestOrder.create(orderData);
    console.log('✅ Pedido creado con ID:', guestOrder.id);
    
    // 5. Verificar que el pedido existe en la base de datos
    console.log('🔍 Verificando que el pedido existe...');
    const foundOrder = await GuestOrder.findByPk(guestOrder.id);
    if (foundOrder) {
      console.log('✅ Pedido encontrado en la base de datos');
    } else {
      console.log('❌ Pedido NO encontrado en la base de datos');
      throw new Error('Pedido no se guardó correctamente');
    }
    
    // 6. Crear producto del pedido
    console.log('🧪 Creando producto del pedido...');
    
    const productData = {
      guestOrderId: guestOrder.id,
      productId: 1, // Asumiendo que existe un producto con ID 1
      quantity: 1,
      price: 7.00,
      subtotal: 7.00
    };
    
    console.log('📦 Datos del producto:', productData);
    
    const orderProduct = await GuestOrderProduct.create(productData);
    console.log('✅ Producto del pedido creado con ID:', orderProduct.id);
    
    // 7. Verificar que el producto se creó correctamente
    console.log('🔍 Verificando que el producto del pedido existe...');
    const foundProduct = await GuestOrderProduct.findByPk(orderProduct.id);
    if (foundProduct) {
      console.log('✅ Producto del pedido encontrado en la base de datos');
    } else {
      console.log('❌ Producto del pedido NO encontrado en la base de datos');
    }
    
    // 8. Probar obtener el pedido con productos
    console.log('🔍 Probando obtener pedido con productos...');
    const orderWithProducts = await GuestOrder.findByPk(guestOrder.id, {
      include: [
        {
          model: Product,
          as: 'products',
          through: {
            attributes: ['quantity', 'price', 'subtotal']
          }
        }
      ]
    });
    
    if (orderWithProducts && orderWithProducts.products) {
      console.log('✅ Pedido con productos obtenido:', {
        orderId: orderWithProducts.id,
        productsCount: orderWithProducts.products.length
      });
    } else {
      console.log('❌ No se pudo obtener el pedido con productos');
    }
    
    // 9. Limpiar datos de prueba
    console.log('🧹 Limpiando datos de prueba...');
    await GuestOrderProduct.destroy({ where: { guestOrderId: guestOrder.id } });
    await GuestOrder.destroy({ where: { id: guestOrder.id } });
    console.log('✅ Datos de prueba limpiados');
    
    console.log('✅ Prueba de creación de pedido completada exitosamente');
    
  } catch (error) {
    console.error('❌ Error en la prueba de creación de pedido:', error);
    throw error;
  }
}

if (require.main === module) {
  testOrderCreation()
    .then(() => {
      console.log('🎉 Prueba completada exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error en la prueba:', error);
      process.exit(1);
    });
}

module.exports = { testOrderCreation };
