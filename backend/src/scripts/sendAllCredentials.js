const { sendMessagesToAllClients, sendTestMessage, showConfiguration: showWhatsAppConfig } = require('./sendWhatsAppMessages');
const { sendEmailsToAllClients, sendTestEmail, showConfiguration: showEmailConfig } = require('./sendEmailMessages');

const sendAllCredentials = async (method = 'whatsapp') => {
  try {
    console.log('📢 ENVÍO DE CREDENCIALES A CLIENTES');
    console.log('====================================');
    console.log(`📋 Método seleccionado: ${method.toUpperCase()}`);
    console.log('');
    
    if (method === 'whatsapp') {
      console.log('📱 Enviando credenciales por WhatsApp...');
      await sendMessagesToAllClients();
    } else if (method === 'email') {
      console.log('📧 Enviando credenciales por Email...');
      await sendEmailsToAllClients();
    } else if (method === 'both') {
      console.log('📱📧 Enviando credenciales por WhatsApp y Email...');
      console.log('');
      console.log('📱 Enviando por WhatsApp...');
      await sendMessagesToAllClients();
      console.log('');
      console.log('📧 Enviando por Email...');
      await sendEmailsToAllClients();
    } else {
      throw new Error('Método no válido. Use: whatsapp, email, o both');
    }
    
    console.log('\n🎉 ¡Envío de credenciales completado!');
    console.log('====================================');
    
  } catch (error) {
    console.error('❌ Error durante el envío:', error);
    throw error;
  }
};

const showAllOptions = () => {
  console.log('📢 OPCIONES PARA ENVIAR CREDENCIALES');
  console.log('====================================');
  console.log('');
  
  console.log('🎯 RECOMENDACIÓN: WhatsApp Business API');
  console.log('---------------------------------------');
  console.log('✅ Más personal y directo');
  console.log('✅ Mayor tasa de lectura');
  console.log('✅ Fácil de usar');
  console.log('✅ Los clientes ya lo usan');
  console.log('');
  
  console.log('📱 OPCIÓN 1: WhatsApp Business API');
  console.log('----------------------------------');
  console.log('🔧 Configuración:');
  console.log('   1. Crear cuenta de WhatsApp Business');
  console.log('   2. Configurar API de WhatsApp');
  console.log('   3. Configurar variables de entorno');
  console.log('');
  console.log('📝 Comandos:');
  console.log('   node src/scripts/sendAllCredentials.js whatsapp');
  console.log('   node src/scripts/sendWhatsAppMessages.js test +51966666666');
  console.log('');
  
  console.log('📧 OPCIÓN 2: Email Marketing');
  console.log('-----------------------------');
  console.log('🔧 Configuración:');
  console.log('   1. Configurar Gmail con contraseña de aplicación');
  console.log('   2. Configurar variables de entorno');
  console.log('   3. Probar configuración');
  console.log('');
  console.log('📝 Comandos:');
  console.log('   node src/scripts/sendAllCredentials.js email');
  console.log('   node src/scripts/sendEmailMessages.js test tu_email@gmail.com');
  console.log('');
  
  console.log('🔄 OPCIÓN 3: Ambos Métodos');
  console.log('---------------------------');
  console.log('🔧 Configuración:');
  console.log('   1. Configurar ambos servicios');
  console.log('   2. Enviar por WhatsApp y Email');
  console.log('   3. Mayor cobertura de clientes');
  console.log('');
  console.log('📝 Comando:');
  console.log('   node src/scripts/sendAllCredentials.js both');
  console.log('');
  
  console.log('🔧 CONFIGURACIÓN DE VARIABLES DE ENTORNO:');
  console.log('==========================================');
  console.log('');
  console.log('📱 Para WhatsApp:');
  console.log('   WHATSAPP_ACCESS_TOKEN=tu_token_aqui');
  console.log('   WHATSAPP_PHONE_NUMBER_ID=tu_phone_number_id');
  console.log('');
  console.log('📧 Para Email:');
  console.log('   EMAIL_USER=tu_email@gmail.com');
  console.log('   EMAIL_PASS=tu_contraseña_de_aplicacion');
  console.log('');
  
  console.log('📊 ESTADÍSTICAS DE CLIENTES:');
  console.log('-----------------------------');
  console.log('👥 Total de clientes: 73');
  console.log('📱 Con teléfono: 73');
  console.log('📧 Con email: 73');
  console.log('👤 Con usuario: 72');
  console.log('');
  
  console.log('📝 PRÓXIMOS PASOS:');
  console.log('-------------------');
  console.log('1. Elegir método de envío');
  console.log('2. Configurar variables de entorno');
  console.log('3. Probar con un cliente primero');
  console.log('4. Enviar a todos los clientes');
  console.log('5. Monitorear resultados');
  console.log('');
  
  console.log('🎊 ¡Sistema de envío de credenciales listo!');
};

// Ejecutar si se llama directamente
if (require.main === module) {
  const method = process.argv[2] || 'whatsapp';
  
  if (method === 'help' || method === 'options') {
    showAllOptions();
  } else if (method === 'whatsapp-config') {
    showWhatsAppConfig();
  } else if (method === 'email-config') {
    showEmailConfig();
  } else {
    sendAllCredentials(method)
      .then(() => {
        console.log('\n🎊 ¡Envío completado exitosamente!');
        process.exit(0);
      })
      .catch((error) => {
        console.error('\n💥 Error en el envío:', error);
        process.exit(1);
      });
  }
}

module.exports = {
  sendAllCredentials,
  showAllOptions
};
