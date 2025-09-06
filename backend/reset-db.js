#!/usr/bin/env node

const { sequelize } = require('./src/models');
const mongoose = require('mongoose');

async function resetDatabase() {
  try {
    console.log('🗑️  Eliminando base de datos...');
    
    // Conectar a PostgreSQL
    await sequelize.authenticate();
    console.log('✅ Conectado a PostgreSQL');
    
    // Eliminar todas las tablas
    await sequelize.query('DROP SCHEMA public CASCADE');
    await sequelize.query('CREATE SCHEMA public');
    await sequelize.query('GRANT ALL ON SCHEMA public TO postgres');
    await sequelize.query('GRANT ALL ON SCHEMA public TO public');
    
    console.log('✅ Base de datos PostgreSQL eliminada');
    
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/punto_de_venta', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Conectado a MongoDB');
    
    // Eliminar colección de notificaciones
    await mongoose.connection.db.dropCollection('notifications');
    console.log('✅ Colección de notificaciones eliminada');
    
    console.log('🎉 Base de datos completamente eliminada');
    console.log('💡 Ahora puedes ejecutar: npm run seed');
    
  } catch (error) {
    console.error('❌ Error al eliminar base de datos:', error);
  } finally {
    await sequelize.close();
    await mongoose.connection.close();
    process.exit(0);
  }
}

resetDatabase();
