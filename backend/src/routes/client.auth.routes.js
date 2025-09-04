const express = require('express');
const router = express.Router();
const clientAuthController = require('../controllers/client.auth.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

// Rutas públicas
router.post('/register', clientAuthController.registerClient);
router.post('/login', clientAuthController.loginClient);

// Rutas protegidas
router.get('/profile', verifyToken, clientAuthController.getClientProfile);
router.put('/profile', verifyToken, clientAuthController.updateClientProfile);

module.exports = router;