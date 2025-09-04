import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  Box,
  Container,
  Heading,
  Text,
  Stack,
  Flex,
  Spinner,
  useColorModeValue,
  Button,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  Badge,
  Divider,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import ClientNavbar from '../../components/client/ClientNavbar';
import OrderCard from '../../components/client/OrderCard';

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/client/login');
      return;
    }

    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const config = {
          headers: { Authorization: `Bearer ${token}` }
        };

        const response = await axios.get(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/orders/my-orders`,
          config
        );

        // Ordenar pedidos por fecha (más recientes primero)
        const sortedOrders = response.data.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );

        setOrders(sortedOrders);
        setFilteredOrders(sortedOrders);
      } catch (error) {
        console.error('Error al cargar pedidos:', error);
        toast.error('Error al cargar tus pedidos');

        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('client');
          navigate('/client/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  useEffect(() => {
    // Aplicar filtros cuando cambian los criterios
    let result = [...orders];

    // Filtrar por término de búsqueda (ID de pedido)
    if (searchTerm) {
      result = result.filter(order => 
        order.id.toString().includes(searchTerm) ||
        order.orderNumber?.toString().includes(searchTerm)
      );
    }

    // Filtrar por estado de pedido
    if (statusFilter !== 'all') {
      result = result.filter(order => order.status === statusFilter);
    }

    // Filtrar por estado de pago
    if (paymentFilter !== 'all') {
      result = result.filter(order => {
        if (paymentFilter === 'paid') {
          return order.paymentStatus === 'paid';
        } else if (paymentFilter === 'pending') {
          return order.paymentStatus === 'pending';
        } else if (paymentFilter === 'failed') {
          return order.paymentStatus === 'failed';
        }
        return true;
      });
    }

    setFilteredOrders(result);
  }, [searchTerm, statusFilter, paymentFilter, orders]);

  const handleViewOrder = (orderId) => {
    navigate(`/client/orders/${orderId}`);
  };

  const handleNewOrder = () => {
    navigate('/client/new-order');
  };

  const getStatusTranslation = (status) => {
    const statusMap = {
      'pending': 'Pendiente',
      'processing': 'En proceso',
      'shipped': 'Enviado',
      'delivered': 'Entregado',
      'cancelled': 'Cancelado'
    };
    return statusMap[status] || status;
  };

  const getPaymentStatusTranslation = (status) => {
    const statusMap = {
      'pending': 'Pendiente',
      'paid': 'Pagado',
      'failed': 'Fallido'
    };
    return statusMap[status] || status;
  };

  if (isLoading) {
    return (
      <>
        <ClientNavbar />
        <Flex justify="center" align="center" height="80vh">
          <Spinner size="xl" color="blue.500" />
        </Flex>
      </>
    );
  }

  return (
    <>
      <ClientNavbar />
      <Box bg={bgColor} minH="100vh" py={6}>
        <Container maxW="container.lg">
          <Stack spacing={6}>
            <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
              <Heading size="lg">Mis Pedidos</Heading>
              <Button
                colorScheme="blue"
                onClick={handleNewOrder}
              >
                Nuevo Pedido
              </Button>
            </Flex>

            {/* Filtros */}
            <Flex 
              direction={{ base: 'column', md: 'row' }} 
              gap={4} 
              bg={cardBgColor} 
              p={4} 
              borderRadius="md"
              borderWidth="1px"
              borderColor={borderColor}
            >
              <InputGroup maxW={{ base: '100%', md: '40%' }}>
                <InputLeftElement pointerEvents="none">
                  <SearchIcon color="gray.400" />
                </InputLeftElement>
                <Input 
                  placeholder="Buscar por número de pedido" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
              
              <Select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                maxW={{ base: '100%', md: '30%' }}
              >
                <option value="all">Todos los estados</option>
                <option value="pending">Pendiente</option>
                <option value="processing">En proceso</option>
                <option value="shipped">Enviado</option>
                <option value="delivered">Entregado</option>
                <option value="cancelled">Cancelado</option>
              </Select>
              
              <Select 
                value={paymentFilter} 
                onChange={(e) => setPaymentFilter(e.target.value)}
                maxW={{ base: '100%', md: '30%' }}
              >
                <option value="all">Todos los pagos</option>
                <option value="pending">Pago pendiente</option>
                <option value="paid">Pagado</option>
                <option value="failed">Fallido</option>
              </Select>
            </Flex>

            {/* Lista de pedidos */}
            {filteredOrders.length > 0 ? (
              <Stack spacing={4}>
                {filteredOrders.map((order) => (
                  <OrderCard 
                    key={order.id} 
                    order={order} 
                    onClick={() => handleViewOrder(order.id)} 
                  />
                ))}
              </Stack>
            ) : (
              <Flex 
                direction="column" 
                align="center" 
                justify="center" 
                bg={cardBgColor} 
                p={8} 
                borderRadius="md"
                borderWidth="1px"
                borderColor={borderColor}
                minH="200px"
              >
                <Text fontSize="lg" mb={4}>
                  {orders.length > 0 
                    ? 'No se encontraron pedidos con los filtros seleccionados' 
                    : 'Aún no tienes pedidos'}
                </Text>
                <Button colorScheme="blue" onClick={handleNewOrder}>
                  Realizar un pedido
                </Button>
              </Flex>
            )}

            {/* Resumen de pedidos */}
            {orders.length > 0 && (
              <Box 
                bg={cardBgColor} 
                p={4} 
                borderRadius="md"
                borderWidth="1px"
                borderColor={borderColor}
              >
                <Heading size="sm" mb={3}>Resumen de Pedidos</Heading>
                <Divider mb={3} />
                <Stack direction={{ base: 'column', sm: 'row' }} spacing={4} justify="space-around">
                  <Box textAlign="center">
                    <Text fontWeight="bold" fontSize="2xl">{orders.length}</Text>
                    <Text>Total de pedidos</Text>
                  </Box>
                  <Box textAlign="center">
                    <Text fontWeight="bold" fontSize="2xl">
                      {orders.filter(order => order.status === 'delivered').length}
                    </Text>
                    <Text>Entregados</Text>
                  </Box>
                  <Box textAlign="center">
                    <Text fontWeight="bold" fontSize="2xl">
                      {orders.filter(order => ['pending', 'processing', 'shipped'].includes(order.status)).length}
                    </Text>
                    <Text>En proceso</Text>
                  </Box>
                  <Box textAlign="center">
                    <Text fontWeight="bold" fontSize="2xl">
                      {orders.filter(order => order.paymentStatus === 'paid').length}
                    </Text>
                    <Text>Pagados</Text>
                  </Box>
                </Stack>
              </Box>
            )}
          </Stack>
        </Container>
      </Box>
    </>
  );
};

export default Orders;