const { sequelize } = require('../models');

async function addUserIdToDeliveryPersons() {
  try {
    console.log('🔄 Agregando campo userId a delivery_persons...');
    
    // Agregar la columna userId
    await sequelize.query(`
      ALTER TABLE "DeliveryPersons" 
      ADD COLUMN "userId" INTEGER REFERENCES "Users"(id)
    `);
    
    console.log('✅ Campo userId agregado exitosamente');
    
    // Verificar que la columna se agregó
    const [results] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'DeliveryPersons' 
      AND column_name = 'userId'
    `);
    
    if (results.length > 0) {
      console.log('✅ Verificación exitosa - Campo userId existe:', results[0]);
    } else {
      console.log('❌ Error - Campo userId no se encontró');
    }
    
  } catch (error) {
    console.error('❌ Error al agregar campo userId:', error);
  } finally {
    await sequelize.close();
  }
}

addUserIdToDeliveryPersons();
