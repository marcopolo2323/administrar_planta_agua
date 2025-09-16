const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ClientPreference = sequelize.define('ClientPreference', {
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
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  preferredPaymentMethod: {
    type: DataTypes.ENUM('contraentrega', 'vale', 'suscripcion'),
    allowNull: true
  },
  subscriptionType: {
    type: DataTypes.ENUM('basic', 'premium', 'vip'),
    allowNull: true
  },
  subscriptionAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  subscriptionQuantity: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  bonusQuantity: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0
  },
  validUntil: {
    type: DataTypes.DATE,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'ClientPreferences',
  timestamps: true
});

module.exports = ClientPreference;
