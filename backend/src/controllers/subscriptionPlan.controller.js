const { SubscriptionPlan } = require('../models');

// Obtener todos los planes de suscripción activos
const getAllPlans = async (req, res) => {
  try {
    const plans = await SubscriptionPlan.findAll({
      where: { isActive: true },
      order: [['sortOrder', 'ASC'], ['totalBottles', 'ASC']]
    });

    res.json({
      success: true,
      data: plans
    });
  } catch (error) {
    console.error('Error al obtener planes de suscripción:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener un plan específico por ID
const getPlanById = async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await SubscriptionPlan.findByPk(id);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan de suscripción no encontrado'
      });
    }

    res.json({
      success: true,
      data: plan
    });
  } catch (error) {
    console.error('Error al obtener plan de suscripción:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Crear nuevo plan de suscripción
const createPlan = async (req, res) => {
  try {
    const {
      name,
      description,
      totalBottles,
      bonusBottles,
      monthlyPrice,
      pricePerBottle,
      bonusPercentage,
      maxDailyDelivery,
      sortOrder
    } = req.body;

    // Validar datos requeridos
    if (!name || !totalBottles || !monthlyPrice || !pricePerBottle) {
      return res.status(400).json({
        success: false,
        message: 'Datos requeridos faltantes'
      });
    }

    const plan = await SubscriptionPlan.create({
      name,
      description,
      totalBottles: parseInt(totalBottles),
      bonusBottles: parseInt(bonusBottles || 0),
      monthlyPrice: parseFloat(monthlyPrice),
      pricePerBottle: parseFloat(pricePerBottle),
      bonusPercentage: parseFloat(bonusPercentage || 0),
      maxDailyDelivery: parseInt(maxDailyDelivery || 1),
      sortOrder: parseInt(sortOrder || 0),
      isActive: true
    });

    res.status(201).json({
      success: true,
      data: plan
    });
  } catch (error) {
    console.error('Error al crear plan de suscripción:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Actualizar plan de suscripción
const updatePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const plan = await SubscriptionPlan.findByPk(id);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan de suscripción no encontrado'
      });
    }

    await plan.update(updateData);

    res.json({
      success: true,
      data: plan
    });
  } catch (error) {
    console.error('Error al actualizar plan de suscripción:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Eliminar plan de suscripción (soft delete)
const deletePlan = async (req, res) => {
  try {
    const { id } = req.params;

    const plan = await SubscriptionPlan.findByPk(id);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan de suscripción no encontrado'
      });
    }

    await plan.update({ isActive: false });

    res.json({
      success: true,
      message: 'Plan de suscripción desactivado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar plan de suscripción:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener estadísticas de planes de suscripción
const getPlanStats = async (req, res) => {
  try {
    const totalPlans = await SubscriptionPlan.count();
    const activePlans = await SubscriptionPlan.count({ where: { isActive: true } });
    const inactivePlans = await SubscriptionPlan.count({ where: { isActive: false } });

    res.json({
      success: true,
      data: {
        totalPlans,
        activePlans,
        inactivePlans
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas de planes:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

module.exports = {
  getAllPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan,
  getPlanStats
};
