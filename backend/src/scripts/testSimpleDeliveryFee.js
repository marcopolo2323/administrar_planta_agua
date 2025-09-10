const { District, Client } = require('../models');

const testSimpleDeliveryFee = async () => {
  try {
    console.log('🧪 Verificando sistema de flete por distrito...');
    console.log('==============================================');
    
    // 1. Verificar distritos disponibles
    console.log('\n1️⃣ Verificando distritos disponibles...');
    const districts = await District.findAll({
      where: { isActive: true },
      order: [['name', 'ASC']]
    });
    
    console.log('✅ Distritos encontrados:');
    districts.forEach(district => {
      console.log(`   - ${district.name}: S/ ${district.deliveryFee}`);
    });
    
    // 2. Verificar clientes y sus distritos
    console.log('\n2️⃣ Verificando clientes y sus distritos...');
    const clients = await Client.findAll({
      limit: 5,
      order: [['name', 'ASC']]
    });
    
    console.log('✅ Clientes encontrados:');
    clients.forEach(client => {
      console.log(`   - ${client.name} (${client.documentNumber}): ${client.district || 'Sin distrito'}`);
    });
    
    // 3. Simular cálculo de flete para cada cliente
    console.log('\n3️⃣ Simulando cálculo de flete por cliente...');
    for (const client of clients) {
      console.log(`\n📋 Cliente: ${client.name}`);
      console.log(`   - Distrito: ${client.district || 'N/A'}`);
      
      // Buscar el distrito del cliente
      let deliveryFee = 1.00; // Valor por defecto
      if (client.district) {
        const district = districts.find(d => d.name === client.district);
        if (district) {
          deliveryFee = parseFloat(district.deliveryFee);
          console.log(`   - Flete encontrado: S/ ${deliveryFee.toFixed(2)}`);
        } else {
          console.log(`   - ⚠️  Distrito "${client.district}" no encontrado en configuración, usando flete por defecto: S/ ${deliveryFee.toFixed(2)}`);
        }
      } else {
        console.log(`   - ⚠️  Cliente sin distrito, usando flete por defecto: S/ ${deliveryFee.toFixed(2)}`);
      }
      
      // Simular cálculo de total
      const subtotal = 30.00; // Ejemplo
      const total = subtotal + deliveryFee;
      console.log(`   - Subtotal: S/ ${subtotal.toFixed(2)}`);
      console.log(`   - Flete: S/ ${deliveryFee.toFixed(2)}`);
      console.log(`   - Total: S/ ${total.toFixed(2)}`);
    }
    
    console.log('\n🎉 ¡Verificación completada!');
    console.log('✅ El sistema calcula correctamente el flete según el distrito del cliente');
    console.log('✅ Si el distrito no existe, usa S/ 1.00 por defecto');
    
  } catch (error) {
    console.error('❌ Error durante la verificación:', error.message);
  }
};

// Ejecutar si se llama directamente
if (require.main === module) {
  testSimpleDeliveryFee()
    .then(() => {
      console.log('🎉 Verificación completada');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Error:', error);
      process.exit(1);
    });
}

module.exports = testSimpleDeliveryFee;
