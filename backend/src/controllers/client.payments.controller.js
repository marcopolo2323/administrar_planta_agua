const { Client, Voucher, Order, sequelize } = require('../models');
const { Op } = require('sequelize');

// Obtener estadísticas de pagos de clientes frecuentes
exports.getClientPaymentStats = async (req, res) => {
  try {
    console.log('🔍 Obteniendo estadísticas de pagos de clientes...');

    // Calcular si estamos en los últimos 5 días del mes
    const now = new Date();
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const daysUntilEndOfMonth = lastDayOfMonth.getDate() - now.getDate();
    const isEndOfMonth = daysUntilEndOfMonth <= 5;

    // Obtener todos los clientes con vales pendientes
    const clientsWithPendingVouchers = await Client.findAll({
      include: [
        {
          model: Voucher,
          as: 'Vouchers',
          where: { status: 'pending' },
          required: true,
          include: [
            {
              model: Order,
              as: 'order',
              attributes: ['id', 'orderDate', 'total']
            }
          ]
        }
      ],
      attributes: [
        'id',
        'name',
        'email',
        'phone',
        'address',
        'district'
      ]
    });

    // Calcular estadísticas por cliente
    const clientStats = clientsWithPendingVouchers.map(client => {
      const pendingVouchers = client.Vouchers || [];
      const totalPending = pendingVouchers.reduce((sum, voucher) => {
        return sum + parseFloat(voucher.totalAmount || 0);
      }, 0);

      const voucherCount = pendingVouchers.length;
      const oldestVoucher = pendingVouchers.length > 0 
        ? new Date(Math.min(...pendingVouchers.map(v => new Date(v.createdAt))))
        : null;

      const daysSinceOldestVoucher = oldestVoucher 
        ? Math.floor((now - oldestVoucher) / (1000 * 60 * 60 * 24))
        : 0;

      return {
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        address: client.address,
        district: client.district,
        pendingVouchers: voucherCount,
        totalPending: totalPending,
        daysSinceOldestVoucher: daysSinceOldestVoucher,
        isOverdue: daysSinceOldestVoucher > 30, // Más de 30 días
        priority: daysSinceOldestVoucher > 30 ? 'high' : 
                 daysSinceOldestVoucher > 15 ? 'medium' : 'low'
      };
    });

    // Ordenar por prioridad y monto
    clientStats.sort((a, b) => {
      if (a.priority !== b.priority) {
        const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return b.totalPending - a.totalPending;
    });

    // Calcular estadísticas generales
    const totalClientsWithPending = clientStats.length;
    const totalPendingAmount = clientStats.reduce((sum, client) => sum + client.totalPending, 0);
    const overdueClients = clientStats.filter(client => client.isOverdue).length;
    const highPriorityClients = clientStats.filter(client => client.priority === 'high').length;

    const stats = {
      isEndOfMonth: isEndOfMonth,
      daysUntilEndOfMonth: daysUntilEndOfMonth,
      totalClientsWithPending: totalClientsWithPending,
      totalPendingAmount: totalPendingAmount,
      overdueClients: overdueClients,
      highPriorityClients: highPriorityClients,
      clients: clientStats
    };

    console.log(`📊 Estadísticas calculadas: ${totalClientsWithPending} clientes con vales pendientes, S/ ${totalPendingAmount.toFixed(2)} total`);

    res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('❌ Error al obtener estadísticas de pagos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener detalles de vales de un cliente específico
exports.getClientVoucherDetails = async (req, res) => {
  try {
    const { clientId } = req.params;

    console.log(`🔍 Obteniendo detalles de vales para cliente ${clientId}...`);

    const client = await Client.findByPk(clientId, {
      include: [
        {
          model: Voucher,
          as: 'Vouchers',
          where: { status: 'pending' },
          required: false,
          include: [
            {
              model: Order,
              as: 'order',
              attributes: ['id', 'orderDate', 'total', 'deliveryAddress', 'deliveryDistrict']
            }
          ],
          order: [['createdAt', 'ASC']]
        }
      ]
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    const pendingVouchers = client.Vouchers || [];
    const totalPending = pendingVouchers.reduce((sum, voucher) => {
      return sum + parseFloat(voucher.totalAmount || 0);
    }, 0);

    const response = {
      client: {
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        address: client.address,
        district: client.district
      },
      pendingVouchers: pendingVouchers.map(voucher => ({
        id: voucher.id,
        totalAmount: parseFloat(voucher.totalAmount || 0),
        createdAt: voucher.createdAt,
        status: voucher.status,
        orderId: voucher.order?.id || voucher.orderId,
        orderDate: voucher.order?.orderDate,
        deliveryAddress: voucher.order?.deliveryAddress,
        deliveryDistrict: voucher.order?.deliveryDistrict,
        notes: voucher.notes
      })),
      summary: {
        totalVouchers: pendingVouchers.length,
        totalAmount: totalPending,
        oldestVoucher: pendingVouchers.length > 0 ? pendingVouchers[0].createdAt : null,
        newestVoucher: pendingVouchers.length > 0 ? pendingVouchers[pendingVouchers.length - 1].createdAt : null
      }
    };

    console.log(`📋 Detalles obtenidos: ${pendingVouchers.length} vales, S/ ${totalPending.toFixed(2)} total`);

    res.status(200).json({
      success: true,
      data: response
    });

  } catch (error) {
    console.error('❌ Error al obtener detalles de vales:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Marcar vales como pagados (para administradores)
exports.markVouchersAsPaid = async (req, res) => {
  try {
    const { clientId } = req.params;
    const { paymentMethod = 'efectivo', paymentReference, notes } = req.body;

    console.log(`💰 Marcando vales como pagados para cliente ${clientId}...`);

    const transaction = await sequelize.transaction();

    try {
      // Obtener vales pendientes del cliente
      const pendingVouchers = await Voucher.findAll({
        where: {
          clientId: clientId,
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

      // Calcular total
      const totalAmount = pendingVouchers.reduce((sum, voucher) => {
        return sum + parseFloat(voucher.totalAmount || 0);
      }, 0);

      // Actualizar vales
      await Voucher.update(
        {
          status: 'paid',
          paymentMethod: paymentMethod,
          paymentReference: paymentReference || `Pago administrado - ${new Date().toLocaleString()}`,
          notes: notes || 'Pago procesado por administrador',
          paidAt: new Date()
        },
        {
          where: {
            clientId: clientId,
            status: 'pending'
          },
          transaction
        }
      );

      await transaction.commit();

      console.log(`✅ Vales marcados como pagados: ${pendingVouchers.length} vales, S/ ${totalAmount.toFixed(2)}`);

      res.status(200).json({
        success: true,
        message: 'Vales marcados como pagados correctamente',
        data: {
          vouchersPaid: pendingVouchers.length,
          totalAmount: totalAmount,
          paymentMethod: paymentMethod,
          paymentReference: paymentReference
        }
      });

    } catch (error) {
      await transaction.rollback();
      throw error;
    }

  } catch (error) {
    console.error('❌ Error al marcar vales como pagados:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};
