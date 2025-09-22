const { sequelize } = require('../models');

async function addDueDateToVouchers() {
  console.log('🔧 Agregando columna dueDate a Vouchers...');
  
  try {
    // Verificar si la columna ya existe
    const [results] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'Vouchers' 
      AND column_name = 'dueDate'
    `);
    
    if (results.length > 0) {
      console.log('✅ La columna dueDate ya existe en Vouchers');
      return;
    }
    
    // Agregar la columna
    await sequelize.query(`
      ALTER TABLE "Vouchers" 
      ADD COLUMN "dueDate" TIMESTAMP WITH TIME ZONE
    `);
    
    // Establecer fecha de vencimiento por defecto (30 días desde creación)
    await sequelize.query(`
      UPDATE "Vouchers" 
      SET "dueDate" = "createdAt" + INTERVAL '30 days'
      WHERE "dueDate" IS NULL
    `);
    
    console.log('✅ Columna dueDate agregada exitosamente a Vouchers');
    console.log('✅ Fechas de vencimiento establecidas (30 días desde creación)');
    
  } catch (error) {
    console.error('❌ Error agregando columna dueDate:', error);
    throw error;
  }
}

if (require.main === module) {
  addDueDateToVouchers()
    .then(() => {
      console.log('🎉 Script completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error:', error);
      process.exit(1);
    });
}

module.exports = { addDueDateToVouchers };
