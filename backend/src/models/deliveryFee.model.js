const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DeliveryFee = sequelize.define('DeliveryFee', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  district: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  fee: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  timestamps: true
});

module.exports = DeliveryFee;