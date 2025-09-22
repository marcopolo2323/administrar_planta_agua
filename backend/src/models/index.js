const sequelize = require('../config/database');

// Importar todos los modelos directamente (ya están inicializados)
const User = require('./user.model');
const Product = require('./product.model');
const Client = require('./client.model');
const DeliveryPerson = require('./deliveryPerson.model');
const GuestOrder = require('./guestOrder.model');
const GuestOrderProduct = require('./guestOrderProduct.model');
const DeliveryFee = require('./deliveryFee.model');
const District = require('./district.model');
const Voucher = require('./voucher.model');
const Vale = require('./vale.model');
const Subscription = require('./subscription.model');
const SubscriptionPlan = require('./subscriptionPlan.model');
const ClientPreferences = require('./clientPreferences.model');
const TermsAndConditions = require('./termsAndConditions.model');

// Definir relaciones después de que todos los modelos estén inicializados
// Relaciones entre User y Client (comentadas - userId eliminado del modelo Client)
// User.hasOne(Client, { foreignKey: 'userId', as: 'Client' });
// Client.belongsTo(User, { foreignKey: 'userId', as: 'User' });

// Relaciones de repartidores
DeliveryPerson.belongsTo(User, { foreignKey: 'userId' });
User.hasOne(DeliveryPerson, { foreignKey: 'userId' });

// Relaciones de pedidos de invitados
GuestOrder.hasMany(GuestOrderProduct, { 
  foreignKey: 'guestOrderId', 
  as: 'orderProducts' 
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

// Relación many-to-many entre GuestOrder y Product a través de GuestOrderProduct
GuestOrder.belongsToMany(Product, { 
  through: GuestOrderProduct, 
  foreignKey: 'guestOrderId', 
  otherKey: 'productId',
  as: 'products' 
});
Product.belongsToMany(GuestOrder, { 
  through: GuestOrderProduct, 
  foreignKey: 'productId', 
  otherKey: 'guestOrderId',
  as: 'guestOrders' 
});

// Relaciones de GuestOrder con Client
Client.hasMany(GuestOrder, { foreignKey: 'clientId', as: 'guestOrders' });
GuestOrder.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });

// Relaciones de vales
Client.hasMany(Voucher, { foreignKey: 'clientId', as: 'vouchers' });
Voucher.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });

User.hasMany(Voucher, { foreignKey: 'deliveryPersonId', as: 'deliveryVouchers' });

// Relaciones de vales de crédito
Client.hasMany(Vale, { foreignKey: 'clientId', as: 'vales' });
Vale.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });

Voucher.belongsTo(User, { foreignKey: 'deliveryPersonId', as: 'deliveryPerson' });

Product.hasMany(Voucher, { foreignKey: 'productId', as: 'vouchers' });
Voucher.belongsTo(Product, { foreignKey: 'productId', as: 'product' });


// Relaciones de GuestOrder con District y User (deliveryPerson)
GuestOrder.belongsTo(District, { foreignKey: 'districtId', as: 'district' });
District.hasMany(GuestOrder, { foreignKey: 'districtId', as: 'guestOrders' });

GuestOrder.belongsTo(User, { foreignKey: 'deliveryPersonId', as: 'deliveryPerson' });
User.hasMany(GuestOrder, { foreignKey: 'deliveryPersonId', as: 'assignedGuestOrders' });

// Relaciones de pedidos regulares (si existen)
// Client.hasMany(Order, { foreignKey: 'clientId', as: 'orders' });
// Order.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });

// Relaciones de suscripciones
Client.hasMany(Subscription, { foreignKey: 'clientId', as: 'subscriptions' });
Subscription.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });


// Relaciones de GuestOrder con Subscription
GuestOrder.belongsTo(Subscription, { foreignKey: 'subscriptionId', as: 'subscription' });
Subscription.hasMany(GuestOrder, { foreignKey: 'subscriptionId', as: 'orders' });

// Relaciones de ClientPreferences
Client.hasMany(ClientPreferences, { foreignKey: 'clientId', as: 'preferences' });
ClientPreferences.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });

ClientPreferences.belongsTo(Subscription, { foreignKey: 'subscriptionPlanId', as: 'subscription' });
Subscription.hasMany(ClientPreferences, { foreignKey: 'subscriptionPlanId', as: 'preferences' });

// Relaciones de términos y condiciones
User.hasMany(TermsAndConditions, { foreignKey: 'createdBy', as: 'createdTerms' });
TermsAndConditions.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

User.hasMany(TermsAndConditions, { foreignKey: 'lastModifiedBy', as: 'modifiedTerms' });
TermsAndConditions.belongsTo(User, { foreignKey: 'lastModifiedBy', as: 'lastModifier' });


// Exportar modelos y conexión
module.exports = {
  sequelize,
  User,
  Product,
  Client,
  DeliveryPerson,
  GuestOrder,
  GuestOrderProduct,
  DeliveryFee,
  District,
  Voucher,
  Vale,
  Subscription,
  SubscriptionPlan,
  ClientPreferences,
  TermsAndConditions
};