const documentGeneratorService = require('./src/services/documentGenerator.service');

// Datos de prueba similares a los que envía el frontend
const testOrderData = {
  id: 'TEST-FINAL',
  customerName: 'Ana Martínez',
  customerPhone: '987654321',
  customerEmail: 'ana@test.com',
  deliveryAddress: 'Av. Test 999',
  deliveryDistrict: 'Lima',
  deliveryNotes: 'Casa amarilla',
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
};

async function testPDFGeneration() {
  try {
    console.log('Iniciando prueba final de generación de PDF...');
    console.log('Datos de prueba:', JSON.stringify(testOrderData, null, 2));
    
    const pdfPath = await documentGeneratorService.generateDocumentPDF(testOrderData, 'boleta');
    
    console.log('PDF generado exitosamente en:', pdfPath);
    console.log('Prueba completada correctamente');
  } catch (error) {
    console.error('Error en la prueba:', error);
  }
}

testPDFGeneration();
