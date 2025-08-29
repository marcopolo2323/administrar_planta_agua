const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Client = require('./client.model');
const User = require('./user.model');

const Sale = sequelize.define('Sale', {
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
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  invoiceType: {
    type: DataTypes.ENUM('boleta', 'factura', 'vale'),
    allowNull: false,
    defaultValue: 'boleta'
  },
  invoiceNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pendiente', 'pagado', 'anulado'),
    defaultValue: 'pagado'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: true
});

// Relaciones
Sale.belongsTo(Client, { foreignKey: 'clientId' });
Sale.belongsTo(User, { foreignKey: 'userId', as: 'seller' });

module.exports = Sale;