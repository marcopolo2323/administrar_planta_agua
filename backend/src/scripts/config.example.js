// Archivo de configuración de ejemplo
// Copia este archivo como config.js y configura tus credenciales

module.exports = {
  // Configuración de WhatsApp Business API
  whatsapp: {
    accessToken: 'tu_token_de_whatsapp_business_aqui',
    phoneNumberId: 'tu_phone_number_id_aqui',
    apiUrl: 'https://graph.facebook.com/v18.0'
  },
  
  // Configuración de Email
  email: {
    service: 'gmail',
    auth: {
      user: 'aquayara.contacto@gmail.com',
      pass: 'tu_contraseña_de_aplicacion_de_gmail_aqui'
    }
  },
  
  // Configuración de Base de Datos
  database: {
    host: 'localhost',
    port: 5432,
    name: 'aquayara_db',
    user: 'tu_usuario_db',
    pass: 'tu_contraseña_db'
  },
  
  // Configuración de JWT
  jwt: {
    secret: 'tu_jwt_secret_muy_seguro_aqui'
  },
  
  // Configuración del Servidor
  server: {
    port: 3000,
    env: 'development'
  }
};
