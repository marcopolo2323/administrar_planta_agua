const express = require('express');
const router = express.Router();
const { fixForeignKeys } = require('../scripts/fixForeignKeys');
const { addPaymentTypeColumn } = require('../scripts/addPaymentTypeColumn');

// Endpoint para sincronización manual
router.post('/fix-foreign-keys', async (req, res) => {
  try {
    console.log('🔧 Iniciando reparación de foreign keys...');
    await fixForeignKeys();
    res.json({ success: true, message: 'Foreign keys reparadas exitosamente' });
  } catch (error) {
    console.error('❌ Error reparando foreign keys:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint para agregar columna paymentType
router.post('/add-payment-type', async (req, res) => {
  try {
    console.log('🔧 Agregando columna paymentType...');
    await addPaymentTypeColumn();
    res.json({ success: true, message: 'Columna paymentType agregada exitosamente' });
  } catch (error) {
    console.error('❌ Error agregando paymentType:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint para sincronización completa
router.post('/full-sync', async (req, res) => {
  try {
    console.log('🔄 Iniciando sincronización completa...');
    await fixForeignKeys();
    await addPaymentTypeColumn();
    res.json({ success: true, message: 'Sincronización completa exitosa' });
  } catch (error) {
    console.error('❌ Error en sincronización completa:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
