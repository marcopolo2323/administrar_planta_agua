const { sequelize } = require('./src/models');

async function testFixes() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conectado exitosamente');

    // Sincronizar tablas
    console.log('🔄 Sincronizando tablas...');
    await sequelize.sync({ force: false });
    console.log('✅ Tablas sincronizadas');

    // Verificar tabla GuestOrder
    console.log('🔍 Verificando tabla GuestOrder...');
    const guestOrderResult = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'GuestOrder' 
      AND column_name = 'accessToken'
    `, { type: sequelize.QueryTypes.SELECT });
    
    if (guestOrderResult.length === 0) {
      console.log('🔄 Agregando columna accessToken...');
      await sequelize.query(`
        ALTER TABLE "GuestOrder" 
        ADD COLUMN "accessToken" VARCHAR(255) UNIQUE
      `);
      console.log('✅ Columna accessToken agregada');
    } else {
      console.log('✅ Columna accessToken ya existe');
    }

    // Verificar clientes
    console.log('🔍 Verificando clientes...');
    const clientResult = await sequelize.query(`
      SELECT "documentNumber", "district", "name" 
      FROM "Clients" 
      LIMIT 3
    `, { type: sequelize.QueryTypes.SELECT });
    
    console.log('📋 Primeros 3 clientes:');
    clientResult.forEach((client, index) => {
      console.log(`   ${index + 1}. ${client.name} - DNI: ${client.documentNumber} - Distrito: ${client.district}`);
    });

    console.log('✅ Pruebas completadas exitosamente');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

testFixes();
