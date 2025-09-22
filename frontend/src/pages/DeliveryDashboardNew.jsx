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
  FaBox,
  FaUser,
  FaPhone,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaQrcode,
  FaCalendarAlt,
  FaDirections,
  FaWhatsapp,
  FaPlay,
  FaEye,
  FaPlus,
  FaCreditCard,
  FaExclamationTriangle
} from 'react-icons/fa';
import useAuthStore from '../stores/authStore';
import useGuestOrderStore from '../stores/guestOrderStore';
import axios from '../utils/axios';

const DeliveryDashboardNew = () => {
  const { user } = useAuthStore();
  const { updateGuestOrder } = useGuestOrderStore();
  const toast = useToast();
  
  // Estados
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('orders');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  
  // Disclosures para modales
  const { isOpen: isStatusOpen, onOpen: onStatusOpen, onClose: onStatusClose } = useDisclosure();
  const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure();
  const { isOpen: isVoucherOpen, onOpen: onVoucherOpen, onClose: onVoucherClose } = useDisclosure();
  
  // Estados para el modal de voucher
  const [voucherForm, setVoucherForm] = useState({
    clientId: '',
    productId: '',
    quantity: 1,
    notes: ''
  });

  // Cargar datos al montar
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
      console.log('🔍 DeliveryDashboard - Usuario actual:', user);
      console.log('🔍 DeliveryDashboard - ID del usuario:', user?.id);
      
      // Usar la ruta específica para repartidores
      const response = await axios.get('/api/delivery/orders');
      
      console.log('🔍 DeliveryDashboard - Respuesta del servidor:', response.data);
      
      if (response.data.success) {
        const allOrders = response.data.data || [];
        console.log('🔍 DeliveryDashboard - Pedidos recibidos:', allOrders.length);
        
        // Asegurar que orders sea siempre un array
        setOrders(Array.isArray(allOrders) ? allOrders : []);
      } else {
        console.error('Error en la respuesta:', response.data.message);
        setOrders([]);
      }
    } catch (error) {
      console.error('Error al cargar pedidos:', error);
      setOrders([]);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los pedidos',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchVouchers = async () => {
    try {
      const response = await axios.get(`/api/vouchers/delivery-person/${user?.id}`);
      console.log('🔍 DeliveryDashboard - Vales recibidos:', response.data);
      
      if (response.data.success) {
        const allVouchers = response.data.data || [];
        setVouchers(Array.isArray(allVouchers) ? allVouchers : []);
      } else {
        setVouchers([]);
      }
    } catch (error) {
      console.error('Error al cargar vales:', error);
      setVouchers([]);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await axios.get('/api/clients');
      if (response.data.success && Array.isArray(response.data.data)) {
        setClients(response.data.data);
      } else {
        setClients([]);
      }
    } catch (error) {
      console.error('Error al cargar clientes:', error);
      setClients([]);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/api/products');
      if (response.data.success && Array.isArray(response.data.data)) {
        setProducts(response.data.data);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Error al cargar productos:', error);
      setProducts([]);
    }
  };

  // Funciones de utilidad
  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'blue';
      case 'preparing': return 'yellow';
      case 'ready': return 'purple';
      case 'delivered': return 'green';
      case 'cancelled': return 'red';
      default: return 'gray';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed': return 'Confirmado';
      case 'preparing': return 'Preparando';
      case 'ready': return 'Listo';
      case 'delivered': return 'Entregado';
      case 'cancelled': return 'Cancelado';
      default: return 'Desconocido';
    }
  };

  const getPaymentIcon = (paymentType, paymentMethod) => {
    // Para suscripciones, usar un icono específico
    if (paymentMethod === 'suscripcion') {
      return FaCalendarAlt;
    }
    
    switch (paymentType) {
      case 'cash':
      case 'efectivo': 
        return FaMoneyBillWave;
      case 'plin': 
        return FaQrcode;
      case 'yape': 
        return FaQrcode;
      case 'transfer': 
        return FaCreditCard;
      default: 
        return FaMoneyBillWave;
    }
  };

  // Estadísticas
  const orderStats = {
    total: orders.length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    ready: orders.filter(o => o.status === 'ready').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length
  };

  // Filtrar pedidos
  const filteredOrders = orders.filter(order => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'asignado') return order.status === 'confirmed';
    if (statusFilter === 'en_camino') return order.status === 'preparing' || order.status === 'ready';
    if (statusFilter === 'entregado') return order.status === 'delivered';
    return true;
  });

  // Funciones de navegación
  const openWhatsApp = (phone, message) => {
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/51${phone}?text=${encodedMessage}`, '_blank');
  };

  const openDirections = (address) => {
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
  };

  // Funciones de modal
  const openDetailModal = (order) => {
    setSelectedOrder(order);
    onDetailOpen();
  };

  const openStatusModal = (order, newStatus) => {
    setSelectedOrder({ ...order, newStatus });
    onStatusOpen();
  };

  const handleStatusUpdate = async () => {
    if (!selectedOrder) return;
    
    try {
      const updateData = { status: selectedOrder.newStatus };
      await updateGuestOrder(selectedOrder.id, updateData);
      
      toast({
        title: 'Estado actualizado',
        description: `El pedido ahora está ${getStatusText(selectedOrder.newStatus).toLowerCase()}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      onStatusClose();
      setSelectedOrder(null);
      
      // Actualizar la lista de pedidos
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

  // Renderizar tarjeta de pedido optimizada para móviles
  const renderOrderCard = (order) => (
    <Card key={`${order.type}-${order.id}`} variant="outline" shadow="sm" borderRadius="lg">
      <CardBody p={{ base: 3, md: 4 }}>
        <VStack spacing={{ base: 2, md: 3 }} align="stretch">
          {/* Header del pedido optimizado */}
          <HStack justify="space-between" w="full">
            <VStack align="start" spacing={0.5} flex={1} minW={0}>
              <Text fontWeight="bold" fontSize={{ base: "sm", md: "md" }} noOfLines={1}>
                {order.orderNumber || `#${order.id}`}
              </Text>
              <Text fontSize={{ base: "2xs", md: "xs" }} color="gray.500" noOfLines={1}>
                {order.type === 'regular' ? 'Cliente Frecuente' : 'Cliente Visitante'}
              </Text>
            </VStack>
            <Badge 
              colorScheme={getStatusColor(order.status)}
              fontSize={{ base: "2xs", md: "xs" }}
              px={{ base: 1, md: 2 }}
              py={0.5}
            >
              {getStatusText(order.status)}
            </Badge>
          </HStack>

          {/* Información del cliente optimizada para móviles */}
          <VStack spacing={{ base: 1.5, md: 2 }} align="stretch">
            <HStack spacing={2} w="full">
              <FaUser size={12} color="#718096" />
              <Text fontSize={{ base: "xs", md: "sm" }} fontWeight="medium" noOfLines={1} flex={1}>
                {order.clientName || order.client?.name || 'Sin nombre'}
              </Text>
            </HStack>
            
            <HStack spacing={2} w="full">
              <FaPhone size={12} color="#718096" />
              <Text fontSize={{ base: "xs", md: "sm" }} noOfLines={1} flex={1}>
                {order.clientPhone || order.client?.phone || 'Sin teléfono'}
              </Text>
              <Tooltip label="Enviar WhatsApp">
                <IconButton
                  size="sm"
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
            
            <HStack spacing={2} w="full">
              <FaMapMarkerAlt size={12} color="#718096" />
              <Text fontSize={{ base: "xs", md: "sm" }} noOfLines={2} flex={1}>
                {order.clientAddress || order.client?.address || 'Sin dirección'}
              </Text>
              <Tooltip label="Abrir en Google Maps">
                <IconButton
                  size="sm"
                  icon={<FaDirections />}
                  colorScheme="blue"
                  variant="ghost"
                  onClick={() => openDirections(order.clientAddress || order.client?.address)}
                />
              </Tooltip>
            </HStack>
            
            {/* Distrito del cliente */}
            <HStack spacing={2} w="full">
              <FaMapMarkerAlt size={12} color="#718096" />
              <Text fontSize={{ base: "xs", md: "sm" }} noOfLines={1} flex={1}>
                Distrito: {order.clientDistrict || order.client?.district || order.deliveryDistrict || 'Sin distrito'}
              </Text>
            </HStack>
          </VStack>

          {/* Información de pago optimizada */}
          <VStack spacing={2} align="stretch" w="full">
            {/* Debug info - remover después */}
            {process.env.NODE_ENV === 'development' && (
              <Text fontSize="2xs" color="gray.500">
                DEBUG: paymentMethod={order.paymentMethod}, paymentType={order.paymentType}
              </Text>
            )}
            
            <HStack justify="space-between" w="full">
              <HStack spacing={2} flex={1} minW={0}>
                <Icon as={getPaymentIcon(order.paymentType, order.paymentMethod)} size={14} />
                <Text fontSize={{ base: "xs", md: "sm" }} noOfLines={1}>
                {order.paymentMethod === 'vale' ? 'A Crédito (Vale)' :
                 order.paymentMethod === 'suscripcion' ? 'Suscripción' :
                   order.paymentMethod === 'contraentrega' ? 
                     (order.paymentType === 'plin' ? 'Contraentrega - PLIN' :
                      order.paymentType === 'yape' ? 'Contraentrega - Yape' :
                      order.paymentType === 'cash' ? 'Contraentrega - Efectivo' : 'Contraentrega') :
                   order.paymentType === 'plin' ? 'PLIN' :
                   order.paymentType === 'yape' ? 'Yape' :
                   order.paymentType === 'cash' ? 'Efectivo' : 'Efectivo'}
              </Text>
            </HStack>
              <Text fontWeight="bold" fontSize={{ base: "xs", md: "sm" }} color={order.paymentMethod === 'vale' ? 'orange.600' : 'green.600'}>
              {order.paymentMethod === 'vale' ? 'Sin cobro' : `S/ ${parseFloat(order.total || order.totalAmount || 0).toFixed(2)}`}
            </Text>
          </HStack>

            {/* Instrucción clara para el repartidor */}
            <Badge 
              colorScheme={
                order.paymentMethod === 'vale' ? 'orange' :
                order.paymentMethod === 'suscripcion' ? 'purple' :
                order.paymentType === 'plin' || order.paymentType === 'yape' ? 'blue' : 'green'
              }
              fontSize={{ base: "2xs", md: "xs" }}
              px={2}
              py={1}
              borderRadius="md"
            >
              {order.paymentMethod === 'vale' ? '💳 NO COBRAR - A Crédito' :
               order.paymentMethod === 'suscripcion' ? '📅 NO COBRAR - Suscripción' :
               order.paymentType === 'plin' ? '📱 NO COBRAR - Pago Digital' :
               order.paymentType === 'yape' ? '📱 NO COBRAR - Pago Digital' :
               '💰 COBRAR - Efectivo'}
            </Badge>
          </VStack>

          {/* Productos del pedido optimizados */}
          {order.products && order.products.length > 0 && (
            <VStack spacing={{ base: 1, md: 1.5 }} align="stretch">
              <Text fontSize={{ base: "2xs", md: "xs" }} fontWeight="bold" color="gray.600">Productos:</Text>
              {Array.isArray(order.products) && order.products.map((product, index) => (
                <HStack key={index} justify="space-between" fontSize={{ base: "2xs", md: "xs" }} w="full">
                  <Text noOfLines={1} flex={1} minW={0}>
                    {product.name || product.productName}
                  </Text>
                  <Text fontWeight="bold" color="blue.600" flexShrink={0} px={1}>
                    x{product.quantity}
                  </Text>
                  <Text color="green.600" minW="fit-content" textAlign="right" flexShrink={0}>
                    S/ {parseFloat(product.unitPrice || product.price || 0).toFixed(2)}
                  </Text>
                </HStack>
              ))}
            </VStack>
          )}

          {/* Notas especiales optimizadas */}
          {order.paymentMethod === 'vale' && (
            <Alert status="warning" size="sm" borderRadius="md">
              <AlertIcon />
              <Text fontSize={{ base: "2xs", md: "xs" }} fontWeight="bold" noOfLines={1}>
                ⚠️ PEDIDO A CRÉDITO - NO COBRAR NADA
              </Text>
            </Alert>
          )}
          
          {order.notes && (
            <Alert status="info" size="sm" borderRadius="md">
              <AlertIcon />
              <Text fontSize={{ base: "2xs", md: "xs" }} noOfLines={2}>{order.notes}</Text>
            </Alert>
          )}

          {/* Acciones optimizadas para móviles */}
          <VStack spacing={{ base: 2, md: 3 }} align="stretch">
          <HStack spacing={2} justify="center">
            <Tooltip label="Ver detalles">
              <IconButton
                  size={{ base: "sm", md: "md" }}
                icon={<FaEye />}
                onClick={() => openDetailModal(order)}
                aria-label="Ver detalles"
                  colorScheme="blue"
                  variant="outline"
              />
            </Tooltip>
            </HStack>
            
            {/* Botones de estado optimizados para móviles */}
            {order.status === 'confirmed' && (
              <Button
                size={{ base: "sm", md: "md" }}
                colorScheme="purple"
                leftIcon={<FaPlay />}
                onClick={() => openStatusModal(order, 'preparing')}
                w="full"
                fontSize={{ base: "xs", md: "sm" }}
              >
                Iniciar Preparación
              </Button>
            )}
            
            {order.status === 'preparing' && (
              <Button
                size={{ base: "sm", md: "md" }}
                colorScheme="blue"
                leftIcon={<FaTruck />}
                onClick={() => openStatusModal(order, 'ready')}
                w="full"
                fontSize={{ base: "xs", md: "sm" }}
              >
                Listo para Entrega
              </Button>
            )}
            
            {order.status === 'ready' && (
              <Button
                size={{ base: "sm", md: "md" }}
                colorScheme="green"
                leftIcon={<FaCheckCircle />}
                onClick={() => openStatusModal(order, 'delivered')}
                w="full"
                fontSize={{ base: "xs", md: "sm" }}
              >
                Marcar Entregado
              </Button>
            )}
          </VStack>
        </VStack>
      </CardBody>
    </Card>
  );

  // Modales
  const renderStatusModal = () => (
    <Modal isOpen={isStatusOpen} onClose={onStatusClose} size="md" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Actualizar Estado del Pedido</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            {selectedOrder && (
              <>
                <Text>¿Confirmar cambio de estado del pedido #{selectedOrder.id}?</Text>
                <Text fontWeight="bold">
                  {selectedOrder.newStatus === 'preparing' && 'Iniciar Preparación'}
                  {selectedOrder.newStatus === 'ready' && 'Marcar como Listo'}
                  {selectedOrder.newStatus === 'delivered' && 'Marcar como Entregado'}
                  </Text>
              </>
            )}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onStatusClose}>
            Cancelar
          </Button>
          <Button colorScheme="blue" onClick={handleStatusUpdate}>
            Confirmar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );

  const renderDetailModal = () => (
    <Modal isOpen={isDetailOpen} onClose={onDetailClose} size="lg" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Detalles del Pedido</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {selectedOrder && (
            <VStack spacing={4} align="stretch">
              <Text fontWeight="bold" fontSize="lg">Pedido #{selectedOrder.id}</Text>
              
              <Divider />
              
              <VStack spacing={3} align="stretch">
                    <HStack justify="space-between">
                  <Text fontWeight="bold">Cliente:</Text>
                  <Text>{selectedOrder.clientName || selectedOrder.client?.name || 'Sin nombre'}</Text>
                    </HStack>
                    
                    <HStack justify="space-between">
                      <Text fontWeight="bold">Teléfono:</Text>
                  <Text>{selectedOrder.clientPhone || selectedOrder.client?.phone || 'Sin teléfono'}</Text>
                    </HStack>
                    
                    <HStack justify="space-between">
                      <Text fontWeight="bold">Dirección:</Text>
                  <Text>{selectedOrder.clientAddress || selectedOrder.client?.address || 'Sin dirección'}</Text>
                    </HStack>
                    
                    <HStack justify="space-between">
                      <Text fontWeight="bold">Distrito:</Text>
                  <Text>{selectedOrder.clientDistrict || selectedOrder.client?.district || selectedOrder.deliveryDistrict || 'Sin distrito'}</Text>
                    </HStack>
                
                    <HStack justify="space-between">
                  <Text fontWeight="bold">Estado:</Text>
                  <Badge colorScheme={getStatusColor(selectedOrder.status)}>
                    {getStatusText(selectedOrder.status)}
                  </Badge>
                </HStack>
                
                <HStack justify="space-between">
                  <Text fontWeight="bold">Método de pago:</Text>
                      <HStack>
                    <Icon as={getPaymentIcon(selectedOrder.paymentType, selectedOrder.paymentMethod)} size={16} />
                        <Text>
                          {selectedOrder.paymentMethod === 'vale' ? 'A Crédito (Vale)' :
                           selectedOrder.paymentMethod === 'suscripcion' ? 'Suscripción' :
                       selectedOrder.paymentMethod === 'contraentrega' ? 
                         (selectedOrder.paymentType === 'plin' ? 'Contraentrega - PLIN' :
                          selectedOrder.paymentType === 'yape' ? 'Contraentrega - Yape' :
                          selectedOrder.paymentType === 'cash' ? 'Contraentrega - Efectivo' : 'Contraentrega') :
                       selectedOrder.paymentType === 'plin' ? 'PLIN' :
                       selectedOrder.paymentType === 'yape' ? 'Yape' :
                       selectedOrder.paymentType === 'cash' ? 'Efectivo' : 'Efectivo'}
                        </Text>
                      </HStack>
                    </HStack>
                    
                    <HStack justify="space-between">
                      <Text fontWeight="bold">Total:</Text>
                      <Text fontWeight="bold" color={selectedOrder.paymentMethod === 'vale' ? 'orange.600' : 'green.600'}>
                    {selectedOrder.paymentMethod === 'vale' ? 'Sin cobro' : `S/ ${parseFloat(selectedOrder.total || selectedOrder.totalAmount || 0).toFixed(2)}`}
                      </Text>
                    </HStack>

                {/* Instrucción clara para el repartidor */}
                <Alert 
                  status={
                    selectedOrder.paymentMethod === 'vale' ? 'warning' :
                    selectedOrder.paymentMethod === 'suscripcion' ? 'info' :
                    selectedOrder.paymentType === 'plin' || selectedOrder.paymentType === 'yape' ? 'info' : 'success'
                  }
                  borderRadius="md"
                >
                        <AlertIcon />
                        <Text fontSize="sm" fontWeight="bold">
                    {selectedOrder.paymentMethod === 'vale' ? '💳 NO COBRAR - Este pedido es a crédito' :
                     selectedOrder.paymentMethod === 'suscripcion' ? '📅 NO COBRAR - Este pedido es por suscripción' :
                     selectedOrder.paymentType === 'plin' ? '📱 NO COBRAR - El cliente pagará por PLIN' :
                     selectedOrder.paymentType === 'yape' ? '📱 NO COBRAR - El cliente pagará por Yape' :
                     '💰 COBRAR - El cliente pagará en efectivo'}
                        </Text>
                      </Alert>
                  </VStack>
              
              {/* Productos del pedido */}
              {selectedOrder.products && selectedOrder.products.length > 0 && (
                <>
                  <Divider />
                  <VStack spacing={2} align="stretch">
                    <Text fontWeight="bold">Productos:</Text>
                    {Array.isArray(selectedOrder.products) && selectedOrder.products.map((product, index) => (
                      <HStack key={index} justify="space-between" fontSize="sm">
                        <Text flex={1}>
                          {product.product?.name || product.name || 'Producto desconocido'}
                        </Text>
                        <Text fontWeight="bold">
                          {product.quantity} x S/ {parseFloat(product.price || product.unitPrice || 0).toFixed(2)}
                        </Text>
                      </HStack>
                    ))}
                  </VStack>
                </>
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

  const renderVoucherModal = () => (
    <Modal isOpen={isVoucherOpen} onClose={onVoucherClose} size="md" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Crear Nuevo Vale</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel>Cliente</FormLabel>
              <Select placeholder="Seleccionar cliente">
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel>Producto</FormLabel>
              <Select placeholder="Seleccionar producto">
                {products.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel>Cantidad</FormLabel>
              <Input type="number" min="1" defaultValue="1" />
            </FormControl>
            <FormControl>
              <FormLabel>Notas</FormLabel>
              <Textarea placeholder="Notas adicionales..." />
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onVoucherClose}>
            Cancelar
          </Button>
          <Button colorScheme="blue" onClick={onVoucherClose}>
            Crear Vale
          </Button>
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
    <Box p={{ base: 2, sm: 3, md: 6 }} minH="100vh" bg="gray.50">
      <VStack spacing={{ base: 3, md: 6 }} align="stretch">
        {/* Header optimizado para móviles */}
        <Box bg="white" p={{ base: 3, md: 4 }} borderRadius="lg" shadow="sm">
          <VStack spacing={2} align="start">
            <Heading size={{ base: "sm", md: "lg" }} color="gray.800">
            Panel de Repartidor
          </Heading>
            <Text color="gray.600" fontSize={{ base: "xs", md: "md" }}>
            Bienvenido, {(() => {
              console.log('🔍 Verificando nombre del usuario:', {
                firstName: user?.firstName,
                lastName: user?.lastName,
                username: user?.username,
                hasFirstName: !!user?.firstName,
                hasLastName: !!user?.lastName,
                bothNames: !!(user?.firstName && user?.lastName)
              });
              return user?.firstName && user?.lastName 
                ? `${user.firstName} ${user.lastName}` 
                : user?.username || 'Repartidor';
            })()}. Gestiona tus entregas asignadas.
          </Text>
          </VStack>
        </Box>

        {/* Estadísticas rápidas optimizadas para móviles */}
        <SimpleGrid columns={{ base: 2, sm: 4 }} spacing={{ base: 2, md: 4 }}>
          <Card shadow="sm" borderRadius="lg">
            <CardBody textAlign="center" p={{ base: 2, md: 4 }}>
              <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" color="blue.600">
                {orderStats.total}
              </Text>
              <Text fontSize={{ base: "2xs", md: "sm" }} color="gray.600" noOfLines={1}>
                Total Pedidos
              </Text>
            </CardBody>
          </Card>
          <Card shadow="sm" borderRadius="lg">
            <CardBody textAlign="center" p={{ base: 2, md: 4 }}>
              <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" color="orange.600">
                {orderStats.confirmed + orderStats.preparing + orderStats.ready}
              </Text>
              <Text fontSize={{ base: "2xs", md: "sm" }} color="gray.600" noOfLines={1}>
                En Proceso
              </Text>
            </CardBody>
          </Card>
          <Card shadow="sm" borderRadius="lg">
            <CardBody textAlign="center" p={{ base: 2, md: 4 }}>
              <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" color="green.600">
                {orderStats.delivered}
              </Text>
              <Text fontSize={{ base: "2xs", md: "sm" }} color="gray.600" noOfLines={1}>
                Entregados
              </Text>
            </CardBody>
          </Card>
          <Card shadow="sm" borderRadius="lg">
            <CardBody textAlign="center" p={{ base: 2, md: 4 }}>
              <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" color="red.600">
                {orderStats.cancelled}
              </Text>
              <Text fontSize={{ base: "2xs", md: "sm" }} color="gray.600" noOfLines={1}>
                Cancelados
              </Text>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Tabs optimizadas para móviles */}
        <Box bg="white" borderRadius="lg" shadow="sm" overflow="hidden">
        <Tabs index={activeTab === 'orders' ? 0 : 1} onChange={(index) => setActiveTab(index === 0 ? 'orders' : 'vouchers')}>
            <TabList bg="gray.50" p={1}>
              <Tab 
                fontSize={{ base: "xs", md: "sm" }} 
                px={{ base: 2, md: 4 }}
                py={{ base: 2, md: 3 }}
                _selected={{ bg: "white", shadow: "sm" }}
                flex={1}
                minW={0}
              >
                <VStack spacing={1}>
                  <FaBox size={12} />
                  <Text fontSize={{ base: "2xs", md: "xs" }} noOfLines={1}>
                    Pedidos ({orders.length})
                  </Text>
                </VStack>
            </Tab>
              <Tab 
                fontSize={{ base: "xs", md: "sm" }} 
                px={{ base: 2, md: 4 }}
                py={{ base: 2, md: 3 }}
                _selected={{ bg: "white", shadow: "sm" }}
                flex={1}
                minW={0}
              >
                <VStack spacing={1}>
                  <FaMoneyBillWave size={12} />
                  <Text fontSize={{ base: "2xs", md: "xs" }} noOfLines={1}>
                    Vales ({vouchers.length})
                  </Text>
                </VStack>
            </Tab>
          </TabList>

          <TabPanels>
              <TabPanel px={{ base: 2, md: 4 }} py={{ base: 3, md: 4 }}>
                {/* Filtros optimizados para móviles */}
                <Card shadow="sm" mb={4}>
                  <CardBody p={{ base: 3, md: 4 }}>
                    <VStack spacing={{ base: 3, md: 4 }} align="stretch">
                      <FormControl>
                        <FormLabel fontSize={{ base: "sm", md: "md" }}>Filtrar por Estado</FormLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                          size={{ base: "sm", md: "md" }}
                >
                          <option value="all">Todos los pedidos</option>
                  <option value="asignado">Asignados</option>
                  <option value="en_camino">En Camino</option>
                  <option value="entregado">Entregados</option>
                </Select>
              </FormControl>
              
                      <Text fontSize={{ base: "xs", md: "sm" }} color="gray.600" textAlign="center">
                  Mostrando {filteredOrders.length} de {orders.length} pedidos
                </Text>
                    </VStack>
          </CardBody>
        </Card>

                {/* Lista de pedidos optimizada para móviles */}
        {filteredOrders.length > 0 ? (
                  <VStack spacing={{ base: 3, md: 4 }} align="stretch">
            {filteredOrders.map(renderOrderCard)}
                  </VStack>
        ) : (
                  <Center h="200px" bg="white" borderRadius="lg" shadow="sm">
            <VStack spacing={4}>
              <Icon as={FaBox} boxSize={12} color="gray.400" />
                      <Text color="gray.500" fontSize={{ base: "sm", md: "lg" }} textAlign="center">
                No hay pedidos {statusFilter === 'all' ? '' : `con estado ${getStatusText(statusFilter).toLowerCase()}`}
              </Text>
              <Button
                variant="outline"
                        size={{ base: "sm", md: "md" }}
                onClick={() => setStatusFilter('all')}
              >
                Ver todos los pedidos
              </Button>
            </VStack>
          </Center>
            )}
            </TabPanel>

              <TabPanel px={{ base: 2, md: 4 }} py={{ base: 3, md: 4 }}>
                <VStack spacing={{ base: 4, md: 6 }} align="stretch">
                  {/* Header de vales optimizado para móviles */}
                  <Box bg="white" p={{ base: 3, md: 4 }} borderRadius="lg" shadow="sm">
                    <VStack spacing={2} align="start">
                      <Heading size={{ base: "sm", md: "md" }} color="gray.800">
                        Mis Vales
                      </Heading>
                      <Text color="gray.600" fontSize={{ base: "xs", md: "sm" }}>
                      Gestiona los vales que has creado
                    </Text>
                  </VStack>
                  </Box>
                  
                  {/* Botón crear vale optimizado */}
                  <Box>
                  <Button
                    colorScheme="blue"
                    leftIcon={<FaPlus />}
                    onClick={onVoucherOpen}
                      size={{ base: "sm", md: "md" }}
                      w="full"
                  >
                      Crear Nuevo Vale
                  </Button>
                  </Box>

                  {/* Lista de vales optimizada para móviles */}
                {vouchers.length > 0 ? (
                    <VStack spacing={{ base: 3, md: 4 }} align="stretch">
                    {vouchers.map((voucher) => (
                        <Card key={voucher.id} variant="outline" shadow="sm" borderRadius="lg">
                          <CardBody p={{ base: 3, md: 4 }}>
                            <VStack spacing={{ base: 2, md: 3 }} align="stretch">
                              <HStack justify="space-between" w="full">
                                <Text fontWeight="bold" fontSize={{ base: "sm", md: "md" }}>
                                Vale #{voucher.id}
                              </Text>
                                <Badge 
                                  colorScheme={
                                voucher.status === 'pending' ? 'orange' :
                                voucher.status === 'delivered' ? 'blue' : 'green'
                                  }
                                  fontSize={{ base: "2xs", md: "xs" }}
                                >
                                {voucher.status === 'pending' ? 'Pendiente' :
                                 voucher.status === 'delivered' ? 'Entregado' : 'Pagado'}
                              </Badge>
                            </HStack>

                              <VStack spacing={{ base: 1, md: 2 }} align="stretch">
                              <HStack spacing={2}>
                                <FaUser size={12} color="#718096" />
                                  <Text fontSize={{ base: "xs", md: "sm" }} noOfLines={1}>
                                  {voucher.Client?.name || 'Cliente no encontrado'}
                                </Text>
                              </HStack>
                              
                              <HStack spacing={2}>
                                <FaBox size={12} color="#718096" />
                                  <Text fontSize={{ base: "xs", md: "sm" }} noOfLines={1}>
                                  {voucher.product?.name || 'Producto no especificado'}
                                </Text>
                              </HStack>
                              
                              <HStack spacing={2}>
                                  <Text fontSize={{ base: "xs", md: "sm" }}>Cantidad:</Text>
                                  <Text fontWeight="bold" fontSize={{ base: "xs", md: "sm" }}>{voucher.quantity}</Text>
                              </HStack>
                              
                                <HStack justify="space-between" w="full">
                                  <Text fontSize={{ base: "xs", md: "sm" }}>Total:</Text>
                                  <Text fontWeight="bold" color="green.600" fontSize={{ base: "xs", md: "sm" }}>
                                    S/ {parseFloat(voucher.totalAmount || 0).toFixed(2)}
                                </Text>
                              </HStack>
                            </VStack>
                          </VStack>
                        </CardBody>
                      </Card>
                    ))}
                    </VStack>
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
        </Box>

        {/* Modales */}
        {renderStatusModal()}
        {renderDetailModal()}
        {renderVoucherModal()}
      </VStack>
    </Box>
  );
};

export default DeliveryDashboardNew;