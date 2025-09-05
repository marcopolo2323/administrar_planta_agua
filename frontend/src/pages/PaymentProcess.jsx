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
  Image,
  Alert,
  AlertIcon,
  Spinner,
  Center,
  useBreakpointValue,
  Divider,
  useToast,
  Code,
  Badge
} from '@chakra-ui/react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaCheck, FaQrcode, FaCopy, FaMoneyBillWave } from 'react-icons/fa';
import useOrderStore from '../stores/orderStore';

const PaymentProcess = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const toast = useToast();
  const isMobile = useBreakpointValue({ base: true, md: false });

  // Store
  const { createOrder } = useOrderStore();

  // Estados locales
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [orderCreated, setOrderCreated] = useState(false);
  const [orderId, setOrderId] = useState(null);

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

  const handleCreateOrder = async () => {
    if (!orderData) return;

    setLoading(true);
    try {
      // Preparar datos para el backend
      const orderPayload = {
        clientName: orderData.client.name,
        clientPhone: orderData.client.phone,
        clientEmail: orderData.client.email || null,
        deliveryAddress: orderData.client.address,
        district: orderData.client.district,
        reference: orderData.client.reference || null,
        notes: orderData.client.notes || null,
        paymentMethod: orderData.paymentMethod,
        items: orderData.items.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: item.subtotal
        })),
        subtotal: orderData.subtotal,
        deliveryFee: orderData.deliveryFee,
        total: orderData.total,
        status: 'pendiente'
      };

      const result = await createOrder(orderPayload);
      
      if (result.success) {
        setOrderCreated(true);
        setOrderId(result.data.id);
        
        // Limpiar datos del localStorage
        localStorage.removeItem('guestOrderData');
        
        toast({
          title: 'Pedido Creado',
          description: 'Tu pedido ha sido creado exitosamente',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        throw new Error(result.error || 'Error al crear el pedido');
      }
    } catch (error) {
      console.error('Error al crear pedido:', error);
      toast({
        title: 'Error',
        description: error.message || 'Error al crear el pedido',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/payment-method');
  };

  const handleContinue = () => {
    navigate(`/receipt/${orderId}`);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copiado',
      description: 'Número copiado al portapapeles',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  if (!orderData) {
    return (
      <Center h="400px">
        <Spinner size="xl" />
      </Center>
    );
  }

  const getPaymentInfo = () => {
    switch (orderData.paymentMethod) {
      case 'yape':
        return {
          title: 'Pago con Yape',
          icon: FaQrcode,
          color: 'purple',
          number: '999 888 777',
          instructions: [
            '1. Abre tu app de Yape',
            '2. Escanea el código QR o ingresa el número',
            '3. Ingresa el monto exacto',
            '4. Envía el comprobante por WhatsApp'
          ]
        };
      case 'plin':
        return {
          title: 'Pago con Plin',
          icon: FaQrcode,
          color: 'blue',
          number: '999 888 777',
          instructions: [
            '1. Abre tu app de Plin',
            '2. Escanea el código QR o ingresa el número',
            '3. Ingresa el monto exacto',
            '4. Envía el comprobante por WhatsApp'
          ]
        };
      case 'cash':
      default:
        return {
          title: 'Pago en Efectivo',
          icon: FaMoneyBillWave,
          color: 'green',
          instructions: [
            '1. Paga en efectivo cuando recibas tu pedido',
            '2. El repartidor te entregará el recibo',
            '3. No hay comisiones adicionales'
          ]
        };
    }
  };

  const paymentInfo = getPaymentInfo();

  return (
    <Box minH="100vh" bg="gray.50" py={8}>
      <Box maxW="800px" mx="auto" px={4}>
        <VStack spacing={8}>
          {/* Header */}
          <Box textAlign="center">
            <Heading size="xl" color="blue.600" mb={2}>
              {orderCreated ? 'Pedido Confirmado' : 'Procesar Pago'}
            </Heading>
            <Text color="gray.600" fontSize="lg">
              {orderCreated 
                ? 'Tu pedido ha sido creado exitosamente' 
                : 'Sigue las instrucciones para completar tu pago'
              }
            </Text>
          </Box>

          {!orderCreated ? (
            <Card w="full">
              <CardHeader>
                <Heading size="md" color="gray.700">
                  <paymentInfo.icon style={{ display: 'inline', marginRight: '8px' }} />
                  {paymentInfo.title}
                </Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={6}>
                  {/* Información de pago */}
                  <Box w="full" p={4} bg={`${paymentInfo.color}.50`} borderRadius="md">
                    <VStack spacing={4}>
                      <Text fontWeight="bold" fontSize="lg">
                        Monto a Pagar: S/ {parseFloat(orderData.total).toFixed(2)}
                      </Text>
                      
                      {paymentInfo.number && (
                        <Box textAlign="center">
                          <Text fontWeight="bold" mb={2}>Número de Cuenta:</Text>
                          <HStack justify="center" spacing={2}>
                            <Code fontSize="lg" p={2}>
                              {paymentInfo.number}
                            </Code>
                            <Button
                              size="sm"
                              leftIcon={<FaCopy />}
                              onClick={() => copyToClipboard(paymentInfo.number)}
                            >
                              Copiar
                            </Button>
                          </HStack>
                        </Box>
                      )}

                      {/* QR Code placeholder */}
                      {paymentInfo.number && (
                        <Box textAlign="center" p={4} bg="white" borderRadius="md">
                          <Text fontWeight="bold" mb={2}>Código QR:</Text>
                          <Box
                            w="200px"
                            h="200px"
                            bg="gray.100"
                            borderRadius="md"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            mx="auto"
                          >
                            <VStack>
                              <FaQrcode size="48px" color="gray" />
                              <Text fontSize="sm" color="gray.500">
                                QR Code
                              </Text>
                            </VStack>
                          </Box>
                        </Box>
                      )}
                    </VStack>
                  </Box>

                  {/* Instrucciones */}
                  <Box w="full">
                    <Text fontWeight="bold" mb={3}>Instrucciones:</Text>
                    <VStack spacing={2} align="start">
                      {paymentInfo.instructions.map((instruction, index) => (
                        <Text key={index} fontSize="sm">
                          {instruction}
                        </Text>
                      ))}
                    </VStack>
                  </Box>

                  {/* Resumen del pedido */}
                  <Box w="full" p={4} border="1px" borderColor="gray.200" borderRadius="md">
                    <Text fontWeight="bold" mb={3}>Resumen del Pedido:</Text>
                    <VStack spacing={2} align="start">
                      <HStack justify="space-between" w="full">
                        <Text fontSize="sm">Cliente:</Text>
                        <Text fontSize="sm" fontWeight="bold">{orderData.client.name}</Text>
                      </HStack>
                      <HStack justify="space-between" w="full">
                        <Text fontSize="sm">Teléfono:</Text>
                        <Text fontSize="sm" fontWeight="bold">{orderData.client.phone}</Text>
                      </HStack>
                      <HStack justify="space-between" w="full">
                        <Text fontSize="sm">Dirección:</Text>
                        <Text fontSize="sm" fontWeight="bold">{orderData.client.address}</Text>
                      </HStack>
                      <HStack justify="space-between" w="full">
                        <Text fontSize="sm">Distrito:</Text>
                        <Text fontSize="sm" fontWeight="bold">{orderData.client.district}</Text>
                      </HStack>
                      <Divider />
                      <HStack justify="space-between" w="full">
                        <Text fontSize="sm">Total:</Text>
                        <Text fontSize="sm" fontWeight="bold" color="blue.600">
                          S/ {parseFloat(orderData.total).toFixed(2)}
                        </Text>
                      </HStack>
                    </VStack>
                  </Box>

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
                      onClick={handleCreateOrder}
                      flex={1}
                      isLoading={loading}
                      loadingText="Creando Pedido..."
                    >
                      Confirmar Pedido
                    </Button>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          ) : (
            <Card w="full">
              <CardBody>
                <VStack spacing={6}>
                  <Alert status="success" borderRadius="md">
                    <AlertIcon />
                    <Box>
                      <Text fontWeight="bold">¡Pedido Creado Exitosamente!</Text>
                      <Text fontSize="sm">
                        Tu pedido #{orderId} ha sido registrado y será procesado pronto.
                      </Text>
                    </Box>
                  </Alert>

                  <Box textAlign="center">
                    <Text fontWeight="bold" mb={2}>Número de Pedido:</Text>
                    <Badge colorScheme="blue" fontSize="lg" p={2}>
                      #{orderId}
                    </Badge>
                  </Box>

                  <Box textAlign="center">
                    <Text fontSize="sm" color="gray.600">
                      Te enviaremos una confirmación por WhatsApp y podrás hacer seguimiento de tu pedido.
                    </Text>
                  </Box>

                  <Button
                    colorScheme="blue"
                    size="lg"
                    leftIcon={<FaCheck />}
                    onClick={handleContinue}
                    w="full"
                  >
                    Ver Recibo
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          )}
        </VStack>
      </Box>
    </Box>
  );
};

export default PaymentProcess;
