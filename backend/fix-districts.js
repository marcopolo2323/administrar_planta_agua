const { sequelize } = require('./src/models');
const fs = require('fs');
const path = require('path');

async function fixDistricts() {
  try {
    console.log('🔧 Iniciando corrección de distritos...');
    
    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conectado a la base de datos');
    
    // Leer el archivo JSON
    const jsonPath = path.join(__dirname, 'data/clientes.json');
    const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    console.log(`📊 Datos leídos: ${jsonData.length} registros`);
    
    // Crear un mapa de DNI/RUC a distrito
    const distritoMap = new Map();
    jsonData.forEach(cliente => {
      const documento = cliente['DNI O RUC'] ? String(cliente['DNI O RUC']) : '';
      const distrito = (cliente['Distrito '] || '').trim();
      if (documento && distrito) {
        distritoMap.set(documento, distrito);
      }
    });
    
    console.log(`🗺️ Mapa de distritos creado: ${distritoMap.size} entradas`);
    
    // Actualizar clientes en la base de datos
    const Client = require('./src/models/client.model');
    const clientes = await Client.findAll();
    
    let actualizados = 0;
    for (const cliente of clientes) {
      if (distritoMap.has(cliente.documentNumber)) {
        const distrito = distritoMap.get(cliente.documentNumber);
        if (cliente.district !== distrito) {
          await cliente.update({ district: distrito });
          actualizados++;
          console.log(`✅ Actualizado: ${cliente.name} - ${distrito}`);
        }
      }
    }
    
    console.log(`\n🎉 Corrección completada: ${actualizados} clientes actualizados`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

fixDistricts();
