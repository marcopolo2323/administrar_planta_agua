const express = require('express');
const router = express.Router();
const clientController = require('../controllers/client.controller');
const { authMiddleware, requireAdmin } = require('../middlewares/auth.middleware');

// Rutas públicas (requieren autenticación pero no admin)
router.get('/', clientController.getAllClients); // Ruta pública para el dashboard
router.get('/document/:documentNumber', clientController.findClientByDocument); // Ruta pública para buscar cliente por documento
router.get('/search', authMiddleware, clientController.searchClients);
router.get('/:id', authMiddleware, clientController.getClientById);

// Rutas protegidas (requieren rol de admin)
router.post('/', clientController.createClient); // Ruta pública para registro de clientes
router.put('/:id', authMiddleware, clientController.updateClient);
router.delete('/:id', [authMiddleware, requireAdmin], clientController.deleteClient);

module.exports = router;