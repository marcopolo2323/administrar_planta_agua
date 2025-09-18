const fs = require('fs');
const path = require('path');

// Leer el archivo JSON
const jsonPath = path.join(__dirname, 'data/clientes.json');
const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

console.log('🔍 Verificando mapeo de datos...\n');

// Verificar los primeros 3 clientes
for (let i = 0; i < 3; i++) {
  const cliente = jsonData[i];
  console.log(`📋 Cliente ${i + 1}:`);
  console.log(`   Nombre: "${cliente['NOMBRE COMPLETO O RAZON SOCIAL']}"`);
  console.log(`   DNI/RUC: "${cliente['DNI O RUC']}"`);
  console.log(`   Distrito: "${cliente['Distrito ']}"`);
  console.log(`   Dirección: "${cliente['VIVIENDA (JIRON, AVENIDA, AA.HH)']}"`);
  
  // Simular el mapeo
  const nombre = (cliente['NOMBRE COMPLETO O RAZON SOCIAL'] || '').trim();
  const documento = cliente['DNI O RUC'] ? String(cliente['DNI O RUC']) : '';
  const direccion = (cliente['VIVIENDA (JIRON, AVENIDA, AA.HH)'] || '').trim();
  const distrito = (cliente['Distrito '] || '').trim();
  
  console.log(`   → Mapeado:`);
  console.log(`     name: "${nombre}"`);
  console.log(`     documentNumber: "${documento}"`);
  console.log(`     address: "${direccion}"`);
  console.log(`     district: "${distrito}"`);
  console.log('');
}

console.log('✅ Verificación completada');
