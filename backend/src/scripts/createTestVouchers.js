const { Voucher, Client, User, Product } = require('../models');
const sequelize = require('../config/database');

const createTestVouchers = async () => {
  try {
    console.log('🧪 Creando vales de prueba...');
    console.log('================================');
    
    // Buscar un cliente existente
    const client = await Client.findOne({
      include: [{ model: User, as: 'user' }],
      where: { active: true }
    });
    
    if (!client) {
      console.log('❌ No se encontró ningún cliente activo');
      return;
    }
    
    console.log(`👤 Cliente encontrado: ${client.name} (ID: ${client.id})`);
    
    // Buscar productos existentes
    const products = await Product.findAll({
      where: { active: true },
      limit: 2
    });
    
    if (products.length === 0) {
      console.log('❌ No se encontraron productos activos');
      return;
    }
    
    console.log(`📦 Productos encontrados: ${products.length}`);
    
    // Crear vales de prueba
    const testVouchers = [
      {
        clientId: client.id,
        deliveryPersonId: 1, // Asumir que existe un repartidor con ID 1
        productId: products[0].id,
        quantity: 2,
        unitPrice: 5.00,
        totalAmount: 10.00,
        notes: 'Vale de prueba - Bidón de agua',
        status: 'pending'
      },
      {
        clientId: client.id,
        deliveryPersonId: 1,
        productId: products[1]?.id || products[0].id,
        quantity: 1,
        unitPrice: 15.00,
        totalAmount: 15.00,
        notes: 'Vale de prueba - Paquete de botellas',
        status: 'pending'
      },
      {
        clientId: client.id,
        deliveryPersonId: 1,
        productId: products[0].id,
        quantity: 3,
        unitPrice: 5.00,
        totalAmount: 15.00,
        notes: 'Vale de prueba - Múltiples bidones',
        status: 'delivered'
      },
      {
        clientId: client.id,
        deliveryPersonId: 1,
        productId: products[1]?.id || products[0].id,
        quantity: 2,
        unitPrice: 15.00,
        totalAmount: 30.00,
        notes: 'Vale de prueba - Ya pagado',
        status: 'paid',
        paidAt: new Date()
      }
    ];
    
    // Crear los vales
    const createdVouchers = await Voucher.bulkCreate(testVouchers);
    
    console.log(`✅ Vales creados exitosamente: ${createdVouchers.length}`);
    
    // Mostrar resumen
    const vouchers = await Voucher.findAll({
      where: { clientId: client.id },
      include: [
        { model: Product, as: 'product', attributes: ['id', 'name'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    console.log('\n📋 Resumen de vales del cliente:');
    console.log('================================');
    
    vouchers.forEach((voucher, index) => {
      console.log(`${index + 1}. Vale ID: ${voucher.id}`);
      console.log(`   Producto: ${voucher.product?.name || 'N/A'}`);
      console.log(`   Cantidad: ${voucher.quantity}`);
      console.log(`   Precio Unit: S/ ${parseFloat(voucher.unitPrice).toFixed(2)}`);
      console.log(`   Total: S/ ${parseFloat(voucher.totalAmount).toFixed(2)}`);
      console.log(`   Estado: ${voucher.status}`);
      console.log(`   Fecha: ${voucher.createdAt.toLocaleDateString('es-PE')}`);
      console.log('');
    });
    
    // Estadísticas
    const pendingVouchers = vouchers.filter(v => v.status === 'pending');
    const totalPending = pendingVouchers.reduce((sum, v) => sum + parseFloat(v.totalAmount), 0);
    
    console.log('📊 Estadísticas:');
    console.log(`   Total de vales: ${vouchers.length}`);
    console.log(`   Vales pendientes: ${pendingVouchers.length}`);
    console.log(`   Total pendiente: S/ ${totalPending.toFixed(2)}`);
    console.log(`   Vales entregados: ${vouchers.filter(v => v.status === 'delivered').length}`);
    console.log(`   Vales pagados: ${vouchers.filter(v => v.status === 'paid').length}`);
    
    console.log('\n🎉 ¡Vales de prueba creados exitosamente!');
    console.log('Ahora puedes ver la tabla de vales en el dashboard del cliente.');
    
  } catch (error) {
    console.error('❌ Error creando vales de prueba:', error);
    throw error;
  }
};

// Ejecutar si se llama directamente
if (require.main === module) {
  createTestVouchers()
    .then(() => {
      console.log('\n🎊 ¡Proceso completado!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Error en el proceso:', error);
      process.exit(1);
    });
}

module.exports = createTestVouchers;
