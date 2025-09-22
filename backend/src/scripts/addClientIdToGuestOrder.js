const { sequelize } = require('../models');

async function addClientIdToGuestOrder() {
  console.log('🔧 Agregando columna clientId a GuestOrder...');
  
  try {
    // Verificar si la columna ya existe
    const [results] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'GuestOrder' 
      AND column_name = 'clientId'
    `);
    
    if (results.length > 0) {
      console.log('✅ La columna clientId ya existe en GuestOrder');
      return;
    }
    
    // Agregar la columna
    await sequelize.query(`
      ALTER TABLE "GuestOrder" 
      ADD COLUMN "clientId" INTEGER REFERENCES "Clients"("id") ON DELETE SET NULL ON UPDATE CASCADE
    `);
    
    console.log('✅ Columna clientId agregada exitosamente a GuestOrder');
    
  } catch (error) {
    console.error('❌ Error agregando columna clientId:', error);
    throw error;
  }
}

if (require.main === module) {
  addClientIdToGuestOrder()
    .then(() => {
      console.log('🎉 Script completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error:', error);
      process.exit(1);
    });
}

module.exports = { addClientIdToGuestOrder };
