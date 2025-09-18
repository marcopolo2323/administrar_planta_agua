const { sequelize, District } = require('../models');

const seedDistricts = async () => {
  try {
    console.log('🌍 Poblando tabla de distritos...');

    // Verificar si ya existen distritos
    const existingDistricts = await District.count();
    if (existingDistricts > 0) {
      console.log('✅ Los distritos ya existen');
      return;
    }

    const districts = [
      { name: 'Manantay', deliveryFee: 0.00 },
      { name: 'Yarinacocha', deliveryFee: 0.00 },
      { name: 'Calleria', deliveryFee: 0.00 },
      { name: 'San Jose', deliveryFee: 0.00 },
      { name: 'Cashibo', deliveryFee: 0.00 },
    ];

    await District.bulkCreate(districts);
    console.log(`✅ ${districts.length} distritos creados exitosamente`);

  } catch (error) {
    console.error('❌ Error al poblar distritos:', error);
  }
};

// Ejecutar si se llama directamente
if (require.main === module) {
  seedDistricts()
    .then(() => {
      console.log('🎉 Poblado de distritos completado');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Error:', error);
      process.exit(1);
    });
}

module.exports = seedDistricts;
