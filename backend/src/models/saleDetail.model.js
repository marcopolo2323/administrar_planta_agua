const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Sale = require('./sale.model');
const Product = require('./product.model');

const SaleDetail = sequelize.define('SaleDetail', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  unitPrice: {
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
SaleDetail.belongsTo(Sale, { foreignKey: 'saleId' });
SaleDetail.belongsTo(Product, { foreignKey: 'productId' });

module.exports = SaleDetail;