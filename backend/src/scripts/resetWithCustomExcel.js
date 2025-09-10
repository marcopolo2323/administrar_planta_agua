const { sequelize } = require('../models');
const initDatabase = require('./initDatabase');
const migrateCustomExcelClients = require('./migrateCustomExcelClients');
const path = require('path');

const resetWithCustomExcel = async (excelFilePath = null) => {
  try {
    console.log('🚀 Iniciando reset completo con migración personalizada...');
    console.log('================================================');
    
    // 1. Inicializar con datos de prueba
    console.log('\n🌱 PASO 1: Inicializando con datos de prueba...');
    await initDatabase();
    
    // 2. Si se proporciona archivo Excel, migrar clientes
    if (excelFilePath) {
      console.log('\n📊 PASO 2: Migrando clientes desde Excel personalizado...');
      const fullPath = path.resolve(excelFilePath);
      await migrateCustomExcelClients(fullPath);
    } else {
      console.log('\n📊 PASO 2: Saltando migración de Excel (no se proporcionó archivo)');
    }
    
    console.log('\n🎉 ¡Reset con migración personalizada completado!');
    console.log('================================================');
    console.log('✅ Base de datos inicializada');
    console.log('✅ Datos de prueba cargados');
    if (excelFilePath) {
      console.log('✅ Clientes migrados desde Excel personalizado');
    }
    
    console.log('\n🔑 Credenciales de acceso del sistema:');
    console.log('   👨‍💼 Admin: admin / admin123');
    console.log('   👨‍💼 Vendedor: vendedor / vendedor123');
    console.log('   🚚 Repartidor: repartidor / repartidor123');
    console.log('   👤 Cliente: cliente1 / cliente123');
    
    console.log('\n📝 Próximos pasos:');
    console.log('   1. Iniciar el servidor: npm start');
    console.log('   2. Acceder a la aplicación web');
    console.log('   3. Verificar que los clientes se importaron correctamente');
    console.log('   4. Comunicar las credenciales a los clientes');
    
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
  
  console.log('🔄 Reset con Migración Personalizada');
  console.log('====================================');
  if (excelFilePath) {
    console.log(`📁 Archivo Excel: ${excelFilePath}`);
  } else {
    console.log('📁 Sin archivo Excel (solo datos de prueba)');
  }
  console.log('');
  
  resetWithCustomExcel(excelFilePath)
    .then(() => {
      console.log('\n🎊 ¡Reset con migración personalizada completado!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Error en el reset:', error);
      process.exit(1);
    });
}

module.exports = resetWithCustomExcel;
