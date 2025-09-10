const { sequelize } = require('../models');
const { User, Client } = require('../models');
const bcrypt = require('bcryptjs');
const xlsx = require('xlsx');
const path = require('path');

// Función para generar username único
const generateUsername = (name, documentNumber) => {
  const cleanName = name.toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 8);
  return `${cleanName}${documentNumber.substring(0, 4)}`;
};

// Función para generar contraseña temporal
const generateTempPassword = () => {
  return Math.random().toString(36).slice(-8);
};

// Función para mapear estado del cliente desde tu Excel
const mapClientStatus = (excelStatus) => {
  if (!excelStatus) return 'nuevo';
  
  const status = excelStatus.toLowerCase().trim();
  if (status.includes('antiguo') || status.includes('activo')) return 'activo';
  if (status.includes('nuevo')) return 'nuevo';
  if (status.includes('retomando') || status.includes('retomar')) return 'retomando';
  if (status.includes('inactivo')) return 'inactivo';
  
  return 'nuevo'; // Por defecto
};

// Función para determinar tipo de documento
const getDocumentType = (documentNumber) => {
  if (!documentNumber) return 'DNI';
  
  const doc = documentNumber.toString().trim();
  if (doc.length === 11) return 'RUC';
  if (doc.length === 8) return 'DNI';
  
  return 'DNI'; // Por defecto
};

const migrateCustomExcelClients = async (excelFilePath) => {
  try {
    console.log('🚀 Iniciando migración de clientes desde Excel personalizado...');
    console.log('================================================');
    
    // Verificar que el archivo existe
    if (!excelFilePath) {
      throw new Error('Debe proporcionar la ruta del archivo Excel');
    }
    
    const fullPath = path.resolve(excelFilePath);
    console.log(`📁 Leyendo archivo: ${fullPath}`);
    
    // Leer archivo Excel
    const workbook = xlsx.readFile(fullPath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(worksheet);
    
    console.log(`📊 Encontradas ${jsonData.length} filas en el archivo`);
    
    if (jsonData.length === 0) {
      console.log('⚠️ No hay datos para migrar');
      return;
    }
    
    // Mostrar estructura del archivo
    console.log('\n📋 Estructura del archivo:');
    console.log('Columnas encontradas:', Object.keys(jsonData[0]));
    
    console.log('\n🔄 Iniciando migración...');
    
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    const credentials = [];
    
    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      const rowNumber = i + 2; // +2 porque Excel empieza en 1 y la primera fila es header
      
      try {
        // Extraer datos del row usando los nombres exactos de tus columnas
        const name = row['NOMBRE COMPLETO O RAZON SOCIAL'] || row['NOMBRE COMPLETO O RAZÓN SOCIAL'];
        const documentNumber = String(row['DNI O RUC'] || '').trim();
        const phone = String(row['CELULAR'] || '').trim();
        const email = row['Dirección de correo electrónico'] || row['GMAIL'];
        const address = row['VIVIENDA (JIRON, AVENIDA, AA.HH)'];
        const district = row['Distrito'];
        const clientStatus = mapClientStatus(row['CLIENTE']);
        const recommendations = row['RECOMENDACIÓN'] || row['RECOMENDACIÓN PERSONAL'] || '';
        const notes = `Marca temporal: ${row['Marca temporal'] || 'N/A'}\n` +
                     `Recomendación: ${recommendations}\n` +
                     `Pago por delivery: ${row['SOLO PARA ESTUDIO DE MERCADO Y CAMBIOS EN SEPTIEMBRE, ¿ESTÁ USTED DISPUESTO A PAGAR POR EL DELIVERY?'] || 'N/A'}\n` +
                     `Autoriza contacto: ${row['NOS AUTORIZA USAR SU CONTACTO PARA PROPORCIONARLE O/Y OFRECERLE DESCUENTOS EN RECREOS TURÍSTICOS EN PUCALLPA Y VENTA DE LOTES EN CASHIBO'] || 'N/A'}`;
        
        // Validar campos obligatorios
        if (!name || !documentNumber) {
          throw new Error(`Fila ${rowNumber}: Nombre y número de documento son obligatorios`);
        }
        
        // Verificar si el cliente ya existe
        const existingClient = await Client.findOne({ where: { documentNumber } });
        if (existingClient) {
          console.log(`⚠️ Fila ${rowNumber}: Cliente con DNI/RUC ${documentNumber} ya existe, saltando...`);
          continue;
        }
        
        // Generar credenciales
        const username = generateUsername(name, documentNumber);
        const tempPassword = generateTempPassword();
        const documentType = getDocumentType(documentNumber);
        
        // Crear transacción para usuario y cliente
        const result = await sequelize.transaction(async (t) => {
          // Crear usuario
          const user = await User.create({
            username,
            email: email || `${username}@aguayara.com`,
            password: tempPassword,
            role: 'cliente',
            phone: phone || '',
            address: address || '',
            district: district || ''
          }, { transaction: t });
          
          // Crear cliente
          const client = await Client.create({
            name,
            documentType,
            documentNumber,
            address: address || '',
            district: district || '',
            phone: phone || '',
            email: email || `${username}@aguayara.com`,
            isCompany: documentType === 'RUC',
            hasCredit: true,
            creditLimit: 1000.00,
            currentDebt: 0.00,
            paymentDueDay: 30,
            active: true,
            userId: user.id,
            defaultDeliveryAddress: address || '',
            defaultContactPhone: phone || '',
            clientStatus,
            recommendations,
            notes,
            lastOrderDate: null,
            totalOrders: 0
          }, { transaction: t });
          
          return { user, client };
        });
        
        console.log(`✅ Fila ${rowNumber}: Cliente ${name} creado exitosamente`);
        console.log(`   📧 Email: ${result.user.email}`);
        console.log(`   👤 Usuario: ${result.user.username}`);
        console.log(`   🔑 Contraseña temporal: ${tempPassword}`);
        console.log(`   📊 Estado: ${clientStatus}`);
        console.log(`   📄 Tipo: ${documentType}`);
        
        // Guardar credenciales para reporte
        credentials.push({
          fila: rowNumber,
          nombre: name,
          documento: documentNumber,
          tipo: documentType,
          email: result.user.email,
          usuario: result.user.username,
          contraseña: tempPassword,
          estado: clientStatus
        });
        
        successCount++;
        
      } catch (error) {
        console.error(`❌ Fila ${rowNumber}: Error al crear cliente - ${error.message}`);
        errors.push(`Fila ${rowNumber}: ${error.message}`);
        errorCount++;
      }
    }
    
    console.log('\n🎉 ¡Migración completada!');
    console.log('================================================');
    console.log(`✅ Clientes creados exitosamente: ${successCount}`);
    console.log(`❌ Errores encontrados: ${errorCount}`);
    
    if (errors.length > 0) {
      console.log('\n📋 Errores detallados:');
      errors.forEach(error => console.log(`   - ${error}`));
    }
    
    // Mostrar resumen de credenciales
    if (credentials.length > 0) {
      console.log('\n🔑 CREDENCIALES GENERADAS:');
      console.log('================================================');
      credentials.forEach(cred => {
        console.log(`\n📋 Fila ${cred.fila}: ${cred.nombre}`);
        console.log(`   📄 ${cred.tipo}: ${cred.documento}`);
        console.log(`   📧 Email: ${cred.email}`);
        console.log(`   👤 Usuario: ${cred.usuario}`);
        console.log(`   🔑 Contraseña: ${cred.contraseña}`);
        console.log(`   📊 Estado: ${cred.estado}`);
      });
    }
    
    console.log('\n📝 Próximos pasos:');
    console.log('   1. Revisar los errores si los hay');
    console.log('   2. Los clientes pueden cambiar su contraseña en el primer login');
    console.log('   3. Verificar que los datos se importaron correctamente');
    console.log('   4. Guardar las credenciales generadas para comunicación con clientes');
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    throw error;
  } finally {
    await sequelize.close();
    console.log('\n🔌 Conexión a la base de datos cerrada');
  }
};

// Ejecutar si se llama directamente
if (require.main === module) {
  const excelFilePath = process.argv[2];
  
  if (!excelFilePath) {
    console.log('❌ Uso: node migrateCustomExcelClients.js <ruta_del_archivo_excel>');
    console.log('📝 Ejemplo: node migrateCustomExcelClients.js ./clientes.xlsx');
    process.exit(1);
  }
  
  migrateCustomExcelClients(excelFilePath)
    .then(() => {
      console.log('\n🎊 ¡Migración completada exitosamente!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Error en la migración:', error);
      process.exit(1);
    });
}

module.exports = migrateCustomExcelClients;
