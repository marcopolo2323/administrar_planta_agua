import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  Flex,
  Stack,
  Badge,
  Spinner,
  useColorModeValue,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Image,
  VStack,
  HStack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputLeftElement,
  useToast,
  Checkbox,
  Divider,
} from '@chakra-ui/react';

// Import local images - these should be in your assets folder
import qrYapeImage from '../assets/images/qr-yape.svg';
import creditCardsImage from '../assets/images/credit-cards.svg';
import cashPaymentImage from '../assets/images/cash-payment.svg';

import { ArrowBackIcon, CheckCircleIcon } from '@chakra-ui/icons';
import { FaMoneyBillWave, FaCreditCard, FaQrcode, FaBuilding, FaIdCard, FaMapMarkerAlt, FaClock } from 'react-icons/fa';

const PaymentMethod = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  // State management
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState('yape');
  const [isProcessing, setIsProcessing] = useState(false);
  const [documentType, setDocumentType] = useState('boleta');
  const [invoiceData, setInvoiceData] = useState({
    ruc: '',
    businessName: '',
    address: ''
  });

  const bgColor = useColorModeValue('white', 'gray.800');

  // Fetch order data
  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        toast({
          title: 'Error',
          description: 'ID de pedido no válido',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        navigate('/');
        return;
      }

      setIsLoading(true);
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const response = await axios.get(`${apiUrl}/api/guest-orders/track/${orderId}`);
        
        if (response.data) {
          setOrder(response.data);
        } else {
          throw new Error('No se encontraron datos del pedido');
        }
      } catch (error) {
        console.error('Error al cargar el pedido:', error);
        toast({
          title: 'Error',
          description: error.response?.data?.message || 'Error al cargar los datos del pedido',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, navigate, toast]);

  // Event handlers
  const handleGoBack = () => {
    navigate(`/track-order/${orderId}`);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInvoiceData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateInvoiceData = () => {
    if (documentType === 'factura') {
      if (!invoiceData.ruc.trim()) {
        toast({
          title: 'Error',
          description: 'El RUC es obligatorio para factura',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return false;
      }
      if (!invoiceData.businessName.trim()) {
        toast({
          title: 'Error',
          description: 'La razón social es obligatoria para factura',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return false;
      }
      if (!invoiceData.address.trim()) {
        toast({
          title: 'Error',
          description: 'La dirección fiscal es obligatoria para factura',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return false;
      }
    }
    return true;
  };

  const handleProceedToPayment = () => {
    if (!validateInvoiceData()) {
      return;
    }

    setIsProcessing(true);
    
    try {
      // Build query parameters
      const params = new URLSearchParams({
        method: selectedMethod,
        docType: documentType,
        isCredit: 'false' // Siempre falso para clientes visitantes
      });

      if (documentType === 'factura') {
        params.append('ruc', invoiceData.ruc);
        params.append('businessName', invoiceData.businessName);
        params.append('address', invoiceData.address);
      }

      navigate(`/payment-process/${orderId}?${params.toString()}`);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error al proceder con el pago',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <Container maxW="container.md" py={8} centerContent>
        <Flex direction="column" align="center" justify="center" h="60vh" bg="white" p={8} borderRadius="xl" boxShadow="lg" width="100%">
          <Box 
            bg="purple.50" 
            p={4} 
            borderRadius="full" 
            mb={6}
          >
            <Spinner size="xl" thickness="4px" speed="0.65s" color="purple.500" />
          </Box>
          <Heading size="md" mb={2} color="purple.600" textAlign="center">Cargando información</Heading>
          <Text color="gray.600">Estamos preparando los detalles de tu pedido...</Text>
        </Flex>
      </Container>
    );
  }

  // Error state
  if (!order) {
    return (
      <Container maxW="container.md" py={8}>
        <Box bg="white" p={6} borderRadius="xl" boxShadow="lg">
          <Alert 
            status="error" 
            borderRadius="lg" 
            variant="solid" 
            flexDirection="column" 
            alignItems="center" 
            justifyContent="center" 
            textAlign="center" 
            py={4}
          >
            <AlertIcon boxSize="40px" mr={0} mb={4} />
            <AlertTitle fontSize="lg" mb={2}>Pedido no encontrado</AlertTitle>
            <AlertDescription maxWidth="sm">
              No se pudo encontrar información para este pedido. Por favor, verifica el número de pedido e intenta nuevamente.
            </AlertDescription>
          </Alert>
          <Flex justify="center" mt={6}>
            <Button 
              size="lg"
              leftIcon={<ArrowBackIcon />} 
              onClick={() => navigate('/')} 
              colorScheme="purple" 
              variant="outline"
              _hover={{ bg: 'purple.50' }}
            >
              Volver al inicio
            </Button>
          </Flex>
        </Box>
      </Container>
    );
  }

  // Safe total calculation
  const orderTotal = typeof order.total === 'number' ? order.total.toFixed(2) : parseFloat(order.total || 0).toFixed(2);

  return (
    <Container maxW="container.lg" py={8}>
      <Flex direction="column" w="full">
        <Button
          leftIcon={<ArrowBackIcon />}
          variant="outline"
          alignSelf="flex-start"
          mb={6}
          onClick={handleGoBack}
          colorScheme="purple"
          size="md"
          borderRadius="md"
          _hover={{ bg: 'purple.50' }}
        >
          Volver al seguimiento
        </Button>

        <Box
          borderWidth="1px"
          borderRadius="xl"
          overflow="hidden"
          bg={bgColor}
          p={0}
          mb={6}
          boxShadow="xl"
        >
          {/* Header */}
          <Box 
            bg="purple.600" 
            py={4} 
            px={6}
          >
            <Heading size="lg" color="white" textAlign="center">
              <Flex align="center" justify="center">
                <FaCreditCard size="24px" style={{ marginRight: '12px' }} />
                Seleccionar Método de Pago
              </Flex>
            </Heading>
          </Box>
          
          <Box p={6}>
            {/* Order Summary */}
            <Box 
              mb={8} 
              bg="purple.50" 
              p={4} 
              borderRadius="lg"
              borderLeft="4px solid"
              borderColor="purple.500"
            >
              <Heading size="md" mb={3} color="purple.700">
                <Flex align="center">
                  <Box mr={2}>
                    <FaIdCard />
                  </Box>
                  Resumen del Pedido #{order.id}
                </Flex>
              </Heading>
              <Stack spacing={3}>
                <HStack spacing={4} wrap="wrap">
                  <Badge colorScheme="purple" fontSize="sm" py={1} px={3} borderRadius="full">
                    Estado: {order.status || 'Pendiente'}
                  </Badge>
                  <Badge colorScheme={order.paymentStatus === 'pendiente' ? 'yellow' : 'green'} fontSize="sm" py={1} px={3} borderRadius="full">
                    Pago: {order.paymentStatus || 'Pendiente'}
                  </Badge>
                </HStack>
                <Flex 
                  justify="space-between" 
                  align="center" 
                  bg="white" 
                  p={3} 
                  borderRadius="md"
                  boxShadow="sm"
                >
                  <Text fontWeight="medium" color="gray.600">Total a pagar:</Text>
                  <Text fontWeight="bold" fontSize="xl" color="purple.600">
                    S/ {orderTotal}
                  </Text>
                </Flex>
              </Stack>
            </Box>

            {/* Document Type Selection */}
            <Box mb={6}>
              <Heading size="md" mb={4} color="purple.700">
                <Flex align="center">
                  <Box mr={2}>
                    <FaBuilding />
                  </Box>
                  Tipo de Documento
                </Flex>
              </Heading>
              <Tabs 
                variant="soft-rounded" 
                colorScheme="purple" 
                onChange={(index) => {
                  setDocumentType(index === 0 ? 'boleta' : 'factura');
                }} 
                mb={4}
                bg="white"
                p={4}
                borderRadius="lg"
                boxShadow="sm"
              >
                <TabList mb={4}>
                  <Tab _selected={{ color: 'white', bg: 'purple.500' }} flex="1">
                    <Flex align="center">
                      <Box mr={2}>
                        <FaIdCard />
                      </Box>
                      Boleta
                    </Flex>
                  </Tab>
                  <Tab _selected={{ color: 'white', bg: 'purple.500' }} flex="1">
                    <Flex align="center">
                      <Box mr={2}>
                        <FaBuilding />
                      </Box>
                      Factura
                    </Flex>
                  </Tab>
                </TabList>
                <TabPanels>
                  <TabPanel px={0} pt={0}>
                    <Alert status="info" borderRadius="md" variant="left-accent" borderLeftColor="blue.400">
                      <AlertIcon color="blue.400" />
                      <Box>
                        <AlertTitle fontWeight="bold">Boleta Electrónica</AlertTitle>
                        <AlertDescription>
                          Se emitirá una boleta electrónica para esta compra.
                        </AlertDescription>
                      </Box>
                    </Alert>
                  </TabPanel>
                  <TabPanel px={0} pt={0}>
                    <Alert status="info" borderRadius="md" mb={4} variant="left-accent" borderLeftColor="blue.400">
                      <AlertIcon color="blue.400" />
                      <Box>
                        <AlertTitle fontWeight="bold">Factura Electrónica</AlertTitle>
                        <AlertDescription>
                          Complete los datos para emitir una factura electrónica.
                        </AlertDescription>
                      </Box>
                    </Alert>
                    
                    <Stack spacing={4} mt={4} bg="gray.50" p={4} borderRadius="md">
                      <FormControl isRequired>
                        <FormLabel fontWeight="medium" color="gray.700">RUC</FormLabel>
                        <InputGroup>
                          <InputLeftElement pointerEvents="none">
                            <FaIdCard color="gray.400" />
                          </InputLeftElement>
                          <Input 
                            name="ruc" 
                            value={invoiceData.ruc} 
                            onChange={handleInputChange}
                            placeholder="Ingrese el RUC"
                            bg="white"
                            borderColor="gray.300"
                            _hover={{ borderColor: "purple.300" }}
                            _focus={{ borderColor: "purple.500", boxShadow: "0 0 0 1px purple.500" }}
                          />
                        </InputGroup>
                      </FormControl>
                      
                      <FormControl isRequired>
                        <FormLabel fontWeight="medium" color="gray.700">Razón Social</FormLabel>
                        <InputGroup>
                          <InputLeftElement pointerEvents="none">
                            <FaBuilding color="gray.400" />
                          </InputLeftElement>
                          <Input 
                            name="businessName" 
                            value={invoiceData.businessName} 
                            onChange={handleInputChange}
                            placeholder="Ingrese la razón social"
                            bg="white"
                            borderColor="gray.300"
                            _hover={{ borderColor: "purple.300" }}
                            _focus={{ borderColor: "purple.500", boxShadow: "0 0 0 1px purple.500" }}
                          />
                        </InputGroup>
                      </FormControl>
                      
                      <FormControl isRequired>
                        <FormLabel fontWeight="medium" color="gray.700">Dirección Fiscal</FormLabel>
                        <InputGroup>
                          <InputLeftElement pointerEvents="none">
                            <FaMapMarkerAlt color="gray.400" />
                          </InputLeftElement>
                          <Input 
                            name="address" 
                            value={invoiceData.address} 
                            onChange={handleInputChange}
                            placeholder="Ingrese la dirección fiscal"
                            bg="white"
                            borderColor="gray.300"
                            _hover={{ borderColor: "purple.300" }}
                            _focus={{ borderColor: "purple.500", boxShadow: "0 0 0 1px purple.500" }}
                          />
                        </InputGroup>
                      </FormControl>
                    </Stack>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </Box>

            {/* Payment Method Heading */}
            <Box mb={6}>
              <Heading size="md" mb={4} color="purple.700">
                <Flex align="center">
                  <Box mr={2}>
                    <FaMoneyBillWave />
                  </Box>
                  Método de Pago
                </Flex>
              </Heading>
            </Box>
            
            {/* Payment Method Selection */}
            <Box mb={6}>
              <Tabs 
                variant="soft-rounded" 
                colorScheme="purple" 
                onChange={(index) => {
                  setSelectedMethod(index === 0 ? 'yape' : index === 1 ? 'tarjeta' : 'efectivo');
                }}
                bg="white"
                p={4}
                borderRadius="lg"
                boxShadow="sm"
              >
                <TabList mb={4}>
                  <Tab _selected={{ color: 'white', bg: 'purple.500' }} flex="1">
                    <Flex align="center">
                      <Box mr={2}>
                        <FaQrcode />
                      </Box>
                      Yape
                    </Flex>
                  </Tab>
                  <Tab _selected={{ color: 'white', bg: 'purple.500' }} flex="1">
                    <Flex align="center">
                      <Box mr={2}>
                        <FaCreditCard />
                      </Box>
                      Tarjeta
                    </Flex>
                  </Tab>
                  <Tab _selected={{ color: 'white', bg: 'purple.500' }} flex="1">
                    <Flex align="center">
                      <Box mr={2}>
                        <FaMoneyBillWave />
                      </Box>
                      Efectivo
                    </Flex>
                  </Tab>
                </TabList>
                  
                  <TabPanels>
                    {/* Yape Panel */}
                    <TabPanel px={0} pt={0}>
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
                            <AlertTitle fontWeight="bold">Pago con Yape</AlertTitle>
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
                          <Flex align="center" justify="center" mt={4}>
                            <FaQrcode style={{ marginRight: '8px' }} color="purple.700" />
                            <Text fontWeight="medium" color="purple.700">
                              Escanea este código con tu app de Yape
                            </Text>
                          </Flex>
                        </Box>
                      </VStack>
                    </TabPanel>
                    
                    {/* Card Panel */}
                    <TabPanel px={0} pt={0}>
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
                            <AlertTitle fontWeight="bold">Pago con Tarjeta</AlertTitle>
                            <AlertDescription>
                              Paga de forma segura con tu tarjeta de crédito o débito. Procesamos pagos a través de una pasarela segura.
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
                          <Image 
                            src={creditCardsImage} 
                            alt="Tarjetas aceptadas" 
                            maxH="80px" 
                            mx="auto"
                            p={3}
                            fallback={
                              <Flex 
                                align="center" 
                                justify="center" 
                                h="80px" 
                                bg="blue.100" 
                                borderRadius="md"
                              >
                                <FaCreditCard size="40px" color="blue" />
                              </Flex>
                            }
                          />
                          <Flex align="center" justify="center" mt={4}>
                            <FaCreditCard style={{ marginRight: '8px' }} color="blue.700" />
                            <Text fontWeight="medium" color="blue.700">
                              Aceptamos las principales tarjetas de crédito y débito
                            </Text>
                          </Flex>
                        </Box>
                      </VStack>
                    </TabPanel>
                    
                    {/* Cash Panel */}
                    <TabPanel px={0} pt={0}>
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
                            <AlertTitle fontWeight="bold">Pago en Efectivo</AlertTitle>
                            <AlertDescription>
                              Paga en efectivo al momento de la entrega. Nuestro repartidor llevará cambio.
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
                          <Image 
                            src={cashPaymentImage} 
                            alt="Pago en efectivo" 
                            maxH="120px" 
                            mx="auto"
                            p={3}
                            fallback={
                              <Flex 
                                align="center" 
                                justify="center" 
                                h="120px" 
                                bg="green.100" 
                                borderRadius="md"
                              >
                                <FaMoneyBillWave size="50px" color="green" />
                              </Flex>
                            }
                          />
                          <Flex align="center" justify="center" mt={4}>
                            <FaMoneyBillWave style={{ marginRight: '8px' }} color="green.700" />
                            <Text fontWeight="medium" color="green.700">
                              Ten el monto exacto para facilitar el cambio
                            </Text>
                          </Flex>
                        </Box>
                      </VStack>
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </Box>
          </Box>
        </Box>

        {/* Continue Button */}
        <Flex justify="center" mt={4}>
          <Button
            colorScheme="purple"
            size="lg"
            rightIcon={<CheckCircleIcon />}
            onClick={handleProceedToPayment}
            isLoading={isProcessing}
            loadingText="Procesando..."
            w="full"
            maxW="md"
            borderRadius="lg"
            py={6}
            fontWeight="bold"
            letterSpacing="wide"
            boxShadow="md"
            _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
            transition="all 0.2s"
          >
            Continuar con el pago
          </Button>
        </Flex>
      </Flex>
    </Container>
  );
};

export default PaymentMethod;