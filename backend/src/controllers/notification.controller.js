const Notification = require('../models/notification.model');
const User = require('../models/user.model');
const Client = require('../models/client.model');
const DeliveryPerson = require('../models/deliveryPerson.model');

// Crear una nueva notificación
exports.createNotification = async (req, res) => {
  try {
    const { userId, userModel, title, message, type, orderId } = req.body;

    // Validar que el usuario existe
    let userExists = false;
    if (userModel === 'User') {
      userExists = await User.exists({ _id: userId });
    } else if (userModel === 'Client') {
      userExists = await Client.exists({ _id: userId });
    } else if (userModel === 'DeliveryPerson') {
      userExists = await DeliveryPerson.exists({ _id: userId });
    }

    if (!userExists) {
      return res.status(400).json({ message: 'Usuario no encontrado' });
    }

    const notification = new Notification({
      userId,
      userModel,
      title,
      message,
      type,
      orderId
    });

    await notification.save();
    res.status(201).json(notification);
  } catch (error) {
    console.error('Error al crear notificación:', error);
    res.status(500).json({ message: 'Error al crear la notificación', error: error.message });
  }
};

// Crear notificaciones para múltiples usuarios
exports.createMultipleNotifications = async (req, res) => {
  try {
    const { notifications } = req.body;

    if (!Array.isArray(notifications) || notifications.length === 0) {
      return res.status(400).json({ message: 'Se requiere un array de notificaciones' });
    }

    const createdNotifications = await Notification.insertMany(notifications);
    res.status(201).json(createdNotifications);
  } catch (error) {
    console.error('Error al crear notificaciones múltiples:', error);
    res.status(500).json({ message: 'Error al crear notificaciones múltiples', error: error.message });
  }
};

// Obtener notificaciones de un usuario
exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    let userModel;

    // Determinar el modelo de usuario según el rol
    if (req.user.role === 'admin' || req.user.role === 'vendedor') {
      userModel = 'User';
    } else if (req.user.role === 'cliente') {
      userModel = 'Client';
    } else if (req.user.role === 'repartidor') {
      userModel = 'DeliveryPerson';
    } else {
      return res.status(400).json({ message: 'Rol de usuario no válido' });
    }

    // Buscar notificaciones por userId como string para evitar problemas de conversión
    const userIdString = userId.toString();
    
    const notifications = await Notification.find({ 
      userId: userIdString,
      userModel: userModel
    })
    .sort({ createdAt: -1 })
    .limit(50); // Limitar a las 50 notificaciones más recientes

    res.status(200).json(notifications);
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    res.status(500).json({ message: 'Error al obtener notificaciones', error: error.message });
  }
};

// Marcar una notificación como leída
exports.markAsRead = async (req, res) => {
  try {
    const notificationId = req.params.id;
    const userId = req.user.id;
    const userIdString = userId.toString();

    const notification = await Notification.findById(notificationId);

    if (!notification) {
      return res.status(404).json({ message: 'Notificación no encontrada' });
    }

    // Verificar que la notificación pertenece al usuario
    const notificationUserId = notification.userId.toString ? notification.userId.toString() : notification.userId;
    if (notificationUserId !== userIdString && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'No autorizado para marcar esta notificación como leída' });
    }

    notification.read = true;
    await notification.save();

    res.status(200).json({ message: 'Notificación marcada como leída', notification });
  } catch (error) {
    console.error('Error al marcar notificación como leída:', error);
    res.status(500).json({ message: 'Error al marcar notificación como leída', error: error.message });
  }
};

// Marcar todas las notificaciones de un usuario como leídas
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const userIdString = userId.toString();
    let userModel;

    // Determinar el modelo de usuario según el rol
    if (req.user.role === 'admin' || req.user.role === 'vendedor') {
      userModel = 'User';
    } else if (req.user.role === 'cliente') {
      userModel = 'Client';
    } else if (req.user.role === 'repartidor') {
      userModel = 'DeliveryPerson';
    } else {
      return res.status(400).json({ message: 'Rol de usuario no válido' });
    }

    const result = await Notification.updateMany(
      { userId: userIdString, userModel: userModel, read: false },
      { $set: { read: true } }
    );

    res.status(200).json({ 
      message: 'Todas las notificaciones marcadas como leídas',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error al marcar todas las notificaciones como leídas:', error);
    res.status(500).json({ 
      message: 'Error al marcar todas las notificaciones como leídas', 
      error: error.message 
    });
  }
};

// Eliminar una notificación
exports.deleteNotification = async (req, res) => {
  try {
    const notificationId = req.params.id;
    const userId = req.user.id;
    const userIdString = userId.toString();

    const notification = await Notification.findById(notificationId);

    if (!notification) {
      return res.status(404).json({ message: 'Notificación no encontrada' });
    }

    // Verificar que la notificación pertenece al usuario o es administrador
    const notificationUserId = notification.userId.toString ? notification.userId.toString() : notification.userId;
    if (notificationUserId !== userIdString && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'No autorizado para eliminar esta notificación' });
    }

    await Notification.findByIdAndDelete(notificationId);

    res.status(200).json({ message: 'Notificación eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar notificación:', error);
    res.status(500).json({ message: 'Error al eliminar notificación', error: error.message });
  }
};

// Variable para almacenar el servicio WebSocket
let wsService = null;

// Función para establecer el servicio WebSocket desde index.js
exports.setWebSocketService = (service) => {
  wsService = service;
  console.log('Servicio WebSocket establecido en el controlador de notificaciones');
};

// Servicio para crear notificaciones desde otros controladores
exports.createNotificationService = async (notificationData) => {
  try {
    const notification = new Notification(notificationData);
    await notification.save();
    
    // Enviar notificación en tiempo real si el servicio WebSocket está disponible
    if (wsService) {
      wsService.sendNotification(
        notification.userId,
        notification.userModel,
        {
          _id: notification._id,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          orderId: notification.orderId,
          createdAt: notification.createdAt
        }
      );
    }
    
    return notification;
  } catch (error) {
    console.error('Error en servicio de notificación:', error);
    throw error;
  }
};

// Servicio para crear notificaciones para múltiples usuarios desde otros controladores
exports.createMultipleNotificationsService = async (notificationsArray) => {
  try {
    if (!Array.isArray(notificationsArray) || notificationsArray.length === 0) {
      throw new Error('Se requiere un array de notificaciones');
    }
    const notifications = await Notification.insertMany(notificationsArray);
    
    // Enviar notificaciones en tiempo real si el servicio WebSocket está disponible
    if (wsService) {
      notifications.forEach(notification => {
        wsService.sendNotification(
          notification.userId,
          notification.userModel,
          {
            _id: notification._id,
            title: notification.title,
            message: notification.message,
            type: notification.type,
            orderId: notification.orderId,
            createdAt: notification.createdAt
          }
        );
      });
    }
    return notifications;
  } catch (error) {
    console.error('Error en servicio de notificaciones múltiples:', error);
    throw error;
  }
};

  // Función de debug - agregar temporalmente
exports.debugNotifications = async (req, res) => {
  try {
    console.log('🔍 Estado de conexión MongoDB:', mongoose.connection.readyState);
    
    const count = await Notification.countDocuments();
    const notifications = await Notification.find().limit(5);
    
    res.json({
      message: 'Debug de notificaciones',
      mongoState: mongoose.connection.readyState,
      totalNotifications: count,
      sampleNotifications: notifications
    });
  } catch (error) {
    console.error('❌ Error en debug:', error);
    res.status(500).json({
      message: 'Error en debug',
      error: error.message,
      mongoState: mongoose.connection.readyState
    });
  }
};  