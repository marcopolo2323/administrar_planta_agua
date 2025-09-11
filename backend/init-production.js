const { sequelize } = require('./src/models');
const fs = require('fs');
const path = require('path');

async function initProduction() {
  try {
    console.log('🚀 Inicializando base de datos en producción...');
    
    // Sincronizar modelos
    await sequelize.sync({ force: false });
    console.log('✅ Modelos sincronizados');
    
    // Ejecutar migración SQL si existe
    const migrationPath = path.join(__dirname, 'supabase-migration.sql');
    if (fs.existsSync(migrationPath)) {
      console.log('📄 Ejecutando migración SQL...');
      const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
      await sequelize.query(migrationSQL);
      console.log('✅ Migración SQL ejecutada');
    }
    
    console.log('🎉 Base de datos inicializada correctamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error inicializando base de datos:', error);
    process.exit(1);
  }
}

initProduction();
