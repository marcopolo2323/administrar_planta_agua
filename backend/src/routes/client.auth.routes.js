const express = require('express');
const router = express.Router();
const clientAuthController = require('../controllers/client.auth.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

// Rutas públicas
router.post('/register', clientAuthController.registerClient);
router.post('/login', clientAuthController.loginClient);

// Rutas protegidas
router.get('/profile', authMiddleware, clientAuthController.getClientProfile);
router.put('/profile', authMiddleware, clientAuthController.updateClientProfile);

module.exports = router;