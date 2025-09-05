const fs = require('fs');
const path = require('path');

// Función para corregir enums en el archivo seedDb.js
function fixEnumsInSeed() {
  const seedPath = path.join(__dirname, 'src', 'utils', 'seedDb.js');
  
  try {
    let content = fs.readFileSync(seedPath, 'utf8');
    let modified = false;

    // Correcciones para Sales
    // Sales permite: 'pendiente', 'pagado', 'anulado'
    content = content.replace(/status: 'completado'/g, "status: 'pagado'");
    modified = true;

    // Correcciones para Purchases  
    // Purchases permite: 'pendiente', 'completado', 'anulado'
    // Ya está correcto, no necesita cambios

    // Correcciones para Payments
    // Payments permite: 'pendiente', 'procesando', 'completado', 'fallido', 'reembolsado'
    content = content.replace(/paymentStatus: 'pagado'/g, "paymentStatus: 'completado'");
    modified = true;

    // Correcciones para Orders
    // Orders paymentStatus permite: 'pendiente', 'pagado', 'anulado'
    content = content.replace(/paymentStatus: 'completado'/g, "paymentStatus: 'pagado'");
    modified = true;

    if (modified) {
      fs.writeFileSync(seedPath, content);
      console.log('✅ Enums corregidos en seedDb.js');
      return true;
    }

    return false;
  } catch (error) {
    console.error('❌ Error corrigiendo enums:', error.message);
    return false;
  }
}

console.log('🔧 Corrigiendo valores de enum en seedDb.js...\n');

if (fixEnumsInSeed()) {
  console.log('🎉 Enums corregidos exitosamente!');
} else {
  console.log('ℹ️  No se encontraron enums para corregir');
}
