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
  TableContainer
} from '@chakra-ui/react';
import {
  FaGift,
  FaUser,
  FaBox,
  FaCheckCircle,
  FaClock,
  FaMoneyBillWave,
  FaEnvelope,
  FaBell
} from 'react-icons/fa';
import axios from '../utils/axios';

const VouchersManagement = () => {
  const [vouchers, setVouchers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sendingNotifications, setSendingNotifications] = useState(false);
  const toast = useToast();

  useEffect(() => {
    console.log('🚀 Iniciando carga de vales...');
    setLoading(true);
    fetchVouchers();
    fetchStats();
  }, [statusFilter]);

  const fetchVouchers = async () => {
    try {
      console.log('🔍 Intentando cargar vales...');
      console.log('🔑 Token actual:', localStorage.getItem('token'));
      const response = await axios.get('/api/vouchers', {
        params: { status: statusFilter === 'all' ? undefined : statusFilter }
      });
      console.log('✅ Vales cargados:', response.data);
      setVouchers(response.data.data || []);
    } catch (error) {
      console.error('❌ Error al cargar vales:', error);
      console.error('❌ Detalles del error:', error.response?.data);
      console.error('❌ Status del error:', error.response?.status);
      setVouchers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      console.log('📊 Intentando cargar estadísticas...');
      const response = await axios.get('/api/vouchers/stats');
      console.log('✅ Estadísticas cargadas:', response.data);
      setStats(response.data.data);
    } catch (error) {
      console.error('❌ Error al cargar estadísticas:', error);
      console.error('❌ Detalles del error:', error.response?.data);
      setStats(null);
    }
  };

  const updateVoucherStatus = async (voucherId, status) => {
    try {
      await axios.put(`/api/vouchers/${voucherId}/status`, { status });
      toast({
        title: 'Estado actualizado',
        description: 'El estado del vale se ha actualizado correctamente',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchVouchers();
      fetchStats();
    } catch (error) {
      console.error('Error al actualizar estado del vale:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el estado del vale',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const sendMonthlyReminders = async () => {
    setSendingNotifications(true);
    try {
      const response = await axios.post('/api/notifications/monthly-reminders');
      
      if (response.data.success) {
        toast({
          title: 'Notificaciones enviadas',
          description: `Se enviaron recordatorios a ${response.data.data.length} clientes`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error al enviar notificaciones:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron enviar las notificaciones',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSendingNotifications(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'green';
      case 'delivered': return 'blue';
      case 'pending': return 'orange';
      default: return 'gray';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'paid': return 'Pagado';
      case 'delivered': return 'Entregado';
      case 'pending': return 'Pendiente';
      default: return 'Desconocido';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
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
                <Icon as={FaGift} mr={2} />
                Gestión de Vales
              </Heading>
              <Text color="gray.600">
                Administra los vales de clientes frecuentes
              </Text>
            </VStack>
            <Button
              leftIcon={<FaBell />}
              colorScheme="orange"
              onClick={sendMonthlyReminders}
              isLoading={sendingNotifications}
              loadingText="Enviando..."
            >
              Enviar Recordatorios
            </Button>
          </HStack>
        </Box>

        {/* Estadísticas */}
        {stats && (
          <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Total Vales</StatLabel>
                  <StatNumber>{stats.totalVouchers}</StatNumber>
                </Stat>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Pendientes</StatLabel>
                  <StatNumber color="orange.500">{stats.pendingVouchers}</StatNumber>
                </Stat>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Entregados</StatLabel>
                  <StatNumber color="blue.500">{stats.deliveredVouchers}</StatNumber>
                </Stat>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Pagados</StatLabel>
                  <StatNumber color="green.500">{stats.paidVouchers}</StatNumber>
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

        {/* Tabla de vales */}
        <Card>
          <CardHeader>
            <Heading size="md">Lista de Vales</Heading>
          </CardHeader>
          <CardBody>
            {vouchers.length === 0 ? (
              <Center py={10}>
                <Text color="gray.500" fontSize="lg">
                  No hay vales registrados
                </Text>
              </Center>
            ) : (
              <TableContainer>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>ID</Th>
                      <Th>Cliente</Th>
                      <Th>Producto</Th>
                      <Th>Cantidad</Th>
                      <Th>Total</Th>
                      <Th>Estado</Th>
                      <Th>Repartidor</Th>
                      <Th>Fecha</Th>
                      <Th>Acciones</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {vouchers.map((voucher) => (
                      <Tr key={voucher.id}>
                        <Td fontWeight="bold">#{voucher.id}</Td>
                        <Td>
                          <HStack>
                            <Icon as={FaUser} color="gray.500" />
                            <Text>{voucher.client?.username}</Text>
                          </HStack>
                        </Td>
                        <Td>
                          <HStack>
                            <Icon as={FaBox} color="gray.500" />
                            <Text>{voucher.product?.name}</Text>
                          </HStack>
                        </Td>
                        <Td>{voucher.quantity}</Td>
                        <Td fontWeight="bold" color="blue.600">
                          S/ {parseFloat(voucher.totalAmount || 0).toFixed(2)}
                        </Td>
                        <Td>
                          <Badge colorScheme={getStatusColor(voucher.status)}>
                            {getStatusText(voucher.status)}
                          </Badge>
                        </Td>
                        <Td>{voucher.deliveryPerson?.username || 'N/A'}</Td>
                        <Td fontSize="sm" color="gray.600">
                          {formatDate(voucher.createdAt)}
                        </Td>
                        <Td>
                          <HStack spacing={2}>
                            {voucher.status === 'pending' && (
                              <Button
                                size="sm"
                                colorScheme="blue"
                                leftIcon={<FaCheckCircle />}
                                onClick={() => updateVoucherStatus(voucher.id, 'delivered')}
                              >
                                Entregar
                              </Button>
                            )}
                            {voucher.status === 'delivered' && (
                              <Button
                                size="sm"
                                colorScheme="green"
                                leftIcon={<FaMoneyBillWave />}
                                onClick={() => updateVoucherStatus(voucher.id, 'paid')}
                              >
                                Marcar Pagado
                              </Button>
                            )}
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            )}
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};

export default VouchersManagement;
