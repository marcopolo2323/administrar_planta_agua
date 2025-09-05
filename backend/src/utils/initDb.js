const { sequelize } = require('../models');
const User = require('../models/user.model');
const Product = require('../models/product.model');
const Order = require('../models/order.model');
const OrderDetail = require('../models/orderDetail.model');
const DeliveryPerson = require('../models/deliveryPerson.model');
const mongoose = require('mongoose');

// Conectar a MongoDB para las notificaciones
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/punto_de_venta', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Conexión a MongoDB establecida para notificaciones');
}).catch(err => {
  console.error('Error al conectar a MongoDB:', err);
});

async function initDatabase() {
  try {
    // Sincronizar modelos con la base de datos
    await sequelize.sync({ force: true });
    console.log('Base de datos sincronizada correctamente');

    // Crear usuario administrador por defecto
    await User.create({
      username: 'admin',
      email: 'admin@aguapura.com',
      password: 'admin123',
      role: 'admin'
    });
    console.log('Usuario administrador creado correctamente');

    // Crear productos específicos del negocio de agua
    await Product.bulkCreate([
      {
        name: 'Bidón de Agua 20L',
        description: 'Bidón de agua purificada de 20 litros',
        type: 'bidon',
        unitPrice: 7.00,
        wholesalePrice: 5.00,
        wholesaleMinQuantity: 2,
        stock: 100
      },
      {
        name: 'Paquete de Botellas 650ml',
        description: 'Paquete de 20 unidades de botellas de agua de 650ml',
        type: 'botella',
        unitPrice: 10.00,
        wholesalePrice: 9.00,
        wholesaleMinQuantity: 50,
        wholesalePrice2: 8.00,
        wholesaleMinQuantity2: 1000,
        stock: 200
      }
    ]);
    console.log('Productos de agua creados correctamente');

    console.log('==============================================');
    console.log('INICIALIZACIÓN DE BASE DE DATOS COMPLETADA');
    console.log('Se han creado las siguientes tablas:');
    console.log('- Usuarios (User)');
    console.log('- Productos (Product)');
    console.log('- Clientes (Client)');
    console.log('- Ventas (Sale) y Detalles de Ventas (SaleDetail)');
    console.log('- Compras (Purchase) y Detalles de Compras (PurchaseDetail)');
    console.log('- Inventario (Inventory)');
    console.log('- Caja (CashRegister) y Movimientos de Caja (CashMovement)');
    console.log('- Créditos (Credit) y Pagos de Créditos (CreditPayment)');
    console.log('- Facturas Electrónicas (ElectronicInvoice)');
    console.log('- Pedidos (Order) y Detalles de Pedidos (OrderDetail)');
    console.log('- Repartidores (DeliveryPerson)');
    console.log('- Notificaciones (MongoDB)');
    console.log('==============================================');
    console.log('Inicialización completada con éxito');
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
  } finally {
    process.exit(0);
  }
}

initDatabase();