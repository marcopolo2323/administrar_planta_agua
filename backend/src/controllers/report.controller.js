const { Sale, SaleDetail, Product, Client, User, sequelize } = require('../models');
const { Op } = require('sequelize');

// Reporte de ventas por período
exports.getSalesByPeriod = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const sales = await Sale.findAll({
      where: {
        date: {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        },
        status: 'pagado'
      },
      include: [
        { model: Client },
        { model: User, as: 'seller', attributes: ['id', 'username'] },
        { 
          model: SaleDetail,
          include: [{ model: Product }]
        }
      ],
      order: [['date', 'DESC']]
    });

    // Calcular totales
    const totalVentas = sales.length;
    const montoTotal = sales.reduce((sum, sale) => sum + parseFloat(sale.total), 0);

    // Agrupar por tipo de factura
    const ventasPorTipo = {
      boleta: sales.filter(sale => sale.invoiceType === 'boleta').length,
      factura: sales.filter(sale => sale.invoiceType === 'factura').length,
      vale: sales.filter(sale => sale.invoiceType === 'vale').length
    };

    return res.status(200).json({
      sales,
      resumen: {
        totalVentas,
        montoTotal,
        ventasPorTipo
      }
    });
  } catch (error) {
    console.error('Error al generar reporte de ventas por período:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Reporte de ventas por cliente
exports.getSalesByClient = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Obtener todas las ventas en el período
    const sales = await Sale.findAll({
      where: {
        date: {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        },
        status: 'pagado'
      },
      include: [
        { model: Client },
        { 
          model: SaleDetail,
          include: [{ model: Product }]
        }
      ]
    });

    // Agrupar ventas por cliente
    const clientSales = {};
    
    for (const sale of sales) {
      const clientId = sale.Client.id;
      const clientName = sale.Client.name;
      
      if (!clientSales[clientId]) {
        clientSales[clientId] = {
          clientId,
          clientName,
          totalVentas: 0,
          montoTotal: 0,
          ventas: []
        };
      }
      
      clientSales[clientId].totalVentas += 1;
      clientSales[clientId].montoTotal += parseFloat(sale.total);
      clientSales[clientId].ventas.push({
        id: sale.id,
        fecha: sale.date,
        total: sale.total,
        tipoFactura: sale.invoiceType
      });
    }

    // Convertir a array y ordenar por monto total
    const result = Object.values(clientSales).sort((a, b) => b.montoTotal - a.montoTotal);

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error al generar reporte de ventas por cliente:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Reporte de ventas por producto
exports.getSalesByProduct = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Obtener todos los detalles de venta en el período
    const saleDetails = await SaleDetail.findAll({
      include: [
        { 
          model: Sale,
          where: {
            date: {
              [Op.between]: [new Date(startDate), new Date(endDate)]
            },
            status: 'pagado'
          }
        },
        { model: Product }
      ]
    });

    // Agrupar por producto
    const productSales = {};
    
    for (const detail of saleDetails) {
      const productId = detail.Product.id;
      const productName = detail.Product.name;
      
      if (!productSales[productId]) {
        productSales[productId] = {
          productId,
          productName,
          cantidadTotal: 0,
          montoTotal: 0
        };
      }
      
      productSales[productId].cantidadTotal += detail.quantity;
      productSales[productId].montoTotal += parseFloat(detail.subtotal);
    }

    // Convertir a array y ordenar por cantidad total
    const result = Object.values(productSales).sort((a, b) => b.cantidadTotal - a.cantidadTotal);

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error al generar reporte de ventas por producto:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Reporte de ventas por distrito
exports.getSalesByDistrict = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Obtener todas las ventas en el período con clientes que tienen distrito
    const sales = await Sale.findAll({
      where: {
        date: {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        },
        status: 'pagado'
      },
      include: [
        { 
          model: Client,
          where: {
            district: {
              [Op.not]: null
            }
          }
        }
      ]
    });

    // Agrupar por distrito
    const districtSales = {};
    
    for (const sale of sales) {
      const district = sale.Client.district;
      
      if (!districtSales[district]) {
        districtSales[district] = {
          distrito: district,
          totalVentas: 0,
          montoTotal: 0
        };
      }
      
      districtSales[district].totalVentas += 1;
      districtSales[district].montoTotal += parseFloat(sale.total);
    }

    // Convertir a array y ordenar por monto total
    const result = Object.values(districtSales).sort((a, b) => b.montoTotal - a.montoTotal);

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error al generar reporte de ventas por distrito:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};