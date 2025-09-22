import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Text,
  SimpleGrid,
  Badge,
  Button,
  useColorModeValue,
  useToast,
  Spinner,
  Center,
  VStack,
  HStack,
  Divider,
  Icon,
  Tooltip
} from '@chakra-ui/react';
import { FaGift, FaTruck, FaCheckCircle, FaInfoCircle } from 'react-icons/fa';
import axios from '../utils/axios';

const SubscriptionPlansCard = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const headerBg = useColorModeValue('blue.50', 'blue.900');
  const bonusColor = useColorModeValue('green.500', 'green.300');
  const priceColor = useColorModeValue('blue.600', 'blue.300');

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/subscription-plans');
      setPlans(response.data.data || []);
    } catch (error) {
      console.error('Error al cargar planes de suscripción:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los planes de suscripción',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const getBonusText = (bonusBottles) => {
    if (bonusBottles === 0) return 'Sin bonificación';
    if (bonusBottles === 1) return '1 recarga mensual gratis';
    return `${bonusBottles} recargas mensual gratis`;
  };

  const getPlanColor = (sortOrder) => {
    const colors = [
      'blue', 'green', 'purple', 'orange', 'pink', 'teal', 'red'
    ];
    return colors[sortOrder % colors.length];
  };

  if (loading) {
    return (
      <Center py={10}>
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text color="gray.500">Cargando planes de suscripción...</Text>
        </VStack>
      </Center>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Card bg={headerBg} borderColor={borderColor} mb={6}>
        <CardBody>
          <VStack spacing={4} textAlign="center">
            <Heading size="lg" color={textColor}>
              🚰 Cartilla de Suscripciones AquaYara
            </Heading>
            <Text color={textColor} fontSize="lg">
              Por el pago mensual de cierta cantidad de bidones, recibe bonificaciones por ser un buen cliente
            </Text>
            <HStack spacing={4} wrap="wrap" justify="center">
              <HStack>
                <Icon as={FaCheckCircle} color="green.500" />
                <Text fontSize="sm">Válido solo para clientes que pagan adelantado una mensualidad</Text>
              </HStack>
              <HStack>
                <Icon as={FaTruck} color="blue.500" />
                <Text fontSize="sm">Control con sistema y cuaderno con firma</Text>
              </HStack>
              <HStack>
                <Icon as={FaInfoCircle} color="purple.500" />
                <Text fontSize="sm">Contrato y factura mensual</Text>
              </HStack>
            </HStack>
          </VStack>
        </CardBody>
      </Card>

      {/* Planes de Suscripción */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
        {plans.map((plan) => (
          <Card
            key={plan.id}
            bg={cardBg}
            borderColor={borderColor}
            borderWidth="2px"
            _hover={{
              transform: 'translateY(-4px)',
              shadow: 'lg',
              borderColor: getPlanColor(plan.sortOrder) + '.300'
            }}
            transition="all 0.3s ease"
            position="relative"
          >
            {/* Badge de Bonificación */}
            {plan.bonusBottles > 0 && (
              <Box position="absolute" top={-2} right={4}>
                <Badge
                  colorScheme="green"
                  fontSize="xs"
                  px={3}
                  py={1}
                  borderRadius="full"
                  transform="rotate(15deg)"
                >
                  <Icon as={FaGift} mr={1} />
                  {plan.bonusPercentage.toFixed(1)}% BONUS
                </Badge>
              </Box>
            )}

            <CardHeader pb={2}>
              <VStack spacing={2} align="stretch">
                <Heading size="md" color={textColor} textAlign="center">
                  {plan.name}
                </Heading>
                <Text fontSize="sm" color="gray.500" textAlign="center">
                  {plan.description}
                </Text>
              </VStack>
            </CardHeader>

            <CardBody pt={0}>
              <VStack spacing={4} align="stretch">
                {/* Cantidad de Bidones */}
                <Box textAlign="center">
                  <Text fontSize="2xl" fontWeight="bold" color={priceColor}>
                    {plan.totalBottles} Bidones
                  </Text>
                  {plan.bonusBottles > 0 && (
                    <Text fontSize="sm" color={bonusColor} fontWeight="semibold">
                      + {plan.bonusBottles} bonus
                    </Text>
                  )}
                </Box>

                <Divider />

                {/* Precios */}
                <VStack spacing={2}>
                  <HStack justify="space-between" w="full">
                    <Text fontSize="sm" color="gray.600">Pago mensual:</Text>
                    <Text fontSize="lg" fontWeight="bold" color={priceColor}>
                      S/ {plan.monthlyPrice.toFixed(2)}
                    </Text>
                  </HStack>
                  <HStack justify="space-between" w="full">
                    <Text fontSize="sm" color="gray.600">Precio por bidón:</Text>
                    <Text fontSize="md" fontWeight="semibold" color={textColor}>
                      S/ {plan.pricePerBottle.toFixed(2)}
                    </Text>
                  </HStack>
                </VStack>

                <Divider />

                {/* Bonificación */}
                <Box textAlign="center">
                  <Text fontSize="sm" color="gray.600" mb={1}>
                    Bonificación:
                  </Text>
                  <Text fontSize="md" fontWeight="semibold" color={bonusColor}>
                    {getBonusText(plan.bonusBottles)}
                  </Text>
                </Box>

                {/* Entregas Máximas Diarias */}
                <Box textAlign="center">
                  <HStack justify="center" spacing={2}>
                    <Icon as={FaTruck} color="blue.500" />
                    <Text fontSize="sm" color="gray.600">
                      Máx. {plan.maxDailyDelivery} entregas diarias
                    </Text>
                  </HStack>
                </Box>

                {/* Botón de Selección */}
                <Button
                  colorScheme={getPlanColor(plan.sortOrder)}
                  size="md"
                  w="full"
                  mt={2}
                  _hover={{
                    transform: 'scale(1.02)',
                    shadow: 'md'
                  }}
                  transition="all 0.2s ease"
                >
                  Seleccionar Plan
                </Button>
              </VStack>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>

      {/* Información Adicional */}
      <Card bg={cardBg} borderColor={borderColor} mt={6}>
        <CardBody>
          <VStack spacing={4} textAlign="center">
            <Heading size="md" color={textColor}>
              Información Importante
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
              <Box>
                <Text fontWeight="semibold" color={textColor} mb={2}>
                  Condiciones del Servicio:
                </Text>
                <VStack spacing={1} align="start">
                  <Text fontSize="sm" color="gray.600">
                    • Servicio para clientes domésticos y empresariales
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    • Válido solo para clientes que pagan adelantado una mensualidad
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    • Control con sistema y cuaderno con firma, fecha, hora y nombre de recepción
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    • Contrato y factura mensual
                  </Text>
                </VStack>
              </Box>
              <Box>
                <Text fontWeight="semibold" color={textColor} mb={2}>
                  Beneficios:
                </Text>
                <VStack spacing={1} align="start">
                  <Text fontSize="sm" color="gray.600">
                    • Descuentos progresivos según cantidad
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    • Bonificaciones en bidones adicionales
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    • Entregas programadas y controladas
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    • Atención prioritaria al cliente
                  </Text>
                </VStack>
              </Box>
            </SimpleGrid>
          </VStack>
        </CardBody>
      </Card>
    </Box>
  );
};

export default SubscriptionPlansCard;
