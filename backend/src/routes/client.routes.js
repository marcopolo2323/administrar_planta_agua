const express = require('express');
const router = express.Router();
const clientController = require('../controllers/client.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

// Rutas públicas (requieren autenticación pero no admin)
router.get('/', verifyToken, clientController.getAllClients);
router.get('/document/:documentNumber', clientController.findClientByDocument); // Ruta pública para buscar cliente por documento
router.get('/search', verifyToken, clientController.searchClients);
router.get('/:id', verifyToken, clientController.getClientById);

// Rutas protegidas (requieren rol de admin)
router.post('/', verifyToken, clientController.createClient);
router.put('/:id', verifyToken, clientController.updateClient);
router.delete('/:id', [verifyToken, isAdmin], clientController.deleteClient);

module.exports = router;