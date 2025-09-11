const express = require('express');
const router = express.Router();
const documentController = require('../controllers/document.controller');
const { authMiddleware, requireRole } = require('../middlewares/auth.middleware');

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware);

// Aplicar middleware de rol de administrador a todas las rutas
router.use(requireRole(['admin']));

// Obtener todos los documentos
router.get('/', documentController.getAllDocuments);

// Obtener estadísticas de documentos
router.get('/stats', documentController.getDocumentStats);

// Descargar un documento específico
router.get('/download/:filename', documentController.downloadDocument);

// Generar documento para un pedido existente
router.post('/generate', documentController.generateDocumentForOrder);

// Eliminar un documento
router.delete('/:filename', documentController.deleteDocument);

module.exports = router;