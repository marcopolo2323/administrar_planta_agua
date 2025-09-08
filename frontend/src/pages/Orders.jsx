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
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Input,
  InputGroup,
  InputLeftElement,
  VStack,
  HStack,
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
  AlertTitle,
  AlertDescription,
  Spinner,
  Center,
  SimpleGrid,
  useBreakpointValue,
  Divider
} from '@chakra-ui/react';
import { SearchIcon, EditIcon, ViewIcon } from '@chakra-ui/icons';
import useOrderStore from '../stores/orderStore';
import useClientStore from '../stores/clientStore';
import useGuestOrderStore from '../stores/guestOrderStore';
import useDeliveryStore from '../stores/deliveryStore';

const Orders = () => {
  // Stores
  const {
    orders,
    loading: ordersLoading,
    error: ordersError,
    fetchOrders,
    updateOrder,
    getFilteredOrders,
    getOrderStats,
    clearError: clearOrdersError
  } = useOrderStore();

  const {
    clients,
    loading: clientsLoading,
    fetchClients,
    fetchClientById
  } = useClientStore();

  const {
    orders: guestOrders,
    loading: guestOrdersLoading,
    fetchOrders: fetchGuestOrders,
    updateGuestOrder
  } = useGuestOrderStore();

  const {
    deliveryPersons,
    fetchDeliveryPersons
  } = useDeliveryStore();

  // Estados locales
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  // Estados para el formulario
  const [formData, setFormData] = useState({
    status: '',
    notes: '',
    deliveryPersonId: ''
  });

  // Estados para modales
  const { isOpen: isAssignOpen, onOpen: onAssignOpen, onClose: onAssignClose } = useDisclosure();
  const { isOpen: isStatusOpen, onOpen: onStatusOpen, onClose: onStatusClose } = useDisclosure();

  const isMobile = useBreakpointValue({ base: true, md: false });

  // Función para calcular el total de un pedido
  const calculateTotal = (order) => {
    if (order.total) {
      return parseFloat(order.total);
    }
    
    const subtotal = parseFloat(order.subtotal || 0);
    const deliveryFee = parseFloat(order.deliveryFee || 0);
    return subtotal + deliveryFee;
  };

  // Combinar pedidos regulares y de invitados
  const allOrders = [
    ...(orders || []).map(order => ({ ...order, type: 'regular', uniqueKey: `regular-${order.id}` })),
    ...(guestOrders || []).map(order => ({ ...order, type: 'guest', uniqueKey: `guest-${order.id}` }))
  ].sort((a, b) => new Date(b.createdAt || b.created_at) - new Date(a.createdAt || a.created_at));

  // Debug: Mostrar datos de pedidos
  console.log('🔍 Pedidos cargados:', allOrders.length);
  console.log('🔍 Primer pedido:', allOrders[0]);
  console.log('🔍 Todos los pedidos:', allOrders.map(o => ({ id: o.id, subtotal: o.subtotal, total: o.total, deliveryFee: o.deliveryFee })));

  useEffect(() => {
    fetchOrders();
    fetchGuestOrders();
    fetchClients();
    fetchDeliveryPersons();
  }, [fetchOrders, fetchGuestOrders, fetchClients, fetchDeliveryPersons]);

  // Debug: Mostrar datos de pedidos cuando cambien
  useEffect(() => {
    if (orders.length > 0) {
      console.log('🔍 Pedidos regulares cargados:', orders.length);
      console.log('🔍 Primer pedido regular:', orders[0]);
      console.log('🔍 Total del primer pedido:', orders[0]?.total);
      console.log('🔍 Subtotal del primer pedido:', orders[0]?.subtotal);
      console.log('🔍 DeliveryFee del primer pedido:', orders[0]?.deliveryFee);
    }
  }, [orders]);

  useEffect(() => {
    if (guestOrders.length > 0) {
      console.log('🔍 Pedidos de invitados cargados:', guestOrders.length);
      console.log('🔍 Primer pedido de invitado:', guestOrders[0]);
      console.log('🔍 Total del primer pedido de invitado:', guestOrders[0]?.total);
      console.log('🔍 Subtotal del primer pedido de invitado:', guestOrders[0]?.subtotal);
      console.log('🔍 DeliveryFee del primer pedido de invitado:', guestOrders[0]?.deliveryFee);
    }
  }, [guestOrders]);

  // Mostrar errores del store
  useEffect(() => {
    if (ordersError) {
      toast({
        title: 'Error',
        description: ordersError,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      clearOrdersError();
    }
  }, [ordersError, toast, clearOrdersError]);

  const handleUpdateOrder = async () => {
    const result = await updateOrder(selectedOrder.id, formData);
    if (result.success) {
      toast({
        title: 'Éxito',
        description: 'Pedido actualizado correctamente',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onClose();
      resetForm();
    }
  };

  const resetForm = () => {
    setFormData({
      status: '',
      notes: '',
      deliveryPersonId: ''
    });
    setSelectedOrder(null);
  };

  const openEditModal = (order) => {
    setSelectedOrder(order);
    setFormData({
      status: order.status,
      notes: order.notes || ''
    });
    onOpen();
  };

  const openViewModal = async (order) => {
    setSelectedOrder(order);
    
    // Cargar datos completos del pedido si es necesario
    try {
      let orderData = order;
      
      // Si es un pedido regular, cargar datos del cliente
      if (order.type === 'regular' && order.clientId) {
        const client = await fetchClientById(order.clientId);
        if (client) {
          orderData = {
            ...order,
            Client: client
          };
        }
      }
      
      setSelectedOrder(orderData);
      onOpen();
    } catch (error) {
      console.error('Error al cargar datos del pedido:', error);
      setSelectedOrder(order);
      onOpen();
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pendiente':
        return 'yellow';
      case 'confirmado':
        return 'blue';
      case 'en_preparacion':
        return 'orange';
      case 'en_camino':
        return 'purple';
      case 'entregado':
        return 'green';
      case 'cancelado':
        return 'red';
      default:
        return 'gray';
    }
  };

  // Función para asignar repartidor
  const handleAssignDeliveryPerson = (order) => {
    setSelectedOrder(order);
    setFormData({
      ...formData,
      deliveryPersonId: order.deliveryPersonId || ''
    });
    onAssignOpen();
  };

  // Función para actualizar estado
  const handleUpdateStatus = (order) => {
    setSelectedOrder(order);
    setFormData({
      ...formData,
      status: order.status
    });
    onStatusOpen();
  };

  // Función para asignar repartidor
  const assignDeliveryPerson = async () => {
    if (!selectedOrder || !formData.deliveryPersonId) return;

    console.log('🔍 Debug assignDeliveryPerson:');
    console.log('selectedOrder.type:', selectedOrder.type);
    console.log('updateGuestOrder function:', typeof updateGuestOrder);
    console.log('updateOrder function:', typeof updateOrder);

    const updateData = {
      deliveryPersonId: formData.deliveryPersonId
    };

    let result;
    if (selectedOrder.type === 'regular') {
      console.log('Usando updateOrder para pedido regular');
      result = await updateOrder(selectedOrder.id, updateData);
    } else {
      console.log('Usando updateGuestOrder para pedido de invitado');
      result = await updateGuestOrder(selectedOrder.id, updateData);
    }

    if (result.success) {
      toast({
        title: 'Éxito',
        description: 'Repartidor asignado correctamente',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onAssignClose();
      resetForm();
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Error al asignar repartidor',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Función para actualizar estado
  const updateOrderStatus = async () => {
    if (!selectedOrder || !formData.status) return;

    const updateData = {
      status: formData.status
    };

    let result;
    if (selectedOrder.type === 'regular') {
      result = await updateOrder(selectedOrder.id, updateData);
    } else {
      result = await updateGuestOrder(selectedOrder.id, updateData);
    }

    if (result.success) {
      toast({
        title: 'Éxito',
        description: 'Estado actualizado correctamente',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onStatusClose();
      resetForm();
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Error al actualizar estado',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pendiente':
        return 'Pendiente';
      case 'confirmado':
        return 'Confirmado';
      case 'en_preparacion':
        return 'En Preparación';
      case 'en_camino':
        return 'En Camino';
      case 'entregado':
        return 'Entregado';
      case 'cancelado':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'pendiente':
        return 'yellow';
      case 'pagado':
        return 'green';
      case 'cancelado':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getPaymentStatusText = (status) => {
    switch (status) {
      case 'pendiente':
        return 'Pendiente';
      case 'pagado':
        return 'Pagado';
      case 'cancelado':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const filteredOrders = allOrders.filter(order => {
    const searchLower = searchTerm.toLowerCase();
    const clientName = order.clientName || order.customerName || '';
    const clientPhone = order.clientPhone || order.customerPhone || '';
    const orderId = order.id?.toString() || '';
    
    return clientName.toLowerCase().includes(searchLower) ||
           clientPhone.includes(searchLower) ||
           orderId.includes(searchLower);
  }).filter(order => {
    if (statusFilter === 'all') return true;
    return order.status === statusFilter;
  });
  const orderStats = getOrderStats();
  const loading = ordersLoading || guestOrdersLoading || clientsLoading;

  if (loading) {
    return (
      <Center h="400px">
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <Box p={6}>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg" color="gray.700">
          Gestión de Pedidos
        </Heading>
      </Flex>

      {/* Estadísticas */}
      <SimpleGrid columns={{ base: 2, md: 4, lg: 7 }} spacing={4} mb={6}>
        <Card>
          <CardBody>
            <Text fontSize="sm" color="gray.600">Total</Text>
            <Text fontSize="2xl" fontWeight="bold" color="blue.600">
              {orderStats.totalOrders}
            </Text>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Text fontSize="sm" color="gray.600">Pendientes</Text>
            <Text fontSize="2xl" fontWeight="bold" color="yellow.600">
              {orderStats.pendingOrders}
            </Text>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Text fontSize="sm" color="gray.600">Confirmados</Text>
            <Text fontSize="2xl" fontWeight="bold" color="blue.600">
              {orderStats.confirmedOrders}
            </Text>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Text fontSize="sm" color="gray.600">En Preparación</Text>
            <Text fontSize="2xl" fontWeight="bold" color="orange.600">
              {orderStats.inProgressOrders}
            </Text>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Text fontSize="sm" color="gray.600">En Camino</Text>
            <Text fontSize="2xl" fontWeight="bold" color="purple.600">
              {orderStats.onTheWayOrders}
            </Text>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Text fontSize="sm" color="gray.600">Entregados</Text>
            <Text fontSize="2xl" fontWeight="bold" color="green.600">
              {orderStats.deliveredOrders}
            </Text>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Text fontSize="sm" color="gray.600">Cancelados</Text>
            <Text fontSize="2xl" fontWeight="bold" color="red.600">
              {orderStats.cancelledOrders}
            </Text>
          </CardBody>
        </Card>
      </SimpleGrid>

      <Card>
        <CardHeader>
          <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
            <Heading size="md">Lista de Pedidos</Heading>
            <HStack spacing={4}>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                maxW="200px"
              >
                <option value="all">Todos los estados</option>
                <option value="pendiente">Pendientes</option>
                <option value="confirmado">Confirmados</option>
                <option value="en_preparacion">En Preparación</option>
                <option value="en_camino">En Camino</option>
                <option value="entregado">Entregados</option>
                <option value="cancelado">Cancelados</option>
              </Select>
              <InputGroup maxW="300px">
                <InputLeftElement pointerEvents="none">
                  <SearchIcon color="gray.300" />
                </InputLeftElement>
                <Input
                  placeholder="Buscar pedidos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </HStack>
          </Flex>
        </CardHeader>
        <CardBody>
          {filteredOrders.length === 0 ? (
            <Alert status="info">
              <AlertIcon />
              <AlertTitle>No hay pedidos!</AlertTitle>
              <AlertDescription>
                {searchTerm || statusFilter !== 'all' 
                  ? 'No se encontraron pedidos con los filtros aplicados.' 
                  : 'No hay pedidos registrados.'
                }
              </AlertDescription>
            </Alert>
          ) : (
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>ID</Th>
                  <Th>Cliente</Th>
                  <Th>Productos</Th>
                  <Th>Dirección</Th>
                  <Th>Total</Th>
                  <Th>Estado</Th>
                  <Th>Pago</Th>
                  <Th>Fecha</Th>
                  <Th>Acciones</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredOrders.map((order) => (
                  <Tr key={order.uniqueKey}>
                    <Td>
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="bold">#{order.id}</Text>
                        <Badge size="sm" colorScheme={order.type === 'regular' ? 'blue' : 'green'}>
                          {order.type === 'regular' ? 'Cliente Frecuente' : 'Invitado'}
                        </Badge>
                      </VStack>
                    </Td>
                    <Td>
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="bold">
                          {order.Client?.name || order.clientName || order.customerName || 'N/A'}
                        </Text>
                        <Text fontSize="sm" color="gray.500">
                          {order.Client?.phone || order.clientPhone || order.customerPhone || 'N/A'}
                        </Text>
                        {order.Client?.email && (
                          <Text fontSize="xs" color="gray.400">
                            {order.Client.email}
                          </Text>
                        )}
                      </VStack>
                    </Td>
                    <Td>
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm" color="blue.600">
                          Bidón de Agua 20L
                        </Text>
                        <Text fontSize="sm" color="green.600">
                          Paquete Botellas 20u
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          + Detalles
                        </Text>
                      </VStack>
                    </Td>
                    <Td>
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm" fontWeight="bold">
                        {order.deliveryAddress || 'N/A'}
                      </Text>
                        <Text fontSize="xs" color="blue.600">
                          📍 {order.deliveryDistrict || 'N/A'}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          📞 {order.contactPhone || 'N/A'}
                        </Text>
                      </VStack>
                    </Td>
                    <Td>
                      <VStack align="start" spacing={1}>
                      <Text fontWeight="bold" color="blue.600">
                        S/ {calculateTotal(order).toFixed(2)}
                      </Text>
                        <Text fontSize="xs" color="gray.500">
                          Subtotal: S/ {parseFloat(order.subtotal || 0).toFixed(2)}
                        </Text>
                        <Text fontSize="xs" color="green.600">
                          Flete: S/ {parseFloat(order.deliveryFee || 0).toFixed(2)}
                        </Text>
                      </VStack>
                    </Td>
                    <Td>
                      <Badge colorScheme={getStatusColor(order.status)}>
                        {getStatusText(order.status)}
                      </Badge>
                    </Td>
                    <Td>
                      <Badge colorScheme={getPaymentStatusColor(order.paymentStatus)}>
                        {getPaymentStatusText(order.paymentStatus)}
                      </Badge>
                    </Td>
                    <Td>
                      <Text fontSize="sm">
                        {new Date(order.createdAt || order.created_at).toLocaleDateString()}
                      </Text>
                    </Td>
                    <Td>
                      <HStack spacing={2} flexWrap="wrap">
                        <Button
                          size="sm"
                          leftIcon={<ViewIcon />}
                          onClick={() => openViewModal(order)}
                        >
                          Ver
                        </Button>
                        <Button
                          size="sm"
                          colorScheme="blue"
                          onClick={() => handleAssignDeliveryPerson(order)}
                        >
                          Asignar
                        </Button>
                        <Button
                          size="sm"
                          colorScheme="green"
                          onClick={() => handleUpdateStatus(order)}
                        >
                          Estado
                        </Button>
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </CardBody>
      </Card>

      {/* Modal para ver/editar pedido */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Pedido #{selectedOrder?.id}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedOrder && (
              <VStack spacing={4}>
                {/* Debug info - Solo para desarrollo */}
                {process.env.NODE_ENV === 'development' && (
                  <Box w="full" p={2} bg="yellow.50" borderRadius="md" fontSize="xs">
                    <Text fontWeight="bold" mb={1}>Debug Info:</Text>
                    <Text>Order ID: {selectedOrder.id}</Text>
                    <Text>Type: {selectedOrder.type}</Text>
                    <Text>Client ID: {selectedOrder.clientId || 'N/A'}</Text>
                    <Text>Customer Name: {selectedOrder.customerName || selectedOrder.clientName}</Text>
                    <Text>Total: {selectedOrder.total || 'N/A'}</Text>
                    <Text>Subtotal: {selectedOrder.subtotal || 'N/A'}</Text>
                  </Box>
                )}
                
                {/* Información del cliente */}
                <Box w="full" p={4} bg="gray.50" borderRadius="md">
                  <Text fontWeight="bold" mb={3}>Información del Cliente</Text>
                  <SimpleGrid columns={2} spacing={3}>
                    <Box>
                      <Text fontSize="sm" color="gray.600">Nombre:</Text>
                      <Text fontWeight="bold">
                        {selectedOrder.Client?.name || selectedOrder.clientName || selectedOrder.customerName || 'N/A'}
                      </Text>
                    </Box>
                    <Box>
                      <Text fontSize="sm" color="gray.600">Teléfono:</Text>
                      <Text fontWeight="bold">
                        {selectedOrder.Client?.phone || selectedOrder.clientPhone || selectedOrder.customerPhone || 'N/A'}
                      </Text>
                    </Box>
                    <Box>
                      <Text fontSize="sm" color="gray.600">Email:</Text>
                      <Text fontWeight="bold">
                        {selectedOrder.Client?.email || selectedOrder.customerEmail || 'N/A'}
                      </Text>
                    </Box>
                    <Box>
                      <Text fontSize="sm" color="gray.600">Tipo:</Text>
                      <Badge colorScheme={selectedOrder.type === 'regular' ? 'blue' : 'green'}>
                        {selectedOrder.type === 'regular' ? 'Cliente Frecuente' : 'Invitado'}
                      </Badge>
                    </Box>
                    <Box colSpan={2}>
                      <Text fontSize="sm" color="gray.600">Dirección:</Text>
                      <Text fontWeight="bold">{selectedOrder.deliveryAddress || 'N/A'}</Text>
                    </Box>
                    <Box>
                      <Text fontSize="sm" color="gray.600">Distrito:</Text>
                      <Text fontWeight="bold">{selectedOrder.deliveryDistrict || 'N/A'}</Text>
                    </Box>
                    <Box>
                      <Text fontSize="sm" color="gray.600">Notas:</Text>
                      <Text fontWeight="bold">{selectedOrder.notes || 'Sin notas'}</Text>
                    </Box>
                    <Box>
                      <Text fontSize="sm" color="gray.600">Método de Pago:</Text>
                      <Text fontWeight="bold" textTransform="capitalize">
                        {selectedOrder.paymentMethod || 'N/A'}
                      </Text>
                    </Box>
                    {selectedOrder.paymentReference && (
                      <Box>
                        <Text fontSize="sm" color="gray.600">Referencia de Pago:</Text>
                        <Text fontWeight="bold">{selectedOrder.paymentReference}</Text>
                      </Box>
                    )}
                  </SimpleGrid>
                </Box>

                {/* Estado del pedido */}
                <Box w="full" p={4} bg="blue.50" borderRadius="md">
                  <Text fontWeight="bold" mb={3}>Estado del Pedido</Text>
                  <HStack spacing={4}>
                    <Box>
                      <Text fontSize="sm" color="gray.600">Estado:</Text>
                      <Badge colorScheme={getStatusColor(selectedOrder.status)}>
                        {getStatusText(selectedOrder.status)}
                      </Badge>
                    </Box>
                    <Box>
                      <Text fontSize="sm" color="gray.600">Pago:</Text>
                      <Badge colorScheme={getPaymentStatusColor(selectedOrder.paymentStatus)}>
                        {getPaymentStatusText(selectedOrder.paymentStatus)}
                      </Badge>
                    </Box>
                  </HStack>
                </Box>

                {/* Productos */}
                {selectedOrder.items && selectedOrder.items.length > 0 && (
                  <Box w="full">
                    <Text fontWeight="bold" mb={3}>Productos</Text>
                    <VStack spacing={2}>
                      {selectedOrder.items.map((item, index) => (
                        <HStack key={index} justify="space-between" w="full" p={2} bg="gray.50" borderRadius="md">
                          <Text flex={1}>{item.productName || `Producto ${item.productId}`}</Text>
                          <Text>x {item.quantity}</Text>
                          <Text fontWeight="bold">S/ {parseFloat(item.subtotal || 0).toFixed(2)}</Text>
                        </HStack>
                      ))}
                    </VStack>
                  </Box>
                )}

                {/* Totales */}
                <Box w="full" p={4} border="1px" borderColor="gray.200" borderRadius="md">
                  <VStack spacing={2}>
                    <HStack justify="space-between" w="full">
                      <Text>Subtotal:</Text>
                      <Text fontWeight="bold">S/ {parseFloat(selectedOrder.subtotal || 0).toFixed(2)}</Text>
                    </HStack>
                    <HStack justify="space-between" w="full">
                      <Text>Flete:</Text>
                      <Text fontWeight="bold">S/ {parseFloat(selectedOrder.deliveryFee || 0).toFixed(2)}</Text>
                    </HStack>
                    <Divider />
                    <HStack justify="space-between" w="full">
                      <Text fontWeight="bold" fontSize="lg">Total:</Text>
                      <Text fontWeight="bold" fontSize="lg" color="blue.600">
                        S/ {calculateTotal(selectedOrder).toFixed(2)}
                      </Text>
                    </HStack>
                  </VStack>
                </Box>

                {/* Formulario de edición */}
                <Divider />
                <Text fontWeight="bold" mb={3}>Actualizar Estado</Text>
                <VStack spacing={4} w="full">
                  <FormControl>
                    <FormLabel>Nuevo Estado</FormLabel>
                    <Select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="confirmado">Confirmado</option>
                      <option value="en_preparacion">En Preparación</option>
                      <option value="en_camino">En Camino</option>
                      <option value="entregado">Entregado</option>
                      <option value="cancelado">Cancelado</option>
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Notas</FormLabel>
                    <Textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Notas adicionales..."
                      rows={3}
                    />
                  </FormControl>
                </VStack>
              </VStack>
            )}
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cerrar
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleUpdateOrder}
            >
              Actualizar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal para asignar repartidor */}
      <Modal isOpen={isAssignOpen} onClose={onAssignClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Asignar Repartidor</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Text>
                Asignar repartidor al pedido #{selectedOrder?.id}
              </Text>
              <FormControl>
                <FormLabel>Repartidor</FormLabel>
                <Select
                  value={formData.deliveryPersonId}
                  onChange={(e) => setFormData({ ...formData, deliveryPersonId: e.target.value })}
                  placeholder="Seleccionar repartidor"
                >
                  {deliveryPersons.map((person) => (
                    <option key={person.id} value={person.id}>
                      {person.name} - {person.phone}
                    </option>
                  ))}
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onAssignClose}>
              Cancelar
            </Button>
            <Button colorScheme="blue" onClick={assignDeliveryPerson}>
              Asignar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal para actualizar estado */}
      <Modal isOpen={isStatusOpen} onClose={onStatusClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Actualizar Estado</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Text>
                Actualizar estado del pedido #{selectedOrder?.id}
              </Text>
              <FormControl>
                <FormLabel>Estado</FormLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="confirmado">Confirmado</option>
                  <option value="en_preparacion">En Preparación</option>
                  <option value="en_camino">En Camino</option>
                  <option value="entregado">Entregado</option>
                  <option value="cancelado">Cancelado</option>
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onStatusClose}>
              Cancelar
            </Button>
            <Button colorScheme="green" onClick={updateOrderStatus}>
              Actualizar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Orders;
