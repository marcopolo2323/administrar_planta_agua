const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ElectronicInvoice = sequelize.define('ElectronicInvoice', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  invoiceNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  invoiceDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  status: {
    type: DataTypes.ENUM('pendiente', 'enviada', 'aceptada', 'rechazada'),
    allowNull: false,
    defaultValue: 'pendiente'
  },
  xmlContent: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  pdfUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  responseCode: {
    type: DataTypes.STRING,
    allowNull: true
  },
  responseMessage: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  cufe: { // Código Único de Facturación Electrónica
    type: DataTypes.STRING,
    allowNull: true
  },
  qrCode: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  taxAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'electronic_invoices',
  timestamps: true
});

module.exports = ElectronicInvoice;