const sequelize = require('../config/database');
const User = require('./user.model');
const Product = require('./product.model');
const Client = require('./client.model');
const Sale = require('./sale.model');
const SaleDetail = require('./saleDetail.model');
const Inventory = require('./inventory.model');
const Purchase = require('./purchase.model');
const PurchaseDetail = require('./purchaseDetail.model');
const Credit = require('./credit.model');
const CreditPayment = require('./creditPayment.model');
const CashRegister = require('./cashRegister.model');
const CashMovement = require('./cashMovement.model');
const ElectronicInvoice = require('./electronicInvoice.model');

// Definir relaciones adicionales si es necesario
Sale.hasMany(SaleDetail, { foreignKey: 'saleId' });
Client.hasMany(Sale, { foreignKey: 'clientId' });
User.hasMany(Sale, { foreignKey: 'userId' });

// Relaciones de inventario
Product.hasMany(Inventory, { foreignKey: 'productId' });

// Relaciones de compras
Purchase.hasMany(PurchaseDetail, { foreignKey: 'purchaseId' });
Product.hasMany(PurchaseDetail, { foreignKey: 'productId' });

// Relaciones de créditos
Client.hasMany(Credit, { foreignKey: 'clientId' });
Sale.hasOne(Credit, { foreignKey: 'saleId' });
Credit.hasMany(CreditPayment, { foreignKey: 'creditId' });

// Relaciones de caja
CashRegister.hasMany(CashMovement, { foreignKey: 'cashRegisterId' });

// Relaciones de facturación electrónica
Sale.hasOne(ElectronicInvoice, { foreignKey: 'SaleId' });
ElectronicInvoice.belongsTo(Sale, { foreignKey: 'SaleId' });

// Exportar modelos y conexión
module.exports = {
  sequelize,
  User,
  Product,
  Client,
  Sale,
  SaleDetail,
  Inventory,
  Purchase,
  PurchaseDetail,
  Credit,
  CreditPayment,
  CashRegister,
  CashMovement,
  ElectronicInvoice
};