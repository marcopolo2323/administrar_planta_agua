const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const CashRegister = require('./cashRegister.model');
const User = require('./user.model');

const CashMovement = sequelize.define('CashMovement', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  type: {
    type: DataTypes.ENUM('ingreso', 'egreso'),
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  concept: {
    type: DataTypes.STRING,
    allowNull: false
  },
  reference: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Referencia al documento relacionado (venta, compra, etc.)'
  },
  referenceId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'ID del documento relacionado'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: true
});

// Relaciones
CashMovement.belongsTo(CashRegister, { foreignKey: 'cashRegisterId' });
CashMovement.belongsTo(User, { foreignKey: 'userId', as: 'registeredBy' });

module.exports = CashMovement;