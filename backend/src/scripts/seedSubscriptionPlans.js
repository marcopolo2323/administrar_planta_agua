const { SubscriptionPlan, sequelize } = require('../models');

async function seedSubscriptionPlans() {
  try {
    console.log('🔄 Poblando planes de suscripción...');

    const plans = [
      {
        name: 'Plan Básico - 20 Bidones',
        description: 'Plan ideal para hogares pequeños. Incluye 20 bidones al mes.',
        totalBottles: 20,
        bonusBottles: 0,
        monthlyPrice: 100.00,
        pricePerBottle: 5.00,
        bonusPercentage: 0,
        maxDailyDelivery: 2,
        sortOrder: 1
      },
      {
        name: 'Plan Familiar - 30 Bidones',
        description: 'Perfecto para familias. 30 bidones + 2 bidones gratis.',
        totalBottles: 30,
        bonusBottles: 2,
        monthlyPrice: 150.00,
        pricePerBottle: 5.00,
        bonusPercentage: 6.67,
        maxDailyDelivery: 3,
        sortOrder: 2
      },
      {
        name: 'Plan Premium - 50 Bidones',
        description: 'Nuestro plan más popular. 50 bidones + 5 bidones gratis.',
        totalBottles: 50,
        bonusBottles: 5,
        monthlyPrice: 250.00,
        pricePerBottle: 5.00,
        bonusPercentage: 10.00,
        maxDailyDelivery: 5,
        sortOrder: 3
      },
      {
        name: 'Plan Empresarial - 100 Bidones',
        description: 'Para oficinas y empresas. 100 bidones + 15 bidones gratis.',
        totalBottles: 100,
        bonusBottles: 15,
        monthlyPrice: 500.00,
        pricePerBottle: 5.00,
        bonusPercentage: 15.00,
        maxDailyDelivery: 10,
        sortOrder: 4
      },
      {
        name: 'Plan Mega - 200 Bidones',
        description: 'Para grandes consumidores. 200 bidones + 40 bidones gratis.',
        totalBottles: 200,
        bonusBottles: 40,
        monthlyPrice: 1000.00,
        pricePerBottle: 5.00,
        bonusPercentage: 20.00,
        maxDailyDelivery: 20,
        sortOrder: 5
      }
    ];

    let createdCount = 0;
    let updatedCount = 0;

    for (const planData of plans) {
      try {
        // Verificar si el plan ya existe
        const existingPlan = await SubscriptionPlan.findOne({
          where: { name: planData.name }
        });

        if (existingPlan) {
          // Actualizar plan existente
          await existingPlan.update(planData);
          console.log(`✅ Plan actualizado: ${planData.name}`);
          updatedCount++;
        } else {
          // Crear nuevo plan
          await SubscriptionPlan.create(planData);
          console.log(`✅ Plan creado: ${planData.name}`);
          createdCount++;
        }
      } catch (error) {
        console.log(`❌ Error con plan ${planData.name}: ${error.message}`);
      }
    }

    console.log('\n📊 RESUMEN:');
    console.log(`✅ Planes creados: ${createdCount}`);
    console.log(`🔄 Planes actualizados: ${updatedCount}`);
    console.log(`📋 Total procesados: ${plans.length}`);

    console.log('\n🎯 PLANES DISPONIBLES:');
    const allPlans = await SubscriptionPlan.findAll({
      where: { isActive: true },
      order: [['sortOrder', 'ASC']]
    });

    allPlans.forEach(plan => {
      console.log(`\n📦 ${plan.name}`);
      console.log(`   Precio: S/ ${plan.monthlyPrice}`);
      console.log(`   Bidones: ${plan.totalBottles} + ${plan.bonusBottles} gratis`);
      console.log(`   Total: ${plan.totalBottles + plan.bonusBottles} bidones`);
      console.log(`   Bonificación: ${plan.bonusPercentage}%`);
      console.log(`   Máximo diario: ${plan.maxDailyDelivery} bidones`);
    });

    console.log('\n🎉 Poblado de planes completado!');

  } catch (error) {
    console.error('❌ Error durante el poblado:', error);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar el poblado
seedSubscriptionPlans();
