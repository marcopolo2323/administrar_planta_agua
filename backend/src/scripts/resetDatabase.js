const { sequelize } = require('../models');
const initDatabase = require('./initDatabase');
// const migrateExcelClients = require('./migrateExcelClients');
const path = require('path');
 
const resetDatabase = async (excelFilePath = null) => {
  try {
    console.log('🚀 Iniciando reset completo de la base de datos...');
    console.log('================================================');
    
    // 1. Limpiar base de datos
    console.log('\n🧹 PASO 1: Limpiando base de datos...');
    const cleanDatabase = require('./cleanDatabase');
    await cleanDatabase();
    
    // 2. Inicializar con datos de prueba
    console.log('\n🌱 PASO 2: Inicializando con datos de prueba...');
    await initDatabase();
    
    // 3. Si se proporciona archivo Excel, migrar clientes
    if (excelFilePath) {
      console.log('\n📊 PASO 3: Migrando clientes desde Excel...');
      const fullPath = path.resolve(excelFilePath);
      await migrateExcelClients(fullPath);
    } else {
      console.log('\n📊 PASO 3: Saltando migración de Excel (no se proporcionó archivo)');
    }
    
    console.log('\n🎉 ¡Reset de base de datos completado!');
    console.log('================================================');
    console.log('✅ Base de datos limpia y lista para usar');
    console.log('✅ Datos de prueba cargados');
    if (excelFilePath) {
      console.log('✅ Clientes migrados desde Excel');
    }
    
    console.log('\n🔑 Credenciales de acceso:');
    console.log('   👨‍💼 Admin: admin / admin123');
    console.log('   👨‍💼 Vendedor: vendedor / vendedor123');
    console.log('   🚚 Repartidor: repartidor / repartidor123');
    console.log('   👤 Cliente: cliente1 / cliente123');
    
    console.log('\n📝 Próximos pasos:');
    console.log('   1. Iniciar el servidor: npm start');
    console.log('   2. Acceder a la aplicación web');
    console.log('   3. Verificar que todo funciona correctamente');
    
  } catch (error) {
    console.error('❌ Error durante el reset:', error);
    throw error;
  } finally {
    await sequelize.close();
    console.log('\n🔌 Conexión a la base de datos cerrada');
  }
};

// Ejecutar si se llama directamente
if (require.main === module) {
  const excelFilePath = process.argv[2];
  
  console.log('🔄 Reset de Base de Datos');
  console.log('========================');
  if (excelFilePath) {
    console.log(`📁 Archivo Excel: ${excelFilePath}`);
  } else {
    console.log('📁 Sin archivo Excel (solo datos de prueba)');
  }
  console.log('');
  
  resetDatabase(excelFilePath)
    .then(() => {
      console.log('\n🎊 ¡Reset completado exitosamente!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Error en el reset:', error);
      process.exit(1);
    });
}

module.exports = resetDatabase;
