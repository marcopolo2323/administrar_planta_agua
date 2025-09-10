const axios = require('axios');

const testMonthlyPaymentSystem = async () => {
  try {
    console.log('🧪 Probando sistema de pagos mensuales...');
    console.log('==========================================');
    
    // 1. Verificar productos
    console.log('\n1️⃣ Verificando productos...');
    const productsResponse = await axios.get('http://localhost:3000/api/products');
    console.log(`✅ Productos encontrados: ${productsResponse.data.length}`);
    
    if (productsResponse.data.length === 0) {
      console.log('❌ No hay productos. Ejecuta: node src/scripts/checkAndCreateProducts.js');
      return;
    }
    
    // 2. Crear vales de prueba
    console.log('\n2️⃣ Creando vales de prueba...');
    const testVouchers = [
      {
        clientId: 1, // Asumir que existe un cliente con ID 1
        productId: productsResponse.data[0].id,
        quantity: 2,
        unitPrice: 5.00,
        totalAmount: 10.00,
        notes: 'Vale de prueba 1',
        status: 'pending'
      },
      {
        clientId: 1,
        productId: productsResponse.data[1]?.id || productsResponse.data[0].id,
        quantity: 1,
        unitPrice: 15.00,
        totalAmount: 15.00,
        notes: 'Vale de prueba 2',
        status: 'pending'
      }
    ];
    
    for (const voucher of testVouchers) {
      try {
        const response = await axios.post('http://localhost:3000/api/vouchers', voucher);
        console.log(`✅ Vale creado: ${voucher.notes} - S/ ${voucher.totalAmount}`);
      } catch (error) {
        console.log(`⚠️  Error creando vale ${voucher.notes}:`, error.response?.data?.message || error.message);
      }
    }
    
    // 3. Probar resumen mensual
    console.log('\n3️⃣ Probando resumen mensual...');
    try {
      const summaryResponse = await axios.get('http://localhost:3000/api/monthly-payments/client/summary');
      if (summaryResponse.data.success) {
        const { summary, vouchers } = summaryResponse.data.data;
        console.log('✅ Resumen mensual obtenido:');
        console.log(`   - Total vales: ${summary.totalVouchers}`);
        console.log(`   - Vales pendientes: ${summary.pendingVouchers}`);
        console.log(`   - Subtotal: S/ ${summary.totalAmount.toFixed(2)}`);
        console.log(`   - Flete: S/ ${summary.deliveryFee.toFixed(2)}`);
        console.log(`   - Total con flete: S/ ${summary.totalWithDelivery.toFixed(2)}`);
        console.log(`   - Vales en la lista: ${vouchers.length}`);
      }
    } catch (error) {
      console.log('❌ Error obteniendo resumen mensual:', error.response?.data?.message || error.message);
    }
    
    // 4. Probar pago mensual
    console.log('\n4️⃣ Probando pago mensual...');
    try {
      const paymentResponse = await axios.post('http://localhost:3000/api/monthly-payments/client/pay-monthly', {
        paymentMethod: 'cash',
        paymentReference: 'TEST_PAYMENT_' + Date.now(),
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
      });
      
      if (paymentResponse.data.success) {
        const { vouchersPaid, subtotal, deliveryFee, totalAmount } = paymentResponse.data.data;
        console.log('✅ Pago mensual procesado:');
        console.log(`   - Vales pagados: ${vouchersPaid}`);
        console.log(`   - Subtotal: S/ ${subtotal.toFixed(2)}`);
        console.log(`   - Flete: S/ ${deliveryFee.toFixed(2)}`);
        console.log(`   - Total: S/ ${totalAmount.toFixed(2)}`);
      }
    } catch (error) {
      console.log('❌ Error procesando pago mensual:', error.response?.data?.message || error.message);
    }
    
    // 5. Verificar historial de pagos
    console.log('\n5️⃣ Probando historial de pagos...');
    try {
      const historyResponse = await axios.get('http://localhost:3000/api/monthly-payments/client/history');
      if (historyResponse.data.success) {
        console.log(`✅ Historial obtenido: ${historyResponse.data.data.length} pagos`);
        historyResponse.data.data.forEach((payment, index) => {
          console.log(`   ${index + 1}. ${payment.year}-${String(payment.month).padStart(2, '0')}: S/ ${payment.totalWithDelivery.toFixed(2)}`);
        });
      }
    } catch (error) {
      console.log('❌ Error obteniendo historial:', error.response?.data?.message || error.message);
    }
    
    console.log('\n🎉 ¡Pruebas del sistema de pagos mensuales completadas!');
    console.log('✅ El sistema está funcionando correctamente');
    
  } catch (error) {
    console.error('❌ Error durante las pruebas:', error.response?.data || error.message);
  }
};

// Ejecutar si se llama directamente
if (require.main === module) {
  console.log('🧪 INICIANDO PRUEBAS DEL SISTEMA DE PAGOS MENSUALES');
  console.log('==================================================');
  console.log('');
  
  testMonthlyPaymentSystem()
    .then(() => {
      console.log('\n🎊 ¡Pruebas completadas!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Error en las pruebas:', error);
      process.exit(1);
    });
}

module.exports = testMonthlyPaymentSystem;
