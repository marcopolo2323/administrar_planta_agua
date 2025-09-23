const { Subscription, GuestOrder, GuestOrderProduct, Product, Client } = require('../models');

// Obtener suscripciones de un cliente por DNI
const getClientSubscriptions = async (req, res) => {
  try {
    const { dni } = req.params;

    const subscriptions = await Subscription.findAll({
      where: {
        clientDni: dni,
        status: 'active'
      },
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: subscriptions
    });
  } catch (error) {
    console.error('Error al obtener suscripciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Crear nueva suscripción
const createSubscription = async (req, res) => {
  try {
    const {
      clientId,
      clientDni,
      subscriptionType,
      totalBottles,
      totalAmount,
      paidAmount,
      expiryDate,
      notes
    } = req.body;

    // Validar datos requeridos
    if (!clientDni || !subscriptionType || !totalBottles || !totalAmount) {
      return res.status(400).json({
        success: false,
        message: 'Datos requeridos faltantes'
      });
    }

    // Crear la suscripción
    const subscription = await Subscription.create({
      clientId: clientId || 0, // Usar 0 si no hay clientId
      clientDni,
      subscriptionType,
      totalBottles: parseInt(totalBottles),
      remainingBottles: parseInt(totalBottles),
      totalAmount: parseFloat(totalAmount),
      paidAmount: parseFloat(paidAmount || totalAmount),
      status: 'active',
      purchaseDate: new Date(),
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      notes
    });

    res.status(201).json({
      success: true,
      data: subscription
    });
  } catch (error) {
    console.error('Error al crear suscripción:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Usar bidones de una suscripción
const useSubscriptionBottles = async (req, res) => {
  try {
    const { subscriptionId, bottlesToUse } = req.body;

    if (!subscriptionId || !bottlesToUse) {
      return res.status(400).json({
        success: false,
        message: 'ID de suscripción y cantidad de bidones son requeridos'
      });
    }

    const subscription = await Subscription.findByPk(subscriptionId);
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Suscripción no encontrada'
      });
    }

    if (subscription.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'La suscripción no está activa'
      });
    }

    if (subscription.remainingBottles < bottlesToUse) {
      return res.status(400).json({
        success: false,
        message: 'No hay suficientes bidones disponibles en la suscripción'
      });
    }

    // Descontar bidones
    const newRemainingBottles = subscription.remainingBottles - bottlesToUse;
    const newStatus = newRemainingBottles === 0 ? 'completed' : 'active';

    await subscription.update({
      remainingBottles: newRemainingBottles,
      status: newStatus
    });

    res.json({
      success: true,
      data: {
        subscriptionId: subscription.id,
        remainingBottles: newRemainingBottles,
        status: newStatus,
        bottlesUsed: bottlesToUse
      }
    });
  } catch (error) {
    console.error('Error al usar bidones de suscripción:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener todas las suscripciones
const getAllSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.findAll({
      include: [
        {
          model: Client,
          as: 'client',
          attributes: ['id', 'name', 'email', 'phone', 'documentNumber']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: subscriptions
    });
  } catch (error) {
    console.error('Error al obtener suscripciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Actualizar suscripción
const updateSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remainingBottles, notes } = req.body;

    const subscription = await Subscription.findByPk(id);
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Suscripción no encontrada'
      });
    }

    await subscription.update({
      status: status || subscription.status,
      remainingBottles: remainingBottles !== undefined ? parseInt(remainingBottles) : subscription.remainingBottles,
      notes: notes !== undefined ? notes : subscription.notes
    });

    res.json({
      success: true,
      data: subscription
    });
  } catch (error) {
    console.error('Error al actualizar suscripción:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener estadísticas de suscripciones
const getSubscriptionStats = async (req, res) => {
  try {
    const totalSubscriptions = await Subscription.count();
    const activeSubscriptions = await Subscription.count({
      where: { status: 'active' }
    });
    const completedSubscriptions = await Subscription.count({
      where: { status: 'completed' }
    });

    // Obtener también la lista de suscripciones para el admin
    const subscriptions = await Subscription.findAll({
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        total: totalSubscriptions,
        active: activeSubscriptions,
        completed: completedSubscriptions,
        subscriptions: subscriptions
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas de suscripciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

module.exports = {
  getClientSubscriptions,
  createSubscription,
  useSubscriptionBottles,
  getAllSubscriptions,
  updateSubscription,
  getSubscriptionStats
};