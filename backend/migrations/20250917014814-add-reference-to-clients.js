'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Agregar columna reference a la tabla Clients
    await queryInterface.addColumn('Clients', 'reference', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  async down (queryInterface, Sequelize) {
    // Eliminar columna reference
    await queryInterface.removeColumn('Clients', 'reference');
  }
};
