const { sequelize } = require('../config/database');
const { Order, GuestOrder, User, DeliveryPerson } = require('../models');

async function checkDeliveryAssignments() {
  try {
    console.log('🔍 Verificando asignaciones de repartidores...\n');

    // Verificar usuarios repartidores
    const deliveryPersons = await DeliveryPerson.findAll({
      include: [{
        model: User,
        attributes: ['id', 'username', 'email']
      }]
    });

    console.log('📋 Repartidores encontrados:');
    deliveryPersons.forEach(dp => {
      console.log(`  - ID: ${dp.id}, Usuario ID: ${dp.userId}, Nombre: ${dp.User?.username}`);
    });

    // Verificar pedidos regulares asignados
    const regularOrders = await Order.findAll({
      where: {
        deliveryPersonId: { [require('sequelize').Op.ne]: null }
      },
      include: [{
        model: DeliveryPerson,
        include: [{
          model: User,
          attributes: ['username']
        }]
      }],
      attributes: ['id', 'deliveryPersonId', 'status', 'total', 'createdAt']
    });

    console.log('\n📦 Pedidos regulares asignados:');
    if (regularOrders.length === 0) {
      console.log('  ❌ No hay pedidos regulares asignados');
    } else {
      regularOrders.forEach(order => {
        console.log(`  - Pedido ID: ${order.id}, Repartidor: ${order.DeliveryPerson?.User?.username || 'No encontrado'}, Estado: ${order.status}, Total: ${order.total}`);
      });
    }

    // Verificar pedidos de invitados asignados
    const guestOrders = await GuestOrder.findAll({
      where: {
        deliveryPersonId: { [require('sequelize').Op.ne]: null }
      },
      include: [{
        model: User,
        as: 'DeliveryPerson',
        attributes: ['username']
      }],
      attributes: ['id', 'deliveryPersonId', 'status', 'totalAmount', 'createdAt']
    });

    console.log('\n📦 Pedidos de invitados asignados:');
    if (guestOrders.length === 0) {
      console.log('  ❌ No hay pedidos de invitados asignados');
    } else {
      guestOrders.forEach(order => {
        console.log(`  - Pedido ID: ${order.id}, Repartidor: ${order.DeliveryPerson?.username || 'No encontrado'}, Estado: ${order.status}, Total: ${order.totalAmount}`);
      });
    }

    // Verificar específicamente Franco Escamilla (ID 3)
    console.log('\n👤 Verificando Franco Escamilla (Usuario ID 3):');
    
    const francoRegularOrders = await Order.findAll({
      where: { deliveryPersonId: 3 },
      attributes: ['id', 'status', 'total', 'createdAt']
    });

    const francoGuestOrders = await GuestOrder.findAll({
      where: { deliveryPersonId: 3 },
      attributes: ['id', 'status', 'totalAmount', 'createdAt']
    });

    console.log(`  📦 Pedidos regulares: ${francoRegularOrders.length}`);
    francoRegularOrders.forEach(order => {
      console.log(`    - ID: ${order.id}, Estado: ${order.status}, Total: ${order.total}`);
    });

    console.log(`  📦 Pedidos de invitados: ${francoGuestOrders.length}`);
    francoGuestOrders.forEach(order => {
      console.log(`    - ID: ${order.id}, Estado: ${order.status}, Total: ${order.totalAmount}`);
    });

    // Verificar todos los pedidos sin asignar
    const unassignedRegularOrders = await Order.findAll({
      where: { deliveryPersonId: null },
      attributes: ['id', 'status', 'total', 'createdAt']
    });

    const unassignedGuestOrders = await GuestOrder.findAll({
      where: { deliveryPersonId: null },
      attributes: ['id', 'status', 'totalAmount', 'createdAt']
    });

    console.log('\n❓ Pedidos sin asignar:');
    console.log(`  📦 Pedidos regulares: ${unassignedRegularOrders.length}`);
    console.log(`  📦 Pedidos de invitados: ${unassignedGuestOrders.length}`);

    if (unassignedRegularOrders.length > 0) {
      console.log('  Pedidos regulares sin asignar:');
      unassignedRegularOrders.forEach(order => {
        console.log(`    - ID: ${order.id}, Estado: ${order.status}, Total: ${order.total}`);
      });
    }

    if (unassignedGuestOrders.length > 0) {
      console.log('  Pedidos de invitados sin asignar:');
      unassignedGuestOrders.forEach(order => {
        console.log(`    - ID: ${order.id}, Estado: ${order.status}, Total: ${order.totalAmount}`);
      });
    }

  } catch (error) {
    console.error('❌ Error al verificar asignaciones:', error);
  } finally {
    await sequelize.close();
  }
}

checkDeliveryAssignments();
