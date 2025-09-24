import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  Input,
  InputGroup,
  InputLeftElement,
  useToast,
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
  Select,
  Textarea,
  Alert,
  AlertIcon,
  Spinner,
  Center,
  SimpleGrid,
  useBreakpointValue,
  Divider,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Tooltip,
  Avatar,
  Tag,
  TagLabel,
  TagLeftIcon,
  Icon
} from '@chakra-ui/react';
import { 
  SearchIcon, 
  EditIcon, 
  ViewIcon
} from '@chakra-ui/icons';
import { 
  FaTruck as FaTruckIcon, 
  FaUser as FaUserIcon, 
  FaMapMarkerAlt as FaMapIcon, 
  FaPhone as FaPhoneIcon,
  FaMoneyBillWave,
  FaQrcode,
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaDownload
} from 'react-icons/fa';
import useGuestOrderStore from '../stores/guestOrderStore';
import useDeliveryStore from '../stores/deliveryStore';

const OrdersManagement = () => {
  // Stores - Solo usar guest orders
  const {
    orders: guestOrders,
    loading: guestOrdersLoading,
    fetchOrders: fetchGuestOrders,
    fetchOrdersSilently,
    updateGuestOrder
  } = useGuestOrderStore();

  const {
    deliveryPersons,
    fetchDeliveryPersons
  } = useDeliveryStore();

  // Estados locales
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedDeliveryPerson, setSelectedDeliveryPerson] = useState('');
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isSilentlyUpdating, setIsSilentlyUpdating] = useState(false);
  const [notes, setNotes] = useState('');
  
  // Modales
  const { isOpen: isAssignOpen, onOpen: onAssignOpen, onClose: onAssignClose } = useDisclosure();
  const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure();
  const { isOpen: isCancelOpen, onOpen: onCancelOpen, onClose: onCancelClose } = useDisclosure();
  
  const toast = useToast();

  useEffect(() => {
    fetchGuestOrders();
    fetchDeliveryPersons();
    
    // Actualizar cada 30 segundos para mantener sincronización (silenciosamente)
    const interval = setInterval(async () => {
      setIsSilentlyUpdating(true);
      await fetchOrdersSilently();
      setLastUpdate(new Date());
      setIsSilentlyUpdating(false);
    }, 30000);
    
    return () => clearInterval(interval);
  }, [fetchGuestOrders, fetchDeliveryPersons]);

  // Solo usar guest orders (sistema simplificado)
  const allOrders = guestOrders.map(order => ({ 
    ...order, 
    type: 'guest',
    orderNumber: order.orderNumber || `PED-${order.id}`,
    // Asegurar que tenemos los datos del cliente
    clientName: order.clientName || order.customerName,
    clientPhone: order.clientPhone || order.customerPhone,
    clientAddress: order.clientAddress || order.deliveryAddress,
    clientDistrict: order.clientDistrict || order.deliveryDistrict
  })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Debug: Mostrar información de los pedidos
  console.log('🔍 Pedidos cargados:', allOrders.length);
  console.log('🔍 Repartidores cargados:', deliveryPersons.length);
  console.log('🔍 Primer pedido completo:', allOrders[0]);
  console.log('🔍 Estructura del cliente:', allOrders[0]?.Client);
  console.log('🔍 Datos del cliente:', {
    clientName: allOrders[0]?.clientName,
    clientPhone: allOrders[0]?.clientPhone,
    clientAddress: allOrders[0]?.clientAddress,
    Client: allOrders[0]?.Client,
    deliveryAddress: allOrders[0]?.deliveryAddress,
    deliveryDistrict: allOrders[0]?.deliveryDistrict
  });
  
  // Log de pedidos con deliveryPersonId
  const assignedOrders = allOrders.filter(order => order.deliveryPersonId);
  console.log('🔍 Pedidos asignados:', assignedOrders.length);
  assignedOrders.forEach(order => {
    console.log(`🔍 Pedido ${order.id} asignado a repartidor ${order.deliveryPersonId}:`, {
      id: order.id,
      status: order.status,
      deliveryPersonId: order.deliveryPersonId,
      deliveryPerson: order.deliveryPerson
    });
  });
  
  // Debug de repartidores
  console.log('🔍 Repartidores disponibles:', deliveryPersons.map(dp => ({
    id: dp.id,
    name: dp.name,
    type: typeof dp.id
  })));
  
  // Debug específico para cada pedido
  allOrders.forEach((order, index) => {
    if (index < 3) { // Solo los primeros 3 para no saturar
      console.log(`🔍 Pedido ${index + 1}:`, {
        id: order.id,
        type: order.type,
        clientName: order.clientName,
        clientPhone: order.clientPhone,
        Client: order.Client,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        deliveryAddress: order.deliveryAddress,
        products: order.products,
        orderDetails: order.orderDetails
      });
    }
  });

  // Filtrar pedidos
  const filteredOrders = (allOrders || []).filter(order => {
    const matchesSearch = order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.client?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    const matchesPayment = paymentFilter === 'all' || 
                          (paymentFilter === 'efectivo' && order.paymentType === 'efectivo') ||
                          (paymentFilter === 'plin' && order.paymentType === 'plin') ||
                          (paymentFilter === 'vale' && order.paymentMethod === 'vale') ||
                          (paymentFilter === 'suscripcion' && order.paymentMethod === 'suscripcion') ||
                          (paymentFilter === 'contraentrega' && order.paymentMethod === 'contraentrega');

    return matchesSearch && matchesStatus && matchesPayment;
  });

  // Agrupar pedidos por estado
  const ordersByStatus = {
    pending: filteredOrders.filter(order => order.status === 'pending') || [],
    confirmed: filteredOrders.filter(order => order.status === 'confirmed') || [],
    preparing: filteredOrders.filter(order => order.status === 'preparing') || [],
    ready: filteredOrders.filter(order => order.status === 'ready') || [],
    delivered: filteredOrders.filter(order => order.status === 'delivered') || [],
    cancelled: filteredOrders.filter(order => order.status === 'cancelled') || []
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'orange';
      case 'confirmed': return 'blue';
      case 'preparing': return 'yellow';
      case 'ready': return 'purple';
      case 'delivered': return 'green';
      case 'cancelled': return 'red';
      // Compatibilidad con status en español
      case 'pendiente': return 'orange';
      case 'asignado': return 'blue';
      case 'en_camino': return 'purple';
      case 'entregado': return 'green';
      case 'cancelado': return 'red';
      default: return 'gray';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'confirmed': return 'Asignado';
      case 'preparing': return 'Preparando';
      case 'ready': return 'Listo';
      case 'delivered': return 'Entregado';
      case 'cancelled': return 'Cancelado';
      // Compatibilidad con status en español
      case 'pendiente': return 'Pendiente';
      case 'asignado': return 'Asignado';
      case 'en_camino': return 'En Camino';
      case 'entregado': return 'Entregado';
      case 'cancelado': return 'Cancelado';
      default: return status;
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

  // Función para renderizar productos del pedido
  const renderOrderProducts = (order) => {
    let products = [];
    
    // Para pedidos regulares
    if (order.type === 'regular' && order.orderDetails) {
      products = order.orderDetails.map(detail => ({
        name: detail.product?.name || detail.Product?.name || 'Producto',
        quantity: detail.quantity || 0,
        price: detail.unitPrice || detail.price || 0
      }));
    }
    
    // Para pedidos de visitantes
    if (order.type === 'guest' && order.products) {
      products = order.products.map(product => ({
        name: product.product?.name || product.name || 'Producto',
        quantity: product.quantity || 0,
        price: product.price || product.unitPrice || 0
      }));
    }

    if (products.length === 0) {
      return (
        <Text fontSize="xs" color="gray.500" fontStyle="italic">
          Sin productos
        </Text>
      );
    }

    return (
      <VStack spacing={1} align="start" w="full">
        {products.map((product, index) => (
          <HStack key={index} justify="space-between" w="full" fontSize="xs">
            <Text noOfLines={1} flex={1}>
              {product.name}
            </Text>
            <Text color="gray.600" minW="fit-content">
              x{product.quantity}
            </Text>
            <Text color="green.600" fontWeight="medium" minW="fit-content">
              S/ {(product.price * product.quantity).toFixed(2)}
            </Text>
          </HStack>
        ))}
      </VStack>
    );
  };

  const handleAssignDelivery = async () => {
    if (!selectedOrder || !selectedDeliveryPerson) {
      toast({
        title: 'Datos incompletos',
        description: 'Selecciona un repartidor',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // No permitir asignar repartidor a pedidos cancelados
    if (selectedOrder.status === 'cancelled') {
      toast({
        title: 'Acción no permitida',
        description: 'No se puede asignar repartidor a un pedido cancelado',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      onAssignClose();
      return;
    }

    try {
      const updateData = {
        status: 'confirmed',
        deliveryPersonId: selectedDeliveryPerson,
        notes: notes
      };

      console.log('🔍 Asignando repartidor:', {
        orderId: selectedOrder.id,
        deliveryPersonId: selectedDeliveryPerson,
        updateData
      });

      const result = await updateGuestOrder(selectedOrder.id, updateData);
      
      console.log('🔍 Resultado de la asignación:', result);

      toast({
        title: 'Repartidor asignado',
        description: 'El pedido ha sido asignado exitosamente',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Actualizar la lista de pedidos
      fetchGuestOrders();
      
      onAssignClose();
      setSelectedOrder(null);
      setSelectedDeliveryPerson('');
      setNotes('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo asignar el repartidor',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Función para abrir modal de confirmación de anulación
  const openCancelModal = (order) => {
    setSelectedOrder(order);
    onCancelOpen();
  };

  // Función para confirmar anulación
  const handleConfirmCancel = async () => {
    if (!selectedOrder) return;
    
    try {
      const updateData = { status: 'cancelled' };
      await updateGuestOrder(selectedOrder.id, updateData);

      toast({
        title: 'Pedido anulado',
        description: `El pedido #${selectedOrder.id} ha sido anulado exitosamente`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      onCancelClose();
      setSelectedOrder(null);
      fetchGuestOrders(); // Actualizar la lista
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo anular el pedido',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleStatusUpdate = async (order, newStatus) => {
    try {
      const updateData = { status: newStatus };

      await updateGuestOrder(order.id, updateData);

      toast({
        title: 'Estado actualizado',
        description: `El pedido ahora está ${getStatusText(newStatus).toLowerCase()}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
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

  const openAssignModal = (order) => {
    // No permitir asignar repartidor a pedidos cancelados
    if (order.status === 'cancelled') {
      toast({
        title: 'Acción no permitida',
        description: 'No se puede asignar repartidor a un pedido cancelado',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setSelectedOrder(order);
    setSelectedDeliveryPerson(order.deliveryPersonId || '');
    setNotes(order.notes || '');
    onAssignOpen();
  };

  const openDetailModal = (order) => {
    console.log('🔍 Pedido seleccionado:', order);
    console.log('🔍 DeliveryPerson en el pedido:', order.deliveryPerson);
    console.log('🔍 DeliveryPersonId en el pedido:', order.deliveryPersonId);
    setSelectedOrder(order);
    onDetailOpen();
  };

  // Función para descargar boleta
  const downloadReceipt = async (order) => {
    try {
      console.log('🔍 Descargando boleta para pedido:', order);
      // Usar endpoint alternativo para admin
      const response = await fetch('/api/admin/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          orderData: {
            id: order.id,
            customerName: order.clientName || order.customerName,
            customerPhone: order.clientPhone || order.customerPhone,
            customerEmail: order.customerEmail || order.client?.email,
            deliveryAddress: order.clientAddress || order.deliveryAddress,
            deliveryDistrict: order.clientDistrict || order.deliveryDistrict,
            subtotal: order.subtotal || order.total || order.totalAmount,
            deliveryFee: order.deliveryFee || 0,
            total: order.total || order.totalAmount,
            paymentMethod: order.paymentMethod,
            paymentType: order.paymentType,
            // Mapear productos correctamente
            items: (order.products || order.orderDetails || []).map(item => ({
              name: item.product?.name || item.name || 'Producto',
              quantity: item.quantity || 1,
              price: item.price || item.unitPrice || 0,
              subtotal: item.subtotal || (item.price || item.unitPrice || 0) * (item.quantity || 1)
            })),
            products: (order.products || order.orderDetails || []).map(item => ({
              name: item.product?.name || item.name || 'Producto',
              quantity: item.quantity || 1,
              price: item.price || item.unitPrice || 0,
              subtotal: item.subtotal || (item.price || item.unitPrice || 0) * (item.quantity || 1)
            })),
            // También incluir los datos originales para debugging
            originalProducts: order.products,
            originalOrderDetails: order.orderDetails
          },
          documentType: 'boleta'
        })
      });

      console.log('🔍 Respuesta del servidor:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error del servidor:', errorText);
        throw new Error(`Error al generar la boleta: ${response.status} ${response.statusText}`);
      }

      const blob = await response.blob();
      console.log('✅ Blob generado, tamaño:', blob.size);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `boleta_${order.orderNumber || order.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'Boleta descargada',
        description: 'La boleta se ha descargado correctamente',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error al descargar boleta:', error);
      toast({
        title: 'Error',
        description: 'No se pudo descargar la boleta',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
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
                {order.orderNumber}
              </Text>
              <Text fontSize="xs" color="gray.500">
                {order.type === 'regular' ? 'Cliente Frecuente' : 'Cliente Visitante'}
              </Text>
              {/* Fecha y hora */}
              <Text fontSize="2xs" color="gray.400">
                {order.createdAt ? new Date(order.createdAt).toLocaleString('es-PE', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                }) : 'Sin fecha'}
              </Text>
            </VStack>
            <Badge colorScheme={getStatusColor(order.status)}>
              {getStatusText(order.status)}
            </Badge>
          </HStack>

          {/* Información del cliente */}
          <VStack spacing={2} align="stretch">
            <HStack spacing={2}>
              <FaUserIcon size={12} color="#718096" />
              <Text fontSize="sm" fontWeight="medium">
                {order.clientName || 'Sin nombre'}
              </Text>
            </HStack>
            
            <HStack spacing={2}>
              <FaPhoneIcon size={12} color="#718096" />
              <Text fontSize="sm">
                {order.clientPhone || 'Sin teléfono'}
              </Text>
            </HStack>
            
            <HStack spacing={2}>
              <FaMapIcon size={12} color="#718096" />
              <VStack align="start" spacing={0}>
                <Text fontSize="sm" noOfLines={2}>
                  {order.clientAddress || order.deliveryAddress || 'Sin dirección'}
                </Text>
                {order.clientDistrict && (
                  <Text fontSize="xs" color="gray.500">
                    📍 {order.clientDistrict}
                  </Text>
                )}
                {order.deliveryReference && (
                  <Text fontSize="xs" color="gray.500">
                    🔗 {order.deliveryReference}
                  </Text>
                )}
              </VStack>
            </HStack>
          </VStack>

          {/* Productos del pedido */}
          <VStack spacing={2} align="stretch">
            <Text fontSize="sm" fontWeight="medium" color="gray.700">
              🛒 Productos:
            </Text>
            {renderOrderProducts(order)}
          </VStack>

          {/* Información de pago */}
          <VStack spacing={2} align="stretch">
            <HStack justify="space-between">
              <HStack spacing={2}>
                <Icon as={getPaymentIcon(order.paymentType, order.paymentMethod)} size={14} />
                <Text fontSize="sm">
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
              <Text fontWeight="bold" fontSize="sm" color="green.600">
                S/ {parseFloat(order.total || order.totalAmount || 0).toFixed(2)}
              </Text>
            </HStack>
            
            {/* Información específica para suscripciones */}
            {order.paymentMethod === 'suscripcion' && order.subscriptionId && (
              <HStack spacing={2} bg="purple.50" p={2} borderRadius="md">
                <Text fontSize="xs" color="purple.600" fontWeight="medium">
                  📅 Suscripción ID: {order.subscriptionId}
                </Text>
              </HStack>
            )}
            
            {/* Información específica para vales */}
            {order.paymentMethod === 'vale' && (
              <HStack spacing={2} bg="orange.50" p={2} borderRadius="md">
                <Text fontSize="xs" color="orange.600" fontWeight="medium">
                  🎫 Pago a crédito - Se cobrará al final del mes
                </Text>
              </HStack>
            )}
          </VStack>

          {/* Repartidor asignado */}
          {order.deliveryPersonId && (
            <HStack spacing={2}>
              <FaTruckIcon size={12} color="#3182CE" />
              <Text fontSize="sm">
                {(() => {
                  const foundDeliveryPerson = deliveryPersons.find(dp => dp.id === order.deliveryPersonId);
                  console.log(`🔍 Buscando repartidor para pedido ${order.id}:`, {
                    deliveryPersonId: order.deliveryPersonId,
                    type: typeof order.deliveryPersonId,
                    foundDeliveryPerson,
                    allDeliveryPersons: deliveryPersons.map(dp => ({ id: dp.id, type: typeof dp.id }))
                  });
                  return foundDeliveryPerson?.name || 'Repartidor asignado';
                })()}
              </Text>
            </HStack>
          )}

          {/* Acciones */}
          <HStack spacing={2} justify="center">
            <Tooltip label="Ver detalles">
              <IconButton
                size="sm"
                icon={<ViewIcon />}
                onClick={() => openDetailModal(order)}
                aria-label="Ver detalles"
              />
            </Tooltip>
            
            <Tooltip label="Descargar boleta">
              <IconButton
                size="sm"
                icon={<FaDownload />}
                colorScheme="green"
                onClick={() => downloadReceipt(order)}
                aria-label="Descargar boleta"
              />
            </Tooltip>
            
            {(!order.deliveryPersonId || order.status === 'pending') && order.status !== 'cancelled' && (
              <Tooltip label="Asignar repartidor">
                <IconButton
                  size="sm"
                  icon={<EditIcon />}
                  colorScheme="blue"
                  onClick={() => openAssignModal(order)}
                  aria-label="Asignar repartidor"
                />
              </Tooltip>
            )}
            
            {order.status === 'confirmed' && (
              <Button
                size="sm"
                colorScheme="purple"
                onClick={() => handleStatusUpdate(order, 'preparing')}
              >
                Enviar
              </Button>
            )}
            
            {(order.status === 'preparing' || order.status === 'ready') && (
              <Button
                size="sm"
                colorScheme="green"
                onClick={() => handleStatusUpdate(order, 'delivered')}
              >
                Entregado
              </Button>
            )}
            
            {(order.status === 'pending' || order.status === 'confirmed' || order.status === 'preparing' || order.status === 'ready') && (
              <Button
                size="sm"
                colorScheme="red"
                variant="outline"
                onClick={() => openCancelModal(order)}
              >
                Anular
              </Button>
            )}
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  );

  // Modal de asignación de repartidor
  const renderAssignModal = () => (
    <Modal isOpen={isAssignOpen} onClose={onAssignClose} size="md" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Asignar Repartidor</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            {selectedOrder && (
              <Alert status="info">
                <AlertIcon />
                <VStack align="start" spacing={1}>
                  <Text fontWeight="bold">Pedido: {selectedOrder.orderNumber}</Text>
                  <Text fontSize="sm">
                    Cliente: {selectedOrder.clientName || selectedOrder.client?.name}
                  </Text>
                  <Text fontSize="sm">
                    Total: S/ {parseFloat(selectedOrder.total || selectedOrder.totalAmount || 0).toFixed(2)}
                  </Text>
                </VStack>
              </Alert>
            )}

            <FormControl isRequired>
              <FormLabel>Repartidor</FormLabel>
              <Select
                value={selectedDeliveryPerson}
                onChange={(e) => setSelectedDeliveryPerson(e.target.value)}
                placeholder="Selecciona un repartidor"
              >
                {deliveryPersons.map((deliveryPerson) => (
                  <option key={deliveryPerson.id} value={deliveryPerson.id}>
                    {deliveryPerson.firstName} {deliveryPerson.lastName}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Notas adicionales</FormLabel>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Instrucciones especiales para el repartidor..."
                rows={3}
              />
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" mr={3} onClick={onAssignClose}>
            Cancelar
          </Button>
          <Button colorScheme="blue" onClick={handleAssignDelivery}>
            Asignar Repartidor
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );

  // Modal de detalles del pedido
  const renderDetailModal = () => (
    <Modal isOpen={isDetailOpen} onClose={onDetailClose} size="lg" isCentered>
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
                      <Text>{selectedOrder.orderNumber}</Text>
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
                      <Text>{selectedOrder.clientPhone || selectedOrder.client?.phone}</Text>
                    </HStack>
                    
                    <HStack justify="space-between">
                      <Text fontWeight="bold">Dirección:</Text>
                      <Text>{selectedOrder.clientAddress || selectedOrder.client?.address}</Text>
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
                      <Text fontWeight="bold" color="green.600">
                        S/ {parseFloat(selectedOrder.total || selectedOrder.totalAmount || 0).toFixed(2)}
                      </Text>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>

              {/* Repartidor asignado */}
              <Card variant="outline">
                <CardHeader>
                  <Heading size="sm">Repartidor</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={2} align="stretch">
                    <HStack justify="space-between">
                      <Text fontWeight="bold">Nombre:</Text>
                      <Text>{selectedOrder.deliveryPerson ? 
                        selectedOrder.deliveryPerson.username : 
                        'No asignado'}</Text>
                    </HStack>
                    
                    <HStack justify="space-between">
                      <Text fontWeight="bold">Teléfono:</Text>
                      <Text>{selectedOrder.deliveryPerson ? 
                        selectedOrder.deliveryPerson.phone : 
                        'N/A'}</Text>
                    </HStack>
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

  // Modal de confirmación de anulación
  const renderCancelModal = () => (
    <Modal isOpen={isCancelOpen} onClose={onCancelClose} size="md" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Confirmar Anulación</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {selectedOrder && (
            <VStack spacing={4} align="stretch">
              <Alert status="warning" borderRadius="md">
                <AlertIcon />
                <VStack align="start" spacing={2}>
                  <Text fontWeight="bold">
                    ¿Estás seguro de que deseas anular este pedido?
                  </Text>
                  <Text fontSize="sm">
                    Esta acción no se puede deshacer.
                  </Text>
                </VStack>
              </Alert>
              
              <Card variant="outline" p={3}>
                <VStack spacing={2} align="stretch">
                  <HStack justify="space-between">
                    <Text fontWeight="bold">Pedido:</Text>
                    <Text>#{selectedOrder.id}</Text>
                  </HStack>
                  
                  <HStack justify="space-between">
                    <Text fontWeight="bold">Cliente:</Text>
                    <Text>{selectedOrder.clientName || 'Sin nombre'}</Text>
                  </HStack>
                  
                  <HStack justify="space-between">
                    <Text fontWeight="bold">Estado actual:</Text>
                    <Badge colorScheme={getStatusColor(selectedOrder.status)}>
                      {getStatusText(selectedOrder.status)}
                    </Badge>
                  </HStack>
                  
                  <HStack justify="space-between">
                    <Text fontWeight="bold">Total:</Text>
                    <Text fontWeight="bold" color="green.600">
                      S/ {parseFloat(selectedOrder.total || selectedOrder.totalAmount || 0).toFixed(2)}
                    </Text>
                  </HStack>
                </VStack>
              </Card>
            </VStack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" mr={3} onClick={onCancelClose}>
            Cancelar
          </Button>
          <Button colorScheme="red" onClick={handleConfirmCancel}>
            Sí, Anular Pedido
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );

  if (guestOrdersLoading) {
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
        <Flex justify="space-between" align="center">
          <Box>
            <Heading size="lg" mb={2}>
              Gestión de Pedidos
            </Heading>
            <Text color="gray.600">
              Administra y asigna repartidores a los pedidos
            </Text>
            <HStack spacing={2}>
              <Text color="gray.400" fontSize="xs">
                Última actualización: {lastUpdate.toLocaleTimeString()}
              </Text>
              {isSilentlyUpdating && (
                <Box
                  w="8px"
                  h="8px"
                  bg="blue.400"
                  borderRadius="full"
                  animation="pulse 1s infinite"
                />
              )}
            </HStack>
          </Box>
          <Button
            size="sm"
            colorScheme="blue"
            variant="outline"
            onClick={async () => {
              setIsSilentlyUpdating(true);
              await fetchOrdersSilently();
              setLastUpdate(new Date());
              setIsSilentlyUpdating(false);
            }}
            isLoading={isSilentlyUpdating}
          >
            Actualizar
          </Button>
        </Flex>

        {/* Filtros */}
        <Card>
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
              <FormControl>
                <FormLabel>Buscar</FormLabel>
                <InputGroup>
                  <InputLeftElement>
                    <SearchIcon />
                  </InputLeftElement>
                  <Input
                    placeholder="Buscar por pedido o cliente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>
              </FormControl>

              <FormControl>
                <FormLabel>Estado</FormLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">Todos los estados</option>
                  <option value="pending">Pendiente</option>
                  <option value="confirmed">Asignado</option>
                  <option value="preparing">Preparando</option>
                  <option value="ready">Listo</option>
                  <option value="delivered">Entregado</option>
                  <option value="cancelled">Cancelado</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Pago</FormLabel>
                <Select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                >
                  <option value="all">Todos los pagos</option>
                  <option value="contraentrega">Contraentrega</option>
                  <option value="vale">A Crédito (Vale)</option>
                  <option value="suscripcion">Suscripción</option>
                  <option value="efectivo">Efectivo</option>
                  <option value="plin">PLIN</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Estadísticas</FormLabel>
                <VStack spacing={1}>
                  <HStack justify="space-between" w="full">
                    <Text fontSize="sm">Total:</Text>
                    <Badge colorScheme="blue">{filteredOrders.length}</Badge>
                  </HStack>
                  <HStack justify="space-between" w="full">
                    <Text fontSize="sm">Pendientes:</Text>
                    <Badge colorScheme="orange">{ordersByStatus.pending.length}</Badge>
                  </HStack>
                </VStack>
              </FormControl>
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* Lista de pedidos */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
          {filteredOrders.map(renderOrderCard)}
        </SimpleGrid>

        {filteredOrders.length === 0 && (
          <Center h="200px">
            <VStack spacing={4}>
              <Text color="gray.500" fontSize="lg">
                No hay pedidos que coincidan con los filtros
              </Text>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setPaymentFilter('all');
                }}
              >
                Limpiar filtros
              </Button>
            </VStack>
          </Center>
        )}
      </VStack>

      {/* Modales */}
      {renderAssignModal()}
      {renderDetailModal()}
      {renderCancelModal()}
    </Box>
  );
};

export default OrdersManagement;
