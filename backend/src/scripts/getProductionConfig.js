// Script para obtener la configuración de producción
console.log('🔍 CONFIGURACIÓN DE PRODUCCIÓN');
console.log('==============================');

console.log('\n📊 Variables de entorno actuales:');
console.log('NODE_ENV:', process.env.NODE_ENV || 'No definido');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Configurada' : 'NO CONFIGURADA');

if (process.env.DATABASE_URL) {
  console.log('\n✅ DATABASE_URL encontrada:');
  console.log(process.env.DATABASE_URL);
} else {
  console.log('\n❌ DATABASE_URL no encontrada');
  console.log('\n📋 Para configurar la migración a producción:');
  console.log('   1. Ve a tu proyecto en Supabase');
  console.log('   2. Ve a Settings > Database');
  console.log('   3. Copia la "Connection string"');
  console.log('   4. Ejecuta: export DATABASE_URL="tu_connection_string"');
  console.log('   5. Luego ejecuta: node migrateToProduction.js ./db_clientes.xlsx');
}

console.log('\n🔧 Comandos útiles:');
console.log('   - Ver configuración: node getProductionConfig.js');
console.log('   - Migrar clientes: node migrateToProduction.js ./db_clientes.xlsx');
console.log('   - Limpiar BD: node cleanDatabase.js');
