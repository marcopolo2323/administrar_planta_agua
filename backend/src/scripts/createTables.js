const { sequelize } = require('../models');

const createTables = async () => {
  try {
    console.log('🔄 Creando tablas con nombres estandarizados...');
    
    // Importar todos los modelos
    const { 
      User, 
      Product, 
      Client, 
      Order, 
      OrderDetail, 
      GuestOrder, 
      GuestOrderProduct, 
      DeliveryFee, 
      DeliveryPerson,
      District
    } = require('../models');
    
    // Crear tablas en orden de dependencias
    console.log('📋 Creando tablas básicas...');
    await User.sync({ force: true });
    await Product.sync({ force: true });
    await Client.sync({ force: true });
    await District.sync({ force: true });
    
    console.log('📋 Creando tablas de delivery...');
    await DeliveryFee.sync({ force: true });
    await DeliveryPerson.sync({ force: true });
    
    console.log('📋 Creando tablas de pedidos...');
    await Order.sync({ force: true });
    await OrderDetail.sync({ force: true });
    await GuestOrder.sync({ force: true });
    await GuestOrderProduct.sync({ force: true });
    
    console.log('✅ Todas las tablas creadas exitosamente');
    console.log('📊 Tablas creadas:');
    console.log('   - Users');
    console.log('   - Products');
    console.log('   - Clients');
    console.log('   - Districts');
    console.log('   - Orders');
    console.log('   - OrderDetails');
    console.log('   - GuestOrders');
    console.log('   - GuestOrderProducts');
    console.log('   - DeliveryFees');
    console.log('   - DeliveryPersons');
    
    // Cerrar la conexión
    await sequelize.close();
    console.log('🔌 Conexión cerrada');
    
  } catch (error) {
    console.error('❌ Error al crear tablas:', error);
    process.exit(1);
  }
};

createTables();
