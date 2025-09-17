const Client = require('../models/client.model');
const path = require('path');

const importClientsFromJson = async () => {
  try {
    console.log('📥 Iniciando importación de clientes desde JSON...');
    
    // Leer el archivo JSON
    const jsonPath = path.join(__dirname, '../../data/clientes.json');
    const fs = require('fs');
    
    if (!fs.existsSync(jsonPath)) {
      throw new Error('Archivo clientes.json no encontrado');
    }
    
    const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    console.log(`📊 Datos leídos: ${jsonData.length} registros`);
    
    // Mapear los datos del Excel a la estructura de la base de datos
    const clientesMapeados = jsonData.map((cliente, index) => {
      // Limpiar y formatear datos
      const nombre = (cliente['NOMBRE COMPLETO O RAZON SOCIAL'] || '').trim();
      const email = (cliente['Dirección de correo electrónico'] || cliente['GMAIL'] || '').trim().toLowerCase();
      const telefono = cliente['CELULAR'] ? String(cliente['CELULAR']).replace(/\D/g, '') : '';
      const documento = cliente['DNI O RUC'] ? String(cliente['DNI O RUC']) : '';
      const direccion = (cliente['VIVIENDA (JIRON, AVENIDA, AA.HH)'] || '').trim();
      const distrito = (cliente['Distrito '] || '').trim();
      const recomendacion = (cliente['RECOMENDACIÓN PERSONAL'] || '').trim();
      const esActivo = cliente['CLIENTE'] === 'ANTIGUO / ACTIVO';
      
      // Determinar tipo de documento
      const documentType = documento.length === 11 ? 'RUC' : 'DNI';
      
      // Generar email si no existe
      const emailFinal = email || `cliente${index + 1}@example.com`;
      
      // Generar teléfono si no existe
      const telefonoFinal = telefono || `9${String(index + 1).padStart(8, '0')}`;
      
      return {
        name: nombre || `Cliente ${index + 1}`,
        documentType: documentType,
        documentNumber: documento || `${String(index + 1).padStart(8, '0')}`,
        address: direccion || `Dirección ${index + 1}`,
        district: distrito || 'Callería',
        phone: telefonoFinal,
        email: emailFinal,
        notes: recomendacion || 'Cliente importado desde Excel',
        active: true,
        lastOrderDate: esActivo ? new Date() : null,
        totalOrders: esActivo ? Math.floor(Math.random() * 10) + 1 : 0
      };
    });
    
    console.log('🔄 Mapeando datos...');
    console.log(`📝 Ejemplo de cliente mapeado:`, JSON.stringify(clientesMapeados[0], null, 2));
    
    // Insertar en la base de datos
    console.log('💾 Insertando clientes en la base de datos...');
    const clientesCreados = await Client.bulkCreate(clientesMapeados, {
      ignoreDuplicates: true,
      validate: true
    });
    
    console.log(`✅ Clientes importados exitosamente: ${clientesCreados.length}`);
    
    // Estadísticas
    const stats = {
      total: clientesMapeados.length,
      creados: clientesCreados.length,
      activos: clientesMapeados.filter(c => c.clientStatus === 'activo').length,
      empresas: clientesMapeados.filter(c => c.isCompany).length,
      conCredito: clientesMapeados.filter(c => c.hasCredit).length
    };
    
    console.log('📊 Estadísticas de importación:');
    console.log(`   Total procesados: ${stats.total}`);
    console.log(`   Creados exitosamente: ${stats.creados}`);
    console.log(`   Clientes activos: ${stats.activos}`);
    console.log(`   Empresas: ${stats.empresas}`);
    console.log(`   Con crédito: ${stats.conCredito}`);
    
    return {
      success: true,
      stats: stats,
      data: clientesCreados
    };
    
  } catch (error) {
    console.error('❌ Error al importar clientes desde JSON:', error);
    return {
      success: false,
      error: error.message,
      stats: { total: 0, creados: 0 }
    };
  }
};

// Ejecutar si se llama directamente
if (require.main === module) {
  importClientsFromJson()
    .then((result) => {
      if (result.success) {
        console.log('✅ Importación completada exitosamente');
        process.exit(0);
      } else {
        console.error('❌ Error en la importación:', result.error);
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('💥 Error fatal:', error);
      process.exit(1);
    });
}

module.exports = importClientsFromJson;