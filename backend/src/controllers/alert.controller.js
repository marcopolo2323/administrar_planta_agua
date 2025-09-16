const Vale = require('../models/vale.model');
const ClientPreference = require('../models/clientPreference.model');
const Client = require('../models/client.model');
const { Op } = require('sequelize');

// Obtener alertas para el admin
const getAdminAlerts = async (req, res) => {
  try {
    const alerts = [];
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000));

    // 1. Alertas de vales por vencer (próximos 7 días)
    const expiringVales = await Vale.findAll({
      where: {
        status: 'active',
        dueDate: {
          [Op.between]: [now, sevenDaysFromNow]
        }
      },
      include: [{
        model: Client,
        as: 'client',
        attributes: ['id', 'name', 'phone', 'email']
      }],
      order: [['dueDate', 'ASC']]
    });

    if (expiringVales.length > 0) {
      alerts.push({
        type: 'expiring_vales',
        title: 'Vales por Vencer',
        message: `${expiringVales.length} vale(s) vencen en los próximos 7 días`,
        count: expiringVales.length,
        data: expiringVales,
        priority: 'high'
      });
    }

    // 2. Alertas de vales vencidos
    const expiredVales = await Vale.findAll({
      where: {
        status: 'active',
        dueDate: {
          [Op.lt]: now
        }
      },
      include: [{
        model: Client,
        as: 'client',
        attributes: ['id', 'name', 'phone', 'email']
      }],
      order: [['dueDate', 'ASC']]
    });

    if (expiredVales.length > 0) {
      alerts.push({
        type: 'expired_vales',
        title: 'Vales Vencidos',
        message: `${expiredVales.length} vale(s) han vencido`,
        count: expiredVales.length,
        data: expiredVales,
        priority: 'urgent'
      });
    }

    // 3. Alertas de preferencias por vencer (próximos 7 días)
    const expiringPreferences = await ClientPreference.findAll({
      where: {
        isActive: true,
        validUntil: {
          [Op.between]: [now, sevenDaysFromNow]
        }
      },
      include: [{
        model: Client,
        as: 'client',
        attributes: ['id', 'name', 'phone', 'email']
      }],
      order: [['validUntil', 'ASC']]
    });

    if (expiringPreferences.length > 0) {
      alerts.push({
        type: 'expiring_preferences',
        title: 'Preferencias por Vencer',
        message: `${expiringPreferences.length} cliente(s) con preferencias que vencen pronto`,
        count: expiringPreferences.length,
        data: expiringPreferences,
        priority: 'medium'
      });
    }

    // 4. Resumen de vales activos
    const activeVales = await Vale.findAll({
      where: { status: 'active' },
      include: [{
        model: Client,
        as: 'client',
        attributes: ['id', 'name', 'phone', 'email']
      }]
    });

    const totalAmount = activeVales.reduce((sum, vale) => sum + parseFloat(vale.amount || 0), 0);
    const totalUsed = activeVales.reduce((sum, vale) => sum + parseFloat(vale.usedAmount || 0), 0);
    const totalRemaining = totalAmount - totalUsed;

    alerts.push({
      type: 'vales_summary',
      title: 'Resumen de Vales',
      message: `Total: S/ ${totalAmount.toFixed(2)} | Usado: S/ ${totalUsed.toFixed(2)} | Restante: S/ ${totalRemaining.toFixed(2)}`,
      count: activeVales.length,
      data: {
        total: activeVales.length,
        totalAmount,
        totalUsed,
        totalRemaining
      },
      priority: 'info'
    });

    res.json({
      success: true,
      data: alerts,
      summary: {
        totalAlerts: alerts.length,
        urgent: alerts.filter(a => a.priority === 'urgent').length,
        high: alerts.filter(a => a.priority === 'high').length,
        medium: alerts.filter(a => a.priority === 'medium').length,
        info: alerts.filter(a => a.priority === 'info').length
      }
    });
  } catch (error) {
    console.error('Error al obtener alertas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener vales de un cliente específico para pago
const getClientValesForPayment = async (req, res) => {
  try {
    const { clientId } = req.params;
    
    const vales = await Vale.findAll({
      where: { 
        clientId,
        status: 'active'
      },
      include: [{
        model: Client,
        as: 'client',
        attributes: ['id', 'name', 'phone', 'email']
      }],
      order: [['createdAt', 'ASC']]
    });

    const totalAmount = vales.reduce((sum, vale) => sum + parseFloat(vale.amount || 0), 0);
    const totalUsed = vales.reduce((sum, vale) => sum + parseFloat(vale.usedAmount || 0), 0);
    const totalRemaining = totalAmount - totalUsed;

    res.json({
      success: true,
      data: {
        vales,
        summary: {
          total: vales.length,
          totalAmount,
          totalUsed,
          totalRemaining
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener vales del cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

module.exports = {
  getAdminAlerts,
  getClientValesForPayment
};
