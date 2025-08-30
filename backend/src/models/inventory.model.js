const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Product = require('./product.model');
const User = require('./user.model');

const Inventory = sequelize.define('Inventory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  type: {
    type: DataTypes.ENUM('entrada', 'salida', 'ajuste'),
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  previousStock: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  currentStock: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  unitCost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  totalCost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  reference: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Referencia al documento relacionado (compra, venta, ajuste)'
  },
  referenceId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'ID del documento relacionado'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: true
});

// Relaciones
Inventory.belongsTo(Product, { foreignKey: 'productId' });
Inventory.belongsTo(User, { foreignKey: 'userId', as: 'registeredBy' });

module.exports = Inventory;