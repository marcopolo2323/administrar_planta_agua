const { sequelize } = require('../models');
const importClientsFromJson = require('./importClientsFromJson');
const convertExcelToJson = require('./convertExcelToJson');

const deployUpdate = async () => {
  try {
    console.log('🚀 Iniciando actualización para deploy...');
    console.log('==========================================');
    
    // 1. Convertir Excel a JSON si es necesario
    console.log('\n📊 PASO 1: Verificando archivo de clientes...');
    const fs = require('fs');
    const path = require('path');
    const jsonPath = path.join(__dirname, '../../data/clientes.json');
    
    if (!fs.existsSync(jsonPath)) {
      console.log('🔄 Convirtiendo Excel a JSON...');
      await convertExcelToJson();
    } else {
      console.log('✅ Archivo JSON de clientes ya existe');
    }
    
    // 2. Conectar a la base de datos
    console.log('\n🔌 PASO 2: Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión establecida');
    
    // 3. Sincronizar modelos (sin forzar recreación)
    console.log('\n🔄 PASO 3: Sincronizando modelos...');
    const User = require('../models/user.model');
    const Product = require('../models/product.model');
    const Client = require('../models/client.model');
    const GuestOrder = require('../models/guestOrder.model');
    const GuestOrderProduct = require('../models/guestOrderProduct.model');
    const Voucher = require('../models/voucher.model');
    const DeliveryPerson = require('../models/deliveryPerson.model');
    const DeliveryFee = require('../models/deliveryFee.model');
    const District = require('../models/district.model');
    
    // Sincronizar sin forzar (mantener datos existentes)
    await User.sync();
    await Product.sync();
    await Client.sync();
    await District.sync();
    await DeliveryFee.sync();
    await DeliveryPerson.sync();
    await GuestOrder.sync();
    await GuestOrderProduct.sync();
    await Voucher.sync();
    
    console.log('✅ Modelos sincronizados');
    
    // 4. Verificar si ya existen clientes
    console.log('\n👥 PASO 4: Verificando clientes existentes...');
    const clientesExistentes = await Client.count();
    console.log(`📊 Clientes existentes: ${clientesExistentes}`);
    
    // 5. Importar clientes desde Excel (siempre importar todos)
    console.log('\n📥 PASO 5: Importando clientes desde Excel...');
    const importResult = await importClientsFromJson();
    
    if (importResult.success) {
      console.log(`✅ Importados ${importResult.stats.creados} clientes adicionales`);
    } else {
      console.warn('⚠️ Error al importar clientes:', importResult.error);
    }
    
    // 6. Verificar usuarios básicos
    console.log('\n👤 PASO 6: Verificando usuarios básicos...');
    const adminExists = await User.findOne({ where: { username: 'admin' } });
    const vendedorExists = await User.findOne({ where: { username: 'vendedor' } });
    const repartidorExists = await User.findOne({ where: { username: 'repartidor' } });
    
    if (!adminExists) {
      console.log('🔄 Creando usuario admin...');
      await User.create({
        username: 'admin',
        email: 'admin@aguapura.com',
        password: 'admin123',
        role: 'admin',
        name: 'Administrador',
        phone: '+51 961606183'
      });
    }
    
    if (!vendedorExists) {
      console.log('🔄 Creando usuario vendedor...');
      await User.create({
        username: 'vendedor',
        email: 'vendedor@aguapura.com',
        password: 'vendedor123',
        role: 'vendedor',
        name: 'Vendedor Principal',
        phone: '988888888'
      });
    }
    
    if (!repartidorExists) {
      console.log('🔄 Creando usuario repartidor...');
      await User.create({
        username: 'repartidor',
        email: 'repartidor@aguapura.com',
        password: 'repartidor123',
        role: 'repartidor',
        name: 'Branstone Dux Urbina Garcia',
        phone: '924714321'
      });
    }
    
    console.log('✅ Usuarios básicos verificados');
    
    // 7. Verificar productos básicos
    console.log('\n📦 PASO 7: Verificando productos básicos...');
    const productosExistentes = await Product.count();
    
    if (productosExistentes === 0) {
      console.log('🔄 Creando productos básicos...');
      await Product.bulkCreate([
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
    }
    
    console.log('✅ Productos básicos verificados');
    
    // 8. Estadísticas finales
    console.log('\n📊 PASO 8: Estadísticas finales...');
    const stats = {
      usuarios: await User.count(),
      clientes: await Client.count(),
      productos: await Product.count(),
      repartidores: await DeliveryPerson.count(),
      pedidos: await GuestOrder.count(),
      vales: await Voucher.count()
    };
    
    console.log('🎉 ¡Actualización completada exitosamente!');
    console.log('==========================================');
    console.log('📊 Estado de la base de datos:');
    console.log(`   👥 Usuarios: ${stats.usuarios}`);
    console.log(`   👤 Clientes: ${stats.clientes}`);
    console.log(`   📦 Productos: ${stats.productos}`);
    console.log(`   🚚 Repartidores: ${stats.repartidores}`);
    console.log(`   📋 Pedidos: ${stats.pedidos}`);
    console.log(`   🎫 Vales: ${stats.vales}`);
    
    console.log('\n🔑 Credenciales de acceso:');
    console.log('   👨‍💼 Admin: admin / admin123');
    console.log('   👨‍💼 Vendedor: vendedor / vendedor123');
    console.log('   🚚 Repartidor: repartidor / repartidor123');
    
    console.log('\n✅ ¡Sistema listo para producción!');
    
  } catch (error) {
    console.error('❌ Error durante la actualización:', error);
    throw error;
  } finally {
    await sequelize.close();
    console.log('\n🔌 Conexión a la base de datos cerrada');
  }
};

// Ejecutar si se llama directamente
if (require.main === module) {
  deployUpdate()
    .then(() => {
      console.log('\n🎊 ¡Actualización completada exitosamente!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Error en la actualización:', error);
      process.exit(1);
    });
}

module.exports = deployUpdate;
