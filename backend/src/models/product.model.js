const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  type: {
    type: DataTypes.ENUM('botella', 'bidon'),
    allowNull: false
  },
  unitPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  wholesalePrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  wholesaleMinQuantity: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  // Precios de mayoreo adicionales
  wholesalePrice2: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Segundo nivel de precio de mayoreo'
  },
  wholesaleMinQuantity2: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Cantidad mínima para segundo nivel de mayoreo'
  },
  wholesalePrice3: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Tercer nivel de precio de mayoreo'
  },
  wholesaleMinQuantity3: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Cantidad mínima para tercer nivel de mayoreo'
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'URL de la imagen del producto'
  }
}, {
  timestamps: true
});

module.exports = Product;