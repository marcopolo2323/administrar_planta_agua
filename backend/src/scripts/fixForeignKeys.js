const sequelize = require('../config/database');

async function fixForeignKeys() {
  console.log('🔧 Arreglando foreign keys...');
  try {
    // 1. Verificar que las tablas existen
    console.log('🔍 Verificando estructura de tablas...');
    
    const guestOrdersTable = await sequelize.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'GuestOrders' 
      ORDER BY ordinal_position
    `);
    console.log('📋 GuestOrders columns:', guestOrdersTable[0]);
    
    const guestOrderProductsTable = await sequelize.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'GuestOrderProducts' 
      ORDER BY ordinal_position
    `);
    console.log('📋 GuestOrderProducts columns:', guestOrderProductsTable[0]);
    
    // 2. Eliminar foreign key constraint si existe
    console.log('🗑️ Eliminando constraint existente...');
    await sequelize.query(`
      ALTER TABLE "GuestOrderProducts" 
      DROP CONSTRAINT IF EXISTS "GuestOrderProducts_guestOrderId_fkey"
    `);
    
    // 3. Recrear foreign key constraint
    console.log('🔗 Recreando foreign key constraint...');
    await sequelize.query(`
      ALTER TABLE "GuestOrderProducts" 
      ADD CONSTRAINT "GuestOrderProducts_guestOrderId_fkey" 
      FOREIGN KEY ("guestOrderId") 
      REFERENCES "GuestOrders"("id") 
      ON DELETE CASCADE
    `);
    
    console.log('✅ Foreign key constraint recreada exitosamente');
    
    // 4. Verificar que funciona
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
    
    // 5. Probar insertar un registro de prueba
    console.log('🧪 Probando inserción de prueba...');
    try {
      const testOrder = await sequelize.query(`
        INSERT INTO "GuestOrders" ("customerName", "customerPhone", "deliveryAddress", "deliveryDistrict", "paymentMethod", "paymentType", "totalAmount", "status", "createdAt", "updatedAt")
        VALUES ('Test Order', '123456789', 'Test Address', 'MANANTAY', 'cash', 'efectivo', 10.00, 'pending', NOW(), NOW())
        RETURNING id
      `);
      
      const orderId = testOrder[0][0].id;
      console.log('✅ Orden de prueba creada con ID:', orderId);
      
      const testProduct = await sequelize.query(`
        INSERT INTO "GuestOrderProducts" ("guestOrderId", "productId", "quantity", "price", "subtotal", "createdAt", "updatedAt")
        VALUES (${orderId}, 1, 1, 10.00, 10.00, NOW(), NOW())
        RETURNING id
      `);
      
      console.log('✅ Producto de prueba insertado con ID:', testProduct[0][0].id);
      
      // Limpiar datos de prueba
      await sequelize.query(`DELETE FROM "GuestOrderProducts" WHERE "guestOrderId" = ${orderId}`);
      await sequelize.query(`DELETE FROM "GuestOrders" WHERE "id" = ${orderId}`);
      console.log('🧹 Datos de prueba eliminados');
      
    } catch (testError) {
      console.error('❌ Error en prueba de inserción:', testError);
      throw testError;
    }
    
  } catch (error) {
    console.error('❌ Error arreglando foreign keys:', error);
    throw error;
  }
}

module.exports = { fixForeignKeys };
