require('dotenv').config();
const mongoose = require('mongoose');
const Notification = require('../models/notification.model'); // Usar tu modelo existente

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/punto_de_venta', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ MongoDB conectado exitosamente');
}).catch(err => {
  console.error('❌ Error al conectar a MongoDB:', err);
  process.exit(1);
});

async function createTestNotifications() {
  try {
    // Eliminar notificaciones existentes (opcional)
    await Notification.deleteMany({});
    console.log('🗑️  Notificaciones anteriores eliminadas');
    
    // Crear notificaciones de prueba usando tu esquema
    const testNotifications = [
      {
        userId: 'user123',
        userModel: 'User',
        title: 'Nueva orden recibida',
        message: 'Se ha recibido una nueva orden #001',
        type: 'new_order'
      },
      {
        userId: 'client456',
        userModel: 'Client',
        title: 'Pedido en camino',
        message: 'Tu pedido está siendo preparado para entrega',
        type: 'order_status_update'
      },
      {
        userId: 'delivery789',
        userModel: 'DeliveryPerson',
        title: 'Nueva asignación',
        message: 'Se te ha asignado una nueva entrega',
        type: 'delivery_assigned'
      },
      {
        userId: 'user123',
        userModel: 'User',
        title: 'Pago confirmado',
        message: 'Se ha confirmado el pago de la orden #002',
        type: 'payment_update'
      },
      {
        userId: 'admin',
        userModel: 'User',
        title: 'Sistema iniciado',
        message: 'El sistema se ha iniciado correctamente',
        type: 'new_order'
      }
    ];

    for (const notificationData of testNotifications) {
      const notification = new Notification(notificationData);
      await notification.save();
      console.log('✅ Notificación creada:', notification.title);
    }

    console.log('🎉 Todas las notificaciones de prueba han sido creadas');
    
    // Verificar que se crearon
    const count = await Notification.countDocuments();
    console.log(`📊 Total de notificaciones en la base de datos: ${count}`);
    
    // Mostrar algunas notificaciones
    const notifications = await Notification.find().limit(3);
    console.log('📝 Primeras notificaciones:');
    notifications.forEach(n => {
      console.log(`   - ${n.title} (${n.type})`);
    });
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createTestNotifications();