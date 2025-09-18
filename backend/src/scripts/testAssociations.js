const { GuestOrder, Product, GuestOrderProduct, sequelize } = require('../models');

async function testAssociations() {
  console.log('🧪 Probando asociaciones...');
  try {
    // 1. Verificar que las asociaciones están definidas
    console.log('🔍 Verificando asociaciones...');
    
    const guestOrderAssociations = Object.keys(GuestOrder.associations);
    const productAssociations = Object.keys(Product.associations);
    
    console.log('📋 GuestOrder associations:', guestOrderAssociations);
    console.log('📋 Product associations:', productAssociations);
    
    // 2. Probar crear un pedido con productos
    console.log('🧪 Probando creación de pedido...');
    
    const transaction = await sequelize.transaction();
    
    try {
      // Crear pedido
      const order = await GuestOrder.create({
        customerName: 'Test Order',
        customerPhone: '123456789',
        deliveryAddress: 'Test Address',
        deliveryDistrict: 'MANANTAY',
        paymentMethod: 'cash',
        paymentType: 'efectivo',
        totalAmount: 20.00,
        subtotal: 20.00,
        deliveryFee: 0.00,
        status: 'pending',
        paymentStatus: 'pending'
      }, { transaction });
      
      console.log('✅ Pedido creado con ID:', order.id);
      
      // Crear productos del pedido
      const orderProducts = await Promise.all([
        GuestOrderProduct.create({
          guestOrderId: order.id,
          productId: 1,
          quantity: 1,
          price: 10.00,
          subtotal: 10.00
        }, { transaction }),
        GuestOrderProduct.create({
          guestOrderId: order.id,
          productId: 2,
          quantity: 1,
          price: 10.00,
          subtotal: 10.00
        }, { transaction })
      ]);
      
      console.log('✅ Productos creados:', orderProducts.length);
      
      // Probar incluir productos
      const orderWithProducts = await GuestOrder.findByPk(order.id, {
        include: [
          {
            model: Product,
            as: 'products',
            through: {
              attributes: ['quantity', 'price', 'subtotal']
            }
          }
        ],
        transaction
      });
      
      console.log('✅ Pedido con productos obtenido:', {
        id: orderWithProducts.id,
        productsCount: orderWithProducts.products?.length || 0
      });
      
      // Limpiar datos de prueba
      await GuestOrderProduct.destroy({
        where: { guestOrderId: order.id },
        transaction
      });
      await GuestOrder.destroy({
        where: { id: order.id },
        transaction
      });
      
      await transaction.commit();
      console.log('✅ Transacción completada y datos limpiados');
      
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
    
    console.log('✅ Todas las asociaciones funcionan correctamente');
    
  } catch (error) {
    console.error('❌ Error probando asociaciones:', error);
    throw error;
  }
}

if (require.main === module) {
  testAssociations()
    .then(() => {
      console.log('🎉 Prueba completada exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error en la prueba:', error);
      process.exit(1);
    });
}

module.exports = { testAssociations };
