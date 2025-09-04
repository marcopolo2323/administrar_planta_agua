const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      isDecimal: true,
      min: 0
    }
  },
  paymentMethod: {
    type: DataTypes.ENUM('efectivo', 'tarjeta', 'yape', 'transferencia', 'paypal', 'mercadopago', 'credito'),
    allowNull: false
  },
  documentType: {
    type: DataTypes.ENUM('boleta', 'factura'),
    allowNull: false,
    defaultValue: 'boleta'
  },
  invoiceData: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  paymentStatus: {
    type: DataTypes.ENUM('pendiente', 'procesando', 'completado', 'fallido', 'reembolsado'),
    allowNull: false,
    defaultValue: 'pendiente'
  },
  transactionId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  paymentDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  paymentDetails: {
    type: DataTypes.JSON,
    allowNull: true
  },
  errorMessage: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  documentPath: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Ruta al archivo PDF del documento (boleta o factura)'
  }
}, {
  timestamps: true
});

module.exports = Payment;