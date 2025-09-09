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
  Radio,
  RadioGroup,
  Image,
  Alert,
  AlertIcon,
  Spinner,
  Center,
  SimpleGrid,
  useBreakpointValue,
  Divider,
  useToast
} from '@chakra-ui/react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaCreditCard, FaMoneyBillWave, FaQrcode } from 'react-icons/fa';

const PaymentMethod = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const toast = useToast();
  const isMobile = useBreakpointValue({ base: true, md: false });

  // Estados locales
  const [orderData, setOrderData] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState('cash');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Cargar datos del pedido desde localStorage
    const savedOrderData = localStorage.getItem('guestOrderData');
    if (savedOrderData) {
      setOrderData(JSON.parse(savedOrderData));
    } else {
      toast({
        title: 'Error',
        description: 'No se encontraron datos del pedido',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      navigate('/guest-order');
    }
  }, [navigate, toast]);

  const handleContinue = () => {
    if (!selectedMethod) {
      toast({
        title: 'Método requerido',
        description: 'Selecciona un método de pago',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Guardar método de pago seleccionado
    const updatedOrderData = {
      ...orderData,
      paymentMethod: selectedMethod
    };
    localStorage.setItem('guestOrderData', JSON.stringify(updatedOrderData));
    
    navigate('/payment-process');
  };

  const handleBack = () => {
    navigate('/guest-order');
  };

  if (!orderData) {
    return (
      <Center h="400px">
        <Spinner size="xl" />
      </Center>
    );
  }

  const paymentMethods = [
    {
      id: 'cash',
      name: 'Efectivo',
      description: 'Paga en efectivo cuando recibas tu pedido',
      icon: FaMoneyBillWave,
      color: 'green',
      details: 'Pago contra entrega - Sin comisiones adicionales'
    },
    {
      id: 'plin',
      name: 'Plin',
      description: 'Paga con Plin al número +51 961 606 183',
      icon: FaQrcode,
      color: 'purple',
      details: 'Escanea el código QR o transfiere al número mostrado'
    }
  ];

  return (
    <Box minH="100vh" bg="gray.50" py={8}>
      <Box maxW="800px" mx="auto" px={4}>
        <VStack spacing={8}>
          {/* Header */}
          <Box textAlign="center">
            <Heading size="xl" color="blue.600" mb={2}>
              Método de Pago
            </Heading>
            <Text color="gray.600" fontSize="lg">
              Selecciona cómo deseas pagar tu pedido
            </Text>
          </Box>

          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8} w="full">
            {/* Resumen del Pedido */}
            <Card>
              <CardHeader>
                <Heading size="md" color="gray.700">
                  Resumen del Pedido
                </Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={4}>
                  {/* Datos del Cliente */}
                  <Box w="full" p={3} bg="gray.50" borderRadius="md">
                    <Text fontWeight="bold" mb={2}>Datos de Entrega:</Text>
                    <Text fontSize="sm"><strong>Nombre:</strong> {orderData.client.name}</Text>
                    <Text fontSize="sm"><strong>Teléfono:</strong> {orderData.client.phone}</Text>
                    <Text fontSize="sm"><strong>Dirección:</strong> {orderData.client.address}</Text>
                    <Text fontSize="sm"><strong>Distrito:</strong> {orderData.client.district}</Text>
                    {orderData.client.reference && (
                      <Text fontSize="sm"><strong>Referencia:</strong> {orderData.client.reference}</Text>
                    )}
                  </Box>

                  {/* Productos */}
                  <Box w="full">
                    <Text fontWeight="bold" mb={2}>Productos:</Text>
                    <VStack spacing={2} align="start">
                      {orderData.items.map((item, index) => (
                        <HStack key={index} justify="space-between" w="full">
                          <Text fontSize="sm">
                            {item.name} x {item.quantity}
                          </Text>
                          <Text fontSize="sm" fontWeight="bold">
                            S/ {parseFloat(item.subtotal).toFixed(2)}
                          </Text>
                        </HStack>
                      ))}
                    </VStack>
                  </Box>

                  <Divider />

                  {/* Totales */}
                  <VStack spacing={2} w="full">
                    <HStack justify="space-between" w="full">
                      <Text>Subtotal:</Text>
                      <Text fontWeight="bold">S/ {parseFloat(orderData.subtotal).toFixed(2)}</Text>
                    </HStack>
                    
                    <HStack justify="space-between" w="full">
                      <Text>Flete:</Text>
                      <Text fontWeight="bold">S/ {parseFloat(orderData.deliveryFee).toFixed(2)}</Text>
                    </HStack>
                    
                    <Divider />
                    
                    <HStack justify="space-between" w="full">
                      <Text fontWeight="bold" fontSize="lg">Total:</Text>
                      <Text fontWeight="bold" fontSize="lg" color="blue.600">
                        S/ {parseFloat(orderData.total).toFixed(2)}
                      </Text>
                    </HStack>
                  </VStack>
                </VStack>
              </CardBody>
            </Card>

            {/* Métodos de Pago */}
            <Card>
              <CardHeader>
                <Heading size="md" color="gray.700">
                  Selecciona Método de Pago
                </Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={4}>
                  <RadioGroup value={selectedMethod} onChange={setSelectedMethod}>
                    <VStack spacing={4} align="start">
                      {paymentMethods.map((method) => (
                        <Card
                          key={method.id}
                          variant="outline"
                          w="full"
                          cursor="pointer"
                          borderColor={selectedMethod === method.id ? `${method.color}.300` : 'gray.200'}
                          bg={selectedMethod === method.id ? `${method.color}.50` : 'white'}
                          _hover={{ borderColor: `${method.color}.300` }}
                          onClick={() => setSelectedMethod(method.id)}
                        >
                          <CardBody>
                            <HStack spacing={4}>
                              <Radio value={method.id} />
                              <VStack align="start" spacing={1} flex={1}>
                                <HStack>
                                  <method.icon color={`${method.color}.500`} />
                                  <Text fontWeight="bold">{method.name}</Text>
                                </HStack>
                                <Text fontSize="sm" color="gray.600">
                                  {method.description}
                                </Text>
                                <Text fontSize="xs" color="gray.500">
                                  {method.details}
                                </Text>
                              </VStack>
                            </HStack>
                          </CardBody>
                        </Card>
                      ))}
                    </VStack>
                  </RadioGroup>

                  {/* Información adicional */}
                  <Alert status="info" borderRadius="md">
                    <AlertIcon />
                    <Box>
                      <Text fontSize="sm" fontWeight="bold">
                        Información Importante:
                      </Text>
                      <Text fontSize="xs">
                        • El pago se procesará después de confirmar tu pedido<br/>
                        • Para pagos digitales, recibirás los datos de transferencia<br/>
                        • El tiempo de entrega es de 2-4 horas hábiles
                      </Text>
                    </Box>
                  </Alert>

                  {/* Botones */}
                  <HStack spacing={4} w="full">
                    <Button
                      leftIcon={<FaArrowLeft />}
                      variant="outline"
                      onClick={handleBack}
                      flex={1}
                    >
                      Volver
                    </Button>
                    <Button
                      colorScheme="blue"
                      onClick={handleContinue}
                      flex={1}
                      isLoading={loading}
                      loadingText="Procesando..."
                    >
                      Continuar
                    </Button>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          </SimpleGrid>
        </VStack>
      </Box>
    </Box>
  );
};

export default PaymentMethod;
