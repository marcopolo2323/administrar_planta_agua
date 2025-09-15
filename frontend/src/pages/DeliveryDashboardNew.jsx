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
  Textarea,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Input,
  Alert,
  AlertIcon,
  Divider,
  Avatar,
  Tooltip,
  IconButton
} from '@chakra-ui/react';
import {
  FaTruck,
  FaClock,
  FaCheckCircle,
  FaMapMarkerAlt,
  FaPhone,
  FaUser,
  FaBox,
  FaMoneyBillWave,
  FaQrcode,
  FaExclamationTriangle,
  FaEye,
  FaPlay,
  FaStop,
  FaDirections,
  FaWhatsapp
} from 'react-icons/fa';
import axios from '../utils/axios';
import useAuthStore from '../stores/authStore';

const DeliveryDashboardNew = () => {
  const { user } = useAuthStore();
  const toast = useToast();
  
  // Estados principales
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('asignado');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'vouchers'
  
  // Modales
  const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure();
  const { isOpen: isStatusOpen, onOpen: onStatusOpen, onClose: onStatusClose } = useDisclosure();
  const { isOpen: isVoucherOpen, onOpen: onVoucherOpen, onClose: onVoucherClose } = useDisclosure();
  
  // Estados del formulario
  const [statusNotes, setStatusNotes] = useState('');
  const [newStatus, setNewStatus] = useState('');
  
  // Estados para vales
  const [vouchers, setVouchers] = useState([]);
  const [voucherForm, setVoucherForm] = useState({
    clientId: '',
    productId: '',
    quantity: 1,
    unitPrice: 0,
    notes: ''
  });
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchOrders();
    fetchVouchers();
    fetchClients();
    fetchProducts();
    // Actualizar cada 30 segundos
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('/api/orders');
      const guestResponse = await axios.get('/api/guest-orders');
      
      // Combinar pedidos regulares y de visitantes asignados al repartidor actual
      const allOrders = [
        ...response.data.filter(order => order.deliveryPersonId === user.id),
        ...guestResponse.data.filter(order => order.deliveryPersonId === user.id)
      ];
      
      setOrders(allOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (error) {
      console.error('Error al cargar pedidos:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los pedidos',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchVouchers = async () => {
    try {
      const response = await axios.get('/api/vouchers/delivery-person');
      setVouchers(response.data.data || []);
    } catch (error) {
      console.error('Error al cargar vales:', error);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await axios.get('/api/clients');
      setClients(response.data || []);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/api/products');
      setProducts(response.data || []);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    }
  };

  // Filtrar pedidos por estado
  const filteredOrders = orders.filter(order => 
    statusFilter === 'all' || order.status === statusFilter
  );

  // Estadísticas
  const stats = {
    total: orders.length,
    asignados: orders.filter(o => o.status === 'asignado').length,
    en_camino: orders.filter(o => o.status === 'en_camino').length,
    entregados: orders.filter(o => o.status === 'entregado').length
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'asignado': return 'blue';
      case 'en_camino': return 'purple';
      case 'entregado': return 'green';
      case 'cancelado': return 'red';
      default: return 'gray';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'asignado': return 'Asignado';
      case 'en_camino': return 'En Camino';
      case 'entregado': return 'Entregado';
      case 'cancelado': return 'Cancelado';
      default: return status;
    }
  };

  const getPaymentIcon = (paymentType) => {
    switch (paymentType) {
      case 'efectivo': return FaMoneyBillWave;
      case 'plin': return FaQrcode;
      default: return FaMoneyBillWave;
    }
  };

  const handleStatusUpdate = async (order, newStatus) => {
    try {
      const endpoint = order.type === 'regular' ? `/api/orders/${order.id}` : `/api/guest-orders/${order.id}`;
      
      await axios.put(endpoint, {
        status: newStatus,
        notes: statusNotes
      });

      toast({
        title: 'Estado actualizado',
        description: `El pedido ahora está ${getStatusText(newStatus).toLowerCase()}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      setStatusNotes('');
      onStatusClose();
      fetchOrders();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el estado',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const openStatusModal = (order, status) => {
    setSelectedOrder(order);
    setNewStatus(status);
    setStatusNotes('');
    onStatusOpen();
  };

  const openDetailModal = (order) => {
    setSelectedOrder(order);
    onDetailOpen();
  };

  const handleCreateVoucher = async () => {
    try {
      const response = await axios.post('/api/vouchers', voucherForm);
      
      toast({
        title: 'Vale creado',
        description: 'El vale se ha creado correctamente',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      setVoucherForm({
        clientId: '',
        productId: '',
        quantity: 1,
        unitPrice: 0,
        notes: ''
      });
      
      onVoucherClose();
      fetchVouchers();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo crear el vale',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleVoucherStatusUpdate = async (voucherId, newStatus) => {
    try {
      await axios.put(`/api/vouchers/${voucherId}/status`, { status: newStatus });
      
      toast({
        title: 'Estado actualizado',
        description: `El vale ahora está ${newStatus === 'delivered' ? 'entregado' : 'pagado'}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      fetchVouchers();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el estado',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const openDirections = (address) => {
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`, '_blank');
  };

  const openWhatsApp = (phone, message) => {
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/51${phone}?text=${encodedMessage}`, '_blank');
  };

  // Renderizar tarjeta de pedido
  const renderOrderCard = (order) => (
    <Card key={`${order.type}-${order.id}`} variant="outline" size="sm">
      <CardBody>
        <VStack spacing={3} align="stretch">
          {/* Header del pedido */}
          <HStack justify="space-between">
            <VStack align="start" spacing={1}>
              <Text fontWeight="bold" fontSize="sm">
                {order.orderNumber || `#${order.id}`}
              </Text>
              <Text fontSize="xs" color="gray.500">
                {order.type === 'regular' ? 'Cliente Frecuente' : 'Cliente Visitante'}
              </Text>
            </VStack>
            <Badge colorScheme={getStatusColor(order.status)}>
              {getStatusText(order.status)}
            </Badge>
          </HStack>

          {/* Información del cliente */}
          <VStack spacing={2} align="stretch">
            <HStack spacing={2}>
              <FaUser size={12} color="#718096" />
              <Text fontSize="sm" fontWeight="medium">
                {order.clientName || order.client?.name || 'Sin nombre'}
              </Text>
            </HStack>
            
            <HStack spacing={2}>
              <FaPhone size={12} color="#718096" />
              <Text fontSize="sm">
                {order.clientPhone || order.client?.phone || 'Sin teléfono'}
              </Text>
              <Tooltip label="Enviar WhatsApp">
                <IconButton
                  size="xs"
                  icon={<FaWhatsapp />}
                  colorScheme="green"
                  variant="ghost"
                  onClick={() => openWhatsApp(
                    order.clientPhone || order.client?.phone,
                    `Hola! Soy el repartidor de AquaYara. Estoy en camino con tu pedido ${order.orderNumber || `#${order.id}`}. ¿Te parece bien?`
                  )}
                />
              </Tooltip>
            </HStack>
            
            <HStack spacing={2}>
              <FaMapMarkerAlt size={12} color="#718096" />
              <Text fontSize="sm" noOfLines={2}>
                {order.clientAddress || order.client?.address || 'Sin dirección'}
              </Text>
              <Tooltip label="Abrir en Google Maps">
                <IconButton
                  size="xs"
                  icon={<FaDirections />}
                  colorScheme="blue"
                  variant="ghost"
                  onClick={() => openDirections(order.clientAddress || order.client?.address)}
                />
              </Tooltip>
            </HStack>
          </VStack>

          {/* Información de pago */}
          <HStack justify="space-between">
            <HStack spacing={2}>
              <Icon as={getPaymentIcon(order.paymentType)} size={14} />
              <Text fontSize="sm">
                {order.paymentMethod === 'vale' ? 'A Crédito (Vale)' :
                 order.paymentType === 'efectivo' ? 'Efectivo' : 'PLIN'}
              </Text>
            </HStack>
            <Text fontWeight="bold" fontSize="sm" color={order.paymentMethod === 'vale' ? 'orange.600' : 'green.600'}>
              {order.paymentMethod === 'vale' ? 'Sin cobro' : `S/ ${parseFloat(order.total || order.totalAmount || 0).toFixed(2)}`}
            </Text>
          </HStack>

          {/* Notas especiales */}
          {order.paymentMethod === 'vale' && (
            <Alert status="warning" size="sm">
              <AlertIcon />
              <Text fontSize="xs" fontWeight="bold">⚠️ PEDIDO A CRÉDITO - NO COBRAR NADA</Text>
            </Alert>
          )}
          
          {order.notes && (
            <Alert status="info" size="sm">
              <AlertIcon />
              <Text fontSize="xs">{order.notes}</Text>
            </Alert>
          )}

          {/* Acciones */}
          <HStack spacing={2} justify="center">
            <Tooltip label="Ver detalles">
              <IconButton
                size="sm"
                icon={<FaEye />}
                onClick={() => openDetailModal(order)}
                aria-label="Ver detalles"
              />
            </Tooltip>
            
            {order.status === 'asignado' && (
              <Button
                size="sm"
                colorScheme="purple"
                leftIcon={<FaPlay />}
                onClick={() => openStatusModal(order, 'en_camino')}
              >
                Iniciar Entrega
              </Button>
            )}
            
            {order.status === 'en_camino' && (
              <Button
                size="sm"
                colorScheme="green"
                leftIcon={<FaCheckCircle />}
                onClick={() => openStatusModal(order, 'entregado')}
              >
                Marcar Entregado
              </Button>
            )}
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  );

  // Modal de actualización de estado
  const renderStatusModal = () => (
    <Modal isOpen={isStatusOpen} onClose={onStatusClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          Actualizar Estado del Pedido
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            {selectedOrder && (
              <Alert status="info">
                <AlertIcon />
                <VStack align="start" spacing={1}>
                  <Text fontWeight="bold">Pedido: {selectedOrder.orderNumber || `#${selectedOrder.id}`}</Text>
                  <Text fontSize="sm">
                    Cliente: {selectedOrder.clientName || selectedOrder.client?.name}
                  </Text>
                  <Text fontSize="sm">
                    Nuevo estado: {getStatusText(newStatus)}
                  </Text>
                </VStack>
              </Alert>
            )}

            <FormControl>
              <FormLabel>Notas adicionales (opcional)</FormLabel>
              <Textarea
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                placeholder="Observaciones sobre la entrega..."
                rows={3}
              />
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" mr={3} onClick={onStatusClose}>
            Cancelar
          </Button>
          <Button 
            colorScheme="green" 
            onClick={() => handleStatusUpdate(selectedOrder, newStatus)}
          >
            Confirmar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );

  // Modal de detalles del pedido
  const renderDetailModal = () => (
    <Modal isOpen={isDetailOpen} onClose={onDetailClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Detalles del Pedido</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {selectedOrder && (
            <VStack spacing={4} align="stretch">
              {/* Información básica */}
              <Card variant="outline">
                <CardBody>
                  <VStack spacing={3} align="stretch">
                    <HStack justify="space-between">
                      <Text fontWeight="bold">Pedido:</Text>
                      <Text>{selectedOrder.orderNumber || `#${selectedOrder.id}`}</Text>
                    </HStack>
                    
                    <HStack justify="space-between">
                      <Text fontWeight="bold">Estado:</Text>
                      <Badge colorScheme={getStatusColor(selectedOrder.status)}>
                        {getStatusText(selectedOrder.status)}
                      </Badge>
                    </HStack>
                    
                    <HStack justify="space-between">
                      <Text fontWeight="bold">Tipo:</Text>
                      <Text>{selectedOrder.type === 'regular' ? 'Cliente Frecuente' : 'Cliente Visitante'}</Text>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>

              {/* Información del cliente */}
              <Card variant="outline">
                <CardHeader>
                  <Heading size="sm">Cliente</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={2} align="stretch">
                    <HStack justify="space-between">
                      <Text fontWeight="bold">Nombre:</Text>
                      <Text>{selectedOrder.clientName || selectedOrder.client?.name}</Text>
                    </HStack>
                    
                    <HStack justify="space-between">
                      <Text fontWeight="bold">Teléfono:</Text>
                      <HStack>
                        <Text>{selectedOrder.clientPhone || selectedOrder.client?.phone}</Text>
                        <Button
                          size="xs"
                          colorScheme="green"
                          leftIcon={<FaWhatsapp />}
                          onClick={() => openWhatsApp(
                            selectedOrder.clientPhone || selectedOrder.client?.phone,
                            `Hola! Soy el repartidor de AquaYara. Estoy en camino con tu pedido ${selectedOrder.orderNumber || `#${selectedOrder.id}`}. ¿Te parece bien?`
                          )}
                        >
                          WhatsApp
                        </Button>
                      </HStack>
                    </HStack>
                    
                    <HStack justify="space-between">
                      <Text fontWeight="bold">Dirección:</Text>
                      <HStack>
                        <Text flex={1}>{selectedOrder.clientAddress || selectedOrder.client?.address}</Text>
                        <Button
                          size="xs"
                          colorScheme="blue"
                          leftIcon={<FaDirections />}
                          onClick={() => openDirections(selectedOrder.clientAddress || selectedOrder.client?.address)}
                        >
                          Maps
                        </Button>
                      </HStack>
                    </HStack>
                    
                    <HStack justify="space-between">
                      <Text fontWeight="bold">Distrito:</Text>
                      <Text>{selectedOrder.clientDistrict || selectedOrder.client?.district}</Text>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>

              {/* Información de pago */}
              <Card variant="outline">
                <CardHeader>
                  <Heading size="sm">Pago</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={2} align="stretch">
                    <HStack justify="space-between">
                      <Text fontWeight="bold">Método:</Text>
                      <HStack>
                        <Icon as={getPaymentIcon(selectedOrder.paymentType)} size={16} />
                        <Text>
                          {selectedOrder.paymentMethod === 'vale' ? 'A Crédito (Vale)' :
                           selectedOrder.paymentType === 'efectivo' ? 'Efectivo' : 'PLIN'}
                        </Text>
                      </HStack>
                    </HStack>
                    
                    <HStack justify="space-between">
                      <Text fontWeight="bold">Total:</Text>
                      <Text fontWeight="bold" color={selectedOrder.paymentMethod === 'vale' ? 'orange.600' : 'green.600'}>
                        {selectedOrder.paymentMethod === 'vale' ? 'Sin cobro (A Crédito)' : `S/ ${parseFloat(selectedOrder.total || selectedOrder.totalAmount || 0).toFixed(2)}`}
                      </Text>
                    </HStack>

                    {selectedOrder.paymentMethod === 'vale' && (
                      <Alert status="warning" size="sm">
                        <AlertIcon />
                        <Text fontSize="sm" fontWeight="bold">
                          ⚠️ PEDIDO A CRÉDITO - NO COBRAR NADA EN LA ENTREGA
                        </Text>
                      </Alert>
                    )}

                    {selectedOrder.paymentType === 'efectivo' && selectedOrder.paymentMethod !== 'vale' && (
                      <Alert status="warning" size="sm">
                        <AlertIcon />
                        <Text fontSize="sm">
                          Cobrar S/ {parseFloat(selectedOrder.total || selectedOrder.totalAmount || 0).toFixed(2)} en efectivo
                        </Text>
                      </Alert>
                    )}

                    {selectedOrder.paymentType === 'plin' && selectedOrder.paymentMethod !== 'vale' && (
                      <Alert status="success" size="sm">
                        <AlertIcon />
                        <Text fontSize="sm">
                          Pago ya realizado vía PLIN
                        </Text>
                      </Alert>
                    )}
                  </VStack>
                </CardBody>
              </Card>

              {/* Productos */}
              <Card variant="outline">
                <CardHeader>
                  <Heading size="sm">Productos</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={2} align="stretch">
                    {selectedOrder.products?.map((product, index) => (
                      <HStack key={index} justify="space-between">
                        <Text>{product.productName || product.name}</Text>
                        <Text fontWeight="bold">x{product.quantity}</Text>
                      </HStack>
                    )) || (
                      <Text color="gray.500">No hay productos detallados</Text>
                    )}
                  </VStack>
                </CardBody>
              </Card>

              {/* Notas */}
              {selectedOrder.notes && (
                <Card variant="outline">
                  <CardHeader>
                    <Heading size="sm">Notas</Heading>
                  </CardHeader>
                  <CardBody>
                    <Text>{selectedOrder.notes}</Text>
                  </CardBody>
                </Card>
              )}
            </VStack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button onClick={onDetailClose}>Cerrar</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );

  if (loading) {
    return (
      <Center h="400px">
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box>
          <Heading size="lg" mb={2}>
            Panel de Repartidor
          </Heading>
          <Text color="gray.600">
            Bienvenido, {user?.username}. Gestiona tus entregas asignadas.
          </Text>
        </Box>

        {/* Tabs */}
        <Tabs index={activeTab === 'orders' ? 0 : 1} onChange={(index) => setActiveTab(index === 0 ? 'orders' : 'vouchers')}>
          <TabList>
            <Tab>
              <HStack spacing={2}>
                <FaBox />
                <Text>Pedidos ({orders.length})</Text>
              </HStack>
            </Tab>
            <Tab>
              <HStack spacing={2}>
                <FaMoneyBillWave />
                <Text>Mis Vales ({vouchers.length})</Text>
              </HStack>
            </Tab>
          </TabList>

          <TabPanels>
            <TabPanel px={0}>

        {/* Estadísticas */}
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
          <Stat>
            <StatLabel>Total Pedidos</StatLabel>
            <StatNumber>{stats.total}</StatNumber>
            <StatHelpText>Asignados</StatHelpText>
          </Stat>
          
          <Stat>
            <StatLabel>Pendientes</StatLabel>
            <StatNumber color="blue.500">{stats.asignados}</StatNumber>
            <StatHelpText>Por entregar</StatHelpText>
          </Stat>
          
          <Stat>
            <StatLabel>En Camino</StatLabel>
            <StatNumber color="purple.500">{stats.en_camino}</StatNumber>
            <StatHelpText>En proceso</StatHelpText>
          </Stat>
          
          <Stat>
            <StatLabel>Entregados</StatLabel>
            <StatNumber color="green.500">{stats.entregados}</StatNumber>
            <StatHelpText>Completados</StatHelpText>
          </Stat>
        </SimpleGrid>

        {/* Filtros */}
        <Card>
          <CardBody>
            <HStack spacing={4}>
              <FormControl maxW="200px">
                <FormLabel>Estado</FormLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">Todos</option>
                  <option value="asignado">Asignados</option>
                  <option value="en_camino">En Camino</option>
                  <option value="entregado">Entregados</option>
                </Select>
              </FormControl>
              
              <Box>
                <Text fontSize="sm" color="gray.600">
                  Mostrando {filteredOrders.length} de {orders.length} pedidos
                </Text>
              </Box>
            </HStack>
          </CardBody>
        </Card>

        {/* Lista de pedidos */}
        {filteredOrders.length > 0 ? (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
            {filteredOrders.map(renderOrderCard)}
          </SimpleGrid>
        ) : (
          <Center h="200px">
            <VStack spacing={4}>
              <Icon as={FaBox} boxSize={12} color="gray.400" />
              <Text color="gray.500" fontSize="lg">
                No hay pedidos {statusFilter === 'all' ? '' : `con estado ${getStatusText(statusFilter).toLowerCase()}`}
              </Text>
              <Button
                variant="outline"
                onClick={() => setStatusFilter('all')}
              >
                Ver todos los pedidos
              </Button>
            </VStack>
          </Center>
            )}
            </TabPanel>

            <TabPanel px={0}>
              <VStack spacing={6} align="stretch">
                {/* Header de vales */}
                <HStack justify="space-between">
                  <VStack align="start" spacing={1}>
                    <Heading size="md">Mis Vales</Heading>
                    <Text color="gray.600">
                      Gestiona los vales que has creado
                    </Text>
                  </VStack>
                  <Button
                    colorScheme="blue"
                    leftIcon={<FaPlus />}
                    onClick={onVoucherOpen}
                  >
                    Crear Vale
                  </Button>
                </HStack>

                {/* Lista de vales */}
                {vouchers.length > 0 ? (
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                    {vouchers.map((voucher) => (
                      <Card key={voucher.id} variant="outline" size="sm">
                        <CardBody>
                          <VStack spacing={3} align="stretch">
                            <HStack justify="space-between">
                              <Text fontWeight="bold" fontSize="sm">
                                Vale #{voucher.id}
                              </Text>
                              <Badge colorScheme={
                                voucher.status === 'pending' ? 'orange' :
                                voucher.status === 'delivered' ? 'blue' : 'green'
                              }>
                                {voucher.status === 'pending' ? 'Pendiente' :
                                 voucher.status === 'delivered' ? 'Entregado' : 'Pagado'}
                              </Badge>
                            </HStack>

                            <VStack spacing={2} align="stretch">
                              <HStack spacing={2}>
                                <FaUser size={12} color="#718096" />
                                <Text fontSize="sm">
                                  {voucher.Client?.name || 'Cliente no encontrado'}
                                </Text>
                              </HStack>
                              
                              <HStack spacing={2}>
                                <FaBox size={12} color="#718096" />
                                <Text fontSize="sm">
                                  {voucher.product?.name || 'Producto no especificado'}
                                </Text>
                              </HStack>
                              
                              <HStack spacing={2}>
                                <Text fontSize="sm">Cantidad:</Text>
                                <Text fontWeight="bold">{voucher.quantity}</Text>
                              </HStack>
                              
                              <HStack justify="space-between">
                                <Text fontSize="sm">Total:</Text>
                                <Text fontWeight="bold" color="green.600">
                                  S/ {parseFloat(voucher.totalAmount).toFixed(2)}
                                </Text>
                              </HStack>
                            </VStack>

                            {voucher.notes && (
                              <Alert status="info" size="sm">
                                <AlertIcon />
                                <Text fontSize="xs">{voucher.notes}</Text>
                              </Alert>
                            )}

                            <HStack spacing={2} justify="center">
                              {voucher.status === 'pending' && (
                                <Button
                                  size="sm"
                                  colorScheme="blue"
                                  onClick={() => handleVoucherStatusUpdate(voucher.id, 'delivered')}
                                >
                                  Marcar Entregado
                                </Button>
                              )}
                              
                              {voucher.status === 'delivered' && (
                                <Button
                                  size="sm"
                                  colorScheme="green"
                                  onClick={() => handleVoucherStatusUpdate(voucher.id, 'paid')}
                                >
                                  Marcar Pagado
                                </Button>
                              )}
                            </HStack>
                          </VStack>
                        </CardBody>
                      </Card>
                    ))}
                  </SimpleGrid>
                ) : (
                  <Center h="200px">
                    <VStack spacing={4}>
                      <Icon as={FaMoneyBillWave} boxSize={12} color="gray.400" />
                      <Text color="gray.500" fontSize="lg">
                        No has creado ningún vale aún
                      </Text>
                      <Button
                        colorScheme="blue"
                        leftIcon={<FaPlus />}
                        onClick={onVoucherOpen}
                      >
                        Crear tu primer vale
                      </Button>
                    </VStack>
                  </Center>
                )}
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>

        {/* Modales */}
        {renderStatusModal()}
        {renderDetailModal()}
        {renderVoucherModal()}
      </VStack>
    </Box>
  );

  // Modal para crear vale
  const renderVoucherModal = () => (
    <Modal isOpen={isVoucherOpen} onClose={onVoucherClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Crear Nuevo Vale</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Cliente</FormLabel>
              <Select
                value={voucherForm.clientId}
                onChange={(e) => setVoucherForm({ ...voucherForm, clientId: e.target.value })}
                placeholder="Selecciona un cliente"
              >
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name} - {client.phone}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Producto</FormLabel>
              <Select
                value={voucherForm.productId}
                onChange={(e) => {
                  const product = products.find(p => p.id === parseInt(e.target.value));
                  setVoucherForm({ 
                    ...voucherForm, 
                    productId: e.target.value,
                    unitPrice: product ? parseFloat(product.unitPrice) : 0
                  });
                }}
                placeholder="Selecciona un producto"
              >
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} - S/ {parseFloat(product.unitPrice).toFixed(2)}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Cantidad</FormLabel>
              <Input
                type="number"
                value={voucherForm.quantity}
                onChange={(e) => setVoucherForm({ ...voucherForm, quantity: parseInt(e.target.value) })}
                min="1"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Precio Unitario</FormLabel>
              <Input
                type="number"
                value={voucherForm.unitPrice}
                onChange={(e) => setVoucherForm({ ...voucherForm, unitPrice: parseFloat(e.target.value) })}
                step="0.01"
                min="0"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Notas (opcional)</FormLabel>
              <Textarea
                value={voucherForm.notes}
                onChange={(e) => setVoucherForm({ ...voucherForm, notes: e.target.value })}
                placeholder="Observaciones sobre el vale..."
                rows={3}
              />
            </FormControl>

            <Card variant="outline" w="full">
              <CardBody>
                <VStack spacing={2}>
                  <HStack justify="space-between" w="full">
                    <Text>Cantidad:</Text>
                    <Text fontWeight="bold">{voucherForm.quantity}</Text>
                  </HStack>
                  <HStack justify="space-between" w="full">
                    <Text>Precio unitario:</Text>
                    <Text fontWeight="bold">S/ {voucherForm.unitPrice.toFixed(2)}</Text>
                  </HStack>
                  <Divider />
                  <HStack justify="space-between" w="full">
                    <Text fontWeight="bold">Total:</Text>
                    <Text fontWeight="bold" color="green.600">
                      S/ {(voucherForm.quantity * voucherForm.unitPrice).toFixed(2)}
                    </Text>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" mr={3} onClick={onVoucherClose}>
            Cancelar
          </Button>
          <Button 
            colorScheme="blue" 
            onClick={handleCreateVoucher}
            isDisabled={!voucherForm.clientId || !voucherForm.productId || voucherForm.quantity <= 0 || voucherForm.unitPrice <= 0}
          >
            Crear Vale
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DeliveryDashboardNew;
