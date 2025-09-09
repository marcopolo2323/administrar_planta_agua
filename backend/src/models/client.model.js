const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Client = sequelize.define('Client', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  documentType: {
    type: DataTypes.ENUM('DNI', 'RUC'),
    allowNull: false
  },
  documentNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  address: {
    type: DataTypes.STRING,
    allowNull: true
  },
  district: {
    type: DataTypes.STRING,
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  isCompany: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  hasCredit: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  creditLimit: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0
  },
  currentDebt: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0
  },
  paymentDueDay: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 31
    }
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    // unique: true
  },
  defaultDeliveryAddress: {
    type: DataTypes.STRING,
    allowNull: true
  },
  defaultContactPhone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  clientStatus: {
    type: DataTypes.ENUM('activo', 'nuevo', 'inactivo', 'retomando'),
    allowNull: false,
    defaultValue: 'nuevo'
  },
  recommendations: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  lastOrderDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  totalOrders: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
}, {
  timestamps: true
});

module.exports = Client;