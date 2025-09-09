const { Client, sequelize } = require('../models');
const fs = require('fs');
const path = require('path');

async function migrateCSVClients() {
  try {
    console.log('🔄 Iniciando migración de clientes desde CSV...');

    // Ruta del archivo CSV (ajusta la ruta según donde tengas el archivo)
    const csvFilePath = path.join(__dirname, '../../data/clientes_frecuentes.csv');
    
    // Leer el archivo CSV
    console.log('📖 Leyendo archivo CSV...');
    const csvContent = fs.readFileSync(csvFilePath, 'utf8');
    
    // Dividir en líneas y procesar
    const lines = csvContent.split('\n');
    const headers = lines[0].split('\t'); // Usar tab como separador
    
    console.log('📋 Headers encontrados:', headers);
    
    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    // Procesar cada línea (saltando el header)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue; // Saltar líneas vacías
      
      try {
        const values = line.split('\t');
        
        // Crear objeto con los datos de la fila
        const rowData = {};
        headers.forEach((header, index) => {
          rowData[header.trim()] = values[index] ? values[index].trim() : '';
        });

        // Mapear los datos del CSV a nuestro modelo
        const clientData = {
          name: rowData['NOMBRE COMPLETO O RAZON SOCIAL'] || '',
          documentType: rowData['DNI O RUC'] ? (rowData['DNI O RUC'].length === 11 ? 'DNI' : 'RUC') : 'DNI',
          documentNumber: rowData['DNI O RUC'] || '',
          address: rowData['VIVIENDA (JIRON, AVENIDA, AA.HH)'] || '',
          district: rowData['Distrito'] || '',
          phone: rowData['CELULAR'] || '',
          email: rowData['Dirección de correo electrónico'] || rowData['GMAIL'] || '',
          isCompany: rowData['DNI O RUC'] ? rowData['DNI O RUC'].length > 11 : false,
          hasCredit: true, // Asumimos que todos los clientes frecuentes tienen crédito
          creditLimit: 100, // Límite por defecto
          active: true,
          clientStatus: mapClientStatus(rowData['CLIENTE']),
          recommendations: rowData['RECOMENDACIÓN'] || '',
          notes: rowData['RECOMENDACIÓN PERSONAL'] || '',
          paymentDueDay: 30 // Día de pago por defecto
        };

        // Validar datos requeridos
        if (!clientData.name || !clientData.documentNumber) {
          console.log(`⚠️  Fila ${i + 1}: Faltan datos requeridos (nombre o documento)`);
          errorCount++;
          errors.push(`Fila ${i + 1}: Faltan datos requeridos`);
          continue;
        }

        // Verificar si el cliente ya existe
        const existingClient = await Client.findOne({
          where: { documentNumber: clientData.documentNumber }
        });

        if (existingClient) {
          console.log(`⚠️  Cliente ya existe: ${clientData.name} (${clientData.documentNumber})`);
          errorCount++;
          errors.push(`Cliente ya existe: ${clientData.name}`);
          continue;
        }

        // Crear el cliente
        const client = await Client.create(clientData);
        console.log(`✅ Cliente creado: ${client.name} (${client.documentNumber})`);
        successCount++;

      } catch (error) {
        console.log(`❌ Error en fila ${i + 1}: ${error.message}`);
        errorCount++;
        errors.push(`Fila ${i + 1}: ${error.message}`);
      }
    }

    console.log('\n📊 RESUMEN DE MIGRACIÓN:');
    console.log(`✅ Clientes creados exitosamente: ${successCount}`);
    console.log(`❌ Errores: ${errorCount}`);
    
    if (errors.length > 0) {
      console.log('\n🔍 ERRORES DETALLADOS:');
      errors.forEach(error => console.log(`  - ${error}`));
    }

    console.log('\n🎉 Migración completada!');

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
  } finally {
    await sequelize.close();
  }
}

function mapClientStatus(clientType) {
  if (!clientType) return 'nuevo';
  
  const type = clientType.toLowerCase();
  if (type.includes('antiguo') && type.includes('activo')) {
    return 'activo';
  } else if (type.includes('nuevo')) {
    return 'nuevo';
  } else if (type.includes('inactivo')) {
    return 'inactivo';
  } else {
    return 'nuevo';
  }
}

// Ejecutar la migración
migrateCSVClients();
