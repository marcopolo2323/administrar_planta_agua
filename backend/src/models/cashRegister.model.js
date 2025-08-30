const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./user.model');

const CashRegister = sequelize.define('CashRegister', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
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
    defaultValue: 0
  },
  expectedAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  actualAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  difference: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('abierto', 'cerrado'),
    defaultValue: 'abierto'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: true
});

// Relaciones
CashRegister.belongsTo(User, { foreignKey: 'openedBy', as: 'openedByUser' });
CashRegister.belongsTo(User, { foreignKey: 'closedBy', as: 'closedByUser' });

module.exports = CashRegister;