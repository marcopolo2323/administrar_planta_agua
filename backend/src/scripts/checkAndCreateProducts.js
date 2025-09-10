const { Product } = require('../models');

const checkAndCreateProducts = async () => {
  try {
    console.log('🔍 Verificando productos en la base de datos...');
    console.log('==============================================');
    
    // Verificar si existen productos
    const existingProducts = await Product.findAll();
    
    if (existingProducts.length === 0) {
      console.log('❌ No se encontraron productos. Creando productos básicos...');
      
      const basicProducts = [
        {
          name: 'Bidón de Agua 20L',
          description: 'Bidón de agua purificada de 20 litros',
          price: 5.00,
          cost: 3.00,
          stock: 100,
          minStock: 10,
          category: 'Agua',
          unit: 'unidad',
          active: true,
          image: 'img_buyon.jpeg'
        },
        {
          name: 'Paquete de Botellas',
          description: 'Paquete de 6 botellas de agua de 500ml',
          price: 15.00,
          cost: 10.00,
          stock: 50,
          minStock: 5,
          category: 'Agua',
          unit: 'paquete',
          active: true,
          image: 'img_paquete_botellas.jpeg'
        }
      ];
      
      const createdProducts = await Product.bulkCreate(basicProducts);
      console.log(`✅ Productos creados: ${createdProducts.length}`);
      
      createdProducts.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name} - S/ ${product.price}`);
      });
      
    } else {
      console.log(`✅ Se encontraron ${existingProducts.length} productos:`);
      
      existingProducts.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name} - S/ ${product.price} - Stock: ${product.stock}`);
      });
    }
    
    console.log('\n🎉 ¡Verificación de productos completada!');
    
  } catch (error) {
    console.error('❌ Error verificando productos:', error);
    throw error;
  }
};

// Ejecutar si se llama directamente
if (require.main === module) {
  checkAndCreateProducts()
    .then(() => {
      console.log('\n🎊 ¡Proceso completado!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Error en el proceso:', error);
      process.exit(1);
    });
}

module.exports = checkAndCreateProducts;
