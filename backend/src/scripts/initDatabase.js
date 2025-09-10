const { sequelize } = require('../models');
const seedDatabase = require('../utils/seedDb');
const seedDistricts = require('./seedDistricts');

const initDatabase = async () => {
  try {
    console.log('🚀 Iniciando configuración completa de la base de datos...');
    console.log('================================================');
    
    // 1. Crear todas las tablas
    console.log('\n📋 PASO 1: Creando tablas...');
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
    console.log('   🔄 Creando tablas básicas...');
    await User.sync({ force: true });
    await Product.sync({ force: true });
    await Client.sync({ force: true });
    await District.sync({ force: true });
    
    console.log('   🔄 Creando tablas de suscripciones...');
    const { SubscriptionPlan, Subscription } = require('../models');
    await SubscriptionPlan.sync({ force: true });
    await Subscription.sync({ force: true });
    
    console.log('   🔄 Creando tablas de delivery...');
    await DeliveryFee.sync({ force: true });
    await DeliveryPerson.sync({ force: true });
    
    console.log('   🔄 Creando tablas de pedidos...');
    await Order.sync({ force: true });
    await OrderDetail.sync({ force: true });
    await GuestOrder.sync({ force: true });
    await GuestOrderProduct.sync({ force: true });
    
    console.log('   ✅ Todas las tablas creadas exitosamente');
    
    // 2. Poblar con datos de prueba
    console.log('\n🌱 PASO 2: Poblando con datos de prueba...');
    await seedDatabase();
    
    // 3. Poblar distritos
    console.log('\n🌍 PASO 3: Poblando distritos...');
    await seedDistricts();
    
    console.log('\n🎉 ¡Base de datos inicializada completamente!');
    console.log('================================================');
    console.log('📊 Tablas creadas:');
    console.log('   - Users (usuarios del sistema)');
    console.log('   - Products (productos)');
    console.log('   - Clients (clientes frecuentes)');
    console.log('   - Districts (distritos de entrega)');
    console.log('   - Orders (pedidos regulares)');
    console.log('   - OrderDetails (detalles de pedidos)');
    console.log('   - GuestOrders (pedidos de invitados)');
    console.log('   - GuestOrderProducts (productos de pedidos de invitados)');
    console.log('   - DeliveryFees (tarifas de envío)');
    console.log('   - DeliveryPersons (repartidores)');
    
    console.log('\n🔑 Credenciales de acceso:');
    console.log('   👨‍💼 Admin: admin / admin123');
    console.log('   👨‍💼 Vendedor: vendedor / vendedor123');
    console.log('   🚚 Repartidor: repartidor / repartidor123');
    console.log('   👤 Cliente: cliente1 / cliente123');
    
    console.log('\n📦 Productos disponibles:');
    console.log('   - Bidón de Agua 20L: S/7.00 (S/5.00 si compra 2+)');
    console.log('   - Paquete de Botellas: S/10.00 (S/9.00 si compra 60+)');
    
    console.log('\n🌍 Distritos configurados: 50+ distritos de Lima');
    
    console.log('\n✅ ¡Sistema listo para usar!');
    
  } catch (error) {
    console.error('❌ Error durante la inicialización:', error);
    throw error;
  } finally {
    await sequelize.close();
    console.log('\n🔌 Conexión a la base de datos cerrada');
  }
};

// Ejecutar si se llama directamente
if (require.main === module) {
  initDatabase()
    .then(() => {
      console.log('\n🎊 ¡Inicialización completada exitosamente!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Error en la inicialización:', error);
      process.exit(1);
    });
}

module.exports = initDatabase;
