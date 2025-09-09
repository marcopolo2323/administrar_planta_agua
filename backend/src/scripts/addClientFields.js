const { Client, sequelize } = require('../models');

async function addClientFields() {
  try {
    console.log('🔄 Agregando nuevos campos a la tabla de clientes...');

    // Verificar si las columnas ya existen
    const tableDescription = await sequelize.getQueryInterface().describeTable('Clients');
    
    if (!tableDescription.clientStatus) {
      console.log('➕ Agregando columna clientStatus...');
      await sequelize.getQueryInterface().addColumn('Clients', 'clientStatus', {
        type: sequelize.Sequelize.ENUM('activo', 'nuevo', 'inactivo', 'retomando'),
        allowNull: false,
        defaultValue: 'nuevo'
      });
    }

    if (!tableDescription.recommendations) {
      console.log('➕ Agregando columna recommendations...');
      await sequelize.getQueryInterface().addColumn('Clients', 'recommendations', {
        type: sequelize.Sequelize.TEXT,
        allowNull: true
      });
    }

    if (!tableDescription.lastOrderDate) {
      console.log('➕ Agregando columna lastOrderDate...');
      await sequelize.getQueryInterface().addColumn('Clients', 'lastOrderDate', {
        type: sequelize.Sequelize.DATE,
        allowNull: true
      });
    }

    if (!tableDescription.totalOrders) {
      console.log('➕ Agregando columna totalOrders...');
      await sequelize.getQueryInterface().addColumn('Clients', 'totalOrders', {
        type: sequelize.Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      });
    }

    console.log('✅ Campos agregados exitosamente!');
    
    // Actualizar clientes existentes
    console.log('🔄 Actualizando clientes existentes...');
    const clients = await Client.findAll();
    
    for (const client of clients) {
      // Si no tiene clientStatus, asignar 'activo' si está activo, 'inactivo' si no
      if (!client.clientStatus) {
        await client.update({
          clientStatus: client.active ? 'activo' : 'inactivo'
        });
      }
    }

    console.log(`✅ ${clients.length} clientes actualizados!`);
    console.log('🎉 Migración completada exitosamente!');

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar la migración
addClientFields();
