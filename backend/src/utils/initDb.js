const { sequelize } = require('../models');
const User = require('../models/user.model');
const Product = require('../models/product.model');

async function initDatabase() {
  try {
    // Sincronizar modelos con la base de datos
    await sequelize.sync({ force: true });
    console.log('Base de datos sincronizada correctamente');

    // Crear usuario administrador por defecto
    await User.create({
      username: 'admin',
      email: 'admin@aguapura.com',
      password: 'admin123',
      role: 'admin'
    });
    console.log('Usuario administrador creado correctamente');

    // Crear productos por defecto
    await Product.bulkCreate([
      {
        name: 'Paquete de Botellas 650ml',
        description: 'Paquete de 20 unidades de botellas de agua de 650ml',
        type: 'botella',
        unitPrice: 10.00,
        wholesalePrice: 9.00,
        wholesaleMinQuantity: 50,
        stock: 100
      },
      {
        name: 'Bidón 20L',
        description: 'Bidón de agua de 20 litros',
        type: 'bidon',
        unitPrice: 7.00,
        wholesalePrice: 5.00,
        wholesaleMinQuantity: 2,
        stock: 50
      }
    ]);
    console.log('Productos creados correctamente');

    console.log('Inicialización completada con éxito');
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
  } finally {
    process.exit(0);
  }
}

initDatabase();