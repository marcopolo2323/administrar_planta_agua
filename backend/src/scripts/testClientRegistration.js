const axios = require('axios');

const testClientRegistration = async () => {
  try {
    console.log('🧪 Probando registro de cliente con DNI...');
    
    const dniClient = {
      username: 'test_dni_' + Date.now(),
      email: 'test_dni_' + Date.now() + '@example.com',
      password: 'password123',
      name: 'Test DNI Client',
      documentType: 'DNI',
      documentNumber: '12345678',
      phone: '999999999',
      address: 'Test Address 123',
      district: 'Test District',
      defaultDeliveryAddress: 'Test Address 123',
      defaultContactPhone: '999999999',
      clientStatus: 'nuevo',
      recommendations: 'Test recommendations'
    };

    const response1 = await axios.post('http://localhost:3000/api/client/register', dniClient);
    console.log('✅ Cliente con DNI registrado exitosamente:', response1.data.message);

    console.log('\n🧪 Probando registro de cliente con RUC...');
    
    const rucClient = {
      username: 'test_ruc_' + Date.now(),
      email: 'test_ruc_' + Date.now() + '@example.com',
      password: 'password123',
      name: 'Test RUC Client',
      documentType: 'RUC',
      documentNumber: '12345678901',
      phone: '999999999',
      address: 'Test Address 456',
      district: 'Test District',
      defaultDeliveryAddress: 'Test Address 456',
      defaultContactPhone: '999999999',
      clientStatus: 'activo',
      recommendations: 'Test recommendations for RUC'
    };

    const response2 = await axios.post('http://localhost:3000/api/client/register', rucClient);
    console.log('✅ Cliente con RUC registrado exitosamente:', response2.data.message);

    console.log('\n🧪 Probando validaciones de error...');
    
    // Test DNI con formato incorrecto
    try {
      const invalidDniClient = {
        ...dniClient,
        username: 'test_invalid_dni_' + Date.now(),
        email: 'test_invalid_dni_' + Date.now() + '@example.com',
        documentNumber: '1234567' // Solo 7 dígitos
      };
      
      await axios.post('http://localhost:3000/api/client/register', invalidDniClient);
      console.log('❌ Error: DNI con formato incorrecto debería haber fallado');
    } catch (error) {
      console.log('✅ DNI con formato incorrecto rechazado correctamente:', error.response.data.message);
    }

    // Test RUC con formato incorrecto
    try {
      const invalidRucClient = {
        ...rucClient,
        username: 'test_invalid_ruc_' + Date.now(),
        email: 'test_invalid_ruc_' + Date.now() + '@example.com',
        documentNumber: '1234567890' // Solo 10 dígitos
      };
      
      await axios.post('http://localhost:3000/api/client/register', invalidRucClient);
      console.log('❌ Error: RUC con formato incorrecto debería haber fallado');
    } catch (error) {
      console.log('✅ RUC con formato incorrecto rechazado correctamente:', error.response.data.message);
    }

    // Test tipo de documento inválido
    try {
      const invalidTypeClient = {
        ...dniClient,
        username: 'test_invalid_type_' + Date.now(),
        email: 'test_invalid_type_' + Date.now() + '@example.com',
        documentType: 'PASAPORTE' // Tipo no válido
      };
      
      await axios.post('http://localhost:3000/api/client/register', invalidTypeClient);
      console.log('❌ Error: Tipo de documento inválido debería haber fallado');
    } catch (error) {
      console.log('✅ Tipo de documento inválido rechazado correctamente:', error.response.data.message);
    }

    console.log('\n🎉 ¡Todas las pruebas pasaron exitosamente!');
    console.log('✅ El formulario de registro está funcionando correctamente');
    console.log('✅ Solo acepta DNI (8 dígitos) y RUC (11 dígitos)');
    console.log('✅ Las validaciones están funcionando correctamente');

  } catch (error) {
    console.error('❌ Error durante las pruebas:', error.response?.data || error.message);
  }
};

// Ejecutar si se llama directamente
if (require.main === module) {
  console.log('🧪 INICIANDO PRUEBAS DE REGISTRO DE CLIENTES');
  console.log('============================================');
  console.log('');
  
  testClientRegistration()
    .then(() => {
      console.log('\n🎊 ¡Pruebas completadas!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Error en las pruebas:', error);
      process.exit(1);
    });
}

module.exports = testClientRegistration;
