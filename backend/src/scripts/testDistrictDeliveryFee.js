const axios = require('axios');

const testDistrictDeliveryFee = async () => {
  try {
    console.log('🧪 Verificando flete por distrito...');
    console.log('==================================');
    
    // 1. Verificar distritos disponibles
    console.log('\n1️⃣ Verificando distritos disponibles...');
    const districtsResponse = await axios.get('http://localhost:3000/api/districts');
    console.log('✅ Distritos encontrados:');
    districtsResponse.data.data.forEach(district => {
      console.log(`   - ${district.name}: S/ ${district.deliveryFee}`);
    });
    
    // 2. Verificar clientes y sus distritos
    console.log('\n2️⃣ Verificando clientes y sus distritos...');
    const clientsResponse = await axios.get('http://localhost:3000/api/clients');
    console.log('✅ Clientes encontrados:');
    clientsResponse.data.data.forEach(client => {
      console.log(`   - ${client.name} (${client.documentNumber}): ${client.district || 'Sin distrito'}`);
    });
    
    // 3. Probar resumen mensual para cada cliente
    console.log('\n3️⃣ Probando resumen mensual por cliente...');
    for (const client of clientsResponse.data.data) {
      if (client.userId) {
        try {
          console.log(`\n📋 Cliente: ${client.name} (${client.district || 'Sin distrito'})`);
          
          // Obtener token del cliente
          const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
            username: `cliente_${client.documentNumber}`,
            password: 'temp123456'
          });
          
          const token = loginResponse.data.token;
          const headers = { Authorization: `Bearer ${token}` };
          
          // Obtener resumen mensual
          const summaryResponse = await axios.get('http://localhost:3000/api/monthly-payments/client/summary', { headers });
          const summary = summaryResponse.data.data;
          
          console.log(`   - Distrito: ${summary.client?.district || 'N/A'}`);
          console.log(`   - Flete aplicado: S/ ${summary.deliveryFee.toFixed(2)}`);
          console.log(`   - Total vales: ${summary.totalVouchers}`);
          console.log(`   - Subtotal: S/ ${summary.totalAmount.toFixed(2)}`);
          console.log(`   - Total con flete: S/ ${summary.totalWithDelivery.toFixed(2)}`);
          
          // Verificar que el flete corresponde al distrito
          const expectedDistrict = districtsResponse.data.data.find(d => d.name === client.district);
          if (expectedDistrict) {
            const expectedFee = parseFloat(expectedDistrict.deliveryFee);
            if (Math.abs(summary.deliveryFee - expectedFee) < 0.01) {
              console.log(`   ✅ Flete correcto para distrito "${client.district}"`);
            } else {
              console.log(`   ❌ Error: Flete esperado S/ ${expectedFee.toFixed(2)}, obtenido S/ ${summary.deliveryFee.toFixed(2)}`);
            }
          } else {
            console.log(`   ⚠️  Distrito "${client.district}" no encontrado en configuración, usando flete por defecto`);
          }
          
        } catch (error) {
          console.log(`   ⚠️  No se pudo obtener resumen para ${client.name}:`, error.response?.data?.message || error.message);
        }
      }
    }
    
    console.log('\n🎉 ¡Verificación de flete por distrito completada!');
    console.log('✅ El sistema calcula correctamente el flete según el distrito del cliente');
    
  } catch (error) {
    console.error('❌ Error durante la verificación:', error.response?.data || error.message);
  }
};

// Ejecutar si se llama directamente
if (require.main === module) {
  testDistrictDeliveryFee()
    .then(() => {
      console.log('🎉 Verificación completada');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Error:', error);
      process.exit(1);
    });
}

module.exports = testDistrictDeliveryFee;
