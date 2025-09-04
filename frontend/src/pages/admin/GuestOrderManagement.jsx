import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Stack,
  Text,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription
} from '@chakra-ui/react';
import { ChevronDownIcon, SearchIcon } from '@chakra-ui/icons';
import { FaEye, FaUser, FaShoppingCart, FaMapMarkerAlt, FaShoppingBag, FaTruck } from 'react-icons/fa';
import axios from 'axios';

const GuestOrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('todos');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [deliveryPersons, setDeliveryPersons] = useState([]);
  const [selectedDeliveryPerson, setSelectedDeliveryPerson] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  // Configurar axios con base URL
  const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
    timeout: 10000, // 10 segundos de timeout
    headers: {
      'Content-Type': 'application/json'
    }
  });

  // Interceptor para agregar token automáticamente
  apiClient.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Interceptor para manejar errores de respuesta
  apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Token expirado o inválido
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  // Cargar pedidos de invitados con reintentos
  const fetchGuestOrders = async (retry = 0) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.get('/api/guest-orders');
      
      // Validar que la respuesta tenga el formato esperado
      if (response.data && Array.isArray(response.data)) {
        setOrders(response.data);
      } else {
        throw new Error('Formato de respuesta inválido del servidor');
      }
      
      setRetryCount(0);
    } catch (err) {
      console.error('Error al cargar pedidos:', err);
      
      if (retry < 3 && err.code !== 'ERR_NETWORK') {
        // Reintentar hasta 3 veces para errores que no sean de red
        setTimeout(() => {
          setRetryCount(retry + 1);
          fetchGuestOrders(retry + 1);
        }, 2000 * (retry + 1)); // Backoff exponencial
      } else {
        // Manejar diferentes tipos de error
        let errorMessage = 'Error desconocido al cargar los pedidos';
        
        if (err.code === 'ECONNABORTED' || err.code === 'ERR_NETWORK') {
          errorMessage = 'Error de conexión. Verifique su conexión a internet.';
        } else if (err.response) {
          switch (err.response.status) {
            case 500:
              errorMessage = 'Error interno del servidor. Por favor, contacte al administrador.';
              break;
            case 404:
              errorMessage = 'Endpoint no encontrado. Verifique la configuración de la API.';
              break;
            case 403:
              errorMessage = 'No tiene permisos para acceder a esta información.';
              break;
            default:
              errorMessage = `Error del servidor: ${err.response.status} - ${err.response.data?.message || 'Error desconocido'}`;
          }
        }
        
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuestOrders();
  }, []);

  // Cargar repartidores con manejo de errores
  useEffect(() => {
    const fetchDeliveryPersons = async () => {
      try {
        const response = await apiClient.get('/api/delivery-persons');
        if (response.data && Array.isArray(response.data)) {
          // Filtrar solo usuarios con rol 'repartidor'
          const validDeliveryPersons = response.data.filter(person => 
            person.user && person.user.role === 'repartidor'
          );
          
          if (validDeliveryPersons.length === 0) {
            console.warn('No se encontraron repartidores disponibles');
            toast({
              title: 'Advertencia',
              description: 'No hay repartidores disponibles para asignar',
              status: 'warning',
              duration: 5000,
              isClosable: true,
            });
          }
          
          setDeliveryPersons(validDeliveryPersons);
        }
      } catch (err) {
        console.error('Error al cargar repartidores:', err);
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los repartidores disponibles',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    };

    fetchDeliveryPersons();
  }, [toast]);

  // Filtrar pedidos con validación de datos
  const filteredOrders = orders.filter(order => {
    // Validar que el pedido tenga la estructura esperada
    if (!order) return false;
    
    try {
      // Filtro de búsqueda - acceso a propiedades del pedido a través de guestOrder
      const guestName = order.guestOrder?.guestName || '';
      const guestPhone = order.guestOrder?.guestPhone || '';
      const guestEmail = order.guestOrder?.guestEmail || '';
      const orderId = order.id ? order.id.toString() : '';
      
      const searchMatch = 
        guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guestPhone.includes(searchTerm) ||
        guestEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        orderId.includes(searchTerm);
      
      // Filtro de estado
      const statusMatch = statusFilter === 'todos' || order.status === statusFilter;
      
      // Filtro de estado de pago
      const paymentStatusMatch = paymentStatusFilter === 'todos' || order.paymentStatus === paymentStatusFilter;
      
      return searchMatch && statusMatch && paymentStatusMatch;
    } catch (filterError) {
      console.error('Error al filtrar pedido:', filterError, order);
      return false;
    }
  });

  // Abrir modal de detalles
  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setSelectedDeliveryPerson('');
    onOpen();
  };

  // Actualizar estado del pedido
  const updateOrderStatus = async (orderId, status) => {
    try {
      setLoading(true);
      await apiClient.put(`/api/guest-orders/${orderId}/status`, { status });
      
      // Actualizar estado en la lista local
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status } : order
      ));
      
      // Si hay un pedido seleccionado, actualizar también su estado
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({
          ...selectedOrder,
          status
        });
      }
      
      toast({
        title: 'Estado actualizado',
        description: `El pedido #${orderId} ha sido actualizado a ${status}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Recargar los pedidos para asegurar datos actualizados
      fetchGuestOrders();
    } catch (err) {
      console.error('Error al actualizar estado:', err);
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'No se pudo actualizar el estado del pedido',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Actualizar estado de pago
  const updatePaymentStatus = async (orderId, paymentStatus) => {
    try {
      setLoading(true);
      await apiClient.put(`/api/guest-orders/${orderId}/payment-status`, { paymentStatus });
      
      // Actualizar estado en la lista local
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, paymentStatus } : order
      ));
      
      // Si hay un pedido seleccionado, actualizar también su estado de pago
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({
          ...selectedOrder,
          paymentStatus
        });
      }
      
      toast({
        title: 'Estado de pago actualizado',
        description: `El pago del pedido #${orderId} ha sido actualizado a ${paymentStatus}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Recargar los pedidos para asegurar datos actualizados
      fetchGuestOrders();
    } catch (err) {
      console.error('Error al actualizar estado de pago:', err);
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'No se pudo actualizar el estado de pago',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Asignar repartidor
  const assignDeliveryPerson = async () => {
    if (!selectedDeliveryPerson || !selectedOrder) {
      toast({
        title: 'Error',
        description: 'Debe seleccionar un repartidor y un pedido',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // Verificar que el repartidor seleccionado existe
      const deliveryPerson = deliveryPersons.find(p => p.id === selectedDeliveryPerson);
      if (!deliveryPerson) {
        throw new Error('El repartidor seleccionado no existe o no está disponible');
      }
      
      await apiClient.put(`/api/guest-orders/${selectedOrder.id}/assign-delivery`, 
        { deliveryPersonId: selectedDeliveryPerson }
      );
      
      // Actualizar la orden local
      setOrders(orders.map(order => 
        order.id === selectedOrder.id 
          ? { ...order, deliveryPersonId: selectedDeliveryPerson }
          : order
      ));
      
      toast({
        title: 'Repartidor asignado',
        description: `Se ha asignado a ${deliveryPerson.name} al pedido #${selectedOrder.id}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Recargar los pedidos para asegurar datos actualizados
      fetchGuestOrders();
      
      setSelectedDeliveryPerson('');
      onClose();
    } catch (err) {
      console.error('Error al asignar repartidor:', err);
      toast({
        title: 'Error',
        description: err.response?.data?.message || err.message || 'No se pudo asignar el repartidor',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Obtener color de badge según estado
  const getStatusColor = (status) => {
    const statusColors = {
      'pendiente': 'yellow',
      'en proceso': 'blue',
      'confirmado': 'purple',
      'entregado': 'green',
      'cancelado': 'red'
    };
    return statusColors[status] || 'gray';
  };

  // Obtener color de badge según estado de pago
  const getPaymentStatusColor = (status) => {
    const paymentColors = {
      'pendiente': 'yellow',
      'pagado': 'green',
      'rechazado': 'red'
    };
    return paymentColors[status] || 'gray';
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  // Formatear fecha y hora
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  // Formatear precio
  const formatPrice = (price) => {
    if (typeof price !== 'number' || isNaN(price)) return '0.00';
    return price.toFixed(2);
  };

  // Componente de carga
  if (loading) {
    return (
      <Container maxW="container.xl" py={5}>
        <Flex direction="column" align="center" justify="center" height="300px" bg="white" borderRadius="lg" boxShadow="md" p={6}>
          <Spinner 
            size="xl" 
            thickness="4px"
            speed="0.65s"
            emptyColor="gray.200"
            color="teal.500"
            mb={4} 
          />
          <Text fontSize="lg" color="teal.700" fontWeight="medium">Cargando pedidos de invitados...</Text>
          {retryCount > 0 && (
            <Badge colorScheme="teal" mt={2} p={2} borderRadius="md">
              Reintento {retryCount}/3
            </Badge>
          )}
        </Flex>
      </Container>
    );
  }

  // Componente de error
  if (error) {
    return (
      <Container maxW="container.xl" py={5}>
        <Box bg="white" borderRadius="lg" boxShadow="md" overflow="hidden">
          <Alert 
            status="error" 
            variant="solid" 
            borderRadius="0"
            bg="red.500"
            color="white"
          >
            <AlertIcon color="white" />
            <Box>
              <AlertTitle fontSize="lg">Error al cargar pedidos!</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Box>
          </Alert>
          <Box p={6} textAlign="center">
            <Text mb={4} color="gray.600">No pudimos cargar los pedidos. Por favor, intente nuevamente.</Text>
            <Button 
              colorScheme="teal" 
              onClick={() => fetchGuestOrders()}
              size="lg"
              leftIcon={<SearchIcon />}
              _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
              transition="all 0.2s"
            >
              Reintentar
            </Button>
          </Box>
        </Box>
      </Container>
    );
  }

  return (
    <Box bg="gray.50" minH="100vh">
      <Container maxW="container.xl" py={8}>
        <Flex direction="column" bg="white" borderRadius="lg" boxShadow="md" overflow="hidden">
          <Box bg="teal.600" py={4} px={6}>
            <Flex justify="space-between" align="center">
              <Heading color="white" fontSize={['xl', '2xl', '3xl']}>Gestión de Pedidos de Invitados</Heading>
              <Badge colorScheme="teal" bg="white" color="teal.600" fontSize="md" p={2} borderRadius="md">
                {orders.length} Pedidos
              </Badge>
            </Flex>
          </Box>
          
          {/* Filtros */}
          <Box p={6} borderBottom="1px" borderColor="purple.200" bg="purple.50">
            <Heading size="sm" mb={4} color="purple.700" display="flex" alignItems="center">
              <SearchIcon mr={2} />
              Filtros y Búsqueda
            </Heading>
            <Stack direction={{ base: 'column', md: 'row' }} spacing={6} align="flex-end">
              <Box flex={1}>
                <FormLabel htmlFor="search" fontWeight="medium" color="purple.700">Buscar</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <SearchIcon color="purple.500" />
                  </InputLeftElement>
                  <Input
                    id="search"
                    placeholder="Buscar por nombre, teléfono, email o ID"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    borderColor="purple.300"
                    _hover={{ borderColor: 'purple.400' }}
                    _focus={{ borderColor: 'purple.500', boxShadow: '0 0 0 1px purple.500' }}
                    bg="white"
                    borderRadius="md"
                  />
                </InputGroup>
              </Box>
              <Box width={{ base: 'full', md: '220px' }}>
                <FormLabel htmlFor="status" fontWeight="medium" color="purple.700">Estado del pedido</FormLabel>
                <Select 
                  id="status"
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                  borderColor="purple.300"
                  _hover={{ borderColor: 'purple.400' }}
                  _focus={{ borderColor: 'purple.500', boxShadow: '0 0 0 1px purple.500' }}
                  icon={<ChevronDownIcon color="purple.500" />}
                  bg="white"
                  borderRadius="md"
                >
                  <option value="todos">Todos los estados</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="en proceso">En proceso</option>
                  <option value="confirmado">Confirmado</option>
                  <option value="entregado">Entregado</option>
                  <option value="cancelado">Cancelado</option>
                </Select>
              </Box>
              <Box width={{ base: 'full', md: '220px' }}>
                <FormLabel htmlFor="payment" fontWeight="medium" color="purple.700">Estado de pago</FormLabel>
                <Select 
                  id="payment"
                  value={paymentStatusFilter} 
                  onChange={(e) => setPaymentStatusFilter(e.target.value)}
                  borderColor="purple.300"
                  _hover={{ borderColor: 'purple.400' }}
                  _focus={{ borderColor: 'purple.500', boxShadow: '0 0 0 1px purple.500' }}
                  icon={<ChevronDownIcon color="purple.500" />}
                  bg="white"
                  borderRadius="md"
                >
                  <option value="todos">Todos los pagos</option>
                  <option value="pendiente">Pago pendiente</option>
                  <option value="pagado">Pagado</option>
                  <option value="rechazado">Rechazado</option>
                </Select>
              </Box>
            </Stack>
          </Box>
      
          {/* Tabla de pedidos */}
          <Box p={6}>
            {filteredOrders.length === 0 ? (
              <Alert status="info" borderRadius="md" variant="subtle" bg="purple.50" color="purple.700">
                <AlertIcon color="purple.500" />
                <AlertDescription>
                  {orders.length === 0 
                    ? 'No hay pedidos de invitados disponibles'
                    : 'No se encontraron pedidos con los filtros seleccionados'
                  }
                </AlertDescription>
              </Alert>
            ) : (
              <Box overflowX="auto" borderRadius="lg" boxShadow="md" border="1px" borderColor="purple.200">
                <Box p={3} bg="purple.50" borderBottom="1px" borderColor="purple.200">
                  <Flex justify="space-between" align="center">
                    <Text fontWeight="medium" color="purple.700">Resultados ({filteredOrders.length})</Text>
                    <Badge colorScheme="purple" borderRadius="full" px={3} py={1}>
                      {filteredOrders.length} {filteredOrders.length === 1 ? 'pedido' : 'pedidos'}
                    </Badge>
                  </Flex>
                </Box>
                <Table variant="simple" colorScheme="purple" size="md" w="full">
                  <Thead bg="purple.50">
                    <Tr>
                      <Th py={4} textAlign="center" fontSize="sm" color="purple.700">ID</Th>
                      <Th py={4} fontSize="sm" color="purple.700">Cliente</Th>
                      <Th py={4} fontSize="sm" color="purple.700">Contacto</Th>
                      <Th py={4} fontSize="sm" color="purple.700">Fecha</Th>
                      <Th py={4} isNumeric fontSize="sm" color="purple.700">Total</Th>
                      <Th py={4} textAlign="center" fontSize="sm" color="purple.700">Estado</Th>
                      <Th py={4} textAlign="center" fontSize="sm" color="purple.700">Pago</Th>
                      <Th py={4} textAlign="center" fontSize="sm" color="purple.700">Acciones</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredOrders.map((order, index) => (
                      <Tr 
                        key={order.id} 
                        _hover={{ bg: 'purple.50' }}
                        bg={index % 2 === 0 ? 'white' : 'gray.50'}
                        transition="all 0.2s"
                      >
                        <Td textAlign="center" fontWeight="medium">{order.id}</Td>
                        <Td fontWeight="medium">{order.guestOrder?.guestName || 'N/A'}</Td>
                        <Td>
                          <Text fontWeight="medium">{order.guestOrder?.guestPhone || 'N/A'}</Text>
                          <Text fontSize="xs" color="purple.600">
                            {order.guestOrder?.guestEmail || 'N/A'}
                          </Text>
                        </Td>
                        <Td>{formatDate(order.orderDate)}</Td>
                        <Td isNumeric fontWeight="bold" color="purple.700">
                          S/ {formatPrice(order.guestOrder?.total)}
                        </Td>
                        <Td textAlign="center">
                          <Badge 
                            colorScheme={getStatusColor(order.status)}
                            px={2} py={1} borderRadius="full"
                            textTransform="capitalize"
                            fontWeight="medium"
                          >
                            {order.status || 'Sin estado'}
                          </Badge>
                        </Td>
                        <Td textAlign="center">
                          <Badge 
                            colorScheme={getPaymentStatusColor(order.paymentStatus)}
                            px={2} py={1} borderRadius="full"
                            textTransform="capitalize"
                            fontWeight="medium"
                          >
                            {order.paymentStatus || 'Sin estado'}
                          </Badge>
                        </Td>
                        <Td>
                          <Flex gap={2} justifyContent="center">
                            <IconButton
                              icon={<FaEye />}
                              colorScheme="purple"
                              size="sm"
                              aria-label="Ver detalles"
                              onClick={() => handleViewDetails(order)}
                              borderRadius="md"
                              _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
                              transition="all 0.2s"
                            />
                            <Menu placement="bottom-end">
                              <MenuButton 
                                as={Button} 
                                rightIcon={<ChevronDownIcon />} 
                                size="sm" 
                                colorScheme="purple" 
                                variant="outline"
                                borderRadius="md"
                                _hover={{ bg: 'purple.50' }}
                              >
                                Estado
                              </MenuButton>
                              <MenuList shadow="lg" borderRadius="md" p={1}>
                                <MenuItem 
                                  onClick={() => updateOrderStatus(order.id, 'pendiente')}
                                  _hover={{ bg: 'yellow.50' }}
                                  borderRadius="md"
                                >
                                  Pendiente
                                </MenuItem>
                                <MenuItem 
                                  onClick={() => updateOrderStatus(order.id, 'en proceso')}
                                  _hover={{ bg: 'blue.50' }}
                                  borderRadius="md"
                                >
                                  En proceso
                                </MenuItem>
                                <MenuItem 
                                  onClick={() => updateOrderStatus(order.id, 'confirmado')}
                                  _hover={{ bg: 'purple.50' }}
                                  borderRadius="md"
                                >
                                  Confirmado
                                </MenuItem>
                                <MenuItem 
                                  onClick={() => updateOrderStatus(order.id, 'entregado')}
                                  _hover={{ bg: 'green.50' }}
                                  borderRadius="md"
                                >
                                  Entregado
                                </MenuItem>
                                <MenuItem 
                                  onClick={() => updateOrderStatus(order.id, 'cancelado')}
                                  _hover={{ bg: 'red.50' }}
                                  borderRadius="md"
                                >
                                  Cancelado
                                </MenuItem>
                              </MenuList>
                            </Menu>
                            <Menu placement="bottom-end">
                              <MenuButton 
                                as={Button} 
                                rightIcon={<ChevronDownIcon />} 
                                size="sm" 
                                colorScheme="purple" 
                                variant="outline"
                                borderRadius="md"
                                _hover={{ bg: 'purple.50' }}
                              >
                                Pago
                              </MenuButton>
                              <MenuList shadow="lg" borderRadius="md" p={1}>
                                <MenuItem 
                                  onClick={() => updatePaymentStatus(order.id, 'pendiente')}
                                  _hover={{ bg: 'yellow.50' }}
                                  borderRadius="md"
                                >
                                  Pendiente
                                </MenuItem>
                                <MenuItem 
                                  onClick={() => updatePaymentStatus(order.id, 'pagado')}
                                  _hover={{ bg: 'green.50' }}
                                  borderRadius="md"
                                >
                                  Pagado
                                </MenuItem>
                                <MenuItem 
                                  onClick={() => updatePaymentStatus(order.id, 'rechazado')}
                                  _hover={{ bg: 'red.50' }}
                                  borderRadius="md"
                                >
                                  Rechazado
                                </MenuItem>
                              </MenuList>
                            </Menu>
                          </Flex>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            )}
          </Box>
          
          {/* Modal de detalles */}
          {selectedOrder && (
            <Modal isOpen={isOpen} onClose={onClose} size="xl">
              <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(5px)" />
              <ModalContent maxW="800px" borderRadius="lg" boxShadow="2xl">
                <ModalHeader 
                  bg="purple.600" 
                  color="white" 
                  borderTopRadius="lg" 
                  py={4}
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Flex align="center">
                    <Box 
                      bg="white" 
                      color="purple.600" 
                      borderRadius="full" 
                      p={1} 
                      mr={3}
                      boxSize="32px"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <FaEye />
                    </Box>
                    <Text fontWeight="bold">Detalles del Pedido #{selectedOrder.id}</Text>
                  </Flex>
                  <Badge 
                    colorScheme={getStatusColor(selectedOrder.status)}
                    fontSize="sm"
                    py={1}
                    px={3}
                    borderRadius="full"
                    textTransform="capitalize"
                  >
                    {selectedOrder.status || "Sin estado"}
                  </Badge>
                </ModalHeader>
                <ModalCloseButton color="white" />
                <ModalBody p={6}>
                  <Stack spacing={6}>
                    <Flex direction={{ base: "column", md: "row" }} gap={6}>
                      {/* Información del cliente */}
                      <Box 
                        flex="1" 
                        p={4} 
                        borderRadius="md" 
                        bg="purple.50" 
                        borderWidth="1px" 
                        borderColor="purple.100"
                        boxShadow="sm"
                      >
                        <Flex align="center" mb={3}>
                          <Box 
                            bg="purple.100" 
                            color="purple.700" 
                            borderRadius="full" 
                            p={2} 
                            mr={2}
                          >
                            <FaUser />
                          </Box>
                          <Heading size="sm" color="purple.700">Información del Cliente</Heading>
                        </Flex>
                        <Stack spacing={2} pl={2}>
                          <Flex>
                            <Text fontWeight="medium" width="100px" color="gray.600">Nombre:</Text>
                            <Text>{selectedOrder.guestOrder?.guestName || 'N/A'}</Text>
                          </Flex>
                          <Flex>
                            <Text fontWeight="medium" width="100px" color="gray.600">Teléfono:</Text>
                            <Text>{selectedOrder.guestOrder?.guestPhone || 'N/A'}</Text>
                          </Flex>
                          <Flex>
                            <Text fontWeight="medium" width="100px" color="gray.600">Email:</Text>
                            <Text>{selectedOrder.guestOrder?.guestEmail || 'N/A'}</Text>
                          </Flex>
                        </Stack>
                      </Box>
                      
                      {/* Detalles del pedido */}
                      <Box 
                        flex="1" 
                        p={4} 
                        borderRadius="md" 
                        bg="blue.50" 
                        borderWidth="1px" 
                        borderColor="blue.100"
                        boxShadow="sm"
                      >
                        <Flex align="center" mb={3}>
                          <Box 
                            bg="blue.100" 
                            color="blue.700" 
                            borderRadius="full" 
                            p={2} 
                            mr={2}
                          >
                            <FaShoppingCart />
                          </Box>
                          <Heading size="sm" color="blue.700">Detalles del Pedido</Heading>
                        </Flex>
                        <Stack spacing={2} pl={2}>
                          <Flex>
                            <Text fontWeight="medium" width="100px" color="gray.600">Fecha:</Text>
                            <Text>{formatDateTime(selectedOrder.orderDate)}</Text>
                          </Flex>
                          <Flex>
                            <Text fontWeight="medium" width="100px" color="gray.600">Estado:</Text>
                            <Badge colorScheme={getStatusColor(selectedOrder.status)} borderRadius="full" px={2}>
                              {selectedOrder.status || 'Sin estado'}
                            </Badge>
                          </Flex>
                          <Flex>
                            <Text fontWeight="medium" width="100px" color="gray.600">Pago:</Text>
                            <Badge colorScheme={getPaymentStatusColor(selectedOrder.paymentStatus)} borderRadius="full" px={2}>
                              {selectedOrder.paymentStatus || 'Sin estado'}
                            </Badge>
                          </Flex>
                          <Flex>
                            <Text fontWeight="medium" width="100px" color="gray.600">Método:</Text>
                            <Text>{
                              (() => {
                                switch(selectedOrder.guestOrder?.paymentMethod) {
                                  case 'efectivo': return 'Efectivo';
                                  case 'tarjeta': return 'Tarjeta';
                                  case 'yape': return 'Yape';
                                  default: return selectedOrder.guestOrder?.paymentMethod || 'N/A';
                                }
                              })()
                            }</Text>
                          </Flex>
                        </Stack>
                      </Box>
                    </Flex>
                    
                    {/* Dirección de envío */}
                    <Box 
                      p={4} 
                      borderRadius="md" 
                      bg="gray.50" 
                      borderWidth="1px" 
                      borderColor="gray.200"
                      boxShadow="sm"
                    >
                      <Flex align="center" mb={3}>
                        <Box 
                          bg="gray.200" 
                          color="gray.700" 
                          borderRadius="full" 
                          p={2} 
                          mr={2}
                        >
                          <FaMapMarkerAlt />
                        </Box>
                        <Heading size="sm" color="gray.700">Dirección de Envío</Heading>
                      </Flex>
                      <Text pl={10}>{selectedOrder.guestOrder?.shippingAddress || 'N/A'}</Text>
                    </Box>
                    
                    {/* Productos */}
                    {selectedOrder.guestOrder?.orderDetails && selectedOrder.guestOrder.orderDetails.length > 0 ? (
                      <Box 
                        p={4} 
                        borderRadius="md" 
                        bg="white" 
                        borderWidth="1px" 
                        borderColor="purple.100"
                        boxShadow="md"
                      >
                        <Flex align="center" mb={4}>
                          <Box 
                            bg="purple.100" 
                            color="purple.700" 
                            borderRadius="full" 
                            p={2} 
                            mr={2}
                          >
                            <FaShoppingBag />
                          </Box>
                          <Heading size="sm" color="purple.700">Productos</Heading>
                          <Badge ml={2} colorScheme="purple" borderRadius="full">
                            {selectedOrder.guestOrder.orderDetails.length} items
                          </Badge>
                        </Flex>
                        <Box overflowX="auto">
                          <Table size="sm" colorScheme="purple" variant="simple">
                            <Thead bg="purple.50">
                              <Tr>
                                <Th color="purple.700">Producto</Th>
                                <Th isNumeric color="purple.700">Cantidad</Th>
                                <Th isNumeric color="purple.700">Precio</Th>
                                <Th isNumeric color="purple.700">Subtotal</Th>
                              </Tr>
                            </Thead>
                            <Tbody>
                              {selectedOrder.guestOrder.orderDetails.map((detail, index) => (
                                <Tr key={detail.id || index}>
                                  <Td fontWeight="medium">{detail.product?.name || 'Producto sin nombre'}</Td>
                                  <Td isNumeric>{detail.quantity || 0}</Td>
                                  <Td isNumeric>S/ {formatPrice(detail.price)}</Td>
                                  <Td isNumeric>S/ {formatPrice(detail.subtotal)}</Td>
                                </Tr>
                              ))}
                            </Tbody>
                          </Table>
                        </Box>
                        <Flex 
                          justify="flex-end" 
                          mt={4} 
                          p={3} 
                          bg="purple.50" 
                          borderRadius="md"
                        >
                          <Text fontWeight="bold" mr={4}>Total:</Text>
                          <Text fontWeight="bold" fontSize="lg" color="purple.700">
                            S/ {formatPrice(selectedOrder.guestOrder.total)}
                          </Text>
                        </Flex>
                      </Box>
                    ) : (
                      <Alert status="info" borderRadius="md" variant="subtle">
                        <AlertIcon />
                        <AlertDescription>No hay productos en este pedido</AlertDescription>
                      </Alert>
                    )}
                    
                    {/* Asignar repartidor */}
                    <Box 
                      p={4} 
                      borderRadius="md" 
                      bg="green.50" 
                      borderWidth="1px" 
                      borderColor="green.100"
                      boxShadow="sm"
                    >
                      <Flex align="center" mb={3}>
                        <Box 
                          bg="green.100" 
                          color="green.700" 
                          borderRadius="full" 
                          p={2} 
                          mr={2}
                        >
                          <FaTruck />
                        </Box>
                        <Heading size="sm" color="green.700">
                          {selectedOrder.deliveryPersonId ? 'Repartidor Asignado' : 'Asignar Repartidor'}
                        </Heading>
                      </Flex>
                      
                      {selectedOrder.deliveryPersonId ? (
                        <Box>
                          <Flex align="center" mb={2}>
                            <Text fontWeight="medium" width="100px" color="gray.600">Repartidor:</Text>
                            <Badge colorScheme="green" borderRadius="full" px={2}>
                              {deliveryPersons.find(p => p.id === selectedOrder.deliveryPersonId)?.name || 'Asignado'}
                            </Badge>
                          </Flex>
                          <Button 
                            mt={2}
                            colorScheme="blue" 
                            size="sm"
                            onClick={() => setSelectedOrder({...selectedOrder, deliveryPersonId: null})}
                            leftIcon={<FaTruck />}
                          >
                            Cambiar Repartidor
                          </Button>
                        </Box>
                      ) : deliveryPersons.length > 0 ? (
                        <FormControl>
                          <FormLabel color="green.700">Seleccionar Repartidor</FormLabel>
                          <Flex direction={{ base: "column", sm: "row" }} gap={3}>
                            <Select 
                              placeholder="Seleccionar repartidor"
                              value={selectedDeliveryPerson}
                              onChange={(e) => setSelectedDeliveryPerson(e.target.value)}
                              flex="1"
                              bg="white"
                              borderColor="green.200"
                              _hover={{ borderColor: "green.300" }}
                              _focus={{ borderColor: "green.400", boxShadow: "0 0 0 1px green.400" }}
                              isDisabled={loading}
                            >
                              {deliveryPersons.map(person => (
                                <option key={person.id} value={person.id}>
                                  {person.name}
                                </option>
                              ))}
                            </Select>
                            <Button 
                              colorScheme="green" 
                              onClick={assignDeliveryPerson}
                              isDisabled={!selectedDeliveryPerson || loading}
                              leftIcon={<FaTruck />}
                              px={6}
                              isLoading={loading}
                            >
                              Asignar Repartidor
                            </Button>
                          </Flex>
                        </FormControl>
                      ) : (
                        <Alert status="warning" borderRadius="md">
                          <AlertIcon />
                          <AlertDescription>No hay repartidores disponibles</AlertDescription>
                        </Alert>
                      )}
                    </Box>
                  </Stack>
                </ModalBody>
                <ModalFooter borderTop="1px" borderColor="gray.100" p={4}>
                  <Button 
                    onClick={onClose} 
                    size="lg" 
                    colorScheme="gray" 
                    borderRadius="md"
                    _hover={{ bg: "gray.200" }}
                  >
                    Cerrar
                  </Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
          )}
        </Flex>
      </Container>
    </Box>
  );
};

export default GuestOrderManagement;