const sequelize = require('../config/database');

async function fixForeignKeysCompletely() {
  console.log('🔧 Arreglando foreign keys completamente...');
  try {
    // 1. Eliminar todas las foreign keys problemáticas
    console.log('🗑️ Eliminando foreign keys existentes...');
    
    await sequelize.query(`
      ALTER TABLE "GuestOrderProducts" 
      DROP CONSTRAINT IF EXISTS "GuestOrderProducts_guestOrderId_fkey"
    `);
    
    await sequelize.query(`
      ALTER TABLE "GuestOrderProducts" 
      DROP CONSTRAINT IF EXISTS "GuestOrderProducts_productId_fkey"
    `);
    
    await sequelize.query(`
      ALTER TABLE "Vouchers" 
      DROP CONSTRAINT IF EXISTS "Vouchers_clientId_fkey"
    `);
    
    console.log('✅ Foreign keys eliminadas');

    // 2. Verificar que las tablas existen y tienen datos
    console.log('🔍 Verificando tablas...');
    
    const guestOrdersCount = await sequelize.query('SELECT COUNT(*) FROM "GuestOrders"');
    const productsCount = await sequelize.query('SELECT COUNT(*) FROM "Products"');
    const clientsCount = await sequelize.query('SELECT COUNT(*) FROM "Clients"');
    
    console.log('📊 Conteos:', {
      guestOrders: guestOrdersCount[0][0].count,
      products: productsCount[0][0].count,
      clients: clientsCount[0][0].count
    });

    // 3. Recrear foreign keys con las tablas correctas
    console.log('🔗 Recreando foreign keys...');
    
    // GuestOrderProducts -> GuestOrders
    await sequelize.query(`
      ALTER TABLE "GuestOrderProducts" 
      ADD CONSTRAINT "GuestOrderProducts_guestOrderId_fkey" 
      FOREIGN KEY ("guestOrderId") 
      REFERENCES "GuestOrders"("id") 
      ON DELETE CASCADE ON UPDATE CASCADE
    `);
    console.log('✅ GuestOrderProducts -> GuestOrders FK creada');
    
    // GuestOrderProducts -> Products
    await sequelize.query(`
      ALTER TABLE "GuestOrderProducts" 
      ADD CONSTRAINT "GuestOrderProducts_productId_fkey" 
      FOREIGN KEY ("productId") 
      REFERENCES "Products"("id") 
      ON DELETE CASCADE ON UPDATE CASCADE
    `);
    console.log('✅ GuestOrderProducts -> Products FK creada');
    
    // Vouchers -> Clients
    await sequelize.query(`
      ALTER TABLE "Vouchers" 
      ADD CONSTRAINT "Vouchers_clientId_fkey" 
      FOREIGN KEY ("clientId") 
      REFERENCES "Clients"("id") 
      ON DELETE CASCADE ON UPDATE CASCADE
    `);
    console.log('✅ Vouchers -> Clients FK creada');

    // 4. Verificar que las foreign keys funcionan
    console.log('🧪 Probando foreign keys...');
    
    try {
      // Crear un pedido de prueba
      const testOrder = await sequelize.query(`
        INSERT INTO "GuestOrders" (
          "customerName", "customerPhone", "deliveryAddress", "deliveryDistrict", 
          "paymentMethod", "paymentType", "totalAmount", "status", "createdAt", "updatedAt"
        ) VALUES (
          'Test Order', '123456789', 'Test Address', 'MANANTAY', 
          'cash', 'efectivo', 10.00, 'pending', NOW(), NOW()
        ) RETURNING id
      `);
      
      const orderId = testOrder[0][0].id;
      console.log('✅ Orden de prueba creada con ID:', orderId);
      
      // Crear un producto de prueba
      const testProduct = await sequelize.query(`
        INSERT INTO "GuestOrderProducts" (
          "guestOrderId", "productId", "quantity", "price", "subtotal", "createdAt", "updatedAt"
        ) VALUES (
          ${orderId}, 1, 1, 10.00, 10.00, NOW(), NOW()
        ) RETURNING id
      `);
      
      console.log('✅ Producto de prueba insertado con ID:', testProduct[0][0].id);
      
      // Limpiar datos de prueba
      await sequelize.query(`DELETE FROM "GuestOrderProducts" WHERE "guestOrderId" = ${orderId}`);
      await sequelize.query(`DELETE FROM "GuestOrders" WHERE "id" = ${orderId}`);
      console.log('🧹 Datos de prueba eliminados');
      
    } catch (testError) {
      console.error('❌ Error en prueba de foreign keys:', testError);
      throw testError;
    }

    console.log('✅ Foreign keys arregladas completamente');
    
  } catch (error) {
    console.error('❌ Error arreglando foreign keys:', error);
    throw error;
  }
}

module.exports = { fixForeignKeysCompletely };
