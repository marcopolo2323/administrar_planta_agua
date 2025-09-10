const { sequelize } = require('../models');

const cleanDatabase = async () => {
  try {
    console.log('🧹 Iniciando limpieza completa de la base de datos...');
    console.log('================================================');
    
    // Obtener todas las tablas
    const [tables] = await sequelize.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename NOT LIKE 'pg_%'
      AND tablename NOT LIKE 'sql_%'
    `);
    
    console.log(`📋 Encontradas ${tables.length} tablas para limpiar`);
    
    // Deshabilitar triggers de foreign key temporalmente
    await sequelize.query('SET session_replication_role = replica;');
    
    // Limpiar cada tabla
    for (const table of tables) {
      const tableName = table.tablename;
      console.log(`🗑️ Limpiando tabla: ${tableName}`);
      await sequelize.query(`TRUNCATE TABLE "${tableName}" RESTART IDENTITY CASCADE;`);
    }
    
    // Rehabilitar triggers de foreign key
    await sequelize.query('SET session_replication_role = DEFAULT;');
    
    console.log('\n✅ ¡Base de datos limpiada completamente!');
    console.log('================================================');
    console.log('📊 Tablas limpiadas:');
    tables.forEach(table => console.log(`   - ${table.tablename}`));
    
    console.log('\n⚠️ IMPORTANTE:');
    console.log('   - Todos los datos han sido eliminados');
    console.log('   - Los IDs se reiniciarán desde 1');
    console.log('   - Las tablas están vacías pero la estructura se mantiene');
    
    console.log('\n📝 Próximos pasos:');
    console.log('   1. Ejecutar: node initDatabase.js (para datos de prueba)');
    console.log('   2. O ejecutar: node migrateExcelClients.js <archivo.xlsx> (para migrar desde Excel)');
    
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error);
    throw error;
  }
};

// Ejecutar si se llama directamente
if (require.main === module) {
  cleanDatabase()
    .then(() => {
      console.log('\n🎊 ¡Limpieza completada exitosamente!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Error en la limpieza:', error);
      process.exit(1);
    });
}

module.exports = cleanDatabase;