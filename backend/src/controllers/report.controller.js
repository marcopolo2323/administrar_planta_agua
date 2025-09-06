const { Op } = require('sequelize');
const { Sale, Order, GuestOrder, Client, Product, DeliveryPerson } = require('../models');

// Generar reporte general
exports.generateReport = async (req, res) => {
  try {
    const { type, startDate, endDate } = req.query;

    if (!type) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de reporte es requerido'
      });
    }

    const whereClause = {};
    if (startDate && endDate) {
      whereClause.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    let reportData = {};

    switch (type) {
      case 'sales':
        reportData = await generateSalesReport(whereClause);
        break;
      case 'orders':
        reportData = await generateOrdersReport(whereClause);
        break;
      case 'deliveries':
        reportData = await generateDeliveriesReport(whereClause);
        break;
      case 'customers':
        reportData = await generateCustomersReport(whereClause);
        break;
      case 'products':
        reportData = await generateProductsReport(whereClause);
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
    console.error('Error al generar reporte:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Reporte de ventas
async function generateSalesReport(whereClause) {
  const sales = await Sale.findAll({
    where: whereClause,
    include: [
      { model: Client, attributes: ['id', 'name'] }
    ],
    order: [['createdAt', 'DESC']]
  });

  const totalSales = sales.reduce((sum, sale) => sum + parseFloat(sale.totalAmount || 0), 0);
  const totalCount = sales.length;
  const averageOrderValue = totalCount > 0 ? totalSales / totalCount : 0;

  // Calcular crecimiento (comparar con período anterior)
  const previousPeriodStart = new Date(whereClause.createdAt[Op.between][0]);
  const previousPeriodEnd = new Date(whereClause.createdAt[Op.between][1]);
  const periodLength = previousPeriodEnd - previousPeriodStart;
  previousPeriodStart.setTime(previousPeriodStart.getTime() - periodLength);
  previousPeriodEnd.setTime(previousPeriodEnd.getTime() - periodLength);

  const previousSales = await Sale.findAll({
    where: {
      createdAt: {
        [Op.between]: [previousPeriodStart, previousPeriodEnd]
      }
    }
  });

  const previousTotal = previousSales.reduce((sum, sale) => sum + parseFloat(sale.totalAmount || 0), 0);
  const growthPercentage = previousTotal > 0 ? ((totalSales - previousTotal) / previousTotal) * 100 : 0;

  return {
    totalSales,
    totalCount,
    averageOrderValue,
    growthPercentage: Math.round(growthPercentage * 100) / 100,
    details: sales.map(sale => ({
      date: sale.createdAt,
      description: `Venta #${sale.id}`,
      amount: sale.totalAmount,
      status: 'completed'
    }))
  };
}

// Reporte de pedidos
async function generateOrdersReport(whereClause) {
  const orders = await Order.findAll({
    where: whereClause,
    include: [
      { model: Client, attributes: ['id', 'name'] },
      { model: DeliveryPerson, attributes: ['id', 'name'] }
    ],
    order: [['createdAt', 'DESC']]
  });

  const guestOrders = await GuestOrder.findAll({
    where: whereClause,
    order: [['createdAt', 'DESC']]
  });

  const allOrders = [...orders, ...guestOrders];
  const totalOrders = allOrders.length;
  const completedOrders = allOrders.filter(order => order.status === 'delivered').length;
  const pendingOrders = allOrders.filter(order => ['pending', 'confirmed', 'preparing'].includes(order.status)).length;

  return {
    totalOrders,
    completedOrders,
    pendingOrders,
    completionRate: totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0,
    details: allOrders.map(order => ({
      date: order.createdAt,
      description: `Pedido #${order.id}`,
      amount: order.totalAmount || 0,
      status: order.status
    }))
  };
}

// Reporte de entregas
async function generateDeliveriesReport(whereClause) {
  const orders = await Order.findAll({
    where: {
      ...whereClause,
      status: 'delivered'
    },
    include: [
      { model: DeliveryPerson, attributes: ['id', 'name'] }
    ],
    order: [['updatedAt', 'DESC']]
  });

  const guestOrders = await GuestOrder.findAll({
    where: {
      ...whereClause,
      status: 'delivered'
    },
    order: [['updatedAt', 'DESC']]
  });

  const allDeliveries = [...orders, ...guestOrders];
  const totalDeliveries = allDeliveries.length;

  // Estadísticas por repartidor
  const deliveryStats = {};
  allDeliveries.forEach(delivery => {
    if (delivery.DeliveryPerson) {
      const personName = delivery.DeliveryPerson.name;
      if (!deliveryStats[personName]) {
        deliveryStats[personName] = 0;
      }
      deliveryStats[personName]++;
    }
  });

  return {
    totalDeliveries,
    deliveryStats,
    details: allDeliveries.map(delivery => ({
      date: delivery.updatedAt,
      description: `Entrega #${delivery.id}`,
      amount: delivery.totalAmount || 0,
      status: 'delivered'
    }))
  };
}

// Reporte de clientes
async function generateCustomersReport(whereClause) {
  const clients = await Client.findAll({
    where: whereClause,
    order: [['createdAt', 'DESC']]
  });

  const totalCustomers = clients.length;
  const newCustomers = clients.filter(client => {
    const clientDate = new Date(client.createdAt);
    const startDate = whereClause.createdAt ? new Date(whereClause.createdAt[Op.between][0]) : new Date();
    return clientDate >= startDate;
  }).length;

  return {
    totalCustomers,
    newCustomers,
    details: clients.map(client => ({
      date: client.createdAt,
      description: `Cliente: ${client.name}`,
      amount: 0,
      status: 'active'
    }))
  };
}

// Reporte de productos
async function generateProductsReport(whereClause) {
  const products = await Product.findAll({
    where: whereClause,
    order: [['createdAt', 'DESC']]
  });

  const totalProducts = products.length;
  const activeProducts = products.filter(product => product.active).length;

  return {
    totalProducts,
    activeProducts,
    inactiveProducts: totalProducts - activeProducts,
    details: products.map(product => ({
      date: product.createdAt,
      description: product.name,
      amount: product.price || 0,
      status: product.active ? 'active' : 'inactive'
    }))
  };
}