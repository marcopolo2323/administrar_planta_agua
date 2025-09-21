const { sequelize } = require('../models');

async function dropAllTables() {
  console.log('🗑️  ELIMINANDO TODAS LAS TABLAS DE LA BASE DE DATOS');
  console.log('==================================================');
  
  try {
    // 1. Mostrar todas las tablas existentes
    console.log('📋 Verificando tablas existentes...');
    const tables = await sequelize.getQueryInterface().showAllTables();
    console.log('📋 Tablas encontradas:', tables);
    
    if (tables.length === 0) {
      console.log('✅ No hay tablas para eliminar');
      return;
    }
    
    // 2. Desactivar foreign key constraints temporalmente
    console.log('🔧 Desactivando foreign key constraints...');
    await sequelize.query('SET foreign_key_checks = 0');
    
    // 3. Eliminar todas las tablas una por una
    console.log('🗑️  Eliminando tablas...');
    
    for (const table of tables) {
      try {
        console.log(`   - Eliminando tabla: ${table}`);
        await sequelize.getQueryInterface().dropTable(table);
        console.log(`   ✅ ${table} eliminada`);
      } catch (error) {
        console.log(`   ⚠️  Error eliminando ${table}:`, error.message);
        // Intentar con CASCADE
        try {
          await sequelize.query(`DROP TABLE IF EXISTS "${table}" CASCADE`);
          console.log(`   ✅ ${table} eliminada con CASCADE`);
        } catch (cascadeError) {
          console.log(`   ❌ No se pudo eliminar ${table}:`, cascadeError.message);
        }
      }
    }
    
    // 4. Reactivar foreign key constraints
    console.log('🔧 Reactivando foreign key constraints...');
    await sequelize.query('SET foreign_key_checks = 1');
    
    // 5. Verificar que todas las tablas fueron eliminadas
    console.log('🔍 Verificando eliminación...');
    const remainingTables = await sequelize.getQueryInterface().showAllTables();
    
    if (remainingTables.length === 0) {
      console.log('✅ TODAS LAS TABLAS ELIMINADAS EXITOSAMENTE');
    } else {
      console.log('⚠️  Tablas restantes:', remainingTables);
      
      // Intentar eliminar las restantes con SQL directo
      for (const table of remainingTables) {
        try {
          await sequelize.query(`DROP TABLE IF EXISTS "${table}" CASCADE`);
          console.log(`   ✅ ${table} eliminada con SQL directo`);
        } catch (error) {
          console.log(`   ❌ ${table} no se pudo eliminar:`, error.message);
        }
      }
    }
    
    console.log('🎉 PROCESO DE ELIMINACIÓN COMPLETADO');
    
  } catch (error) {
    console.error('❌ Error eliminando tablas:', error);
    throw error;
  }
}

// Para PostgreSQL (Supabase), usar una versión específica
async function dropAllTablesPostgreSQL() {
  console.log('🗑️  ELIMINANDO TODAS LAS TABLAS DE POSTGRESQL (SUPABASE)');
  console.log('======================================================');
  
  try {
    // 1. Obtener todas las tablas del esquema public
    console.log('📋 Obteniendo lista de tablas...');
    const result = await sequelize.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      AND tablename NOT LIKE 'pg_%'
      AND tablename NOT LIKE 'sql_%'
    `, { type: sequelize.QueryTypes.SELECT });
    
    const tables = result.map(row => row.tablename);
    console.log('📋 Tablas encontradas:', tables);
    
    if (tables.length === 0) {
      console.log('✅ No hay tablas para eliminar');
      return;
    }
    
    // 2. Eliminar todas las tablas con CASCADE
    console.log('🗑️  Eliminando tablas con CASCADE...');
    
    for (const table of tables) {
      try {
        console.log(`   - Eliminando tabla: ${table}`);
        await sequelize.query(`DROP TABLE IF EXISTS "${table}" CASCADE`);
        console.log(`   ✅ ${table} eliminada`);
      } catch (error) {
        console.log(`   ❌ Error eliminando ${table}:`, error.message);
      }
    }
    
    // 3. Verificar eliminación
    console.log('🔍 Verificando eliminación...');
    const remainingResult = await sequelize.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      AND tablename NOT LIKE 'pg_%'
      AND tablename NOT LIKE 'sql_%'
    `, { type: sequelize.QueryTypes.SELECT });
    
    const remainingTables = remainingResult.map(row => row.tablename);
    
    if (remainingTables.length === 0) {
      console.log('✅ TODAS LAS TABLAS ELIMINADAS EXITOSAMENTE');
    } else {
      console.log('⚠️  Tablas restantes:', remainingTables);
    }
    
    console.log('🎉 RESET DE BASE DE DATOS COMPLETADO');
    
  } catch (error) {
    console.error('❌ Error en reset de PostgreSQL:', error);
    throw error;
  }
}

if (require.main === module) {
  dropAllTablesPostgreSQL()
    .then(() => {
      console.log('🎉 Base de datos reseteada exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error reseteando base de datos:', error);
      process.exit(1);
    });
}

module.exports = { dropAllTables, dropAllTablesPostgreSQL };
