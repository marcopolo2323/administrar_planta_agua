'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('subscriptions', 'created_at', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW
    });
    
    await queryInterface.addColumn('subscriptions', 'updated_at', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('subscriptions', 'created_at');
    await queryInterface.removeColumn('subscriptions', 'updated_at');
  }
};
