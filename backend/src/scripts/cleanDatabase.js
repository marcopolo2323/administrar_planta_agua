const { sequelize } = require('../models');

const cleanDatabase = async () => {
  try {
    console.log('🧹 Limpiando base de datos...');
    console.log('================================');
    
    // Obtener todas las tablas
    const [tables] = await sequelize.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename NOT LIKE 'pg_%'
      AND tablename NOT LIKE 'sql_%'
    `);
    
    console.log(`📋 Encontradas ${tables.length} tablas:`);
    tables.forEach(table => {
      console.log(`   - ${table.tablename}`);
    });
    
    // Deshabilitar restricciones de clave foránea temporalmente
    console.log('\n🔓 Deshabilitando restricciones de clave foránea...');
    await sequelize.query('SET session_replication_role = replica;');
    
    // Eliminar todas las tablas
    console.log('\n🗑️ Eliminando tablas...');
    for (const table of tables) {
      try {
        await sequelize.query(`DROP TABLE IF EXISTS "${table.tablename}" CASCADE;`);
        console.log(`   ✅ ${table.tablename} eliminada`);
      } catch (error) {
        console.log(`   ⚠️ Error al eliminar ${table.tablename}: ${error.message}`);
      }
    }
    
    // Rehabilitar restricciones de clave foránea
    console.log('\n🔒 Rehabilitando restricciones de clave foránea...');
    await sequelize.query('SET session_replication_role = DEFAULT;');
    
    console.log('\n✅ Base de datos limpiada completamente');
    console.log('================================');
    console.log('💡 Ahora puedes ejecutar: node src/scripts/initDatabase.js');
    console.log('   para crear una base de datos completamente nueva');
    
  } catch (error) {
    console.error('❌ Error al limpiar la base de datos:', error);
    throw error;
  } finally {
    await sequelize.close();
    console.log('\n🔌 Conexión a la base de datos cerrada');
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
