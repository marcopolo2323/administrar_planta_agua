const ClientPreference = require('../models/clientPreference.model');
const Client = require('../models/client.model');

// Obtener preferencias de un cliente por DNI
const getClientPreference = async (req, res) => {
  try {
    const { dni } = req.params;
    
    const preference = await ClientPreference.findOne({
      where: { 
        dni,
        isActive: true,
        validUntil: {
          [require('sequelize').Op.gt]: new Date() // Solo si no ha expirado
        }
      },
      include: [{
        model: Client,
        as: 'client',
        attributes: ['id', 'name', 'phone', 'email']
      }]
    });

    if (!preference) {
      return res.json({
        success: true,
        data: null,
        message: 'No hay preferencias guardadas para este cliente'
      });
    }

    res.json({
      success: true,
      data: preference
    });
  } catch (error) {
    console.error('Error al obtener preferencias del cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Guardar o actualizar preferencias de un cliente
const saveClientPreference = async (req, res) => {
  try {
    const { 
      dni, 
      clientId, 
      preferredPaymentMethod, 
      subscriptionType, 
      subscriptionAmount, 
      subscriptionQuantity,
      validUntil
    } = req.body;

    if (!dni || !preferredPaymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'DNI y modalidad de pago son requeridos'
      });
    }

    // Usar la fecha enviada desde el frontend o calcular una nueva
    const validUntilDate = validUntil ? new Date(validUntil) : (() => {
      const date = new Date();
      date.setMonth(date.getMonth() + 1);
      return date;
    })();

    // Calcular bonus según el tipo de suscripción
    let bonusQuantity = 0;
    if (preferredPaymentMethod === 'suscripcion' && subscriptionType) {
      switch (subscriptionType) {
        case 'basic':
          // 150 por 30 bidones = 1 extra
          if (subscriptionAmount >= 150 && subscriptionQuantity >= 30) {
            bonusQuantity = 1;
          }
          break;
        case 'premium':
          // 250 por 50 bidones = 2 extras
          if (subscriptionAmount >= 250 && subscriptionQuantity >= 50) {
            bonusQuantity = 2;
          }
          break;
        case 'vip':
          // 500 por 100 bidones = 5 extras
          if (subscriptionAmount >= 500 && subscriptionQuantity >= 100) {
            bonusQuantity = 5;
          }
          break;
      }
    }

    // Buscar preferencia existente
    let preference = await ClientPreference.findOne({
      where: { dni, isActive: true }
    });

    if (preference) {
      // Actualizar preferencia existente
      preference.preferredPaymentMethod = preferredPaymentMethod;
      preference.subscriptionType = subscriptionType;
      preference.subscriptionAmount = subscriptionAmount;
      preference.subscriptionQuantity = subscriptionQuantity;
      preference.bonusQuantity = bonusQuantity;
      preference.validUntil = validUntilDate;
      preference.clientId = clientId;
      
      await preference.save();
    } else {
      // Crear nueva preferencia
      preference = await ClientPreference.create({
        dni,
        clientId,
        preferredPaymentMethod,
        subscriptionType,
        subscriptionAmount,
        subscriptionQuantity,
        bonusQuantity,
        validUntil: validUntilDate
      });
    }

    // Cargar la preferencia con los datos del cliente
    const preferenceWithClient = await ClientPreference.findByPk(preference.id, {
      include: [{
        model: Client,
        as: 'client',
        attributes: ['id', 'name', 'phone', 'email']
      }]
    });

    res.json({
      success: true,
      data: preferenceWithClient,
      message: 'Preferencias guardadas exitosamente'
    });
  } catch (error) {
    console.error('Error al guardar preferencias del cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener todas las preferencias (para admin)
const getAllPreferences = async (req, res) => {
  try {
    const preferences = await ClientPreference.findAll({
      where: { isActive: true },
      include: [{
        model: Client,
        as: 'client',
        attributes: ['id', 'name', 'phone', 'email']
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: preferences
    });
  } catch (error) {
    console.error('Error al obtener todas las preferencias:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Desactivar preferencias de un cliente
const deactivatePreference = async (req, res) => {
  try {
    const { dni } = req.params;
    
    const preference = await ClientPreference.findOne({
      where: { dni, isActive: true }
    });

    if (!preference) {
      return res.status(404).json({
        success: false,
        message: 'Preferencias no encontradas'
      });
    }

    preference.isActive = false;
    await preference.save();

    res.json({
      success: true,
      message: 'Preferencias desactivadas exitosamente'
    });
  } catch (error) {
    console.error('Error al desactivar preferencias:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

module.exports = {
  getClientPreference,
  saveClientPreference,
  getAllPreferences,
  deactivatePreference
};
