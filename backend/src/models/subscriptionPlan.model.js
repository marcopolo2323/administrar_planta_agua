const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SubscriptionPlan = sequelize.define('SubscriptionPlan', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Nombre del plan (ej: Plan 50 Bidones)'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Descripción del plan'
  },
  totalBottles: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Cantidad de bidones incluidos'
  },
  bonusBottles: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Bidones de bonificación'
  },
  monthlyPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Precio mensual del plan'
  },
  pricePerBottle: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Precio por bidón'
  },
  bonusPercentage: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0,
    comment: 'Porcentaje de bonificación'
  },
  maxDailyDelivery: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Máximo de bidones por día'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Orden de visualización'
  }
}, {
  timestamps: true,
  tableName: 'SubscriptionPlans',
  indexes: [
    {
      unique: true,
      fields: ['name']
    }
  ]
});

module.exports = SubscriptionPlan;
