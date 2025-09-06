const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DeliveryPerson = sequelize.define('DeliveryPerson', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true
  },
  vehicleType: {
    type: DataTypes.ENUM('motorcycle', 'car', 'bicycle', 'truck'),
    allowNull: false,
    defaultValue: 'motorcycle'
  },
  vehiclePlate: {
    type: DataTypes.STRING,
    allowNull: false
  },
  licenseNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('available', 'busy', 'offline'),
    allowNull: false,
    defaultValue: 'available'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'delivery_persons',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
});

module.exports = DeliveryPerson;