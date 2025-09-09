const { sequelize } = require('../models');

async function migrateSubscriptionTables() {
  try {
    console.log('🔄 Creando tablas de suscripciones...');

    // Sincronizar las tablas
    await sequelize.sync({ alter: true });

    console.log('✅ Tablas de suscripciones creadas/actualizadas correctamente');
    console.log('📋 Tablas creadas:');
    console.log('   - Subscriptions');
    console.log('   - SubscriptionPlans');
    console.log('   - Campos agregados a Orders (subscriptionId, isSubscriptionOrder, bottlesFromSubscription)');

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar la migración
migrateSubscriptionTables();
