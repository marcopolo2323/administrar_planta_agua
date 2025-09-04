const { Credit, CreditPayment, Client, Sale, User, Order, sequelize } = require('../models');

// Obtener todos los créditos
exports.getAllCredits = async (req, res) => {
  try {
    const { status, clientId } = req.query;
    
    // Construir condiciones de búsqueda
    const whereConditions = {};
    
    if (status) whereConditions.status = status;
    if (clientId) whereConditions.clientId = clientId;

    const credits = await Credit.findAll({
      where: whereConditions,
      include: [
        { model: Client },
        { model: Sale },
        { model: User, as: 'registeredBy', attributes: ['id', 'username'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json(credits);
  } catch (error) {
    console.error('Error al obtener créditos:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Obtener un crédito por ID
exports.getCreditById = async (req, res) => {
  try {
    const { id } = req.params;

    const credit = await Credit.findByPk(id, {
      include: [
        { model: Client },
        { model: Sale },
        { model: User, as: 'registeredBy', attributes: ['id', 'username'] },
        { 
          model: CreditPayment,
          include: [{ model: User, as: 'registeredBy', attributes: ['id', 'username'] }]
        }
      ]
    });

    if (!credit) {
      return res.status(404).json({ message: 'Crédito no encontrado' });
    }

    return res.status(200).json(credit);
  } catch (error) {
    console.error('Error al obtener crédito:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Crear un nuevo crédito
exports.createCredit = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { clientId, saleId, orderId, amount, dueDate, notes } = req.body;
    const userId = req.userId;

    // Verificar si el cliente existe
    const client = await Client.findByPk(clientId, { transaction });
    if (!client) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }
    
    // Verificar si el cliente tiene habilitado el crédito
    if (!client.hasCredit) {
      await transaction.rollback();
      return res.status(403).json({ message: 'Este cliente no tiene habilitado el pago a crédito' });
    }

    // Verificar si la venta o pedido existe
    if (saleId) {
      const sale = await Sale.findByPk(saleId, { transaction });
      if (!sale) {
        await transaction.rollback();
        return res.status(404).json({ message: 'Venta no encontrada' });
      }

      // Verificar si ya existe un crédito para esta venta
      const existingCredit = await Credit.findOne({
        where: { saleId },
        transaction
      });

      if (existingCredit) {
        await transaction.rollback();
        return res.status(400).json({ message: 'Ya existe un crédito para esta venta' });
      }

      // Actualizar estado de la venta
      await sale.update({ status: 'pendiente' }, { transaction });
    } else if (orderId) {
      const order = await Order.findByPk(orderId, { transaction });
      if (!order) {
        await transaction.rollback();
        return res.status(404).json({ message: 'Pedido no encontrado' });
      }

      // Verificar si ya existe un crédito para este pedido
      const existingCredit = await Credit.findOne({
        where: { orderId },
        transaction
      });

      if (existingCredit) {
        await transaction.rollback();
        return res.status(400).json({ message: 'Ya existe un crédito para este pedido' });
      }

      // Actualizar estado del pedido
      await order.update({ 
        paymentStatus: 'credito',
        isCredit: true 
      }, { transaction });
    }

    // Activar crédito para el cliente si no lo tiene
    if (!client.hasCredit) {
      await client.update({ hasCredit: true }, { transaction });
    }

    // Crear el crédito
    const credit = await Credit.create({
      clientId,
      saleId,
      orderId,
      amount,
      balance: amount, // Inicialmente el balance es igual al monto total
      dueDate: dueDate ? new Date(dueDate) : null,
      notes,
      userId
    }, { transaction });

    await transaction.commit();

    return res.status(201).json({
      message: 'Crédito creado correctamente',
      credit
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error al crear crédito:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Registrar pago de crédito
exports.registerPayment = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { creditId } = req.params;
    const { amount, paymentMethod, reference, notes } = req.body;
    const userId = req.userId;

    // Verificar si el crédito existe
    const credit = await Credit.findByPk(creditId, { transaction });
    if (!credit) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Crédito no encontrado' });
    }

    // Verificar si el crédito ya está pagado
    if (credit.status === 'pagado') {
      await transaction.rollback();
      return res.status(400).json({ message: 'Este crédito ya está pagado' });
    }

    // Verificar que el monto del pago no sea mayor al balance pendiente
    if (amount > credit.balance) {
      await transaction.rollback();
      return res.status(400).json({ 
        message: 'El monto del pago no puede ser mayor al balance pendiente',
        balance: credit.balance
      });
    }

    // Registrar el pago
    const payment = await CreditPayment.create({
      creditId,
      amount,
      paymentMethod,
      reference,
      notes,
      userId
    }, { transaction });

    // Actualizar el balance del crédito
    const newBalance = credit.balance - amount;
    const newStatus = newBalance <= 0 ? 'pagado' : 'pendiente';
    
    await credit.update({
      balance: newBalance,
      status: newStatus
    }, { transaction });

    // Si el crédito está asociado a una venta, actualizar su estado
    if (credit.saleId && newStatus === 'pagado') {
      await Sale.update(
        { status: 'pagado' },
        { where: { id: credit.saleId }, transaction }
      );
    }
    
    // Si el crédito está asociado a un pedido, actualizar su estado
    if (credit.orderId && newStatus === 'pagado') {
      await Order.update(
        { paymentStatus: 'pagado', isCredit: false },
        { where: { id: credit.orderId }, transaction }
      );
    }

    await transaction.commit();

    return res.status(200).json({
      message: 'Pago registrado correctamente',
      payment,
      credit: {
        ...credit.toJSON(),
        balance: newBalance,
        status: newStatus
      }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error al registrar pago:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Obtener créditos vencidos
exports.getOverdueCredits = async (req, res) => {
  try {
    const today = new Date();
    
    const overdueCredits = await Credit.findAll({
      where: {
        status: 'pendiente',
        dueDate: {
          [sequelize.Op.lt]: today
        }
      },
      include: [
        { model: Client },
        { model: Sale },
        { model: Order }
      ],
      order: [['dueDate', 'ASC']]
    });

    return res.status(200).json(overdueCredits);
  } catch (error) {
    console.error('Error al obtener créditos vencidos:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Obtener historial de pagos de un crédito
exports.getCreditPayments = async (req, res) => {
  try {
    const { id } = req.params;

    const payments = await CreditPayment.findAll({
      where: { creditId: id },
      include: [{ model: User, as: 'registeredBy', attributes: ['id', 'username'] }],
      order: [['paymentDate', 'DESC']]
    });

    return res.status(200).json(payments);
  } catch (error) {
    console.error('Error al obtener pagos del crédito:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};