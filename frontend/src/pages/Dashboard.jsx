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
import { FaUsers, FaTruck, FaCreditCard, FaDollarSign, FaShoppingCart, FaCalendarAlt, FaFileAlt } from 'react-icons/fa';
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
      fetchClients();
      fetchDeliveryPersons();
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
  
  // Calcular estadísticas adicionales
  const totalClients = clients?.length || 0;
  const totalDeliveryPersons = deliveryStats?.totalPersons || 0;
  const totalVales = valeOrders;
  const totalSubscriptions = suscripcionOrders;
  
  // Debug logs
  console.log('🔍 Dashboard Debug:', {
    clients: clients?.length || 0,
    totalClients,
    deliveryPersons: deliveryStats?.totalPersons || 0,
    totalDeliveryPersons,
    valeOrders,
    suscripcionOrders
  });
  
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
      count: totalClients,
      description: 'Clientes registrados'
    },
    {
      title: 'Suscripciones',
      icon: FaCalendarAlt,
      color: 'purple',
      onClick: () => navigate('/dashboard/subscriptions'),
      count: totalSubscriptions,
      description: 'Planes de suscripción'
    },
    {
      title: 'Vales',
      icon: FaCreditCard,
      color: 'blue',
      onClick: () => navigate('/dashboard/vales'),
      count: totalVales,
      description: 'Gestión de vales'
    },
    {
      title: 'Reporte de Cobranza',
      icon: FaFileAlt,
      color: 'red',
      onClick: () => navigate('/dashboard/collection-report'),
      count: totalVales, // Mostrar total de vales como indicador de deudas
      description: 'Deudas pendientes'
    },
    {
      title: 'Repartidores',
      icon: FaUsers,
      color: 'indigo',
      onClick: () => navigate('/dashboard/delivery-persons'),
      count: totalDeliveryPersons,
      description: 'Equipo de entrega'
    }
  ];

  return (
    <Box p={{ base: 1, sm: 2, md: 4 }} maxW="100%" overflow="hidden">
      {/* Header */}
      <Flex 
        direction={{ base: 'column', sm: 'row' }} 
        align={{ base: 'center', sm: 'flex-start' }} 
        justify="space-between" 
        mb={{ base: 4, md: 6 }}
        wrap="wrap"
        gap={2}
      >
        <VStack align={{ base: 'center', sm: 'flex-start' }} spacing={{ base: 1, md: 2 }} maxW={{ base: '100%', sm: '70%' }}>
          <AquaYaraLogo 
            size={{ base: 'sm', md: 'md' }} 
            variant="horizontal" 
            color="blue.500" 
            textColor="blue.600" 
            taglineColor="teal.500"
          />
          <Heading size={{ base: 'md', md: 'lg' }} color="gray.700" textAlign={{ base: 'center', sm: 'left' }}>
            Dashboard Administrativo
          </Heading>
          <Text color="gray.500" fontSize={{ base: 'xs', md: 'sm' }} textAlign={{ base: 'center', sm: 'left' }}>
            Gestión completa del negocio
          </Text>
          <Text color="gray.400" fontSize="xs" textAlign={{ base: 'center', sm: 'left' }}>
            Última actualización: {lastUpdate.toLocaleTimeString()}
          </Text>
        </VStack>
        <VStack spacing={1} align={{ base: 'center', sm: 'flex-end' }}>
          <Badge colorScheme="green" variant="subtle" fontSize="xs">
            Sistema Activo
          </Badge>
          <Button
            size="xs"
            colorScheme="blue"
            variant="outline"
            onClick={() => {
              fetchGuestOrders();
              fetchClients();
              fetchDeliveryPersons();
              setLastUpdate(new Date());
            }}
          >
            Actualizar
          </Button>
        </VStack>
      </Flex>

      {/* Estadísticas principales */}
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 5 }} spacing={{ base: 2, md: 4 }} mb={{ base: 4, md: 8 }} maxW="100%">
        <Card bg={cardBg} borderColor={borderColor} boxShadow="sm">
          <CardBody p={{ base: 3, md: 4 }}>
            <Stat>
              <StatLabel color="orange.600" fontSize={{ base: 'xs', md: 'sm' }}>📦 Pedidos Pendientes</StatLabel>
              <StatNumber color="orange.500" fontSize={{ base: 'xl', md: '2xl' }}>{pendingOrders}</StatNumber>
              <StatHelpText fontSize={{ base: 'xs', md: 'sm' }}>
                {confirmedOrders} confirmados
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={cardBg} borderColor={borderColor} boxShadow="sm">
          <CardBody p={{ base: 3, md: 4 }}>
            <Stat>
              <StatLabel color="green.600" fontSize={{ base: 'xs', md: 'sm' }}>💰 Ingresos Hoy</StatLabel>
              <StatNumber color="green.500" fontSize={{ base: 'xl', md: '2xl' }}>S/ {todayRevenue.toFixed(2)}</StatNumber>
              <StatHelpText fontSize={{ base: 'xs', md: 'sm' }}>
                Total: S/ {totalRevenue.toFixed(2)}
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={cardBg} borderColor={borderColor} boxShadow="sm">
          <CardBody p={{ base: 3, md: 4 }}>
            <Stat>
              <StatLabel color="blue.600" fontSize={{ base: 'xs', md: 'sm' }}>👥 Clientes</StatLabel>
              <StatNumber color="blue.500" fontSize={{ base: 'xl', md: '2xl' }}>{clients.length}</StatNumber>
              <StatHelpText fontSize={{ base: 'xs', md: 'sm' }}>
                Clientes registrados
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={cardBg} borderColor={borderColor} boxShadow="sm">
          <CardBody p={{ base: 3, md: 4 }}>
            <Stat>
              <StatLabel color="purple.600" fontSize={{ base: 'xs', md: 'sm' }}>✅ Entregados</StatLabel>
              <StatNumber color="purple.500" fontSize={{ base: 'xl', md: '2xl' }}>{deliveredOrders}</StatNumber>
              <StatHelpText fontSize={{ base: 'xs', md: 'sm' }}>
                {readyOrders} listos para entregar
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={cardBg} borderColor={borderColor} boxShadow="sm">
          <CardBody p={{ base: 3, md: 4 }}>
            <Stat>
              <StatLabel color="yellow.600" fontSize={{ base: 'xs', md: 'sm' }}>📊 Total Pedidos</StatLabel>
              <StatNumber color="yellow.500" fontSize={{ base: 'xl', md: '2xl' }}>{totalOrders}</StatNumber>
              <StatHelpText fontSize={{ base: 'xs', md: 'sm' }}>
                {preparingOrders} en preparación
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Estadísticas por tipo de pago */}
      <SimpleGrid columns={{ base: 2, sm: 2, lg: 4 }} spacing={{ base: 2, md: 4 }} mb={{ base: 4, md: 8 }} maxW="100%">
        <Card bg={cardBg} borderColor={borderColor} boxShadow="sm">
          <CardBody p={{ base: 2, md: 4 }}>
            <Stat>
              <StatLabel color="blue.600" fontSize={{ base: 'xs', md: 'sm' }}>💵 Contraentrega</StatLabel>
              <StatNumber color="blue.500" fontSize={{ base: 'lg', md: 'xl' }}>{contraentregaOrders}</StatNumber>
              <StatHelpText fontSize={{ base: 'xs', md: 'sm' }}>
                Pago al recibir
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={cardBg} borderColor={borderColor} boxShadow="sm">
          <CardBody p={{ base: 2, md: 4 }}>
            <Stat>
              <StatLabel color="orange.600" fontSize={{ base: 'xs', md: 'sm' }}>🎫 Vales</StatLabel>
              <StatNumber color="orange.500" fontSize={{ base: 'lg', md: 'xl' }}>{valeOrders}</StatNumber>
              <StatHelpText fontSize={{ base: 'xs', md: 'sm' }}>
                Pago a crédito
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={cardBg} borderColor={borderColor} boxShadow="sm">
          <CardBody p={{ base: 2, md: 4 }}>
            <Stat>
              <StatLabel color="purple.600" fontSize={{ base: 'xs', md: 'sm' }}>📅 Suscripciones</StatLabel>
              <StatNumber color="purple.500" fontSize={{ base: 'lg', md: 'xl' }}>{suscripcionOrders}</StatNumber>
              <StatHelpText fontSize={{ base: 'xs', md: 'sm' }}>
                Pago mensual
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={cardBg} borderColor={borderColor} boxShadow="sm">
          <CardBody p={{ base: 2, md: 4 }}>
            <Stat>
              <StatLabel color="green.600" fontSize={{ base: 'xs', md: 'sm' }}>💧 Productos</StatLabel>
              <StatNumber color="green.500" fontSize={{ base: 'lg', md: 'xl' }}>{products.length}</StatNumber>
              <StatHelpText fontSize={{ base: 'xs', md: 'sm' }}>
                En inventario
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Acciones rápidas */}
      <Card bg={cardBg} borderColor={borderColor} boxShadow="sm" maxW="100%">
        <CardBody p={{ base: 3, md: 4 }}>
          <Heading size={{ base: 'sm', md: 'md' }} mb={{ base: 3, md: 4 }} color="gray.700">🚀 Acciones Rápidas</Heading>
          <SimpleGrid 
            columns={{ base: 2, sm: 3, md: 3, lg: 6 }} 
            spacing={{ base: 2, md: 4 }}
            maxW="100%"
          >
            {quickActions.map((action, index) => (
              <Button
                key={index}
                colorScheme={action.color}
                variant="outline"
                size={{ base: "xs", sm: "sm", md: "md" }}
                height={{ base: "70px", sm: "80px", md: "100px" }}
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
                p={{ base: 1, md: 2 }}
              >
                <VStack spacing={{ base: 0.5, md: 1 }} maxW="100%" h="100%" justify="space-between" p={1}>
                  <Box 
                    display="flex" 
                    alignItems="center" 
                    justifyContent="center" 
                    h={{ base: "20px", sm: "22px", md: "24px" }}
                    w={{ base: "20px", sm: "22px", md: "24px" }}
                    borderRadius="md"
                    bg={action.color + ".100"}
                    flexShrink={0}
                  >
                    <action.icon 
                      size={16} 
                      color={`${action.color}.600`}
                    />
                  </Box>
                  <VStack spacing={0.5} flex={1} minH={0} w="100%">
                    <Text 
                      fontSize={{ base: "2xs", sm: "xs", md: "sm" }} 
                      fontWeight="bold" 
                      textAlign="center" 
                      noOfLines={1}
                      lineHeight="shorter"
                      w="100%"
                    >
                      {action.title}
                    </Text>
                    <Text 
                      fontSize={{ base: "2xs", sm: "xs" }} 
                      color="gray.500" 
                      textAlign="center" 
                      noOfLines={2}
                      lineHeight="shorter"
                      w="100%"
                    >
                      {action.description}
                    </Text>
                  </VStack>
                  <Badge 
                    colorScheme={action.color} 
                    variant="solid" 
                    fontSize={{ base: "2xs", sm: "xs" }}
                    borderRadius="full"
                    px={{ base: 1, md: 2 }}
                    py={0.5}
                    flexShrink={0}
                    minW="fit-content"
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
