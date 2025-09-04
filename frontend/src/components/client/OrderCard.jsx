import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  Badge,
  Button,
  Flex,
  Stack,
  Divider,
  useColorModeValue,
} from '@chakra-ui/react';
import { ChevronRightIcon } from '@chakra-ui/icons';

const OrderCard = ({ order }) => {
  const navigate = useNavigate();
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Función para formatear la fecha
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  // Función para determinar el color del badge según el estado
  const getStatusColor = (status) => {
    switch (status) {
      case 'pendiente':
        return 'yellow';
      case 'en_proceso':
        return 'blue';
      case 'en_camino':
        return 'purple';
      case 'entregado':
        return 'green';
      case 'cancelado':
        return 'red';
      default:
        return 'gray';
    }
  };

  // Función para traducir el estado
  const translateStatus = (status) => {
    const statusMap = {
      'pendiente': 'Pendiente',
      'en_proceso': 'En proceso',
      'en_camino': 'En camino',
      'entregado': 'Entregado',
      'cancelado': 'Cancelado'
    };
    return statusMap[status] || status;
  };

  // Función para traducir el estado de pago
  const translatePaymentStatus = (status) => {
    const statusMap = {
      'pendiente': 'Pendiente',
      'pagado': 'Pagado',
      'cancelado': 'Cancelado'
    };
    return statusMap[status] || status;
  };

  // Función para determinar el color del badge de pago
  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'pendiente':
        return 'orange';
      case 'pagado':
        return 'green';
      case 'cancelado':
        return 'red';
      default:
        return 'gray';
    }
  };

  const handleViewDetails = () => {
    navigate(`/client/orders/${order.id}`);
  };

  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      borderColor={borderColor}
      overflow="hidden"
      bg={cardBg}
      boxShadow="sm"
      transition="all 0.3s"
      _hover={{ boxShadow: 'md' }}
    >
      <Box p={5}>
        <Flex justify="space-between" align="center" mb={3}>
          <Heading size="md" isTruncated>
            Pedido #{order.id}
          </Heading>
          <Badge colorScheme={getStatusColor(order.status)} fontSize="0.8em" px={2} py={1} borderRadius="md">
            {translateStatus(order.status)}
          </Badge>
        </Flex>

        <Text color="gray.500" fontSize="sm" mb={3}>
          {formatDate(order.createdAt)}
        </Text>

        <Stack spacing={2} mb={4}>
          <Flex justify="space-between">
            <Text fontWeight="medium">Total:</Text>
            <Text fontWeight="bold">S/ {order.total.toFixed(2)}</Text>
          </Flex>
          
          <Flex justify="space-between">
            <Text fontWeight="medium">Estado de pago:</Text>
            <Badge colorScheme={getPaymentStatusColor(order.paymentStatus)} fontSize="0.8em" px={2} py={1} borderRadius="md">
              {translatePaymentStatus(order.paymentStatus)}
            </Badge>
          </Flex>
          
          {order.deliveryAddress && (
            <Text fontSize="sm" color="gray.600" noOfLines={2}>
              Dirección: {order.deliveryAddress}
            </Text>
          )}
        </Stack>

        <Divider my={3} />

        <Flex justify="space-between" align="center">
          <Text fontSize="sm" color="gray.500">
            {order.items?.length || 0} productos
          </Text>
          <Button
            rightIcon={<ChevronRightIcon />}
            colorScheme="blue"
            variant="outline"
            size="sm"
            onClick={handleViewDetails}
          >
            Ver detalles
          </Button>
        </Flex>
      </Box>
    </Box>
  );
};

export default OrderCard;