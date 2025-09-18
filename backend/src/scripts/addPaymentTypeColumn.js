const sequelize = require('../config/database');

async function addPaymentTypeColumn() {
  console.log('🔧 Agregando columna paymentType a GuestOrders...');
  try {
    // 1. Verificar si la columna ya existe
    const columnExists = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'GuestOrders' 
      AND column_name = 'paymentType'
    `);
    
    if (columnExists[0].length > 0) {
      console.log('✅ Columna paymentType ya existe');
      return;
    }
    
    // 2. Agregar la columna paymentType
    console.log('➕ Agregando columna paymentType...');
    await sequelize.query(`
      ALTER TABLE "GuestOrders" 
      ADD COLUMN "paymentType" VARCHAR(20) DEFAULT 'cash'
    `);
    
    console.log('✅ Columna paymentType agregada exitosamente');
    
    // 3. Actualizar registros existentes que no tengan paymentType
    console.log('🔄 Actualizando registros existentes...');
    await sequelize.query(`
      UPDATE "GuestOrders" 
      SET "paymentType" = 'cash' 
      WHERE "paymentType" IS NULL
    `);
    
    console.log('✅ Registros existentes actualizados con paymentType = cash');
    
    // 4. Verificar que la columna se creó correctamente
    const verifyColumn = await sequelize.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns 
      WHERE table_name = 'GuestOrders' 
      AND column_name = 'paymentType'
    `);
    
    if (verifyColumn[0].length > 0) {
      console.log('✅ Columna paymentType verificada:', verifyColumn[0][0]);
    } else {
      console.log('❌ Error: Columna paymentType no se creó');
    }
    
  } catch (error) {
    console.error('❌ Error al agregar columna paymentType:', error);
    throw error;
  }
}

module.exports = { addPaymentTypeColumn };
