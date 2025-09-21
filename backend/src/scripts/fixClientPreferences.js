const { ClientPreferences, sequelize } = require('../models');

async function fixClientPreferences() {
  console.log('🔧 Arreglando tabla ClientPreferences...');
  
  try {
    // 1. Verificar si la tabla existe
    const tableExists = await sequelize.getQueryInterface().showAllTables();
    console.log('📋 Tablas existentes:', tableExists.filter(t => t.includes('Client')));
    
    // 2. Forzar la sincronización de ClientPreferences
    console.log('🔄 Sincronizando ClientPreferences...');
    await ClientPreferences.sync({ force: false, alter: true });
    console.log('✅ ClientPreferences sincronizado');
    
    // 3. Verificar estructura de la tabla
    console.log('🔍 Verificando estructura de ClientPreferences...');
    const description = await sequelize.getQueryInterface().describeTable('ClientPreferences');
    console.log('📋 Columnas de ClientPreferences:', Object.keys(description));
    
    // 4. Verificar que subscriptionPlanId existe
    if (description.subscriptionPlanId) {
      console.log('✅ Columna subscriptionPlanId existe');
      console.log('📋 Detalles:', description.subscriptionPlanId);
    } else {
      console.log('❌ Columna subscriptionPlanId NO existe');
      
      // Agregar la columna manualmente
      console.log('🔧 Agregando columna subscriptionPlanId...');
      await sequelize.getQueryInterface().addColumn('ClientPreferences', 'subscriptionPlanId', {
        type: sequelize.Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'subscriptions',
          key: 'id'
        }
      });
      console.log('✅ Columna subscriptionPlanId agregada');
    }
    
    // 5. Probar una consulta simple
    console.log('🧪 Probando consulta a ClientPreferences...');
    const count = await ClientPreferences.count();
    console.log('📊 Total de registros en ClientPreferences:', count);
    
    console.log('✅ ClientPreferences arreglado correctamente');
    
  } catch (error) {
    console.error('❌ Error arreglando ClientPreferences:', error);
    throw error;
  }
}

if (require.main === module) {
  fixClientPreferences()
    .then(() => {
      console.log('🎉 ClientPreferences arreglado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error:', error);
      process.exit(1);
    });
}

module.exports = { fixClientPreferences };
