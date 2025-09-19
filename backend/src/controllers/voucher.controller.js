const { Voucher, User, Product, Client, sequelize } = require('../models');
const { Op } = require('sequelize');

// Crear un nuevo vale
exports.createVoucher = async (req, res) => {
  try {
    const { clientId, productId, quantity, unitPrice, notes } = req.body;
    const deliveryPersonId = req.userId; // ID del repartidor autenticado

    // Verificar que el cliente existe
    const client = await Client.findByPk(clientId);
    if (!client) {
      return res.status(400).json({
        success: false,
        message: 'Cliente no encontrado o no válido'
      });
    }

    // Verificar que el producto existe
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(400).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    // Calcular el total
    const totalAmount = quantity * unitPrice;

    // Crear el vale
    const voucher = await Voucher.create({
      clientId,
      deliveryPersonId,
      productId,
      quantity,
      unitPrice,
      totalAmount,
      notes,
      status: 'pending'
    });

    // Incluir información del cliente y producto
    const voucherWithDetails = await Voucher.findByPk(voucher.id, {
      include: [
        { model: Client, as: 'client', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'deliveryPerson', attributes: ['id', 'username'] },
        { model: Product, as: 'product', attributes: ['id', 'name', 'description'] }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Vale creado correctamente',
      data: voucherWithDetails
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

// Obtener todos los vales (para administradores)
exports.getAllVouchers = async (req, res) => {
  try {
    const { status, page = 1, limit = 100 } = req.query; // Aumentar límite por defecto

    console.log('🔍 Obteniendo vales con filtros:', { status, page, limit });

    const whereClause = {};
    if (status && status !== 'all') {
      whereClause.status = status;
    }

    console.log('🔍 Where clause para vales:', whereClause);

    const vouchers = await Voucher.findAndCountAll({
      where: whereClause,
      include: [
        { 
          model: Client, 
          as: 'client', 
          attributes: ['id', 'name', 'email', 'phone', 'documentNumber'],
          required: false // LEFT JOIN para incluir vales sin cliente
        },
        { 
          model: User, 
          as: 'deliveryPerson', 
          attributes: ['id', 'username'],
          required: false // LEFT JOIN para incluir vales sin repartidor
        },
        { 
          model: Product, 
          as: 'product', 
          attributes: ['id', 'name', 'description', 'unitPrice'],
          required: false // LEFT JOIN para incluir vales sin producto
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    console.log(`✅ Vales encontrados: ${vouchers.count} total, ${vouchers.rows.length} en esta página`);
    
    // Log de los primeros vales para debug
    if (vouchers.rows.length > 0) {
      console.log('🔍 Primer vale:', {
        id: vouchers.rows[0].id,
        clientId: vouchers.rows[0].clientId,
        clientName: vouchers.rows[0].client?.name,
        productName: vouchers.rows[0].product?.name,
        status: vouchers.rows[0].status
      });
    }

    res.json({
      success: true,
      data: vouchers.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: vouchers.count,
        pages: Math.ceil(vouchers.count / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error al obtener todos los vales:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener vales de un cliente
exports.getClientVouchers = async (req, res) => {
  try {
    const userId = req.userId; // ID del usuario autenticado
    const { status } = req.query;

    // Buscar el cliente asociado al usuario autenticado
    const client = await Client.findOne({
      where: { userId }
    });
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    const whereClause = { clientId: client.id };
    if (status && status !== 'all') {
      whereClause.status = status;
    }

    const vouchers = await Voucher.findAll({
      where: whereClause,
      include: [
        { model: User, as: 'deliveryPerson', attributes: ['id', 'username'] },
        { model: Product, as: 'product', attributes: ['id', 'name', 'description', 'image'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: vouchers
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

// Obtener vales creados por un repartidor
exports.getDeliveryVouchers = async (req, res) => {
  try {
    const deliveryPersonId = req.userId; // ID del repartidor autenticado
    const { status, clientId } = req.query;

    const whereClause = { deliveryPersonId };
    if (status && status !== 'all') {
      whereClause.status = status;
    }
    if (clientId) {
      whereClause.clientId = clientId;
    }

    const vouchers = await Voucher.findAll({
      where: whereClause,
      include: [
        { model: Client, as: 'client', attributes: ['id', 'name', 'email'] },
        { model: Product, as: 'product', attributes: ['id', 'name', 'description', 'image'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: vouchers
    });
  } catch (error) {
    console.error('Error al obtener vales del repartidor:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Actualizar estado de un vale
exports.updateVoucherStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.userId;
    const userRole = req.userRole;

    // Estados permitidos según el rol
    const allowedStatuses = {
      'repartidor': ['delivered'],
      'cliente': ['paid'],
      'admin': ['pending', 'delivered', 'paid']
    };

    if (!allowedStatuses[userRole] || !allowedStatuses[userRole].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Estado no válido para este rol'
      });
    }

    const voucher = await Voucher.findByPk(id, {
      include: [
        { model: Client, as: 'Client', attributes: ['id', 'name'] },
        { model: User, as: 'deliveryPerson', attributes: ['id', 'username'] },
        { model: Product, as: 'product', attributes: ['id', 'name'] }
      ]
    });

    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: 'Vale no encontrado'
      });
    }

    // Verificar permisos
    if (userRole === 'repartidor' && voucher.deliveryPersonId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para modificar este vale'
      });
    }

    if (userRole === 'cliente') {
      // Buscar el cliente asociado al usuario autenticado
      const client = await Client.findOne({
        where: { userId }
      });
      
      if (!client || voucher.clientId !== client.id) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para modificar este vale'
        });
      }
    }

    // Actualizar el vale
    const updateData = { status };
    if (status === 'delivered') {
      updateData.deliveredAt = new Date();
    }
    if (status === 'paid') {
      updateData.paidAt = new Date();
    }

    await voucher.update(updateData);

    res.json({
      success: true,
      message: 'Estado del vale actualizado correctamente',
      data: voucher
    });
  } catch (error) {
    console.error('Error al actualizar estado del vale:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener estadísticas de vales
exports.getVoucherStats = async (req, res) => {
  try {
    const userId = req.userId;
    const userRole = req.userRole;
    const { startDate, endDate } = req.query;

    let whereClause = {};
    
    // Filtrar por usuario según el rol
    if (userRole === 'cliente') {
      // Buscar el cliente asociado al usuario autenticado
      const client = await Client.findOne({
        where: { userId }
      });
      
      if (client) {
        whereClause.clientId = client.id;
      } else {
        // Si no se encuentra el cliente, no mostrar estadísticas
        return res.json({
          success: true,
          data: {
            totalVouchers: 0,
            pendingVouchers: 0,
            deliveredVouchers: 0,
            paidVouchers: 0,
            totalAmount: 0,
            pendingAmount: 0,
            deliveredAmount: 0,
            paidAmount: 0
          }
        });
      }
    } else if (userRole === 'repartidor') {
      whereClause.deliveryPersonId = userId;
    }

    if (startDate && endDate) {
      whereClause.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const totalVouchers = await Voucher.count({ where: whereClause });
    const pendingVouchers = await Voucher.count({ 
      where: { ...whereClause, status: 'pending' } 
    });
    const deliveredVouchers = await Voucher.count({ 
      where: { ...whereClause, status: 'delivered' } 
    });
    const paidVouchers = await Voucher.count({ 
      where: { ...whereClause, status: 'paid' } 
    });

    // Calcular totales monetarios
    const vouchers = await Voucher.findAll({
      where: whereClause,
      attributes: ['totalAmount', 'status']
    });
    
    const totalAmount = vouchers.reduce((sum, voucher) => sum + parseFloat(voucher.totalAmount || 0), 0);
    const pendingAmount = vouchers
      .filter(v => v.status === 'pending')
      .reduce((sum, voucher) => sum + parseFloat(voucher.totalAmount || 0), 0);
    const deliveredAmount = vouchers
      .filter(v => v.status === 'delivered')
      .reduce((sum, voucher) => sum + parseFloat(voucher.totalAmount || 0), 0);
    const paidAmount = vouchers
      .filter(v => v.status === 'paid')
      .reduce((sum, voucher) => sum + parseFloat(voucher.totalAmount || 0), 0);

    res.json({
      success: true,
      data: {
        totalVouchers,
        pendingVouchers,
        deliveredVouchers,
        paidVouchers,
        totalAmount,
        pendingAmount,
        deliveredAmount,
        paidAmount
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

// Obtener un vale específico
exports.getVoucherById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const userRole = req.userRole;

    const voucher = await Voucher.findByPk(id, {
      include: [
        { model: Client, as: 'client', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'deliveryPerson', attributes: ['id', 'username'] },
        { model: Product, as: 'product', attributes: ['id', 'name', 'description', 'image'] }
      ]
    });

    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: 'Vale no encontrado'
      });
    }

    // Verificar permisos
    if (userRole === 'repartidor' && voucher.deliveryPersonId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para ver este vale'
      });
    }

    if (userRole === 'cliente') {
      // Buscar el cliente asociado al usuario autenticado
      const client = await Client.findOne({
        where: { userId }
      });
      
      if (!client || voucher.clientId !== client.id) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para ver este vale'
        });
      }
    }

    res.json({
      success: true,
      data: voucher
    });
  } catch (error) {
    console.error('Error al obtener vale:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Procesar pago de todos los vales pendientes de un cliente
exports.payAllClientVouchers = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { clientId } = req.params;
    const { paymentMethod, paymentReference } = req.body;

    // Buscar el cliente
    const client = await Client.findOne({
      where: { userId: clientId }
    });

    if (!client) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    // Obtener todos los vales pendientes del cliente
    const pendingVouchers = await Voucher.findAll({
      where: {
        clientId: client.id,
        status: 'pending'
      },
      transaction
    });

    if (pendingVouchers.length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'No hay vales pendientes para este cliente'
      });
    }

    // Calcular el total
    const totalAmount = pendingVouchers.reduce((sum, voucher) => sum + parseFloat(voucher.totalAmount), 0);

    // Actualizar todos los vales a 'paid'
    await Voucher.update(
      {
        status: 'paid',
        paymentMethod: paymentMethod,
        paymentReference: paymentReference,
        paidAt: new Date()
      },
      {
        where: {
          clientId: client.id,
          status: 'pending'
        },
        transaction
      }
    );

    await transaction.commit();

    res.status(200).json({
      success: true,
      message: 'Pago procesado correctamente',
      data: {
        vouchersPaid: pendingVouchers.length,
        totalAmount: totalAmount,
        paymentMethod: paymentMethod,
        paymentReference: paymentReference
      }
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Error al procesar pago de vales:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};
