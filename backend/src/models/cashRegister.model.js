const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CashRegister = sequelize.define('CashRegister', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  openingDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  closingDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  openingAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  closingAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  expectedAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  difference: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('abierta', 'cerrada'),
    allowNull: false,
    defaultValue: 'abierta'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'CashRegisters',
  timestamps: true
});

module.exports = CashRegister;