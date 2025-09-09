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
    references: {
      model: 'Clients',
      key: 'id'
    }
  },
  planName: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Nombre del plan (ej: Plan 50 Bidones)'
  },
  totalBottles: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Total de bidones incluidos en el plan'
  },
  bonusBottles: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Bidones de bonificación (gratis)'
  },
  totalBottlesWithBonus: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Total de bidones incluyendo bonificaciones'
  },
  monthlyPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Precio mensual del plan'
  },
  pricePerBottle: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Precio por bidón (calculado)'
  },
  bottlesDelivered: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Bidones ya entregados'
  },
  bottlesRemaining: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Bidones restantes por entregar'
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'Fecha de inicio del plan'
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'Fecha de vencimiento del plan'
  },
  status: {
    type: DataTypes.ENUM('active', 'paused', 'completed', 'cancelled', 'expired'),
    allowNull: false,
    defaultValue: 'active'
  },
  maxDailyDelivery: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Máximo de bidones por día (opcional)'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Notas adicionales del plan'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  timestamps: true,
  tableName: 'Subscriptions'
});

module.exports = Subscription;
