const { sequelize } = require('../models');
const User = require('../models/user.model');
const Product = require('../models/product.model');
const Client = require('../models/client.model');
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
      phone: '+51 961606183'
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
      name: 'Branstone Dux Urbina Garcia',
      phone: '924714321'
    });

    const repartidor2 = await User.create({
      username: 'repartidor2',
      email: 'ana.torres@aguapura.com',
      password: 'repartidor123',
      role: 'repartidor',
      name: 'Ana Torres',
      phone: '911111111'
    });

    // Usuario vendedor adicional
    const vendedor2 = await User.create({
      username: 'vendedor2',
      email: 'vendedor2@aguapura.com',
      password: 'vendedor123',
      role: 'vendedor',
      name: 'Vendedor Secundario',
      phone: '977777777'
    });

    console.log('✅ Usuarios creados correctamente');

    // 2. CREAR CLIENTES
    console.log('👤 Creando clientes...');
    
    // Crear clientes básicos primero
    const clientesBasicos = await Client.bulkCreate([
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
        userId: null, // Cliente sin usuario asociado
        defaultDeliveryAddress: 'Av. Los Pinos 123',
        defaultContactPhone: '966666666',
        clientStatus: 'activo',
        recommendations: 'Excelente servicio, muy puntual en las entregas. Recomiendo mejorar la comunicación sobre el estado del pedido.',
        lastOrderDate: new Date(),
        totalOrders: 5
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
        defaultContactPhone: '955555555',
        clientStatus: 'nuevo',
        recommendations: 'Primera vez que uso el servicio, espero que sea bueno.',
        lastOrderDate: null,
        totalOrders: 0
      }
    ]);

    console.log('✅ Clientes básicos creados correctamente');
    
    // Importar clientes desde JSON
    console.log('📥 Importando clientes desde archivo JSON...');
    try {
      const importClientsFromJson = require('../scripts/importClientsFromJson');
      const importResult = await importClientsFromJson();
      console.log(`✅ Importados ${importResult.stats.total} clientes adicionales desde JSON`);
    } catch (importError) {
      console.warn('⚠️ Error al importar clientes desde JSON:', importError.message);
      console.log('📝 Continuando con clientes básicos únicamente...');
    }
    
    // Obtener todos los clientes (básicos + importados)
    const clientes = await Client.findAll();
    console.log(`✅ Total de clientes en la base de datos: ${clientes.length}`);

    // 3. CREAR PRODUCTOS
    console.log('📦 Creando productos...');
    
    const productos = await Product.bulkCreate([
      {
        name: 'Bidón de Agua 20L',
        description: 'Bidón de agua purificada de 20 litros',
        type: 'bidon',
        unitPrice: 7.00,
        wholesalePrice: 5.00,
        wholesaleMinQuantity: 2,
        stock: 100,
        active: true
      },
      {
        name: 'Paquete de Botellas de Agua',
        description: 'Paquete de 20 botellas de agua purificada',
        type: 'botella',
        unitPrice: 10.00,
        wholesalePrice: 9.00,
        wholesaleMinQuantity: 60,
        stock: 200,
        active: true
      }
    ]);

    console.log('✅ Productos creados correctamente');

    // 4. CREAR REPARTIDORES
    console.log('🚚 Creando repartidores...');
    
    const repartidores = await DeliveryPerson.bulkCreate([
      {
        userId: repartidor.id,
        name: 'Branstone Dux Urbina Garcia',
        phone: '924714321',
        email: 'ubranstone@gmail.com',
        vehicleType: 'motorcycle',
        vehiclePlate: 'UCA-7U',
        licenseNumber: 'Y-73892650',
        address: 'Av. Principal 123',
        status: 'available',
        notes: 'Experto en entregas rápidas'
      },
      {
        userId: repartidor2.id,
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

    // 5. CREAR PEDIDOS DE INVITADOS (reemplaza pedidos regulares)
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
      subtotal: 10.00,
      deliveryFee: 4.00,
      totalAmount: 14.00
    });

    await GuestOrderProduct.bulkCreate([
      {
        guestOrderId: pedidoInvitado1.id,
        productId: productos[1].id,
        quantity: 1,
        price: 10.00,
        subtotal: 10.00
      }
    ]);

    // Crear un segundo pedido de invitado
    const pedidoInvitado2 = await GuestOrder.create({
      customerName: 'Carlos Mendoza',
      customerPhone: '977777777',
      customerEmail: 'carlos.mendoza@example.com',
      deliveryAddress: 'Jr. Las Palmas 789',
      deliveryDistrict: 'Lima',
      deliveryNotes: 'Oficina en el piso 3',
      paymentMethod: 'card',
      status: 'pending',
      paymentStatus: 'pending',
      subtotal: 14.00,
      deliveryFee: 2.00,
      totalAmount: 16.00
    });

    await GuestOrderProduct.bulkCreate([
      {
        guestOrderId: pedidoInvitado2.id,
        productId: productos[0].id,
        quantity: 2,
        price: 7.00,
        subtotal: 14.00
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

    // 6. GENERAR BOLETAS AUTOMÁTICAMENTE
    console.log('📄 Generando boletas automáticamente...');
    
    try {
      const { documentGeneratorService } = require('../services/documentGenerator.service');
      
      // Generar boleta para pedido de invitado #1
      const guestOrder1Data = {
        id: pedidoInvitado1.id,
        customerName: pedidoInvitado1.customerName,
        customerPhone: pedidoInvitado1.customerPhone,
        customerEmail: pedidoInvitado1.customerEmail,
        deliveryAddress: pedidoInvitado1.deliveryAddress,
        deliveryDistrict: pedidoInvitado1.deliveryDistrict,
        total: parseFloat(pedidoInvitado1.totalAmount),
        subtotal: parseFloat(pedidoInvitado1.subtotal),
        deliveryFee: parseFloat(pedidoInvitado1.deliveryFee),
        paymentMethod: pedidoInvitado1.paymentMethod,
        orderDetails: [
          {
            productName: productos[1].name,
            quantity: 1,
            unitPrice: 10.00,
            subtotal: 10.00
          }
        ]
      };
      
      const pdfPath1 = await documentGeneratorService.generateDocumentPDF(guestOrder1Data, 'boleta');
      console.log(`✅ Boleta generada para pedido de invitado #${pedidoInvitado1.id}: ${pdfPath1}`);
      
      // Generar boleta para pedido de invitado #2
      const guestOrder2Data = {
        id: pedidoInvitado2.id,
        customerName: pedidoInvitado2.customerName,
        customerPhone: pedidoInvitado2.customerPhone,
        customerEmail: pedidoInvitado2.customerEmail,
        deliveryAddress: pedidoInvitado2.deliveryAddress,
        deliveryDistrict: pedidoInvitado2.deliveryDistrict,
        total: parseFloat(pedidoInvitado2.totalAmount),
        subtotal: parseFloat(pedidoInvitado2.subtotal),
        deliveryFee: parseFloat(pedidoInvitado2.deliveryFee),
        paymentMethod: pedidoInvitado2.paymentMethod,
        orderDetails: [
          {
            productName: productos[0].name,
            quantity: 2,
            unitPrice: 7.00,
            subtotal: 14.00
          }
        ]
      };
      
      const pdfPath2 = await documentGeneratorService.generateDocumentPDF(guestOrder2Data, 'boleta');
      console.log(`✅ Boleta generada para pedido de invitado #${pedidoInvitado2.id}: ${pdfPath2}`);
      
    } catch (pdfError) {
      console.error('❌ Error al generar boletas automáticamente:', pdfError);
    }

    console.log('🎉 ¡Base de datos sembrada exitosamente!');
    console.log('\n📊 Resumen de datos creados:');
    console.log(`👥 Usuarios: 5 (admin, 2 vendedores, 2 repartidores)`);
    console.log(`👤 Clientes: ${clientes.length}`);
    console.log(`📦 Productos: ${productos.length}`);
    console.log(`🚚 Repartidores: ${repartidores.length}`);
    console.log(`👥 Pedidos de invitados: 2`);
    console.log(`🎫 Vales: ${vales.length}`);
    console.log(`📄 Boletas generadas: 2`);
    
    console.log('\n🔑 Credenciales de acceso:');
    console.log('👨‍💼 Admin: admin / admin123');
    console.log('👨‍💼 Vendedor 1: vendedor / vendedor123');
    console.log('👨‍💼 Vendedor 2: vendedor2 / vendedor123');
    console.log('🚚 Repartidor 1: repartidor / repartidor123');
    console.log('🚚 Repartidor 2: repartidor2 / repartidor123');

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