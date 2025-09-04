const sequelize = require('../config/database');

// Importar todos los modelos directamente (ya están inicializados)
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
const Order = require('./order.model');
const OrderDetail = require('./orderDetail.model');
const Payment = require('./payment.model');
const DeliveryPerson = require('./deliveryPerson.model');
const GuestOrder = require('./guestOrder.model');
const DeliveryFee = require('./deliveryFee.model');

// Definir relaciones después de que todos los modelos estén inicializados
// Relaciones de ventas
Sale.hasMany(SaleDetail, { foreignKey: 'saleId' });
SaleDetail.belongsTo(Sale, { foreignKey: 'saleId' });
SaleDetail.belongsTo(Product, { foreignKey: 'productId' });

Client.hasMany(Sale, { foreignKey: 'clientId' });
Sale.belongsTo(Client, { foreignKey: 'clientId' });

User.hasMany(Sale, { foreignKey: 'userId' });
Sale.belongsTo(User, { foreignKey: 'userId' });

// Relaciones de inventario
Product.hasMany(Inventory, { foreignKey: 'productId' });
Inventory.belongsTo(Product, { foreignKey: 'productId' });

// Relaciones de compras
Purchase.hasMany(PurchaseDetail, { foreignKey: 'purchaseId' });
PurchaseDetail.belongsTo(Purchase, { foreignKey: 'purchaseId' });

Product.hasMany(PurchaseDetail, { foreignKey: 'productId' });
PurchaseDetail.belongsTo(Product, { foreignKey: 'productId' });

// Relaciones de créditos
Client.hasMany(Credit, { foreignKey: 'clientId' });
Credit.belongsTo(Client, { foreignKey: 'clientId' });

Sale.hasOne(Credit, { foreignKey: 'saleId' });
Credit.belongsTo(Sale, { foreignKey: 'saleId' });

Credit.hasMany(CreditPayment, { foreignKey: 'creditId' });
CreditPayment.belongsTo(Credit, { foreignKey: 'creditId' });

// Relaciones de caja
CashRegister.hasMany(CashMovement, { foreignKey: 'cashRegisterId' });
CashMovement.belongsTo(CashRegister, { foreignKey: 'cashRegisterId' });

CashRegister.hasMany(Sale, { foreignKey: 'cashRegisterId', as: 'sales' });
Sale.belongsTo(CashRegister, { foreignKey: 'cashRegisterId' });

// Relaciones de facturación electrónica
Sale.hasOne(ElectronicInvoice, { foreignKey: 'saleId' });
ElectronicInvoice.belongsTo(Sale, { foreignKey: 'saleId' });

// Relaciones de pedidos
Order.hasMany(OrderDetail, { 
  foreignKey: 'orderId', 
  as: 'orderDetails' 
});
OrderDetail.belongsTo(Order, { foreignKey: 'orderId' });

// Relación entre OrderDetail y Product
OrderDetail.belongsTo(Product, { 
  foreignKey: 'productId', 
  as: 'product' 
});
Product.hasMany(OrderDetail, { 
  foreignKey: 'productId', 
  as: 'orderDetails' 
});

Client.hasMany(Order, { foreignKey: 'clientId' });
Order.belongsTo(Client, { foreignKey: 'clientId' });

User.hasMany(Order, { foreignKey: 'userId', as: 'createdOrders' });
Order.belongsTo(User, { foreignKey: 'userId', as: 'creator' });

// Relaciones de repartidores
DeliveryPerson.belongsTo(User, { foreignKey: 'userId' });
User.hasOne(DeliveryPerson, { foreignKey: 'userId' });

DeliveryPerson.hasMany(Order, { foreignKey: 'deliveryPersonId' });
Order.belongsTo(DeliveryPerson, { foreignKey: 'deliveryPersonId' });

// Relaciones de pagos
Order.hasOne(Payment, { foreignKey: 'orderId', as: 'payment' });
Payment.belongsTo(Order, { foreignKey: 'orderId' });

User.hasMany(Payment, { foreignKey: 'userId' });
Payment.belongsTo(User, { foreignKey: 'userId' });

// Relaciones de pedidos de invitados - ESTAS SON LAS QUE FALTABAN
Order.hasOne(GuestOrder, { 
  foreignKey: 'orderId', 
  as: 'guestOrder' 
});

GuestOrder.belongsTo(Order, { 
  foreignKey: 'orderId', 
  as: 'order' 
});

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
  ElectronicInvoice,
  Order,
  OrderDetail,
  Payment,
  DeliveryPerson,
  GuestOrder,
  DeliveryFee
};