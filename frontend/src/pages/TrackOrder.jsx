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
  Alert,
  AlertIcon,
  Spinner,
  Center,
  useBreakpointValue,
  Divider,
  useToast,
  Badge,
  Progress,
  SimpleGrid
} from '@chakra-ui/react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaSearch, FaTruck, FaCheck, FaClock, FaTimes, FaHome } from 'react-icons/fa';
import useOrderStore from '../stores/orderStore';

const TrackOrder = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const toast = useToast();
  const isMobile = useBreakpointValue({ base: true, md: false });

  // Store
  const { getOrderById, fetchOrders } = useOrderStore();

  // Estados locales
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchId, setSearchId] = useState(id || '');
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (id) {
      loadOrder(id);
    }
  }, [id]);

  const loadOrder = async (orderId) => {
    setLoading(true);
    setNotFound(false);
    
    try {
      // Primero intentar buscar en el store
      let orderData = getOrderById(parseInt(orderId));
      
      if (!orderData) {
        // Si no está en el store, cargar todos los pedidos
        await fetchOrders();
        orderData = getOrderById(parseInt(orderId));
      }
      
      if (orderData) {
        setOrder(orderData);
      } else {
        setNotFound(true);
      }
    } catch (error) {
      console.error('Error al cargar pedido:', error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (!searchId.trim()) {
      toast({
        title: 'ID requerido',
        description: 'Ingresa un número de pedido',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    loadOrder(searchId.trim());
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'pendiente':
        return {
          color: 'yellow',
          text: 'Pendiente',
          icon: FaClock,
          description: 'Tu pedido está siendo procesado'
        };
      case 'confirmado':
        return {
          color: 'blue',
          text: 'Confirmado',
          icon: FaCheck,
          description: 'Tu pedido ha sido confirmado'
        };
      case 'en_preparacion':
        return {
          color: 'orange',
          text: 'En Preparación',
          icon: FaTruck,
          description: 'Tu pedido está siendo preparado'
        };
      case 'en_camino':
        return {
          color: 'purple',
          text: 'En Camino',
          icon: FaTruck,
          description: 'Tu pedido está en camino'
        };
      case 'entregado':
        return {
          color: 'green',
          text: 'Entregado',
          icon: FaCheck,
          description: 'Tu pedido ha sido entregado'
        };
      case 'cancelado':
        return {
          color: 'red',
          text: 'Cancelado',
          icon: FaTimes,
          description: 'Tu pedido ha sido cancelado'
        };
      default:
        return {
          color: 'gray',
          text: status,
          icon: FaClock,
          description: 'Estado desconocido'
        };
    }
  };

  const getProgressValue = (status) => {
    switch (status) {
      case 'pendiente':
        return 20;
      case 'confirmado':
        return 40;
      case 'en_preparacion':
        return 60;
      case 'en_camino':
        return 80;
      case 'entregado':
        return 100;
      case 'cancelado':
        return 0;
      default:
        return 0;
    }
  };

  const getStatusSteps = () => {
    return [
      { key: 'pendiente', label: 'Pendiente', description: 'Pedido recibido' },
      { key: 'confirmado', label: 'Confirmado', description: 'Pedido confirmado' },
      { key: 'en_preparacion', label: 'En Preparación', description: 'Preparando pedido' },
      { key: 'en_camino', label: 'En Camino', description: 'Enviando pedido' },
      { key: 'entregado', label: 'Entregado', description: 'Pedido entregado' }
    ];
  };

  if (loading) {
    return (
      <Center h="400px">
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <Box minH="100vh" bg="gray.50" py={8}>
      <Box maxW="800px" mx="auto" px={4}>
        <VStack spacing={8}>
          {/* Header */}
          <Box textAlign="center">
            <Heading size="xl" color="blue.600" mb={2}>
              Seguimiento de Pedido
            </Heading>
            <Text color="gray.600" fontSize="lg">
              Consulta el estado de tu pedido
            </Text>
          </Box>

          {/* Búsqueda */}
          <Card w="full">
            <CardHeader>
              <Heading size="md" color="gray.700">
                Buscar Pedido
              </Heading>
            </CardHeader>
            <CardBody>
              <HStack spacing={4}>
                <InputGroup flex={1}>
                  <InputLeftElement pointerEvents="none">
                    <FaSearch color="gray.300" />
                  </InputLeftElement>
                  <Input
                    placeholder="Ingresa el número de pedido"
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </InputGroup>
                <Button
                  colorScheme="blue"
                  onClick={handleSearch}
                  isLoading={loading}
                  loadingText="Buscando..."
                >
                  Buscar
                </Button>
              </HStack>
            </CardBody>
          </Card>

          {/* Resultado de búsqueda */}
          {notFound && (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              <Box>
                <Text fontWeight="bold">Pedido no encontrado</Text>
                <Text fontSize="sm">
                  Verifica que el número de pedido sea correcto
                </Text>
              </Box>
            </Alert>
          )}

          {/* Información del pedido */}
          {order && (
            <Card w="full">
              <CardHeader>
                <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
                  <VStack align="start" spacing={1}>
                    <Heading size="md" color="gray.700">
                      Pedido #{order.id}
                    </Heading>
                    <Text fontSize="sm" color="gray.500">
                      {new Date(order.createdAt).toLocaleString()}
                    </Text>
                  </VStack>
                  <Badge colorScheme={getStatusInfo(order.status).color} size="lg">
                    {getStatusInfo(order.status).text}
                  </Badge>
                </Flex>
              </CardHeader>
              <CardBody>
                <VStack spacing={6}>
                  {/* Estado actual */}
                  <Box w="full" p={4} bg={`${getStatusInfo(order.status).color}.50`} borderRadius="md">
                    <HStack spacing={3} mb={3}>
                      {React.createElement(getStatusInfo(order.status).icon, {
                        color: `${getStatusInfo(order.status).color}.500`,
                        size: "24px"
                      })}
                      <Text fontWeight="bold" fontSize="lg">
                        {getStatusInfo(order.status).text}
                      </Text>
                    </HStack>
                    <Text fontSize="sm" color="gray.600">
                      {getStatusInfo(order.status).description}
                    </Text>
                    <Progress
                      value={getProgressValue(order.status)}
                      colorScheme={getStatusInfo(order.status).color}
                      size="sm"
                      mt={3}
                    />
                  </Box>

                  {/* Progreso del pedido */}
                  <Box w="full">
                    <Text fontWeight="bold" mb={4} color="gray.700">
                      Progreso del Pedido
                    </Text>
                    <VStack spacing={3}>
                      {getStatusSteps().map((step, index) => {
                        const isCompleted = getProgressValue(order.status) > getProgressValue(step.key);
                        const isCurrent = order.status === step.key;
                        
                        return (
                          <HStack key={step.key} w="full" spacing={4}>
                            <Box
                              w="8"
                              h="8"
                              borderRadius="full"
                              bg={isCompleted ? 'green.500' : isCurrent ? `${getStatusInfo(order.status).color}.500` : 'gray.300'}
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              color="white"
                              fontWeight="bold"
                              fontSize="sm"
                            >
                              {isCompleted ? <FaCheck /> : index + 1}
                            </Box>
                            <VStack align="start" spacing={1} flex={1}>
                              <Text fontWeight={isCurrent ? 'bold' : 'normal'}>
                                {step.label}
                              </Text>
                              <Text fontSize="sm" color="gray.600">
                                {step.description}
                              </Text>
                            </VStack>
                          </HStack>
                        );
                      })}
                    </VStack>
                  </Box>

                  {/* Información del cliente */}
                  <Box w="full" p={4} bg="gray.50" borderRadius="md">
                    <Text fontWeight="bold" mb={3} color="gray.700">
                      Información de Entrega
                    </Text>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                      <Box>
                        <Text fontSize="sm" color="gray.600">Cliente:</Text>
                        <Text fontWeight="bold">{order.clientName || 'N/A'}</Text>
                      </Box>
                      <Box>
                        <Text fontSize="sm" color="gray.600">Teléfono:</Text>
                        <Text fontWeight="bold">{order.clientPhone || 'N/A'}</Text>
                      </Box>
                      <Box colSpan={{ base: 1, md: 2 }}>
                        <Text fontSize="sm" color="gray.600">Dirección:</Text>
                        <Text fontWeight="bold">{order.deliveryAddress || 'N/A'}</Text>
                      </Box>
                    </SimpleGrid>
                  </Box>

                  {/* Productos */}
                  <Box w="full">
                    <Text fontWeight="bold" mb={3} color="gray.700">
                      Productos Solicitados
                    </Text>
                    <VStack spacing={2}>
                      {order.items?.map((item, index) => (
                        <HStack key={index} justify="space-between" w="full" p={2} bg="gray.50" borderRadius="md">
                          <Text fontSize="sm">{item.name} x {item.quantity}</Text>
                          <Text fontSize="sm" fontWeight="bold">
                            S/ {parseFloat(item.subtotal).toFixed(2)}
                          </Text>
                        </HStack>
                      )) || (
                        <Text fontSize="sm" color="gray.500">No hay información de productos</Text>
                      )}
                    </VStack>
                  </Box>

                  {/* Total */}
                  <Box w="full" p={4} border="1px" borderColor="gray.200" borderRadius="md">
                    <HStack justify="space-between">
                      <Text fontWeight="bold" fontSize="lg">Total:</Text>
                      <Text fontWeight="bold" fontSize="lg" color="blue.600">
                        S/ {parseFloat(order.total || 0).toFixed(2)}
                      </Text>
                    </HStack>
                  </Box>

                  {/* Botones de acción */}
                  <HStack spacing={4} w="full">
                    <Button
                      leftIcon={<FaHome />}
                      colorScheme="blue"
                      onClick={() => navigate('/guest-order')}
                      flex={1}
                    >
                      Nuevo Pedido
                    </Button>
                    <Button
                      leftIcon={<FaTruck />}
                      colorScheme="green"
                      variant="outline"
                      onClick={() => navigate(`/receipt/${order.id}`)}
                      flex={1}
                    >
                      Ver Recibo
                    </Button>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          )}
        </VStack>
      </Box>
    </Box>
  );
};

export default TrackOrder;
