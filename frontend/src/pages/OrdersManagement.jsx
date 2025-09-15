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
  TagLeftIcon
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
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle
} from 'react-icons/fa';
import useOrderStore from '../stores/orderStore';
import useGuestOrderStore from '../stores/guestOrderStore';
import useDeliveryStore from '../stores/deliveryStore';

const OrdersManagement = () => {
  // Stores
  const {
    orders,
    loading: ordersLoading,
    fetchOrders,
    updateOrder
  } = useOrderStore();

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
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedDeliveryPerson, setSelectedDeliveryPerson] = useState('');
  const [notes, setNotes] = useState('');
  
  // Modales
  const { isOpen: isAssignOpen, onOpen: onAssignOpen, onClose: onAssignClose } = useDisclosure();
  const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure();
  
  const toast = useToast();

  useEffect(() => {
    fetchOrders();
    fetchGuestOrders();
    fetchDeliveryPersons();
  }, [fetchOrders, fetchGuestOrders, fetchDeliveryPersons]);

  // Combinar pedidos regulares y de visitantes
  const allOrders = [
    ...orders.map(order => ({ ...order, type: 'regular', orderNumber: order.orderNumber || `REG-${order.id}` })),
    ...guestOrders.map(order => ({ ...order, type: 'guest', orderNumber: order.orderNumber || `GUEST-${order.id}` }))
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Filtrar pedidos
  const filteredOrders = allOrders.filter(order => {
    const matchesSearch = order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.client?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    const matchesPayment = paymentFilter === 'all' || 
                          (paymentFilter === 'efectivo' && order.paymentType === 'efectivo') ||
                          (paymentFilter === 'plin' && order.paymentType === 'plin');

    return matchesSearch && matchesStatus && matchesPayment;
  });

  // Agrupar pedidos por estado
  const ordersByStatus = {
    pendiente: filteredOrders.filter(order => order.status === 'pendiente'),
    asignado: filteredOrders.filter(order => order.status === 'asignado'),
    en_camino: filteredOrders.filter(order => order.status === 'en_camino'),
    entregado: filteredOrders.filter(order => order.status === 'entregado'),
    cancelado: filteredOrders.filter(order => order.status === 'cancelado')
  };

  const getStatusColor = (status) => {
    switch (status) {
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
      case 'pendiente': return 'Pendiente';
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

    try {
      const updateData = {
        status: 'asignado',
        deliveryPersonId: selectedDeliveryPerson,
        notes: notes
      };

      if (selectedOrder.type === 'regular') {
        await updateOrder(selectedOrder.id, updateData);
      } else {
        await updateGuestOrder(selectedOrder.id, updateData);
      }

      toast({
        title: 'Repartidor asignado',
        description: 'El pedido ha sido asignado exitosamente',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

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

  const handleStatusUpdate = async (order, newStatus) => {
    try {
      const updateData = { status: newStatus };

      if (order.type === 'regular') {
        await updateOrder(order.id, updateData);
      } else {
        await updateGuestOrder(order.id, updateData);
      }

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
    setSelectedOrder(order);
    setSelectedDeliveryPerson(order.deliveryPersonId || '');
    setNotes(order.notes || '');
    onAssignOpen();
  };

  const openDetailModal = (order) => {
    setSelectedOrder(order);
    onDetailOpen();
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
                {order.clientName || order.client?.name || 'Sin nombre'}
              </Text>
            </HStack>
            
            <HStack spacing={2}>
              <FaPhoneIcon size={12} color="#718096" />
              <Text fontSize="sm">
                {order.clientPhone || order.client?.phone || 'Sin teléfono'}
              </Text>
            </HStack>
            
            <HStack spacing={2}>
              <FaMapIcon size={12} color="#718096" />
              <Text fontSize="sm" noOfLines={2}>
                {order.clientAddress || order.client?.address || 'Sin dirección'}
              </Text>
            </HStack>
          </VStack>

          {/* Información de pago */}
          <HStack justify="space-between">
            <HStack spacing={2}>
              <Icon as={getPaymentIcon(order.paymentType)} size={14} />
              <Text fontSize="sm">
                {order.paymentType === 'efectivo' ? 'Efectivo' : 'PLIN'}
              </Text>
            </HStack>
            <Text fontWeight="bold" fontSize="sm" color="green.600">
              S/ {parseFloat(order.total || order.totalAmount || 0).toFixed(2)}
            </Text>
          </HStack>

          {/* Repartidor asignado */}
          {order.deliveryPersonId && (
            <HStack spacing={2}>
              <FaTruckIcon size={12} color="#3182CE" />
              <Text fontSize="sm">
                {deliveryPersons.find(dp => dp.id === order.deliveryPersonId)?.name || 'Repartidor asignado'}
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
            
            {order.status === 'pendiente' && (
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
            
            {order.status === 'asignado' && (
              <Button
                size="sm"
                colorScheme="purple"
                onClick={() => handleStatusUpdate(order, 'en_camino')}
              >
                Enviar
              </Button>
            )}
            
            {order.status === 'en_camino' && (
              <Button
                size="sm"
                colorScheme="green"
                onClick={() => handleStatusUpdate(order, 'entregado')}
              >
                Entregado
              </Button>
            )}
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  );

  // Modal de asignación de repartidor
  const renderAssignModal = () => (
    <Modal isOpen={isAssignOpen} onClose={onAssignClose} size="md">
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
                    {deliveryPerson.name} - {deliveryPerson.phone}
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
                        <Icon as={getPaymentIcon(selectedOrder.paymentType)} size={16} />
                        <Text>{selectedOrder.paymentType === 'efectivo' ? 'Efectivo' : 'PLIN'}</Text>
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
              {selectedOrder.deliveryPersonId && (
                <Card variant="outline">
                  <CardHeader>
                    <Heading size="sm">Repartidor</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={2} align="stretch">
                      <HStack justify="space-between">
                        <Text fontWeight="bold">Nombre:</Text>
                        <Text>{deliveryPersons.find(dp => dp.id === selectedOrder.deliveryPersonId)?.name}</Text>
                      </HStack>
                      
                      <HStack justify="space-between">
                        <Text fontWeight="bold">Teléfono:</Text>
                        <Text>{deliveryPersons.find(dp => dp.id === selectedOrder.deliveryPersonId)?.phone}</Text>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
              )}

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

  if (ordersLoading || guestOrdersLoading) {
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
            Gestión de Pedidos
          </Heading>
          <Text color="gray.600">
            Administra y asigna repartidores a los pedidos
          </Text>
        </Box>

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
                  <option value="pendiente">Pendiente</option>
                  <option value="asignado">Asignado</option>
                  <option value="en_camino">En Camino</option>
                  <option value="entregado">Entregado</option>
                  <option value="cancelado">Cancelado</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Pago</FormLabel>
                <Select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                >
                  <option value="all">Todos los pagos</option>
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
                    <Badge colorScheme="orange">{ordersByStatus.pendiente.length}</Badge>
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
    </Box>
  );
};

export default OrdersManagement;
