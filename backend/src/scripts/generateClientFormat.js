// Script para generar el formato correcto de clientes
// Copia y pega tus datos del Excel aquí y este script te dará el formato correcto

const sampleData = `
20/08/2025 12:15:37	yashichirusbel@gmail.com	Yashichirusbel@gmail.com	ANTIGUO / ACTIVO	Corporación YASHIMITSU sac 	20606719596	942658541	YARINACOCHA	Jr 2 de mayo 1150	MEJORAR EL SERVICIO DE DELIVERY MUY TARDE	Coordinen mejor el horario de entrega	NO	Sí
`;

function generateClientFormat() {
  console.log('🔄 Generando formato para clientes...');
  
  const lines = sampleData.trim().split('\n');
  
  lines.forEach((line, index) => {
    if (!line.trim()) return;
    
    const values = line.split('\t');
    
    // Mapear los valores según las columnas del Excel
    const clientData = {
      timestamp: values[0],
      email1: values[1],
      email2: values[2],
      clientType: values[3],
      name: values[4],
      document: values[5],
      phone: values[6],
      district: values[7],
      address: values[8],
      recommendation: values[9],
      personalRecommendation: values[10],
      payDelivery: values[11],
      authorizeContact: values[12]
    };

    // Generar el formato para la base de datos
    const dbFormat = {
      name: `'${clientData.name.trim()}'`,
      documentType: clientData.document.length === 11 ? "'DNI'" : "'RUC'",
      documentNumber: `'${clientData.document}'`,
      address: `'${clientData.address.trim()}'`,
      district: `'${clientData.district.trim()}'`,
      phone: `'${clientData.phone}'`,
      email: `'${clientData.email1 || clientData.email2}'`,
      isCompany: clientData.document.length > 11 ? 'true' : 'false',
      hasCredit: 'true',
      creditLimit: '100',
      active: 'true',
      clientStatus: mapClientStatus(clientData.clientType),
      recommendations: `'${clientData.recommendation}'`,
      notes: `'${clientData.personalRecommendation}'`,
      paymentDueDay: '30'
    };

    console.log(`\n// Cliente ${index + 1}:`);
    console.log('{');
    Object.entries(dbFormat).forEach(([key, value]) => {
      console.log(`  ${key}: ${value},`);
    });
    console.log('},');
  });
}

function mapClientStatus(clientType) {
  if (!clientType) return "'nuevo'";
  
  const type = clientType.toLowerCase();
  if (type.includes('antiguo') && type.includes('activo')) {
    return "'activo'";
  } else if (type.includes('nuevo')) {
    return "'nuevo'";
  } else if (type.includes('inactivo')) {
    return "'inactivo'";
  } else {
    return "'nuevo'";
  }
}

console.log('📋 FORMATO GENERADO PARA TUS CLIENTES:');
console.log('Copia y pega este formato en el archivo migrateAllClients.js\n');

generateClientFormat();

console.log('\n💡 INSTRUCCIONES:');
console.log('1. Copia todos tus datos del Excel');
console.log('2. Reemplaza la variable "sampleData" en este script');
console.log('3. Ejecuta: node src/scripts/generateClientFormat.js');
console.log('4. Copia el resultado en migrateAllClients.js');
console.log('5. Ejecuta: node src/scripts/migrateAllClients.js');
