import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Icon,
  Divider,
  Badge,
  SimpleGrid
} from '@chakra-ui/react';
import {
  FaShoppingCart,
  FaGift,
  FaTruck,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaCheckCircle
} from 'react-icons/fa';

const VoucherFlowExplanation = () => {
  const steps = [
    {
      icon: FaShoppingCart,
      title: "1. Cliente hace pedido",
      description: "El cliente frecuente selecciona productos y hace su pedido",
      color: "blue"
    },
    {
      icon: FaGift,
      title: "2. Se genera vale automáticamente",
      description: "El sistema crea un vale por cada producto del pedido",
      color: "purple"
    },
    {
      icon: FaTruck,
      title: "3. Repartidor entrega",
      description: "El repartidor entrega el pedido y marca el vale como 'entregado'",
      color: "orange"
    },
    {
      icon: FaCalendarAlt,
      title: "4. Fin de mes",
      description: "El sistema notifica que es hora de pagar todos los vales acumulados",
      color: "red"
    },
    {
      icon: FaMoneyBillWave,
      title: "5. Cliente paga al repartidor",
      description: "El cliente paga en efectivo, Yape o tarjeta al repartidor",
      color: "green"
    },
    {
      icon: FaCheckCircle,
      title: "6. Repartidor marca como pagado",
      description: "El repartidor actualiza el estado del vale a 'pagado'",
      color: "teal"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <Heading size="md" color="blue.600">
          ¿Cómo funciona el sistema de vales?
        </Heading>
      </CardHeader>
      <CardBody>
        <VStack spacing={4} align="stretch">
          <Text color="gray.600" fontSize="sm">
            El sistema de vales automatiza el proceso tradicional de crédito entre clientes frecuentes y repartidores.
          </Text>
          
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
            {steps.map((step, index) => (
              <Card key={index} variant="outline">
                <CardBody>
                  <VStack spacing={3} align="center" textAlign="center">
                    <Icon
                      as={step.icon}
                      boxSize={8}
                      color={`${step.color}.500`}
                    />
                    <VStack spacing={1}>
                      <Text fontWeight="bold" fontSize="sm">
                        {step.title}
                      </Text>
                      <Text fontSize="xs" color="gray.600">
                        {step.description}
                      </Text>
                    </VStack>
                    <Badge colorScheme={step.color} size="sm">
                      Paso {index + 1}
                    </Badge>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>

          <Divider />

          <Box p={4} bg="blue.50" borderRadius="md">
            <VStack spacing={2} align="start">
              <Text fontWeight="bold" color="blue.700">
                💡 Ventajas del sistema automatizado:
              </Text>
              <Text fontSize="sm" color="blue.600">
                • Los vales se generan automáticamente con cada pedido
              </Text>
              <Text fontSize="sm" color="blue.600">
                • Control total de cuánto debe cada cliente
              </Text>
              <Text fontSize="sm" color="blue.600">
                • Notificaciones automáticas de fin de mes
              </Text>
              <Text fontSize="sm" color="blue.600">
                • Historial completo de todos los vales
              </Text>
            </VStack>
          </Box>
        </VStack>
      </CardBody>
    </Card>
  );
};

export default VoucherFlowExplanation;
