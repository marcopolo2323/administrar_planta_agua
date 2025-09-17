const { Vale, Client, GuestOrder } = require('../models');
const { Op } = require('sequelize');

// Obtener todos los vales
const getVales = async (req, res) => {
  try {
    const vales = await Vale.findAll({
      include: [{
        model: Client,
        as: 'client',
        attributes: ['id', 'name', 'phone', 'email']
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: vales
    });
  } catch (error) {
    console.error('Error al obtener vales:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener vales de un cliente específico
const getClientVales = async (req, res) => {
  try {
    const { clientId } = req.params;
    
    const vales = await Vale.findAll({
      where: { clientId },
      include: [{
        model: Client,
        as: 'client',
        attributes: ['id', 'name', 'phone', 'email']
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: vales
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

// Crear un nuevo vale
const createVale = async (req, res) => {
  try {
    const { clientId, amount, description, dueDate } = req.body;

    if (!clientId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Cliente y monto son requeridos'
      });
    }

    // Verificar que el cliente existe
    const client = await Client.findByPk(clientId);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    const vale = await Vale.create({
      clientId,
      amount: parseFloat(amount),
      description,
      dueDate: dueDate ? new Date(dueDate) : null,
      status: 'active'
    });

    // Cargar el vale con los datos del cliente
    const valeWithClient = await Vale.findByPk(vale.id, {
      include: [{
        model: Client,
        as: 'client',
        attributes: ['id', 'name', 'phone', 'email']
      }]
    });

    res.status(201).json({
      success: true,
      data: valeWithClient,
      message: 'Vale creado exitosamente'
    });
  } catch (error) {
    console.error('Error al crear vale:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Actualizar un vale
const updateVale = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, description, dueDate, status } = req.body;

    const vale = await Vale.findByPk(id);
    if (!vale) {
      return res.status(404).json({
        success: false,
        message: 'Vale no encontrado'
      });
    }

    // Actualizar campos
    if (amount !== undefined) vale.amount = parseFloat(amount);
    if (description !== undefined) vale.description = description;
    if (dueDate !== undefined) vale.dueDate = dueDate ? new Date(dueDate) : null;
    if (status !== undefined) vale.status = status;

    await vale.save();

    // Cargar el vale actualizado con los datos del cliente
    const updatedVale = await Vale.findByPk(vale.id, {
      include: [{
        model: Client,
        as: 'client',
        attributes: ['id', 'name', 'phone', 'email']
      }]
    });

    res.json({
      success: true,
      data: updatedVale,
      message: 'Vale actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error al actualizar vale:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Usar un vale (cuando se hace un pedido)
const useVale = async (req, res) => {
  try {
    const { valeId, amount } = req.body;

    if (!valeId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'ID del vale y monto son requeridos'
      });
    }

    const vale = await Vale.findByPk(valeId);
    if (!vale) {
      return res.status(404).json({
        success: false,
        message: 'Vale no encontrado'
      });
    }

    if (vale.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'El vale no está activo'
      });
    }

    const useAmount = parseFloat(amount);
    const newUsedAmount = parseFloat(vale.usedAmount) + useAmount;
    const remainingAmount = parseFloat(vale.amount) - newUsedAmount;

    if (remainingAmount < 0) {
      return res.status(400).json({
        success: false,
        message: 'El vale no tiene suficiente saldo'
      });
    }

    // Actualizar el vale
    vale.usedAmount = newUsedAmount;
    vale.remainingAmount = remainingAmount;
    vale.status = remainingAmount <= 0 ? 'used' : 'active';
    
    await vale.save();

    res.json({
      success: true,
      data: vale,
      message: 'Vale usado exitosamente'
    });
  } catch (error) {
    console.error('Error al usar vale:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener reporte de cobranza mensual por cliente
const getMonthlyCollectionReport = async (req, res) => {
  try {
    const { year, month } = req.query;
    
    // Si no se especifica año/mes, usar el mes actual
    const currentDate = new Date();
    const targetYear = year ? parseInt(year) : currentDate.getFullYear();
    const targetMonth = month ? parseInt(month) : currentDate.getMonth() + 1;
    
    // Crear fechas de inicio y fin del mes
    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);
    
    console.log(`Generando reporte de cobranza para ${targetMonth}/${targetYear}`);
    console.log(`Rango de fechas: ${startDate.toISOString()} - ${endDate.toISOString()}`);
    
    // Obtener vales activos del mes especificado
    const vales = await Vale.findAll({
      where: {
        status: 'active',
        createdAt: {
          [Op.between]: [startDate, endDate]
        }
      },
      include: [{
        model: Client,
        as: 'client',
        attributes: ['id', 'name', 'email', 'phone', 'documentNumber']
      }],
      order: [['clientId', 'ASC']]
    });
    
    // Agrupar por cliente y calcular totales
    const clientTotals = {};
    
    vales.forEach(vale => {
      const clientId = vale.clientId;
      if (!clientTotals[clientId]) {
        clientTotals[clientId] = {
          client: vale.client,
          totalAmount: 0,
          usedAmount: 0,
          remainingAmount: 0,
          valesCount: 0,
          vales: []
        };
      }
      
      clientTotals[clientId].totalAmount += parseFloat(vale.amount);
      clientTotals[clientId].usedAmount += parseFloat(vale.usedAmount);
      clientTotals[clientId].remainingAmount += parseFloat(vale.remainingAmount);
      clientTotals[clientId].valesCount += 1;
      clientTotals[clientId].vales.push({
        id: vale.id,
        amount: parseFloat(vale.amount),
        usedAmount: parseFloat(vale.usedAmount),
        remainingAmount: parseFloat(vale.remainingAmount),
        description: vale.description,
        dueDate: vale.dueDate,
        createdAt: vale.createdAt
      });
    });
    
    // Convertir a array y ordenar por monto restante (deuda)
    const reportData = Object.values(clientTotals)
      .filter(client => client.remainingAmount > 0) // Solo clientes con deuda
      .sort((a, b) => b.remainingAmount - a.remainingAmount);
    
    // Calcular totales generales
    const totalDebt = reportData.reduce((sum, client) => sum + client.remainingAmount, 0);
    const totalClients = reportData.length;
    const totalVales = reportData.reduce((sum, client) => sum + client.valesCount, 0);
    
    res.json({
      success: true,
      data: {
        period: {
          year: targetYear,
          month: targetMonth,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        },
        summary: {
          totalClients,
          totalVales,
          totalDebt: parseFloat(totalDebt.toFixed(2))
        },
        clients: reportData
      }
    });
  } catch (error) {
    console.error('Error al obtener reporte de cobranza:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener estadísticas de vales
const getValeStats = async (req, res) => {
  try {
    const totalVales = await Vale.count();
    const activeVales = await Vale.count({ where: { status: 'active' } });
    const usedVales = await Vale.count({ where: { status: 'used' } });
    const expiredVales = await Vale.count({ where: { status: 'expired' } });
    
    const totalAmount = await Vale.sum('amount');
    const usedAmount = await Vale.sum('usedAmount');
    const remainingAmount = await Vale.sum('remainingAmount');

    res.json({
      success: true,
      data: {
        total: totalVales,
        active: activeVales,
        used: usedVales,
        expired: expiredVales,
        totalAmount: totalAmount || 0,
        usedAmount: usedAmount || 0,
        remainingAmount: remainingAmount || 0
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas de vales:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

module.exports = {
  getVales,
  getClientVales,
  createVale,
  updateVale,
  useVale,
  getValeStats,
  getMonthlyCollectionReport
};
