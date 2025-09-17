'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Eliminar columnas innecesarias de la tabla Clients
    await queryInterface.removeColumn('Clients', 'isCompany');
    await queryInterface.removeColumn('Clients', 'hasCredit');
    await queryInterface.removeColumn('Clients', 'creditLimit');
    await queryInterface.removeColumn('Clients', 'currentDebt');
    await queryInterface.removeColumn('Clients', 'paymentDueDay');
    await queryInterface.removeColumn('Clients', 'userId');
    await queryInterface.removeColumn('Clients', 'defaultDeliveryAddress');
    await queryInterface.removeColumn('Clients', 'defaultContactPhone');
    await queryInterface.removeColumn('Clients', 'clientStatus');
    await queryInterface.removeColumn('Clients', 'recommendations');
  },

  async down (queryInterface, Sequelize) {
    // Restaurar columnas eliminadas
    await queryInterface.addColumn('Clients', 'isCompany', {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    });
    await queryInterface.addColumn('Clients', 'hasCredit', {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    });
    await queryInterface.addColumn('Clients', 'creditLimit', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0
    });
    await queryInterface.addColumn('Clients', 'currentDebt', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0
    });
    await queryInterface.addColumn('Clients', 'paymentDueDay', {
      type: Sequelize.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 31
      }
    });
    await queryInterface.addColumn('Clients', 'userId', {
      type: Sequelize.INTEGER,
      allowNull: true
    });
    await queryInterface.addColumn('Clients', 'defaultDeliveryAddress', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('Clients', 'defaultContactPhone', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('Clients', 'clientStatus', {
      type: Sequelize.ENUM('activo', 'nuevo', 'inactivo', 'retomando'),
      allowNull: false,
      defaultValue: 'nuevo'
    });
    await queryInterface.addColumn('Clients', 'recommendations', {
      type: Sequelize.TEXT,
      allowNull: true
    });
  }
};
