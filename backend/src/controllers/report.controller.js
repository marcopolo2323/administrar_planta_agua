const { Op } = require('sequelize');
const { Order, GuestOrder, Client, User, Product, OrderDetail, GuestOrderProduct, Voucher } = require('../models');

exports.generateReport = async (req, res) => {
  try {
    const { type, startDate, endDate } = req.query;

    if (!type || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de reporte, fecha inicio y fecha fin son requeridos'
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Incluir todo el día final

    let reportData = {};

    switch (type) {
      case 'sales':
        reportData = await exports.generateSalesReport(start, end);
        break;
      case 'orders':
        reportData = await generateOrdersReport(start, end);
        break;
      case 'deliveries':
        reportData = await generateDeliveriesReport(start, end);
        break;
      case 'customers':
        reportData = await generateCustomersReport(start, end);
        break;
      case 'products':
        reportData = await generateProductsReport(start, end);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Tipo de reporte no válido'
        });
    }

    res.json({
      success: true,
      data: reportData
    });

  } catch (error) {
    console.error('Error generando reporte:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Reporte de Ventas
exports.generateSalesReport = async function generateSalesReport(startDate, endDate) {
  console.log('🔍 Generando reporte de ventas para período:', { startDate, endDate });

  // Solo pedidos de visitantes (GuestOrder) ya que es el sistema principal
  const guestOrders = await GuestOrder.findAll({
    where: {
      createdAt: {
        [Op.between]: [startDate, endDate]
      }
    },
    include: [
      {
        model: User,
        as: 'deliveryPerson',
        attributes: ['id', 'username'],
        required: false
      }
    ],
    order: [['createdAt', 'DESC']]
  });

  console.log(`📦 Pedidos encontrados en el período: ${guestOrders.length}`);

  // Calcular estadísticas
  const totalSales = guestOrders.reduce((sum, order) => sum + parseFloat(order.totalAmount || 0), 0);
  const totalOrders = guestOrders.length;
  const completedDeliveries = guestOrders.filter(order => order.status === 'delivered' || order.status === 'entregado').length;
  const deliverySuccessRate = totalOrders > 0 ? (completedDeliveries / totalOrders) * 100 : 0;

  // Período anterior para comparación
  const periodLength = endDate - startDate;
  const previousStart = new Date(startDate.getTime() - periodLength);
  const previousEnd = new Date(startDate.getTime() - 1);

  const previousGuestOrders = await GuestOrder.findAll({
    where: {
      createdAt: {
        [Op.between]: [previousStart, previousEnd]
      }
    }
  });

  const previousTotalSales = previousGuestOrders.reduce((sum, order) => sum + parseFloat(order.totalAmount || 0), 0);

  const growthPercentage = previousTotalSales > 0 ? 
    ((totalSales - previousTotalSales) / previousTotalSales) * 100 : 0;

  // Contar clientes nuevos (clientes que hicieron su primer pedido en este período)
  const clientIds = guestOrders.filter(order => order.clientId).map(order => order.clientId);
  const uniqueClientIds = [...new Set(clientIds)];
  
  let newCustomers = 0;
  for (const clientId of uniqueClientIds) {
    const firstOrder = await GuestOrder.findOne({
      where: { clientId },
      order: [['createdAt', 'ASC']]
    });
    if (firstOrder && firstOrder.createdAt >= startDate && firstOrder.createdAt <= endDate) {
      newCustomers++;
    }
  }

  // Detalles del reporte
  const details = guestOrders.map(order => ({
    date: order.createdAt.toISOString().split('T')[0],
    description: `Pedido #${order.id} - ${order.customerName}`,
    amount: parseFloat(order.totalAmount || 0),
    status: (order.status === 'delivered' || order.status === 'entregado') ? 'completed' : 'pending',
    type: order.clientId ? 'frequent_client' : 'guest',
    paymentMethod: order.paymentMethod,
    deliveryDistrict: order.deliveryDistrict
  })).sort((a, b) => new Date(b.date) - new Date(a.date));

  console.log(`📈 Estadísticas calculadas: Ventas: ${totalSales}, Pedidos: ${totalOrders}, Entregados: ${completedDeliveries}, Nuevos clientes: ${newCustomers}`);

  return {
    totalSales,
    totalOrders,
    completedDeliveries,
    deliverySuccessRate,
    growthPercentage,
    averageOrderValue: totalOrders > 0 ? totalSales / totalOrders : 0,
    newCustomers,
    totalCustomers: await Client.count(),
    details,
    period: {
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0]
    }
  };
}

// Reporte de Pedidos
async function generateOrdersReport(startDate, endDate) {
  const regularOrders = await Order.findAll({
    where: {
      createdAt: {
        [Op.between]: [startDate, endDate]
      }
    },
    include: [
      {
        model: Client,
        as: 'client',
        attributes: ['id', 'name', 'email']
      },
      {
        model: User,
        as: 'deliveryPerson',
        attributes: ['id', 'username']
      },
      {
        model: OrderDetail,
        as: 'orderDetails',
        include: [
          {
            model: Product,
            as: 'product',
            attributes: ['id', 'name', 'price']
          }
        ]
      }
    ],
    order: [['createdAt', 'DESC']]
  });

  const guestOrders = await GuestOrder.findAll({
    where: {
      createdAt: {
        [Op.between]: [startDate, endDate]
      }
    },
    include: [
      {
        model: User,
        as: 'deliveryPerson',
        attributes: ['id', 'username']
      },
      {
        model: GuestOrderProduct,
        as: 'orderProducts',
        include: [
          {
            model: Product,
            as: 'product',
            attributes: ['id', 'name', 'price']
          }
        ]
      }
    ],
    order: [['createdAt', 'DESC']]
  });

  const totalOrders = regularOrders.length + guestOrders.length;
  const totalAmount = regularOrders.reduce((sum, order) => sum + parseFloat(order.total || 0), 0) +
                    guestOrders.reduce((sum, order) => sum + parseFloat(order.total || 0), 0);

  // Estadísticas por estado
  const statusStats = {};
  [...regularOrders, ...guestOrders].forEach(order => {
    statusStats[order.status] = (statusStats[order.status] || 0) + 1;
  });

  return {
    totalOrders,
    totalAmount,
    regularOrders: regularOrders.length,
    guestOrders: guestOrders.length,
    statusStats,
    orders: [
      ...regularOrders.map(order => ({
        id: order.id,
        type: 'regular',
        clientName: order.Client?.name || 'N/A',
        total: parseFloat(order.total || 0),
        status: order.status,
        createdAt: order.createdAt,
        deliveryPerson: order.deliveryPerson?.username || 'N/A',
        products: order.orderDetails?.map(detail => ({
          name: detail.product?.name || 'N/A',
          quantity: detail.quantity,
          price: parseFloat(detail.price || 0)
        })) || []
      })),
      ...guestOrders.map(order => ({
        id: order.id,
        type: 'guest',
        clientName: order.customerName,
        total: parseFloat(order.total || 0),
        status: order.status,
        createdAt: order.createdAt,
        deliveryPerson: order.deliveryPerson?.username || 'N/A',
        products: order.products?.map(item => ({
          name: item.product?.name || 'N/A',
          quantity: item.quantity,
          price: parseFloat(item.price || 0)
        })) || []
      }))
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  };
}

// Reporte de Entregas
async function generateDeliveriesReport(startDate, endDate) {
  const regularOrders = await Order.findAll({
    where: {
      createdAt: {
        [Op.between]: [startDate, endDate]
      }
    },
    include: [
      {
        model: Client,
        as: 'client',
        attributes: ['id', 'name', 'phone']
      },
      {
        model: User,
        as: 'deliveryPerson',
        attributes: ['id', 'username', 'phone']
      }
    ],
    order: [['createdAt', 'DESC']]
  });

  const guestOrders = await GuestOrder.findAll({
    where: {
      createdAt: {
        [Op.between]: [startDate, endDate]
      }
    },
    include: [
      {
        model: User,
        as: 'deliveryPerson',
        attributes: ['id', 'username', 'phone']
      }
    ],
    order: [['createdAt', 'DESC']]
  });

  const allOrders = [...regularOrders, ...guestOrders];
  const completedDeliveries = allOrders.filter(order => order.status === 'entregado');
  const pendingDeliveries = allOrders.filter(order => ['pendiente', 'confirmado', 'en_preparacion', 'en_camino'].includes(order.status));

  // Estadísticas por repartidor
  const deliveryPersonStats = {};
  allOrders.forEach(order => {
    const deliveryPerson = order.deliveryPerson?.username || 'Sin asignar';
    if (!deliveryPersonStats[deliveryPerson]) {
      deliveryPersonStats[deliveryPerson] = {
        total: 0,
        completed: 0,
        pending: 0
      };
    }
    deliveryPersonStats[deliveryPerson].total++;
    if (order.status === 'entregado') {
      deliveryPersonStats[deliveryPerson].completed++;
    } else {
      deliveryPersonStats[deliveryPerson].pending++;
    }
  });

  return {
    totalDeliveries: allOrders.length,
    completedDeliveries: completedDeliveries.length,
    pendingDeliveries: pendingDeliveries.length,
    successRate: allOrders.length > 0 ? (completedDeliveries.length / allOrders.length) * 100 : 0,
    deliveryPersonStats,
    deliveries: allOrders.map(order => ({
      id: order.id,
      type: order.Client ? 'regular' : 'guest',
      clientName: order.Client?.name || order.customerName,
      clientPhone: order.Client?.phone || order.customerPhone,
      total: parseFloat(order.total || 0),
      status: order.status,
      createdAt: order.createdAt,
      deliveryPerson: order.deliveryPerson?.username || 'Sin asignar',
      deliveryAddress: order.deliveryAddress,
      deliveryDistrict: order.deliveryDistrict
    }))
  };
}

// Reporte de Clientes
async function generateCustomersReport(startDate, endDate) {
  console.log('🔍 Generando reporte de clientes para período:', { startDate, endDate });

  // Obtener todos los clientes
  const allClients = await Client.findAll({
    attributes: ['id', 'name', 'email', 'phone', 'district', 'documentNumber', 'createdAt'],
    order: [['name', 'ASC']]
  });

  console.log(`📊 Total de clientes en la base de datos: ${allClients.length}`);

  // Obtener pedidos de invitados del período que tienen clientId (clientes frecuentes)
  const guestOrdersWithClients = await GuestOrder.findAll({
    where: {
      createdAt: {
        [Op.between]: [startDate, endDate]
      },
      clientId: {
        [Op.ne]: null // Solo pedidos con clientId (clientes frecuentes)
      }
    },
    include: [
      {
        model: GuestOrderProduct,
        as: 'orderProducts',
        include: [
          {
            model: Product,
            as: 'product',
            attributes: ['id', 'name', 'unitPrice']
          }
        ]
      }
    ],
    order: [['createdAt', 'DESC']]
  });

  console.log(`📦 Pedidos de clientes frecuentes en el período: ${guestOrdersWithClients.length}`);

  // Agrupar pedidos por cliente
  const clientOrdersMap = {};
  guestOrdersWithClients.forEach(order => {
    if (!clientOrdersMap[order.clientId]) {
      clientOrdersMap[order.clientId] = [];
    }
    clientOrdersMap[order.clientId].push(order);
  });

  // Estadísticas de clientes
  const totalClients = allClients.length;
  const activeClients = Object.keys(clientOrdersMap).length;
  const newClients = allClients.filter(client => {
    const createdAt = new Date(client.createdAt);
    return createdAt >= startDate && createdAt <= endDate;
  }).length;

  // Clientes con vales pendientes
  const clientsWithPendingVouchers = await Client.findAll({
    include: [
      {
        model: Voucher,
        as: 'vouchers',
        where: { status: 'pending' },
        required: true
      }
    ]
  });

  console.log(`📈 Estadísticas: Total: ${totalClients}, Activos: ${activeClients}, Nuevos: ${newClients}, Con vales: ${clientsWithPendingVouchers.length}`);

  // Construir reporte de clientes con actividad
  const clientsWithActivity = allClients.map(client => {
    const clientOrders = clientOrdersMap[client.id] || [];
    const totalSpent = clientOrders.reduce((sum, order) => sum + parseFloat(order.totalAmount || 0), 0);
    const totalOrders = clientOrders.length;
    const lastOrder = clientOrders.length > 0 ? 
      clientOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0] : null;
    
    // Incluir todos los clientes, no solo los que tienen pedidos en el período
    return {
      id: client.id,
      name: client.name,
      email: client.email,
      phone: client.phone,
      documentNumber: client.documentNumber,
      totalSpent,
      totalOrders,
      averageOrderValue: totalOrders > 0 ? totalSpent / totalOrders : 0,
      lastOrderDate: lastOrder?.createdAt,
      lastOrderAmount: lastOrder ? parseFloat(lastOrder.totalAmount || 0) : 0,
      district: client.district,
      isActive: totalOrders > 0, // Cliente activo si tiene pedidos en el período
      createdAt: client.createdAt
    };
  });

  // Ordenar por actividad (clientes activos primero, luego por gasto total)
  clientsWithActivity.sort((a, b) => {
    if (a.isActive && !b.isActive) return -1;
    if (!a.isActive && b.isActive) return 1;
    return b.totalSpent - a.totalSpent;
  });

  return {
    totalClients,
    activeClients,
    newClients,
    clientsWithPendingVouchers: clientsWithPendingVouchers.length,
    clients: clientsWithActivity,
    period: {
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0]
    }
  };
}

// Reporte de Productos
async function generateProductsReport(startDate, endDate) {
  // Productos vendidos en pedidos regulares
  const regularOrderDetails = await OrderDetail.findAll({
    where: {
      createdAt: {
        [Op.between]: [startDate, endDate]
      }
    },
    include: [
      {
        model: Product,
        as: 'product',
        attributes: ['id', 'name', 'price']
      },
      {
        model: Order,
        as: 'Order',
        attributes: ['id', 'createdAt', 'total']
      }
    ]
  });

  // Productos vendidos en pedidos de visitantes
  const guestOrderProducts = await GuestOrderProduct.findAll({
    where: {
      createdAt: {
        [Op.between]: [startDate, endDate]
      }
    },
    include: [
      {
        model: Product,
        as: 'product',
        attributes: ['id', 'name', 'price']
      },
      {
        model: GuestOrder,
        as: 'GuestOrder',
        attributes: ['id', 'createdAt', 'total']
      }
    ]
  });

  // Agregar productos de pedidos regulares
  const productStats = {};
  
  regularOrderDetails.forEach(detail => {
    const productId = detail.product?.id;
    const productName = detail.product?.name || 'Producto desconocido';
    const quantity = detail.quantity;
    const price = parseFloat(detail.price || 0);
    const total = quantity * price;

    if (!productStats[productId]) {
      productStats[productId] = {
        id: productId,
        name: productName,
        totalQuantity: 0,
        totalRevenue: 0,
        averagePrice: price,
        orders: 0
      };
    }

    productStats[productId].totalQuantity += quantity;
    productStats[productId].totalRevenue += total;
    productStats[productId].orders++;
  });

  // Agregar productos de pedidos de visitantes
  guestOrderProducts.forEach(item => {
    const productId = item.product?.id;
    const productName = item.product?.name || 'Producto desconocido';
    const quantity = item.quantity;
    const price = parseFloat(item.price || 0);
    const total = quantity * price;

    if (!productStats[productId]) {
      productStats[productId] = {
        id: productId,
        name: productName,
        totalQuantity: 0,
        totalRevenue: 0,
        averagePrice: price,
        orders: 0
      };
    }

    productStats[productId].totalQuantity += quantity;
    productStats[productId].totalRevenue += total;
    productStats[productId].orders++;
  });

  // Convertir a array y ordenar por cantidad vendida
  const products = Object.values(productStats)
    .map(product => ({
      ...product,
      averagePrice: product.totalQuantity > 0 ? product.totalRevenue / product.totalQuantity : 0
    }))
    .sort((a, b) => b.totalQuantity - a.totalQuantity);

  const totalRevenue = products.reduce((sum, product) => sum + product.totalRevenue, 0);
  const totalQuantity = products.reduce((sum, product) => sum + product.totalQuantity, 0);

  return {
    totalProducts: products.length,
    totalRevenue,
    totalQuantity,
    averagePrice: totalQuantity > 0 ? totalRevenue / totalQuantity : 0,
    products
  };
}

// Reporte de cobranza mensual (específico para vales pendientes)
exports.generateCollectionReport = async (req, res) => {
  try {
    const { year, month } = req.query;
    
    if (!year || !month) {
      return res.status(400).json({
        success: false,
        message: 'Año y mes son requeridos'
      });
    }

    console.log('🔍 Generando reporte de cobranza para:', { year, month });

    // Calcular fechas del mes
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // Último día del mes

    // Obtener vales pendientes del período
    const pendingVouchers = await Voucher.findAll({
      where: {
        status: 'pending',
        createdAt: {
          [Op.between]: [startDate, endDate]
        }
      },
      include: [
        {
          model: Client,
          as: 'client',
          attributes: ['id', 'name', 'email', 'phone', 'documentNumber'],
          required: true
        },
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'unitPrice'],
          required: false
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    console.log(`📦 Vales pendientes encontrados: ${pendingVouchers.length}`);

    // Agrupar por cliente
    const clientDebts = {};
    let totalDebt = 0;

    pendingVouchers.forEach(voucher => {
      const clientId = voucher.clientId;
      const amount = parseFloat(voucher.totalAmount || 0);
      
      if (!clientDebts[clientId]) {
        clientDebts[clientId] = {
          client: voucher.client,
          totalAmount: 0,
          remainingAmount: 0,
          totalDebt: 0,
          voucherCount: 0,
          valesCount: 0,
          vouchers: []
        };
      }
      
      clientDebts[clientId].totalAmount += amount;
      clientDebts[clientId].remainingAmount += amount; // Para vales pendientes, remaining = total
      clientDebts[clientId].totalDebt += amount;
      clientDebts[clientId].voucherCount += 1;
      clientDebts[clientId].valesCount += 1;
      clientDebts[clientId].vouchers.push({
        id: voucher.id,
        quantity: voucher.quantity,
        unitPrice: voucher.unitPrice,
        totalAmount: voucher.totalAmount,
        product: voucher.product,
        createdAt: voucher.createdAt
      });
      
      totalDebt += amount;
    });

    // Convertir a array y ordenar por deuda
    const clientsWithDebt = Object.values(clientDebts)
      .sort((a, b) => b.remainingAmount - a.remainingAmount);

    console.log(`💰 Reporte generado: ${clientsWithDebt.length} clientes, deuda total: ${totalDebt}`);

    res.json({
      success: true,
      data: {
        period: {
          year: parseInt(year),
          month: parseInt(month)
        },
        summary: {
          totalClients: clientsWithDebt.length,
          totalDebt: totalDebt,
          totalVouchers: pendingVouchers.length
        },
        clients: clientsWithDebt
      }
    });

  } catch (error) {
    console.error('Error al generar reporte de cobranza:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};