const { 
  sequelize, 
  User, 
  Client, 
  Product, 
  District, 
  DeliveryPerson,
  GuestOrder,
  GuestOrderProduct,
  Voucher,
  Vale,
  Subscription,
  ClientPreferences
} = require('../models');

async function cleanSeed() {
  console.log('🌱 INICIANDO SEED LIMPIO DE LA BASE DE DATOS');
  console.log('=============================================');
  
  try {
    // 1. Conectar a la base de datos
    console.log('🔌 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión establecida');
    
    // 2. Sincronizar todos los modelos (crear tablas) en orden específico
    console.log('🔄 Creando tablas en orden...');
    
    // Primero las tablas independientes (sin foreign keys)
    await District.sync({ force: false });
    console.log('   ✅ District');
    
    await Product.sync({ force: false });
    console.log('   ✅ Product');
    
    await User.sync({ force: false });
    console.log('   ✅ User');
    
    await Client.sync({ force: false });
    console.log('   ✅ Client');
    
    await DeliveryPerson.sync({ force: false });
    console.log('   ✅ DeliveryPerson');
    
    await Subscription.sync({ force: false });
    console.log('   ✅ Subscription');
    
    // Luego las que tienen foreign keys
    await Vale.sync({ force: false });
    console.log('   ✅ Vale');
    
    await ClientPreferences.sync({ force: false });
    console.log('   ✅ ClientPreferences');
    
    await GuestOrder.sync({ force: false });
    console.log('   ✅ GuestOrder');
    
    await GuestOrderProduct.sync({ force: false });
    console.log('   ✅ GuestOrderProduct');
    
    await Voucher.sync({ force: false });
    console.log('   ✅ Voucher');
    
    console.log('✅ Todas las tablas creadas correctamente');
    
    // 3. Verificar que las tablas se crearon
    console.log('📋 Verificando tablas creadas...');
    const tables = await sequelize.getQueryInterface().showAllTables();
    console.log('📋 Tablas disponibles:', tables.sort());
    
    // 4. Seed de Distritos
    console.log('🏘️  Seeding distritos...');
    const districts = [
      { name: 'CALLERIA', deliveryFee: 5.00, isActive: true },
      { name: 'YARINACOCHA', deliveryFee: 8.00, isActive: true },
      { name: 'MANANTAY', deliveryFee: 0.00, isActive: true },
      { name: 'NUEVA REQUENA', deliveryFee: 12.00, isActive: true },
      { name: 'CAMPO VERDE', deliveryFee: 15.00, isActive: true }
    ];
    
    for (const district of districts) {
      await District.findOrCreate({
        where: { name: district.name },
        defaults: district
      });
    }
    console.log('✅ Distritos creados');
    
    // 5. Seed de Productos
    console.log('🥤 Seeding productos...');
    const products = [
      {
        name: 'Bidón de Agua 20L',
        description: 'Bidón de agua purificada de 20 litros',
        type: 'bidon',
        unitPrice: 7.00,
        wholesalePrice: 5.00,
        wholesaleMinQuantity: 2
      },
      {
        name: 'Paquete de Botellas de Agua',
        description: 'Paquete de botellas de agua de 650ml',
        type: 'botella',
        unitPrice: 10.00,
        wholesalePrice: 9.00,
        wholesaleMinQuantity: 50
      }
    ];
    
    for (const product of products) {
      await Product.findOrCreate({
        where: { name: product.name },
        defaults: product
      });
    }
    console.log('✅ Productos creados');
    
    // 6. Seed de Usuarios
    console.log('👥 Seeding usuarios...');
    const users = [
      {
        username: 'admin',
        email: 'admin@aguapura.com',
        password: 'admin123', // Se hasheará automáticamente
        role: 'admin',
        firstName: 'Administrador',
        lastName: 'Sistema',
        phone: '999888777',
        isActive: true
      },
      {
        username: 'repartidor',
        email: 'repartidor@aguapura.com',
        password: 'repartidor123',
        role: 'repartidor',
        firstName: 'Juan',
        lastName: 'Pérez',
        phone: '924714321',
        isActive: true
      },
      {
        username: 'vendedor',
        email: 'vendedor@aguapura.com',
        password: 'vendedor123',
        role: 'vendedor',
        firstName: 'María',
        lastName: 'García',
        phone: '987654321',
        isActive: true
      }
    ];
    
    for (const user of users) {
      await User.findOrCreate({
        where: { username: user.username },
        defaults: user
      });
    }
    console.log('✅ Usuarios creados');
    
    // 7. Crear repartidor
    console.log('🚚 Creando repartidor...');
    const deliveryUser = await User.findOne({ where: { role: 'repartidor' } });
    if (deliveryUser) {
      await DeliveryPerson.findOrCreate({
        where: { userId: deliveryUser.id },
        defaults: {
          userId: deliveryUser.id,
          vehicleType: 'moto',
          licenseNumber: 'D123456789',
          isActive: true,
          currentCapacity: 0,
          maxCapacity: 50
        }
      });
    }
    console.log('✅ Repartidor creado');
    
    // 8. Importar clientes desde Excel/JSON
    console.log('👤 Importando clientes desde Excel...');
    
    try {
      // Primero convertir Excel a JSON si es necesario
      const fs = require('fs');
      const path = require('path');
      const jsonPath = path.join(__dirname, '../../data/clientes.json');
      
      if (!fs.existsSync(jsonPath)) {
        console.log('🔄 Convirtiendo Excel a JSON...');
        const { convertExcelToJson } = require('./convertExcelToJson');
        await convertExcelToJson();
      } else {
        console.log('✅ Archivo JSON de clientes ya existe');
      }
      
      // Importar clientes desde JSON
      const { importClientsFromJson } = require('./importClientsFromJson');
      await importClientsFromJson();
      console.log('✅ Clientes importados desde Excel');
      
    } catch (error) {
      console.log('⚠️  Error importando clientes desde Excel:', error.message);
      console.log('🔄 Creando clientes de ejemplo...');
      
      // Fallback: crear clientes de ejemplo si falla la importación
      const manantayDistrict = await District.findOne({ where: { name: 'MANANTAY' } });
      const calleriaDistrict = await District.findOne({ where: { name: 'CALLERIA' } });
      
      const clients = [
        {
          name: 'Marco Sunino',
          document: '76543217',
          phone: '987654321',
          email: 'marco@gmail.com',
          address: 'Jr. Calidas 123',
          districtId: manantayDistrict?.id,
          isActive: true
        },
        {
          name: 'Ana García',
          document: '12345678',
          phone: '912345678',
          email: 'ana@gmail.com',
          address: 'Av. Principal 456',
          districtId: calleriaDistrict?.id,
          isActive: true
        }
      ];
      
      for (const client of clients) {
        if (client.districtId) {
          await Client.findOrCreate({
            where: { document: client.document },
            defaults: client
          });
        }
      }
      console.log('✅ Clientes de ejemplo creados');
    }
    
    // 9. Seed de Suscripciones de ejemplo
    console.log('📋 Seeding suscripciones de ejemplo...');
    const marcoClient = await Client.findOne({ where: { document: '76543217' } });
    
    if (marcoClient) {
      await Subscription.findOrCreate({
        where: { client_dni: marcoClient.document },
        defaults: {
          client_id: marcoClient.id,
          client_dni: marcoClient.document,
          subscription_type: 'monthly',
          total_bottles: 20,
          remaining_bottles: 15,
          total_amount: 140.00,
          paid_amount: 140.00,
          status: 'active',
          purchase_date: new Date(),
          expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
          notes: 'Suscripción mensual activa'
        }
      });
      console.log('✅ Suscripción de ejemplo creada');
    }
    
    // 10. Seed de Preferencias de Cliente
    console.log('⚙️  Seeding preferencias de cliente...');
    if (marcoClient) {
      await ClientPreferences.findOrCreate({
        where: { dni: marcoClient.document },
        defaults: {
          clientId: marcoClient.id,
          dni: marcoClient.document,
          preferredPaymentMethod: 'contraentrega',
          subscriptionPlanId: null,
          subscriptionAmount: null,
          subscriptionQuantity: null,
          validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 año
          isActive: true,
          notes: 'Cliente frecuente - Preferencia contraentrega'
        }
      });
      console.log('✅ Preferencias de cliente creadas');
    }
    
    // 11. Verificar que todo está correcto
    console.log('🔍 Verificación final...');
    const counts = {
      districts: await District.count(),
      products: await Product.count(),
      users: await User.count(),
      deliveryPersons: await DeliveryPerson.count(),
      clients: await Client.count(),
      subscriptions: await Subscription.count(),
      preferences: await ClientPreferences.count()
    };
    
    console.log('📊 Resumen de datos creados:');
    console.log(`   - Distritos: ${counts.districts}`);
    console.log(`   - Productos: ${counts.products} (Bidón 20L + Paquete 650ml)`);
    console.log(`   - Usuarios: ${counts.users} (admin, repartidor, vendedor)`);
    console.log(`   - Repartidores: ${counts.deliveryPersons}`);
    console.log(`   - Clientes: ${counts.clients}`);
    console.log(`   - Suscripciones: ${counts.subscriptions}`);
    console.log(`   - Preferencias: ${counts.preferences}`);
    console.log('');
    console.log('🎯 Modalidades de pago soportadas:');
    console.log('   - ✅ Contraentrega (efectivo/plin/yape)');
    console.log('   - ✅ Vales/Crédito');
    console.log('   - ✅ Suscripciones');
    
    console.log('🎉 SEED LIMPIO COMPLETADO EXITOSAMENTE');
    
  } catch (error) {
    console.error('❌ Error en seed limpio:', error);
    throw error;
  }
}

if (require.main === module) {
  cleanSeed()
    .then(() => {
      console.log('🎉 Seed completado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error en seed:', error);
      process.exit(1);
    });
}

module.exports = { cleanSeed };
