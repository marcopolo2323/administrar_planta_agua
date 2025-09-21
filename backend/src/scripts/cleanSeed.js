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
    
    // 2. Sincronizar todos los modelos (crear tablas)
    console.log('🔄 Creando tablas...');
    await sequelize.sync({ force: false, alter: false });
    console.log('✅ Tablas creadas/sincronizadas');
    
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
        price: 7.00,
        category: 'Agua',
        stock: 1000,
        isActive: true,
        wholesalePrice: 5.00,
        wholesaleMinQuantity: 10
      },
      {
        name: 'Paquete de Botellas de Agua',
        description: 'Paquete de 24 botellas de agua de 500ml',
        price: 10.00,
        category: 'Agua',
        stock: 500,
        isActive: true,
        wholesalePrice: 9.00,
        wholesaleMinQuantity: 50
      },
      {
        name: 'Dispensador de Agua',
        description: 'Dispensador eléctrico para bidones de 20L',
        price: 150.00,
        category: 'Equipos',
        stock: 20,
        isActive: true
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
        username: 'operador',
        email: 'operador@aguapura.com',
        password: 'operador123',
        role: 'operador',
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
    
    // 8. Seed de Clientes (algunos ejemplos)
    console.log('👤 Seeding clientes de ejemplo...');
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
    
    // 9. Verificar que todo está correcto
    console.log('🔍 Verificación final...');
    const counts = {
      districts: await District.count(),
      products: await Product.count(),
      users: await User.count(),
      deliveryPersons: await DeliveryPerson.count(),
      clients: await Client.count()
    };
    
    console.log('📊 Resumen de datos creados:');
    console.log(`   - Distritos: ${counts.districts}`);
    console.log(`   - Productos: ${counts.products}`);
    console.log(`   - Usuarios: ${counts.users}`);
    console.log(`   - Repartidores: ${counts.deliveryPersons}`);
    console.log(`   - Clientes: ${counts.clients}`);
    
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
