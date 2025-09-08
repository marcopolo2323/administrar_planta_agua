import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Badge,
  Button,
  Spinner,
  Center,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useToast,
  Select,
  Flex,
  Icon,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Textarea
} from '@chakra-ui/react';
import {
  FaTruck,
  FaClock,
  FaCheckCircle,
  FaMapMarkerAlt,
  FaPhone,
  FaUser,
  FaBox,
  FaGift,
  FaPlus
} from 'react-icons/fa';
import axios from '../utils/axios';
import { useRole } from '../hooks/useRole';

const DeliveryDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'stats', 'vouchers'
  const [showCreateVoucher, setShowCreateVoucher] = useState(false);
  const [voucherForm, setVoucherForm] = useState({
    clientId: '',
    productId: '',
    quantity: 1,
    unitPrice: 0,
    notes: ''
  });
  const { user } = useRole();
  const toast = useToast();

  // Manejar navegación por hash
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.substring(1);
      if (hash === 'orders' || hash === 'stats' || hash === 'vouchers') {
        setActiveTab(hash);
      }
    };

    // Establecer tab inicial basado en hash
    handleHashChange();

    // Escuchar cambios en el hash
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Función para manejar cambio de tabs
  const handleTabChange = (index) => {
    const tabs = ['orders', 'stats', 'vouchers'];
    const tab = tabs[index];
    setActiveTab(tab);
    window.location.hash = tab;
  };

  useEffect(() => {
    const loadData = async () => {
      console.log('Iniciando carga de datos...');
      setLoading(true);
      try {
        await Promise.all([
          fetchOrders(),
          fetchStats(),
          fetchVouchers(),
          fetchClients(),
          fetchProducts()
        ]);
        console.log('Datos cargados correctamente');
      } catch (error) {
        console.error('Error al cargar datos:', error);
      } finally {
        console.log('Finalizando carga de datos');
        setLoading(false);
      }
    };
    
    loadData();
  }, [statusFilter, activeTab]);

  const fetchOrders = async () => {
    try {
      console.log('Fetching orders...');
      const response = await axios.get('/api/delivery/orders', {
        params: { status: statusFilter === 'all' ? undefined : statusFilter }
      });
      console.log('Orders response:', response.data);
      setOrders(response.data.data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/delivery/stats');
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats(null);
    }
  };

  const fetchVouchers = async () => {
    try {
      const response = await axios.get('/api/vouchers/delivery');
      setVouchers(response.data.data || []);
    } catch (error) {
      console.error('Error fetching vouchers:', error);
      setVouchers([]);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await axios.get('/api/clients');
      setClients(response.data.data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
      setClients([]);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/api/products');
      setProducts(response.data.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    }
  };

  const updateOrderStatus = async (orderId, newStatus, orderType) => {
    try {
      console.log('🔄 Actualizando estado:', { orderId, newStatus, orderType });
      await axios.put(`/api/delivery/orders/${orderId}/status`, { 
        status: newStatus,
        orderType: orderType 
      });
      toast({
        title: 'Estado actualizado',
        description: 'El estado del pedido se ha actualizado correctamente',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchOrders();
      fetchStats();
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el estado del pedido',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const createVoucher = async () => {
    try {
      await axios.post('/api/vouchers', voucherForm);
      toast({
        title: 'Vale creado',
        description: 'El vale se ha creado correctamente',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchVouchers();
      setShowCreateVoucher(false);
      setVoucherForm({
        clientId: '',
        productId: '',
        quantity: 1,
        unitPrice: 0,
        notes: ''
      });
    } catch (error) {
      console.error('Error al crear vale:', error);
      toast({
        title: 'Error',
        description: 'No se pudo crear el vale',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const updateVoucherStatus = async (voucherId, status) => {
    try {
      await axios.put(`/api/vouchers/${voucherId}/status`, { status });
      toast({
        title: 'Estado actualizado',
        description: 'El estado del vale se ha actualizado correctamente',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchVouchers();
    } catch (error) {
      console.error('Error al actualizar estado del vale:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el estado del vale',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleCashPayment = async (clientId, totalAmount) => {
    try {
      // Confirmar el pago
      const confirmed = window.confirm(
        `¿Confirmar pago en efectivo de S/ ${totalAmount.toFixed(2)} para este cliente?`
      );
      
      if (!confirmed) return;

      // Procesar pago de todos los vales pendientes
      await axios.put(`/api/vouchers/client/${clientId}/pay-all`, {
        paymentMethod: 'cash',
        paymentReference: `Pago en efectivo - ${new Date().toLocaleString()}`
      });

      toast({
        title: 'Pago procesado',
        description: `Pago de S/ ${totalAmount.toFixed(2)} procesado correctamente`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Actualizar datos
      fetchOrders();
      fetchVouchers();
    } catch (error) {
      console.error('Error al procesar pago:', error);
      toast({
        title: 'Error',
        description: 'No se pudo procesar el pago',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Center h="400px">
        <VStack key="loading-container" spacing={4}>
          <Spinner size="xl" />
          <Text>Cargando datos del repartidor...</Text>
          <VStack key="loading-info" spacing={2}>
            <Text fontSize="sm" color="gray.500">
              Usuario: {user?.username || 'Cargando...'}
            </Text>
            <Text fontSize="sm" color="gray.500">
              Rol: {user?.role || 'Cargando...'}
            </Text>
            {user?.email && (
              <Text fontSize="sm" color="gray.500">
                Email: {user.email}
              </Text>
            )}
          </VStack>
        </VStack>
      </Center>
    );
  }

  return (
    <Box p={6}>
      <VStack key="main-container" spacing={6} align="stretch">
        {/* Header */}
        <Card>
          <CardBody>
            <VStack key="header-content" spacing={4} align="stretch">
              <HStack key="header-top" justify="space-between" align="start">
                <VStack key="header-info" align="start" spacing={2}>
                  <Heading size="lg">
                    <Icon as={FaTruck} mr={2} />
                    Panel de Repartidor
                  </Heading>
                  <Text color="gray.600" fontSize="lg">
                    Bienvenido, {user?.username}
                  </Text>
                </VStack>
                <Badge colorScheme="blue" fontSize="sm" p={2}>
                  {user?.role === 'repartidor' ? 'Repartidor' : user?.role}
                </Badge>
              </HStack>
              
              {/* Información del repartidor */}
              <SimpleGrid key="info-grid" columns={{ base: 1, md: 3 }} spacing={4} w="full">
                <Box key="personal-info">
                  <Text fontSize="sm" color="gray.600" fontWeight="bold">
                    <Icon as={FaUser} mr={1} />
                    Información Personal
                  </Text>
                  <VStack key="personal-details" align="start" spacing={1} mt={2}>
                    <Text fontSize="sm">
                      <strong>Usuario:</strong> {user?.username || 'N/A'}
                    </Text>
                    <Text fontSize="sm">
                      <strong>Email:</strong> {user?.email || 'N/A'}
                    </Text>
                    <Text fontSize="sm">
                      <strong>Teléfono:</strong> {user?.phone || 'No registrado'}
                    </Text>
                  </VStack>
                </Box>
                
                <Box key="location-info">
                  <Text fontSize="sm" color="gray.600" fontWeight="bold">
                    <Icon as={FaMapMarkerAlt} mr={1} />
                    Ubicación
                  </Text>
                  <VStack key="location-details" align="start" spacing={1} mt={2}>
                    <Text fontSize="sm">
                      <strong>Dirección:</strong> {user?.address || 'No registrada'}
                    </Text>
                    <Text fontSize="sm">
                      <strong>Distrito:</strong> {user?.district || 'No registrado'}
                    </Text>
                    <Text fontSize="sm">
                      <strong>Referencia:</strong> {user?.reference || 'No registrada'}
                    </Text>
                  </VStack>
                </Box>
                
                <Box key="account-info">
                  <Text fontSize="sm" color="gray.600" fontWeight="bold">
                    <Icon as={FaClock} mr={1} />
                    Estado de Cuenta
                  </Text>
                  <VStack key="account-details" align="start" spacing={1} mt={2}>
                    <Text fontSize="sm">
                      <strong>Estado:</strong> 
                      <Badge 
                        colorScheme={user?.active ? 'green' : 'red'} 
                        ml={2} 
                        size="sm"
                      >
                        {user?.active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </Text>
                    <Text fontSize="sm">
                      <strong>Miembro desde:</strong> {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('es-ES') : 'N/A'}
                    </Text>
                  </VStack>
                </Box>
              </SimpleGrid>
            </VStack>
          </CardBody>
        </Card>

        {/* Tabs */}
        <Tabs 
          key="main-tabs"
          index={activeTab === 'orders' ? 0 : activeTab === 'stats' ? 1 : 2}
          onChange={handleTabChange}
        >
          <TabList>
            <Tab key="orders-tab">📦 Mis Pedidos</Tab>
            <Tab key="stats-tab">📊 Estadísticas</Tab>
            <Tab key="vouchers-tab">🎫 Vales</Tab>
          </TabList>

          <TabPanels>
            {/* Tab de Pedidos */}
            <TabPanel key="orders-panel" px={0}>
              <VStack key="orders-content" spacing={6} align="stretch">
                {/* Filtros */}
                <Card>
                  <CardBody>
                    <HStack key="filters-row" spacing={4}>
                      <Text fontWeight="bold">Filtrar por estado:</Text>
                      <Select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        maxW="200px"
                      >
                        <option value="all">Todos</option>
                        <option value="pendiente">Pendientes</option>
                        <option value="confirmado">Confirmados</option>
                        <option value="en_preparacion">Preparando</option>
                        <option value="en_camino">En Camino</option>
                        <option value="entregado">Entregados</option>
                      </Select>
                    </HStack>
                  </CardBody>
                </Card>

                {/* Lista de pedidos */}
                <VStack key="orders-list" spacing={4} align="stretch">
                  {orders.length === 0 ? (
                    <Card>
                      <CardBody textAlign="center" py={10}>
                        <Text color="gray.500" fontSize="lg">
                          No tienes pedidos asignados
                        </Text>
                      </CardBody>
                    </Card>
                  ) : (
                    orders.map((order) => (
                      <Card key={order.id}>
                        <CardBody>
                          <VStack key={`order-card-${order.id}`} spacing={4} align="stretch">
                            <Flex key={`order-main-${order.id}`} justify="space-between" align="start">
                              <VStack key={`order-info-${order.id}`} align="start" spacing={2}>
                                <HStack key={`order-header-${order.id}`}>
                                  <Text fontWeight="bold" fontSize="lg">
                                    Pedido #{order.id}
                                  </Text>
                                  <Badge
                                    colorScheme={
                                      order.status === 'entregado' ? 'green' :
                                      order.status === 'en_camino' ? 'blue' :
                                      order.status === 'en_preparacion' ? 'orange' : 
                                      order.status === 'pendiente' ? 'yellow' : 'gray'
                                    }
                                  >
                                    {order.status === 'entregado' ? 'Entregado' :
                                     order.status === 'en_camino' ? 'En Camino' :
                                     order.status === 'en_preparacion' ? 'Preparando' : 
                                     order.status === 'pendiente' ? 'Pendiente' : 'Confirmado'}
                                  </Badge>
                                </HStack>
                                <HStack key={`customer-info-${order.id}`}>
                                  <Text color="gray.600">
                                    Cliente: {order.customerName}
                                  </Text>
                                  {order.type === 'regular' ? (
                                    <Badge colorScheme="blue" size="sm">
                                      <Icon as={FaUser} mr={1} />
                                      Frecuente
                                    </Badge>
                                  ) : (
                                    <Badge colorScheme="gray" size="sm">
                                      <Icon as={FaGift} mr={1} />
                                      Visitante
                                    </Badge>
                                  )}
                                </HStack>
                                <HStack key={`phone-${order.id}`}>
                                  <Icon as={FaPhone} color="gray.500" />
                                  <Text fontSize="sm" color="gray.600">
                                    {order.customerPhone}
                                  </Text>
                                </HStack>
                                {order.type === 'regular' && order.Client && (
                                  <VStack key={`client-info-${order.id}`} align="start" spacing={1} w="full">
                                    <Text key={`email-${order.id}`} fontSize="xs" color="blue.600" fontWeight="bold">
                                      📧 {order.Client.email}
                                    </Text>
                                    <Text key={`vouchers-${order.id}`} fontSize="xs" color="purple.600" fontWeight="bold">
                                      💳 Vales pendientes: {order.Client.pendingVouchers || 0}
                                    </Text>
                                    {order.Client.totalToPay > 0 && (
                                      <Text key={`total-pay-${order.id}`} fontSize="xs" color="red.600" fontWeight="bold" bg="red.50" p={1} borderRadius="md">
                                        💰 Total a pagar: S/ {order.Client.totalToPay.toFixed(2)}
                                      </Text>
                                    )}
                                  </VStack>
                                )}
                                <HStack key={`address-${order.id}`}>
                                  <Icon as={FaMapMarkerAlt} color="gray.500" />
                                  <VStack key={`address-details-${order.id}`} align="start" spacing={1}>
                                    <Text fontSize="sm" color="gray.600">
                                      {order.deliveryAddress}
                                    </Text>
                                    {order.deliveryDistrict && (
                                      <Text key={`district-${order.id}`} fontSize="xs" color="blue.600" fontWeight="bold">
                                        Distrito: {order.deliveryDistrict}
                                      </Text>
                                    )}
                                    {order.deliveryReference && (
                                      <Text key={`reference-${order.id}`} fontSize="xs" color="green.600" fontWeight="bold">
                                        Ref: {order.deliveryReference}
                                      </Text>
                                    )}
                                  </VStack>
                                </HStack>
                                
                                {/* Información de precios */}
                                <VStack key={`prices-${order.id}`} spacing={1} align="start" w="full">
                                  <HStack key={`subtotal-${order.id}`} justify="space-between" w="full">
                                    <Text fontSize="sm" color="gray.600">
                                      Subtotal:
                                    </Text>
                                    <Text fontSize="sm" color="gray.600">
                                      S/ {parseFloat((order.totalAmount || 0) - (order.deliveryFee || 0)).toFixed(2)}
                                    </Text>
                                  </HStack>
                                  <HStack key={`delivery-${order.id}`} justify="space-between" w="full">
                                    <Text fontSize="sm" color="green.600" fontWeight="bold">
                                      Flete:
                                    </Text>
                                    <Text fontSize="sm" color="green.600" fontWeight="bold">
                                      S/ {parseFloat(order.deliveryFee || 0).toFixed(2)}
                                    </Text>
                                  </HStack>
                                  <HStack key={`total-${order.id}`} justify="space-between" w="full" borderTop="1px" borderColor="gray.200" pt={1}>
                                    <Text fontSize="sm" fontWeight="bold" color="blue.600">
                                      Total:
                                    </Text>
                                    <Text fontSize="sm" fontWeight="bold" color="blue.600">
                                      S/ {parseFloat(order.totalAmount || 0).toFixed(2)}
                                    </Text>
                                  </HStack>
                                </VStack>
                                <Text fontSize="sm" color="gray.500">
                                  Creado: {formatDate(order.createdAt)}
                                </Text>
                              </VStack>
                              <VStack key={`buttons-${order.id}`} spacing={2}>
                                {/* Debug: Mostrar estado actual */}
                                <Text fontSize="xs" color="gray.500">
                                  Estado: {order.status}
                                </Text>
                                
                                {(order.status === 'confirmado' || order.status === 'pendiente') && (
                                  <Button
                                    key={`preparing-${order.id}`}
                                    size="sm"
                                    colorScheme="orange"
                                    leftIcon={<FaClock />}
                                    onClick={() => updateOrderStatus(order.id, 'en_preparacion', order.type)}
                                  >
                                    Iniciar Preparación
                                  </Button>
                                )}
                                {order.status === 'en_preparacion' && (
                                  <Button
                                    key={`ready-${order.id}`}
                                    size="sm"
                                    colorScheme="blue"
                                    leftIcon={<FaBox />}
                                    onClick={() => updateOrderStatus(order.id, 'en_camino', order.type)}
                                  >
                                    Marcar Listo
                                  </Button>
                                )}
                                {order.status === 'en_camino' && (
                                  <Button
                                    key={`delivered-${order.id}`}
                                    size="sm"
                                    colorScheme="green"
                                    leftIcon={<FaCheckCircle />}
                                    onClick={() => updateOrderStatus(order.id, 'entregado', order.type)}
                                  >
                                    Marcar Entregado
                                  </Button>
                                )}
                                
                                {/* Botón para procesar pago en efectivo de vales */}
                                {order.type === 'regular' && order.Client && order.Client.totalToPay > 0 && (
                                  <Button
                                    key={`cash-payment-${order.id}`}
                                    size="sm"
                                    colorScheme="yellow"
                                    leftIcon={<FaGift />}
                                    onClick={() => handleCashPayment(order.Client.id, order.Client.totalToPay)}
                                  >
                                    Cobrar Vales (S/ {order.Client.totalToPay.toFixed(2)})
                                  </Button>
                                )}
                              </VStack>
                            </Flex>
                          </VStack>
                        </CardBody>
                      </Card>
                    ))
                  )}
                </VStack>
              </VStack>
            </TabPanel>

            {/* Tab de Estadísticas */}
            <TabPanel key="stats-panel" px={0}>
              <VStack key="stats-content" spacing={6} align="stretch">
                {stats && (
                  <SimpleGrid key="stats-grid" columns={{ base: 1, md: 4 }} spacing={4}>
                    <Card key="total-orders-stat">
                      <CardBody>
                        <Stat>
                          <StatLabel>Total Pedidos</StatLabel>
                          <StatNumber>{stats.totalOrders}</StatNumber>
                        </Stat>
                      </CardBody>
                    </Card>
                    <Card key="delivered-orders-stat">
                      <CardBody>
                        <Stat>
                          <StatLabel>Entregados</StatLabel>
                          <StatNumber color="green.500">{stats.deliveredOrders}</StatNumber>
                        </Stat>
                      </CardBody>
                    </Card>
                    <Card key="pending-orders-stat">
                      <CardBody>
                        <Stat>
                          <StatLabel>Pendientes</StatLabel>
                          <StatNumber color="orange.500">{stats.pendingOrders}</StatNumber>
                        </Stat>
                      </CardBody>
                    </Card>
                    <Card key="delivery-rate-stat">
                      <CardBody>
                        <Stat>
                          <StatLabel>Tasa de Entrega</StatLabel>
                          <StatNumber>{stats.deliveryRate.toFixed(1)}%</StatNumber>
                          <StatHelpText>Eficiencia</StatHelpText>
                        </Stat>
                      </CardBody>
                    </Card>
                  </SimpleGrid>
                )}
              </VStack>
            </TabPanel>

            {/* Tab de Vales */}
            <TabPanel key="vouchers-panel" px={0}>
              <VStack key="vouchers-content" spacing={6} align="stretch">
                {/* Botón para crear vale */}
                <Card>
                  <CardBody>
                    <HStack key="voucher-header" justify="space-between" align="center">
                      <VStack key="voucher-info" align="start" spacing={1}>
                        <Text fontWeight="bold" fontSize="lg">
                          Gestión de Vales
                        </Text>
                        <Text color="gray.600" fontSize="sm">
                          Gestiona vales de clientes frecuentes - Se generan automáticamente con cada pedido
                        </Text>
                      </VStack>
                      <Button
                        leftIcon={<FaPlus />}
                        colorScheme="blue"
                        onClick={() => setShowCreateVoucher(true)}
                      >
                        Crear Vale
                      </Button>
                    </HStack>
                  </CardBody>
                </Card>

                {/* Lista de vales */}
                <VStack key="vouchers-list" spacing={4} align="stretch">
                  {vouchers.length === 0 ? (
                    <Card>
                      <CardBody textAlign="center" py={10}>
                        <Text color="gray.500" fontSize="lg">
                          No tienes vales asignados
                        </Text>
                        <Text color="gray.400" fontSize="sm" mt={2}>
                          Los vales se generan automáticamente cuando los clientes frecuentes hacen pedidos
                        </Text>
                      </CardBody>
                    </Card>
                  ) : (
                    vouchers.map((voucher) => (
                      <Card key={voucher.id}>
                        <CardBody>
                          <VStack key={`voucher-content-${voucher.id}`} spacing={3} align="stretch">
                            <HStack key={`voucher-header-${voucher.id}`} justify="space-between">
                              <Text fontWeight="bold">
                                Vale #{voucher.id}
                              </Text>
                              <Badge
                                colorScheme={
                                  voucher.status === 'paid' ? 'green' :
                                  voucher.status === 'delivered' ? 'blue' : 'orange'
                                }
                              >
                                {voucher.status === 'paid' ? 'Pagado' :
                                 voucher.status === 'delivered' ? 'Entregado' : 'Pendiente'}
                              </Badge>
                            </HStack>
                            
                            <HStack key={`voucher-client-${voucher.id}`} justify="space-between">
                              <Text fontSize="sm" color="gray.600">
                                Cliente: {voucher.client?.username}
                              </Text>
                              <Text fontSize="sm" color="blue.600" fontWeight="bold">
                                Total: S/ {parseFloat(voucher.totalAmount || 0).toFixed(2)}
                              </Text>
                            </HStack>

                            <HStack key={`voucher-product-${voucher.id}`} justify="space-between">
                              <Text fontSize="sm" color="gray.600">
                                Producto: {voucher.product?.name}
                              </Text>
                              <Text fontSize="sm" color="gray.600">
                                Cantidad: {voucher.quantity}
                              </Text>
                            </HStack>

                            <HStack key={`voucher-actions-${voucher.id}`} spacing={2}>
                              {voucher.status === 'pending' && (
                                <Button
                                  key={`deliver-voucher-${voucher.id}`}
                                  size="sm"
                                  colorScheme="blue"
                                  onClick={() => updateVoucherStatus(voucher.id, 'delivered')}
                                >
                                  Marcar Entregado
                                </Button>
                              )}
                              {voucher.status === 'delivered' && (
                                <Button
                                  size="sm"
                                  colorScheme="green"
                                  onClick={() => updateVoucherStatus(voucher.id, 'paid')}
                                >
                                  Marcar Pagado
                                </Button>
                              )}
                            </HStack>
                          </VStack>
                        </CardBody>
                      </Card>
                    ))
                  )}
                </VStack>
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>

      {/* Modal para crear vale */}
      {showCreateVoucher && (
        <Box
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="blackAlpha.600"
          zIndex={1000}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Card maxW="md" w="full" mx={4}>
            <CardHeader>
              <Heading size="md">Crear Vale</Heading>
            </CardHeader>
            <CardBody>
              <VStack key="voucher-form" spacing={4}>
                <Select
                  placeholder="Seleccionar cliente"
                  value={voucherForm.clientId}
                  onChange={(e) => setVoucherForm({...voucherForm, clientId: e.target.value})}
                >
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.username} - {client.email}
                    </option>
                  ))}
                </Select>

                <Select
                  placeholder="Seleccionar producto"
                  value={voucherForm.productId}
                  onChange={(e) => {
                    const product = products.find(p => p.id === parseInt(e.target.value));
                    setVoucherForm({
                      ...voucherForm, 
                      productId: e.target.value,
                      unitPrice: product ? parseFloat(product.unitPrice) : 0
                    });
                  }}
                >
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} - S/ {parseFloat(product.unitPrice).toFixed(2)}
                    </option>
                  ))}
                </Select>

                <HStack key="quantity-row" w="full">
                  <Text w="100px">Cantidad:</Text>
                  <input
                    type="number"
                    min="1"
                    value={voucherForm.quantity}
                    onChange={(e) => setVoucherForm({...voucherForm, quantity: parseInt(e.target.value) || 1})}
                    style={{ flex: 1, padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                  />
                </HStack>

                <HStack key="price-row" w="full">
                  <Text w="100px">Precio unitario:</Text>
                  <input
                    type="number"
                    step="0.01"
                    value={voucherForm.unitPrice}
                    onChange={(e) => setVoucherForm({...voucherForm, unitPrice: parseFloat(e.target.value) || 0})}
                    style={{ flex: 1, padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                  />
                </HStack>

                <HStack key="total-row" w="full">
                  <Text w="100px">Total:</Text>
                  <Text fontWeight="bold" color="blue.600">
                    S/ {(voucherForm.quantity * voucherForm.unitPrice).toFixed(2)}
                  </Text>
                </HStack>

                <Textarea
                  placeholder="Notas (opcional)"
                  value={voucherForm.notes}
                  onChange={(e) => setVoucherForm({...voucherForm, notes: e.target.value})}
                />

                <HStack key="form-actions" spacing={4} w="full">
                  <Button
                    flex={1}
                    onClick={() => setShowCreateVoucher(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    flex={1}
                    colorScheme="blue"
                    onClick={createVoucher}
                    isDisabled={!voucherForm.clientId || !voucherForm.productId}
                  >
                    Crear Vale
                  </Button>
                </HStack>
              </VStack>
            </CardBody>
          </Card>
        </Box>
      )}
    </Box>
  );
};

export default DeliveryDashboard;