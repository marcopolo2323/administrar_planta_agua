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
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  useToast,
  Alert,
  AlertIcon,
  Spinner,
  Center,
  SimpleGrid,
  useBreakpointValue,
  Badge,
  Divider,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Textarea
} from '@chakra-ui/react';
import { 
  SearchIcon, 
  ViewIcon, 
  EditIcon, 
  DeleteIcon,
  CheckIcon,
  CloseIcon,
  ChevronDownIcon
} from '@chakra-ui/icons';
import {
  FaTruck,
  FaMapMarkerAlt,
  FaPhone,
  FaUser,
  FaClock
} from 'react-icons/fa';
import useGuestOrderStore from '../stores/guestOrderStore';
import axios from '../utils/axios';

const GuestOrdersManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [deliveryPersons, setDeliveryPersons] = useState([]);
  const [selectedDeliveryPerson, setSelectedDeliveryPerson] = useState('');
  const [orderToAssign, setOrderToAssign] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isAssignOpen, onOpen: onAssignOpen, onClose: onAssignClose } = useDisclosure();
  const toast = useToast();
  const isMobile = useBreakpointValue({ base: true, md: false });

  // Store
  const {
    orders,
    loading,
    error,
    fetchOrders,
    updateOrderStatus,
    clearError
  } = useGuestOrderStore();

  useEffect(() => {
    fetchOrders();
    fetchDeliveryPersons();
  }, [fetchOrders]);

  const fetchDeliveryPersons = async () => {
    try {
      // Obtener usuarios con rol repartidor
      const response = await axios.get('/api/users?role=repartidor');
      if (response.data.success) {
        setDeliveryPersons(response.data.data);
      }
    } catch (error) {
      console.error('Error al cargar repartidores:', error);
      // Fallback: crear lista manual de repartidores conocidos
      setDeliveryPersons([
        { id: 6, username: 'repartidor1', email: 'repartidor1@aguapura.com', name: 'Repartidor 1' },
        { id: 7, username: 'repartidor2', email: 'repartidor2@aguapura.com', name: 'Repartidor 2' }
      ]);
    }
  };

  // Mostrar errores del store
  useEffect(() => {
    if (error) {
      toast({
        title: 'Error',
        description: error,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      clearError();
    }
  }, [error, toast, clearError]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'yellow';
      case 'confirmed': return 'blue';
      case 'preparing': return 'orange';
      case 'ready': return 'green';
      case 'delivered': return 'green';
      case 'cancelled': return 'red';
      default: return 'gray';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'confirmed': return 'Confirmado';
      case 'preparing': return 'Preparando';
      case 'ready': return 'Listo';
      case 'delivered': return 'Entregado';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredOrders = Array.isArray(orders) ? orders.filter(order => {
    const matchesSearch = 
      order.id.toString().includes(searchTerm) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerPhone.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) : [];

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    onOpen();
  };

  const assignDeliveryPerson = (order) => {
    setOrderToAssign(order);
    setSelectedDeliveryPerson('');
    onAssignOpen();
  };

  const handleAssignDelivery = async () => {
    if (!selectedDeliveryPerson || !orderToAssign) return;

    try {
      await axios.put(`/api/guest-orders/${orderToAssign.id}/assign-delivery`, {
        deliveryPersonId: selectedDeliveryPerson
      });

      toast({
        title: 'Repartidor Asignado',
        description: `Pedido #${orderToAssign.id} asignado correctamente`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Actualizar la lista de pedidos
      fetchOrders();
      onAssignClose();
    } catch (error) {
      console.error('Error al asignar repartidor:', error);
      toast({
        title: 'Error',
        description: 'No se pudo asignar el repartidor',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

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
          Gestión de Pedidos de Invitados
        </Heading>
        <Button
          colorScheme="blue"
          onClick={fetchOrders}
          leftIcon={<SearchIcon />}
        >
          Actualizar
        </Button>
      </Flex>

      {/* Filtros */}
      <Card mb={6}>
        <CardBody>
          <HStack spacing={4} wrap="wrap">
            <InputGroup maxW="300px">
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.300" />
              </InputLeftElement>
              <Input
                placeholder="Buscar por ID, nombre o teléfono..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              maxW="200px"
            >
              <option value="all">Todos los estados</option>
              <option value="pending">Pendiente</option>
              <option value="confirmed">Confirmado</option>
              <option value="preparing">Preparando</option>
              <option value="ready">Listo</option>
              <option value="delivered">Entregado</option>
              <option value="cancelled">Cancelado</option>
            </Select>
          </HStack>
        </CardBody>
      </Card>

      {/* Lista de pedidos */}
      {filteredOrders.length === 0 ? (
        <Alert status="info">
          <AlertIcon />
          No hay pedidos de invitados registrados.
        </Alert>
      ) : (
        <VStack spacing={4}>
          {filteredOrders.map((order) => (
            <Card key={order.id} w="full" variant="outline">
              <CardBody>
                <Flex justify="space-between" align="start" wrap="wrap" gap={4}>
                  <VStack align="start" spacing={2} flex={1}>
                    <HStack>
                      <Text fontWeight="bold" fontSize="lg">
                        Pedido #{order.id}
                      </Text>
                      <Badge colorScheme={getStatusColor(order.status)}>
                        {getStatusText(order.status)}
                      </Badge>
                    </HStack>
                    
                    <HStack spacing={4} wrap="wrap">
                      <HStack>
                        <FaUser color="gray.500" />
                        <Text fontSize="sm">{order.customerName}</Text>
                      </HStack>
                      <HStack>
                        <FaPhone color="gray.500" />
                        <Text fontSize="sm">{order.customerPhone}</Text>
                      </HStack>
                      <HStack>
                        <FaClock color="gray.500" />
                        <Text fontSize="sm">{formatDate(order.createdAt)}</Text>
                      </HStack>
                    </HStack>

                    <HStack justify="space-between" w="full" fontSize="sm">
                      <Text color="gray.600">
                        Subtotal: S/ {parseFloat((order.totalAmount || 0) - (order.deliveryFee || 0)).toFixed(2)}
                      </Text>
                      <Text color="green.600" fontWeight="bold">
                        Flete: S/ {parseFloat(order.deliveryFee || 0).toFixed(2)}
                      </Text>
                    </HStack>
                    <Text fontSize="sm" color="blue.600" fontWeight="bold">
                      Total: S/ {parseFloat(order.totalAmount || 0).toFixed(2)}
                    </Text>

                    {/* Mostrar repartidor asignado */}
                    {order.deliveryPerson && (
                      <HStack>
                        <FaTruck color="blue.500" />
                        <Text fontSize="sm" color="blue.600" fontWeight="bold">
                          Repartidor: {order.deliveryPerson.username} ({order.deliveryPerson.email})
                        </Text>
                      </HStack>
                    )}

                    {/* Mostrar productos del pedido */}
                    {order.products && order.products.length > 0 && (
                      <Box w="full" mt={2}>
                        <Text fontSize="sm" fontWeight="bold" color="gray.700" mb={1}>
                          Productos a entregar:
                        </Text>
                        <VStack spacing={1} align="start">
                          {order.products.map((product, index) => (
                            <HStack key={index} spacing={2} fontSize="xs">
                              <Text color="blue.600" fontWeight="bold">
                                {product.quantity}x
                              </Text>
                              <Text color="gray.600">
                                {product.product?.name || 'Producto'}
                              </Text>
                              <Text color="green.600" fontWeight="bold">
                                S/ {parseFloat(product.price || 0).toFixed(2)} c/u
                              </Text>
                            </HStack>
                          ))}
                        </VStack>
                      </Box>
                    )}

                    {order.deliveryAddress && (
                      <HStack>
                        <FaMapMarkerAlt color="gray.500" />
                        <Text fontSize="sm" color="gray.600">
                          {order.deliveryAddress}
                        </Text>
                      </HStack>
                    )}
                  </VStack>

                  <HStack spacing={2}>
                    <Button
                      size="sm"
                      leftIcon={<ViewIcon />}
                      onClick={() => viewOrderDetails(order)}
                    >
                      Ver
                    </Button>
                    
                    <Menu>
                      <MenuButton as={Button} size="sm" rightIcon={<ChevronDownIcon />}>
                        Estado
                      </MenuButton>
                      <MenuList>
                        <MenuItem onClick={() => updateOrderStatus(order.id, 'confirmed')}>
                          Confirmar
                        </MenuItem>
                        <MenuItem onClick={() => updateOrderStatus(order.id, 'preparing')}>
                          Preparando
                        </MenuItem>
                        <MenuItem onClick={() => updateOrderStatus(order.id, 'ready')}>
                          Listo
                        </MenuItem>
                        <MenuItem onClick={() => updateOrderStatus(order.id, 'delivered')}>
                          Entregado
                        </MenuItem>
                        <MenuItem onClick={() => updateOrderStatus(order.id, 'cancelled')}>
                          Cancelar
                        </MenuItem>
                      </MenuList>
                    </Menu>

                    <Button
                      size="sm"
                      colorScheme="purple"
                      variant="outline"
                      onClick={() => assignDeliveryPerson(order)}
                    >
                      Asignar Repartidor
                    </Button>
                  </HStack>
                </Flex>
              </CardBody>
            </Card>
          ))}
        </VStack>
      )}

      {/* Modal de detalles */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Detalles del Pedido #{selectedOrder?.id}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedOrder && (
              <VStack spacing={4} align="start">
                <SimpleGrid columns={2} spacing={4} w="full">
                  <Box>
                    <Text fontWeight="bold">Cliente:</Text>
                    <Text>{selectedOrder.customerName}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold">Teléfono:</Text>
                    <Text>{selectedOrder.customerPhone}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold">Estado:</Text>
                    <Badge colorScheme={getStatusColor(selectedOrder.status)}>
                      {getStatusText(selectedOrder.status)}
                    </Badge>
                  </Box>
                  <Box>
                    <Text fontWeight="bold">Subtotal:</Text>
                    <Text>S/ {parseFloat((selectedOrder.totalAmount || 0) - (selectedOrder.deliveryFee || 0)).toFixed(2)}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold">Flete:</Text>
                    <Text color="green.600">S/ {parseFloat(selectedOrder.deliveryFee || 0).toFixed(2)}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" fontSize="lg">Total:</Text>
                    <Text fontSize="lg" color="blue.600" fontWeight="bold">S/ {parseFloat(selectedOrder.totalAmount || 0).toFixed(2)}</Text>
                  </Box>
                  {selectedOrder.deliveryPerson && (
                    <Box>
                      <Text fontWeight="bold">Repartidor:</Text>
                      <Text color="blue.600">{selectedOrder.deliveryPerson.username} ({selectedOrder.deliveryPerson.email})</Text>
                    </Box>
                  )}
                </SimpleGrid>

                {selectedOrder.deliveryAddress && (
                  <Box w="full">
                    <Text fontWeight="bold">Dirección de entrega:</Text>
                    <Text>{selectedOrder.deliveryAddress}</Text>
                  </Box>
                )}

                {selectedOrder.notes && (
                  <Box w="full">
                    <Text fontWeight="bold">Notas:</Text>
                    <Text>{selectedOrder.notes}</Text>
                  </Box>
                )}

                <Box w="full">
                  <Text fontWeight="bold" mb={3}>Productos a entregar:</Text>
                  {selectedOrder.products && selectedOrder.products.length > 0 ? (
                    <VStack spacing={3} align="start" w="full">
                      {selectedOrder.products.map((product, index) => (
                        <Box key={index} w="full" p={3} border="1px" borderColor="gray.200" borderRadius="md">
                          <HStack justify="space-between" w="full" mb={2}>
                            <Text fontWeight="bold" color="blue.600">
                              {product.product?.name || 'Producto'}
                            </Text>
                            <Badge colorScheme="blue" variant="outline">
                              {product.quantity} unidades
                            </Badge>
                          </HStack>
                          <HStack justify="space-between" w="full">
                            <Text fontSize="sm" color="gray.600">
                              Precio unitario: S/ {parseFloat(product.price || 0).toFixed(2)}
                            </Text>
                            <Text fontWeight="bold" color="green.600">
                              Subtotal: S/ {parseFloat(product.subtotal || 0).toFixed(2)}
                            </Text>
                          </HStack>
                        </Box>
                      ))}
                    </VStack>
                  ) : (
                    <Text color="gray.500" fontStyle="italic">No hay productos registrados</Text>
                  )}
                </Box>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Modal para asignar repartidor */}
      <Modal isOpen={isAssignOpen} onClose={onAssignClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Asignar Repartidor</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {orderToAssign && (
              <VStack spacing={4} align="start">
                <Box w="full">
                  <Text fontWeight="bold" mb={2}>
                    Pedido #{orderToAssign.id}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    Cliente: {orderToAssign.customerName}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    Dirección: {orderToAssign.deliveryAddress}
                  </Text>
                </Box>

                <Box w="full">
                  <Text fontWeight="bold" mb={2}>
                    Seleccionar Repartidor:
                  </Text>
                  <Select
                    value={selectedDeliveryPerson}
                    onChange={(e) => setSelectedDeliveryPerson(e.target.value)}
                    placeholder="Selecciona un repartidor"
                  >
                    {deliveryPersons.map((person) => (
                      <option key={person.id} value={person.id}>
                        {person.username} - {person.email}
                      </option>
                    ))}
                  </Select>
                </Box>

                <HStack spacing={3} w="full" justify="end">
                  <Button variant="outline" onClick={onAssignClose}>
                    Cancelar
                  </Button>
                  <Button
                    colorScheme="purple"
                    onClick={handleAssignDelivery}
                    isDisabled={!selectedDeliveryPerson}
                  >
                    Asignar
                  </Button>
                </HStack>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default GuestOrdersManagement;
