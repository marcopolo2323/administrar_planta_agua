const { sequelize } = require('../models');

const createNewTables = async () => {
  try {
    console.log('Creando nuevas tablas...');
    
    // Crear solo las nuevas tablas sin referencias por ahora
    const { GuestOrder, GuestOrderProduct, DeliveryFee, DeliveryPerson } = require('../models');
    
    await GuestOrder.sync({ force: false });
    console.log('✅ Tabla guest_orders creada');
    
    await GuestOrderProduct.sync({ force: false });
    console.log('✅ Tabla guest_order_products creada');
    
    await DeliveryFee.sync({ force: false });
    console.log('✅ Tabla delivery_fees creada');
    
    await DeliveryPerson.sync({ force: false });
    console.log('✅ Tabla delivery_persons creada');
    
    console.log('✅ Todas las nuevas tablas creadas exitosamente');
    
    // Cerrar la conexión
    await sequelize.close();
    console.log('Conexión cerrada');
    
  } catch (error) {
    console.error('❌ Error al crear tablas:', error);
    process.exit(1);
  }
};

createNewTables();
