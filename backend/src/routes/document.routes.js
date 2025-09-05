const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs-extra');
const { authMiddleware } = require('../middlewares/auth.middleware');

// Ruta pública para servir documentos PDF generados (sin autenticación)
router.get('/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const documentsDir = path.join(__dirname, '..', '..', 'documents');
    const filePath = path.join(documentsDir, filename);
    
    // Verificar que el archivo existe
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Documento no encontrado' });
    }
    
    // Verificar que el archivo es un PDF
    if (!filename.endsWith('.pdf')) {
      return res.status(400).json({ message: 'Formato de archivo no válido' });
    }
    
    // Servir el archivo
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Error al servir el documento:', error);
    res.status(500).json({ message: 'Error al servir el documento' });
  }
});

// Ruta protegida para listar documentos disponibles (solo para usuarios autenticados)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const documentsDir = path.join(__dirname, '..', '..', 'documents');
    const files = await fs.readdir(documentsDir);
    const pdfFiles = files.filter(file => file.endsWith('.pdf'));
    
    res.json({
      documents: pdfFiles.map(file => ({
        filename: file,
        url: `${req.protocol}://${req.get('host')}/api/documents/${file}`
      }))
    });
  } catch (error) {
    console.error('Error al listar documentos:', error);
    res.status(500).json({ message: 'Error al listar documentos' });
  }
});

module.exports = router;