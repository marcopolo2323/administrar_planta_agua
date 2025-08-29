const { sequelize } = require('../models');
const User = require('../models/user.model');
const Product = require('../models/product.model');
const Client = require('../models/client.model');
const Sale = require('../models/sale.model');
const SaleDetail = require('../models/saleDetail.model');

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
    console.log('==============================================');
    console.log('RESUMEN DE DATOS DE PRUEBA CARGADOS:');
    console.log(`- ${clients.length} clientes`);
    console.log(`- ${products.length} productos`);
    console.log(`- ${sales.length} ventas con sus detalles`);
    console.log(`- 2 usuarios (admin y vendedor)`);
    console.log('==============================================');
    console.log('Datos de prueba cargados con éxito');
  } catch (error) {
    console.error('Error al cargar datos de prueba:', error);
  } finally {
    process.exit();
  }
}

seedDatabase();