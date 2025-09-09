const { Client, sequelize } = require('../models');
const xlsx = require('xlsx');
const path = require('path');

async function migrateExcelClients() {
  try {
    console.log('🔄 Iniciando migración de clientes desde Excel...');

    // Ruta del archivo Excel (ajusta la ruta según donde tengas el archivo)
    const excelFilePath = path.join(__dirname, '../../data/clientes_frecuentes.xlsx');
    
    // Leer el archivo Excel
    console.log('📖 Leyendo archivo Excel...');
    const workbook = xlsx.readFile(excelFilePath);
    const sheetName = workbook.SheetNames[0]; // Primera hoja
    const worksheet = workbook.Sheets[sheetName];
    
    // Convertir a JSON
    const jsonData = xlsx.utils.sheet_to_json(worksheet);
    
    console.log(`📊 Encontrados ${jsonData.length} registros en el Excel`);

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      
      try {
        // Mapear los datos del Excel a nuestro modelo
        const clientData = {
          name: row['NOMBRE COMPLETO O RAZON SOCIAL'] || '',
          documentType: row['DNI O RUC'] ? (row['DNI O RUC'].length === 11 ? 'DNI' : 'RUC') : 'DNI',
          documentNumber: row['DNI O RUC'] || '',
          address: row['VIVIENDA (JIRON, AVENIDA, AA.HH)'] || '',
          district: row['Distrito'] || '',
          phone: row['CELULAR'] || '',
          email: row['Dirección de correo electrónico'] || row['GMAIL'] || '',
          isCompany: row['DNI O RUC'] ? row['DNI O RUC'].length > 11 : false,
          hasCredit: true, // Asumimos que todos los clientes frecuentes tienen crédito
          creditLimit: 100, // Límite por defecto
          active: true,
          clientStatus: mapClientStatus(row['CLIENTE']),
          recommendations: row['RECOMENDACIÓN'] || '',
          notes: row['RECOMENDACIÓN PERSONAL'] || '',
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
migrateExcelClients();
