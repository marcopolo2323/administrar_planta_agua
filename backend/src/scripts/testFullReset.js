const { sequelize } = require('../models');

async function testFullReset() {
  console.log('🧪 PROBANDO FULL-RESET');
  console.log('=====================');
  
  try {
    // 1. Conectar a la base de datos
    console.log('🔌 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión establecida');
    
    // 2. Verificar tablas existentes
    console.log('📋 Verificando tablas existentes...');
    const tables = await sequelize.getQueryInterface().showAllTables();
    console.log('📋 Tablas encontradas:', tables);
    
    // 3. Verificar si subscription_plans existe
    if (tables.includes('subscription_plans')) {
      console.log('✅ Tabla subscription_plans existe');
      
      // Verificar datos
      const { SubscriptionPlan } = require('../models');
      const count = await SubscriptionPlan.count();
      console.log(`📊 Planes de suscripción: ${count}`);
      
      if (count > 0) {
        const plans = await SubscriptionPlan.findAll();
        console.log('📋 Planes disponibles:');
        plans.forEach(plan => {
          console.log(`   - ${plan.name}: ${plan.totalBottles} bidones, S/ ${plan.monthlyPrice}`);
        });
      }
    } else {
      console.log('❌ Tabla subscription_plans NO existe');
    }
    
    // 4. Verificar otras tablas importantes
    const importantTables = ['users', 'products', 'districts', 'clients', 'subscriptions'];
    for (const table of importantTables) {
      if (tables.includes(table)) {
        console.log(`✅ Tabla ${table} existe`);
      } else {
        console.log(`❌ Tabla ${table} NO existe`);
      }
    }
    
    console.log('🎉 Verificación completada');
    
  } catch (error) {
    console.error('❌ Error en verificación:', error);
  } finally {
    await sequelize.close();
  }
}

if (require.main === module) {
  testFullReset()
    .then(() => {
      console.log('🎉 Verificación exitosa');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error en verificación:', error);
      process.exit(1);
    });
}

module.exports = { testFullReset };
