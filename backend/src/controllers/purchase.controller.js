const { Purchase, PurchaseDetail, Product, Inventory, User, sequelize } = require('../models');

// Obtener todas las compras
exports.getAllPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.findAll({
      order: [['date', 'DESC']]
    });

    return res.status(200).json(purchases);
  } catch (error) {
    console.error('Error al obtener compras:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Obtener una compra por ID
exports.getPurchaseById = async (req, res) => {
  try {
    const { id } = req.params;

    const purchase = await Purchase.findByPk(id, {
      include: [{
        model: PurchaseDetail,
        include: [{ model: Product }]
      }, {
        model: User,
        as: 'registeredBy',
        attributes: ['id', 'username']
      }]
    });

    if (!purchase) {
      return res.status(404).json({ message: 'Compra no encontrada' });
    }

    return res.status(200).json(purchase);
  } catch (error) {
    console.error('Error al obtener compra:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Crear una nueva compra
exports.createPurchase = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { 
      supplierName, 
      supplierDocument, 
      invoiceNumber, 
      products, 
      paymentMethod, 
      notes 
    } = req.body;
    const userId = req.userId; // Obtenido del middleware de autenticación

    // Validar que haya productos
    if (!products || products.length === 0) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Debe incluir al menos un producto' });
    }

    // Calcular el total de la compra
    let total = 0;
    for (const item of products) {
      const subtotal = item.unitCost * item.quantity;
      total += subtotal;
    }

    // Crear la compra
    const purchase = await Purchase.create({
      supplierName,
      supplierDocument,
      invoiceNumber,
      total,
      paymentMethod,
      notes,
      userId
    }, { transaction });

    // Crear los detalles de la compra y actualizar el inventario
    for (const item of products) {
      const product = await Product.findByPk(item.productId, { transaction });
      if (!product) {
        await transaction.rollback();
        return res.status(404).json({ message: `Producto con ID ${item.productId} no encontrado` });
      }

      // Crear detalle de compra
      await PurchaseDetail.create({
        purchaseId: purchase.id,
        productId: item.productId,
        quantity: item.quantity,
        unitCost: item.unitCost,
        subtotal: item.unitCost * item.quantity
      }, { transaction });

      // Actualizar stock del producto
      const previousStock = product.stock;
      const currentStock = previousStock + item.quantity;
      await product.update({ stock: currentStock }, { transaction });

      // Registrar movimiento en inventario
      await Inventory.create({
        productId: item.productId,
        type: 'entrada',
        quantity: item.quantity,
        previousStock,
        currentStock,
        unitCost: item.unitCost,
        totalCost: item.unitCost * item.quantity,
        reference: 'compra',
        referenceId: purchase.id,
        userId
      }, { transaction });
    }

    await transaction.commit();

    return res.status(201).json({
      message: 'Compra registrada correctamente',
      purchase
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error al crear compra:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Anular una compra
exports.cancelPurchase = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.userId;

    const purchase = await Purchase.findByPk(id, {
      include: [{ model: PurchaseDetail }],
      transaction
    });

    if (!purchase) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Compra no encontrada' });
    }

    if (purchase.status === 'anulado') {
      await transaction.rollback();
      return res.status(400).json({ message: 'La compra ya está anulada' });
    }

    // Actualizar estado de la compra
    await purchase.update({
      status: 'anulado',
      notes: purchase.notes ? `${purchase.notes}\nAnulado: ${reason}` : `Anulado: ${reason}`
    }, { transaction });

    // Revertir el stock de los productos
    for (const detail of purchase.PurchaseDetails) {
      const product = await Product.findByPk(detail.productId, { transaction });
      if (product) {
        const previousStock = product.stock;
        const currentStock = Math.max(0, previousStock - detail.quantity);
        
        await product.update({ stock: currentStock }, { transaction });

        // Registrar movimiento en inventario
        await Inventory.create({
          productId: detail.productId,
          type: 'ajuste',
          quantity: -detail.quantity,
          previousStock,
          currentStock,
          reference: 'anulación de compra',
          referenceId: purchase.id,
          notes: reason,
          userId
        }, { transaction });
      }
    }

    await transaction.commit();

    return res.status(200).json({
      message: 'Compra anulada correctamente',
      purchase
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error al anular compra:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};