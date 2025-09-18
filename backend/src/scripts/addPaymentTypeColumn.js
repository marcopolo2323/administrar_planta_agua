const sequelize = require('../config/database');

async function addPaymentTypeColumn() {
  console.log('🔧 Agregando columna paymentType a GuestOrder...');
  try {
    // Agregar la columna paymentType
    await sequelize.query(`
      ALTER TABLE "GuestOrder" 
      ADD COLUMN IF NOT EXISTS "paymentType" VARCHAR(20) DEFAULT 'cash'
    `);
    
    console.log('✅ Columna paymentType agregada exitosamente');
    
    // Actualizar registros existentes que no tengan paymentType
    await sequelize.query(`
      UPDATE "GuestOrder" 
      SET "paymentType" = 'cash' 
      WHERE "paymentType" IS NULL
    `);
    
    console.log('✅ Registros existentes actualizados con paymentType = cash');
    
  } catch (error) {
    console.error('❌ Error al agregar columna paymentType:', error);
    throw error;
  }
}

module.exports = { addPaymentTypeColumn };
