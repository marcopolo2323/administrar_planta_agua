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

    // Obtener o crear productos
    let products = await Product.findAll();
    if (products.length === 0) {
      products = await Product.bulkCreate([
        {
          name: 'Paquete de Botellas 650ml',
          description: 'Paquete de 20 unidades de botellas de agua de 650ml',
          type: 'botella',
          unitPrice: 10.00,
          wholesalePrice: 9.00,
          wholesaleMinQuantity: 50,
          stock: 100
        },
        {
          name: 'Bidón 20L',
          description: 'Bidón de agua de 20 litros',
          type: 'bidon',
          unitPrice: 7.00,
          wholesalePrice: 5.00,
          wholesaleMinQuantity: 2,
          stock: 50
        }
      ]);
      console.log('Productos creados correctamente');
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
        status: 'pagado',
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
        status: 'pagado',
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
        status: 'pagado',
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
        status: 'pagado',
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
    
    // Verificar si ya existen registros de caja
    const existingCashRegisters = await CashRegister.findAll();
    let cashRegisters = [];
    
    if (existingCashRegisters.length === 0) {
      // Crear registros de caja de prueba
      const cashRegister1 = await CashRegister.create({
        openingDate: new Date(2023, 6, 1, 8, 0), // 1 de julio 2023, 8:00 AM
        closingDate: new Date(2023, 6, 1, 18, 0), // 1 de julio 2023, 6:00 PM
        openingAmount: 200.00,
        expectedAmount: 650.00,
        actualAmount: 650.00,
        difference: 0.00,
        status: 'cerrado',
        openedBy: admin.id,
        closedBy: admin.id
      });
      
      cashRegisters.push(cashRegister1);
      
      // Crear movimientos para este registro de caja
      await CashMovement.create({
        type: 'ingreso',
        amount: 100.00,
        concept: 'Venta en efectivo',
        reference: 'Venta',
        referenceId: sales[0].id,
        cashRegisterId: cashRegister1.id,
        userId: admin.id
      });
      
      await CashMovement.create({
        type: 'egreso',
        amount: 50.00,
        concept: 'Compra de útiles',
        notes: 'Compra de útiles de oficina',
        cashRegisterId: cashRegister1.id,
        userId: admin.id
      });
      
      // Crear un registro de caja abierto
      const cashRegister2 = await CashRegister.create({
        openingDate: new Date(), // Fecha actual
        openingAmount: 300.00,
        status: 'abierto',
        openedBy: admin.id
      });
      
      cashRegisters.push(cashRegister2);
      
      await CashMovement.create({
        type: 'ingreso',
        amount: 150.00,
        concept: 'Venta en efectivo',
        reference: 'Venta',
        referenceId: sales[1].id,
        cashRegisterId: cashRegister2.id,
        userId: seller.id
      });
      
      console.log(`${cashRegisters.length} registros de caja creados correctamente`);
    } else {
      cashRegisters = existingCashRegisters;
      console.log(`Se encontraron ${cashRegisters.length} registros de caja existentes`);
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
    console.log(`- 2 usuarios (admin y vendedor)`);
    console.log('==============================================');
    console.log('Datos de prueba cargados con éxito');
  } catch (error) {
    console.error('Error al cargar datos de prueba:', error);
  } finally {
    process.exit(0);
  }
}

seedDatabase();