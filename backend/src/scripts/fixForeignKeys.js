const sequelize = require('../config/database');

async function fixForeignKeys() {
  console.log('🔧 Arreglando foreign keys...');
  try {
    // Eliminar foreign key constraint si existe
    await sequelize.query(`
      ALTER TABLE "GuestOrderProducts" 
      DROP CONSTRAINT IF EXISTS "GuestOrderProducts_guestOrderId_fkey"
    `);
    
    // Recrear foreign key constraint
    await sequelize.query(`
      ALTER TABLE "GuestOrderProducts" 
      ADD CONSTRAINT "GuestOrderProducts_guestOrderId_fkey" 
      FOREIGN KEY ("guestOrderId") 
      REFERENCES "GuestOrders"("id") 
      ON DELETE CASCADE
    `);
    
    console.log('✅ Foreign key constraint recreada exitosamente');
    
    // Verificar que funciona
    const result = await sequelize.query(`
      SELECT 
        tc.constraint_name, 
        tc.table_name, 
        kcu.column_name, 
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name 
      FROM 
        information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY' 
        AND tc.table_name = 'GuestOrderProducts'
        AND kcu.column_name = 'guestOrderId'
    `);
    
    if (result[0].length > 0) {
      console.log('✅ Foreign key verificada:', result[0][0]);
    } else {
      console.log('❌ Foreign key no encontrada');
    }
    
  } catch (error) {
    console.error('❌ Error arreglando foreign keys:', error);
    throw error;
  }
}

module.exports = { fixForeignKeys };
