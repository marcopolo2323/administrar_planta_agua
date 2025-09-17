import React, { useEffect, useState } from 'react';
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
import { FaBox, FaUsers, FaTruck, FaCreditCard, FaChartLine, FaDollarSign, FaShoppingCart, FaCalendarAlt, FaFilePdf } from 'react-icons/fa';
import useProductStore from '../stores/productStore';
import useClientStore from '../stores/clientStore';
import useDeliveryStore from '../stores/deliveryStore';
import useGuestOrderStore from '../stores/guestOrderStore';
import AquaYaraLogo from '../components/AquaYaraLogo';

const Dashboard = () => {
  const navigate = useNavigate();
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const isMobile = useBreakpointValue({ base: true, md: false });
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Stores
  const { products, fetchProducts } = useProductStore();
  const { clients, fetchClients } = useClientStore();
  const { getDeliveryStats, fetchDeliveryPersons, fetchDeliveryFees } = useDeliveryStore();
  const { orders: guestOrders, fetchOrders: fetchGuestOrders, getOrderStats } = useGuestOrderStore();

  useEffect(() => {
    fetchProducts();
    fetchClients();
    fetchDeliveryPersons();
    fetchDeliveryFees();
    fetchGuestOrders();
    
    // Actualizar cada 30 segundos para mantener sincronización
    const interval = setInterval(() => {
      fetchGuestOrders();
      setLastUpdate(new Date());
    }, 30000);
    
    return () => clearInterval(interval);
  }, [fetchProducts, fetchClients, fetchDeliveryPersons, fetchDeliveryFees, fetchGuestOrders]);

  const orderStats = getOrderStats();
  const deliveryStats = getDeliveryStats();
  
  // Calcular estadísticas totales de pedidos (solo guest orders)
  const totalOrders = guestOrders?.length || 0;
  const pendingOrders = guestOrders?.filter(order => order.status === 'pending')?.length || 0;
  const deliveredOrders = guestOrders?.filter(order => order.status === 'delivered')?.length || 0;
  const confirmedOrders = guestOrders?.filter(order => order.status === 'confirmed')?.length || 0;
  const preparingOrders = guestOrders?.filter(order => order.status === 'preparing')?.length || 0;
  const readyOrders = guestOrders?.filter(order => order.status === 'ready')?.length || 0;
  
  // Calcular estadísticas por tipo de pago
  const contraentregaOrders = guestOrders?.filter(order => order.paymentMethod === 'contraentrega')?.length || 0;
  const valeOrders = guestOrders?.filter(order => order.paymentMethod === 'vale')?.length || 0;
  const suscripcionOrders = guestOrders?.filter(order => order.paymentMethod === 'suscripcion')?.length || 0;
  
  // Calcular ingresos totales
  const totalRevenue = guestOrders?.reduce((sum, order) => sum + (parseFloat(order.totalAmount) || 0), 0) || 0;
  const todayRevenue = guestOrders?.filter(order => {
    const orderDate = new Date(order.createdAt);
    const today = new Date();
    return orderDate.toDateString() === today.toDateString();
  }).reduce((sum, order) => sum + (parseFloat(order.totalAmount) || 0), 0) || 0;

  const quickActions = [
    {
      title: 'Gestión de Pedidos',
      icon: FaTruck,
      color: 'orange',
      onClick: () => navigate('/dashboard/orders-management'),
      count: totalOrders,
      description: 'Todos los pedidos'
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
      title: 'Suscripciones',
      icon: FaCalendarAlt,
      color: 'purple',
      onClick: () => navigate('/dashboard/subscriptions'),
      count: suscripcionOrders,
      description: 'Planes de suscripción'
    },
    {
      title: 'Vales',
      icon: FaCreditCard,
      color: 'blue',
      onClick: () => navigate('/dashboard/vales'),
      count: valeOrders,
      description: 'Gestión de vales'
    },
    {
      title: 'Productos',
      icon: FaBox,
      color: 'teal',
      onClick: () => navigate('/dashboard/products'),
      count: products.length,
      description: 'Inventario'
    },
    {
      title: 'Repartidores',
      icon: FaUsers,
      color: 'indigo',
      onClick: () => navigate('/dashboard/delivery-persons'),
      count: deliveryStats?.total || 0,
      description: 'Equipo de entrega'
    },
    {
      title: 'Documentos',
      icon: FaFilePdf,
      color: 'red',
      onClick: () => navigate('/dashboard/documents'),
      count: '📄',
      description: 'Boletas y facturas'
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
          <Text color="gray.400" fontSize="xs" textAlign={{ base: 'center', md: 'left' }}>
            Última actualización: {lastUpdate.toLocaleTimeString()}
          </Text>
        </VStack>
        <VStack spacing={2} align={{ base: 'center', md: 'flex-end' }}>
          <Badge colorScheme="green" variant="subtle">
            Sistema Activo
          </Badge>
          <Button
            size="xs"
            colorScheme="blue"
            variant="outline"
            onClick={() => {
              fetchGuestOrders();
              setLastUpdate(new Date());
            }}
          >
            Actualizar
          </Button>
        </VStack>
      </Flex>

      {/* Estadísticas principales */}
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 5 }} spacing={4} mb={8} maxW="100%">
        <Card bg={cardBg} borderColor={borderColor} boxShadow="sm">
          <CardBody>
            <Stat>
              <StatLabel color="orange.600">📦 Pedidos Pendientes</StatLabel>
              <StatNumber color="orange.500" fontSize="2xl">{pendingOrders}</StatNumber>
              <StatHelpText>
                {confirmedOrders} confirmados
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={cardBg} borderColor={borderColor} boxShadow="sm">
          <CardBody>
            <Stat>
              <StatLabel color="green.600">💰 Ingresos Hoy</StatLabel>
              <StatNumber color="green.500" fontSize="2xl">S/ {todayRevenue.toFixed(2)}</StatNumber>
              <StatHelpText>
                Total: S/ {totalRevenue.toFixed(2)}
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
              <StatLabel color="purple.600">✅ Entregados</StatLabel>
              <StatNumber color="purple.500" fontSize="2xl">{deliveredOrders}</StatNumber>
              <StatHelpText>
                {readyOrders} listos para entregar
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={cardBg} borderColor={borderColor} boxShadow="sm">
          <CardBody>
            <Stat>
              <StatLabel color="yellow.600">📊 Total Pedidos</StatLabel>
              <StatNumber color="yellow.500" fontSize="2xl">{totalOrders}</StatNumber>
              <StatHelpText>
                {preparingOrders} en preparación
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Estadísticas por tipo de pago */}
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={4} mb={8} maxW="100%">
        <Card bg={cardBg} borderColor={borderColor} boxShadow="sm">
          <CardBody>
            <Stat>
              <StatLabel color="blue.600">💵 Contraentrega</StatLabel>
              <StatNumber color="blue.500" fontSize="xl">{contraentregaOrders}</StatNumber>
              <StatHelpText>
                Pago al recibir
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={cardBg} borderColor={borderColor} boxShadow="sm">
          <CardBody>
            <Stat>
              <StatLabel color="orange.600">🎫 Vales</StatLabel>
              <StatNumber color="orange.500" fontSize="xl">{valeOrders}</StatNumber>
              <StatHelpText>
                Pago a crédito
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={cardBg} borderColor={borderColor} boxShadow="sm">
          <CardBody>
            <Stat>
              <StatLabel color="purple.600">📅 Suscripciones</StatLabel>
              <StatNumber color="purple.500" fontSize="xl">{suscripcionOrders}</StatNumber>
              <StatHelpText>
                Pago mensual
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={cardBg} borderColor={borderColor} boxShadow="sm">
          <CardBody>
            <Stat>
              <StatLabel color="green.600">💧 Productos</StatLabel>
              <StatNumber color="green.500" fontSize="xl">{products.length}</StatNumber>
              <StatHelpText>
                En inventario
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
