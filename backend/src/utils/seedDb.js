const { sequelize } = require('../models');
// This file seeds the database with test data for development and testing purposes
const User = require('../models/user.model');
const Product = require('../models/product.model');
const Client = require('../models/client.model');
const Sale = require('../models/sale.model');
const SaleDetail = require('../models/saleDetail.model');
const Purchase = require('../models/purchase.model');
const PurchaseDetail = require('../models/purchaseDetail.model');
const CashRegister = require('../models/cashRegister.model');
const CashMovement = require('../models/cashMovement.model');
const Inventory = require('../models/inventory.model');
const Credit = require('../models/credit.model');
const CreditPayment = require('../models/creditPayment.model');
const ElectronicInvoice = require('../models/electronicInvoice.model');
const Order = require('../models/order.model');
const OrderDetail = require('../models/orderDetail.model');
const DeliveryPerson = require('../models/deliveryPerson.model');
const GuestOrder = require('../models/guestOrder.model');
const Payment = require('../models/payment.model');
const mongoose = require('mongoose');
const Notification = require('../models/notification.model');

// Conectar a MongoDB para las notificaciones
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/punto_de_venta', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Conexión a MongoDB establecida para notificaciones');
}).catch(err => {
  console.error('Error al conectar a MongoDB:', err);
});


async function seedDatabase() {
  try {
    console.log('Iniciando la carga de datos de prueba...');

    // Verificar si ya existen clientes
    const existingClients = await Client.findAll();
    let clients = [];
    
    if (existingClients.length === 0) {
      // Crear clientes de prueba solo si no existen
      clients = await Client.bulkCreate([
        {
          name: 'Juan Pérez',
          documentType: 'DNI',
          documentNumber: '45678912',
          address: 'Av. Los Pinos 123',
          district: 'San Isidro',
          phone: '987654321',
          email: 'juan.perez@example.com',
          isCompany: false,
          hasCredit: false,
          active: true
        },
        {
          name: 'María López',
          documentType: 'DNI',
          documentNumber: '78912345',
          address: 'Jr. Las Flores 456',
          district: 'Miraflores',
          phone: '912345678',
          email: 'maria.lopez@example.com',
          isCompany: false,
          hasCredit: true,
          active: true
        },
        {
          name: 'Distribuidora Agua Pura S.A.C.',
          documentType: 'RUC',
          documentNumber: '20123456789',
          address: 'Av. Industrial 789',
          district: 'Ate',
          phone: '01234567',
          email: 'ventas@distribuidoraaguapura.com',
          isCompany: true,
          hasCredit: true,
          active: true
        },
        {
          name: 'Pedro Ramírez',
          documentType: 'DNI',
          documentNumber: '12345678',
          address: 'Calle Los Olivos 234',
          district: 'San Borja',
          phone: '945678123',
          email: 'pedro.ramirez@example.com',
          isCompany: false,
          hasCredit: false,
          active: true
        },
        {
          name: 'Restaurante El Manantial E.I.R.L.',
          documentType: 'RUC',
          documentNumber: '20987654321',
          address: 'Av. La Marina 567',
          district: 'San Miguel',
          phone: '01765432',
          email: 'contacto@elmanantial.com',
          isCompany: true,
          hasCredit: true,
          active: true
        }
      ]);
      console.log(`${clients.length} clientes creados correctamente`);
    } else {
      clients = existingClients;
      console.log(`Se encontraron ${clients.length} clientes existentes`);
    }

    // Obtener o crear usuario administrador
    let admin = await User.findOne({ where: { username: 'admin' } });
    if (!admin) {
      admin = await User.create({
        username: 'admin',
        email: 'admin@aguapura.com',
        password: 'admin123',
        role: 'admin'
      });
      console.log('Usuario administrador creado correctamente');
    }

    // Obtener o crear usuario vendedor
    let seller = await User.findOne({ where: { username: 'vendedor' } });
    if (!seller) {
      seller = await User.create({
        username: 'vendedor',
        email: 'vendedor@aguapura.com',
        password: 'vendedor123',
        role: 'vendedor'
      });
      console.log('Usuario vendedor creado correctamente');
    } else {
      console.log('Usuario vendedor ya existe');
    }

    // Crear clientes frecuentes con login
    const frequentClients = [
      {
        user: {
          username: 'carmen.rodriguez',
          email: 'carmen.rodriguez@example.com',
          password: 'cliente123',
          role: 'cliente'
        },
        client: {
          name: 'Carmen Rodríguez',
          documentType: 'DNI',
          documentNumber: '45678901',
          address: 'Av. Los Pinos 456',
          district: 'San Isidro',
          phone: '987654322',
          email: 'carmen.rodriguez@example.com',
          isCompany: false,
          hasCredit: true,
          creditLimit: 500.00,
          currentDebt: 0.00,
          paymentDueDay: 15,
          active: true,
          defaultDeliveryAddress: 'Av. Los Pinos 456, San Isidro',
          defaultContactPhone: '987654322',
          notes: 'Cliente frecuente que compra bidones semanalmente'
        }
      },
      {
        user: {
          username: 'roberto.gomez',
          email: 'roberto.gomez@example.com',
          password: 'cliente123',
          role: 'cliente'
        },
        client: {
          name: 'Roberto Gómez',
          documentType: 'DNI',
          documentNumber: '56789012',
          address: 'Jr. Las Flores 789',
          district: 'Miraflores',
          phone: '912345679',
          email: 'roberto.gomez@example.com',
          isCompany: false,
          hasCredit: false,
          active: true,
          defaultDeliveryAddress: 'Jr. Las Flores 789, Miraflores',
          defaultContactPhone: '912345679',
          notes: 'Prefiere entrega los fines de semana'
        }
      },
      {
        user: {
          username: 'restaurante.manantial',
          email: 'compras@elmanantial.com',
          password: 'cliente123',
          role: 'cliente'
        },
        client: {
          name: 'Restaurante El Manantial',
          documentType: 'RUC',
          documentNumber: '20987654322',
          address: 'Av. La Marina 567',
          district: 'San Miguel',
          phone: '01765433',
          email: 'compras@elmanantial.com',
          isCompany: true,
          hasCredit: true,
          creditLimit: 2000.00,
          currentDebt: 0.00,
          paymentDueDay: 30,
          active: true,
          defaultDeliveryAddress: 'Av. La Marina 567, San Miguel',
          defaultContactPhone: '01765433',
          notes: 'Restaurante que compra agua embotellada en grandes cantidades'
        }
      }
    ];

    // Crear clientes frecuentes con login
    for (const frequentClient of frequentClients) {
      const existingUser = await User.findOne({ where: { email: frequentClient.user.email } });
      if (!existingUser) {
        const user = await User.create(frequentClient.user);
        const client = await Client.create({
          ...frequentClient.client,
          userId: user.id
        });
        console.log(`Cliente frecuente creado: ${client.name} (${user.username})`);
      }
    }
    
    // Obtener o crear usuarios repartidores
    let deliveryUser1 = await User.findOne({ where: { username: 'repartidor1' } });
    if (!deliveryUser1) {
      deliveryUser1 = await User.create({
        username: 'repartidor1',
        email: 'repartidor1@aguapura.com',
        password: 'repartidor123',
        role: 'repartidor'
      });
      console.log('Usuario repartidor1 creado correctamente');
    } else {
      console.log('Usuario repartidor1 ya existe');
    }
    
    let deliveryUser2 = await User.findOne({ where: { username: 'repartidor2' } });
    if (!deliveryUser2) {
      deliveryUser2 = await User.create({
        username: 'repartidor2',
        email: 'repartidor2@aguapura.com',
        password: 'repartidor123',
        role: 'repartidor'
      });
      console.log('Usuario repartidor2 creado correctamente');
    } else {
      console.log('Usuario repartidor2 ya existe');
    }
    
    // Verificar si ya existen repartidores
    const existingDeliveryPersons = await DeliveryPerson.findAll();
    let deliveryPersons = [];
    
    if (existingDeliveryPersons.length === 0) {
      // Crear repartidores de prueba
      const deliveryPerson1 = await DeliveryPerson.create({
        name: 'Carlos Rodríguez',
        documentType: 'DNI',
        documentNumber: '45678123',
        phone: '987123456',
        email: 'carlos.rodriguez@aguapura.com',
        address: 'Av. Los Álamos 456, San Borja',
        vehicleType: 'moto',
        vehiclePlate: 'ABC-123',
        status: 'disponible',
        userId: deliveryUser1.id,
        active: true
      });
      
      deliveryPersons.push(deliveryPerson1);
      
      const deliveryPerson2 = await DeliveryPerson.create({
        name: 'Ana Martínez',
        documentType: 'DNI',
        documentNumber: '78912345',
        phone: '912345678',
        email: 'ana.martinez@aguapura.com',
        address: 'Jr. Las Palmeras 789, Miraflores',
        vehicleType: 'auto',
        vehiclePlate: 'XYZ-789',
        status: 'disponible',
        userId: deliveryUser2.id,
        active: true
      });
      
      deliveryPersons.push(deliveryPerson2);
      
      console.log(`${deliveryPersons.length} repartidores creados correctamente`);
    } else {
      deliveryPersons = existingDeliveryPersons;
      console.log(`Se encontraron ${deliveryPersons.length} repartidores existentes`);
    }

    // Obtener o crear productos específicos del negocio de agua
    let products = await Product.findAll();
    if (products.length === 0) {
      products = await Product.bulkCreate([
        {
          name: 'Bidón de Agua 20L',
          description: 'Bidón de agua purificada de 20 litros',
          type: 'bidon',
          unitPrice: 7.00,
          wholesalePrice: 5.00,
          wholesaleMinQuantity: 2,
          stock: 100
        },
        {
          name: 'Paquete de Botellas 650ml',
          description: 'Paquete de 20 unidades de botellas de agua de 650ml',
          type: 'botella',
          unitPrice: 10.00,
          wholesalePrice: 9.00,
          wholesaleMinQuantity: 50,
          wholesalePrice2: 8.00,
          wholesaleMinQuantity2: 1000,
          stock: 200
        }
      ]);
      console.log('Productos de agua creados correctamente');
    }

    // Verificar si ya existen ventas
    const existingSales = await Sale.findAll();
    let sales = [];
    
    if (existingSales.length === 0) {
      // Crear ventas de prueba solo si no existen
      // Venta 1: Cliente Juan Pérez, compra botellas
      const sale1 = await Sale.create({
        date: new Date(2023, 5, 15), // 15 de junio de 2023
        total: 50.00,
        invoiceType: 'boleta',
        invoiceNumber: 'B001-00001',
        status: 'completado',
        notes: 'Entrega a domicilio',
        clientId: clients[0].id,
        userId: admin.id
      });
      
      await SaleDetail.create({
        quantity: 5,
        unitPrice: 10.00,
        subtotal: 50.00,
        saleId: sale1.id,
        productId: products[0].id
      });
      
      sales.push(sale1);
      
      // Venta 2: Cliente María López, compra bidones
      const sale2 = await Sale.create({
        date: new Date(2023, 5, 20), // 20 de junio de 2023
        total: 35.00,
        invoiceType: 'boleta',
        invoiceNumber: 'B001-00002',
        status: 'completado',
        clientId: clients[1].id,
        userId: seller.id
      });
      
      await SaleDetail.create({
        quantity: 5,
        unitPrice: 7.00,
        subtotal: 35.00,
        saleId: sale2.id,
        productId: products[1].id
      });
      
      sales.push(sale2);
      
      // Venta 3: Empresa Distribuidora, compra mayorista
      const sale3 = await Sale.create({
        date: new Date(2023, 6, 5), // 5 de julio de 2023
        total: 450.00,
        invoiceType: 'factura',
        invoiceNumber: 'F001-00001',
        status: 'completado',
        notes: 'Pedido mensual',
        clientId: clients[2].id,
        userId: admin.id
      });
      
      await SaleDetail.create({
        quantity: 50,
        unitPrice: 9.00, // Precio mayorista
        subtotal: 450.00,
        saleId: sale3.id,
        productId: products[0].id
      });
      
      sales.push(sale3);
      
      // Venta 4: Pedro Ramírez, compra mixta
      const sale4 = await Sale.create({
        date: new Date(2023, 6, 10), // 10 de julio de 2023
        total: 27.00,
        invoiceType: 'boleta',
        invoiceNumber: 'B001-00003',
        status: 'completado',
        clientId: clients[3].id,
        userId: seller.id
      });
      
      await SaleDetail.create({
        quantity: 2,
        unitPrice: 10.00,
        subtotal: 20.00,
        saleId: sale4.id,
        productId: products[0].id
      });
      
      await SaleDetail.create({
        quantity: 1,
        unitPrice: 7.00,
        subtotal: 7.00,
        saleId: sale4.id,
        productId: products[1].id
      });
      
      sales.push(sale4);
      
      // Venta 5: Restaurante, compra grande pendiente de pago
      const sale5 = await Sale.create({
        date: new Date(2023, 6, 15), // 15 de julio de 2023
        total: 100.00,
        invoiceType: 'factura',
        invoiceNumber: 'F001-00002',
        status: 'pendiente',
        notes: 'Pago a 30 días',
        clientId: clients[4].id,
        userId: admin.id
      });
      
      await SaleDetail.create({
        quantity: 20,
        unitPrice: 5.00, // Precio mayorista
        subtotal: 100.00,
        saleId: sale5.id,
        productId: products[1].id
      });
      
      sales.push(sale5);
      console.log(`${sales.length} ventas creadas correctamente`);
    } else {
      sales = existingSales;
      console.log(`Se encontraron ${sales.length} ventas existentes`);
    }

    // Verificar si ya existen cajas
    const existingCashRegisters = await CashRegister.findAll();
    let cashRegisters = [];
    
    if (existingCashRegisters.length === 0) {
      // Crear cajas de prueba solo si no existen
      
      // Caja 1: Caja cerrada del día anterior
      const cashRegister1 = await CashRegister.create({
        userId: admin.id,
        openingDate: new Date(2023, 5, 14, 8, 0), // 14 de junio 8:00 AM
        closingDate: new Date(2023, 5, 14, 18, 0), // 14 de junio 6:00 PM
        openingAmount: 100.00,
        closingAmount: 850.00,
        expectedAmount: 850.00,
        difference: 0.00,
        status: 'cerrada',
        notes: 'Caja del día anterior - todo correcto'
      });
      
      // Movimientos de la caja cerrada
      await CashMovement.create({
        cashRegisterId: cashRegister1.id,
        type: 'ingreso',
        amount: 100.00,
        description: 'Apertura de caja',
        userId: admin.id
      });
      
      await CashMovement.create({
        cashRegisterId: cashRegister1.id,
        type: 'venta',
        amount: 50.00,
        description: 'Venta - Juan Pérez',
        paymentMethod: 'efectivo',
        reference: 'B001-00001',
        userId: admin.id,
        saleId: sales[0].id
      });
      
      await CashMovement.create({
        cashRegisterId: cashRegister1.id,
        type: 'venta',
        amount: 35.00,
        description: 'Venta - María López',
        paymentMethod: 'efectivo',
        reference: 'B001-00002',
        userId: admin.id,
        saleId: sales[1].id
      });
      
      await CashMovement.create({
        cashRegisterId: cashRegister1.id,
        type: 'egreso',
        amount: 25.00,
        description: 'Gasto - Almuerzo personal',
        paymentMethod: 'efectivo',
        userId: admin.id
      });
      
      await CashMovement.create({
        cashRegisterId: cashRegister1.id,
        type: 'egreso',
        amount: 10.00,
        description: 'Gasto - Transporte',
        paymentMethod: 'efectivo',
        userId: admin.id
      });
      
      await CashMovement.create({
        cashRegisterId: cashRegister1.id,
        type: 'egreso',
        amount: 850.00,
        description: 'Cierre de caja',
        userId: admin.id
      });
      
      cashRegisters.push(cashRegister1);
      
      // Caja 2: Caja abierta actual (para pruebas)
      const cashRegister2 = await CashRegister.create({
        userId: admin.id,
        openingDate: new Date(), // Hoy
        openingAmount: 200.00,
        status: 'abierta',
        notes: 'Caja de prueba - abierta'
      });
      
      // Movimientos de la caja abierta
      await CashMovement.create({
        cashRegisterId: cashRegister2.id,
        type: 'ingreso',
        amount: 200.00,
        description: 'Apertura de caja',
        userId: admin.id
      });
      
      await CashMovement.create({
        cashRegisterId: cashRegister2.id,
        type: 'venta',
        amount: 450.00,
        description: 'Venta - Empresa Distribuidora',
        paymentMethod: 'transferencia',
        reference: 'F001-00001',
        userId: admin.id,
        saleId: sales[2].id
      });
      
      await CashMovement.create({
        cashRegisterId: cashRegister2.id,
        type: 'venta',
        amount: 27.00,
        description: 'Venta - Pedro Ramírez',
        paymentMethod: 'efectivo',
        reference: 'B001-00003',
        userId: admin.id,
        saleId: sales[3].id
      });
      
      await CashMovement.create({
        cashRegisterId: cashRegister2.id,
        type: 'venta',
        amount: 100.00,
        description: 'Venta - Ana García',
        paymentMethod: 'yape',
        reference: 'B001-00004',
        userId: admin.id,
        saleId: sales[4].id
      });
      
      await CashMovement.create({
        cashRegisterId: cashRegister2.id,
        type: 'egreso',
        amount: 15.00,
        description: 'Gasto - Refrigerio',
        paymentMethod: 'efectivo',
        userId: admin.id
      });
      
      await CashMovement.create({
        cashRegisterId: cashRegister2.id,
        type: 'ingreso',
        amount: 50.00,
        description: 'Depósito - Venta adicional',
        paymentMethod: 'efectivo',
        userId: admin.id
      });
      
      cashRegisters.push(cashRegister2);
      
      console.log(`${cashRegisters.length} cajas creadas correctamente`);
    } else {
      cashRegisters = existingCashRegisters;
      console.log(`Se encontraron ${cashRegisters.length} cajas existentes`);
    }

    // Verificar si ya existen compras
    const existingPurchases = await Purchase.findAll();
    let purchases = [];
    
    if (existingPurchases.length === 0) {
      // Crear compras de prueba
      const purchase1 = await Purchase.create({
        date: new Date(2023, 5, 10), // 10 de junio de 2023
        supplierName: 'Distribuidora de Envases S.A.',
        supplierDocument: '20567891234',
        invoiceNumber: 'F001-5678',
        total: 500.00,
        status: 'completado',
        paymentMethod: 'efectivo',
        notes: 'Compra de envases',
        userId: admin.id
      });
      
      await PurchaseDetail.create({
        quantity: 100,
        unitCost: 5.00,
        subtotal: 500.00,
        purchaseId: purchase1.id,
        productId: products[0].id
      });
      
      purchases.push(purchase1);
      
      const purchase2 = await Purchase.create({
        date: new Date(2023, 6, 5), // 5 de julio de 2023
        supplierName: 'Insumos Industriales E.I.R.L.',
        supplierDocument: '20123456780',
        invoiceNumber: 'F001-1234',
        total: 300.00,
        status: 'completado',
        paymentMethod: 'transferencia',
        notes: 'Compra de insumos',
        userId: admin.id
      });
      
      await PurchaseDetail.create({
        quantity: 50,
        unitCost: 6.00,
        subtotal: 300.00,
        purchaseId: purchase2.id,
        productId: products[1].id
      });
      
      purchases.push(purchase2);
      console.log(`${purchases.length} compras creadas correctamente`);
    } else {
      purchases = existingPurchases;
      console.log(`Se encontraron ${purchases.length} compras existentes`);
    }

    // Verificar si ya existen registros de inventario
    const existingInventory = await Inventory.findAll();
    let inventoryRecords = [];
    
    if (existingInventory.length === 0) {
      // Crear registros de inventario para las compras
      for (const purchase of purchases) {
        const purchaseDetails = await PurchaseDetail.findAll({ where: { purchaseId: purchase.id } });
        
        for (const detail of purchaseDetails) {
          const product = await Product.findByPk(detail.productId);
          const previousStock = product.stock - detail.quantity; // Estimación del stock anterior
          
          const inventoryEntry = await Inventory.create({
            type: 'entrada',
            quantity: detail.quantity,
            previousStock: previousStock,
            currentStock: product.stock,
            unitCost: detail.unitCost,
            totalCost: detail.subtotal,
            reference: 'Compra',
            referenceId: purchase.id,
            notes: `Compra de ${detail.quantity} unidades de ${product.name}`,
            productId: product.id
          });
          
          inventoryRecords.push(inventoryEntry);
        }
      }
      
      // Crear registros de inventario para las ventas
      for (const sale of sales) {
        const saleDetails = await SaleDetail.findAll({ where: { saleId: sale.id } });
        
        for (const detail of saleDetails) {
          const product = await Product.findByPk(detail.productId);
          const previousStock = product.stock + detail.quantity; // Estimación del stock anterior
          
          const inventoryEntry = await Inventory.create({
            type: 'salida',
            quantity: detail.quantity,
            previousStock: previousStock,
            currentStock: product.stock,
            unitCost: detail.unitPrice,
            totalCost: detail.subtotal,
            reference: 'Venta',
            referenceId: sale.id,
            notes: `Venta de ${detail.quantity} unidades de ${product.name}`,
            productId: product.id
          });
          
          inventoryRecords.push(inventoryEntry);
        }
      }
      
      console.log(`${inventoryRecords.length} registros de inventario creados correctamente`);
    } else {
      inventoryRecords = existingInventory;
      console.log(`Se encontraron ${inventoryRecords.length} registros de inventario existentes`);
    }
    

    // Verificar si ya existen créditos
    const existingCredits = await Credit.findAll();
    let credits = [];
    
    if (existingCredits.length === 0) {
      // Crear créditos para las ventas con estado pendiente
      for (const sale of sales) {
        if (sale.status === 'pendiente') {
          const client = await Client.findByPk(sale.clientId);
          
          if (client && client.hasCredit) {
            // Crear un crédito para esta venta
            const dueDate = new Date(sale.date);
            dueDate.setDate(dueDate.getDate() + 30); // Vencimiento a 30 días
            
            const credit = await Credit.create({
              amount: sale.total,
              balance: sale.total,
              dueDate: dueDate,
              status: 'pendiente',
              notes: `Crédito por venta ${sale.invoiceNumber}`,
              clientId: client.id,
              saleId: sale.id,
              userId: sale.userId
            });
            
            credits.push(credit);
            
            // Para algunos créditos, crear pagos parciales
            if (Math.random() > 0.5) { // 50% de probabilidad de tener un pago parcial
              const partialAmount = sale.total * 0.3; // Pago del 30%
              
              await CreditPayment.create({
                amount: partialAmount,
                paymentMethod: 'efectivo',
                paymentDate: new Date(),
                notes: 'Pago parcial',
                creditId: credit.id,
                userId: sale.userId
              });
              
              // Actualizar el saldo del crédito
              credit.balance -= partialAmount;
              await credit.save();
            }
          }
        }
      }
      
      console.log(`${credits.length} créditos creados correctamente`);
    } else {
      credits = existingCredits;
      console.log(`Se encontraron ${credits.length} créditos existentes`);
    }
    
    // Verificar si ya existen facturas electrónicas
    const existingInvoices = await ElectronicInvoice.findAll();
    let electronicInvoices = [];
    
    if (existingInvoices.length === 0) {
      // Crear facturas electrónicas para las ventas con tipo 'factura'
      for (const sale of sales) {
        if (sale.invoiceType === 'factura') {
          const client = await Client.findByPk(sale.clientId);
          
          if (client) {
            const invoiceDate = new Date(sale.date);
            
            const electronicInvoice = await ElectronicInvoice.create({
              invoiceNumber: sale.invoiceNumber,
              invoiceDate: invoiceDate,
              status: 'aceptada',
              xmlContent: `<Invoice><InvoiceNumber>${sale.invoiceNumber}</InvoiceNumber><Amount>${sale.total}</Amount></Invoice>`,
              pdfUrl: `https://facturas.aguapura.com/${sale.invoiceNumber}.pdf`,
              responseCode: '0',
              responseMessage: 'Factura procesada correctamente',
              cufe: `CUFE${Math.floor(Math.random() * 1000000000)}`,
              qrCode: `https://facturas.aguapura.com/qr/${sale.invoiceNumber}`,
              totalAmount: sale.total,
              SaleId: sale.id
            });
            
            electronicInvoices.push(electronicInvoice);
          }
        }
      }
      
      console.log(`${electronicInvoices.length} facturas electrónicas creadas correctamente`);
    } else {
      electronicInvoices = existingInvoices;
      console.log(`Se encontraron ${electronicInvoices.length} facturas electrónicas existentes`);
    }
    
    // Verificar si ya existen pedidos
    const existingOrders = await Order.findAll();
    let orders = [];
    
    if (existingOrders.length === 0) {
      // Crear pedidos de prueba en diferentes estados
      
      // Pedido 1: Pendiente
      const order1 = await Order.create({
        orderDate: new Date(Date.now() - 3600000), // Hace 1 hora
        total: 27.00,
        status: 'pendiente',
        paymentStatus: 'pendiente',
        paymentMethod: 'efectivo',
        deliveryAddress: 'Av. Los Pinos 123',
        deliveryDistrict: 'San Isidro',
        contactPhone: '987654321',
        notes: 'Tocar el timbre 2 veces',
        deliveryFee: 5.00,
        clientId: clients[0].id,
        userId: admin.id
      });
      
      await OrderDetail.create({
        quantity: 2,
        unitPrice: 10.00,
        subtotal: 20.00,
        orderId: order1.id,
        productId: products[0].id
      });
      
      await OrderDetail.create({
        quantity: 1,
        unitPrice: 7.00,
        subtotal: 7.00,
        orderId: order1.id,
        productId: products[1].id
      });
      
      orders.push(order1);
      
      // Pedido 2: Confirmado
      const order2 = await Order.create({
        orderDate: new Date(Date.now() - 7200000), // Hace 2 horas
        total: 35.00,
        status: 'confirmado',
        paymentStatus: 'completado',
        paymentMethod: 'tarjeta',
        paymentReference: 'REF-123456',
        deliveryAddress: 'Jr. Las Flores 456',
        deliveryDistrict: 'Miraflores',
        contactPhone: '912345678',
        deliveryFee: 5.00,
        clientId: clients[1].id,
        userId: seller.id
      });
      
      await OrderDetail.create({
        quantity: 5,
        unitPrice: 7.00,
        subtotal: 35.00,
        orderId: order2.id,
        productId: products[1].id
      });
      
      orders.push(order2);
      
      // Pedido 3: En preparación
      const order3 = await Order.create({
        orderDate: new Date(Date.now() - 10800000), // Hace 3 horas
        total: 50.00,
        status: 'en_preparacion',
        paymentStatus: 'completado',
        paymentMethod: 'transferencia',
        paymentReference: 'TRF-789012',
        deliveryAddress: 'Av. Industrial 789',
        deliveryDistrict: 'Ate',
        contactPhone: '01234567',
        notes: 'Empresa, preguntar por recepción',
        deliveryFee: 0.00, // Sin costo de envío por ser mayorista
        clientId: clients[2].id,
        userId: admin.id
      });
      
      await OrderDetail.create({
        quantity: 5,
        unitPrice: 10.00,
        subtotal: 50.00,
        orderId: order3.id,
        productId: products[0].id
      });
      
      orders.push(order3);
      
      // Pedido 4: En camino
      const order4 = await Order.create({
        orderDate: new Date(Date.now() - 14400000), // Hace 4 horas
        deliveryDate: new Date(Date.now() + 1800000), // Entrega estimada en 30 minutos
        total: 27.00,
        status: 'en_camino',
        paymentStatus: 'completado',
        paymentMethod: 'efectivo',
        deliveryAddress: 'Calle Los Olivos 234',
        deliveryDistrict: 'San Borja',
        contactPhone: '945678123',
        deliveryFee: 5.00,
        clientId: clients[3].id,
        userId: seller.id,
        deliveryPersonId: deliveryPersons[0].userId
      });
      
      await OrderDetail.create({
        quantity: 2,
        unitPrice: 10.00,
        subtotal: 20.00,
        orderId: order4.id,
        productId: products[0].id
      });
      
      await OrderDetail.create({
        quantity: 1,
        unitPrice: 7.00,
        subtotal: 7.00,
        orderId: order4.id,
        productId: products[1].id
      });
      
      orders.push(order4);
      
      // Pedido 5: Entregado
      const order5 = await Order.create({
        orderDate: new Date(Date.now() - 86400000), // Hace 24 horas
        deliveryDate: new Date(Date.now() - 82800000), // Entregado hace 23 horas
        total: 100.00,
        status: 'entregado',
        paymentStatus: 'completado',
        paymentMethod: 'tarjeta',
        paymentReference: 'REF-345678',
        deliveryAddress: 'Av. La Marina 567',
        deliveryDistrict: 'San Miguel',
        contactPhone: '01765432',
        notes: 'Dejar en recepción',
        deliveryFee: 0.00, // Sin costo de envío por ser mayorista
        clientId: clients[4].id,
        userId: admin.id,
        deliveryPersonId: deliveryPersons[1].userId
      });
      
      await OrderDetail.create({
        quantity: 20,
        unitPrice: 5.00,
        subtotal: 100.00,
        orderId: order5.id,
        productId: products[1].id
      });
      
      orders.push(order5);
      
      // Pedido 6: Cancelado
      const order6 = await Order.create({
        orderDate: new Date(Date.now() - 172800000), // Hace 48 horas
        total: 20.00,
        status: 'cancelado',
        paymentStatus: 'reembolsado',
        paymentMethod: 'tarjeta',
        paymentReference: 'REF-901234',
        deliveryAddress: 'Jr. Las Palmeras 890',
        deliveryDistrict: 'Barranco',
        contactPhone: '923456789',
        notes: 'Cancelado por el cliente',
        deliveryFee: 5.00,
        clientId: clients[0].id,
        userId: seller.id
      });
      
      await OrderDetail.create({
        quantity: 2,
        unitPrice: 10.00,
        subtotal: 20.00,
        orderId: order6.id,
        productId: products[0].id
      });
      
      orders.push(order6);
      
      // Pedido 7: Pedido a crédito para cliente regular con hasCredit=true
      const creditOrder = await Order.create({
        orderDate: new Date(),
        total: 120.00,
        status: 'confirmado',
        paymentStatus: 'credito',
        paymentMethod: 'credito',
        isCredit: true,
        deliveryAddress: 'Av. Los Restaurantes 456',
        deliveryDistrict: 'Miraflores',
        contactPhone: '987123456',
        notes: 'Pedido a crédito para restaurante',
        deliveryFee: 0.00,
        clientId: clients[2].id, // Cliente con hasCredit=true
        userId: admin.id
      });
      
      await OrderDetail.create({
        quantity: 10,
        unitPrice: 12.00,
        subtotal: 120.00,
        orderId: creditOrder.id,
        productId: products[0].id
      });
      
      // Crear un crédito para este pedido
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30); // Vencimiento a 30 días
      
      const orderCredit = await Credit.create({
        amount: 120.00,
        balance: 120.00,
        dueDate: dueDate,
        status: 'pendiente',
        notes: `Crédito por pedido ${creditOrder.id}`,
        clientId: clients[2].id,
        orderId: creditOrder.id,
        userId: admin.id
      });
      
      credits.push(orderCredit);
      orders.push(creditOrder);
      
      // Pedido 8: Pedido a crédito con pago parcial
      const creditOrderPartial = await Order.create({
        orderDate: new Date(Date.now() - 864000000), // Hace 10 días
        total: 200.00,
        status: 'entregado',
        paymentStatus: 'credito',
        paymentMethod: 'credito',
        isCredit: true,
        deliveryAddress: 'Av. Los Hoteles 789',
        deliveryDistrict: 'San Isidro',
        contactPhone: '987654123',
        notes: 'Pedido a crédito con pago parcial',
        deliveryFee: 0.00,
        clientId: clients[4].id, // Otro cliente con hasCredit=true
        userId: seller.id
      });
      
      await OrderDetail.create({
        quantity: 20,
        unitPrice: 10.00,
        subtotal: 200.00,
        orderId: creditOrderPartial.id,
        productId: products[0].id
      });
      
      // Crear un crédito para este pedido
      const dueDatePartial = new Date(Date.now() - 864000000);
      dueDatePartial.setDate(dueDatePartial.getDate() + 30); // Vencimiento a 30 días
      
      const orderCreditPartial = await Credit.create({
        amount: 200.00,
        balance: 100.00, // Ya se pagó la mitad
        dueDate: dueDatePartial,
        status: 'pendiente',
        notes: `Crédito por pedido ${creditOrderPartial.id}`,
        clientId: clients[4].id,
        orderId: creditOrderPartial.id,
        userId: seller.id
      });
      
      // Crear un pago parcial para este crédito
      await CreditPayment.create({
        amount: 100.00,
        paymentMethod: 'efectivo',
        paymentDate: new Date(Date.now() - 432000000), // Hace 5 días
        notes: 'Pago parcial del crédito',
        creditId: orderCreditPartial.id,
        userId: seller.id
      });
      
      credits.push(orderCreditPartial);
      orders.push(creditOrderPartial);
      
      // Pedido 9: Pedido de invitado pendiente
      const guestOrder1 = await Order.create({
        orderDate: new Date(),
        total: 27.00,
        status: 'pendiente',
        paymentStatus: 'pendiente',
        deliveryAddress: 'Av. Los Girasoles 123',
        deliveryDistrict: 'La Molina',
        contactPhone: '987654321',
        deliveryFee: 5.00,
        notes: 'Pedido de invitado'
      });
      
      await OrderDetail.create({
        quantity: 2,
        unitPrice: 10.00,
        subtotal: 20.00,
        orderId: guestOrder1.id,
        productId: products[0].id
      });
      
      await OrderDetail.create({
        quantity: 1,
        unitPrice: 7.00,
        subtotal: 7.00,
        orderId: guestOrder1.id,
        productId: products[1].id
      });
      
      // Crear registro de GuestOrder
      await GuestOrder.create({
        guestName: 'Pedro Visitante',
        guestPhone: '987654321',
        guestEmail: 'pedro.visitante@example.com',
        orderId: guestOrder1.id
      });
      
      orders.push(guestOrder1);
      
      // Pedido 8: Pedido de invitado pagado
      const guestOrder2 = await Order.create({
        orderDate: new Date(Date.now() - 3600000), // Hace 1 hora
        total: 35.00,
        status: 'confirmado',
        paymentStatus: 'completado',
        paymentMethod: 'yape',
        deliveryAddress: 'Jr. Las Magnolias 456',
        deliveryDistrict: 'San Isidro',
        contactPhone: '912345678',
        deliveryFee: 5.00,
        documentType: 'boleta'
      });
      
      await OrderDetail.create({
        quantity: 5,
        unitPrice: 7.00,
        subtotal: 35.00,
        orderId: guestOrder2.id,
        productId: products[1].id
      });
      
      // Crear registro de GuestOrder
      await GuestOrder.create({
        guestName: 'María Visitante',
        guestPhone: '912345678',
        guestEmail: 'maria.visitante@example.com',
        orderId: guestOrder2.id
      });
      
      // Crear registro de pago
      await Payment.create({
        orderId: guestOrder2.id,
        amount: 35.00,
        paymentMethod: 'yape',
        paymentStatus: 'completado',
        paymentDate: new Date(),
        documentType: 'boleta'
      });
      
      orders.push(guestOrder2);
      
      console.log(`${orders.length} pedidos creados correctamente (incluyendo ${2} pedidos de invitados y ${2} pedidos a crédito)`);
    } else {
      orders = existingOrders;
      console.log(`Se encontraron ${orders.length} pedidos existentes`);
    }
    
    // Crear notificaciones para los pedidos
    try {
      // Limpiar notificaciones existentes
      await Notification.deleteMany({});
      
      // Crear notificaciones para cada pedido
      for (const order of orders) {
        const client = await Client.findByPk(order.clientId);
        
        // Notificación para el cliente (usar ID real del cliente)
        await Notification.create({
          userId: client.id.toString(),
          userModel: 'Client',
          title: 'Estado de tu pedido',
          message: `Tu pedido #${order.id} está ${order.status.replace('_', ' ')}.`,
          type: 'order_status_update',
          orderId: new mongoose.Types.ObjectId(),
          read: false
        });
        
        // Notificación para el administrador (usar ID real del admin)
        if (order.status === 'pendiente') {
          await Notification.create({
            userId: admin.id.toString(),
            userModel: 'User',
            title: 'Nuevo pedido recibido',
            message: `Se ha recibido un nuevo pedido #${order.id} de ${client.name}.`,
            type: 'new_order',
            orderId: new mongoose.Types.ObjectId(),
            read: false
          });
        }
        
        // Notificación para el repartidor (usar ID real del repartidor)
        if (order.status === 'en_camino' && order.deliveryPersonId) {
          await Notification.create({
            userId: order.deliveryPersonId.toString(),
            userModel: 'DeliveryPerson',
            title: 'Pedido asignado',
            message: `Se te ha asignado el pedido #${order.id} para entrega en ${order.deliveryDistrict}.`,
            type: 'delivery_assigned',
            orderId: new mongoose.Types.ObjectId(),
            read: false
          });
        }
      }
      
      console.log('Notificaciones creadas correctamente');
    } catch (error) {
      console.error('Error al crear notificaciones:', error);
    }
    
    console.log('==============================================');
    console.log('RESUMEN DE DATOS DE PRUEBA CARGADOS:');
    console.log(`- ${clients.length} clientes`);
    console.log(`- ${products.length} productos`);
    console.log(`- ${sales.length} ventas con sus detalles`);
    console.log(`- ${purchases.length} compras con sus detalles`);
    console.log(`- ${inventoryRecords.length} registros de inventario`);
    console.log(`- ${credits.length} créditos`);
    console.log(`- ${electronicInvoices.length} facturas electrónicas`);
    console.log(`- ${cashRegisters.length} registros de caja`);
    console.log(`- ${deliveryPersons.length} repartidores`);
    console.log(`- ${orders.length} pedidos con seguimiento en tiempo real`);
    console.log(`- Notificaciones para clientes, administradores y repartidores`);
    console.log(`- Usuarios: admin, vendedor y ${deliveryPersons.length} repartidores`);
    console.log('==============================================');
    console.log('Datos de prueba cargados con éxito');
  } catch (error) {
    console.error('Error al cargar datos de prueba:', error);
  } finally {
    process.exit(0);
  }
}

seedDatabase();