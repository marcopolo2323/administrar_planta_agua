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
  // Pedidos regulares
  const regularOrders = await Order.findAll({
    where: {
      createdAt: {
        [Op.between]: [startDate, endDate]
      }
    },
    include: [
      {
        model: Client,
        as: 'Client',
        attributes: ['id', 'name', 'email']
      },
      {
        model: User,
        as: 'deliveryPerson',
        attributes: ['id', 'username']
      }
    ],
    order: [['createdAt', 'DESC']]
  });

  // Pedidos de visitantes
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
      }
    ],
    order: [['createdAt', 'DESC']]
  });

  // Calcular estadísticas
  const totalSales = regularOrders.reduce((sum, order) => sum + parseFloat(order.total || 0), 0) +
                    guestOrders.reduce((sum, order) => sum + parseFloat(order.total || 0), 0);

  const totalOrders = regularOrders.length + guestOrders.length;
  const completedDeliveries = [...regularOrders, ...guestOrders].filter(order => order.status === 'entregado').length;
  const deliverySuccessRate = totalOrders > 0 ? (completedDeliveries / totalOrders) * 100 : 0;

  // Período anterior para comparación
  const periodLength = endDate - startDate;
  const previousStart = new Date(startDate.getTime() - periodLength);
  const previousEnd = new Date(startDate.getTime() - 1);

  const previousRegularOrders = await Order.findAll({
    where: {
      createdAt: {
        [Op.between]: [previousStart, previousEnd]
      }
    }
  });

  const previousGuestOrders = await GuestOrder.findAll({
    where: {
      createdAt: {
        [Op.between]: [previousStart, previousEnd]
      }
    }
  });

  const previousTotalSales = previousRegularOrders.reduce((sum, order) => sum + parseFloat(order.total || 0), 0) +
                            previousGuestOrders.reduce((sum, order) => sum + parseFloat(order.total || 0), 0);

  const growthPercentage = previousTotalSales > 0 ? 
    ((totalSales - previousTotalSales) / previousTotalSales) * 100 : 0;

  // Detalles del reporte
  const details = [
    ...regularOrders.map(order => ({
      date: order.createdAt.toISOString().split('T')[0],
      description: `Pedido regular #${order.id} - ${order.Client?.name || 'Cliente'}`,
      amount: parseFloat(order.total || 0),
      status: order.status === 'entregado' ? 'completed' : 'pending',
      type: 'regular'
    })),
    ...guestOrders.map(order => ({
      date: order.createdAt.toISOString().split('T')[0],
      description: `Pedido visitante #${order.id} - ${order.customerName}`,
      amount: parseFloat(order.total || 0),
      status: order.status === 'entregado' ? 'completed' : 'pending',
      type: 'guest'
    }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  return {
    totalSales,
    totalOrders,
    completedDeliveries,
    deliverySuccessRate,
    growthPercentage,
    averageOrderValue: totalOrders > 0 ? totalSales / totalOrders : 0,
    newCustomers: 0, // Se puede implementar lógica para detectar clientes nuevos
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
        as: 'Client',
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
            as: 'Product',
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
        as: 'products',
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
          name: detail.Product?.name || 'N/A',
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
        as: 'Client',
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
  // Clientes que hicieron pedidos en el período
  const clientsWithOrders = await Client.findAll({
    include: [
      {
        model: Order,
        as: 'Orders',
        where: {
          createdAt: {
            [Op.between]: [startDate, endDate]
          }
        },
        required: true,
        include: [
          {
            model: User,
            as: 'deliveryPerson',
            attributes: ['id', 'username']
          }
        ]
      }
    ],
    order: [['name', 'ASC']]
  });

  // Estadísticas de clientes
  const totalClients = await Client.count();
  const activeClients = clientsWithOrders.length;
  const newClients = await Client.count({
    where: {
      createdAt: {
        [Op.between]: [startDate, endDate]
      }
    }
  });

  // Clientes con vales pendientes
  const clientsWithPendingVouchers = await Client.findAll({
    include: [
      {
        model: Voucher,
        as: 'Vouchers',
        where: { status: 'pending' },
        required: true
      }
    ]
  });

  return {
    totalClients,
    activeClients,
    newClients,
    clientsWithPendingVouchers: clientsWithPendingVouchers.length,
    clients: clientsWithOrders.map(client => {
      const totalSpent = client.Orders.reduce((sum, order) => sum + parseFloat(order.total || 0), 0);
      const totalOrders = client.Orders.length;
      const lastOrder = client.Orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
      
      return {
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        totalSpent,
        totalOrders,
        averageOrderValue: totalOrders > 0 ? totalSpent / totalOrders : 0,
        lastOrderDate: lastOrder?.createdAt,
        lastOrderAmount: lastOrder ? parseFloat(lastOrder.total || 0) : 0,
        district: client.district
      };
    })
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
        as: 'Product',
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
    const productId = detail.Product?.id;
    const productName = detail.Product?.name || 'Producto desconocido';
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