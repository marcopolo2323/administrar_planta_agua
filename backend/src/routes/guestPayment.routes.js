const express = require('express');
const router = express.Router();
const { generatePDF } = require('../controllers/guestPayment.controller');

// Ruta para generar PDF de pedidos de invitados
router.post('/generate-pdf', generatePDF);

module.exports = router;
