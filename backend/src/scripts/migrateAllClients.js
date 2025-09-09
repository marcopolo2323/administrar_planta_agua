const { Client, User, sequelize } = require('../models');
const bcrypt = require('bcryptjs');

async function migrateAllClients() {
  try {
    console.log('🔄 Iniciando migración de todos los clientes...');

    // INSTRUCCIONES:
    // 1. Copia y pega todos tus datos aquí en el array 'allClients'
    // 2. Asegúrate de que cada cliente tenga el formato correcto
    // 3. Ejecuta: node src/scripts/migrateAllClients.js

    const allClients = [
      // FORMATO PARA CADA CLIENTE:
      // {
      //   name: 'Nombre completo o razón social',
      //   documentType: 'DNI' o 'RUC',
      //   documentNumber: 'número de documento',
      //   address: 'dirección completa',
      //   district: 'distrito',
      //   phone: 'número de celular',
      //   email: 'correo electrónico',
      //   isCompany: true/false, // true si es RUC, false si es DNI
      //   hasCredit: true, // todos los clientes frecuentes tienen crédito
      //   creditLimit: 100, // límite de crédito
      //   active: true,
      //   clientStatus: 'activo', // 'activo', 'nuevo', 'inactivo', 'retomando'
      //   recommendations: 'recomendación del cliente',
      //   notes: 'nota personal',
      //   paymentDueDay: 30
      // },

      // EJEMPLO CON TU DATO:
      {
        name: 'Corporación YASHIMITSU sac',
        documentType: 'RUC',
        documentNumber: '20606719596',
        address: 'Jr 2 de mayo 1150',
        district: 'YARINACOCHA',
        phone: '942658541',
        email: 'yashichirusbel@gmail.com',
        isCompany: true,
        hasCredit: true,
        creditLimit: 200,
        active: true,
        clientStatus: 'activo',
        recommendations: 'MEJORAR EL SERVICIO DE DELIVERY MUY TARDE',
        notes: 'Coordinen mejor el horario de entrega',
        paymentDueDay: 30
      }

      // AQUÍ AGREGA TODOS TUS 70+ CLIENTES SIGUIENDO EL MISMO FORMATO
      // Copia y pega cada cliente del Excel aquí...
    ];

    console.log(`📊 Procesando ${allClients.length} clientes...`);

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    for (let i = 0; i < allClients.length; i++) {
      const clientData = allClients[i];
      
      try {
        // Validar datos requeridos
        if (!clientData.name || !clientData.documentNumber) {
          console.log(`⚠️  Cliente ${i + 1}: Faltan datos requeridos (nombre o documento)`);
          errorCount++;
          errors.push(`Cliente ${i + 1}: Faltan datos requeridos`);
          continue;
        }

        // Verificar si el cliente ya existe
        const existingClient = await Client.findOne({
          where: { documentNumber: clientData.documentNumber }
        });

        if (existingClient) {
          console.log(`⚠️  Cliente ya existe: ${clientData.name} (${clientData.documentNumber})`);
          errorCount++;
          errors.push(`Cliente ya existe: ${clientData.name}`);
          continue;
        }

        // Crear el cliente
        const client = await Client.create(clientData);
        
        // Crear cuenta de usuario para el cliente
        try {
          const username = generateUsername(client.name);
          const tempPassword = generateTempPassword(client.documentNumber);
          const hashedPassword = await bcrypt.hash(tempPassword, 10);

          const user = await User.create({
            username: username,
            email: client.email || `${username}@aquayara.com`,
            password: hashedPassword,
            role: 'cliente',
            active: true
          });

          // Vincular usuario con cliente
          await client.update({
            userId: user.id
          });

          console.log(`✅ Cliente creado: ${client.name} (${client.documentNumber})`);
          console.log(`   Usuario: ${username} | Contraseña: ${tempPassword}`);
          successCount++;
        } catch (userError) {
          console.log(`⚠️  Cliente creado pero sin cuenta de usuario: ${client.name}`);
          console.log(`   Error de usuario: ${userError.message}`);
          successCount++; // Contamos como éxito porque el cliente se creó
        }

      } catch (error) {
        console.log(`❌ Error en cliente ${i + 1}: ${error.message}`);
        errorCount++;
        errors.push(`Cliente ${i + 1}: ${error.message}`);
      }
    }

    console.log('\n📊 RESUMEN DE MIGRACIÓN:');
    console.log(`✅ Clientes creados exitosamente: ${successCount}`);
    console.log(`❌ Errores: ${errorCount}`);
    
    if (errors.length > 0) {
      console.log('\n🔍 ERRORES DETALLADOS:');
      errors.forEach(error => console.log(`  - ${error}`));
    }

    console.log('\n🎉 Migración completada!');
    console.log('\n💡 INSTRUCCIONES PARA MIGRAR TUS 70+ CLIENTES:');
    console.log('1. Abre el archivo: src/scripts/migrateAllClients.js');
    console.log('2. Copia y pega todos tus datos del Excel en el array "allClients"');
    console.log('3. Asegúrate de seguir el formato correcto para cada cliente');
    console.log('4. Ejecuta: node src/scripts/migrateAllClients.js');

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
  } finally {
    await sequelize.close();
  }
}

function generateUsername(name) {
  // Limpiar el nombre y crear username
  let username = name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remover caracteres especiales
    .replace(/\s+/g, '') // Remover espacios
    .substring(0, 15); // Limitar longitud
  
  // Si es muy corto, agregar números
  if (username.length < 5) {
    username += Math.floor(Math.random() * 1000);
  }
  
  return username;
}

function generateTempPassword(documentNumber) {
  // Usar los últimos 4 dígitos del documento + "AQ" + año actual
  const lastDigits = documentNumber.slice(-4);
  const currentYear = new Date().getFullYear().toString().slice(-2);
  return `AQ${lastDigits}${currentYear}`;
}

// Ejecutar la migración
migrateAllClients();
