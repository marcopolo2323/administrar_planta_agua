const { Voucher, Client, User, Product, District, sequelize } = require('../models');
const { Op } = require('sequelize');

// Obtener resumen de pagos mensuales del cliente
exports.getClientMonthlySummary = async (req, res) => {
  try {
    const userId = req.userId;
    const { month, year } = req.query;
    
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

    // Fecha actual o la especificada
    const currentDate = new Date();
    const targetMonth = month ? parseInt(month) - 1 : currentDate.getMonth(); // 0-indexed
    const targetYear = year ? parseInt(year) : currentDate.getFullYear();
    
    // Rango de fechas del mes
    const startDate = new Date(targetYear, targetMonth, 1);
    const endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59);
    
    console.log(`📅 Buscando vales del ${startDate.toLocaleDateString()} al ${endDate.toLocaleDateString()}`);

    // Obtener todos los vales del mes
    const vouchers = await Voucher.findAll({
      where: {
        clientId: client.id,
        createdAt: {
          [Op.between]: [startDate, endDate]
        }
      },
      include: [
        { model: Product, as: 'product', attributes: ['id', 'name', 'description'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Calcular estadísticas
    const totalVouchers = vouchers.length;
    const pendingVouchers = vouchers.filter(v => v.status === 'pending');
    const deliveredVouchers = vouchers.filter(v => v.status === 'delivered');
    const paidVouchers = vouchers.filter(v => v.status === 'paid');
    
    const totalAmount = vouchers.reduce((sum, v) => sum + parseFloat(v.totalAmount || 0), 0);
    const pendingAmount = pendingVouchers.reduce((sum, v) => sum + parseFloat(v.totalAmount || 0), 0);
    const deliveredAmount = deliveredVouchers.reduce((sum, v) => sum + parseFloat(v.totalAmount || 0), 0);
    const paidAmount = paidVouchers.reduce((sum, v) => sum + parseFloat(v.totalAmount || 0), 0);

    // Obtener flete del distrito del cliente
    let deliveryFee = 1.00; // Valor por defecto
    if (client.district) {
      const district = await District.findOne({
        where: { name: client.district, isActive: true }
      });
      if (district) {
        deliveryFee = parseFloat(district.deliveryFee);
      }
    }
    const totalWithDelivery = totalAmount + deliveryFee;

    res.json({
      success: true,
      data: {
        client: {
          id: client.id,
          name: client.name,
          email: client.email
        },
        period: {
          month: targetMonth + 1,
          year: targetYear,
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        },
        summary: {
          totalVouchers,
          pendingVouchers: pendingVouchers.length,
          deliveredVouchers: deliveredVouchers.length,
          paidVouchers: paidVouchers.length,
          totalAmount,
          pendingAmount,
          deliveredAmount,
          paidAmount,
          deliveryFee,
          totalWithDelivery
        },
        vouchers: vouchers.map(v => ({
          id: v.id,
          date: v.createdAt,
          product: v.product?.name || 'Producto no disponible',
          quantity: v.quantity,
          unitPrice: v.unitPrice,
          totalAmount: v.totalAmount,
          status: v.status,
          notes: v.notes
        }))
      }
    });
  } catch (error) {
    console.error('Error al obtener resumen mensual:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Procesar pago mensual completo
exports.processMonthlyPayment = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const userId = req.userId;
    const { paymentMethod, paymentReference, month, year } = req.body;
    
    // Buscar el cliente
    const client = await Client.findOne({
      where: { userId }
    });

    if (!client) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    // Fecha actual o la especificada
    const currentDate = new Date();
    const targetMonth = month ? parseInt(month) - 1 : currentDate.getMonth();
    const targetYear = year ? parseInt(year) : currentDate.getFullYear();
    
    const startDate = new Date(targetYear, targetMonth, 1);
    const endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59);

    // Obtener todos los vales pendientes del mes
    const pendingVouchers = await Voucher.findAll({
      where: {
        clientId: client.id,
        status: 'pending',
        createdAt: {
          [Op.between]: [startDate, endDate]
        }
      },
      transaction
    });

    if (pendingVouchers.length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'No hay vales pendientes para este mes'
      });
    }

    // Calcular totales
    const totalAmount = pendingVouchers.reduce((sum, v) => sum + parseFloat(v.totalAmount || 0), 0);
    
    // Obtener flete del distrito del cliente
    let deliveryFee = 1.00; // Valor por defecto
    if (client.district) {
      const district = await District.findOne({
        where: { name: client.district, isActive: true }
      });
      if (district) {
        deliveryFee = parseFloat(district.deliveryFee);
      }
    }
    const totalWithDelivery = totalAmount + deliveryFee;

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
          status: 'pending',
          createdAt: {
            [Op.between]: [startDate, endDate]
          }
        },
        transaction
      }
    );

    await transaction.commit();

    res.status(200).json({
      success: true,
      message: 'Pago mensual procesado correctamente',
      data: {
        period: {
          month: targetMonth + 1,
          year: targetYear
        },
        vouchersPaid: pendingVouchers.length,
        subtotal: totalAmount,
        deliveryFee: deliveryFee,
        totalAmount: totalWithDelivery,
        paymentMethod: paymentMethod,
        paymentReference: paymentReference,
        paidAt: new Date()
      }
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Error al procesar pago mensual:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener historial de pagos mensuales
exports.getPaymentHistory = async (req, res) => {
  try {
    const userId = req.userId;
    const { limit = 12 } = req.query;
    
    // Buscar el cliente
    const client = await Client.findOne({
      where: { userId }
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    // Obtener vales pagados agrupados por mes
    const paidVouchers = await Voucher.findAll({
      where: {
        clientId: client.id,
        status: 'paid'
      },
      include: [
        { model: Product, as: 'product', attributes: ['id', 'name'] }
      ],
      order: [['paidAt', 'DESC']]
    });

    // Agrupar por mes
    const monthlyPayments = {};
    
    paidVouchers.forEach(voucher => {
      const paidDate = new Date(voucher.paidAt);
      const monthKey = `${paidDate.getFullYear()}-${String(paidDate.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyPayments[monthKey]) {
        monthlyPayments[monthKey] = {
          month: paidDate.getMonth() + 1,
          year: paidDate.getFullYear(),
          vouchers: [],
          totalAmount: 0,
          deliveryFee: 0,
          totalWithDelivery: 0,
          paymentMethod: voucher.paymentMethod,
          paidAt: voucher.paidAt
        };
      }
      
      monthlyPayments[monthKey].vouchers.push(voucher);
      monthlyPayments[monthKey].totalAmount += parseFloat(voucher.totalAmount || 0);
    });

    // Calcular fletes y totales para cada mes
    for (const payment of Object.values(monthlyPayments)) {
      // Obtener flete del distrito del cliente
      let deliveryFee = 1.00; // Valor por defecto
      if (client.district) {
        const district = await District.findOne({
          where: { name: client.district, isActive: true }
        });
        if (district) {
          deliveryFee = parseFloat(district.deliveryFee);
        }
      }
      payment.deliveryFee = deliveryFee;
      payment.totalWithDelivery = payment.totalAmount + deliveryFee;
    }

    // Convertir a array y limitar resultados
    const history = Object.values(monthlyPayments)
      .sort((a, b) => new Date(b.paidAt) - new Date(a.paidAt))
      .slice(0, parseInt(limit));

    res.json({
      success: true,
      data: history
    });

  } catch (error) {
    console.error('Error al obtener historial de pagos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};
