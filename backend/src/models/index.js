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
const GuestOrderProduct = require('./guestOrderProduct.model');
const DeliveryFee = require('./deliveryFee.model');
const District = require('./district.model');
const Voucher = require('./voucher.model');

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
CashRegister.hasMany(CashMovement, { 
  foreignKey: 'cashRegisterId',
  as: 'CashMovements'
});
CashMovement.belongsTo(CashRegister, { 
  foreignKey: 'cashRegisterId',
  as: 'CashRegister'
});

// Relaciones de usuario con caja
User.hasMany(CashRegister, { foreignKey: 'userId' });
CashRegister.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(CashMovement, { foreignKey: 'userId' });
CashMovement.belongsTo(User, { foreignKey: 'userId' });

// Relaciones entre User y Client
User.hasOne(Client, { foreignKey: 'userId', as: 'Client' });
Client.belongsTo(User, { foreignKey: 'userId', as: 'User' });

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

// Relación directa entre Order y User para repartidor
User.hasMany(Order, { foreignKey: 'deliveryPersonId', as: 'assignedOrders' });
Order.belongsTo(User, { foreignKey: 'deliveryPersonId', as: 'deliveryPerson' });

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

// Relaciones de pedidos de invitados
GuestOrder.hasMany(GuestOrderProduct, { 
  foreignKey: 'guestOrderId', 
  as: 'products' 
});
GuestOrderProduct.belongsTo(GuestOrder, { 
  foreignKey: 'guestOrderId', 
  as: 'guestOrder' 
});

// Relación con repartidor para pedidos de invitados
GuestOrder.belongsTo(User, { 
  foreignKey: 'deliveryPersonId', 
  as: 'DeliveryPerson' 
});
User.hasMany(GuestOrder, { 
  foreignKey: 'deliveryPersonId', 
  as: 'GuestOrders' 
});
GuestOrderProduct.belongsTo(Product, { 
  foreignKey: 'productId', 
  as: 'product' 
});

// Relaciones de vales
Client.hasMany(Voucher, { foreignKey: 'clientId', as: 'Vouchers' });
Voucher.belongsTo(Client, { foreignKey: 'clientId', as: 'Client' });

User.hasMany(Voucher, { foreignKey: 'deliveryPersonId', as: 'deliveryVouchers' });
Voucher.belongsTo(User, { foreignKey: 'deliveryPersonId', as: 'deliveryPerson' });

Product.hasMany(Voucher, { foreignKey: 'productId', as: 'vouchers' });
Voucher.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// Relación entre Voucher y Order
Order.hasMany(Voucher, { foreignKey: 'orderId', as: 'vouchers' });
Voucher.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

// Relaciones de GuestOrder con District y User (deliveryPerson)
GuestOrder.belongsTo(District, { foreignKey: 'districtId', as: 'district' });
District.hasMany(GuestOrder, { foreignKey: 'districtId', as: 'guestOrders' });

GuestOrder.belongsTo(User, { foreignKey: 'deliveryPersonId', as: 'deliveryPerson' });
User.hasMany(GuestOrder, { foreignKey: 'deliveryPersonId', as: 'assignedGuestOrders' });


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
  GuestOrderProduct,
  DeliveryFee,
  District,
  Voucher
};