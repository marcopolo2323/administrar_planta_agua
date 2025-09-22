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
import { FaUsers, FaTruck, FaCreditCard, FaDollarSign, FaShoppingCart, FaCalendarAlt, FaFileAlt, FaUserTie, FaFileContract, FaUserCog } from 'react-icons/fa';
import useProductStore from '../stores/productStore';
import useClientStore from '../stores/clientStore';
import useDeliveryStore from '../stores/deliveryStore';
import useGuestOrderStore from '../stores/guestOrderStore';
import AquaYaraLogo from '../components/AquaYaraLogo';
import axios from '../utils/axios';

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

  // Función para obtener estadísticas de vales
  const fetchVoucherStats = async () => {
    try {
      const response = await axios.get('/api/vouchers/stats');
      if (response.data.success) {
        setVoucherStats(response.data.data);
      }
    } catch (error) {
      console.error('Error al cargar estadísticas de vales:', error);
    }
  };

  // Función para obtener estadísticas de suscripciones
  const fetchSubscriptionStats = async () => {
    try {
      const response = await axios.get('/api/subscriptions');
      if (response.data.success) {
        const subscriptions = response.data.data || [];
        setSubscriptionStats({
          total: subscriptions.length,
          active: subscriptions.filter(s => s.status === 'active').length
        });
      }
    } catch (error) {
      console.error('Error al cargar estadísticas de suscripciones:', error);
    }
  };

  useEffect(() => {
    // Función para cargar datos con retraso para evitar problemas de token
    const loadData = async () => {
      try {
        // Pequeño retraso para asegurar que el token esté listo
        await new Promise(resolve => setTimeout(resolve, 100));
        
        fetchProducts();
        fetchClients();
        fetchDeliveryFees();
        fetchGuestOrders();
        fetchVoucherStats();
        fetchSubscriptionStats();
        
        // Cargar repartidores con un pequeño retraso adicional
        setTimeout(() => {
          fetchDeliveryPersons();
        }, 200);
        
      } catch (error) {
        console.error('Error cargando datos del dashboard:', error);
      }
    };
    
    loadData();
    
    // Actualizar cada 30 segundos para mantener sincronización
    const interval = setInterval(() => {
      fetchGuestOrders();
      fetchClients();
      fetchDeliveryPersons();
      fetchVoucherStats();
      fetchSubscriptionStats();
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
  
  // Estados para contadores reales
  const [voucherStats, setVoucherStats] = useState({ total: 0, pending: 0 });
  const [subscriptionStats, setSubscriptionStats] = useState({ total: 0, active: 0 });
  
  // Calcular estadísticas adicionales
  const totalClients = clients?.length || 0;
  const totalDeliveryPersons = deliveryStats?.totalPersons || 0;
  
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
      title: 'Pedidos',
      icon: FaTruck,
      color: 'orange',
      onClick: () => navigate('/dashboard/orders-management'),
      count: totalOrders,
      description: 'Gestionar pedidos'
    },
    {
      title: 'Clientes',
      icon: FaUsers,
      color: 'green',
      onClick: () => navigate('/dashboard/clients'),
      count: totalClients,
      description: 'Base de clientes'
    },
    {
      title: 'Suscripciones',
      icon: FaCalendarAlt,
      color: 'purple',
      onClick: () => navigate('/dashboard/subscriptions'),
      count: subscriptionStats.active,
      description: `${subscriptionStats.total} total, ${subscriptionStats.active} activas`
    },
    {
      title: 'Vales',
      icon: FaCreditCard,
      color: 'blue',
      onClick: () => navigate('/dashboard/vales'),
      count: voucherStats.pending,
      description: `${voucherStats.total} total, ${voucherStats.pending} pendientes`
    },
    {
      title: 'Cobranza',
      icon: FaFileAlt,
      color: 'red',
      onClick: () => navigate('/dashboard/collection-report'),
      count: voucherStats.pending,
      description: 'Vales por cobrar'
    },
    {
      title: 'Repartidores',
      icon: FaUserTie,
      color: 'indigo',
      onClick: () => navigate('/dashboard/users-management?role=repartidor'),
      count: totalDeliveryPersons,
      description: 'Equipo de entrega'
    },
    {
      title: 'Términos',
      icon: FaFileContract,
      color: 'teal',
      onClick: () => navigate('/dashboard/terms-and-conditions'),
      count: 0,
      description: 'Términos y condiciones'
    },
    {
      title: 'Usuarios',
      icon: FaUserCog,
      color: 'cyan',
      onClick: () => navigate('/dashboard/users-management'),
      count: 0,
      description: 'Gestión de usuarios'
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
              fetchVoucherStats();
              fetchSubscriptionStats();
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
            columns={{ base: 2, sm: 2, md: 3, lg: 6 }} 
            spacing={{ base: 3, md: 4 }}
            maxW="100%"
          >
            {quickActions.map((action, index) => (
              <Card
                key={index}
                borderColor={`${action.color}.200`}
                borderWidth="2px"
                cursor="pointer"
                onClick={action.onClick}
                _hover={{ 
                  transform: 'translateY(-2px)', 
                  boxShadow: 'lg',
                  borderColor: `${action.color}.300`,
                  bg: `${action.color}.50`
                }}
                transition="all 0.2s"
                borderRadius="lg"
                bg="white"
                h={{ base: "130px", md: "140px" }}
              >
                <CardBody p={{ base: 3, md: 4 }} h="100%">
                  <VStack spacing={{ base: 2, md: 3 }} h="100%" justify="space-between" align="center">
                    {/* Icono */}
                    <Box 
                      display="flex" 
                      alignItems="center" 
                      justifyContent="center" 
                      h={{ base: "32px", md: "40px" }}
                      w={{ base: "32px", md: "40px" }}
                      borderRadius="full"
                      bg={`${action.color}.100`}
                      flexShrink={0}
                    >
                      <action.icon 
                        size={{ base: 18, md: 22 }} 
                        color={`${action.color}.600`}
                      />
                    </Box>
                    
                    {/* Contenido */}
                    <VStack spacing={1} flex={1} w="100%" textAlign="center">
                      <Text 
                        fontSize={{ base: "xs", md: "sm" }} 
                        fontWeight="bold" 
                        color="gray.700"
                        noOfLines={2}
                        lineHeight="1.2"
                        minH={{ base: "28px", md: "32px" }}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        {action.title}
                      </Text>
                      <Text 
                        fontSize={{ base: "2xs", md: "xs" }} 
                        color="gray.500" 
                        noOfLines={2}
                        lineHeight="1.1"
                        minH={{ base: "20px", md: "24px" }}
                      >
                        {action.description}
                      </Text>
                    </VStack>
                    
                    {/* Badge con contador estilo notificación */}
                    <Box
                      position="relative"
                      display="inline-block"
                    >
                      <Box
                        bg={`${action.color}.500`}
                        color="white"
                        borderRadius="full"
                        px={{ base: 3, md: 4 }}
                        py={{ base: 2, md: 2.5 }}
                        fontSize={{ base: "lg", md: "xl" }}
                        fontWeight="900"
                        minW={{ base: "40px", md: "44px" }}
                        h={{ base: "40px", md: "44px" }}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        boxShadow="lg"
                        border="4px solid white"
                        _hover={{
                          transform: "scale(1.1)",
                          boxShadow: "xl",
                          bg: `${action.color}.600`
                        }}
                        transition="all 0.3s ease"
                        cursor="pointer"
                      >
                        {action.count}
                      </Box>
                      {/* Efecto de brillo */}
                      <Box
                        position="absolute"
                        top="-2px"
                        right="-2px"
                        w="12px"
                        h="12px"
                        bg="white"
                        borderRadius="full"
                        opacity={0.8}
                        className="pulse-animation"
                      />
                    </Box>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        </CardBody>
      </Card>
    </Box>
  );
};

export default Dashboard;
