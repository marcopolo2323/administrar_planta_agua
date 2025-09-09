const { Client, User, sequelize } = require('../models');
const bcrypt = require('bcryptjs');

async function createClientAccounts() {
  try {
    console.log('🔄 Creando cuentas de usuario para clientes frecuentes...');

    // Obtener todos los clientes que no tienen cuenta de usuario
    const clients = await Client.findAll({
      where: {
        active: true,
        userId: null // Clientes sin cuenta de usuario
      }
    });

    console.log(`📊 Encontrados ${clients.length} clientes sin cuenta de usuario`);

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    for (const client of clients) {
      try {
        // Generar username basado en el nombre
        const username = generateUsername(client.name);
        
        // Generar password temporal (los clientes pueden cambiarla después)
        const tempPassword = generateTempPassword(client.documentNumber);
        
        // Hash de la contraseña
        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        // Crear usuario
          const user = await User.create({
            username: username,
            email: client.email || `${username}@aquayara.com`,
            password: hashedPassword,
            role: 'cliente',
            active: true
          });

        // Actualizar cliente con el ID del usuario
        await client.update({
          userId: user.id
        });

        console.log(`✅ Cuenta creada para: ${client.name}`);
        console.log(`   Usuario: ${username}`);
        console.log(`   Contraseña temporal: ${tempPassword}`);
        console.log(`   Email: ${user.email}`);
        console.log('');

        successCount++;

      } catch (error) {
        console.log(`❌ Error creando cuenta para ${client.name}: ${error.message}`);
        errorCount++;
        errors.push(`${client.name}: ${error.message}`);
      }
    }

    console.log('\n📊 RESUMEN DE CREACIÓN DE CUENTAS:');
    console.log(`✅ Cuentas creadas exitosamente: ${successCount}`);
    console.log(`❌ Errores: ${errorCount}`);
    
    if (errors.length > 0) {
      console.log('\n🔍 ERRORES DETALLADOS:');
      errors.forEach(error => console.log(`  - ${error}`));
    }

    console.log('\n🎉 Proceso completado!');
    console.log('\n📋 INFORMACIÓN IMPORTANTE:');
    console.log('- Cada cliente recibirá sus credenciales de acceso');
    console.log('- Las contraseñas son temporales y deben cambiarse en el primer login');
    console.log('- Los clientes pueden acceder desde: /client-login');
    console.log('- El sistema enviará las credenciales por email (si tienen email)');

  } catch (error) {
    console.error('❌ Error durante la creación de cuentas:', error);
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

// Ejecutar la creación de cuentas
createClientAccounts();
