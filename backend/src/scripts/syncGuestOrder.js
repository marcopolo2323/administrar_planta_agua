const { sequelize, GuestOrder, GuestOrderProduct } = require('../models');

const syncGuestOrder = async () => {
  try {
    console.log('🔄 Sincronizando tabla de pedidos de invitados...');
    
    // Sincronizar las tablas
    await GuestOrder.sync({ alter: true });
    await GuestOrderProduct.sync({ alter: true });
    
    console.log('✅ Tablas de pedidos de invitados sincronizadas');
    
  } catch (error) {
    console.error('❌ Error al sincronizar pedidos de invitados:', error);
  }
};

// Ejecutar si se llama directamente
if (require.main === module) {
  syncGuestOrder()
    .then(() => {
      console.log('🎉 Sincronización completada');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Error:', error);
      process.exit(1);
    });
}

module.exports = syncGuestOrder;

