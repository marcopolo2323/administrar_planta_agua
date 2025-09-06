const { sequelize } = require('../models');

const createTables = async () => {
  try {
    console.log('Creando tablas...');
    
    // Primero crear las tablas básicas
    const { User, Product, Client } = require('../models');
    await User.sync({ force: false });
    await Product.sync({ force: false });
    await Client.sync({ force: false });
    
    // Luego las tablas que dependen de las básicas
    const { Sale, SaleDetail, Order, OrderDetail } = require('../models');
    await Sale.sync({ force: false });
    await SaleDetail.sync({ force: false });
    await Order.sync({ force: false });
    await OrderDetail.sync({ force: false });
    
    // Finalmente las nuevas tablas
    const { GuestOrder, GuestOrderProduct, DeliveryFee, DeliveryPerson } = require('../models');
    await GuestOrder.sync({ force: false });
    await GuestOrderProduct.sync({ force: false });
    await DeliveryFee.sync({ force: false });
    await DeliveryPerson.sync({ force: false });
    
    console.log('✅ Tablas creadas exitosamente');
    
    // Cerrar la conexión
    await sequelize.close();
    console.log('Conexión cerrada');
    
  } catch (error) {
    console.error('❌ Error al crear tablas:', error);
    process.exit(1);
  }
};

createTables();
