import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  Badge,
  VStack,
  HStack,
  Divider,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Select,
  Textarea,
  useDisclosure,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Icon,
  Flex
} from '@chakra-ui/react';
import { FaGift, FaCalendarAlt, FaTint, FaCheckCircle, FaClock } from 'react-icons/fa';
import axios from '../utils/axios';
import useAuthStore from '../stores/authStore';

const Subscriptions = () => {
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);
  const [clientSubscriptions, setClientSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const { user } = useAuthStore();

  // Datos del formulario de suscripción
  const [subscriptionData, setSubscriptionData] = useState({
    planId: '',
    startDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Obtener planes de suscripción
      const plansResponse = await axios.get('/api/subscriptions/plans');
      setSubscriptionPlans(plansResponse.data);

      // Obtener suscripciones del cliente (si está autenticado)
      if (user && user.role === 'cliente') {
        try {
          const subscriptionsResponse = await axios.get('/api/subscriptions/client');
          setClientSubscriptions(subscriptionsResponse.data.data || []);
        } catch (error) {
          console.log('Cliente no autenticado o sin suscripciones');
        }
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los planes de suscripción',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = (plan) => {
    setSelectedPlan(plan);
    setSubscriptionData({
      planId: plan.id,
      startDate: new Date().toISOString().split('T')[0],
      notes: ''
    });
    onOpen();
  };

  const handleSubscriptionSubmit = async () => {
    try {
      setIsSubscribing(true);

      if (!user || user.role !== 'cliente') {
        toast({
          title: 'Error',
          description: 'Debes iniciar sesión como cliente para suscribirte',
          status: 'error',
          duration: 3000,
          isClosable: true
        });
        return;
      }

      await axios.post('/api/subscriptions/client/subscribe', subscriptionData);

      toast({
        title: '¡Suscripción exitosa!',
        description: `Te has suscrito al ${selectedPlan.name}`,
        status: 'success',
        duration: 5000,
        isClosable: true
      });

      onClose();
      fetchData(); // Recargar datos
    } catch (error) {
      console.error('Error al suscribirse:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'No se pudo procesar la suscripción',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    } finally {
      setIsSubscribing(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'green';
      case 'paused': return 'yellow';
      case 'completed': return 'blue';
      case 'cancelled': return 'red';
      case 'expired': return 'gray';
      default: return 'gray';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Activa';
      case 'paused': return 'Pausada';
      case 'completed': return 'Completada';
      case 'cancelled': return 'Cancelada';
      case 'expired': return 'Expirada';
      default: return 'Desconocido';
    }
  };

  if (loading) {
    return (
      <Box p={6}>
        <Heading mb={6}>Cargando suscripciones...</Heading>
      </Box>
    );
  }

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box textAlign="center">
          <Heading size="lg" mb={2} color="blue.600">
            💧 Planes de Suscripción AquaYara
          </Heading>
          <Text color="gray.600">
            Paga por adelantado y recibe bonificaciones especiales
          </Text>
        </Box>

        {/* Mis Suscripciones Activas */}
        {clientSubscriptions.length > 0 && (
          <Box>
            <Heading size="md" mb={4} color="green.600">
              📋 Mis Suscripciones
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
              {clientSubscriptions.map((subscription) => (
                <Card key={subscription.id} borderLeft="4px" borderLeftColor="green.400">
                  <CardHeader>
                    <HStack justify="space-between">
                      <Heading size="sm">{subscription.planName}</Heading>
                      <Badge colorScheme={getStatusColor(subscription.status)}>
                        {getStatusText(subscription.status)}
                      </Badge>
                    </HStack>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={3} align="stretch">
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="gray.600">Bidones entregados:</Text>
                        <Text fontWeight="bold">{subscription.bottlesDelivered}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="gray.600">Bidones restantes:</Text>
                        <Text fontWeight="bold" color="blue.600">{subscription.bottlesRemaining}</Text>
                      </HStack>
                      <Progress 
                        value={(subscription.bottlesDelivered / subscription.totalBottlesWithBonus) * 100} 
                        colorScheme="blue" 
                        size="sm" 
                        borderRadius="md"
                      />
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="gray.600">Precio mensual:</Text>
                        <Text fontWeight="bold" color="green.600">S/ {subscription.monthlyPrice}</Text>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          </Box>
        )}

        {/* Planes Disponibles */}
        <Box>
          <Heading size="md" mb={4} color="blue.600">
            🎯 Planes Disponibles
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {subscriptionPlans.map((plan) => (
              <Card key={plan.id} border="2px" borderColor="gray.200" _hover={{ borderColor: "blue.300" }}>
                <CardHeader textAlign="center">
                  <VStack spacing={2}>
                    <Heading size="md" color="blue.600">{plan.name}</Heading>
                    {plan.description && (
                      <Text fontSize="sm" color="gray.600">{plan.description}</Text>
                    )}
                  </VStack>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    {/* Precio */}
                    <Box textAlign="center">
                      <Text fontSize="2xl" fontWeight="bold" color="green.600">
                        S/ {plan.monthlyPrice}
                      </Text>
                      <Text fontSize="sm" color="gray.500">por mes</Text>
                    </Box>

                    <Divider />

                    {/* Detalles del plan */}
                    <VStack spacing={2} align="stretch">
                      <HStack justify="space-between">
                        <Text fontSize="sm">Bidones incluidos:</Text>
                        <Text fontWeight="bold">{plan.totalBottles}</Text>
                      </HStack>
                      
                      {plan.bonusBottles > 0 && (
                        <HStack justify="space-between" color="green.600">
                          <HStack>
                            <Icon as={FaGift} />
                            <Text fontSize="sm">Bonificación:</Text>
                          </HStack>
                          <Text fontWeight="bold">+{plan.bonusBottles} gratis</Text>
                        </HStack>
                      )}

                      <HStack justify="space-between">
                        <Text fontSize="sm">Total bidones:</Text>
                        <Text fontWeight="bold" color="blue.600">
                          {plan.totalBottles + plan.bonusBottles}
                        </Text>
                      </HStack>

                      <HStack justify="space-between">
                        <Text fontSize="sm">Precio por bidón:</Text>
                        <Text fontWeight="bold">S/ {plan.pricePerBottle}</Text>
                      </HStack>

                      {plan.bonusPercentage > 0 && (
                        <HStack justify="space-between" color="green.600">
                          <Text fontSize="sm">Ahorro:</Text>
                          <Text fontWeight="bold">{plan.bonusPercentage}%</Text>
                        </HStack>
                      )}

                      {plan.maxDailyDelivery && (
                        <HStack justify="space-between">
                          <Text fontSize="sm">Máximo diario:</Text>
                          <Text fontWeight="bold">{plan.maxDailyDelivery} bidones</Text>
                        </HStack>
                      )}
                    </VStack>

                    <Divider />

                    {/* Botón de suscripción */}
                    <Button
                      colorScheme="blue"
                      size="md"
                      onClick={() => handleSubscribe(plan)}
                      leftIcon={<FaCheckCircle />}
                    >
                      Suscribirse
                    </Button>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        </Box>

        {/* Información adicional */}
        <Alert status="info" borderRadius="md">
          <AlertIcon />
          <Box>
            <AlertTitle>💡 ¿Cómo funcionan las suscripciones?</AlertTitle>
            <AlertDescription>
              • Pagas por adelantado y recibes bonificaciones especiales<br/>
              • Puedes pedir bidones cuando quieras (respetando el límite diario)<br/>
              • Los bidones se descuentan de tu suscripción automáticamente<br/>
              • Si no usas todos los bidones, se pierden al final del mes
            </AlertDescription>
          </Box>
        </Alert>
      </VStack>

      {/* Modal de suscripción */}
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Suscribirse a {selectedPlan?.name}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4} align="stretch">
              {selectedPlan && (
                <Box p={4} bg="blue.50" borderRadius="md">
                  <VStack spacing={2} align="stretch">
                    <HStack justify="space-between">
                      <Text fontWeight="bold">Precio mensual:</Text>
                      <Text color="green.600" fontWeight="bold">S/ {selectedPlan.monthlyPrice}</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text>Bidones incluidos:</Text>
                      <Text fontWeight="bold">{selectedPlan.totalBottles}</Text>
                    </HStack>
                    {selectedPlan.bonusBottles > 0 && (
                      <HStack justify="space-between" color="green.600">
                        <Text>Bonificación:</Text>
                        <Text fontWeight="bold">+{selectedPlan.bonusBottles} gratis</Text>
                      </HStack>
                    )}
                    <HStack justify="space-between">
                      <Text fontWeight="bold">Total bidones:</Text>
                      <Text fontWeight="bold" color="blue.600">
                        {selectedPlan.totalBottles + selectedPlan.bonusBottles}
                      </Text>
                    </HStack>
                  </VStack>
                </Box>
              )}

              <FormControl>
                <FormLabel>Fecha de inicio</FormLabel>
                <Select
                  value={subscriptionData.startDate}
                  onChange={(e) => setSubscriptionData({...subscriptionData, startDate: e.target.value})}
                >
                  <option value={new Date().toISOString().split('T')[0]}>
                    Hoy ({new Date().toLocaleDateString()})
                  </option>
                  <option value={new Date(Date.now() + 24*60*60*1000).toISOString().split('T')[0]}>
                    Mañana ({new Date(Date.now() + 24*60*60*1000).toLocaleDateString()})
                  </option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Notas adicionales (opcional)</FormLabel>
                <Textarea
                  value={subscriptionData.notes}
                  onChange={(e) => setSubscriptionData({...subscriptionData, notes: e.target.value})}
                  placeholder="Instrucciones especiales de entrega, horarios preferidos, etc."
                />
              </FormControl>

              <HStack spacing={4}>
                <Button
                  colorScheme="blue"
                  onClick={handleSubscriptionSubmit}
                  isLoading={isSubscribing}
                  loadingText="Procesando..."
                  flex={1}
                >
                  Confirmar Suscripción
                </Button>
                <Button onClick={onClose} flex={1}>
                  Cancelar
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Subscriptions;
