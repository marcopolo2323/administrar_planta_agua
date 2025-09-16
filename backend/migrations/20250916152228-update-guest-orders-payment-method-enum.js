'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Actualizar el enum de paymentMethod para incluir los nuevos valores
    await queryInterface.changeColumn('GuestOrders', 'paymentMethod', {
      type: Sequelize.ENUM('cash', 'card', 'transfer', 'yape', 'plin', 'vale', 'suscripcion', 'contraentrega'),
      defaultValue: 'cash'
    });
  },

  async down (queryInterface, Sequelize) {
    // Revertir el enum de paymentMethod a los valores originales
    await queryInterface.changeColumn('GuestOrders', 'paymentMethod', {
      type: Sequelize.ENUM('cash', 'card', 'transfer', 'yape', 'plin'),
      defaultValue: 'cash'
    });
  }
};
