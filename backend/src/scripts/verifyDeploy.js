const { sequelize } = require('../models');
const fs = require('fs');
const path = require('path');

const verifyDeploy = async () => {
  try {
    console.log('🔍 Verificando preparación para deploy...');
    console.log('==========================================');
    
    // 1. Verificar archivos necesarios
    console.log('\n📁 PASO 1: Verificando archivos...');
    
    const requiredFiles = [
      '../../data/clientes.json',
      '../../data/db_clientes.xlsx',
      '../models/user.model.js',
      '../models/client.model.js',
      '../models/product.model.js',
      '../models/guestOrder.model.js'
    ];
    
    let allFilesExist = true;
    for (const file of requiredFiles) {
      const filePath = path.join(__dirname, file);
      if (fs.existsSync(filePath)) {
        console.log(`✅ ${file}`);
      } else {
        console.log(`❌ ${file} - FALTANTE`);
        allFilesExist = false;
      }
    }
    
    if (!allFilesExist) {
      throw new Error('Archivos requeridos faltantes');
    }
    
    // 2. Verificar conexión a base de datos
    console.log('\n🔌 PASO 2: Verificando conexión a base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión establecida');
    
    // 3. Verificar modelos
    console.log('\n📊 PASO 3: Verificando modelos...');
    const User = require('../models/user.model');
    const Product = require('../models/product.model');
    const Client = require('../models/client.model');
    const GuestOrder = require('../models/guestOrder.model');
    const Voucher = require('../models/voucher.model');
    const DeliveryPerson = require('../models/deliveryPerson.model');
    
    console.log('✅ Modelos cargados correctamente');
    
    // 4. Verificar datos
    console.log('\n📈 PASO 4: Verificando datos...');
    
    const stats = {
      usuarios: await User.count(),
      clientes: await Client.count(),
      productos: await Product.count(),
      pedidos: await GuestOrder.count(),
      vales: await Voucher.count(),
      repartidores: await DeliveryPerson.count()
    };
    
    console.log('📊 Estado actual de la base de datos:');
    console.log(`   👥 Usuarios: ${stats.usuarios}`);
    console.log(`   👤 Clientes: ${stats.clientes}`);
    console.log(`   📦 Productos: ${stats.productos}`);
    console.log(`   📋 Pedidos: ${stats.pedidos}`);
    console.log(`   🎫 Vales: ${stats.vales}`);
    console.log(`   🚚 Repartidores: ${stats.repartidores}`);
    
    // 5. Verificar usuarios básicos
    console.log('\n👤 PASO 5: Verificando usuarios básicos...');
    
    const admin = await User.findOne({ where: { username: 'admin' } });
    const vendedor = await User.findOne({ where: { username: 'vendedor' } });
    const repartidor = await User.findOne({ where: { username: 'repartidor' } });
    
    if (admin) console.log('✅ Usuario admin existe');
    else console.log('❌ Usuario admin faltante');
    
    if (vendedor) console.log('✅ Usuario vendedor existe');
    else console.log('❌ Usuario vendedor faltante');
    
    if (repartidor) console.log('✅ Usuario repartidor existe');
    else console.log('❌ Usuario repartidor faltante');
    
    // 6. Verificar productos
    console.log('\n📦 PASO 6: Verificando productos...');
    
    const productos = await Product.findAll();
    if (productos.length >= 2) {
      console.log('✅ Productos básicos configurados');
      productos.forEach(p => console.log(`   - ${p.name}: S/${p.unitPrice}`));
    } else {
      console.log('❌ Productos básicos faltantes');
    }
    
    // 7. Verificar clientes importados
    console.log('\n👥 PASO 7: Verificando clientes importados...');
    
    if (stats.clientes >= 10) {
      console.log(`✅ ${stats.clientes} clientes importados`);
      
      // Mostrar algunos ejemplos
      const clientesEjemplo = await Client.findAll({ limit: 3 });
      console.log('📝 Ejemplos de clientes:');
      clientesEjemplo.forEach(c => {
        console.log(`   - ${c.name} (${c.documentType}: ${c.documentNumber})`);
      });
    } else {
      console.log('❌ Pocos clientes importados');
    }
    
    // 8. Verificar archivo JSON de clientes
    console.log('\n📄 PASO 8: Verificando archivo JSON...');
    
    const jsonPath = path.join(__dirname, '../../data/clientes.json');
    if (fs.existsSync(jsonPath)) {
      const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      console.log(`✅ Archivo JSON con ${jsonData.length} registros`);
    } else {
      console.log('❌ Archivo JSON faltante');
    }
    
    // 9. Resumen final
    console.log('\n🎉 RESUMEN FINAL');
    console.log('================');
    
    const isReady = stats.usuarios >= 3 && stats.clientes >= 10 && stats.productos >= 2;
    
    if (isReady) {
      console.log('✅ SISTEMA LISTO PARA DEPLOY');
      console.log('\n🚀 Próximos pasos:');
      console.log('1. Configurar variables de entorno en Render');
      console.log('2. Configurar variables de entorno en Vercel');
      console.log('3. Hacer deploy del backend en Render');
      console.log('4. Hacer deploy del frontend en Vercel');
      console.log('5. Verificar funcionamiento completo');
    } else {
      console.log('❌ SISTEMA NO ESTÁ LISTO');
      console.log('\n🔧 Acciones requeridas:');
      if (stats.usuarios < 3) console.log('- Ejecutar: npm run deploy-update');
      if (stats.clientes < 10) console.log('- Verificar importación de clientes');
      if (stats.productos < 2) console.log('- Verificar productos básicos');
    }
    
    console.log('\n📋 Checklist de Deploy:');
    console.log('□ Base de datos configurada');
    console.log('□ Usuarios básicos creados');
    console.log('□ Clientes importados desde Excel');
    console.log('□ Productos configurados');
    console.log('□ Variables de entorno configuradas');
    console.log('□ Backend deployado en Render');
    console.log('□ Frontend deployado en Vercel');
    console.log('□ Pruebas de funcionamiento realizadas');
    
    return {
      ready: isReady,
      stats: stats,
      files: allFilesExist
    };
    
  } catch (error) {
    console.error('❌ Error durante la verificación:', error);
    return {
      ready: false,
      error: error.message
    };
  } finally {
    await sequelize.close();
    console.log('\n🔌 Conexión cerrada');
  }
};

// Ejecutar si se llama directamente
if (require.main === module) {
  verifyDeploy()
    .then((result) => {
      if (result.ready) {
        console.log('\n🎊 ¡Verificación completada exitosamente!');
        process.exit(0);
      } else {
        console.log('\n💥 Verificación falló');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('\n💥 Error fatal:', error);
      process.exit(1);
    });
}

module.exports = verifyDeploy;
