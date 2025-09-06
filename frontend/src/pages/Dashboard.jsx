import React, { useEffect } from 'react';
import {
  Box,
  Grid,
  GridItem,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Card,
  CardBody,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  useColorModeValue,
  SimpleGrid
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { FaBox, FaUsers, FaShoppingCart, FaTruck, FaBell, FaCreditCard, FaCashRegister, FaChartLine } from 'react-icons/fa';
import useProductStore from '../stores/productStore';
import useClientStore from '../stores/clientStore';
import useOrderStore from '../stores/orderStore';
import useNotificationStore from '../stores/notificationStore';
import useDeliveryStore from '../stores/deliveryStore';
import useGuestOrderStore from '../stores/guestOrderStore';

const Dashboard = () => {
  const navigate = useNavigate();
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Stores
  const { products, fetchProducts } = useProductStore();
  const { clients, fetchClients } = useClientStore();
  const { orders: regularOrders, fetchOrders: fetchRegularOrders, getOrderStats } = useOrderStore();
  const { unreadCount, fetchNotifications } = useNotificationStore();
  const { getDeliveryStats, fetchDeliveryPersons, fetchDeliveryFees } = useDeliveryStore();
  const { orders: guestOrders, fetchOrders: fetchGuestOrders } = useGuestOrderStore();

  useEffect(() => {
    fetchProducts();
    fetchClients();
    fetchNotifications();
    fetchDeliveryPersons();
    fetchDeliveryFees();
    fetchRegularOrders();
    fetchGuestOrders();
  }, [fetchProducts, fetchClients, fetchNotifications, fetchDeliveryPersons, fetchDeliveryFees, fetchRegularOrders, fetchGuestOrders]);

  const orderStats = getOrderStats();
  const deliveryStats = getDeliveryStats();
  
  // Calcular estadísticas totales de pedidos
  const totalOrders = (regularOrders?.length || 0) + (guestOrders?.length || 0);
  const pendingOrders = (regularOrders?.filter(order => order.status === 'pendiente')?.length || 0) + 
                       (guestOrders?.filter(order => order.status === 'pendiente')?.length || 0);

  const quickActions = [
    {
      title: 'Productos',
      icon: FaBox,
      color: 'blue',
      onClick: () => navigate('/dashboard/products'),
      count: products.length
    },
    {
      title: 'Clientes',
      icon: FaUsers,
      color: 'green',
      onClick: () => navigate('/dashboard/clients'),
      count: clients.length
    },
    {
      title: 'Pedidos',
      icon: FaTruck,
      color: 'orange',
      onClick: () => navigate('/dashboard/orders'),
      count: totalOrders
    },
    {
      title: 'Notificaciones',
      icon: FaBell,
      color: 'red',
      onClick: () => navigate('/dashboard/notifications'),
      count: unreadCount
    },
    {
      title: 'Vales',
      icon: FaCreditCard,
      color: 'teal',
      onClick: () => navigate('/dashboard/vouchers'),
      count: '🎫'
    },
    {
      title: 'Caja',
      icon: FaCashRegister,
      color: 'yellow',
      onClick: () => navigate('/dashboard/cash-register'),
      count: '💰'
    },
    {
      title: 'Pedidos Invitados',
      icon: FaBox,
      color: 'cyan',
      onClick: () => navigate('/dashboard/guest-orders'),
      count: guestOrders.length
    },
    {
      title: 'Tarifas Envío',
      icon: FaTruck,
      color: 'pink',
      onClick: () => navigate('/dashboard/delivery-fees'),
      count: '🚚'
    },
    {
      title: 'Repartidores',
      icon: FaUsers,
      color: 'indigo',
      onClick: () => navigate('/dashboard/delivery-persons'),
      count: '👨‍💼'
    },
    {
      title: 'Reportes',
      icon: FaChartLine,
      color: 'gray',
      onClick: () => navigate('/dashboard/reports'),
      count: '📊'
    }
  ];

  return (
    <Box p={6}>
      <Heading size="lg" mb={6} color="gray.700">
        Dashboard - Planta de Agua
      </Heading>

      {/* Estadísticas principales */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} mb={8}>

        <Card bg={cardBg} borderColor={borderColor}>
          <CardBody>
            <Stat>
              <StatLabel>Pedidos Pendientes</StatLabel>
              <StatNumber color="orange.500">{orderStats.pendingOrders}</StatNumber>
              <StatHelpText>
                {orderStats.confirmedOrders} confirmados
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={cardBg} borderColor={borderColor}>
          <CardBody>
            <Stat>
              <StatLabel>Productos</StatLabel>
              <StatNumber color="green.500">{products.length}</StatNumber>
              <StatHelpText>
                En inventario
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={cardBg} borderColor={borderColor}>
          <CardBody>
            <Stat>
              <StatLabel>Notificaciones</StatLabel>
              <StatNumber color="red.500">{unreadCount}</StatNumber>
              <StatHelpText>
                Sin leer
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Acciones rápidas */}
      <Card bg={cardBg} borderColor={borderColor}>
        <CardBody>
          <Heading size="md" mb={4}>Acciones Rápidas</Heading>
          <SimpleGrid columns={{ base: 2, md: 3, lg: 6 }} spacing={4}>
            {quickActions.map((action, index) => (
              <Button
                key={index}
                colorScheme={action.color}
                variant="outline"
                size="lg"
                height="120px"
                flexDirection="column"
                onClick={action.onClick}
                _hover={{ transform: 'translateY(-2px)' }}
                transition="all 0.2s"
              >
                <VStack spacing={2}>
                  <action.icon size="24px" />
                  <Text fontSize="sm" fontWeight="bold">
                    {action.title}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    {action.count}
                  </Text>
                </VStack>
              </Button>
            ))}
          </SimpleGrid>
        </CardBody>
      </Card>
    </Box>
  );
};

export default Dashboard;
