const { Sale, SaleDetail, Product, Client, User, sequelize } = require('../models');

// Crear una nueva venta
exports.createSale = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { clientId, products, invoiceType, invoiceNumber, notes } = req.body;
    const userId = req.userId; // Obtenido del middleware de autenticación

    // Validar que haya productos
    if (!products || products.length === 0) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Debe incluir al menos un producto' });
    }

    // Calcular el total de la venta
    let total = 0;
    for (const item of products) {
      const product = await Product.findByPk(item.productId);
      if (!product) {
        await transaction.rollback();
        return res.status(404).json({ message: `Producto con ID ${item.productId} no encontrado` });
      }

      // Verificar stock
      if (product.stock < item.quantity) {
        await transaction.rollback();
        return res.status(400).json({ message: `Stock insuficiente para ${product.name}` });
      }

      // Determinar el precio según la cantidad (mayoreo o unitario)
      let price = product.unitPrice;
      if (product.wholesalePrice && product.wholesaleMinQuantity && item.quantity >= product.wholesaleMinQuantity) {
        price = product.wholesalePrice;
      }

      // Calcular subtotal
      const subtotal = price * item.quantity;
      total += subtotal;

      // Actualizar stock
      await product.update({ stock: product.stock - item.quantity }, { transaction });
    }

    // Crear la venta
    const sale = await Sale.create({
      clientId,
      userId,
      total,
      invoiceType,
      invoiceNumber,
      notes,
      status: 'pagado' // Por defecto, se considera pagada
    }, { transaction });

    // Crear los detalles de la venta
    for (const item of products) {
      const product = await Product.findByPk(item.productId);
      
      // Determinar el precio según la cantidad (mayoreo o unitario)
      let price = product.unitPrice;
      if (product.wholesalePrice && product.wholesaleMinQuantity && item.quantity >= product.wholesaleMinQuantity) {
        price = product.wholesalePrice;
      }

      await SaleDetail.create({
        saleId: sale.id,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: price,
        subtotal: price * item.quantity
      }, { transaction });
    }

    await transaction.commit();

    return res.status(201).json({
      message: 'Venta registrada correctamente',
      sale
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error al crear venta:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Obtener todas las ventas
exports.getAllSales = async (req, res) => {
  try {
    const sales = await Sale.findAll({
      include: [
        { model: Client },
        { model: User, as: 'seller', attributes: ['id', 'username'] }
      ],
      order: [['date', 'DESC']]
    });

    return res.status(200).json(sales);
  } catch (error) {
    console.error('Error al obtener ventas:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Obtener una venta por ID
exports.getSaleById = async (req, res) => {
  try {
    const { id } = req.params;

    const sale = await Sale.findByPk(id, {
      include: [
        { model: Client },
        { model: User, as: 'seller', attributes: ['id', 'username'] },
        { 
          model: SaleDetail,
          include: [{ model: Product }]
        }
      ]
    });

    if (!sale) {
      return res.status(404).json({ message: 'Venta no encontrada' });
    }

    return res.status(200).json(sale);
  } catch (error) {
    console.error('Error al obtener venta:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Anular una venta
exports.cancelSale = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;

    const sale = await Sale.findByPk(id, {
      include: [{ model: SaleDetail }]
    });

    if (!sale) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Venta no encontrada' });
    }

    if (sale.status === 'anulado') {
      await transaction.rollback();
      return res.status(400).json({ message: 'La venta ya está anulada' });
    }

    // Restaurar stock de productos
    for (const detail of sale.SaleDetails) {
      const product = await Product.findByPk(detail.productId);
      await product.update({
        stock: product.stock + detail.quantity
      }, { transaction });
    }

    // Actualizar estado de la venta
    await sale.update({ status: 'anulado' }, { transaction });

    await transaction.commit();

    return res.status(200).json({
      message: 'Venta anulada correctamente'
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error al anular venta:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Obtener ventas por cliente
exports.getSalesByClient = async (req, res) => {
  try {
    const { clientId } = req.params;

    const sales = await Sale.findAll({
      where: { clientId },
      include: [
        { model: Client },
        { model: User, as: 'seller', attributes: ['id', 'username'] }
      ],
      order: [['date', 'DESC']]
    });

    return res.status(200).json(sales);
  } catch (error) {
    console.error('Error al obtener ventas por cliente:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Obtener ventas por fecha
exports.getSalesByDate = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const sales = await Sale.findAll({
      where: {
        date: {
          [sequelize.Op.between]: [new Date(startDate), new Date(endDate)]
        }
      },
      include: [
        { model: Client },
        { model: User, as: 'seller', attributes: ['id', 'username'] }
      ],
      order: [['date', 'DESC']]
    });

    return res.status(200).json(sales);
  } catch (error) {
    console.error('Error al obtener ventas por fecha:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};