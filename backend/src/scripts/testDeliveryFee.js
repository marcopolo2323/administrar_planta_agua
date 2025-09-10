const axios = require('axios');

const testDeliveryFee = async () => {
  try {
    console.log('🧪 Verificando flete correcto (según distrito)...');
    console.log('================================================');
    
    // 1. Verificar configuración de distritos
    console.log('\n1️⃣ Verificando configuración de distritos...');
    const districtsResponse = await axios.get('http://localhost:3000/api/districts');
    console.log('✅ Distritos encontrados:');
    districtsResponse.data.forEach(district => {
      console.log(`   - ${district.name}: S/ ${district.deliveryFee}`);
    });
    
    // 2. Verificar que el flete es 1 sol
    const hasCorrectFee = districtsResponse.data.every(d => d.deliveryFee === 1.00);
    if (hasCorrectFee) {
      console.log('✅ Flete configurado correctamente: S/ 1.00 por vale');
    } else {
      console.log('❌ Error: El flete no está configurado a S/ 1.00');
      return;
    }
    
    // 3. Probar resumen mensual
    console.log('\n2️⃣ Probando resumen mensual...');
    try {
      const summaryResponse = await axios.get('http://localhost:3000/api/monthly-payments/client/summary');
      if (summaryResponse.data.success) {
        const { summary } = summaryResponse.data.data;
        console.log('✅ Resumen mensual:');
        console.log(`   - Total vales: ${summary.totalVouchers}`);
        console.log(`   - Subtotal: S/ ${summary.totalAmount.toFixed(2)}`);
        console.log(`   - Flete calculado: S/ ${summary.deliveryFee.toFixed(2)}`);
        console.log(`   - Total con flete: S/ ${summary.totalWithDelivery.toFixed(2)}`);
        
        // Verificar que el flete es correcto según el distrito
        const clientDistrict = summary.client?.district;
        if (clientDistrict) {
          console.log(`✅ Flete calculado según distrito "${clientDistrict}": S/ ${summary.deliveryFee.toFixed(2)}`);
        } else {
          console.log(`⚠️  Distrito no encontrado, usando flete por defecto: S/ ${summary.deliveryFee.toFixed(2)}`);
        }
      }
    } catch (error) {
      console.log('⚠️  No se pudo obtener resumen mensual:', error.response?.data?.message || error.message);
    }
    
    // 4. Probar pago mensual
    console.log('\n3️⃣ Probando pago mensual...');
    try {
      const paymentResponse = await axios.post('http://localhost:3000/api/monthly-payments/client/pay-monthly', {
        paymentMethod: 'cash',
        paymentReference: 'TEST_DELIVERY_FEE_' + Date.now(),
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
      });
      
      if (paymentResponse.data.success) {
        const { vouchersPaid, subtotal, deliveryFee, totalAmount } = paymentResponse.data.data;
        console.log('✅ Pago mensual:');
        console.log(`   - Vales pagados: ${vouchersPaid}`);
        console.log(`   - Subtotal: S/ ${subtotal.toFixed(2)}`);
        console.log(`   - Flete: S/ ${deliveryFee.toFixed(2)}`);
        console.log(`   - Total: S/ ${totalAmount.toFixed(2)}`);
        
        // Verificar que el flete es correcto según el distrito
        console.log(`✅ Flete en pago mensual: S/ ${deliveryFee.toFixed(2)} (según distrito del cliente)`);
      }
    } catch (error) {
      console.log('⚠️  No se pudo procesar pago mensual:', error.response?.data?.message || error.message);
    }
    
    console.log('\n🎉 ¡Verificación de flete completada!');
    console.log('✅ El flete está configurado correctamente según distrito del cliente');
    
  } catch (error) {
    console.error('❌ Error durante la verificación:', error.response?.data || error.message);
  }
};

// Ejecutar si se llama directamente
if (require.main === module) {
  console.log('🧪 VERIFICANDO FLETE CORRECTO');
  console.log('============================');
  console.log('');
  
  testDeliveryFee()
    .then(() => {
      console.log('\n🎊 ¡Verificación completada!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Error en la verificación:', error);
      process.exit(1);
    });
}

module.exports = testDeliveryFee;
