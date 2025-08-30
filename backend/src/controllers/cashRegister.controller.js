// Importar modelos
const models = require('../models');
const CashRegister = models.CashRegister;
const CashMovement = models.CashMovement;
const Sale = models.Sale;
const User = models.User;
const sequelize = models.sequelize;

// Verificar que los modelos estén correctamente definidos
if (!CashRegister || !CashMovement || !Sale || !User || !sequelize) {
  console.error('Error: Modelos no definidos correctamente');
}

// Abrir caja
exports.openCashRegister = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { openingAmount, notes } = req.body;
    const userId = req.userId;

    // Verificar si ya hay una caja abierta
    const openCashRegister = await CashRegister.findOne({
      where: { status: 'abierto' },
      transaction
    });

    if (openCashRegister) {
      await transaction.rollback();
      return res.status(400).json({ 
        message: 'Ya hay una caja abierta',
        cashRegister: openCashRegister
      });
    }

    // Crear nueva caja
    const cashRegister = await CashRegister.create({
      openingAmount,
      notes,
      openedBy: userId,
      status: 'abierto'
    }, { transaction });

    await transaction.commit();

    return res.status(201).json({
      message: 'Caja abierta correctamente',
      cashRegister
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error al abrir caja:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Cerrar caja
exports.closeCashRegister = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { actualAmount, notes } = req.body;
    const userId = req.userId;

    console.log('Cerrando caja con datos:', { actualAmount, notes, userId });

    // Buscar caja abierta
    const cashRegister = await CashRegister.findOne({
      where: { status: 'abierto' },
      transaction
    });

    if (!cashRegister) {
      await transaction.rollback();
      console.log('No se encontró caja abierta');
      return res.status(404).json({ message: 'No hay una caja abierta' });
    }

    console.log('Caja encontrada:', cashRegister.id);

    // Calcular el monto esperado
    const openingAmount = parseFloat(cashRegister.openingAmount || 0);
    console.log('Monto de apertura:', openingAmount);
    
    // Obtener ventas en efectivo desde la apertura de caja
    let salesTotal = 0;
    try {
      salesTotal = await Sale.sum('total', {
        where: {
          status: 'pagado',
          createdAt: { [sequelize.Op.gte]: cashRegister.openingDate }
        },
        transaction
      }) || 0;
      
      // Asegurarse de que salesTotal sea un número válido
      salesTotal = parseFloat(salesTotal || 0);
      console.log('Total de ventas calculado:', salesTotal);
    } catch (err) {
      console.error('Error al calcular ventas:', err);
      salesTotal = 0;
    }

    // Obtener otros movimientos de caja
    const cashMovements = await CashMovement.findAll({
      where: { cashRegisterId: cashRegister.id },
      transaction
    }) || [];

    console.log('Movimientos de caja encontrados:', cashMovements.length);

    let movementsBalance = 0;
    for (const movement of cashMovements) {
      if (!movement || !movement.amount) continue;
      
      if (movement.type === 'ingreso') {
        movementsBalance += parseFloat(movement.amount || 0);
      } else {
        movementsBalance -= parseFloat(movement.amount || 0);
      }
    }

    console.log('Balance de movimientos calculado:', movementsBalance);

    // Calcular monto esperado y diferencia
    const expectedAmount = parseFloat(openingAmount || 0) + parseFloat(salesTotal || 0) + parseFloat(movementsBalance || 0);
    const difference = parseFloat(actualAmount || 0) - parseFloat(expectedAmount || 0);
    
    console.log('Montos calculados:', { 
      expectedAmount, 
      actualAmount: parseFloat(actualAmount || 0), 
      difference 
    });

    // Actualizar caja
    try {
      await cashRegister.update({
        closingDate: new Date(),
        expectedAmount: expectedAmount || 0,
        actualAmount: parseFloat(actualAmount || 0),
        difference: difference || 0,
        status: 'cerrado',
        notes: notes ? (cashRegister.notes ? `${cashRegister.notes}\n${notes}` : notes) : cashRegister.notes,
        closedBy: userId
      }, { transaction });
      
      console.log('Caja actualizada correctamente');
      
      await transaction.commit();
      console.log('Transacción confirmada');
      
      return res.status(200).json({
        message: 'Caja cerrada correctamente',
        cashRegister: {
          ...cashRegister.toJSON(),
          expectedAmount: expectedAmount || 0,
          actualAmount: parseFloat(actualAmount || 0),
          difference: difference || 0,
          status: 'cerrado'
        }
      });
    } catch (updateError) {
      await transaction.rollback();
      console.error('Error al actualizar la caja:', updateError);
      return res.status(500).json({ message: 'Error al actualizar la caja' });
    }
  } catch (error) {
    await transaction.rollback();
    console.error('Error al cerrar caja:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Obtener caja actual
exports.getCurrentCashRegister = async (req, res) => {
  try {
    console.log('Obteniendo caja actual...');
    
    // Verificar que los modelos estén correctamente definidos
    if (!CashRegister || !User) {
      console.error('Error: Modelos no definidos correctamente');
      return res.status(500).json({ message: 'Error en la configuración del servidor' });
    }
    
    const cashRegister = await CashRegister.findOne({
      where: { status: 'abierto' },
      include: [
        { model: User, as: 'openedByUser', attributes: ['id', 'username'] }
      ]
    }).catch(err => {
      console.error('Error al buscar caja abierta:', err);
      return null;
    });

    console.log('Resultado de búsqueda de caja:', cashRegister ? 'Encontrada' : 'No encontrada');

    if (!cashRegister) {
      // Devolver un objeto vacío en lugar de un error 404
      return res.status(200).json({
        cashRegister: null,
        movements: [],
        sales: [],
        summary: {
          openingAmount: 0,
          salesTotal: 0,
          incomesTotal: 0,
          expensesTotal: 0,
          currentBalance: 0
        }
      });
    }

    // Obtener movimientos de la caja actual
    let movements = [];
    if (cashRegister && cashRegister.id) {
      try {
        movements = await CashMovement.findAll({
          where: { cashRegisterId: cashRegister.id },
          include: [{ model: User, as: 'registeredBy', attributes: ['id', 'username'] }],
          order: [['createdAt', 'DESC']]
        }) || [];
      } catch (err) {
        console.error('Error al obtener movimientos:', err);
        movements = [];
      }
    }

    // Obtener ventas desde la apertura de caja
    let sales = [];
    if (cashRegister && cashRegister.openingDate) {
      try {
        sales = await Sale.findAll({
          where: {
            status: 'pagado',
            createdAt: { [sequelize.Op.gte]: cashRegister.openingDate }
          },
          include: [{ model: User, as: 'seller', attributes: ['id', 'username'] }],
          order: [['createdAt', 'DESC']]
        }) || [];
      } catch (err) {
        console.error('Error al obtener ventas:', err);
        sales = [];
      }
    }

    // Calcular totales
    const salesTotal = Array.isArray(sales) && sales.length > 0 
      ? sales.reduce((sum, sale) => sum + (sale && sale.total ? parseFloat(sale.total || 0) : 0), 0)
      : 0;
    
    let incomesTotal = 0;
    let expensesTotal = 0;
    if (Array.isArray(movements) && movements.length > 0) {
      for (const movement of movements) {
        if (movement && movement.amount) {
          if (movement.type === 'ingreso') {
            incomesTotal += parseFloat(movement.amount);
          } else {
            expensesTotal += parseFloat(movement.amount);
          }
        }
      }
    }

    const openingAmount = cashRegister && cashRegister.openingAmount ? parseFloat(cashRegister.openingAmount) : 0;
    const currentBalance = openingAmount + salesTotal + incomesTotal - expensesTotal;

    return res.status(200).json({
      cashRegister,
      movements: movements || [],
      sales: sales || [],
      summary: {
        openingAmount,
        salesTotal,
        incomesTotal,
        expensesTotal,
        currentBalance
      }
    });
  } catch (error) {
    console.error('Error al obtener caja actual:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Registrar movimiento de caja
exports.registerCashMovement = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { type, amount, concept, reference, notes } = req.body;
    const userId = req.userId;

    // Buscar caja abierta
    const cashRegister = await CashRegister.findOne({
      where: { status: 'abierto' },
      transaction
    });

    if (!cashRegister) {
      await transaction.rollback();
      return res.status(404).json({ message: 'No hay una caja abierta' });
    }

    // Crear movimiento
    const movement = await CashMovement.create({
      cashRegisterId: cashRegister.id,
      type,
      amount,
      concept,
      reference,
      notes,
      userId
    }, { transaction });

    await transaction.commit();

    return res.status(201).json({
      message: 'Movimiento registrado correctamente',
      movement
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error al registrar movimiento:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Obtener historial de cajas
exports.getCashRegisterHistory = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Construir condiciones de búsqueda
    const whereConditions = { status: 'cerrado' };
    
    if (startDate && endDate) {
      whereConditions.closingDate = {
        [sequelize.Op.between]: [new Date(startDate), new Date(endDate)]
      };
    } else if (startDate) {
      whereConditions.closingDate = {
        [sequelize.Op.gte]: new Date(startDate)
      };
    } else if (endDate) {
      whereConditions.closingDate = {
        [sequelize.Op.lte]: new Date(endDate)
      };
    }

    const cashRegisters = await CashRegister.findAll({
      where: whereConditions,
      include: [
        { model: User, as: 'openedByUser', attributes: ['id', 'username'] },
        { model: User, as: 'closedByUser', attributes: ['id', 'username'] }
      ],
      order: [['closingDate', 'DESC']]
    });

    return res.status(200).json(cashRegisters);
  } catch (error) {
    console.error('Error al obtener historial de cajas:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Obtener detalles de una caja específica
exports.getCashRegisterDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const cashRegister = await CashRegister.findByPk(id, {
      include: [
        { model: User, as: 'openedByUser', attributes: ['id', 'username'] },
        { model: User, as: 'closedByUser', attributes: ['id', 'username'] }
      ]
    });

    if (!cashRegister) {
      return res.status(404).json({ message: 'Caja no encontrada' });
    }

    // Obtener movimientos de la caja
    const movements = await CashMovement.findAll({
      where: { cashRegisterId: id },
      include: [{ model: User, as: 'registeredBy', attributes: ['id', 'username'] }],
      order: [['createdAt', 'DESC']]
    });

    // Obtener ventas durante el período de la caja
    const sales = await Sale.findAll({
      where: {
        status: 'pagado',
        createdAt: {
          [sequelize.Op.between]: [
            cashRegister.openingDate,
            cashRegister.closingDate || new Date()
          ]
        }
      },
      include: [{ model: User, as: 'seller', attributes: ['id', 'username'] }],
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json({
      cashRegister,
      movements,
      sales
    });
  } catch (error) {
    console.error('Error al obtener detalles de caja:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};