const sequelize = require('../config/database');
const User = require('./user.model');
const Product = require('./product.model');
const Client = require('./client.model');
const Sale = require('./sale.model');
const SaleDetail = require('./saleDetail.model');

// Definir relaciones adicionales si es necesario
Sale.hasMany(SaleDetail, { foreignKey: 'saleId' });
Client.hasMany(Sale, { foreignKey: 'clientId' });
User.hasMany(Sale, { foreignKey: 'userId' });

// Exportar modelos y conexión
module.exports = {
  sequelize,
  User,
  Product,
  Client,
  Sale,
  SaleDetail
};