const WebSocket = require('ws');
const http = require('http');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const Client = require('../models/client.model');
const DeliveryPerson = require('../models/deliveryPerson.model');

class WebSocketService {
  constructor(server) {
    this.wss = new WebSocket.Server({ server });
    this.clients = new Map(); // Mapa para almacenar conexiones de clientes
    this.setupWebSocket();
  }

  setupWebSocket() {
    this.wss.on('connection', async (ws, req) => {
      console.log('Nueva conexión WebSocket');
      
      // Extraer token de la URL de conexión
      const url = new URL(req.url, 'http://localhost');
      const token = url.searchParams.get('token');
      
      if (!token) {
        ws.close(1008, 'Token no proporcionado');
        return;
      }
      
      try {
        // Verificar token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
        const userId = decoded.id;
        const userRole = decoded.role;
        
        // Determinar el modelo de usuario según el rol
        let userModel;
        if (userRole === 'admin') {
          userModel = 'User';
        } else if (userRole === 'client') {
          userModel = 'Client';
        } else if (userRole === 'repartidor') {
          userModel = 'DeliveryPerson';
        } else {
          ws.close(1008, 'Rol de usuario no válido');
          return;
        }
        
        // Verificar que el usuario existe
        let userExists = false;
        if (userModel === 'User') {
          userExists = await User.findByPk(userId);
        } else if (userModel === 'Client') {
          userExists = await Client.findByPk(userId);
        } else if (userModel === 'DeliveryPerson') {
          userExists = await DeliveryPerson.findByPk(userId);
        }
        
        if (!userExists) {
          ws.close(1008, 'Usuario no encontrado');
          return;
        }
        
        // Convertir el ID a string para usarlo con MongoDB
        const userIdString = userId.toString();
        
        // Almacenar la conexión en el mapa con una clave compuesta de userId y userModel
        // Usar el ID como string para compatibilidad con MongoDB
        const clientKey = `${userIdString}:${userModel}`;
        this.clients.set(clientKey, ws);
        
        console.log(`Usuario conectado: ${clientKey}`);
        
        // Enviar mensaje de conexión exitosa
        ws.send(JSON.stringify({
          type: 'connection',
          message: 'Conexión establecida correctamente',
          userId,
          userRole
        }));
        
        // Manejar cierre de conexión
        ws.on('close', () => {
          console.log(`Usuario desconectado: ${clientKey}`);
          this.clients.delete(clientKey);
        });
        
        // Manejar mensajes del cliente (no se espera que envíen mensajes en esta implementación)
        ws.on('message', (message) => {
          console.log(`Mensaje recibido de ${clientKey}: ${message}`);
          // En esta implementación, no procesamos mensajes de los clientes
        });
        
      } catch (error) {
        console.error('Error en la conexión WebSocket:', error);
        ws.close(1008, 'Token inválido o expirado');
      }
    });
  }

  // Enviar notificación a un usuario específico
  sendNotification(userId, userModel, notification) {
    // Asegurar que el userId sea un string
    const userIdString = userId.toString ? userId.toString() : userId;
    const clientKey = `${userIdString}:${userModel}`;
    const client = this.clients.get(clientKey);
    
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: 'notification',
        data: notification
      }));
      return true;
    }
    return false;
  }

  // Enviar notificación a todos los usuarios con un rol específico
  broadcastToRole(role, notification) {
    let userModel;
    if (role === 'admin') {
      userModel = 'User';
    } else if (role === 'client') {
      userModel = 'Client';
    } else if (role === 'repartidor') {
      userModel = 'DeliveryPerson';
    } else {
      return false;
    }
    
    let sent = false;
    for (const [clientKey, client] of this.clients.entries()) {
      if (clientKey.endsWith(`:${userModel}`) && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type: 'notification',
          data: notification
        }));
        sent = true;
      }
    }
    return sent;
  }

  // Enviar notificación a todos los clientes conectados
  broadcastToAll(notification) {
    let sent = false;
    for (const [clientKey, client] of this.clients.entries()) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type: 'notification',
          data: notification
        }));
        sent = true;
      }
    }
    return sent;
  }
}

module.exports = WebSocketService;