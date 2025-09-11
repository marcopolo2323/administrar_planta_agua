const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Configuración de email
const EMAIL_CONFIG = {
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'aquayara.contacto@gmail.com',
    pass: process.env.EMAIL_PASS || 'TU_CONTRASEÑA_DE_APLICACION'
  }
};

// Crear transporter de email
const createTransporter = () => {
  return nodemailer.createTransporter(EMAIL_CONFIG);
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
            
            <h2>¡Bienvenido ${client.nombre}!</h2>
            
            <p>Nos complace informarle que su cuenta de cliente frecuente ha sido creada exitosamente en nuestro sistema AquaYara.</p>
            
            <div class="credentials-box">
                <h3 style="margin-top: 0; color: #1E40AF;">🔑 Sus Credenciales de Acceso</h3>
                <div class="credential-item">
                    <span class="credential-label">Usuario:</span>
                    <span class="credential-value">${credentials.usuario}</span>
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
                <p><strong>Email:</strong> aguademesaaquayara@gmail.com</p>
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

// Función para enviar email a un cliente
const sendEmailToClient = async (client, credentials) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: '"AquaYara" <aquayara.contacto@gmail.com>',
      to: client.email,
      subject: '🔑 Sus Credenciales de Acceso - AquaYara',
      html: createEmailTemplate(client, credentials)
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Email enviado a ${client.nombre} (${client.email})`);
    return result;

  } catch (error) {
    console.error(`❌ Error enviando email a ${client.nombre}:`, error.message);
    throw error;
  }
};

// Función para enviar emails a todos los clientes
const sendEmailsToAllClients = async () => {
  try {
    console.log('📧 Iniciando envío de emails...');
    console.log('================================================');
    
    // Leer archivo de credenciales
    const credentialsPath = path.join(__dirname, '../../data/credenciales_clientes.json');
    const credentialsData = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
    
    console.log(`📊 Total de clientes: ${credentialsData.length}`);
    
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    
    // Enviar emails uno por uno
    for (let i = 0; i < credentialsData.length; i++) {
      const client = credentialsData[i];
      
      try {
        if (!client.email || client.email === 'N/A') {
          console.log(`⚠️ Cliente ${client.nombre} no tiene email válido, saltando...`);
          continue;
        }
        
        console.log(`📤 Enviando email a ${client.nombre} (${client.email})...`);
        
        const credentials = {
          usuario: client.usuario,
          password: 'CONTRASEÑA_TEMPORAL', // Necesitarías obtener la contraseña real
          email: client.email
        };
        
        await sendEmailToClient(client, credentials);
        successCount++;
        
        // Pausa entre emails para evitar límites de rate
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.error(`❌ Error con cliente ${client.nombre}:`, error.message);
        errors.push(`${client.nombre}: ${error.message}`);
        errorCount++;
      }
    }
    
    console.log('\n📧 ¡Envío de emails completado!');
    console.log('================================================');
    console.log(`✅ Emails enviados exitosamente: ${successCount}`);
    console.log(`❌ Errores encontrados: ${errorCount}`);
    
    if (errors.length > 0) {
      console.log('\n📋 Errores detallados:');
      errors.forEach(error => console.log(`   - ${error}`));
    }
    
    return { successCount, errorCount, errors };
    
  } catch (error) {
    console.error('❌ Error durante el envío masivo:', error);
    throw error;
  }
};

// Función para enviar email de prueba
const sendTestEmail = async (email) => {
  try {
    console.log(`📤 Enviando email de prueba a ${email}...`);
    
    const testClient = {
      nombre: 'Cliente de Prueba',
      email: email
    };
    
    const testCredentials = {
      usuario: 'usuario_prueba',
      password: 'contraseña_prueba',
      email: email
    };
    
    const result = await sendEmailToClient(testClient, testCredentials);
    console.log('✅ Email de prueba enviado exitosamente');
    return result;
    
  } catch (error) {
    console.error('❌ Error enviando email de prueba:', error);
    throw error;
  }
};

// Función para mostrar configuración
const showConfiguration = () => {
  console.log('🔧 CONFIGURACIÓN DE EMAIL');
  console.log('==========================');
  console.log('');
  console.log('📋 Pasos para configurar:');
  console.log('');
  console.log('1. Configurar Gmail con contraseña de aplicación:');
  console.log('   • Ve a: https://myaccount.google.com/security');
  console.log('   • Activa la verificación en 2 pasos');
  console.log('   • Genera una contraseña de aplicación');
  console.log('   • Usa esa contraseña en lugar de tu contraseña normal');
  console.log('');
  console.log('2. Configurar variables de entorno:');
  console.log('   • EMAIL_USER=tu_email@gmail.com');
  console.log('   • EMAIL_PASS=tu_contraseña_de_aplicacion');
  console.log('');
  console.log('3. Probar la configuración:');
  console.log('   node src/scripts/sendEmailMessages.js test tu_email@gmail.com');
  console.log('');
  console.log('4. Enviar a todos los clientes:');
  console.log('   node src/scripts/sendEmailMessages.js send');
  console.log('');
};

// Ejecutar si se llama directamente
if (require.main === module) {
  const action = process.argv[2];
  const email = process.argv[3];
  
  if (action === 'test' && email) {
    sendTestEmail(email)
      .then(() => {
        console.log('\n🎊 ¡Email de prueba enviado!');
        process.exit(0);
      })
      .catch((error) => {
        console.error('\n💥 Error en el email de prueba:', error);
        process.exit(1);
      });
  } else if (action === 'send') {
    sendEmailsToAllClients()
      .then(() => {
        console.log('\n🎊 ¡Emails enviados a todos los clientes!');
        process.exit(0);
      })
      .catch((error) => {
        console.error('\n💥 Error enviando emails:', error);
        process.exit(1);
      });
  } else if (action === 'config') {
    showConfiguration();
  } else {
    console.log('❌ Uso: node sendEmailMessages.js [test|send|config] [email]');
    console.log('📝 Ejemplos:');
    console.log('   node sendEmailMessages.js config                    # Mostrar configuración');
    console.log('   node sendEmailMessages.js test tu_email@gmail.com   # Enviar email de prueba');
    console.log('   node sendEmailMessages.js send                      # Enviar a todos los clientes');
    process.exit(1);
  }
}

module.exports = {
  sendEmailToClient,
  sendEmailsToAllClients,
  sendTestEmail,
  showConfiguration
};
