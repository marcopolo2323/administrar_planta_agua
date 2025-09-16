'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('GuestOrders', 'subscriptionId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'subscriptions',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('GuestOrders', 'subscriptionId');
  }
};
