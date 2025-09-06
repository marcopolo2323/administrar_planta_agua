#!/usr/bin/env node

const seedDatabase = require('./src/utils/seedDb');

console.log('🚀 Iniciando proceso de seed...');
console.log('⚠️  ADVERTENCIA: Esto eliminará todos los datos existentes');
console.log('');

seedDatabase()
  .then(() => {
    console.log('✅ ¡Seed completado exitosamente!');
    console.log('');
    console.log('🎯 Puedes ahora:');
    console.log('   1. Iniciar el servidor: npm start');
    console.log('   2. Acceder al dashboard con: admin / admin123');
    console.log('   3. Probar el sistema completo');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error durante el seed:', error);
    process.exit(1);
  });
