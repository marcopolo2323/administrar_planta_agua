import React from 'react';
import {
  Box,
  Flex,
  Text,
  Icon,
  useColorModeValue,
  Tooltip,
} from '@chakra-ui/react';
import { CheckCircleIcon, TimeIcon } from '@chakra-ui/icons';
import { FaBox, FaTruck, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const OrderTracking = ({ status, updatedAt }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const activeColor = useColorModeValue('blue.500', 'blue.300');
  const completedColor = useColorModeValue('green.500', 'green.300');
  const pendingColor = useColorModeValue('gray.300', 'gray.600');
  const cancelledColor = useColorModeValue('red.500', 'red.300');

  // Definir los estados del pedido y sus traducciones
  const orderStates = [
    { key: 'pending', label: 'Pendiente', icon: TimeIcon },
    { key: 'processing', label: 'En proceso', icon: FaBox },
    { key: 'shipped', label: 'Enviado', icon: FaTruck },
    { key: 'delivered', label: 'Entregado', icon: FaCheckCircle },
  ];

  // Determinar el índice del estado actual
  const currentStateIndex = orderStates.findIndex(state => state.key === status);
  const isCancelled = status === 'cancelled';

  // Formatear la fecha de actualización
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isCancelled) {
    return (
      <Box
        bg={bgColor}
        borderWidth="1px"
        borderColor={borderColor}
        borderRadius="lg"
        p={4}
        mb={4}
      >
        <Flex align="center" justify="center" direction="column">
          <Icon as={FaTimesCircle} w={10} h={10} color={cancelledColor} mb={2} />
          <Text fontWeight="bold" fontSize="lg" color={cancelledColor}>
            Pedido Cancelado
          </Text>
          {updatedAt && (
            <Text fontSize="sm" color="gray.500" mt={1}>
              {formatDate(updatedAt)}
            </Text>
          )}
        </Flex>
      </Box>
    );
  }

  return (
    <Box
      bg={bgColor}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="lg"
      p={4}
      mb={4}
    >
      <Flex justify="space-between" align="center" wrap={{ base: 'wrap', md: 'nowrap' }}>
        {orderStates.map((state, index) => {
          // Determinar el estado de este paso
          const isCompleted = index < currentStateIndex;
          const isActive = index === currentStateIndex;
          const isPending = index > currentStateIndex;

          // Determinar el color basado en el estado
          const iconColor = isCompleted ? completedColor : isActive ? activeColor : pendingColor;
          const textColor = isCompleted ? completedColor : isActive ? activeColor : 'gray.500';

          return (
            <React.Fragment key={state.key}>
              {/* Paso del estado */}
              <Flex 
                direction="column" 
                align="center" 
                flex="1" 
                position="relative"
                zIndex="1"
              >
                <Tooltip label={state.label} placement="top">
                  <Box>
                    <Icon 
                      as={isCompleted ? CheckCircleIcon : state.icon} 
                      w={6} 
                      h={6} 
                      color={iconColor} 
                    />
                  </Box>
                </Tooltip>
                <Text 
                  fontSize="sm" 
                  fontWeight={isActive ? 'bold' : 'normal'}
                  color={textColor}
                  mt={1}
                  textAlign="center"
                >
                  {state.label}
                </Text>
                {(isCompleted || isActive) && updatedAt && index === currentStateIndex && (
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    {formatDate(updatedAt)}
                  </Text>
                )}
              </Flex>

              {/* Línea conectora entre pasos (excepto después del último) */}
              {index < orderStates.length - 1 && (
                <Box 
                  flex="1" 
                  height="2px" 
                  bg={index < currentStateIndex ? completedColor : pendingColor}
                  mx={2}
                  display={{ base: 'none', sm: 'block' }}
                />
              )}
            </React.Fragment>
          );
        })}
      </Flex>
    </Box>
  );
};

export default OrderTracking;