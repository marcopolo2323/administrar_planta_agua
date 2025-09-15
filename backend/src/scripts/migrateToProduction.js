const migrateCustomExcelClients = require('./migrateCustomExcelClients');

// Configuración para producción
process.env.NODE_ENV = 'production';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:tu_password@db.tu_proyecto.supabase.co:5432/postgres';

console.log('🚀 MIGRACIÓN A PRODUCCIÓN');
console.log('========================');
console.log('⚠️  ADVERTENCIA: Este script modificará la base de datos de PRODUCCIÓN');
console.log('📊 Base de datos:', process.env.DATABASE_URL ? 'Configurada' : 'NO CONFIGURADA');
console.log('');

// Verificar que se proporciona el archivo Excel
const excelFilePath = process.argv[2];

if (!excelFilePath) {
  console.log('❌ Uso: node migrateToProduction.js <ruta_del_archivo_excel>');
  console.log('📝 Ejemplo: node migrateToProduction.js ./db_clientes.xlsx');
  console.log('');
  console.log('📋 Pasos:');
  console.log('   1. Asegúrate de tener el archivo db_clientes.xlsx en el directorio backend');
  console.log('   2. Configura la variable DATABASE_URL con tu URL de Supabase');
  console.log('   3. Ejecuta el comando');
  process.exit(1);
}

// Confirmar antes de ejecutar
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('¿Estás seguro de que quieres migrar a PRODUCCIÓN? (escribe "SI" para confirmar): ', (answer) => {
  if (answer.toUpperCase() === 'SI') {
    console.log('🔄 Iniciando migración a producción...');
    
    migrateCustomExcelClients(excelFilePath)
      .then(() => {
        console.log('\n🎊 ¡Migración a producción completada exitosamente!');
        process.exit(0);
      })
      .catch((error) => {
        console.error('\n💥 Error en la migración a producción:', error);
        process.exit(1);
      });
  } else {
    console.log('❌ Migración cancelada');
    process.exit(0);
  }
  
  rl.close();
});
