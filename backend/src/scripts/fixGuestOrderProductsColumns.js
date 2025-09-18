const sequelize = require('../config/database');

async function fixGuestOrderProductsColumns() {
  console.log('🔧 Arreglando columnas de GuestOrderProducts...');
  try {
    // 1. Verificar estructura actual de la tabla
    console.log('🔍 Verificando estructura actual...');
    const currentColumns = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'GuestOrderProducts' 
      ORDER BY ordinal_position
    `);
    console.log('📋 Columnas actuales:', currentColumns[0]);

    // 2. Agregar columna createdAt si no existe
    const createdAtExists = currentColumns[0].find(col => col.column_name === 'createdAt');
    if (!createdAtExists) {
      console.log('➕ Agregando columna createdAt...');
      await sequelize.query(`
        ALTER TABLE "GuestOrderProducts" 
        ADD COLUMN "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      `);
      console.log('✅ Columna createdAt agregada');
    } else {
      console.log('✅ Columna createdAt ya existe');
    }

    // 3. Agregar columna updatedAt si no existe
    const updatedAtExists = currentColumns[0].find(col => col.column_name === 'updatedAt');
    if (!updatedAtExists) {
      console.log('➕ Agregando columna updatedAt...');
      await sequelize.query(`
        ALTER TABLE "GuestOrderProducts" 
        ADD COLUMN "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      `);
      console.log('✅ Columna updatedAt agregada');
    } else {
      console.log('✅ Columna updatedAt ya existe');
    }

    // 4. Verificar estructura final
    console.log('🔍 Verificando estructura final...');
    const finalColumns = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'GuestOrderProducts' 
      ORDER BY ordinal_position
    `);
    console.log('📋 Columnas finales:', finalColumns[0]);

    // 5. Probar inserción de prueba
    console.log('🧪 Probando inserción de prueba...');
    try {
      const testOrder = await sequelize.query(`
        INSERT INTO "GuestOrders" ("customerName", "customerPhone", "deliveryAddress", "deliveryDistrict", "paymentMethod", "paymentType", "totalAmount", "status", "createdAt", "updatedAt")
        VALUES ('Test Order 2', '123456789', 'Test Address', 'MANANTAY', 'cash', 'efectivo', 10.00, 'pending', NOW(), NOW())
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

    console.log('✅ GuestOrderProducts arreglado exitosamente');
    
  } catch (error) {
    console.error('❌ Error arreglando GuestOrderProducts:', error);
    throw error;
  }
}

module.exports = { fixGuestOrderProductsColumns };
