const sequelize = require('../config/database');

async function updateOrderEnum() {
  try {
    console.log('Iniciando actualización del enum paymentMethod en la tabla Orders...');
    
    // Ejecutar SQL directo para modificar el tipo enum
    await sequelize.query(`
      ALTER TYPE "enum_Orders_paymentMethod" ADD VALUE 'credito';
    `);
    
    console.log('Enum paymentMethod actualizado correctamente');
  } catch (error) {
    console.error('Error al actualizar el enum paymentMethod:', error);
  } finally {
    process.exit(0);
  }
}

updateOrderEnum();