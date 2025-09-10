const { Client, User } = require('../models');
const fs = require('fs');
const path = require('path');

// Función para generar mensaje de WhatsApp
const createWhatsAppMessage = (client, credentials) => {
  return `💧 *AQUAYARA - Sus Credenciales de Acceso*

¡Hola ${client.name}! 👋

Nos complace informarle que su cuenta de cliente frecuente ha sido creada exitosamente en nuestro sistema AquaYara.

🔑 *Sus Credenciales:*
• Usuario: ${credentials.username}
• Contraseña: ${credentials.password}
• Email: ${credentials.email}

🚀 *¿Cómo acceder?*
1. Visite: www.aquayara.com
2. Haga clic en "Iniciar Sesión"
3. Seleccione "Cliente Frecuente"
4. Ingrese sus credenciales

🎁 *Beneficios de ser Cliente Frecuente:*
✅ Precios especiales
✅ Pedidos rápidos
✅ Seguimiento en tiempo real
✅ Historial de compras
✅ Promociones exclusivas

⚠️ *Importante:* Por seguridad, cambie su contraseña en el primer login.

📞 *¿Necesita ayuda?*
Teléfono: +51 961 606 183
Email: contacto@aquayara.com
Horario: Lunes a Sábado 8:00 AM - 6:00 PM

¡Gracias por elegir AquaYara! 💧

---
*Este es un mensaje automático de AquaYara*`;
};

// Función para generar reporte de credenciales para WhatsApp
const generateWhatsAppReport = async () => {
  try {
    console.log('📱 Generando reporte de credenciales para WhatsApp...');
    
    const clients = await Client.findAll({
      where: { active: true }
    });

    const report = [];
    
    for (const client of clients) {
      const user = await User.findByPk(client.userId);
      const message = createWhatsAppMessage(client, {
        username: user?.username || 'N/A',
        password: 'CONTRASEÑA_TEMPORAL',
        email: user?.email || 'N/A'
      });

      report.push({
        telefono: client.phone,
        nombre: client.name,
        documento: client.documentNumber,
        mensaje: message
      });
    }

    // Guardar reporte en archivo
    const reportPath = path.join(__dirname, '../../data/credenciales_whatsapp.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`✅ Reporte guardado en: ${reportPath}`);
    console.log(`📊 Total de clientes en el reporte: ${report.length}`);

    return report;

  } catch (error) {
    console.error('❌ Error generando reporte:', error);
    throw error;
  }
};

// Función para generar archivo CSV para importar en WhatsApp Business
const generateWhatsAppCSV = async () => {
  try {
    console.log('📊 Generando archivo CSV para WhatsApp Business...');
    
    const clients = await Client.findAll({
      where: { active: true }
    });

    let csvContent = 'Telefono,Nombre,Mensaje\n';
    
    for (const client of clients) {
      const user = await User.findByPk(client.userId);
      const message = createWhatsAppMessage(client, {
        username: user?.username || 'N/A',
        password: 'CONTRASEÑA_TEMPORAL',
        email: user?.email || 'N/A'
      });

      // Escapar comillas y saltos de línea para CSV
      const escapedMessage = message.replace(/"/g, '""').replace(/\n/g, '\\n');
      const phone = client.phone ? client.phone.replace(/\D/g, '') : '';
      
      if (phone) {
        csvContent += `"${phone}","${client.name}","${escapedMessage}"\n`;
      }
    }

    // Guardar archivo CSV
    const csvPath = path.join(__dirname, '../../data/credenciales_whatsapp.csv');
    fs.writeFileSync(csvPath, csvContent);
    
    console.log(`✅ Archivo CSV guardado en: ${csvPath}`);
    console.log(`📊 Total de clientes en el CSV: ${clients.length}`);

    return csvPath;

  } catch (error) {
    console.error('❌ Error generando CSV:', error);
    throw error;
  }
};

// Ejecutar si se llama directamente
if (require.main === module) {
  const action = process.argv[2];
  
  if (action === 'report') {
    generateWhatsAppReport()
      .then(() => {
        console.log('\n🎊 ¡Reporte de WhatsApp generado!');
        process.exit(0);
      })
      .catch((error) => {
        console.error('\n💥 Error generando reporte:', error);
        process.exit(1);
      });
  } else if (action === 'csv') {
    generateWhatsAppCSV()
      .then(() => {
        console.log('\n🎊 ¡Archivo CSV generado!');
        process.exit(0);
      })
      .catch((error) => {
        console.error('\n💥 Error generando CSV:', error);
        process.exit(1);
      });
  } else {
    console.log('❌ Uso: node sendCredentialsWhatsApp.js [report|csv]');
    console.log('📝 Ejemplos:');
    console.log('   node sendCredentialsWhatsApp.js report   # Generar reporte JSON');
    console.log('   node sendCredentialsWhatsApp.js csv      # Generar archivo CSV');
    process.exit(1);
  }
}

module.exports = {
  createWhatsAppMessage,
  generateWhatsAppReport,
  generateWhatsAppCSV
};
