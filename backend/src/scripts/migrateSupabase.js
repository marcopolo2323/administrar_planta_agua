const { sequelize } = require('../models');

const migrateSupabase = async () => {
  try {
    console.log('🔄 Iniciando migración de Supabase...');
    
    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conectado a Supabase');
    
    // Verificar si la columna reference existe
    const result = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'Clients' 
      AND column_name = 'reference'
    `, { type: sequelize.QueryTypes.SELECT });
    
    if (result.length === 0) {
      console.log('🔄 Agregando columna reference a la tabla Clients...');
      
      // Agregar la columna reference
      await sequelize.query(`
        ALTER TABLE "Clients" 
        ADD COLUMN "reference" VARCHAR(255)
      `);
      
      console.log('✅ Columna reference agregada exitosamente');
    } else {
      console.log('✅ Columna reference ya existe');
    }
    
    // Verificar otras columnas que puedan faltar
    const allColumns = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'Clients'
      ORDER BY column_name
    `, { type: sequelize.QueryTypes.SELECT });
    
    console.log('📋 Columnas actuales en la tabla Clients:');
    allColumns.forEach(col => console.log(`   - ${col.column_name}`));
    
    console.log('🎉 Migración completada exitosamente');
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    throw error;
  } finally {
    await sequelize.close();
    console.log('\n🔌 Conexión cerrada');
  }
};

// Ejecutar si se llama directamente
if (require.main === module) {
  migrateSupabase()
    .then(() => {
      console.log('\n🎊 ¡Migración completada!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Error en la migración:', error);
      process.exit(1);
    });
}

module.exports = migrateSupabase;
