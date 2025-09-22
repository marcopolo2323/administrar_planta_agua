const { sequelize } = require('../models');

async function verifyTableNames() {
  console.log('🔍 VERIFICANDO NOMBRES DE TABLAS VS REFERENCIAS');
  console.log('================================================');
  
  try {
    await sequelize.authenticate();
    
    // Obtener todas las tablas que existen
    const tables = await sequelize.getQueryInterface().showAllTables();
    console.log('📋 Tablas existentes:', tables.sort());
    
    // Mapeo de referencias esperadas vs nombres reales
    const expectedReferences = {
      // Lo que debería ser -> lo que realmente es
      'Client': 'Clients',
      'User': 'Users', 
      'Product': 'Products',
      'District': 'Districts',
      'Order': 'Orders', // si existe
      'GuestOrder': 'GuestOrders',
      'Subscription': 'subscriptions', // minúscula
      'Voucher': 'Vouchers',
      'Vale': 'Vales',
      'DeliveryPerson': 'DeliveryPersons'
    };
    
    console.log('\n🔍 Verificando referencias:');
    for (const [expected, real] of Object.entries(expectedReferences)) {
      const exists = tables.includes(real);
      console.log(`   ${expected} -> ${real}: ${exists ? '✅' : '❌'}`);
    }
    
    // Verificar nombres de tabla específicos que podrían causar problemas
    const problematicTables = [
      'Client', 'User', 'Product', 'District', 'Order', 'GuestOrder', 
      'Subscription', 'Voucher', 'Vale', 'DeliveryPerson'
    ];
    
    console.log('\n⚠️  Tablas problemáticas (singular) que NO deberían existir:');
    for (const table of problematicTables) {
      if (tables.includes(table)) {
        console.log(`   ❌ ${table} existe (debería ser plural)`);
      } else {
        console.log(`   ✅ ${table} no existe (correcto)`);
      }
    }
    
    console.log('\n✅ Verificación completada');
    
  } catch (error) {
    console.error('❌ Error verificando nombres:', error);
    throw error;
  }
}

if (require.main === module) {
  verifyTableNames()
    .then(() => {
      console.log('🎉 Verificación completada');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error:', error);
      process.exit(1);
    });
}

module.exports = { verifyTableNames };
