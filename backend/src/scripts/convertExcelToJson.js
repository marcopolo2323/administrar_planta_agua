const XLSX = require('xlsx');
const path = require('path');

// Convertir Excel a JSON
const convertExcelToJson = () => {
  try {
    // Ruta del archivo Excel
    const excelPath = path.join(__dirname, '../../data/db_clientes.xlsx');
    
    // Leer el archivo Excel
    const workbook = XLSX.readFile(excelPath);
    
    // Obtener el nombre de la primera hoja
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convertir a JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    
    console.log('📊 Datos del Excel convertidos:');
    console.log(`Total de registros: ${jsonData.length}`);
    console.log('Primeros 3 registros:');
    console.log(JSON.stringify(jsonData.slice(0, 3), null, 2));
    
    // Guardar como JSON
    const jsonPath = path.join(__dirname, '../../data/clientes.json');
    require('fs').writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2));
    
    console.log(`✅ Archivo JSON guardado en: ${jsonPath}`);
    
    return jsonData;
  } catch (error) {
    console.error('❌ Error al convertir Excel a JSON:', error);
    return null;
  }
};

// Ejecutar si se llama directamente
if (require.main === module) {
  convertExcelToJson();
}

module.exports = convertExcelToJson;
