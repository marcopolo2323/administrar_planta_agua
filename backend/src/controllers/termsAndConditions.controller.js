const TermsAndConditions = require('../models/termsAndConditions.model');
const User = require('../models/user.model');

// Obtener términos y condiciones activos
const getActiveTerms = async (req, res) => {
  try {
    const terms = await TermsAndConditions.findOne({
      where: { isActive: true },
      order: [['effectiveDate', 'DESC']],
      include: [{
        model: User,
        as: 'creator',
        attributes: ['username', 'email']
      }]
    });

    if (!terms) {
      return res.status(404).json({
        success: false,
        message: 'No hay términos y condiciones disponibles'
      });
    }

    res.json({
      success: true,
      data: terms
    });
  } catch (error) {
    console.error('Error al obtener términos activos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener todos los términos y condiciones (admin)
const getAllTerms = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = {};
    if (status === 'active') {
      whereClause.isActive = true;
    } else if (status === 'inactive') {
      whereClause.isActive = false;
    }

    const { count, rows: terms } = await TermsAndConditions.findAndCountAll({
      where: whereClause,
      order: [['effectiveDate', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [{
        model: User,
        as: 'creator',
        attributes: ['username', 'email']
      }, {
        model: User,
        as: 'lastModifier',
        attributes: ['username', 'email']
      }]
    });

    res.json({
      success: true,
      data: terms,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error al obtener términos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Crear nuevos términos y condiciones
const createTerms = async (req, res) => {
  try {
    const { version, title, content, effectiveDate } = req.body;
    const userId = req.user.id;

    // Validar campos requeridos
    if (!version || !title || !content || !effectiveDate) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos: version, title, content, effectiveDate'
      });
    }

    // Verificar que la versión no exista
    const existingVersion = await TermsAndConditions.findOne({
      where: { version }
    });

    if (existingVersion) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe una versión con ese número'
      });
    }

    // Desactivar términos anteriores
    await TermsAndConditions.update(
      { isActive: false },
      { where: { isActive: true } }
    );

    // Crear nuevos términos
    const newTerms = await TermsAndConditions.create({
      version,
      title,
      content,
      effectiveDate: new Date(effectiveDate),
      isActive: true,
      createdBy: userId,
      lastModifiedBy: userId
    });

    res.status(201).json({
      success: true,
      message: 'Términos y condiciones creados exitosamente',
      data: newTerms
    });
  } catch (error) {
    console.error('Error al crear términos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Actualizar términos y condiciones
const updateTerms = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, effectiveDate } = req.body;
    const userId = req.user.id;

    const terms = await TermsAndConditions.findByPk(id);
    if (!terms) {
      return res.status(404).json({
        success: false,
        message: 'Términos y condiciones no encontrados'
      });
    }

    // Actualizar términos
    await terms.update({
      title: title || terms.title,
      content: content || terms.content,
      effectiveDate: effectiveDate ? new Date(effectiveDate) : terms.effectiveDate,
      lastModifiedBy: userId
    });

    res.json({
      success: true,
      message: 'Términos y condiciones actualizados exitosamente',
      data: terms
    });
  } catch (error) {
    console.error('Error al actualizar términos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Activar/desactivar términos
const toggleTermsStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const terms = await TermsAndConditions.findByPk(id);
    if (!terms) {
      return res.status(404).json({
        success: false,
        message: 'Términos y condiciones no encontrados'
      });
    }

    // Si se va a activar, desactivar todos los demás
    if (!terms.isActive) {
      await TermsAndConditions.update(
        { isActive: false },
        { where: { isActive: true } }
      );
    }

    // Cambiar estado
    await terms.update({
      isActive: !terms.isActive,
      lastModifiedBy: userId
    });

    res.json({
      success: true,
      message: `Términos y condiciones ${terms.isActive ? 'desactivados' : 'activados'} exitosamente`,
      data: terms
    });
  } catch (error) {
    console.error('Error al cambiar estado de términos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Eliminar términos y condiciones
const deleteTerms = async (req, res) => {
  try {
    const { id } = req.params;

    const terms = await TermsAndConditions.findByPk(id);
    if (!terms) {
      return res.status(404).json({
        success: false,
        message: 'Términos y condiciones no encontrados'
      });
    }

    // No permitir eliminar términos activos
    if (terms.isActive) {
      return res.status(400).json({
        success: false,
        message: 'No se pueden eliminar términos y condiciones activos'
      });
    }

    await terms.destroy();

    res.json({
      success: true,
      message: 'Términos y condiciones eliminados exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar términos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

module.exports = {
  getActiveTerms,
  getAllTerms,
  createTerms,
  updateTerms,
  toggleTermsStatus,
  deleteTerms
};
