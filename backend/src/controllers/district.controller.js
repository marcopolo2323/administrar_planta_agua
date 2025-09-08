const { District } = require('../models');

// Obtener todos los distritos
exports.getDistricts = async (req, res) => {
  try {
    const districts = await District.findAll({
      where: { isActive: true },
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      data: districts
    });
  } catch (error) {
    console.error('Error al obtener distritos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Crear un nuevo distrito
exports.createDistrict = async (req, res) => {
  try {
    const { name, deliveryFee } = req.body;

    const district = await District.create({
      name,
      deliveryFee: parseFloat(deliveryFee) || 0
    });

    res.status(201).json({
      success: true,
      data: district
    });
  } catch (error) {
    console.error('Error al crear distrito:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Actualizar un distrito
exports.updateDistrict = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, deliveryFee, isActive } = req.body;

    const district = await District.findByPk(id);
    if (!district) {
      return res.status(404).json({
        success: false,
        message: 'Distrito no encontrado'
      });
    }

    await district.update({
      name,
      deliveryFee: parseFloat(deliveryFee) || district.deliveryFee,
      isActive: isActive !== undefined ? isActive : district.isActive
    });

    res.json({
      success: true,
      data: district
    });
  } catch (error) {
    console.error('Error al actualizar distrito:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Eliminar un distrito
exports.deleteDistrict = async (req, res) => {
  try {
    const { id } = req.params;

    const district = await District.findByPk(id);
    if (!district) {
      return res.status(404).json({
        success: false,
        message: 'Distrito no encontrado'
      });
    }

    await district.destroy();

    res.json({
      success: true,
      message: 'Distrito eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar distrito:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Calcular flete automáticamente por distrito
exports.calculateDeliveryFee = async (req, res) => {
  try {
    const { districtName, orderAmount = 0 } = req.body;

    if (!districtName) {
      return res.status(400).json({
        success: false,
        message: 'Nombre del distrito es requerido'
      });
    }

    // Buscar el distrito por nombre
    const district = await District.findOne({
      where: { 
        name: districtName,
        isActive: true 
      }
    });

    if (!district) {
      return res.status(404).json({
        success: false,
        message: 'Distrito no encontrado o inactivo'
      });
    }

    // Calcular el flete (puedes agregar lógica adicional aquí)
    const deliveryFee = parseFloat(district.deliveryFee) || 0;

    res.json({
      success: true,
      data: {
        district: district.name,
        deliveryFee: deliveryFee,
        originalFee: deliveryFee,
        discount: 0
      }
    });
  } catch (error) {
    console.error('Error al calcular flete:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};
