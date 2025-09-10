const { generateCredentialsReport } = require('./sendCredentialsEmail');
const { generateWhatsAppReport, generateWhatsAppCSV } = require('./sendCredentialsWhatsApp');
const { Client, User } = require('../models');

const communicateCredentials = async (method = 'all') => {
  try {
    console.log('📢 Iniciando comunicación de credenciales...');
    console.log('================================================');
    
    // Obtener estadísticas de clientes
    const totalClients = await Client.count({ where: { active: true } });
    const clientsWithUsers = await Client.count({ 
      where: { active: true, userId: { [require('sequelize').Op.ne]: null } }
    });
    
    console.log(`📊 Total de clientes activos: ${totalClients}`);
    console.log(`👤 Clientes con usuarios: ${clientsWithUsers}`);
    
    if (method === 'email' || method === 'all') {
      console.log('\n📧 Generando reporte de credenciales para email...');
      await generateCredentialsReport();
    }
    
    if (method === 'whatsapp' || method === 'all') {
      console.log('\n📱 Generando reporte de credenciales para WhatsApp...');
      await generateWhatsAppReport();
    }
    
    if (method === 'csv' || method === 'all') {
      console.log('\n📊 Generando archivo CSV para WhatsApp Business...');
      await generateWhatsAppCSV();
    }
    
    console.log('\n🎉 ¡Comunicación de credenciales completada!');
    console.log('================================================');
    
    console.log('\n📋 Archivos generados:');
    console.log('   📧 credenciales_clientes.json - Para envío por email');
    console.log('   📱 credenciales_whatsapp.json - Para envío por WhatsApp');
    console.log('   📊 credenciales_whatsapp.csv - Para importar en WhatsApp Business');
    
    console.log('\n📝 Próximos pasos:');
    console.log('   1. Revisar los archivos generados');
    console.log('   2. Configurar el envío de emails (Gmail, etc.)');
    console.log('   3. Usar WhatsApp Business para envío masivo');
    console.log('   4. Comunicar las credenciales a los clientes');
    
    console.log('\n🔧 Configuración recomendada:');
    console.log('   • Email: Usar Gmail con contraseña de aplicación');
    console.log('   • WhatsApp: Usar WhatsApp Business API');
    console.log('   • Alternativa: Envío manual por WhatsApp Web');
    
  } catch (error) {
    console.error('❌ Error durante la comunicación:', error);
    throw error;
  }
};

// Ejecutar si se llama directamente
if (require.main === module) {
  const method = process.argv[2] || 'all';
  
  console.log('📢 Comunicación de Credenciales');
  console.log('===============================');
  console.log(`📋 Método: ${method}`);
  console.log('');
  
  communicateCredentials(method)
    .then(() => {
      console.log('\n🎊 ¡Comunicación completada!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Error en la comunicación:', error);
      process.exit(1);
    });
}

module.exports = communicateCredentials;
