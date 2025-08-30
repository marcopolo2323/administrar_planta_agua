const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Purchase = require('./purchase.model');
const Product = require('./product.model');

const PurchaseDetail = sequelize.define('PurchaseDetail', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  unitCost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  }
}, {
  timestamps: true
});

// Relaciones
PurchaseDetail.belongsTo(Purchase, { foreignKey: 'purchaseId' });
PurchaseDetail.belongsTo(Product, { foreignKey: 'productId' });

module.exports = PurchaseDetail;