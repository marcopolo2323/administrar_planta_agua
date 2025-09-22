const { sequelize, SubscriptionPlan } = require('../models');

async function syncAndSeed() {
  try {
    console.log('🔄 Sincronizando modelos con la base de datos...');
    
    // Sincronizar todos los modelos
    await sequelize.sync({ alter: true });
    console.log('✅ Modelos sincronizados exitosamente');
    
    console.log('🌱 Poblando planes de suscripción...');
    
    const plans = [
      {
        name: 'Plan 15 Bidones',
        description: 'Por cada 15 bidones: 1 recarga mensual gratis',
        totalBottles: 15,
        bonusBottles: 1,
        monthlyPrice: 75.00,
        pricePerBottle: 5.00,
        bonusPercentage: 6.67,
        maxDailyDelivery: 2,
        sortOrder: 1
      },
      {
        name: 'Plan 25 Bidones',
        description: 'Por cada 25 bidones: 2 recargas mensual gratis',
        totalBottles: 25,
        bonusBottles: 2,
        monthlyPrice: 125.00,
        pricePerBottle: 5.00,
        bonusPercentage: 8.00,
        maxDailyDelivery: 3,
        sortOrder: 2
      },
      {
        name: 'Plan 30 Bidones',
        description: 'Por cada 30 bidones: 5 recargas mensual gratis',
        totalBottles: 30,
        bonusBottles: 5,
        monthlyPrice: 150.00,
        pricePerBottle: 5.00,
        bonusPercentage: 16.67,
        maxDailyDelivery: 4,
        sortOrder: 3
      },
      {
        name: 'Plan 40 Bidones',
        description: 'Por cada 40 bidones: 7 recargas mensual gratis',
        totalBottles: 40,
        bonusBottles: 7,
        monthlyPrice: 196.00,
        pricePerBottle: 4.90,
        bonusPercentage: 17.50,
        maxDailyDelivery: 5,
        sortOrder: 4
      },
      {
        name: 'Plan 50 Bidones',
        description: 'Por cada 50 bidones: 8 recargas mensual gratis',
        totalBottles: 50,
        bonusBottles: 8,
        monthlyPrice: 235.00,
        pricePerBottle: 4.70,
        bonusPercentage: 16.00,
        maxDailyDelivery: 6,
        sortOrder: 5
      },
      {
        name: 'Plan 100 Bidones',
        description: 'Por cada 100 bidones: 9 recargas mensual gratis',
        totalBottles: 100,
        bonusBottles: 9,
        monthlyPrice: 460.00,
        pricePerBottle: 4.60,
        bonusPercentage: 9.00,
        maxDailyDelivery: 10,
        sortOrder: 6
      },
      {
        name: 'Plan 200 Bidones',
        description: 'Por cada 200 bidones: 25 recargas mensual gratis',
        totalBottles: 200,
        bonusBottles: 25,
        monthlyPrice: 900.00,
        pricePerBottle: 4.50,
        bonusPercentage: 12.50,
        maxDailyDelivery: 20,
        sortOrder: 7
      }
    ];

    let createdCount = 0;
    let updatedCount = 0;

    for (const planData of plans) {
      try {
        const [plan, created] = await SubscriptionPlan.findOrCreate({
          where: { name: planData.name },
          defaults: planData
        });

        if (created) {
          console.log(`✅ Plan creado: ${plan.name}`);
          createdCount++;
        } else {
          // Actualizar plan existente
          await plan.update(planData);
          console.log(`🔄 Plan actualizado: ${plan.name}`);
          updatedCount++;
        }
      } catch (error) {
        console.error(`❌ Error con plan ${planData.name}:`, error.message);
      }
    }

    console.log(`\n📊 Resumen de planes de suscripción:`);
    console.log(`   ✅ Planes creados: ${createdCount}`);
    console.log(`   🔄 Planes actualizados: ${updatedCount}`);
    console.log(`   📋 Total de planes: ${createdCount + updatedCount}`);

    // Mostrar todos los planes creados
    const allPlans = await SubscriptionPlan.findAll({
      where: { isActive: true },
      order: [['sortOrder', 'ASC']]
    });

    console.log(`\n📋 Planes de suscripción disponibles:`);
    allPlans.forEach(plan => {
      console.log(`   ${plan.sortOrder}. ${plan.name}`);
      console.log(`      💧 Bidones: ${plan.totalBottles} + ${plan.bonusBottles} bonus`);
      console.log(`      💰 Precio mensual: S/ ${plan.monthlyPrice}`);
      console.log(`      💵 Precio por bidón: S/ ${plan.pricePerBottle}`);
      console.log(`      🎁 Bonificación: ${plan.bonusPercentage}%`);
      console.log(`      🚚 Entregas máximas diarias: ${plan.maxDailyDelivery}`);
      console.log('');
    });

    console.log('✅ Sincronización y poblado completados exitosamente');
    
  } catch (error) {
    console.error('❌ Error en sincronización y poblado:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  syncAndSeed()
    .then(() => {
      console.log('✅ Proceso completado');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Error en el proceso:', error);
      process.exit(1);
    });
}

module.exports = syncAndSeed;
