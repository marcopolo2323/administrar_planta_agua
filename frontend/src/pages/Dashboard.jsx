import React, { useEffect } from 'react';
import {
  Box,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Card,
  CardBody,
  Heading,
  Text,
  Button,
  VStack,
  useColorModeValue,
  SimpleGrid,
  useBreakpointValue,
  Flex,
  Badge
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { FaBox, FaUsers, FaTruck, FaCreditCard, FaChartLine, FaDollarSign, FaShoppingCart, FaCalendarAlt } from 'react-icons/fa';
import useProductStore from '../stores/productStore';
import useClientStore from '../stores/clientStore';
import useOrderStore from '../stores/orderStore';
import useDeliveryStore from '../stores/deliveryStore';
import useGuestOrderStore from '../stores/guestOrderStore';
import AquaYaraLogo from '../components/AquaYaraLogo';

const Dashboard = () => {
  const navigate = useNavigate();
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const isMobile = useBreakpointValue({ base: true, md: false });

  // Stores
  const { products, fetchProducts } = useProductStore();
  const { clients, fetchClients } = useClientStore();
  const { orders: regularOrders, fetchOrders: fetchRegularOrders, getOrderStats } = useOrderStore();
  const { getDeliveryStats, fetchDeliveryPersons, fetchDeliveryFees } = useDeliveryStore();
  const { orders: guestOrders, fetchOrders: fetchGuestOrders } = useGuestOrderStore();

  useEffect(() => {
    fetchProducts();
    fetchClients();
    fetchDeliveryPersons();
    fetchDeliveryFees();
    fetchRegularOrders();
    fetchGuestOrders();
  }, [fetchProducts, fetchClients, fetchDeliveryPersons, fetchDeliveryFees, fetchRegularOrders, fetchGuestOrders]);

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
      count: products.length,
      description: 'Gestionar inventario'
    },
    {
      title: 'Clientes',
      icon: FaUsers,
      color: 'green',
      onClick: () => navigate('/dashboard/clients'),
      count: clients.length,
      description: 'Clientes frecuentes'
    },
    {
      title: 'Pedidos',
      icon: FaTruck,
      color: 'orange',
      onClick: () => navigate('/dashboard/orders'),
      count: totalOrders,
      description: 'Gestionar pedidos'
    },
    {
      title: 'Ventas',
      icon: FaDollarSign,
      color: 'purple',
      onClick: () => navigate('/dashboard/sales'),
      count: '💰',
      description: 'Ver ventas del día'
    },
    {
      title: 'Pagos Clientes',
      icon: FaShoppingCart,
      color: 'cyan',
      onClick: () => navigate('/dashboard/client-payments'),
      count: '💳',
      description: 'Monitorear pagos'
    },
    {
      title: 'Suscripciones',
      icon: FaCalendarAlt,
      color: 'pink',
      onClick: () => navigate('/dashboard/subscriptions'),
      count: '📅',
      description: 'Gestionar suscripciones'
    },
    {
      title: 'Repartidores',
      icon: FaUsers,
      color: 'indigo',
      onClick: () => navigate('/dashboard/delivery-persons'),
      count: '👨‍💼',
      description: 'Gestionar repartidores'
    },
    {
      title: 'Reportes',
      icon: FaChartLine,
      color: 'gray',
      onClick: () => navigate('/dashboard/reports'),
      count: '📊',
      description: 'Análisis y reportes'
    }
  ];

  return (
    <Box p={{ base: 2, md: 4 }} maxW="100%" overflow="hidden">
      {/* Header */}
      <Flex 
        direction={{ base: 'column', md: 'row' }} 
        align={{ base: 'center', md: 'flex-start' }} 
        justify="space-between" 
        mb={6}
        wrap="wrap"
      >
        <VStack align={{ base: 'center', md: 'flex-start' }} spacing={2} maxW={{ base: '100%', md: '70%' }}>
          <AquaYaraLogo 
            size="md" 
            variant="horizontal" 
            color="blue.500" 
            textColor="blue.600" 
            taglineColor="teal.500"
          />
          <Heading size="lg" color="gray.700" textAlign={{ base: 'center', md: 'left' }}>
            Dashboard Administrativo
          </Heading>
          <Text color="gray.500" fontSize="sm" textAlign={{ base: 'center', md: 'left' }}>
            Gestión completa del negocio
          </Text>
        </VStack>
        <Badge colorScheme="green" variant="subtle" mt={{ base: 2, md: 0 }}>
          Sistema Activo
        </Badge>
      </Flex>

      {/* Estadísticas principales */}
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={4} mb={8} maxW="100%">
        <Card bg={cardBg} borderColor={borderColor} boxShadow="sm">
          <CardBody>
            <Stat>
              <StatLabel color="orange.600">📦 Pedidos Pendientes</StatLabel>
              <StatNumber color="orange.500" fontSize="2xl">{orderStats.pendingOrders}</StatNumber>
              <StatHelpText>
                {orderStats.confirmedOrders} confirmados
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={cardBg} borderColor={borderColor} boxShadow="sm">
          <CardBody>
            <Stat>
              <StatLabel color="green.600">💧 Productos</StatLabel>
              <StatNumber color="green.500" fontSize="2xl">{products.length}</StatNumber>
              <StatHelpText>
                En inventario
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={cardBg} borderColor={borderColor} boxShadow="sm">
          <CardBody>
            <Stat>
              <StatLabel color="blue.600">👥 Clientes</StatLabel>
              <StatNumber color="blue.500" fontSize="2xl">{clients.length}</StatNumber>
              <StatHelpText>
                Clientes frecuentes
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={cardBg} borderColor={borderColor} boxShadow="sm">
          <CardBody>
            <Stat>
              <StatLabel color="purple.600">🚚 Entregas</StatLabel>
              <StatNumber color="purple.500" fontSize="2xl">{deliveryStats.completedDeliveries || 0}</StatNumber>
              <StatHelpText>
                Completadas hoy
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Acciones rápidas */}
      <Card bg={cardBg} borderColor={borderColor} boxShadow="sm" maxW="100%">
        <CardBody>
          <Heading size="md" mb={4} color="gray.700">🚀 Acciones Rápidas</Heading>
          <SimpleGrid 
            columns={{ base: 2, sm: 3, md: 4, lg: 4 }} 
            spacing={4}
            maxW="100%"
          >
            {quickActions.map((action, index) => (
              <Button
                key={index}
                colorScheme={action.color}
                variant="outline"
                size={isMobile ? "sm" : "md"}
                height={isMobile ? "80px" : "100px"}
                flexDirection="column"
                onClick={action.onClick}
                _hover={{ 
                  transform: 'translateY(-2px)', 
                  boxShadow: 'lg',
                  bg: `${action.color}.50`
                }}
                transition="all 0.2s"
                borderWidth="2px"
                borderRadius="lg"
                minW="0"
                w="100%"
                maxW="100%"
              >
                <VStack spacing={1} maxW="100%">
                  <action.icon size={isMobile ? "16px" : "20px"} />
                  <Text fontSize={isMobile ? "xs" : "sm"} fontWeight="bold" textAlign="center" noOfLines={1}>
                    {action.title}
                  </Text>
                  <Text fontSize="xs" color="gray.500" textAlign="center" noOfLines={2}>
                    {action.description}
                  </Text>
                  <Badge 
                    colorScheme={action.color} 
                    variant="subtle" 
                    fontSize="xs"
                    borderRadius="full"
                  >
                    {action.count}
                  </Badge>
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
