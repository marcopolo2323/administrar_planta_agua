const { sequelize } = require('../models');
const User = require('../models/user.model');
const Product = require('../models/product.model');
const Client = require('../models/client.model');
const Order = require('../models/order.model');
const OrderDetail = require('../models/orderDetail.model');
const GuestOrder = require('../models/guestOrder.model');
const GuestOrderProduct = require('../models/guestOrderProduct.model');
const Voucher = require('../models/voucher.model');
const DeliveryPerson = require('../models/deliveryPerson.model');

async function seedDatabase() {
  try {
    console.log('🌱 Iniciando la carga de datos de prueba...');

    // Limpiar base de datos existente
    console.log('🧹 Limpiando base de datos...');
    await sequelize.sync({ force: true });

    // 1. CREAR USUARIOS
    console.log('👥 Creando usuarios...');
    
    const admin = await User.create({
      username: 'admin',
      email: 'admin@aguapura.com',
      password: 'admin123',
      role: 'admin',
      name: 'Administrador',
      phone: '999999999'
    });

    const vendedor = await User.create({
      username: 'vendedor',
      email: 'vendedor@aguapura.com',
      password: 'vendedor123',
      role: 'vendedor',
      name: 'Vendedor Principal',
      phone: '988888888'
    });

    const repartidor = await User.create({
      username: 'repartidor',
      email: 'repartidor@aguapura.com',
      password: 'repartidor123',
      role: 'repartidor',
      name: 'Repartidor Principal',
      phone: '977777777'
    });

    // Cliente frecuente
    const clienteFrecuente = await User.create({
      username: 'cliente1',
      email: 'cliente1@example.com',
      password: 'cliente123',
      role: 'cliente',
      name: 'Juan Pérez',
      phone: '966666666',
      address: 'Av. Los Pinos 123',
      district: 'San Isidro'
    });

    console.log('✅ Usuarios creados correctamente');

    // 2. CREAR CLIENTES
    console.log('👤 Creando clientes...');
    
    const clientes = await Client.bulkCreate([
      {
        name: 'Juan Pérez',
        documentType: 'DNI',
        documentNumber: '12345678',
        address: 'Av. Los Pinos 123',
        district: 'San Isidro',
        phone: '966666666',
        email: 'cliente1@example.com',
        isCompany: false,
        hasCredit: true,
        creditLimit: 1000.00,
        currentDebt: 0.00,
        paymentDueDay: 30,
        active: true,
        userId: clienteFrecuente.id,
        defaultDeliveryAddress: 'Av. Los Pinos 123',
        defaultContactPhone: '966666666'
      },
      {
        name: 'María López',
        documentType: 'DNI',
        documentNumber: '87654321',
        address: 'Jr. Las Flores 456',
        district: 'Miraflores',
        phone: '955555555',
        email: 'maria.lopez@example.com',
        isCompany: false,
        hasCredit: true,
        creditLimit: 1500.00,
        currentDebt: 0.00,
        paymentDueDay: 30,
        active: true,
        defaultDeliveryAddress: 'Jr. Las Flores 456',
        defaultContactPhone: '955555555'
      }
    ]);

    console.log('✅ Clientes creados correctamente');

    // 3. CREAR PRODUCTOS
    console.log('📦 Creando productos...');
    
    const productos = await Product.bulkCreate([
      {
        name: 'Bidón de Agua 20L',
        description: 'Bidón de agua purificada de 20 litros',
        type: 'bidon',
        unitPrice: 8.00,
        wholesalePrice: 5.00,
        wholesaleMinQuantity: 2,
        stock: 100,
        minStock: 10,
        active: true
      },
      {
        name: 'Botella de Agua 500ml',
        description: 'Botella de agua purificada de 500ml',
        type: 'botella',
        unitPrice: 1.50,
        wholesalePrice: 1.20,
        wholesaleMinQuantity: 10,
        stock: 500,
        minStock: 50,
        active: true
      },
      {
        name: 'Botella de Agua 1L',
        description: 'Botella de agua purificada de 1 litro',
        type: 'botella',
        unitPrice: 2.50,
        wholesalePrice: 2.00,
        wholesaleMinQuantity: 10,
        stock: 300,
        minStock: 30,
        active: true
      }
    ]);

    console.log('✅ Productos creados correctamente');

    // 4. CREAR REPARTIDORES
    console.log('🚚 Creando repartidores...');
    
    const repartidores = await DeliveryPerson.bulkCreate([
      {
        name: 'Carlos Mendoza',
        phone: '922222222',
        email: 'carlos.mendoza@aguapura.com',
        vehicleType: 'motorcycle',
        vehiclePlate: 'ABC-123',
        licenseNumber: 'LIC123456',
        address: 'Av. Principal 123',
        status: 'available',
        notes: 'Experto en entregas rápidas'
      },
      {
        name: 'Ana Torres',
        phone: '911111111',
        email: 'ana.torres@aguapura.com',
        vehicleType: 'bicycle',
        vehiclePlate: 'N/A',
        licenseNumber: null,
        address: 'Jr. Secundario 456',
        status: 'available',
        notes: 'Especializada en distancias cortas'
      }
    ]);

    console.log('✅ Repartidores creados correctamente');

    // 5. CREAR PEDIDOS DE CLIENTES FRECUENTES
    console.log('🛒 Creando pedidos de clientes frecuentes...');
    
    const pedido1 = await Order.create({
      clientId: clientes[0].id,
      userId: clienteFrecuente.id,
      deliveryAddress: 'Av. Los Pinos 123',
      deliveryDistrict: 'San Isidro',
      contactPhone: '966666666',
      paymentMethod: 'credito',
      notes: 'Entregar en horario de oficina',
      status: 'entregado',
      paymentStatus: 'pendiente',
      deliveryFee: 3.00,
      total: 13.00
    });

    await OrderDetail.bulkCreate([
      {
        orderId: pedido1.id,
        productId: productos[0].id,
        quantity: 2,
        unitPrice: 5.00,
        subtotal: 10.00
      }
    ]);

    console.log('✅ Pedidos de clientes frecuentes creados correctamente');

    // 6. CREAR PEDIDOS DE INVITADOS
    console.log('👥 Creando pedidos de invitados...');
    
    const pedidoInvitado1 = await GuestOrder.create({
      customerName: 'Roberto Silva',
      customerPhone: '988888888',
      customerEmail: 'roberto.silva@example.com',
      deliveryAddress: 'Av. La Marina 123',
      deliveryDistrict: 'San Miguel',
      deliveryNotes: 'Casa con portón azul',
      paymentMethod: 'cash',
      status: 'delivered',
      paymentStatus: 'paid',
      deliveryFee: 4.00,
      total: 6.50
    });

    await GuestOrderProduct.bulkCreate([
      {
        guestOrderId: pedidoInvitado1.id,
        productId: productos[1].id,
        quantity: 2,
        price: 1.50,
        subtotal: 3.00
      }
    ]);

    console.log('✅ Pedidos de invitados creados correctamente');

    // 7. CREAR VALES
    console.log('🎫 Creando vales...');
    
    const vales = await Voucher.bulkCreate([
      {
        clientId: clientes[0].id,
        deliveryPersonId: repartidores[0].id,
        productId: productos[0].id,
        quantity: 2,
        unitPrice: 5.00,
        totalAmount: 10.00,
        status: 'delivered',
        deliveryDate: new Date(),
        notes: 'Entregado correctamente'
      }
    ]);

    console.log('✅ Vales creados correctamente');

    console.log('🎉 ¡Base de datos sembrada exitosamente!');
    console.log('\n📊 Resumen de datos creados:');
    console.log(`👥 Usuarios: 4 (admin, vendedor, repartidor, cliente)`);
    console.log(`👤 Clientes: ${clientes.length}`);
    console.log(`📦 Productos: ${productos.length}`);
    console.log(`🚚 Repartidores: ${repartidores.length}`);
    console.log(`🛒 Pedidos regulares: 1`);
    console.log(`👥 Pedidos de invitados: 1`);
    console.log(`🎫 Vales: ${vales.length}`);
    
    console.log('\n🔑 Credenciales de acceso:');
    console.log('👨‍💼 Admin: admin / admin123');
    console.log('👨‍💼 Vendedor: vendedor / vendedor123');
    console.log('🚚 Repartidor: repartidor / repartidor123');
    console.log('👤 Cliente: cliente1 / cliente123');

  } catch (error) {
    console.error('❌ Error al sembrar la base de datos:', error);
    throw error;
  }
}

// Ejecutar solo si se llama directamente
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('✅ Proceso de seed completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en el proceso de seed:', error);
      process.exit(1);
    });
}

module.exports = seedDatabase;