const fs = require('fs');
const path = require('path');

// Servir términos y condiciones
exports.getTermsAndConditions = (req, res) => {
  try {
    const termsPath = path.join(__dirname, '../../TERMS_AND_CONDITIONS.md');
    
    if (!fs.existsSync(termsPath)) {
      return res.status(404).json({
        success: false,
        message: 'Términos y condiciones no encontrados'
      });
    }

    const termsContent = fs.readFileSync(termsPath, 'utf8');
    
    res.json({
      success: true,
      data: {
        content: termsContent,
        lastUpdated: '2025-01-10',
        version: '1.0'
      }
    });
  } catch (error) {
    console.error('Error obteniendo términos y condiciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Servir política de privacidad
exports.getPrivacyPolicy = (req, res) => {
  try {
    const privacyPath = path.join(__dirname, '../../PRIVACY_POLICY.md');
    
    if (!fs.existsSync(privacyPath)) {
      return res.status(404).json({
        success: false,
        message: 'Política de privacidad no encontrada'
      });
    }

    const privacyContent = fs.readFileSync(privacyPath, 'utf8');
    
    res.json({
      success: true,
      data: {
        content: privacyContent,
        lastUpdated: '2025-01-10',
        version: '1.0'
      }
    });
  } catch (error) {
    console.error('Error obteniendo política de privacidad:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Aceptar términos y condiciones (para tracking)
exports.acceptTermsAndConditions = (req, res) => {
  try {
    const { userId, ipAddress, userAgent } = req.body;
    
    // Aquí podrías guardar en la base de datos que el usuario aceptó los términos
    // Por ahora solo devolvemos éxito
    
    res.json({
      success: true,
      message: 'Términos y condiciones aceptados correctamente',
      data: {
        userId,
        acceptedAt: new Date().toISOString(),
        ipAddress,
        userAgent
      }
    });
  } catch (error) {
    console.error('Error aceptando términos y condiciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};
