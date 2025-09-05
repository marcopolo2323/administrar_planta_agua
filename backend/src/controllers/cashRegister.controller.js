const CashRegister = require('../models/cashRegister.model');
const CashMovement = require('../models/cashMovement.model');
const User = require('../models/user.model');
const Sale = require('../models/sale.model');
const Order = require('../models/order.model');

// Abrir caja
exports.openCashRegister = async (req, res) => {
  try {
    const { openingAmount, notes } = req.body;
    const userId = req.user.id;

    // Verificar si ya hay una caja abierta
    const openCashRegister = await CashRegister.findOne({
      where: { 
        userId: userId,
        status: 'abierta'
      }
    });

    if (openCashRegister) {
      return res.status(400).json({
        success: false,
        message: 'Ya tienes una caja abierta'
      });
    }

    // Crear nueva caja
    const cashRegister = await CashRegister.create({
      userId: userId,
      openingAmount: openingAmount || 0,
      notes: notes || ''
    });

    // Crear movimiento de apertura
    await CashMovement.create({
      cashRegisterId: cashRegister.id,
      type: 'ingreso',
      amount: openingAmount || 0,
      description: 'Apertura de caja',
      userId: userId
    });

    res.status(201).json({
      success: true,
      message: 'Caja abierta correctamente',
      data: cashRegister
    });
  } catch (error) {
    console.error('Error al abrir caja:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Cerrar caja
exports.closeCashRegister = async (req, res) => {
  try {
    const { closingAmount, notes } = req.body;
    const userId = req.user.id;

    // Buscar caja abierta
    const cashRegister = await CashRegister.findOne({
      where: { 
        userId: userId,
        status: 'abierta'
      }
    });

    if (!cashRegister) {
      return res.status(404).json({
        success: false,
        message: 'No hay caja abierta'
      });
    }

    // Calcular monto esperado
    const movements = await CashMovement.findAll({
      where: { cashRegisterId: cashRegister.id }
    });

    const totalIngresos = movements
      .filter(m => m.type === 'ingreso' || m.type === 'venta')
      .reduce((sum, m) => sum + parseFloat(m.amount), 0);

    const totalEgresos = movements
      .filter(m => m.type === 'egreso' || m.type === 'gasto' || m.type === 'retiro')
      .reduce((sum, m) => sum + parseFloat(m.amount), 0);

    const expectedAmount = parseFloat(cashRegister.openingAmount) + totalIngresos - totalEgresos;
    const difference = parseFloat(closingAmount) - expectedAmount;

    // Actualizar caja
    await cashRegister.update({
      closingDate: new Date(),
      closingAmount: closingAmount,
      expectedAmount: expectedAmount,
      difference: difference,
      status: 'cerrada',
      notes: notes || cashRegister.notes
    });

    // Crear movimiento de cierre
    await CashMovement.create({
      cashRegisterId: cashRegister.id,
      type: 'egreso',
      amount: closingAmount,
      description: 'Cierre de caja',
      userId: userId
    });

    res.json({
      success: true,
      message: 'Caja cerrada correctamente',
      data: {
        ...cashRegister.toJSON(),
        expectedAmount,
        difference,
        totalIngresos,
        totalEgresos
      }
    });
  } catch (error) {
    console.error('Error al cerrar caja:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener caja actual
exports.getCurrentCashRegister = async (req, res) => {
  try {
    const userId = req.user.id;

    const cashRegister = await CashRegister.findOne({
      where: { 
        userId: userId,
        status: 'abierta'
      },
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'name']
        }
      ]
    });

    if (!cashRegister) {
      return res.json({
        success: true,
        data: null,
        message: 'No hay caja abierta'
      });
    }

    // Obtener movimientos
    const movements = await CashMovement.findAll({
      where: { cashRegisterId: cashRegister.id },
      order: [['createdAt', 'DESC']]
    });

    // Calcular totales
    const totalIngresos = movements
      .filter(m => m.type === 'ingreso' || m.type === 'venta')
      .reduce((sum, m) => sum + parseFloat(m.amount), 0);

    const totalEgresos = movements
      .filter(m => m.type === 'egreso' || m.type === 'gasto' || m.type === 'retiro')
      .reduce((sum, m) => sum + parseFloat(m.amount), 0);

    const currentAmount = parseFloat(cashRegister.openingAmount) + totalIngresos - totalEgresos;

    res.json({
      success: true,
      data: {
        ...cashRegister.toJSON(),
        movements,
        totalIngresos,
        totalEgresos,
        currentAmount
      }
    });
  } catch (error) {
    console.error('Error al obtener caja actual:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener historial de cajas
exports.getCashRegisterHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;

    const whereClause = { userId };
    if (status) {
      whereClause.status = status;
    }

    const cashRegisters = await CashRegister.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'name']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    res.json({
      success: true,
      data: cashRegisters.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: cashRegisters.count,
        pages: Math.ceil(cashRegisters.count / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error al obtener historial de cajas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Agregar movimiento de caja
exports.addCashMovement = async (req, res) => {
  try {
    const { type, amount, description, reference, paymentMethod } = req.body;
    const userId = req.user.id;

    // Verificar que hay caja abierta
    const cashRegister = await CashRegister.findOne({
      where: { 
        userId: userId,
        status: 'abierta'
      }
    });

    if (!cashRegister) {
      return res.status(400).json({
        success: false,
        message: 'No hay caja abierta'
      });
    }

    // Crear movimiento
    const movement = await CashMovement.create({
      cashRegisterId: cashRegister.id,
      type,
      amount,
      description,
      reference,
      paymentMethod,
      userId
    });

    res.status(201).json({
      success: true,
      message: 'Movimiento registrado correctamente',
      data: movement
    });
  } catch (error) {
    console.error('Error al agregar movimiento:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener estadísticas de caja
exports.getCashRegisterStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    const whereClause = { userId };
    if (startDate && endDate) {
      whereClause.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const cashRegisters = await CashRegister.findAll({
      where: whereClause,
      include: [
        {
          model: CashMovement,
          as: 'movements'
        }
      ]
    });

    // Calcular estadísticas
    const totalCajas = cashRegisters.length;
    const cajasAbiertas = cashRegisters.filter(cr => cr.status === 'abierta').length;
    const cajasCerradas = cashRegisters.filter(cr => cr.status === 'cerrada').length;

    const totalIngresos = cashRegisters.reduce((sum, cr) => {
      const ingresos = cr.movements
        .filter(m => m.type === 'ingreso' || m.type === 'venta')
        .reduce((s, m) => s + parseFloat(m.amount), 0);
      return sum + ingresos;
    }, 0);

    const totalEgresos = cashRegisters.reduce((sum, cr) => {
      const egresos = cr.movements
        .filter(m => m.type === 'egreso' || m.type === 'gasto' || m.type === 'retiro')
        .reduce((s, m) => s + parseFloat(m.amount), 0);
      return sum + egresos;
    }, 0);

    res.json({
      success: true,
      data: {
        totalCajas,
        cajasAbiertas,
        cajasCerradas,
        totalIngresos,
        totalEgresos,
        balance: totalIngresos - totalEgresos
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};