const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Client = require('./client.model');
const User = require('./user.model');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  orderDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  deliveryDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pendiente', 'confirmado', 'en_preparacion', 'en_camino', 'entregado', 'cancelado'),
    defaultValue: 'pendiente'
  },
  paymentStatus: {
    type: DataTypes.ENUM('pendiente', 'pagado', 'reembolsado', 'credito'),
    defaultValue: 'pendiente'
  },
  paymentMethod: {
    type: DataTypes.ENUM('efectivo', 'tarjeta', 'yape', 'transferencia', 'credito'),
    defaultValue: 'efectivo'
  },
  paymentReference: {
    type: DataTypes.STRING,
    allowNull: true
  },
  documentType: {
    type: DataTypes.ENUM('boleta', 'factura'),
    defaultValue: 'boleta'
  },
  invoiceData: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  deliveryAddress: {
    type: DataTypes.STRING,
    allowNull: false
  },
  deliveryDistrict: {
    type: DataTypes.STRING,
    allowNull: false
  },
  contactPhone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  deliveryFee: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  isCredit: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  timestamps: true
});

// Las relaciones se establecen en models/index.js para evitar conflictos

module.exports = Order;