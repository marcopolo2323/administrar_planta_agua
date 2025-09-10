const nodemailer = require('nodemailer');
const { Client, User } = require('../models');
const fs = require('fs');
const path = require('path');

// Configuración del transporter de email
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail', // Puedes cambiar por otro proveedor
    auth: {
      user: process.env.EMAIL_USER || 'aquayara.contacto@gmail.com',
      pass: process.env.EMAIL_PASS || 'tu_contraseña_de_aplicacion'
    }
  });
};

// Plantilla HTML para el email
const createEmailTemplate = (client, credentials) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bienvenido a AquaYara - Sus Credenciales</title>
        <style>
            body {
                font-family: 'Arial', sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f4f4f4;
            }
            .container {
                background-color: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 0 20px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                background: linear-gradient(135deg, #1E40AF, #3B82F6);
                color: white;
                padding: 20px;
                border-radius: 10px;
                margin-bottom: 30px;
            }
            .logo {
                font-size: 28px;
                font-weight: bold;
                margin-bottom: 10px;
            }
            .subtitle {
                font-size: 16px;
                opacity: 0.9;
            }
            .credentials-box {
                background-color: #F8FAFC;
                border: 2px solid #E2E8F0;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
            }
            .credential-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px 0;
                border-bottom: 1px solid #E2E8F0;
            }
            .credential-item:last-child {
                border-bottom: none;
            }
            .credential-label {
                font-weight: bold;
                color: #1E40AF;
            }
            .credential-value {
                font-family: 'Courier New', monospace;
                background-color: #E2E8F0;
                padding: 5px 10px;
                border-radius: 4px;
                font-size: 14px;
            }
            .warning {
                background-color: #FEF3C7;
                border: 1px solid #F59E0B;
                border-radius: 6px;
                padding: 15px;
                margin: 20px 0;
                color: #92400E;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #E2E8F0;
                color: #6B7280;
                font-size: 14px;
            }
            .contact-info {
                background-color: #F0F9FF;
                border-radius: 6px;
                padding: 15px;
                margin: 20px 0;
            }
            .btn {
                display: inline-block;
                background-color: #1E40AF;
                color: white;
                padding: 12px 24px;
                text-decoration: none;
                border-radius: 6px;
                font-weight: bold;
                margin: 10px 0;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">💧 AQUAYARA</div>
                <div class="subtitle">Agua Purificada de Calidad</div>
            </div>
            
            <h2>¡Bienvenido ${client.name}!</h2>
            
            <p>Nos complace informarle que su cuenta de cliente frecuente ha sido creada exitosamente en nuestro sistema AquaYara.</p>
            
            <div class="credentials-box">
                <h3 style="margin-top: 0; color: #1E40AF;">🔑 Sus Credenciales de Acceso</h3>
                <div class="credential-item">
                    <span class="credential-label">Usuario:</span>
                    <span class="credential-value">${credentials.username}</span>
                </div>
                <div class="credential-item">
                    <span class="credential-label">Contraseña:</span>
                    <span class="credential-value">${credentials.password}</span>
                </div>
                <div class="credential-item">
                    <span class="credential-label">Email:</span>
                    <span class="credential-value">${credentials.email}</span>
                </div>
            </div>
            
            <div class="warning">
                <strong>⚠️ Importante:</strong> Por seguridad, le recomendamos cambiar su contraseña en el primer inicio de sesión.
            </div>
            
            <h3>🚀 ¿Cómo acceder a su cuenta?</h3>
            <ol>
                <li>Visite nuestro sitio web: <strong>www.aquayara.com</strong></li>
                <li>Haga clic en "Iniciar Sesión"</li>
                <li>Seleccione "Cliente Frecuente"</li>
                <li>Ingrese sus credenciales</li>
                <li>¡Disfrute de nuestros servicios!</li>
            </ol>
            
            <h3>🎁 Beneficios de ser Cliente Frecuente</h3>
            <ul>
                <li>✅ Precios especiales en todos nuestros productos</li>
                <li>✅ Pedidos rápidos desde su cuenta</li>
                <li>✅ Seguimiento en tiempo real de sus entregas</li>
                <li>✅ Historial completo de sus compras</li>
                <li>✅ Acceso a promociones exclusivas</li>
            </ul>
            
            <div class="contact-info">
                <h4>📞 ¿Necesita ayuda?</h4>
                <p><strong>Teléfono:</strong> +51 961 606 183</p>
                <p><strong>Email:</strong> contacto@aquayara.com</p>
                <p><strong>Horario de atención:</strong> Lunes a Sábado de 8:00 AM a 6:00 PM</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="https://www.aquayara.com/client-login" class="btn">Iniciar Sesión Ahora</a>
            </div>
            
            <div class="footer">
                <p>© 2024 AquaYara - Agua Purificada de Calidad</p>
                <p>Este es un email automático, por favor no responda a este mensaje.</p>
            </div>
        </div>
    </body>
    </html>
  `;
};

// Función para enviar credenciales por email
const sendCredentialsEmail = async (clientId, credentials) => {
  try {
    const client = await Client.findByPk(clientId);
    const user = client ? await User.findByPk(client.userId) : null;

    if (!client) {
      throw new Error('Cliente no encontrado');
    }

    const transporter = createTransporter();
    
    const mailOptions = {
      from: '"AquaYara" <aquayara.contacto@gmail.com>',
      to: client.email,
      subject: '🔑 Sus Credenciales de Acceso - AquaYara',
      html: createEmailTemplate(client, credentials)
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Email enviado a ${client.name} (${client.email})`);
    return result;

  } catch (error) {
    console.error(`❌ Error enviando email a cliente ${clientId}:`, error.message);
    throw error;
  }
};

// Función para enviar credenciales a todos los clientes
const sendCredentialsToAllClients = async () => {
  try {
    console.log('📧 Iniciando envío de credenciales por email...');
    
    const clients = await Client.findAll({
      where: { active: true }
    });

    console.log(`📊 Encontrados ${clients.length} clientes activos`);

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    for (const client of clients) {
      try {
        const user = await User.findByPk(client.userId);
        
        if (!user) {
          console.log(`⚠️ Cliente ${client.name} no tiene usuario asociado, saltando...`);
          continue;
        }

        const credentials = {
          username: user.username,
          password: 'CONTRASEÑA_TEMPORAL', // Necesitarías generar una nueva o usar la existente
          email: user.email
        };

        await sendCredentialsEmail(client.id, credentials);
        successCount++;

      } catch (error) {
        console.error(`❌ Error con cliente ${client.name}:`, error.message);
        errors.push(`${client.name}: ${error.message}`);
        errorCount++;
      }
    }

    console.log('\n📧 ¡Envío de emails completado!');
    console.log(`✅ Emails enviados exitosamente: ${successCount}`);
    console.log(`❌ Errores encontrados: ${errorCount}`);

    if (errors.length > 0) {
      console.log('\n📋 Errores detallados:');
      errors.forEach(error => console.log(`   - ${error}`));
    }

  } catch (error) {
    console.error('❌ Error durante el envío masivo:', error);
    throw error;
  }
};

// Función para generar reporte de credenciales
const generateCredentialsReport = async () => {
  try {
    console.log('📋 Generando reporte de credenciales...');
    
    const clients = await Client.findAll({
      where: { active: true }
    });

    const report = [];
    
    for (const client of clients) {
      const user = await User.findByPk(client.userId);
      report.push({
        nombre: client.name,
        documento: client.documentNumber,
        tipo: client.documentType,
        email: user?.email || 'N/A',
        usuario: user?.username || 'N/A',
        telefono: client.phone || 'N/A',
        estado: client.clientStatus
      });
    }

    // Guardar reporte en archivo
    const reportPath = path.join(__dirname, '../../data/credenciales_clientes.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`✅ Reporte guardado en: ${reportPath}`);
    console.log(`📊 Total de clientes en el reporte: ${report.length}`);

    return report;

  } catch (error) {
    console.error('❌ Error generando reporte:', error);
    throw error;
  }
};

// Ejecutar si se llama directamente
if (require.main === module) {
  const action = process.argv[2];
  
  if (action === 'email') {
    sendCredentialsToAllClients()
      .then(() => {
        console.log('\n🎊 ¡Envío de emails completado!');
        process.exit(0);
      })
      .catch((error) => {
        console.error('\n💥 Error en el envío:', error);
        process.exit(1);
      });
  } else if (action === 'report') {
    generateCredentialsReport()
      .then(() => {
        console.log('\n🎊 ¡Reporte generado!');
        process.exit(0);
      })
      .catch((error) => {
        console.error('\n💥 Error generando reporte:', error);
        process.exit(1);
      });
  } else {
    console.log('❌ Uso: node sendCredentialsEmail.js [email|report]');
    console.log('📝 Ejemplos:');
    console.log('   node sendCredentialsEmail.js email    # Enviar emails');
    console.log('   node sendCredentialsEmail.js report   # Generar reporte');
    process.exit(1);
  }
}

module.exports = {
  sendCredentialsEmail,
  sendCredentialsToAllClients,
  generateCredentialsReport
};
