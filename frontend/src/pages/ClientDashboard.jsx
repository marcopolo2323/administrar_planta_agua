import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Badge,
  Button,
  Spinner,
  Center,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useToast,
  Select,
  Flex,
  Icon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure
} from '@chakra-ui/react';
import {
  FaUser,
  FaGift,
  FaClock,
  FaCheckCircle,
  FaBox,
  FaMoneyBillWave,
  FaShoppingCart
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import axios from '../utils/axios';
import { useRole } from '../hooks/useRole';
import MonthlyPaymentNotification from '../components/MonthlyPaymentNotification';
import VoucherFlowExplanation from '../components/VoucherFlowExplanation';

const ClientDashboard = () => {
  const [vouchers, setVouchers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user } = useRole();
  const toast = useToast();

  useEffect(() => {
    fetchVouchers();
    fetchOrders();
    fetchStats();
  }, [statusFilter]);

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const params = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
      const response = await axios.get(`/api/vouchers/client${params}`);
      
      if (response.data.success) {
        setVouchers(response.data.data);
      }
    } catch (error) {
      console.error('Error al cargar vales:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los vales',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get('/api/orders/my-orders');
      if (response.data.success) {
        setOrders(response.data.data || []);
      }
    } catch (error) {
      console.error('Error al cargar pedidos:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los pedidos',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/vouchers/client/stats');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  };

  const updateVoucherStatus = async (voucherId, newStatus) => {
    try {
      await axios.put(`/api/vouchers/${voucherId}/status`, {
        status: newStatus
      });

      toast({
        title: 'Estado Actualizado',
        description: 'El estado del vale se actualizó correctamente',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      fetchVouchers();
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el estado del vale',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'yellow',
      delivered: 'blue',
      paid: 'green'
    };
    return colors[status] || 'gray';
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'Pendiente',
      delivered: 'Entregado',
      paid: 'Pagado'
    };
    return texts[status] || status;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewOrderDetails = (order) => {
    setSelectedOrder(order);
    onOpen();
  };

  const calculateTotalPending = () => {
    return vouchers
      .filter(voucher => voucher.status === 'pending')
      .reduce((total, voucher) => total + parseFloat(voucher.totalAmount), 0);
  };

  if (loading) {
    return (
      <Center h="400px">
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box>
          <HStack justify="space-between" align="center">
            <VStack align="start" spacing={1}>
              <Heading size="lg">
                <Icon as={FaUser} mr={2} />
                Área de Cliente
              </Heading>
              <Text color="gray.600">
                Bienvenido, {user?.username}. Gestiona tus vales y pedidos.
              </Text>
            </VStack>
            <HStack spacing={3}>
              <Button
                as={Link}
                to="/client-dashboard/order"
                leftIcon={<FaShoppingCart />}
                colorScheme="blue"
                size="lg"
              >
                Hacer Pedido
              </Button>
              <Button
                as={Link}
                to="/client-dashboard/payments"
                leftIcon={<FaMoneyBillWave />}
                colorScheme="green"
                size="lg"
              >
                Mis Pagos
              </Button>
            </HStack>
          </HStack>
        </Box>

        {/* Notificación de pago mensual */}
        <MonthlyPaymentNotification />

        {/* Explicación del sistema de vales */}
        <VoucherFlowExplanation />

        {/* Estadísticas */}
        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Total Pedidos</StatLabel>
                <StatNumber>{orders.length}</StatNumber>
              </Stat>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Pedidos Pendientes</StatLabel>
                <StatNumber color="yellow.500">
                  {orders.filter(order => order.status === 'pendiente').length}
                </StatNumber>
              </Stat>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Pedidos Entregados</StatLabel>
                <StatNumber color="blue.500">
                  {orders.filter(order => order.status === 'entregado').length}
                </StatNumber>
              </Stat>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Total Vales</StatLabel>
                <StatNumber color="green.500">{stats?.totalVouchers || 0}</StatNumber>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Resumen de montos */}
        {stats && (
          <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Total Pendiente</StatLabel>
                  <StatNumber color="yellow.500">S/ {stats.pendingAmount.toFixed(2)}</StatNumber>
                </Stat>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Total Entregado</StatLabel>
                  <StatNumber color="blue.500">S/ {stats.deliveredAmount.toFixed(2)}</StatNumber>
                </Stat>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Total Pagado</StatLabel>
                  <StatNumber color="green.500">S/ {stats.paidAmount.toFixed(2)}</StatNumber>
                </Stat>
              </CardBody>
            </Card>
            <Card bg="red.50" borderColor="red.200">
              <CardBody>
                <Stat>
                  <StatLabel>Total a Pagar (Fin de Mes)</StatLabel>
                  <StatNumber color="red.500">S/ {calculateTotalPending().toFixed(2)}</StatNumber>
                  <StatHelpText color="red.600">
                    {vouchers.filter(v => v.status === 'pending').length} vales pendientes
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>
        )}

        {/* Filtros */}
        <Card>
          <CardBody>
            <HStack spacing={4}>
              <Text fontWeight="bold">Filtrar por estado:</Text>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                maxW="200px"
              >
                <option value="all">Todos</option>
                <option value="pending">Pendientes</option>
                <option value="delivered">Entregados</option>
                <option value="paid">Pagados</option>
              </Select>
            </HStack>
          </CardBody>
        </Card>

        {/* Pedidos Recientes */}
        <Card>
          <CardHeader>
            <Heading size="md">
              <Icon as={FaShoppingCart} mr={2} />
              Mis Pedidos Recientes
            </Heading>
          </CardHeader>
          <CardBody>
            {orders.length === 0 ? (
              <Box textAlign="center" py={10}>
                <Text color="gray.500" fontSize="lg">
                  No tienes pedidos registrados
                </Text>
                <Button
                  as={Link}
                  to="/client-dashboard/order"
                  colorScheme="blue"
                  mt={4}
                  leftIcon={<FaShoppingCart />}
                >
                  Hacer mi primer pedido
                </Button>
              </Box>
            ) : (
              <TableContainer>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>ID</Th>
                      <Th>Total</Th>
                      <Th>Estado</Th>
                      <Th>Fecha</Th>
                      <Th>Acciones</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {orders.slice(0, 5).map((order) => (
                      <Tr key={order.id}>
                        <Td>
                          <Text fontWeight="bold">#{order.id}</Text>
                        </Td>
                        <Td>
                          <Text fontWeight="bold" color="blue.600">
                            S/ {(parseFloat(order.subtotal || 0) + parseFloat(order.deliveryFee || 0)).toFixed(2)}
                          </Text>
                        </Td>
                        <Td>
                          <Badge colorScheme={
                            order.status === 'pendiente' ? 'yellow' :
                            order.status === 'entregado' ? 'blue' :
                            order.status === 'pagado' ? 'green' : 'gray'
                          }>
                            {order.status === 'pendiente' ? 'Pendiente' :
                             order.status === 'entregado' ? 'Entregado' :
                             order.status === 'pagado' ? 'Pagado' : order.status}
                          </Badge>
                        </Td>
                        <Td>
                          <Text fontSize="sm">
                            {formatDate(order.createdAt)}
                          </Text>
                        </Td>
                        <Td>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleViewOrderDetails(order)}
                          >
                            Ver Detalles
                          </Button>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            )}
          </CardBody>
        </Card>


        {/* Botón para hacer pedido rápido */}
        <Card>
          <CardBody textAlign="center">
            <VStack spacing={4}>
              <Icon as={FaShoppingCart} fontSize="3xl" color="blue.500" />
              <Heading size="md">¿Necesitas hacer un pedido?</Heading>
              <Text color="gray.600">
                Puedes hacer un pedido rápido directamente desde aquí
              </Text>
              <Button
                colorScheme="blue"
                leftIcon={<FaShoppingCart />}
                onClick={() => window.open('/guest-order', '_blank')}
              >
                Pedido Rápido
              </Button>
            </VStack>
          </CardBody>
        </Card>

        {/* Modal de detalles del pedido */}
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Detalles del Pedido #{selectedOrder?.id}</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              {selectedOrder && (
                <VStack spacing={4} align="stretch">
                  <SimpleGrid columns={3} spacing={4}>
                    <Box>
                      <Text fontWeight="bold" color="gray.600">Estado:</Text>
                      <Badge colorScheme={
                        selectedOrder.status === 'pendiente' ? 'yellow' :
                        selectedOrder.status === 'entregado' ? 'blue' :
                        selectedOrder.status === 'pagado' ? 'green' : 'gray'
                      }>
                        {selectedOrder.status === 'pendiente' ? 'Pendiente' :
                         selectedOrder.status === 'entregado' ? 'Entregado' :
                         selectedOrder.status === 'pagado' ? 'Pagado' : selectedOrder.status}
                      </Badge>
                    </Box>
                    <Box>
                      <Text fontWeight="bold" color="gray.600">Método de Pago:</Text>
                      <Text>{selectedOrder.paymentMethod}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="bold" color="gray.600">Subtotal:</Text>
                      <Text fontSize="md" fontWeight="bold" color="green.600">
                        S/ {parseFloat(selectedOrder.subtotal || 0).toFixed(2)}
                      </Text>
                    </Box>
                    <Box>
                      <Text fontWeight="bold" color="gray.600">Flete:</Text>
                      <Text fontSize="md" fontWeight="bold" color="orange.600">
                        S/ {parseFloat(selectedOrder.deliveryFee || 0).toFixed(2)}
                      </Text>
                    </Box>
                    <Box>
                      <Text fontWeight="bold" color="gray.600">Total:</Text>
                      <Text fontSize="lg" fontWeight="bold" color="blue.600">
                        S/ {(parseFloat(selectedOrder.subtotal || 0) + parseFloat(selectedOrder.deliveryFee || 0)).toFixed(2)}
                      </Text>
                    </Box>
                    <Box>
                      <Text fontWeight="bold" color="gray.600">Fecha:</Text>
                      <Text>{formatDate(selectedOrder.createdAt)}</Text>
                    </Box>
                  </SimpleGrid>
                  
                  <Box>
                    <Text fontWeight="bold" color="gray.600">Dirección de Entrega:</Text>
                    <Text>{selectedOrder.deliveryAddress}</Text>
                    {selectedOrder.deliveryDistrict && (
                      <Text fontSize="sm" color="gray.600">
                        Distrito: {selectedOrder.deliveryDistrict}
                      </Text>
                    )}
                  </Box>

                  {selectedOrder.notes && (
                    <Box>
                      <Text fontWeight="bold" color="gray.600">Notas:</Text>
                      <Text>{selectedOrder.notes}</Text>
                    </Box>
                  )}

                  {selectedOrder.orderDetails && selectedOrder.orderDetails.length > 0 && (
                    <Box>
                      <Text fontWeight="bold" color="gray.600" mb={2}>Productos:</Text>
                      <TableContainer>
                        <Table size="sm">
                          <Thead>
                            <Tr>
                              <Th>Producto</Th>
                              <Th>Cantidad</Th>
                              <Th>Precio Unit.</Th>
                              <Th>Subtotal</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {selectedOrder.orderDetails.map((detail, index) => (
                              <Tr key={index}>
                                <Td>{detail.product?.name || 'Producto'}</Td>
                                <Td>{detail.quantity}</Td>
                                <Td>S/ {parseFloat(detail.unitPrice).toFixed(2)}</Td>
                                <Td fontWeight="bold">S/ {parseFloat(detail.subtotal).toFixed(2)}</Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </TableContainer>
                    </Box>
                  )}
                </VStack>
              )}
            </ModalBody>
          </ModalContent>
        </Modal>
      </VStack>
    </Box>
  );
};

export default ClientDashboard;
