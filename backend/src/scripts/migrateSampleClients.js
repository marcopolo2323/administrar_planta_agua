const { Client, sequelize } = require('../models');

async function migrateSampleClients() {
  try {
    console.log('🔄 Iniciando migración de clientes de muestra...');

    // Datos de ejemplo basados en lo que proporcionaste
    const sampleClients = [
      {
        name: 'Corporación YASHIMITSU sac',
        documentType: 'RUC',
        documentNumber: '20606719596',
        address: 'Jr 2 de mayo 1150',
        district: 'YARINACOCHA',
        phone: '942658541',
        email: 'yashichirusbel@gmail.com',
        isCompany: true,
        hasCredit: true,
        creditLimit: 200,
        active: true,
        clientStatus: 'activo',
        recommendations: 'MEJORAR EL SERVICIO DE DELIVERY MUY TARDE',
        notes: 'Coordinen mejor el horario de entrega',
        paymentDueDay: 30
      }
      // Aquí puedes agregar más clientes siguiendo el mismo formato
    ];

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    for (let i = 0; i < sampleClients.length; i++) {
      const clientData = sampleClients[i];
      
      try {
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
        console.log(`❌ Error en cliente ${i + 1}: ${error.message}`);
        errorCount++;
        errors.push(`Cliente ${i + 1}: ${error.message}`);
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

// Ejecutar la migración
migrateSampleClients();
