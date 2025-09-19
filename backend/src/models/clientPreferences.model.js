const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ClientPreferences = sequelize.define('ClientPreferences', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  clientId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Clients',
      key: 'id'
    }
  },
  dni: {
    type: DataTypes.STRING,
    allowNull: false,
    index: true
  },
  preferredPaymentMethod: {
    type: DataTypes.ENUM('contraentrega', 'vale', 'suscripcion'),
    allowNull: false
  },
  subscriptionPlanId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Subscriptions',
      key: 'id'
    }
  },
  subscriptionAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  subscriptionQuantity: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  validUntil: {
    type: DataTypes.DATE,
    allowNull: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'ClientPreferences',
  timestamps: true,
  indexes: [
    {
      fields: ['dni']
    },
    {
      fields: ['clientId']
    },
    {
      fields: ['validUntil']
    }
  ]
});

module.exports = ClientPreferences;
