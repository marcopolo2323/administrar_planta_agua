const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SubscriptionPlan = sequelize.define('SubscriptionPlan', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'name'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'description'
  },
  totalBottles: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'total_bottles'
  },
  bonusBottles: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'bonus_bottles'
  },
  monthlyPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'monthly_price'
  },
  pricePerBottle: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'price_per_bottle'
  },
  bonusPercentage: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0,
    field: 'bonus_percentage'
  },
  maxDailyDelivery: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    field: 'max_daily_delivery'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'is_active'
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'sort_order'
  }
}, {
  tableName: 'subscription_plans',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = SubscriptionPlan;
