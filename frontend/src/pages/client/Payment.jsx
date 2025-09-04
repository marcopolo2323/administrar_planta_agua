import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
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
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  IconButton,
  FormControl,
  FormLabel,
  Input,
  Select,
  Image,
  VStack,
  HStack,
  Radio,
  RadioGroup,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@chakra-ui/react';
import { ArrowBackIcon, CheckCircleIcon, WarningIcon } from '@chakra-ui/icons';

const Payment = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [payment, setPayment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('paypal');
  const [isCredit, setIsCredit] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
  });

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const responsiveBoxShadow = useColorModeValue('0 2px 8px rgba(0,0,0,0.05)', '0 2px 8px rgba(0,0,0,0.2)');

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      navigate('/client/login');
      return;
    }
    
    const fetchOrderAndPayment = async () => {
      setIsLoading(true);
      try {
        const config = {
          headers: { Authorization: `Bearer ${token}` }
        };
        
        // Obtener detalles del pedido
        const orderResponse = await axios.get(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/orders/${orderId}`,
          config
        );
        
        setOrder(orderResponse.data);
        
        // Si ya hay un ID de pago en el state, usarlo
        let paymentId = location.state?.paymentId;
        
        // Si no hay ID de pago en el state, buscar pagos pendientes para este pedido
        if (!paymentId) {
          const paymentsResponse = await axios.get(
            `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/payments/order/${orderId}`,
            config
          );
          
          const pendingPayment = paymentsResponse.data.find(p => p.status === 'pendiente');
          if (pendingPayment) {
            paymentId = pendingPayment.id;
          } else if (paymentsResponse.data.length > 0) {
            // Si no hay pagos pendientes pero hay otros pagos, redirigir a detalles del pedido
            toast.info('Este pedido ya tiene un pago procesado');
            navigate(`/client/orders/${orderId}`);
            return;
          }
        }
        
        // Si hay un ID de pago, obtener sus detalles
        if (paymentId) {
          const paymentResponse = await axios.get(
            `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/payments/${paymentId}`,
            config
          );
          
          setPayment(paymentResponse.data);
        } else {
          // Si no hay pagos, crear uno nuevo
          const newPaymentResponse = await axios.post(
            `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/payments`,
            {
              orderId: orderResponse.data.id,
              amount: orderResponse.data.total,
              paymentMethod: 'online'
            },
            config
          );
          
          setPayment(newPaymentResponse.data);
        }
      } catch (error) {
        console.error('Error al cargar datos de pago:', error);
        toast.error('Error al cargar los datos de pago.');
        
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
    
    fetchOrderAndPayment();
  }, [orderId, navigate, location.state]);

  const handleCardDetailsChange = (e) => {
    const { name, value } = e.target;
    setCardDetails({
      ...cardDetails,
      [name]: value,
    });
  };

  const handlePaymentMethodChange = (value) => {
    setPaymentMethod(value);
    // Si se selecciona crédito, desactivar otros métodos de pago
    if (isCredit) {
      setIsCredit(false);
    }
  };

  const handleCreditChange = (e) => {
    const checked = e.target.checked;
    setIsCredit(checked);
    // Si se activa el crédito, el método de pago se establece como 'credito'
    if (checked) {
      setPaymentMethod('credito');
    } else {
      setPaymentMethod('paypal');
    }
  };

  const validateCardDetails = () => {
    if (paymentMethod !== 'card') return true;
    
    if (!cardDetails.cardNumber || cardDetails.cardNumber.length < 16) {
      toast.error('Número de tarjeta inválido');
      return false;
    }
    
    if (!cardDetails.cardName) {
      toast.error('Nombre del titular requerido');
      return false;
    }
    
    if (!cardDetails.expiryDate || !cardDetails.expiryDate.match(/^\d{2}\/\d{2}$/)) {
      toast.error('Fecha de expiración inválida (MM/YY)');
      return false;
    }
    
    if (!cardDetails.cvv || cardDetails.cvv.length < 3) {
      toast.error('CVV inválido');
      return false;
    }
    
    return true;
  };

  const handleProcessPayment = async () => {
    if (!validateCardDetails()) return;
    
    setIsProcessing(true);
    
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      // Si es pago a crédito, crear un crédito para el cliente
      if (isCredit) {
        await axios.post(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/credits`,
          {
            clientId: order.clientId,
            orderId: order.id,
            amount: order.total,
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días para pagar
            notes: `Crédito para pedido #${order.id}`
          },
          config
        );
      } else {
        // Procesamiento normal de pago
        await axios.put(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/payments/${payment.id}/confirm`,
          {
            paymentMethod,
            // En un entorno real, aquí enviaríamos los detalles de pago a la pasarela
            // pero para este ejemplo, solo simulamos que el pago fue exitoso
          },
          config
        );
      }
      
      toast.success('¡Pago procesado con éxito!');
      
      // Redirigir a la página de confirmación
      navigate(`/client/payment/success/${orderId}`);
    } catch (error) {
      console.error('Error al procesar el pago:', error);
      toast.error('Error al procesar el pago. Inténtalo de nuevo.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGoBack = () => {
    navigate(`/client/orders/${orderId}`);
  };

  if (isLoading) {
    return (
      <Flex justify="center" align="center" height="100vh">
        <Spinner size="xl" color="blue.500" />
      </Flex>
    );
  }

  if (!order || !payment) {
    return (
      <Container maxW={{ base: "100vw", md: "container.md" }} px={{ base: 2, md: 6 }} py={{ base: 4, md: 8 }}>
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          <AlertTitle mr={2}>Error al cargar</AlertTitle>
          <AlertDescription>No se pudieron cargar los datos del pago.</AlertDescription>
        </Alert>
        <Button leftIcon={<ArrowBackIcon />} mt={4} onClick={() => navigate('/client/dashboard')}>
          Volver al Dashboard
        </Button>
      </Container>
    );
  }

  return (
    <Container maxW={{ base: "100vw", md: "container.md" }} px={{ base: 2, md: 6 }} py={{ base: 4, md: 8 }}>
      <Flex direction="column" gap={6}>
        <Flex align="center" gap={4}>
          <IconButton
            icon={<ArrowBackIcon />}
            aria-label="Volver"
            onClick={handleGoBack}
            variant="outline"
            size={{ base: "sm", md: "md" }}
          />
          <Heading size={{ base: "md", md: "lg" }}>Pago del Pedido #{order.id}</Heading>
        </Flex>

        <Box
          borderWidth="1px"
          borderRadius="lg"
          borderColor={borderColor}
          bg={bgColor}
          p={{ base: 3, md: 5 }}
          boxShadow={responsiveBoxShadow}
        >
          <Heading size="md" mb={4}>Resumen del Pedido</Heading>
          <Stack spacing={3}>
            <Flex justify="space-between" wrap="wrap">
              <Text fontWeight="bold">Total a pagar:</Text>
              <Text fontWeight="bold" fontSize={{ base: "lg", md: "xl" }}>S/ {order.total.toFixed(2)}</Text>
            </Flex>
            {/* Opción de pago a crédito */}
            <Box
              p={3}
              borderWidth="1px"
              borderRadius="md"
              borderColor={isCredit ? "yellow.300" : "gray.200"}
              bg={isCredit ? "yellow.50" : "gray.50"}
              mt={2}
            >
              <Flex align="center">
                <input
                  type="checkbox"
                  id="creditOption"
                  checked={isCredit}
                  onChange={handleCreditChange}
                  style={{ marginRight: "10px" }}
                />
                <FormLabel htmlFor="creditOption" mb={0} fontWeight="medium">
                  Pagar a crédito (30 días)
                </FormLabel>
              </Flex>
              {isCredit && (
                <Text fontSize="sm" color="gray.600" mt={2}>
                  Al seleccionar esta opción, el pedido se registrará como crédito y deberá ser pagado dentro de los próximos 30 días.
                </Text>
              )}
            </Box>
            <Flex justify="space-between" wrap="wrap">
              <Text>Productos:</Text>
              <Text>{order.items?.length || 0} items</Text>
            </Flex>
            <Flex justify="space-between" wrap="wrap">
              <Text>Dirección de entrega:</Text>
              <Text>{order.deliveryAddress}</Text>
            </Flex>
          </Stack>
        </Box>

        {!isCredit && (
          <Box
            borderWidth="1px"
            borderRadius="lg"
            borderColor={borderColor}
            bg={bgColor}
            p={{ base: 3, md: 5 }}
            boxShadow={responsiveBoxShadow}
          >
            <Heading size="md" mb={4}>Método de Pago</Heading>
            <Tabs variant="enclosed" colorScheme="blue" onChange={(index) => {
              setPaymentMethod(index === 0 ? 'paypal' : 'card');
            }}>
              <TabList mb={4}>
                <Tab fontSize={{ base: "sm", md: "md" }}>PayPal</Tab>
                <Tab fontSize={{ base: "sm", md: "md" }}>Tarjeta de Crédito/Débito</Tab>
              </TabList>
              <TabPanels>
                {/* Panel de PayPal */}
                <TabPanel>
                  <VStack spacing={4} align="stretch">
                    <Alert status="info" borderRadius="md">
                      <AlertIcon />
                      <Box>
                        <AlertTitle fontSize={{ base: "sm", md: "md" }}>Pago con PayPal</AlertTitle>
                        <AlertDescription fontSize={{ base: "sm", md: "md" }}>
                          Serás redirigido a PayPal para completar el pago de forma segura.
                        </AlertDescription>
                      </Box>
                    </Alert>
                    <Image 
                      src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_111x69.jpg" 
                      alt="PayPal" 
                      maxH="60px" 
                      alignSelf="center" 
                      my={4} 
                    />
                  </VStack>
                </TabPanel>
                {/* Panel de Tarjeta */}
                <TabPanel>
                  <VStack spacing={4} align="stretch">
                    <FormControl isRequired>
                      <FormLabel fontSize={{ base: "sm", md: "md" }}>Número de Tarjeta</FormLabel>
                      <Input 
                        name="cardNumber" 
                        value={cardDetails.cardNumber} 
                        onChange={handleCardDetailsChange} 
                        placeholder="1234 5678 9012 3456" 
                        maxLength={16}
                        fontSize={{ base: "sm", md: "md" }}
                      />
                    </FormControl>
                    <FormControl isRequired>
                      <FormLabel fontSize={{ base: "sm", md: "md" }}>Nombre del Titular</FormLabel>
                      <Input 
                        name="cardName" 
                        value={cardDetails.cardName} 
                        onChange={handleCardDetailsChange} 
                        placeholder="Como aparece en la tarjeta" 
                        fontSize={{ base: "sm", md: "md" }}
                      />
                    </FormControl>
                    <HStack spacing={4}>
                      <FormControl isRequired>
                        <FormLabel fontSize={{ base: "sm", md: "md" }}>Fecha de Expiración</FormLabel>
                        <Input 
                          name="expiryDate" 
                          value={cardDetails.expiryDate} 
                          onChange={handleCardDetailsChange} 
                          placeholder="MM/YY" 
                          maxLength={5}
                          fontSize={{ base: "sm", md: "md" }}
                        />
                      </FormControl>
                      <FormControl isRequired>
                        <FormLabel fontSize={{ base: "sm", md: "md" }}>CVV</FormLabel>
                        <Input 
                          name="cvv" 
                          value={cardDetails.cvv} 
                          onChange={handleCardDetailsChange} 
                          placeholder="123" 
                          maxLength={4}
                          type="password"
                          fontSize={{ base: "sm", md: "md" }}
                        />
                      </FormControl>
                    </HStack>
                    <Flex justify="center" mt={2}>
                      <Image 
                        src="https://www.merchantequip.com/image/?logos=v|m|a|d&height=32" 
                        alt="Tarjetas aceptadas" 
                        maxH="32px" 
                      />
                    </Flex>
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Box>
        )}

        <Flex justify="space-between" mt={4} wrap="wrap">
          <Button
            variant="outline"
            onClick={handleGoBack}
            size={{ base: "md", md: "lg" }}
          >
            Cancelar
          </Button>
          <Button
            colorScheme={isCredit ? "yellow" : "blue"}
            size={{ base: "md", md: "lg" }}
            rightIcon={<CheckCircleIcon />}
            onClick={handleProcessPayment}
            isLoading={isProcessing}
            loadingText="Procesando"
            w={{ base: "100%", md: "auto" }}
            mt={{ base: 2, md: 0 }}
          >
            {isCredit ? "Registrar a Crédito" : `Pagar S/ ${order.total.toFixed(2)}`}
          </Button>
        </Flex>
      </Flex>
    </Container>
  );
};

export default Payment;