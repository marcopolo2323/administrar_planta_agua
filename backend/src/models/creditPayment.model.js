const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Credit = require('./credit.model');
const User = require('./user.model');

const CreditPayment = sequelize.define('CreditPayment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  paymentMethod: {
    type: DataTypes.ENUM('efectivo', 'transferencia', 'depósito'),
    defaultValue: 'efectivo'
  },
  paymentDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  reference: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Número de operación o referencia del pago'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: true
});

// Relaciones
CreditPayment.belongsTo(Credit, { foreignKey: 'creditId' });
CreditPayment.belongsTo(User, { foreignKey: 'userId', as: 'registeredBy' });

module.exports = CreditPayment;