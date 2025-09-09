const { Client, User, sequelize } = require('../models');

async function generateClientCredentials() {
  try {
    console.log('🔄 Generando reporte de credenciales de clientes...');

    // Obtener todos los clientes con sus usuarios
    const clients = await Client.findAll({
      include: [{
        model: User,
        as: 'User',
        where: { role: 'cliente' },
        required: true
      }],
      where: { active: true }
    });

    console.log(`📊 Encontrados ${clients.length} clientes con cuentas de usuario\n`);

    // Crear archivo de credenciales
    const fs = require('fs');
    const path = require('path');
    
    let credentialsContent = 'CREDENCIALES DE ACCESO - CLIENTES FRECUENTES AQUAYARA\n';
    credentialsContent += '='.repeat(60) + '\n\n';
    credentialsContent += `Fecha de generación: ${new Date().toLocaleString('es-PE')}\n`;
    credentialsContent += `Total de clientes: ${clients.length}\n\n`;

    clients.forEach((client, index) => {
      credentialsContent += `${index + 1}. ${client.name}\n`;
      credentialsContent += `   Documento: ${client.documentType} ${client.documentNumber}\n`;
      credentialsContent += `   Usuario: ${client.User.username}\n`;
      credentialsContent += `   Email: ${client.User.email}\n`;
      credentialsContent += `   Teléfono: ${client.phone || 'No registrado'}\n`;
      credentialsContent += `   Estado: ${client.clientStatus}\n`;
      credentialsContent += `   Dirección: ${client.address || 'No registrada'}\n`;
      credentialsContent += `   Distrito: ${client.district || 'No registrado'}\n`;
      if (client.recommendations) {
        credentialsContent += `   Recomendación: ${client.recommendations}\n`;
      }
      credentialsContent += '\n';
    });

    // Guardar archivo
    const filePath = path.join(__dirname, '../../data/credenciales_clientes.txt');
    fs.writeFileSync(filePath, credentialsContent, 'utf8');

    console.log('✅ Reporte de credenciales generado exitosamente!');
    console.log(`📁 Archivo guardado en: ${filePath}`);
    console.log('\n📋 INFORMACIÓN IMPORTANTE:');
    console.log('- Las contraseñas son temporales y deben cambiarse en el primer login');
    console.log('- Los clientes pueden acceder desde: /client-login');
    console.log('- Envía las credenciales a cada cliente por WhatsApp o email');
    console.log('- El formato de contraseña es: AQ + últimos 4 dígitos del DNI + año actual');

    // Mostrar algunas credenciales en consola
    console.log('\n🔑 MUESTRA DE CREDENCIALES:');
    clients.slice(0, 3).forEach((client, index) => {
      console.log(`${index + 1}. ${client.name}`);
      console.log(`   Usuario: ${client.User.username}`);
      console.log(`   Email: ${client.User.email}`);
      console.log('');
    });

    if (clients.length > 3) {
      console.log(`... y ${clients.length - 3} clientes más (ver archivo completo)`);
    }

  } catch (error) {
    console.error('❌ Error generando credenciales:', error);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar la generación de credenciales
generateClientCredentials();
