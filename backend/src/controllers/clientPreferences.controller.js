const { ClientPreferences, Client, Subscription } = require('../models');
const { Op } = require('sequelize');

// Obtener preferencias de cliente por DNI
exports.getClientPreferencesByDni = async (req, res) => {
  try {
    const { dni } = req.params;
    
    console.log('🔍 Buscando preferencias para DNI:', dni);
    
    // Buscar preferencias activas para este DNI
    const preferences = await ClientPreferences.findOne({
      where: {
        dni: dni,
        isActive: true,
        validUntil: {
          [Op.gt]: new Date() // Solo preferencias que no han expirado
        }
      },
      include: [
        {
          model: Subscription,
          as: 'subscription',
          required: false
        }
      ],
      order: [['createdAt', 'DESC']] // La más reciente
    });
    
    if (!preferences) {
      console.log('❌ No se encontraron preferencias activas para DNI:', dni);
      return res.json({
        success: true,
        data: null,
        message: 'No se encontraron preferencias activas para este cliente'
      });
    }
    
    console.log('✅ Preferencias encontradas:', preferences.toJSON());
    
    res.json({
      success: true,
      data: preferences,
      message: 'Preferencias encontradas exitosamente'
    });
    
  } catch (error) {
    console.error('❌ Error al obtener preferencias:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Crear o actualizar preferencias de cliente
exports.createOrUpdateClientPreferences = async (req, res) => {
  try {
    const {
      dni,
      clientId,
      preferredPaymentMethod,
      subscriptionPlanId,
      subscriptionAmount,
      subscriptionQuantity,
      validUntil,
      notes
    } = req.body;
    
    console.log('💾 Guardando preferencias:', req.body);
    
    // Validar datos requeridos
    if (!dni || !preferredPaymentMethod || !validUntil) {
      return res.status(400).json({
        success: false,
        message: 'DNI, método de pago preferido y fecha de validez son requeridos'
      });
    }
    
    // Si no se proporciona clientId, intentar encontrarlo por DNI
    let finalClientId = clientId;
    if (!finalClientId) {
      const client = await Client.findOne({
        where: { documentNumber: dni }
      });
      if (client) {
        finalClientId = client.id;
      }
    }
    
    // Desactivar preferencias anteriores para este DNI
    await ClientPreferences.update(
      { isActive: false },
      {
        where: {
          dni: dni,
          isActive: true
        }
      }
    );
    
    // Crear nueva preferencia
    const newPreferences = await ClientPreferences.create({
      clientId: finalClientId,
      dni: dni,
      preferredPaymentMethod: preferredPaymentMethod,
      subscriptionPlanId: subscriptionPlanId || null,
      subscriptionAmount: subscriptionAmount || null,
      subscriptionQuantity: subscriptionQuantity || null,
      validUntil: new Date(validUntil),
      isActive: true,
      notes: notes || null
    });
    
    console.log('✅ Preferencias guardadas exitosamente:', newPreferences.toJSON());
    
    res.json({
      success: true,
      data: newPreferences,
      message: 'Preferencias guardadas exitosamente'
    });
    
  } catch (error) {
    console.error('❌ Error al guardar preferencias:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener todas las preferencias de un cliente
exports.getClientPreferencesById = async (req, res) => {
  try {
    const { clientId } = req.params;
    
    const preferences = await ClientPreferences.findAll({
      where: { clientId: clientId },
      include: [
        {
          model: Subscription,
          as: 'subscription',
          required: false
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.json({
      success: true,
      data: preferences,
      message: 'Preferencias obtenidas exitosamente'
    });
    
  } catch (error) {
    console.error('❌ Error al obtener preferencias por ID:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Desactivar preferencias
exports.deactivateClientPreferences = async (req, res) => {
  try {
    const { dni } = req.params;
    
    await ClientPreferences.update(
      { isActive: false },
      {
        where: {
          dni: dni,
          isActive: true
        }
      }
    );
    
    res.json({
      success: true,
      message: 'Preferencias desactivadas exitosamente'
    });
    
  } catch (error) {
    console.error('❌ Error al desactivar preferencias:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Limpiar preferencias expiradas (tarea de mantenimiento)
exports.cleanExpiredPreferences = async (req, res) => {
  try {
    const result = await ClientPreferences.update(
      { isActive: false },
      {
        where: {
          validUntil: {
            [Op.lt]: new Date()
          },
          isActive: true
        }
      }
    );
    
    res.json({
      success: true,
      message: `${result[0]} preferencias expiradas desactivadas`,
      count: result[0]
    });
    
  } catch (error) {
    console.error('❌ Error al limpiar preferencias expiradas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};
