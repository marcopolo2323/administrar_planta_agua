const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Client = require('./client.model');
const Sale = require('./sale.model');
const User = require('./user.model');

const Credit = sequelize.define('Credit', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  balance: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pendiente', 'pagado', 'vencido'),
    defaultValue: 'pendiente'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: true
});

// Relaciones
Credit.belongsTo(Client, { foreignKey: 'clientId' });
Credit.belongsTo(Sale, { foreignKey: 'saleId' });
Credit.belongsTo(User, { foreignKey: 'userId', as: 'registeredBy' });

module.exports = Credit;