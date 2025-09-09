const { Subscription, SubscriptionPlan, Client, Order, sequelize } = require('../models');

// Obtener todos los planes de suscripción
exports.getSubscriptionPlans = async (req, res) => {
  try {
    const plans = await SubscriptionPlan.findAll({
      where: { isActive: true },
      order: [['sortOrder', 'ASC'], ['monthlyPrice', 'ASC']]
    });

    return res.status(200).json(plans);
  } catch (error) {
    console.error('Error al obtener planes de suscripción:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Crear un nuevo plan de suscripción
exports.createSubscriptionPlan = async (req, res) => {
  try {
    const {
      name,
      description,
      totalBottles,
      bonusBottles,
      monthlyPrice,
      maxDailyDelivery,
      sortOrder
    } = req.body;

    // Calcular precio por bidón
    const pricePerBottle = monthlyPrice / totalBottles;
    const bonusPercentage = (bonusBottles / totalBottles) * 100;

    const plan = await SubscriptionPlan.create({
      name,
      description,
      totalBottles,
      bonusBottles,
      monthlyPrice,
      pricePerBottle,
      bonusPercentage,
      maxDailyDelivery,
      sortOrder: sortOrder || 0
    });

    return res.status(201).json({
      message: 'Plan de suscripción creado correctamente',
      plan
    });
  } catch (error) {
    console.error('Error al crear plan de suscripción:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Obtener suscripciones de un cliente
exports.getClientSubscriptions = async (req, res) => {
  try {
    const { clientId } = req.params;

    const subscriptions = await Subscription.findAll({
      where: { clientId, isActive: true },
      include: [
        {
          model: SubscriptionPlan,
          as: 'plan'
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json(subscriptions);
  } catch (error) {
    console.error('Error al obtener suscripciones del cliente:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Crear una nueva suscripción para un cliente
exports.createSubscription = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const {
      clientId,
      planId,
      startDate,
      notes
    } = req.body;

    // Obtener el plan
    const plan = await SubscriptionPlan.findByPk(planId);
    if (!plan) {
      return res.status(404).json({ message: 'Plan no encontrado' });
    }

    // Verificar que el cliente existe
    const client = await Client.findByPk(clientId);
    if (!client) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    // Calcular fechas
    const start = new Date(startDate);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1); // Suscripción mensual

    // Crear la suscripción
    const subscription = await Subscription.create({
      clientId,
      planId,
      planName: plan.name,
      totalBottles: plan.totalBottles,
      bonusBottles: plan.bonusBottles,
      totalBottlesWithBonus: plan.totalBottles + plan.bonusBottles,
      monthlyPrice: plan.monthlyPrice,
      pricePerBottle: plan.pricePerBottle,
      bottlesDelivered: 0,
      bottlesRemaining: plan.totalBottles + plan.bonusBottles,
      startDate: start,
      endDate: end,
      status: 'active',
      maxDailyDelivery: plan.maxDailyDelivery,
      notes
    }, { transaction });

    await transaction.commit();

    return res.status(201).json({
      message: 'Suscripción creada correctamente',
      subscription
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error al crear suscripción:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Procesar pedido con suscripción
exports.processSubscriptionOrder = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const {
      subscriptionId,
      bottlesRequested,
      deliveryAddress,
      deliveryDistrict,
      contactPhone,
      notes
    } = req.body;

    // Obtener la suscripción
    const subscription = await Subscription.findByPk(subscriptionId, {
      include: [{ model: Client, as: 'client' }]
    });

    if (!subscription) {
      return res.status(404).json({ message: 'Suscripción no encontrada' });
    }

    if (subscription.status !== 'active') {
      return res.status(400).json({ message: 'La suscripción no está activa' });
    }

    if (subscription.bottlesRemaining < bottlesRequested) {
      return res.status(400).json({ 
        message: `Solo quedan ${subscription.bottlesRemaining} bidones en la suscripción` 
      });
    }

    // Verificar límite diario si existe
    if (subscription.maxDailyDelivery && bottlesRequested > subscription.maxDailyDelivery) {
      return res.status(400).json({ 
        message: `El máximo de bidones por día es ${subscription.maxDailyDelivery}` 
      });
    }

    // Crear el pedido
    const order = await Order.create({
      clientId: subscription.clientId,
      orderDate: new Date(),
      subtotal: 0, // Los bidones de suscripción no tienen costo adicional
      total: 0,
      status: 'pendiente',
      paymentStatus: 'pagado', // Ya está pagado por la suscripción
      paymentMethod: 'suscripcion',
      deliveryAddress: deliveryAddress || subscription.client.address,
      deliveryDistrict: deliveryDistrict || subscription.client.district,
      contactPhone: contactPhone || subscription.client.phone,
      notes: notes || `Pedido desde suscripción: ${subscription.planName}`,
      subscriptionId: subscription.id,
      isSubscriptionOrder: true,
      bottlesFromSubscription: bottlesRequested
    }, { transaction });

    // Actualizar la suscripción
    await subscription.update({
      bottlesDelivered: subscription.bottlesDelivered + bottlesRequested,
      bottlesRemaining: subscription.bottlesRemaining - bottlesRequested
    }, { transaction });

    // Si se agotaron los bidones, marcar como completada
    if (subscription.bottlesRemaining <= 0) {
      await subscription.update({ status: 'completed' }, { transaction });
    }

    await transaction.commit();

    return res.status(201).json({
      message: 'Pedido procesado correctamente',
      order,
      subscription: {
        bottlesDelivered: subscription.bottlesDelivered + bottlesRequested,
        bottlesRemaining: subscription.bottlesRemaining - bottlesRequested
      }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error al procesar pedido de suscripción:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Obtener estadísticas de suscripciones
exports.getSubscriptionStats = async (req, res) => {
  try {
    const stats = await sequelize.query(`
      SELECT 
        COUNT(*) as total_subscriptions,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_subscriptions,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_subscriptions,
        SUM(CASE WHEN status = 'active' THEN monthly_price ELSE 0 END) as monthly_revenue,
        SUM(bottles_delivered) as total_bottles_delivered,
        SUM(bottles_remaining) as total_bottles_remaining
      FROM Subscriptions 
      WHERE is_active = true
    `, {
      type: sequelize.QueryTypes.SELECT
    });

    return res.status(200).json(stats[0]);
  } catch (error) {
    console.error('Error al obtener estadísticas de suscripciones:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Pausar/Reanudar suscripción
exports.updateSubscriptionStatus = async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const { status } = req.body;

    const subscription = await Subscription.findByPk(subscriptionId);
    if (!subscription) {
      return res.status(404).json({ message: 'Suscripción no encontrada' });
    }

    await subscription.update({ status });

    return res.status(200).json({
      message: 'Estado de suscripción actualizado correctamente',
      subscription
    });
  } catch (error) {
    console.error('Error al actualizar estado de suscripción:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};
