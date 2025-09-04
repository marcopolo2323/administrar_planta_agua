const { Op } = require('sequelize');
// Importar modelos

const models = require('../models');
const CashRegister = models.CashRegister;  // Modelo de Caja Registradora
const CashMovement = models.CashMovement;  // Modelo de Movimientos de Caja
const Sale = models.Sale;                  // Modelo de Ventas
const User = models.User;                  // Modelo de Usuarios
const Client = models.Client;              // Modelo de Clientes
const sequelize = models.sequelize;        // Instancia de Sequelize para transacciones


// Verificar que los modelos estén correctamente definidos
if (!CashRegister || !CashMovement || !Sale || !User || !sequelize) {
  console.error('Error: Modelos no definidos correctamente');
}

/**
 * Abrir una nueva caja registradora
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} req.body - Datos para la apertura de caja
 * @param {number} req.body.openingAmount - Monto inicial de la caja
 * @param {string} [req.body.notes] - Notas adicionales para la apertura
 * @param {Object} res - Objeto de respuesta Express
 * @returns {Object} Información de la caja creada
 */
exports.openCashRegister = async (req, res) => {
  // Iniciar transacción para garantizar la integridad de los datos
  const transaction = await sequelize.transaction();

  try {
    const { openingAmount, notes } = req.body;
    const userId = req.userId; // ID del usuario autenticado

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

/**
 * Cerrar una caja registradora abierta
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} req.body - Datos para el cierre de caja
 * @param {number} req.body.actualAmount - Monto real contado al cierre
 * @param {string} [req.body.notes] - Notas adicionales para el cierre
 * @param {Object} res - Objeto de respuesta Express
 * @returns {Object} Información de la caja cerrada con balance
 */
exports.closeCashRegister = async (req, res) => {
  // Iniciar transacción para garantizar la integridad de los datos
  const transaction = await sequelize.transaction();

  try {
    const { actualAmount, notes } = req.body;
    const userId = req.userId; // ID del usuario que cierra la caja

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

/**
 * Obtener información de la caja actualmente abierta
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 * @returns {Object} Información de la caja actual, movimientos, ventas y resumen de balance
 */
/**
 * Obtener información de la caja actualmente abierta
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 * @returns {Object} Información de la caja actual, movimientos, ventas y resumen de balance
 */
exports.getCurrentCashRegister = async (req, res) => {
  try {
    console.log('Obteniendo caja actual...');
    
    // Verificar que los modelos estén correctamente definidos
    if (!CashRegister || !User) {
      console.error('Error: Modelos no definidos correctamente');
      return res.status(500).json({ message: 'Error en la configuración del servidor' });
    }
    
    // Optimización: Buscar caja abierta con sus movimientos y ventas en una sola consulta
    const cashRegister = await CashRegister.findOne({
      where: { status: 'abierto' },
      include: [
        { model: User, as: 'openedByUser', attributes: ['id', 'username'] },
        { 
          model: CashMovement,
          include: [{ model: User, as: 'registeredBy', attributes: ['id', 'username'] }],
          order: [['createdAt', 'DESC']]
        }
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

    // Extraer movimientos de la consulta optimizada
    const movements = cashRegister.CashMovements || [];

    // Obtener ventas desde la apertura de caja en una sola consulta
    let sales = [];
    if (cashRegister && cashRegister.openingDate) {
      try {
        sales = await Sale.findAll({
          where: {
            status: 'pagado',
            createdAt: { [Op.gte]: cashRegister.openingDate }
          },
          include: [{ model: User, as: 'seller', attributes: ['id', 'username'] }],
          order: [['createdAt', 'DESC']]
        }) || [];
      } catch (err) {
        console.error('Error al obtener ventas:', err);
        sales = [];
      }
    }

    // Calcular totales de manera optimizada
    const salesTotal = Array.isArray(sales) && sales.length > 0 
      ? sales.reduce((sum, sale) => sum + (sale && sale.total ? parseFloat(sale.total || 0) : 0), 0)
      : 0;
    
    // Calcular ingresos y egresos en un solo recorrido
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

/**
 * Registrar un nuevo movimiento de caja (ingreso o egreso)
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} req.body - Datos del movimiento
 * @param {string} req.body.type - Tipo de movimiento ('ingreso' o 'egreso')
 * @param {number} req.body.amount - Monto del movimiento
 * @param {string} req.body.concept - Concepto o razón del movimiento
 * @param {string} [req.body.reference] - Referencia externa (opcional)
 * @param {string} [req.body.notes] - Notas adicionales (opcional)
 * @param {Object} res - Objeto de respuesta Express
 * @returns {Object} Información del movimiento registrado
 */
exports.registerCashMovement = async (req, res) => {
  // Iniciar transacción para garantizar la integridad de los datos
  const transaction = await sequelize.transaction();

  try {
    const { type, amount, concept, reference, notes } = req.body;
    const userId = req.userId; // ID del usuario que registra el movimiento

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

/**
 * Obtener historial de cajas cerradas con filtros opcionales por fecha
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} req.query - Parámetros de consulta
 * @param {string} [req.query.startDate] - Fecha de inicio para filtrar (opcional)
 * @param {string} [req.query.endDate] - Fecha de fin para filtrar (opcional)
 * @param {number} [req.query.limit=10] - Número máximo de registros a devolver
 * @param {number} [req.query.offset=0] - Número de registros a omitir (para paginación)
 * @param {Object} res - Objeto de respuesta Express
 * @returns {Object} Lista paginada de cajas registradoras cerradas
 */
exports.getCashRegisterHistory = async (req, res) => {
  try {
    const { startDate, endDate } = req.query; // Fechas para filtrar el historial
    
    // Parámetros de paginación
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;
    
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

    // Obtener historial de cajas con paginación
    const { count, rows: cashRegisters } = await CashRegister.findAndCountAll({
      where: whereConditions,
      include: [
        { model: User, as: 'openedByUser', attributes: ['id', 'username'] },
        { model: User, as: 'closedByUser', attributes: ['id', 'username'] }
      ],
      order: [['closingDate', 'DESC']],
      limit,
      offset,
      // Seleccionar solo los campos necesarios para mejorar rendimiento
      attributes: [
        'id', 'openingDate', 'closingDate', 'openingAmount', 'expectedAmount',
        'actualAmount', 'difference', 'status', 'openedBy', 'closedBy', 'notes'
      ]
    });

    return res.status(200).json({
      total: count,
      offset,
      limit,
      cashRegisters
    });
  } catch (error) {
    console.error('Error al obtener historial de cajas:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

/**
 * Obtener detalles de una caja específica
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 * @returns {Object} Detalles de la caja, movimientos y ventas asociadas
 */
exports.getCashRegisterDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar que el ID sea válido
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ message: 'ID de caja inválido' });
    }

    // Buscar la caja por ID con información de usuarios relacionados
    const cashRegister = await CashRegister.findByPk(id, {
      include: [
        { model: User, as: 'openedByUser', attributes: ['id', 'username'] },
        { model: User, as: 'closedByUser', attributes: ['id', 'username'] }
      ]
    }).catch(err => {
      console.error('Error al buscar caja por ID:', err);
      return null;
    });

    // Si no se encuentra la caja, devolver error 404
    if (!cashRegister) {
      return res.status(404).json({ message: 'Caja no encontrada' });
    }

    // Obtener movimientos de la caja con manejo de errores
    let movements = [];
    try {
      movements = await CashMovement.findAll({
        where: { cashRegisterId: id },
        include: [{ model: User, as: 'registeredBy', attributes: ['id', 'username'] }],
        order: [['createdAt', 'DESC']]
      }) || [];
    } catch (err) {
      console.error('Error al obtener movimientos de caja:', err);
      movements = [];
    }

    // Obtener ventas durante el período de la caja
    let sales = [];
    try {
      sales = await Sale.findAll({
        where: {
          status: 'pagado',
          createdAt: {
            [Op.between]: [
              cashRegister.openingDate,
              cashRegister.closingDate || new Date()
            ]
          }
        },
        include: [{ model: User, as: 'seller', attributes: ['id', 'username'] }],
        order: [['createdAt', 'DESC']]
      }) || [];
    } catch (err) {
      console.error('Error al obtener ventas de caja:', err);
      sales = [];
    }

    // Formatear la respuesta con los datos obtenidos
    return res.status(200).json({
      cashRegister,
      movements: movements || [],
      sales: sales || []
    });
  } catch (error) {
    console.error('Error al obtener detalles de caja:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};