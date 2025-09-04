const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Order = require('./order.model');

const GuestOrder = sequelize.define('GuestOrder', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  guestName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  guestPhone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  guestEmail: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true
  }
}, {
  timestamps: true
});

// Relación con Order
GuestOrder.belongsTo(Order, { foreignKey: 'orderId' });
Order.hasOne(GuestOrder, { foreignKey: 'orderId' });

module.exports = GuestOrder;