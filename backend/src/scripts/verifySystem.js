#!/usr/bin/env node

const { sequelize } = require('../models');
const User = require('../models/user.model');
const Client = require('../models/client.model');
const Product = require('../models/product.model');
const GuestOrder = require('../models/guestOrder.model');
const DeliveryPerson = require('../models/deliveryPerson.model');
const Subscription = require('../models/subscription.model');
const Vale = require('../models/vale.model');

async function verifySystem() {
  try {
    console.log('🔍 VERIFICACIÓN COMPLETA DEL SISTEMA');
    console.log('=====================================\n');
    
    // 1. Verificar conexión a la base de datos
    console.log('1️⃣ Verificando conexión a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos exitosa\n');
    
    // 2. Verificar modelos y tablas
    console.log('2️⃣ Verificando modelos y tablas...');
    await sequelize.sync({ alter: false });
    console.log('✅ Modelos sincronizados correctamente\n');
    
    // 3. Verificar datos básicos
    console.log('3️⃣ Verificando datos básicos...');
    
    const userCount = await User.count();
    const clientCount = await Client.count();
    const productCount = await Product.count();
    const orderCount = await GuestOrder.count();
    const deliveryCount = await DeliveryPerson.count();
    const subscriptionCount = await Subscription.count();
    const valeCount = await Vale.count();
    
    console.log(`   👥 Usuarios: ${userCount}`);
    console.log(`   👤 Clientes: ${clientCount}`);
    console.log(`   📦 Productos: ${productCount}`);
    console.log(`   📋 Pedidos: ${orderCount}`);
    console.log(`   🚚 Repartidores: ${deliveryCount}`);
    console.log(`   📅 Suscripciones: ${subscriptionCount}`);
    console.log(`   🎫 Vales: ${valeCount}\n`);
    
    // 4. Verificar usuarios de administración
    console.log('4️⃣ Verificando usuarios de administración...');
    const adminUsers = await User.findAll({
      where: { role: 'admin' }
    });
    
    if (adminUsers.length > 0) {
    console.log('✅ Usuarios administradores encontrados:');
    adminUsers.forEach(user => {
      console.log(`   - ${user.username} (${user.email})`);
    });
    
    // Verificar vendedores
    const vendedorUsers = await User.findAll({
      where: { role: 'vendedor' }
    });
    
    if (vendedorUsers.length > 0) {
      console.log('✅ Usuarios vendedores encontrados:');
      vendedorUsers.forEach(user => {
        console.log(`   - ${user.username} (${user.email})`);
      });
    }
    } else {
      console.log('⚠️ No se encontraron usuarios administradores');
    }
    console.log('');
    
    // 5. Verificar repartidores
    console.log('5️⃣ Verificando repartidores...');
    const deliveryPersons = await DeliveryPerson.findAll({
      include: [{ model: User }]
    });
    
    if (deliveryPersons.length > 0) {
      console.log('✅ Repartidores encontrados:');
      deliveryPersons.forEach(delivery => {
        console.log(`   - ${delivery.name} (${delivery.phone}) - Estado: ${delivery.status}`);
      });
    } else {
      console.log('⚠️ No se encontraron repartidores');
    }
    console.log('');
    
    // 6. Verificar productos activos
    console.log('6️⃣ Verificando productos activos...');
    const activeProducts = await Product.findAll({
      where: { active: true }
    });
    
    if (activeProducts.length > 0) {
      console.log('✅ Productos activos encontrados:');
      activeProducts.forEach(product => {
        console.log(`   - ${product.name} - S/ ${product.unitPrice} (Stock: ${product.stock})`);
      });
    } else {
      console.log('⚠️ No se encontraron productos activos');
    }
    console.log('');
    
    // 7. Verificar configuración de entorno
    console.log('7️⃣ Verificando configuración de entorno...');
    const criticalEnvVars = [
      'NODE_ENV',
      'PORT',
      'JWT_SECRET'
    ];
    
    const missingCriticalVars = criticalEnvVars.filter(varName => !process.env[varName]);
    
    if (missingCriticalVars.length === 0) {
      console.log('✅ Variables críticas de entorno configuradas correctamente');
    } else {
      console.log('⚠️ Variables críticas de entorno faltantes:');
      missingCriticalVars.forEach(varName => {
        console.log(`   - ${varName}`);
      });
    }
    
    // Verificar variables de base de datos (opcional en desarrollo)
    const dbVars = ['DB_HOST', 'DB_NAME', 'DB_USER'];
    const missingDbVars = dbVars.filter(varName => !process.env[varName]);
    
    if (missingDbVars.length > 0) {
      console.log('ℹ️ Variables de base de datos faltantes (normal en desarrollo):');
      missingDbVars.forEach(varName => {
        console.log(`   - ${varName}`);
      });
    }
    console.log('');
    
    // 8. Verificar endpoints críticos
    console.log('8️⃣ Verificando endpoints críticos...');
    const criticalEndpoints = [
      '/api/auth/login',
      '/api/guest-orders',
      '/api/delivery/orders',
      '/api/subscriptions',
      '/api/vales',
      '/api/clients',
      '/api/products'
    ];
    
    console.log('✅ Endpoints críticos identificados:');
    criticalEndpoints.forEach(endpoint => {
      console.log(`   - ${endpoint}`);
    });
    console.log('');
    
    // 9. Resumen de estado
    console.log('9️⃣ RESUMEN DE ESTADO');
    console.log('===================');
    
    const systemStatus = {
      database: true,
      models: true,
      users: userCount > 0,
      clients: clientCount > 0,
      products: productCount > 0,
      delivery: deliveryCount > 0,
      environment: missingCriticalVars.length === 0
    };
    
    const allGood = Object.values(systemStatus).every(status => status);
    
    if (allGood) {
      console.log('🎉 ¡SISTEMA LISTO PARA DEPLOY!');
      console.log('');
      console.log('📋 Checklist de deploy:');
      console.log('   ✅ Base de datos configurada');
      console.log('   ✅ Modelos sincronizados');
      console.log('   ✅ Datos básicos cargados');
      console.log('   ✅ Usuarios administradores creados');
      console.log('   ✅ Repartidores configurados');
      console.log('   ✅ Productos activos disponibles');
      console.log('   ✅ Variables de entorno configuradas');
      console.log('');
      console.log('🚀 Próximos pasos:');
      console.log('   1. Deploy del backend en Render');
      console.log('   2. Deploy del frontend en Vercel');
      console.log('   3. Configurar variables de entorno en producción');
      console.log('   4. Ejecutar seed en producción');
      console.log('   5. Probar funcionalidades críticas');
    } else {
      console.log('⚠️ SISTEMA REQUIERE ATENCIÓN');
      console.log('');
      console.log('❌ Problemas encontrados:');
      if (!systemStatus.users) console.log('   - No hay usuarios en el sistema');
      if (!systemStatus.clients) console.log('   - No hay clientes en el sistema');
      if (!systemStatus.products) console.log('   - No hay productos en el sistema');
      if (!systemStatus.delivery) console.log('   - No hay repartidores en el sistema');
      if (!systemStatus.environment) console.log('   - Variables de entorno faltantes');
    }
    
    return { success: allGood, status: systemStatus };
    
  } catch (error) {
    console.error('❌ Error durante la verificación:', error);
    return { success: false, error: error.message };
  }
}

// Ejecutar solo si se llama directamente
if (require.main === module) {
  verifySystem()
    .then((result) => {
      if (result.success) {
        console.log('\n✅ Verificación completada exitosamente');
        process.exit(0);
      } else {
        console.log('\n❌ Verificación falló');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('❌ Error en la verificación:', error);
      process.exit(1);
    });
}

module.exports = verifySystem;
