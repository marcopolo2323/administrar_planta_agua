const { sequelize } = require('../models');
const Client = require('../models/client.model');
const User = require('../models/user.model');
const mongoose = require('mongoose');

// Conectar a MongoDB para las notificaciones
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/punto_de_venta', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Conexión a MongoDB establecida para notificaciones');
}).catch(err => {
  console.error('Error al conectar a MongoDB:', err);
});

async function seedClients() {
  try {
    console.log('Iniciando la carga de clientes regulares registrados...');

    // Verificar si ya existen clientes
    const existingClients = await Client.findAll();
    
    if (existingClients.length > 0) {
      console.log(`Se encontraron ${existingClients.length} clientes existentes`);
      
      // Verificar si ya existen los clientes regulares que queremos agregar
      const regularClientDNIs = ['45678901', '56789012', '67890123', '78901234', '89012345'];
      const existingRegularClients = await Client.findAll({
        where: {
          documentNumber: regularClientDNIs
        }
      });
      
      if (existingRegularClients.length === regularClientDNIs.length) {
        console.log('Los clientes regulares ya existen en la base de datos');
        return;
      }
    }

    // Obtener usuario vendedor para asociar los clientes
    let seller = await User.findOne({ where: { username: 'vendedor' } });
    if (!seller) {
      seller = await User.create({
        username: 'vendedor',
        email: 'vendedor@aguapura.com',
        password: 'vendedor123',
        role: 'vendedor'
      });
      console.log('Usuario vendedor creado correctamente');
    }

    // Crear clientes regulares registrados
    const regularClients = [
      {
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
        userId: seller.id,
        defaultDeliveryAddress: 'Av. Los Pinos 456, San Isidro',
        defaultContactPhone: '987654322',
        notes: 'Cliente regular que compra bidones semanalmente'
      },
      {
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
        userId: seller.id,
        defaultDeliveryAddress: 'Jr. Las Flores 789, Miraflores',
        defaultContactPhone: '912345679',
        notes: 'Prefiere entrega los fines de semana'
      },
      {
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
        userId: seller.id,
        defaultDeliveryAddress: 'Av. La Marina 567, San Miguel',
        defaultContactPhone: '01765433',
        notes: 'Restaurante que compra agua embotellada en grandes cantidades'
      },
      {
        name: 'Ana Martínez',
        documentType: 'DNI',
        documentNumber: '67890123',
        address: 'Calle Los Olivos 234',
        district: 'San Borja',
        phone: '945678124',
        email: 'ana.martinez@example.com',
        isCompany: false,
        hasCredit: false,
        active: true,
        userId: seller.id,
        defaultDeliveryAddress: 'Calle Los Olivos 234, San Borja',
        defaultContactPhone: '945678124',
        notes: 'Compra bidones mensualmente'
      },
      {
        name: 'Hotel Agua Fresca S.A.C.',
        documentType: 'RUC',
        documentNumber: '20123456790',
        address: 'Av. Industrial 890',
        district: 'Ate',
        phone: '01234568',
        email: 'compras@hotelaguafresca.com',
        isCompany: true,
        hasCredit: true,
        creditLimit: 3000.00,
        currentDebt: 0.00,
        paymentDueDay: 15,
        active: true,
        userId: seller.id,
        defaultDeliveryAddress: 'Av. Industrial 890, Ate',
        defaultContactPhone: '01234568',
        notes: 'Hotel que requiere entregas diarias de agua embotellada'
      }
    ];

    // Crear los clientes en la base de datos
    const createdClients = await Client.bulkCreate(regularClients);
    console.log(`${createdClients.length} clientes regulares creados correctamente`);

    console.log('Carga de clientes regulares completada con éxito');
  } catch (error) {
    console.error('Error al cargar clientes regulares:', error);
  } finally {
    // Cerrar la conexión a la base de datos
    await sequelize.close();
    process.exit(0);
  }
}

// Ejecutar la función de carga de clientes
seedClients();