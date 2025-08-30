const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./user.model');

const Purchase = sequelize.define('Purchase', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  supplierName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  supplierDocument: {
    type: DataTypes.STRING,
    allowNull: true
  },
  invoiceNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pendiente', 'completado', 'anulado'),
    defaultValue: 'completado'
  },
  paymentMethod: {
    type: DataTypes.ENUM('efectivo', 'transferencia', 'crédito'),
    defaultValue: 'efectivo'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: true
});

// Relaciones
Purchase.belongsTo(User, { foreignKey: 'userId', as: 'registeredBy' });

module.exports = Purchase;