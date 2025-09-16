const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Subscription = sequelize.define('Subscription', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  clientId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'client_id'
  },
  clientDni: {
    type: DataTypes.STRING(20),
    allowNull: false,
    field: 'client_dni'
  },
  subscriptionType: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'subscription_type'
  },
  totalBottles: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'total_bottles'
  },
  remainingBottles: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'remaining_bottles'
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'total_amount'
  },
  paidAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    field: 'paid_amount'
  },
  status: {
    type: DataTypes.ENUM('active', 'completed', 'cancelled'),
    allowNull: false,
    defaultValue: 'active'
  },
  purchaseDate: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'purchase_date'
  },
  expiryDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'expiry_date'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'subscriptions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Subscription;