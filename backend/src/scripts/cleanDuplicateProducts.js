const { sequelize } = require('../config/database');
const { GuestOrder, GuestOrderProduct, Voucher } = require('../models');

async function cleanDuplicateProducts() {
  try {
    console.log('🧹 Iniciando limpieza de productos duplicados...');
    
    // Obtener todos los pedidos
    const orders = await GuestOrder.findAll({
      include: [
        {
          model: GuestOrderProduct,
          as: 'products'
        }
      ]
    });
    
    console.log(`📊 Encontrados ${orders.length} pedidos`);
    
    for (const order of orders) {
      console.log(`\n🔍 Procesando pedido #${order.id}...`);
      
      if (order.products && order.products.length > 0) {
        console.log(`  - Productos actuales: ${order.products.length}`);
        
        // Agrupar productos por productId y precio
        const productGroups = {};
        order.products.forEach(product => {
          const key = `${product.productId}-${product.price}`;
          if (!productGroups[key]) {
            productGroups[key] = [];
          }
          productGroups[key].push(product);
        });
        
        console.log(`  - Grupos únicos: ${Object.keys(productGroups).length}`);
        
        // Para cada grupo, mantener solo el primer producto y eliminar duplicados
        for (const [key, products] of Object.entries(productGroups)) {
          if (products.length > 1) {
            console.log(`  - Eliminando ${products.length - 1} duplicados del grupo ${key}`);
            
            // Mantener el primer producto, eliminar el resto
            const toKeep = products[0];
            const toDelete = products.slice(1);
            
            for (const duplicate of toDelete) {
              await GuestOrderProduct.destroy({
                where: { id: duplicate.id }
              });
              console.log(`    - Eliminado producto duplicado ID: ${duplicate.id}`);
            }
          }
        }
      }
    }
    
    console.log('\n✅ Limpieza completada');
    
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  cleanDuplicateProducts();
}

module.exports = cleanDuplicateProducts;
