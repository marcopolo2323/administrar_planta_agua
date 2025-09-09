import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Card,
  CardBody,
  CardHeader,
  Badge,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Progress,
  Divider,
  Icon,
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText
} from '@chakra-ui/react';
import { FaTint, FaGift, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import axios from 'axios';
import bidonImage from '../assets/images/img_buyon.jpeg';
import paqueteImage from '../assets/images/img_paquete_botellas.jpeg';

const SubscriptionOrder = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  // Función para obtener la imagen del producto
  const getProductImage = (productName) => {
    const name = productName.toLowerCase();
    if (name.includes('bidón') || name.includes('bidon') || name.includes('garrafa')) {
      return bidonImage;
    } else if (name.includes('paquete') || name.includes('pack') || name.includes('botellas')) {
      return paqueteImage;
    }
    return bidonImage; // Imagen por defecto
  };

  const [orderData, setOrderData] = useState({
    subscriptionId: '',
    bottlesRequested: 1,
    deliveryAddress: '',
    deliveryDistrict: '',
    contactPhone: '',
    notes: ''
  });

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const clientId = localStorage.getItem('clientId');

      if (!token || !clientId) {
        toast({
          title: 'Error',
          description: 'Debes iniciar sesión para hacer pedidos',
          status: 'error',
          duration: 3000,
          isClosable: true
        });
        return;
      }

      const response = await axios.get(`/api/subscriptions/client/${clientId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const activeSubscriptions = response.data.filter(sub => sub.status === 'active');
      setSubscriptions(activeSubscriptions);

      if (activeSubscriptions.length === 0) {
        toast({
          title: 'Sin suscripciones activas',
          description: 'No tienes suscripciones activas. Suscríbete a un plan primero.',
          status: 'warning',
          duration: 5000,
          isClosable: true
        });
      }
    } catch (error) {
      console.error('Error al cargar suscripciones:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las suscripciones',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubscriptionChange = (subscriptionId) => {
    const subscription = subscriptions.find(sub => sub.id === parseInt(subscriptionId));
    setSelectedSubscription(subscription);
    setOrderData({
      ...orderData,
      subscriptionId,
      deliveryAddress: subscription?.client?.address || '',
      deliveryDistrict: subscription?.client?.district || '',
      contactPhone: subscription?.client?.phone || ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedSubscription) {
      toast({
        title: 'Error',
        description: 'Selecciona una suscripción',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
      return;
    }

    if (orderData.bottlesRequested > selectedSubscription.bottlesRemaining) {
      toast({
        title: 'Error',
        description: `Solo quedan ${selectedSubscription.bottlesRemaining} bidones en tu suscripción`,
        status: 'error',
        duration: 3000,
        isClosable: true
      });
      return;
    }

    if (selectedSubscription.maxDailyDelivery && orderData.bottlesRequested > selectedSubscription.maxDailyDelivery) {
      toast({
        title: 'Error',
        description: `El máximo de bidones por día es ${selectedSubscription.maxDailyDelivery}`,
        status: 'error',
        duration: 3000,
        isClosable: true
      });
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');

      await axios.post('/api/subscriptions/order', orderData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast({
        title: '¡Pedido realizado!',
        description: 'Tu pedido ha sido procesado correctamente',
        status: 'success',
        duration: 5000,
        isClosable: true
      });

      // Limpiar formulario
      setOrderData({
        subscriptionId: '',
        bottlesRequested: 1,
        deliveryAddress: '',
        deliveryDistrict: '',
        contactPhone: '',
        notes: ''
      });
      setSelectedSubscription(null);

      // Recargar suscripciones
      fetchSubscriptions();
    } catch (error) {
      console.error('Error al hacer pedido:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'No se pudo procesar el pedido',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box p={6}>
        <Heading mb={6}>Cargando suscripciones...</Heading>
      </Box>
    );
  }

  if (subscriptions.length === 0) {
    return (
      <Box p={6}>
        <Alert status="warning" borderRadius="md" mb={6}>
          <AlertIcon />
          <Box>
            <AlertTitle>Sin suscripciones activas</AlertTitle>
            <AlertDescription>
              No tienes suscripciones activas. Ve a la página de Suscripciones para suscribirte a un plan.
            </AlertDescription>
          </Box>
        </Alert>
        <Button colorScheme="blue" onClick={() => window.location.href = '/subscriptions'}>
          Ver Planes de Suscripción
        </Button>
      </Box>
    );
  }

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box textAlign="center">
          <Heading size="lg" mb={2} color="blue.600">
            🚚 Pedido con Suscripción
          </Heading>
          <Text color="gray.600">
            Usa tus bidones de suscripción para hacer pedidos
          </Text>
        </Box>

        {/* Suscripciones disponibles */}
        <Box>
          <Heading size="md" mb={4}>📋 Mis Suscripciones Activas</Heading>
          <VStack spacing={4} align="stretch">
            {subscriptions.map((subscription) => (
              <Card 
                key={subscription.id} 
                border="2px" 
                borderColor={selectedSubscription?.id === subscription.id ? "blue.300" : "gray.200"}
                cursor="pointer"
                onClick={() => handleSubscriptionChange(subscription.id)}
                _hover={{ borderColor: "blue.300" }}
              >
                <CardHeader>
                  <HStack justify="space-between">
                    <Heading size="sm">{subscription.planName}</Heading>
                    <Badge colorScheme="green">Activa</Badge>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <VStack spacing={3} align="stretch">
                    <HStack spacing={3} align="start">
                      {/* Imagen del producto */}
                      <Box flexShrink={0}>
                        <img
                          src={getProductImage(subscription.planName)}
                          alt={subscription.planName}
                          style={{
                            width: '50px',
                            height: '50px',
                            objectFit: 'cover',
                            borderRadius: '6px',
                            border: '1px solid #e2e8f0'
                          }}
                        />
                      </Box>
                      
                      {/* Información de la suscripción */}
                      <VStack align="start" spacing={1} flex={1}>
                        <HStack justify="space-between" w="full">
                          <Text fontSize="sm" color="gray.600">Bidones restantes:</Text>
                          <Text fontWeight="bold" color="blue.600" fontSize="lg">
                            {subscription.bottlesRemaining}
                          </Text>
                        </HStack>
                      </VStack>
                    </HStack>
                    
                    <Progress 
                      value={(subscription.bottlesDelivered / subscription.totalBottlesWithBonus) * 100} 
                      colorScheme="blue" 
                      size="sm" 
                      borderRadius="md"
                    />
                    
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">Entregados:</Text>
                      <Text fontWeight="bold">{subscription.bottlesDelivered}</Text>
                    </HStack>
                    
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">Total del plan:</Text>
                      <Text fontWeight="bold">{subscription.totalBottlesWithBonus}</Text>
                    </HStack>

                    {subscription.maxDailyDelivery && (
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="gray.600">Máximo diario:</Text>
                        <Text fontWeight="bold">{subscription.maxDailyDelivery} bidones</Text>
                      </HStack>
                    )}
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </VStack>
        </Box>

        {/* Formulario de pedido */}
        {selectedSubscription && (
          <Box>
            <Heading size="md" mb={4}>📝 Hacer Pedido</Heading>
            <Card>
              <CardHeader>
                <HStack>
                  <Icon as={FaTint} color="blue.500" />
                  <Heading size="sm">{selectedSubscription.planName}</Heading>
                </HStack>
              </CardHeader>
              <CardBody>
                <form onSubmit={handleSubmit}>
                  <VStack spacing={4} align="stretch">
                    {/* Cantidad de bidones */}
                    <FormControl isRequired>
                      <FormLabel>Cantidad de bidones</FormLabel>
                      <NumberInput
                        value={orderData.bottlesRequested}
                        onChange={(value) => setOrderData({...orderData, bottlesRequested: parseInt(value)})}
                        min={1}
                        max={Math.min(selectedSubscription.bottlesRemaining, selectedSubscription.maxDailyDelivery || selectedSubscription.bottlesRemaining)}
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                      <Text fontSize="sm" color="gray.500" mt={1}>
                        Máximo: {Math.min(selectedSubscription.bottlesRemaining, selectedSubscription.maxDailyDelivery || selectedSubscription.bottlesRemaining)} bidones
                      </Text>
                    </FormControl>

                    {/* Dirección de entrega */}
                    <FormControl isRequired>
                      <FormLabel>Dirección de entrega</FormLabel>
                      <Input
                        value={orderData.deliveryAddress}
                        onChange={(e) => setOrderData({...orderData, deliveryAddress: e.target.value})}
                        placeholder="Ingresa la dirección completa"
                      />
                    </FormControl>

                    {/* Distrito */}
                    <FormControl isRequired>
                      <FormLabel>Distrito</FormLabel>
                      <Input
                        value={orderData.deliveryDistrict}
                        onChange={(e) => setOrderData({...orderData, deliveryDistrict: e.target.value})}
                        placeholder="Ingresa el distrito"
                      />
                    </FormControl>

                    {/* Teléfono de contacto */}
                    <FormControl isRequired>
                      <FormLabel>Teléfono de contacto</FormLabel>
                      <Input
                        value={orderData.contactPhone}
                        onChange={(e) => setOrderData({...orderData, contactPhone: e.target.value})}
                        placeholder="Número de teléfono"
                      />
                    </FormControl>

                    {/* Notas */}
                    <FormControl>
                      <FormLabel>Notas adicionales (opcional)</FormLabel>
                      <Textarea
                        value={orderData.notes}
                        onChange={(e) => setOrderData({...orderData, notes: e.target.value})}
                        placeholder="Instrucciones especiales, horarios preferidos, etc."
                      />
                    </FormControl>

                    <Divider />

                    {/* Resumen del pedido */}
                    <Box p={4} bg="blue.50" borderRadius="md">
                      <VStack spacing={2} align="stretch">
                        <HStack justify="space-between">
                          <Text fontWeight="bold">Bidones solicitados:</Text>
                          <Text fontWeight="bold" color="blue.600">{orderData.bottlesRequested}</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text>Bidones restantes después del pedido:</Text>
                          <Text fontWeight="bold" color="green.600">
                            {selectedSubscription.bottlesRemaining - orderData.bottlesRequested}
                          </Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text>Costo adicional:</Text>
                          <Text fontWeight="bold" color="green.600">S/ 0.00</Text>
                        </HStack>
                        <Text fontSize="sm" color="gray.600" textAlign="center">
                          💡 Los bidones de suscripción no tienen costo adicional
                        </Text>
                      </VStack>
                    </Box>

                    {/* Botón de envío */}
                    <Button
                      type="submit"
                      colorScheme="blue"
                      size="lg"
                      isLoading={submitting}
                      loadingText="Procesando pedido..."
                      leftIcon={<FaCheckCircle />}
                    >
                      Confirmar Pedido
                    </Button>
                  </VStack>
                </form>
              </CardBody>
            </Card>
          </Box>
        )}

        {/* Información adicional */}
        <Alert status="info" borderRadius="md">
          <AlertIcon />
          <Box>
            <AlertTitle>💡 Información importante</AlertTitle>
            <AlertDescription>
              • Los bidones se descuentan automáticamente de tu suscripción<br/>
              • No hay costo adicional por el pedido<br/>
              • Puedes hacer varios pedidos al día respetando el límite diario<br/>
              • Los bidones no utilizados se pierden al final del mes
            </AlertDescription>
          </Box>
        </Alert>
      </VStack>
    </Box>
  );
};

export default SubscriptionOrder;
