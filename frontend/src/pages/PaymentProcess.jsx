import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  Box, 
  Container, 
  Heading, 
  Text, 
  Button, 
  Flex, 
  VStack, 
  Image,
  Alert, 
  AlertIcon, 
  AlertTitle, 
  AlertDescription, 
  Spinner,
  useColorModeValue, 
  Divider, 
  Badge, 
  useToast, 
  HStack
} from '@chakra-ui/react';
import { CheckIcon, ArrowBackIcon, ArrowForwardIcon } from '@chakra-ui/icons';
import { FaMoneyBillWave, FaCreditCard, FaQrcode, FaIdCard, FaReceipt } from 'react-icons/fa';
import qrYapeImage from '../assets/images/qr-yape.svg';

const PaymentProcess = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  
  // Get URL parameters
  const queryParams = new URLSearchParams(location.search);
  const method = queryParams.get('method') || 'yape';
  const docType = queryParams.get('docType') || 'boleta';
  const ruc = queryParams.get('ruc') || '';
  const businessName = decodeURIComponent(queryParams.get('businessName') || '');
  const address = decodeURIComponent(queryParams.get('address') || '');
  
  // State management
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [error, setError] = useState(null);
  
  const bgColor = useColorModeValue('white', 'gray.700');
  
  // Fetch order details
  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!id) {
        setError('ID de pedido no válido');
        setLoading(false);
        return;
      }

      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const response = await axios.get(`${apiUrl}/api/guest-orders/track/${id}`);
        
        if (response.data) {
          setOrder(response.data);
        } else {
          throw new Error('No se encontraron datos del pedido');
        }
      } catch (err) {
        console.error('Error fetching order:', err);
        setError(err.response?.data?.message || 'No se pudo cargar la información del pedido.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrderDetails();
  }, [id]);
  
  // Process payment
  const processPayment = async () => {
    if (!order) {
      toast({
        title: 'Error',
        description: 'No se encontró información del pedido',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setPaymentStatus('processing');
    setError(null);
    
    try {
      const orderTotal = typeof order.total === 'number' 
        ? order.total 
        : parseFloat(order.total || 0);

      const paymentData = {
        orderId: id,
        amount: orderTotal,
        paymentMethod: method,
        documentType: docType,
        invoiceData: docType === 'factura' ? {
          ruc,
          businessName,
          address
        } : null,
        isCredit: false // Siempre false para clientes visitantes
      };
      
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.post(`${apiUrl}/api/guest-payments`, paymentData);
      
      // Check if response indicates success
      if (response.status === 200 || response.status === 201) {
        setPaymentStatus('success');
        toast({
          title: 'Pago procesado exitosamente',
          description: 'El pago se ha procesado correctamente.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        
        // Guardar el ID del pedido en localStorage para asegurar que esté disponible en la página de recibo
        localStorage.setItem('lastOrderId', id);
        
        setTimeout(() => {
          navigate(`/receipt/${id}`);
        }, 2000);
      } else {
        throw new Error('Respuesta inesperada del servidor');
      }
    } catch (err) {
      console.error('Payment processing error:', err);
      setPaymentStatus('error');
      const errorMessage = err.response?.data?.message 
        || err.message 
        || 'Error al procesar el pago. Por favor, intenta nuevamente.';
      setError(errorMessage);
      
      toast({
        title: 'Error en el pago',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  const handleGoBack = () => {
    navigate(`/payment-method/${id}`);
  };
  
  const retryPayment = () => {
    setPaymentStatus('pending');
    setError(null);
  };

  // Helper functions
  const getPaymentMethodInfo = () => {
    switch (method) {
      case 'yape':
        return { name: 'Yape', icon: FaQrcode, color: 'purple' };
      case 'tarjeta':
        return { name: 'Tarjeta', icon: FaCreditCard, color: 'blue' };
      case 'efectivo':
        return { name: 'Efectivo', icon: FaMoneyBillWave, color: 'green' };
      default:
        return { name: 'Yape', icon: FaQrcode, color: 'purple' };
    }
  };

  const paymentMethodInfo = getPaymentMethodInfo();
  const PaymentMethodIcon = paymentMethodInfo.icon;
  
  // Loading state
  if (loading) {
    return (
      <Container maxW="container.md" py={8}>
        <Box 
          bg={bgColor} 
          borderWidth="1px" 
          borderRadius="lg" 
          p={6} 
          shadow="md"
          textAlign="center"
        >
          <Flex direction="column" align="center" justify="center" py={10}>
            <Spinner 
              size="xl" 
              mb={4} 
              thickness="4px"
              speed="0.65s"
              emptyColor="gray.200"
              color="purple.500"
            />
            <Text fontSize="lg" fontWeight="medium" color="purple.700">
              Cargando información del pedido...
            </Text>
          </Flex>
        </Box>
      </Container>
    );
  }
  
  // Error state - no order found
  if (error && !order) {
    return (
      <Container maxW="container.md" py={8}>
        <Box 
          bg={bgColor} 
          borderWidth="1px" 
          borderRadius="lg" 
          p={6} 
          shadow="md"
        >
          <Alert 
            status="error" 
            variant="left-accent" 
            borderRadius="md" 
            mb={4}
          >
            <AlertIcon />
            <Box>
              <AlertTitle fontWeight="bold">Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Box>
          </Alert>
          <Button 
            leftIcon={<ArrowBackIcon />} 
            colorScheme="purple" 
            variant="outline" 
            onClick={() => navigate('/')}
          >
            Volver al inicio
          </Button>
        </Box>
      </Container>
    );
  }

  // Safe total calculation
  const orderTotal = order ? (typeof order.total === 'number' ? order.total.toFixed(2) : parseFloat(order.total || 0).toFixed(2)) : '0.00';
  
  return (
    <Container maxW="container.md" py={8}>
      <Box 
        bg={bgColor} 
        borderWidth="1px" 
        borderRadius="lg" 
        p={0} 
        shadow="lg"
        overflow="hidden"
      >
        {/* Header */}
        <Box 
          bg="purple.600" 
          p={4} 
          color="white"
          bgGradient="linear(to-r, purple.600, purple.400)"
        >
          <Flex align="center">
            <Box mr={3}>
              <FaCreditCard size="24px" />
            </Box>
            <Heading size="lg">Procesando Pago</Heading>
          </Flex>
        </Box>
        
        <Box p={6}>
          {/* Order Summary */}
          <Box 
            mb={6} 
            bg="purple.50" 
            p={4} 
            borderRadius="md" 
            borderWidth="1px" 
            borderColor="purple.100"
          >
            <Heading size="md" mb={4} color="purple.700">
              <Flex align="center">
                <Box mr={2}>
                  <FaReceipt />
                </Box>
                Resumen del Pedido
              </Flex>
            </Heading>
            
            <VStack spacing={3} align="stretch">
              <Flex justify="space-between" p={2} bg="white" borderRadius="md" boxShadow="sm">
                <HStack>
                  <FaIdCard color="#805AD5" />
                  <Text fontWeight="medium">Número de Pedido:</Text>
                </HStack>
                <Text fontWeight="bold">{order?.id || 'N/A'}</Text>
              </Flex>
              
              <Flex justify="space-between" p={2} bg="white" borderRadius="md" boxShadow="sm">
                <HStack>
                  <FaMoneyBillWave color="#805AD5" />
                  <Text fontWeight="medium">Total a Pagar:</Text>
                </HStack>
                <Text fontWeight="bold" fontSize="lg" color="purple.700">
                  S/ {orderTotal}
                </Text>
              </Flex>
              
              <Flex justify="space-between" p={2} bg="white" borderRadius="md" boxShadow="sm">
                <HStack>
                  <Box color="#805AD5">
                    <PaymentMethodIcon />
                  </Box>
                  <Text fontWeight="medium">Método de Pago:</Text>
                </HStack>
                <Badge 
                  colorScheme={paymentMethodInfo.color}
                  borderRadius="full"
                  px={3}
                  py={1}
                >
                  {paymentMethodInfo.name}
                </Badge>
              </Flex>
              
              <Flex justify="space-between" p={2} bg="white" borderRadius="md" boxShadow="sm">
                <HStack>
                  <FaReceipt color="#805AD5" />
                  <Text fontWeight="medium">Tipo de Documento:</Text>
                </HStack>
                <Badge 
                  colorScheme={docType === 'boleta' ? 'teal' : 'orange'}
                  borderRadius="full"
                  px={3}
                  py={1}
                >
                  {docType === 'boleta' ? 'Boleta Electrónica' : 'Factura Electrónica'}
                </Badge>
              </Flex>
            </VStack>
            
            {/* Invoice data display */}
            {docType === 'factura' && (ruc || businessName || address) && (
              <Box 
                mt={4} 
                p={4} 
                borderWidth="1px" 
                borderRadius="md" 
                borderColor="orange.200"
                bg="orange.50"
              >
                <Text fontWeight="bold" mb={2} color="orange.700">Datos de Facturación:</Text>
                <VStack align="stretch" spacing={1}>
                  {ruc && <Text><strong>RUC:</strong> {ruc}</Text>}
                  {businessName && <Text><strong>Razón Social:</strong> {businessName}</Text>}
                  {address && <Text><strong>Dirección:</strong> {address}</Text>}
                </VStack>
              </Box>
            )}
          </Box>
        
          <Divider my={4} />
        
          {/* Payment Method Specific Content */}
          {method === 'yape' && (
            <Box mb={6}>
              <Heading size="md" mb={4} color="purple.700">
                <Flex align="center">
                  <Box mr={2}>
                    <FaQrcode />
                  </Box>
                  Pago con Yape
                </Flex>
              </Heading>
              
              <VStack spacing={4} align="stretch">
                <Alert 
                  status="info" 
                  borderRadius="md" 
                  variant="left-accent" 
                  borderLeftColor="purple.400"
                  bg="purple.50"
                >
                  <AlertIcon color="purple.400" />
                  <Box>
                    <AlertTitle fontWeight="bold">Instrucciones</AlertTitle>
                    <AlertDescription>
                      Escanea el código QR para realizar el pago y envía el comprobante al WhatsApp indicado.
                    </AlertDescription>
                  </Box>
                </Alert>
                
                <Box 
                  textAlign="center" 
                  py={6} 
                  px={4} 
                  bg="white" 
                  borderRadius="lg" 
                  borderWidth="1px" 
                  borderColor="purple.100"
                  boxShadow="sm"
                >
                  <Image 
                    src={qrYapeImage} 
                    alt="QR Yape" 
                    maxH="220px" 
                    mx="auto"
                    borderRadius="md"
                    p={2}
                    bg="white"
                    boxShadow="sm"
                    fallback={
                      <Flex 
                        align="center" 
                        justify="center" 
                        h="220px" 
                        bg="purple.100" 
                        borderRadius="md"
                      >
                        <FaQrcode size="60px" color="purple" />
                      </Flex>
                    }
                  />
                  <Text mt={4} fontWeight="medium" color="purple.700">
                    <Flex align="center" justify="center">
                      <FaQrcode style={{ marginRight: '8px' }} />
                      Escanea este código con tu app de Yape
                    </Flex>
                  </Text>
                </Box>
              </VStack>
            </Box>
          )}
        
          {method === 'tarjeta' && (
            <Box mb={6}>
              <Heading size="md" mb={4} color="blue.700">
                <Flex align="center">
                  <Box mr={2}>
                    <FaCreditCard />
                  </Box>
                  Pago con Tarjeta
                </Flex>
              </Heading>
              
              <VStack spacing={4} align="stretch">
                <Alert 
                  status="info" 
                  borderRadius="md" 
                  variant="left-accent" 
                  borderLeftColor="blue.400"
                  bg="blue.50"
                >
                  <AlertIcon color="blue.400" />
                  <Box>
                    <AlertTitle fontWeight="bold">Instrucciones</AlertTitle>
                    <AlertDescription>
                      Completa los datos de tu tarjeta para procesar el pago. Procesamos pagos a través de una pasarela segura.
                    </AlertDescription>
                  </Box>
                </Alert>
                
                <Box 
                  textAlign="center" 
                  py={6} 
                  px={4} 
                  bg="white" 
                  borderRadius="lg" 
                  borderWidth="1px" 
                  borderColor="blue.100"
                  boxShadow="sm"
                >
                  <Flex align="center" justify="center" fontSize="5xl" color="blue.500" mb={4}>
                    <FaCreditCard />
                  </Flex>
                  <Text fontWeight="medium" color="blue.700">
                    Al confirmar, serás redirigido a nuestra pasarela de pago segura
                  </Text>
                </Box>
              </VStack>
            </Box>
          )}
        
          {method === 'efectivo' && (
            <Box mb={6}>
              <Heading size="md" mb={4} color="green.700">
                <Flex align="center">
                  <Box mr={2}>
                    <FaMoneyBillWave />
                  </Box>
                  Pago en Efectivo
                </Flex>
              </Heading>
              
              <VStack spacing={4} align="stretch">
                <Alert 
                  status="info" 
                  borderRadius="md" 
                  variant="left-accent" 
                  borderLeftColor="green.400"
                  bg="green.50"
                >
                  <AlertIcon color="green.400" />
                  <Box>
                    <AlertTitle fontWeight="bold">Instrucciones</AlertTitle>
                    <AlertDescription>
                      Pagarás en efectivo al momento de la entrega. Nuestro repartidor llevará cambio.
                    </AlertDescription>
                  </Box>
                </Alert>
                
                <Box 
                  textAlign="center" 
                  py={6} 
                  px={4} 
                  bg="white" 
                  borderRadius="lg" 
                  borderWidth="1px" 
                  borderColor="green.100"
                  boxShadow="sm"
                >
                  <Flex align="center" justify="center" fontSize="5xl" color="green.500" mb={4}>
                    <FaMoneyBillWave />
                  </Flex>
                  <Text fontWeight="medium" color="green.700">
                    Ten el monto exacto para facilitar el cambio
                  </Text>
                </Box>
              </VStack>
            </Box>
          )}
        
          <Divider my={6} borderColor="purple.100" />
        
          {/* Payment Status and Actions */}
          <Box textAlign="center" py={6}>
            {paymentStatus === 'pending' && (
              <VStack spacing={4}>
                <Button 
                  colorScheme="purple"
                  size="lg" 
                  rightIcon={<ArrowForwardIcon />} 
                  onClick={processPayment}
                  width="100%"
                  maxW="400px"
                  py={6}
                  borderRadius="lg"
                  fontWeight="bold"
                  letterSpacing="wide"
                  boxShadow="md"
                  _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
                  transition="all 0.2s"
                >
                  Confirmar Pago
                </Button>
                
                <Button 
                  leftIcon={<ArrowBackIcon />} 
                  variant="outline" 
                  colorScheme="purple"
                  onClick={handleGoBack}
                  size="md"
                  width="100%"
                  maxW="400px"
                >
                  Volver a métodos de pago
                </Button>
              </VStack>
            )}
          
            {paymentStatus === 'processing' && (
              <Box 
                p={8} 
                borderRadius="lg" 
                borderWidth="1px" 
                borderColor="purple.100"
                bg="white"
                boxShadow="md"
                maxW="400px"
                mx="auto"
              >
                <VStack>
                  <Spinner 
                    size="xl" 
                    mb={4} 
                    thickness="4px"
                    speed="0.65s"
                    emptyColor="gray.200"
                    color="purple.500"
                  />
                  <Text fontSize="lg" fontWeight="medium" color="purple.700">Procesando tu pago...</Text>
                  <Text fontSize="sm" color="gray.500" mt={2}>Esto puede tomar unos segundos</Text>
                </VStack>
              </Box>
            )}
          
            {paymentStatus === 'success' && (
              <Box 
                p={8} 
                borderRadius="lg" 
                borderWidth="1px" 
                borderColor="green.100"
                bg="green.50"
                boxShadow="md"
                maxW="400px"
                mx="auto"
              >
                <VStack>
                  <Flex 
                    align="center" 
                    justify="center" 
                    bg="green.500" 
                    color="white" 
                    borderRadius="full" 
                    w={16} 
                    h={16} 
                    mb={4}
                  >
                    <CheckIcon w={8} h={8} />
                  </Flex>
                  <Text fontSize="2xl" fontWeight="bold" color="green.700">¡Pago Exitoso!</Text>
                  <Text color="green.600">Redirigiendo a tu recibo...</Text>
                </VStack>
              </Box>
            )}
          
            {paymentStatus === 'error' && (
              <Box 
                p={6} 
                borderRadius="lg" 
                borderWidth="1px" 
                borderColor="red.100"
                bg="red.50"
                boxShadow="md"
                maxW="400px"
                mx="auto"
              >
                <VStack spacing={4}>
                  <Alert 
                    status="error" 
                    borderRadius="md"
                    variant="left-accent"
                    borderLeftColor="red.500"
                  >
                    <AlertIcon />
                    <Box>
                      <AlertTitle fontWeight="bold">Error en el pago</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Box>
                  </Alert>
                  <HStack spacing={2} width="100%">
                    <Button 
                      colorScheme="red" 
                      onClick={retryPayment}
                      flex="1"
                    >
                      Intentar nuevamente
                    </Button>
                    <Button 
                      variant="outline"
                      colorScheme="red" 
                      onClick={handleGoBack}
                      flex="1"
                    >
                      Volver atrás
                    </Button>
                  </HStack>
                </VStack>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default PaymentProcess;