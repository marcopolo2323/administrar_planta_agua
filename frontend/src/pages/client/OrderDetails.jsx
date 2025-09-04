import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  Flex,
  Stack,
  Divider,
  Badge,
  Spinner,
  useColorModeValue,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  HStack,
  VStack,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
} from '@chakra-ui/react';
import { ArrowBackIcon, ExternalLinkIcon, TimeIcon } from '@chakra-ui/icons';

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      navigate('/client/login');
      return;
    }
    
    const fetchOrderDetails = async () => {
      setIsLoading(true);
      try {
        const config = {
          headers: { Authorization: `Bearer ${token}` }
        };
        
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/orders/${orderId}`,
          config
        );
        
        setOrder(response.data);
      } catch (error) {
        console.error('Error al cargar detalles del pedido:', error);
        toast.error('Error al cargar los detalles del pedido.');
        
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('client');
          navigate('/client/login');
        } else if (error.response?.status === 404) {
          toast.error('Pedido no encontrado');
          navigate('/client/dashboard');
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrderDetails();
  }, [orderId, navigate]);

  // Función para formatear la fecha
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  // Función para determinar el color del badge según el estado
  const getStatusColor = (status) => {
    switch (status) {
      case 'pendiente':
        return 'yellow';
      case 'en_proceso':
        return 'blue';
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

  // Función para traducir el estado
  const translateStatus = (status) => {
    const statusMap = {
      'pendiente': 'Pendiente',
      'en_proceso': 'En proceso',
      'en_camino': 'En camino',
      'entregado': 'Entregado',
      'cancelado': 'Cancelado'
    };
    return statusMap[status] || status;
  };

  // Función para traducir el estado de pago
  const translatePaymentStatus = (status) => {
    const statusMap = {
      'pendiente': 'Pendiente',
      'pagado': 'Pagado',
      'cancelado': 'Cancelado'
    };
    return statusMap[status] || status;
  };

  // Función para determinar el color del badge de pago
  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'pendiente':
        return 'orange';
      case 'pagado':
        return 'green';
      case 'cancelado':
        return 'red';
      default:
        return 'gray';
    }
  };

  const handleGoBack = () => {
    navigate('/client/dashboard');
  };

  const handlePayNow = async () => {
    if (order.paymentStatus !== 'pendiente') {
      toast.info('Este pedido ya ha sido pagado o cancelado');
      return;
    }
    
    setIsPaymentLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      // Crear un nuevo pago para este pedido
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/payments`,
        {
          orderId: order.id,
          amount: order.total,
          paymentMethod: 'online'
        },
        config
      );
      
      // Redirigir a la página de pago
      navigate(`/client/payment/${order.id}`, { state: { paymentId: response.data.id } });
    } catch (error) {
      console.error('Error al iniciar el pago:', error);
      toast.error('Error al procesar el pago. Inténtalo de nuevo.');
    } finally {
      setIsPaymentLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Flex justify="center" align="center" height="100vh">
        <Spinner size="xl" color="blue.500" />
      </Flex>
    );
  }

  if (!order) {
    return (
      <Container maxW="container.lg" py={8}>
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          <AlertTitle mr={2}>Pedido no encontrado</AlertTitle>
          <AlertDescription>No se pudo encontrar el pedido solicitado.</AlertDescription>
        </Alert>
        <Button leftIcon={<ArrowBackIcon />} mt={4} onClick={handleGoBack}>
          Volver al Dashboard
        </Button>
      </Container>
    );
  }

  return (
    <Container maxW="container.lg" py={8}>
      <Flex direction="column" gap={6}>
        <Flex align="center" gap={4}>
          <IconButton
            icon={<ArrowBackIcon />}
            aria-label="Volver"
            onClick={handleGoBack}
            variant="outline"
          />
          <Heading size="lg">Detalles del Pedido #{order.id}</Heading>
          {(order.status === 'en_proceso' || order.status === 'en_camino') && (
            <Button 
              leftIcon={<TimeIcon />} 
              colorScheme="blue" 
              size="sm"
              ml="auto"
              onClick={() => navigate(`/client/track/${order.id}`)}
            >
              Seguimiento en tiempo real
            </Button>
          )}
        </Flex>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
          {/* Información general del pedido */}
          <Box
            borderWidth="1px"
            borderRadius="lg"
            borderColor={borderColor}
            bg={bgColor}
            p={5}
            boxShadow="sm"
          >
            <Heading size="md" mb={4}>Información del Pedido</Heading>
            
            <Stack spacing={4}>
              <Flex justify="space-between" align="center">
                <Text fontWeight="bold">Estado:</Text>
                <Badge colorScheme={getStatusColor(order.status)} fontSize="0.9em" px={2} py={1} borderRadius="md">
                  {translateStatus(order.status)}
                </Badge>
              </Flex>
              
              <Flex justify="space-between" align="center">
                <Text fontWeight="bold">Estado de pago:</Text>
                <Badge colorScheme={getPaymentStatusColor(order.paymentStatus)} fontSize="0.9em" px={2} py={1} borderRadius="md">
                  {translatePaymentStatus(order.paymentStatus)}
                </Badge>
              </Flex>
              
              <Flex justify="space-between">
                <Text fontWeight="bold">Fecha de pedido:</Text>
                <Text>{formatDate(order.createdAt)}</Text>
              </Flex>
              
              <Flex justify="space-between">
                <Text fontWeight="bold">Método de pago:</Text>
                <Text>{order.paymentMethod === 'efectivo' ? 'Efectivo' : 'Pago en línea'}</Text>
              </Flex>
              
              <Divider my={2} />
              
              <Flex justify="space-between">
                <Text fontWeight="bold">Dirección de entrega:</Text>
                <Text textAlign="right">{order.deliveryAddress}</Text>
              </Flex>
              
              <Flex justify="space-between">
                <Text fontWeight="bold">Teléfono de contacto:</Text>
                <Text>{order.contactPhone}</Text>
              </Flex>
              
              {order.notes && (
                <Box>
                  <Text fontWeight="bold">Notas:</Text>
                  <Text mt={1}>{order.notes}</Text>
                </Box>
              )}
              
              {order.deliveryPerson && (
                <Box mt={2}>
                  <Text fontWeight="bold">Repartidor asignado:</Text>
                  <Text mt={1}>{order.deliveryPerson.name}</Text>
                  <Text fontSize="sm" color="gray.600">{order.deliveryPerson.phone}</Text>
                </Box>
              )}
            </Stack>
          </Box>

          {/* Resumen de pago */}
          <Box
            borderWidth="1px"
            borderRadius="lg"
            borderColor={borderColor}
            bg={bgColor}
            p={5}
            boxShadow="sm"
          >
            <Heading size="md" mb={4}>Resumen de Pago</Heading>
            
            <VStack spacing={4} align="stretch">
              <Stat>
                <StatLabel>Total del Pedido</StatLabel>
                <StatNumber>S/ {order.total.toFixed(2)}</StatNumber>
                <StatHelpText>{order.items?.length || 0} productos</StatHelpText>
              </Stat>
              
              <Divider />
              
              {order.paymentStatus === 'pendiente' && order.status !== 'cancelado' && (
                <Button
                  colorScheme="blue"
                  size="lg"
                  rightIcon={<ExternalLinkIcon />}
                  onClick={handlePayNow}
                  isLoading={isPaymentLoading}
                  loadingText="Procesando"
                >
                  Pagar Ahora
                </Button>
              )}
              
              {order.paymentStatus === 'pagado' && (
                <Alert status="success" borderRadius="md">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>Pago completado</AlertTitle>
                    <AlertDescription>
                      El pago de este pedido ha sido procesado correctamente.
                    </AlertDescription>
                  </Box>
                </Alert>
              )}
              
              {order.paymentStatus === 'cancelado' && (
                <Alert status="error" borderRadius="md">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>Pago cancelado</AlertTitle>
                    <AlertDescription>
                      El pago de este pedido ha sido cancelado.
                    </AlertDescription>
                  </Box>
                </Alert>
              )}
            </VStack>
          </Box>
        </SimpleGrid>

        {/* Detalle de productos */}
        <Box
          borderWidth="1px"
          borderRadius="lg"
          borderColor={borderColor}
          bg={bgColor}
          p={5}
          boxShadow="sm"
        >
          <Heading size="md" mb={4}>Productos</Heading>
          
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Producto</Th>
                <Th isNumeric>Cantidad</Th>
                <Th isNumeric>Precio Unitario</Th>
                <Th isNumeric>Subtotal</Th>
              </Tr>
            </Thead>
            <Tbody>
              {order.items?.map((item) => (
                <Tr key={item.id}>
                  <Td>{item.product?.name || 'Producto'}</Td>
                  <Td isNumeric>{item.quantity}</Td>
                  <Td isNumeric>S/ {item.price.toFixed(2)}</Td>
                  <Td isNumeric>S/ {(item.price * item.quantity).toFixed(2)}</Td>
                </Tr>
              ))}
              <Tr fontWeight="bold">
                <Td colSpan={3} textAlign="right">Total:</Td>
                <Td isNumeric>S/ {order.total.toFixed(2)}</Td>
              </Tr>
            </Tbody>
          </Table>
        </Box>

        {/* Historial de seguimiento */}
        {order.trackingUpdates && order.trackingUpdates.length > 0 && (
          <Box
            borderWidth="1px"
            borderRadius="lg"
            borderColor={borderColor}
            bg={bgColor}
            p={5}
            boxShadow="sm"
          >
            <Heading size="md" mb={4}>Seguimiento del Pedido</Heading>
            
            <VStack spacing={4} align="stretch">
              {order.trackingUpdates.map((update, index) => (
                <HStack key={index} spacing={4}>
                  <Box
                    w="2px"
                    h="full"
                    bg="blue.500"
                    position="relative"
                    _before={{
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: '-4px',
                      width: '10px',
                      height: '10px',
                      borderRadius: 'full',
                      bg: 'blue.500',
                    }}
                  />
                  <Box flex="1">
                    <Text fontWeight="bold">{translateStatus(update.status)}</Text>
                    <Text fontSize="sm" color="gray.600">{formatDate(update.timestamp)}</Text>
                    {update.notes && <Text mt={1}>{update.notes}</Text>}
                  </Box>
                </HStack>
              ))}
            </VStack>
          </Box>
        )}
      </Flex>
    </Container>
  );
};

export default OrderDetails;