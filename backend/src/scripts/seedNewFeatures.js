const { sequelize } = require('../models');

const seedNewFeatures = async () => {
  try {
    console.log('Cargando datos de las nuevas funcionalidades...');
    
    const { GuestOrder, GuestOrderProduct, DeliveryFee, DeliveryPerson, Product } = require('../models');
    
    // Obtener productos existentes
    const products = await Product.findAll();
    if (products.length === 0) {
      console.log('❌ No hay productos en la base de datos. Ejecuta el seed completo primero.');
      return;
    }
    
    // Crear tarifas de envío
    const existingDeliveryFees = await DeliveryFee.findAll();
    if (existingDeliveryFees.length === 0) {
      await DeliveryFee.bulkCreate([
        {
          name: 'Envío Estándar',
          description: 'Envío estándar dentro de la ciudad',
          basePrice: 5.00,
          pricePerKm: 0.50,
          minOrderAmount: 20.00,
          maxDistance: 15.0,
          isActive: true
        },
        {
          name: 'Envío Express',
          description: 'Envío rápido en menos de 2 horas',
          basePrice: 8.00,
          pricePerKm: 0.80,
          minOrderAmount: 30.00,
          maxDistance: 10.0,
          isActive: true
        },
        {
          name: 'Envío Gratis',
          description: 'Envío gratuito para pedidos mayores a S/50',
          basePrice: 0.00,
          pricePerKm: 0.00,
          minOrderAmount: 50.00,
          maxDistance: 20.0,
          isActive: true
        }
      ]);
      console.log('✅ Tarifas de envío creadas');
    } else {
      console.log('✅ Tarifas de envío ya existen');
    }
    
    // Crear repartidores
    const existingDeliveryPersons = await DeliveryPerson.findAll();
    if (existingDeliveryPersons.length === 0) {
      await DeliveryPerson.bulkCreate([
        {
          name: 'Carlos Rodríguez',
          phone: '987123456',
          email: 'carlos.rodriguez@aguapura.com',
          address: 'Av. Los Álamos 456, San Borja',
          vehicleType: 'motorcycle',
          vehiclePlate: 'ABC-123',
          status: 'available',
          notes: 'Repartidor experimentado'
        },
        {
          name: 'Ana Martínez',
          phone: '912345678',
          email: 'ana.martinez@aguapura.com',
          address: 'Jr. Las Palmeras 789, Miraflores',
          vehicleType: 'car',
          vehiclePlate: 'XYZ-789',
          status: 'available',
          notes: 'Repartidora con experiencia en entregas express'
        }
      ]);
      console.log('✅ Repartidores creados');
    } else {
      console.log('✅ Repartidores ya existen');
    }
    
    // Crear pedidos de invitados
    const existingGuestOrders = await GuestOrder.findAll();
    if (existingGuestOrders.length === 0) {
      const guestOrder1 = await GuestOrder.create({
        customerName: 'Ana García',
        customerPhone: '987654321',
        customerEmail: 'ana.garcia@example.com',
        deliveryAddress: 'Av. Los Girasoles 123, La Molina',
        deliveryNotes: 'Tocar el timbre 2 veces',
        status: 'pending',
        totalAmount: 27.00,
        deliveryFee: 5.00,
        paymentMethod: 'cash',
        paymentStatus: 'pending',
        notes: 'Cliente nuevo, verificar disponibilidad'
      });

      await GuestOrderProduct.create({
        guestOrderId: guestOrder1.id,
        productId: products[0].id,
        quantity: 2,
        price: 10.00,
        subtotal: 20.00
      });

      await GuestOrderProduct.create({
        guestOrderId: guestOrder1.id,
        productId: products[1].id,
        quantity: 1,
        price: 7.00,
        subtotal: 7.00
      });

      const guestOrder2 = await GuestOrder.create({
        customerName: 'Carlos Mendoza',
        customerPhone: '912345678',
        customerEmail: 'carlos.mendoza@example.com',
        deliveryAddress: 'Jr. Las Magnolias 456, San Isidro',
        deliveryNotes: 'Dejar en recepción',
        status: 'confirmed',
        totalAmount: 35.00,
        deliveryFee: 5.00,
        paymentMethod: 'card',
        paymentStatus: 'paid',
        estimatedDeliveryTime: new Date(Date.now() + 3600000),
        notes: 'Cliente frecuente'
      });

      await GuestOrderProduct.create({
        guestOrderId: guestOrder2.id,
        productId: products[1].id,
        quantity: 5,
        price: 7.00,
        subtotal: 35.00
      });

      console.log('✅ Pedidos de invitados creados');
    } else {
      console.log('✅ Pedidos de invitados ya existen');
    }
    
    console.log('🎉 Datos de las nuevas funcionalidades cargados exitosamente');
    
  } catch (error) {
    console.error('❌ Error al cargar datos:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
};

seedNewFeatures();
