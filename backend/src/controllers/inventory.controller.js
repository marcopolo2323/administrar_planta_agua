const { Inventory, Product, User, sequelize } = require('../models');

// Obtener todos los movimientos de inventario
exports.getAllInventoryMovements = async (req, res) => {
  try {
    const { productId, type, startDate, endDate } = req.query;
    
    // Construir condiciones de búsqueda
    const whereConditions = {};
    
    if (productId) whereConditions.productId = productId;
    if (type) whereConditions.type = type;
    
    if (startDate && endDate) {
      whereConditions.createdAt = {
        [sequelize.Op.between]: [new Date(startDate), new Date(endDate)]
      };
    } else if (startDate) {
      whereConditions.createdAt = {
        [sequelize.Op.gte]: new Date(startDate)
      };
    } else if (endDate) {
      whereConditions.createdAt = {
        [sequelize.Op.lte]: new Date(endDate)
      };
    }

    const movements = await Inventory.findAll({
      where: whereConditions,
      include: [
        { model: Product },
        { model: User, as: 'registeredBy', attributes: ['id', 'username'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json(movements);
  } catch (error) {
    console.error('Error al obtener movimientos de inventario:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Obtener movimientos de inventario por producto
exports.getInventoryMovementsByProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    const movements = await Inventory.findAll({
      where: { productId: id },
      include: [
        { model: Product },
        { model: User, as: 'registeredBy', attributes: ['id', 'username'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json(movements);
  } catch (error) {
    console.error('Error al obtener movimientos de inventario:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Registrar ajuste de inventario
exports.createInventoryAdjustment = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { productId, quantity, reason } = req.body;
    const userId = req.userId;

    const product = await Product.findByPk(productId, { transaction });
    if (!product) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    const previousStock = product.stock;
    const currentStock = previousStock + quantity;
    
    if (currentStock < 0) {
      await transaction.rollback();
      return res.status(400).json({ message: 'El ajuste resultaría en un stock negativo' });
    }

    // Actualizar stock del producto
    await product.update({ stock: currentStock }, { transaction });

    // Registrar movimiento en inventario
    const inventoryMovement = await Inventory.create({
      productId,
      type: 'ajuste',
      quantity,
      previousStock,
      currentStock,
      notes: reason,
      userId
    }, { transaction });

    await transaction.commit();

    return res.status(201).json({
      message: 'Ajuste de inventario registrado correctamente',
      inventoryMovement
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error al registrar ajuste de inventario:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Obtener stock actual de todos los productos
exports.getCurrentStock = async (req, res) => {
  try {
    const products = await Product.findAll({
      attributes: ['id', 'name', 'type', 'stock', 'unitPrice'],
      where: { active: true },
      order: [['name', 'ASC']]
    });

    return res.status(200).json(products);
  } catch (error) {
    console.error('Error al obtener stock actual:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Obtener productos con stock bajo
exports.getLowStockProducts = async (req, res) => {
  try {
    const { threshold = 10 } = req.query;
    
    const products = await Product.findAll({
      where: {
        stock: { [sequelize.Op.lt]: threshold },
        active: true
      },
      order: [['stock', 'ASC']]
    });

    return res.status(200).json(products);
  } catch (error) {
    console.error('Error al obtener productos con stock bajo:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};