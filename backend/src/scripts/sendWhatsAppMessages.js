const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Configuración de WhatsApp Business API
const WHATSAPP_CONFIG = {
  // Reemplaza con tu token de WhatsApp Business
  accessToken: process.env.WHATSAPP_ACCESS_TOKEN || 'TU_TOKEN_AQUI',
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || 'TU_PHONE_NUMBER_ID',
  apiUrl: 'https://graph.facebook.com/v18.0'
};

// Función para enviar mensaje por WhatsApp
const sendWhatsAppMessage = async (phoneNumber, message) => {
  try {
    const url = `${WHATSAPP_CONFIG.apiUrl}/${WHATSAPP_CONFIG.phoneNumberId}/messages`;
    
    const data = {
      messaging_product: 'whatsapp',
      to: phoneNumber,
      type: 'text',
      text: {
        body: message
      }
    };

    const response = await axios.post(url, data, {
      headers: {
        'Authorization': `Bearer ${WHATSAPP_CONFIG.accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`✅ Mensaje enviado a ${phoneNumber}`);
    return response.data;

  } catch (error) {
    console.error(`❌ Error enviando mensaje a ${phoneNumber}:`, error.response?.data || error.message);
    throw error;
  }
};

// Función para enviar mensajes a todos los clientes
const sendMessagesToAllClients = async () => {
  try {
    console.log('📱 Iniciando envío de mensajes por WhatsApp...');
    console.log('================================================');
    
    // Leer archivo de credenciales
    const credentialsPath = path.join(__dirname, '../../data/credenciales_whatsapp.json');
    const credentialsData = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
    
    console.log(`📊 Total de clientes: ${credentialsData.length}`);
    
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    
    // Enviar mensajes uno por uno (para evitar límites de rate)
    for (let i = 0; i < credentialsData.length; i++) {
      const client = credentialsData[i];
      
      try {
        // Limpiar número de teléfono
        const phoneNumber = client.telefono.replace(/\D/g, '');
        
        if (!phoneNumber) {
          console.log(`⚠️ Cliente ${client.nombre} no tiene teléfono válido, saltando...`);
          continue;
        }
        
        // Agregar código de país si no lo tiene
        const fullPhoneNumber = phoneNumber.startsWith('51') ? phoneNumber : `51${phoneNumber}`;
        
        console.log(`📤 Enviando mensaje a ${client.nombre} (${fullPhoneNumber})...`);
        
        await sendWhatsAppMessage(fullPhoneNumber, client.mensaje);
        successCount++;
        
        // Pausa entre mensajes para evitar límites de rate
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ Error con cliente ${client.nombre}:`, error.message);
        errors.push(`${client.nombre}: ${error.message}`);
        errorCount++;
      }
    }
    
    console.log('\n📱 ¡Envío de mensajes completado!');
    console.log('================================================');
    console.log(`✅ Mensajes enviados exitosamente: ${successCount}`);
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

// Función para enviar mensaje de prueba
const sendTestMessage = async (phoneNumber) => {
  try {
    console.log(`📤 Enviando mensaje de prueba a ${phoneNumber}...`);
    
    const testMessage = `💧 *AQUAYARA - Mensaje de Prueba*

¡Hola! Este es un mensaje de prueba desde AquaYara.

🔧 *Configuración de WhatsApp Business API:*
✅ Conexión exitosa
✅ Mensaje enviado correctamente
✅ Sistema funcionando

📞 *Contacto:*
Teléfono: +51 961 606 183
Email: contacto@aquayara.com

¡Gracias por elegir AquaYara! 💧

---
*Este es un mensaje de prueba automático*`;
    
    const result = await sendWhatsAppMessage(phoneNumber, testMessage);
    console.log('✅ Mensaje de prueba enviado exitosamente');
    return result;
    
  } catch (error) {
    console.error('❌ Error enviando mensaje de prueba:', error);
    throw error;
  }
};

// Función para mostrar configuración
const showConfiguration = () => {
  console.log('🔧 CONFIGURACIÓN DE WHATSAPP BUSINESS API');
  console.log('==========================================');
  console.log('');
  console.log('📋 Pasos para configurar:');
  console.log('');
  console.log('1. Crear cuenta de WhatsApp Business:');
  console.log('   • Ve a: https://business.whatsapp.com');
  console.log('   • Crea una cuenta de WhatsApp Business');
  console.log('   • Verifica tu número de teléfono');
  console.log('');
  console.log('2. Configurar API de WhatsApp:');
  console.log('   • Ve a: https://developers.facebook.com');
  console.log('   • Crea una aplicación');
  console.log('   • Configura WhatsApp Business API');
  console.log('   • Obtén tu Access Token');
  console.log('   • Obtén tu Phone Number ID');
  console.log('');
  console.log('3. Configurar variables de entorno:');
  console.log('   • WHATSAPP_ACCESS_TOKEN=tu_token_aqui');
  console.log('   • WHATSAPP_PHONE_NUMBER_ID=tu_phone_number_id');
  console.log('');
  console.log('4. Probar la configuración:');
  console.log('   node src/scripts/sendWhatsAppMessages.js test +51966666666');
  console.log('');
  console.log('5. Enviar a todos los clientes:');
  console.log('   node src/scripts/sendWhatsAppMessages.js send');
  console.log('');
};

// Ejecutar si se llama directamente
if (require.main === module) {
  const action = process.argv[2];
  const phoneNumber = process.argv[3];
  
  if (action === 'test' && phoneNumber) {
    sendTestMessage(phoneNumber)
      .then(() => {
        console.log('\n🎊 ¡Mensaje de prueba enviado!');
        process.exit(0);
      })
      .catch((error) => {
        console.error('\n💥 Error en el mensaje de prueba:', error);
        process.exit(1);
      });
  } else if (action === 'send') {
    sendMessagesToAllClients()
      .then(() => {
        console.log('\n🎊 ¡Mensajes enviados a todos los clientes!');
        process.exit(0);
      })
      .catch((error) => {
        console.error('\n💥 Error enviando mensajes:', error);
        process.exit(1);
      });
  } else if (action === 'config') {
    showConfiguration();
  } else {
    console.log('❌ Uso: node sendWhatsAppMessages.js [test|send|config] [phoneNumber]');
    console.log('📝 Ejemplos:');
    console.log('   node sendWhatsAppMessages.js config                    # Mostrar configuración');
    console.log('   node sendWhatsAppMessages.js test +51966666666         # Enviar mensaje de prueba');
    console.log('   node sendWhatsAppMessages.js send                      # Enviar a todos los clientes');
    process.exit(1);
  }
}

module.exports = {
  sendWhatsAppMessage,
  sendMessagesToAllClients,
  sendTestMessage,
  showConfiguration
};
