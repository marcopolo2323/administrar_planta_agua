const { sequelize, District } = require('../models');

const syncDistricts = async () => {
  try {
    console.log('🔄 Sincronizando tabla de distritos...');
    
    // Sincronizar solo la tabla de distritos
    await District.sync({ force: false });
    console.log('✅ Tabla de distritos sincronizada');
    
    // Verificar si ya existen distritos
    const existingDistricts = await District.count();
    if (existingDistricts > 0) {
      console.log('✅ Los distritos ya existen');
      return;
    }

    const districts = [
      { name: 'Miraflores', deliveryFee: 5.00 },
      { name: 'San Isidro', deliveryFee: 5.00 },
      { name: 'Lima', deliveryFee: 3.00 },
      { name: 'La Molina', deliveryFee: 6.00 },
      { name: 'Surco', deliveryFee: 4.00 },
      { name: 'San Borja', deliveryFee: 4.50 },
      { name: 'Jesús María', deliveryFee: 4.00 },
      { name: 'Magdalena', deliveryFee: 4.00 },
      { name: 'Pueblo Libre', deliveryFee: 3.50 },
      { name: 'Breña', deliveryFee: 3.00 },
      { name: 'La Victoria', deliveryFee: 3.50 },
      { name: 'Lince', deliveryFee: 3.50 },
      { name: 'San Miguel', deliveryFee: 4.00 },
      { name: 'Callao', deliveryFee: 5.00 },
      { name: 'Bellavista', deliveryFee: 5.50 },
      { name: 'Ventanilla', deliveryFee: 6.00 },
      { name: 'Carmen de la Legua', deliveryFee: 5.00 },
      { name: 'La Perla', deliveryFee: 4.50 },
      { name: 'Villa El Salvador', deliveryFee: 7.00 },
      { name: 'San Juan de Miraflores', deliveryFee: 6.50 },
      { name: 'Villa María del Triunfo', deliveryFee: 6.00 },
      { name: 'Chorrillos', deliveryFee: 5.50 },
      { name: 'Barranco', deliveryFee: 5.00 },
      { name: 'Surquillo', deliveryFee: 4.00 },
      { name: 'San Luis', deliveryFee: 4.50 },
      { name: 'Independencia', deliveryFee: 4.00 },
      { name: 'Rímac', deliveryFee: 3.50 },
      { name: 'Los Olivos', deliveryFee: 5.50 },
      { name: 'San Martín de Porres', deliveryFee: 5.00 },
      { name: 'Comas', deliveryFee: 5.50 },
      { name: 'Carabayllo', deliveryFee: 6.00 },
      { name: 'Santa Rosa', deliveryFee: 6.50 },
      { name: 'Ancón', deliveryFee: 7.00 },
      { name: 'Puente Piedra', deliveryFee: 6.00 },
      { name: 'Santa Anita', deliveryFee: 5.00 },
      { name: 'Ate', deliveryFee: 5.50 },
      { name: 'El Agustino', deliveryFee: 4.00 },
      { name: 'San Juan de Lurigancho', deliveryFee: 6.00 },
      { name: 'Lurigancho', deliveryFee: 6.50 },
      { name: 'Cieneguilla', deliveryFee: 8.00 },
      { name: 'Pachacámac', deliveryFee: 7.50 },
      { name: 'Pucusana', deliveryFee: 10.00 },
      { name: 'San Bartolo', deliveryFee: 9.00 },
      { name: 'Santa María del Mar', deliveryFee: 9.50 },
      { name: 'Punta Hermosa', deliveryFee: 10.00 },
      { name: 'Punta Negra', deliveryFee: 9.50 },
      { name: 'San Antonio', deliveryFee: 9.00 }
    ];

    await District.bulkCreate(districts);
    console.log(`✅ ${districts.length} distritos creados exitosamente`);

  } catch (error) {
    console.error('❌ Error al sincronizar distritos:', error);
  }
};

// Ejecutar si se llama directamente
if (require.main === module) {
  syncDistricts()
    .then(() => {
      console.log('🎉 Sincronización de distritos completada');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Error:', error);
      process.exit(1);
    });
}

module.exports = syncDistricts;
