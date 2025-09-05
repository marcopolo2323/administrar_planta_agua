const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CashMovement = sequelize.define('CashMovement', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  cashRegisterId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'CashRegisters',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.ENUM('ingreso', 'egreso', 'venta', 'gasto', 'retiro', 'deposito'),
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  description: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  reference: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  paymentMethod: {
    type: DataTypes.ENUM('efectivo', 'tarjeta', 'transferencia', 'yape', 'plin'),
    allowNull: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Orders',
      key: 'id'
    }
  },
  saleId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Sales',
      key: 'id'
    }
  }
}, {
  tableName: 'CashMovements',
  timestamps: true
});

module.exports = CashMovement;