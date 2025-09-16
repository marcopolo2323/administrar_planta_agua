const Vale = require('../models/vale.model');
const Client = require('../models/client.model');
const { Op } = require('sequelize');

// Procesar pago de vales por PLIN
const processValePayment = async (req, res) => {
  try {
    const { clientId, paymentMethod, paymentAmount, paymentReference } = req.body;

    if (!clientId || !paymentMethod || !paymentAmount) {
      return res.status(400).json({
        success: false,
        message: 'Cliente, método de pago y monto son requeridos'
      });
    }

    // Obtener vales activos del cliente
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

    if (vales.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No hay vales activos para este cliente'
      });
    }

    const totalRemaining = vales.reduce((sum, vale) => sum + parseFloat(vale.remainingAmount || 0), 0);
    
    if (parseFloat(paymentAmount) < totalRemaining) {
      return res.status(400).json({
        success: false,
        message: `El monto pagado (S/ ${paymentAmount}) es menor al saldo pendiente (S/ ${totalRemaining.toFixed(2)})`
      });
    }

    // Marcar todos los vales como pagados
    for (const vale of vales) {
      vale.status = 'used';
      vale.usedAmount = vale.amount; // Marcar como completamente usado
      vale.remainingAmount = 0;
      await vale.save();
    }

    // Calcular cambio si es necesario
    const change = parseFloat(paymentAmount) - totalRemaining;

    res.json({
      success: true,
      data: {
        vales,
        payment: {
          method: paymentMethod,
          amount: parseFloat(paymentAmount),
          reference: paymentReference,
          change: change > 0 ? change : 0
        },
        summary: {
          totalVales: vales.length,
          totalAmount: totalRemaining,
          paidAmount: parseFloat(paymentAmount),
          change: change > 0 ? change : 0
        }
      },
      message: 'Pago de vales procesado exitosamente'
    });
  } catch (error) {
    console.error('Error al procesar pago de vales:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener resumen de vales para pago
const getValePaymentSummary = async (req, res) => {
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
          totalRemaining,
          client: vales[0]?.client || null
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener resumen de vales:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

module.exports = {
  processValePayment,
  getValePaymentSummary
};
