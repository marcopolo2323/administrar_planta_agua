const axios = require('axios');

// Datos de prueba
const testData = {
  orderData: {
    id: 'TEST-003',
    customerName: 'Carlos López',
    customerPhone: '987654321',
    customerEmail: 'carlos@test.com',
    deliveryAddress: 'Av. Test 789',
    deliveryDistrict: 'Lima',
    deliveryNotes: 'Casa roja',
    paymentMethod: 'Efectivo',
    orderDetails: [
      {
        product: { name: 'Bidón de Agua 20L' },
        productName: 'Bidón de Agua 20L',
        quantity: 2,
        unitPrice: 5.00,
        subtotal: 10.00
      },
      {
        product: { name: 'Paquete de Botellas 6 unidades' },
        productName: 'Paquete de Botellas 6 unidades',
        quantity: 1,
        unitPrice: 8.00,
        subtotal: 8.00
      }
    ],
    items: [
      {
        product: { name: 'Bidón de Agua 20L' },
        productName: 'Bidón de Agua 20L',
        quantity: 2,
        unitPrice: 5.00,
        subtotal: 10.00
      },
      {
        product: { name: 'Paquete de Botellas 6 unidades' },
        productName: 'Paquete de Botellas 6 unidades',
        quantity: 1,
        unitPrice: 8.00,
        subtotal: 8.00
      }
    ],
    subtotal: 18.00,
    deliveryFee: 2.00,
    total: 20.00,
    status: 'pendiente',
    createdAt: new Date().toISOString()
  },
  documentType: 'boleta'
};

async function testEndpoint() {
  try {
    console.log('Probando endpoint del backend...');
    
    const response = await axios.post('http://localhost:5000/api/guest-payments/generate-pdf', testData, {
      responseType: 'blob'
    });
    
    console.log('Respuesta del servidor:', {
      status: response.status,
      headers: response.headers,
      dataType: typeof response.data,
      dataLength: response.data.length
    });
    
    console.log('¡Endpoint funcionando correctamente!');
  } catch (error) {
    console.error('Error al probar endpoint:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testEndpoint();
