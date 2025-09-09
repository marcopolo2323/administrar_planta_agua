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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Textarea,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Divider,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer
} from '@chakra-ui/react';
import {
  FaDollarSign,
  FaExclamationTriangle,
  FaCheckCircle,
  FaClock,
  FaUser,
  FaPhone,
  FaMapMarkerAlt,
  FaEye,
  FaCheck,
  FaCalendarAlt
} from 'react-icons/fa';
import axios from '../utils/axios';
import { useRole } from '../hooks/useRole';

const ClientPaymentsAdmin = () => {
  const [stats, setStats] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [markingPaid, setMarkingPaid] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [paymentForm, setPaymentForm] = useState({
    paymentMethod: 'efectivo',
    paymentReference: '',
    notes: ''
  });

  const { isOpen: isDetailsOpen, onOpen: onDetailsOpen, onClose: onDetailsClose } = useDisclosure();
  const { isOpen: isPaymentOpen, onOpen: onPaymentOpen, onClose: onPaymentClose } = useDisclosure();
  const toast = useToast();
  const { user } = useRole();

  useEffect(() => {
    fetchPaymentStats();
  }, []);

  const fetchPaymentStats = async () => {
    try {
      setLoading(true);
      console.log('🔍 Obteniendo estadísticas de pagos...');
      
      const response = await axios.get('/api/client-payments/stats');
      
      if (response.data.success) {
        setStats(response.data.data);
        console.log('📊 Estadísticas obtenidas:', response.data.data);
      } else {
        console.warn('⚠️ Respuesta sin éxito:', response.data);
        toast({
          title: 'Advertencia',
          description: response.data.message || 'No se pudieron cargar las estadísticas',
          status: 'warning',
          duration: 3000,
          isClosable: true
        });
      }
    } catch (error) {
      console.error('❌ Error al obtener estadísticas:', error);
      
      let errorMessage = 'No se pudieron cargar las estadísticas de pagos';
      
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = 'Sesión expirada. Por favor, inicia sesión nuevamente.';
        } else if (error.response.status === 403) {
          errorMessage = 'No tienes permisos para acceder a esta página.';
        } else if (error.response.status === 500) {
          errorMessage = 'Error del servidor. Intenta nuevamente.';
        } else {
          errorMessage = error.response.data?.message || errorMessage;
        }
      } else if (error.request) {
        errorMessage = 'No se pudo conectar con el servidor.';
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchClientDetails = async (clientId) => {
    try {
      setDetailsLoading(true);
      console.log(`🔍 Obteniendo detalles del cliente ${clientId}...`);
      
      const response = await axios.get(`/api/client-payments/client/${clientId}/details`);
      
      if (response.data.success) {
        setSelectedClient(response.data.data);
        onDetailsOpen();
        console.log('📋 Detalles obtenidos:', response.data.data);
      }
    } catch (error) {
      console.error('❌ Error al obtener detalles:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los detalles del cliente',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    } finally {
      setDetailsLoading(false);
    }
  };

  const markVouchersAsPaid = async () => {
    try {
      setMarkingPaid(true);
      console.log(`💰 Marcando vales como pagados para cliente ${selectedClient.client.id}...`);
      
      const response = await axios.put(`/api/client-payments/client/${selectedClient.client.id}/mark-paid`, {
        paymentMethod: paymentForm.paymentMethod,
        paymentReference: paymentForm.paymentReference,
        notes: paymentForm.notes
      });
      
      if (response.data.success) {
        toast({
          title: 'Éxito',
          description: `Vales marcados como pagados: ${response.data.data.vouchersPaid} vales, S/ ${response.data.data.totalAmount.toFixed(2)}`,
          status: 'success',
          duration: 5000,
          isClosable: true
        });
        
        onPaymentClose();
        onDetailsClose();
        setSelectedClient(null);
        setPaymentForm({ paymentMethod: 'efectivo', paymentReference: '', notes: '' });
        fetchPaymentStats();
      }
    } catch (error) {
      console.error('❌ Error al marcar vales como pagados:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron marcar los vales como pagados',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    } finally {
      setMarkingPaid(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'green';
      default: return 'gray';
    }
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case 'high': return 'Alta';
      case 'medium': return 'Media';
      case 'low': return 'Baja';
      default: return 'Normal';
    }
  };

  const filteredClients = stats?.clients?.filter(client => {
    if (priorityFilter === 'all') return true;
    return client.priority === priorityFilter;
  }) || [];

  if (loading) {
    return (
      <Center h="400px">
        <VStack spacing={4}>
          <Spinner size="xl" />
          <Text>Cargando estadísticas de pagos...</Text>
        </VStack>
      </Center>
    );
  }

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Card>
          <CardHeader>
            <VStack align="start" spacing={2}>
              <Heading size="lg">
                <Icon as={FaDollarSign} mr={2} />
                Administración de Pagos de Clientes Frecuentes
              </Heading>
              <Text color="gray.600">
                Monitorea y gestiona los pagos pendientes de clientes frecuentes
              </Text>
            </VStack>
          </CardHeader>
        </Card>

        {/* Alertas de fin de mes */}
        {stats?.isEndOfMonth && (
          <Alert status="warning">
            <AlertIcon />
            <Box>
              <AlertTitle>¡Fin de mes próximo!</AlertTitle>
              <AlertDescription>
                Quedan {stats.daysUntilEndOfMonth} días para el fin de mes. 
                Los clientes deben pagar sus vales pendientes.
              </AlertDescription>
            </Box>
          </Alert>
        )}

        {/* Estadísticas generales */}
        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Clientes con Vales Pendientes</StatLabel>
                <StatNumber color="blue.500">{stats?.totalClientsWithPending || 0}</StatNumber>
                <StatHelpText>Total de clientes</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Monto Total Pendiente</StatLabel>
                <StatNumber color="orange.500">S/ {stats?.totalPendingAmount?.toFixed(2) || '0.00'}</StatNumber>
                <StatHelpText>Por cobrar</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Clientes Vencidos</StatLabel>
                <StatNumber color="red.500">{stats?.overdueClients || 0}</StatNumber>
                <StatHelpText>Más de 30 días</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Prioridad Alta</StatLabel>
                <StatNumber color="red.500">{stats?.highPriorityClients || 0}</StatNumber>
                <StatHelpText>Requieren atención</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Filtros */}
        <Card>
          <CardBody>
            <HStack spacing={4}>
              <Text fontWeight="bold">Filtrar por prioridad:</Text>
              <Select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                maxW="200px"
              >
                <option value="all">Todas</option>
                <option value="high">Alta</option>
                <option value="medium">Media</option>
                <option value="low">Baja</option>
              </Select>
            </HStack>
          </CardBody>
        </Card>

        {/* Lista de clientes */}
        <VStack spacing={4} align="stretch">
          {filteredClients.length === 0 ? (
            <Card>
              <CardBody textAlign="center" py={10}>
                <Text color="gray.500" fontSize="lg">
                  No hay clientes con vales pendientes
                </Text>
              </CardBody>
            </Card>
          ) : (
            filteredClients.map((client) => (
              <Card key={client.id}>
                <CardBody>
                  <Flex justify="space-between" align="start">
                    <VStack align="start" spacing={2} flex={1}>
                      <HStack>
                        <Text fontWeight="bold" fontSize="lg">
                          {client.name}
                        </Text>
                        <Badge colorScheme={getPriorityColor(client.priority)}>
                          {getPriorityText(client.priority)}
                        </Badge>
                        {client.isOverdue && (
                          <Badge colorScheme="red">
                            <Icon as={FaExclamationTriangle} mr={1} />
                            Vencido
                          </Badge>
                        )}
                      </HStack>
                      
                      <HStack>
                        <Icon as={FaUser} color="gray.500" />
                        <Text fontSize="sm" color="gray.600">
                          {client.email}
                        </Text>
                      </HStack>
                      
                      <HStack>
                        <Icon as={FaPhone} color="gray.500" />
                        <Text fontSize="sm" color="gray.600">
                          {client.phone}
                        </Text>
                      </HStack>
                      
                      <HStack>
                        <Icon as={FaMapMarkerAlt} color="gray.500" />
                        <Text fontSize="sm" color="gray.600">
                          {client.district}
                        </Text>
                      </HStack>
                      
                      <HStack spacing={4}>
                        <Text fontSize="sm" color="blue.600" fontWeight="bold">
                          💳 {client.pendingVouchers} vales pendientes
                        </Text>
                        <Text fontSize="sm" color="red.600" fontWeight="bold">
                          💰 S/ {client.totalPending.toFixed(2)}
                        </Text>
                        {client.daysSinceOldestVoucher > 0 && (
                          <Text fontSize="sm" color="orange.600" fontWeight="bold">
                            <Icon as={FaClock} mr={1} />
                            {client.daysSinceOldestVoucher} días
                          </Text>
                        )}
                      </HStack>
                    </VStack>
                    
                    <VStack spacing={2}>
                      <Button
                        size="sm"
                        colorScheme="blue"
                        leftIcon={<FaEye />}
                        onClick={() => fetchClientDetails(client.id)}
                        isLoading={detailsLoading}
                      >
                        Ver Detalles
                      </Button>
                    </VStack>
                  </Flex>
                </CardBody>
              </Card>
            ))
          )}
        </VStack>

        {/* Modal de detalles del cliente */}
        <Modal isOpen={isDetailsOpen} onClose={onDetailsClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              Detalles de Vales - {selectedClient?.client?.name}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {selectedClient && (
                <VStack spacing={4} align="stretch">
                  {/* Información del cliente */}
                  <Card>
                    <CardBody>
                      <VStack align="start" spacing={2}>
                        <Text fontWeight="bold">Información del Cliente</Text>
                        <HStack>
                          <Icon as={FaUser} color="gray.500" />
                          <Text>{selectedClient.client.name}</Text>
                        </HStack>
                        <HStack>
                          <Icon as={FaPhone} color="gray.500" />
                          <Text>{selectedClient.client.phone}</Text>
                        </HStack>
                        <HStack>
                          <Icon as={FaMapMarkerAlt} color="gray.500" />
                          <Text>{selectedClient.client.district}</Text>
                        </HStack>
                      </VStack>
                    </CardBody>
                  </Card>

                  {/* Resumen */}
                  <Card>
                    <CardBody>
                      <VStack align="start" spacing={2}>
                        <Text fontWeight="bold">Resumen</Text>
                        <HStack justify="space-between" w="full">
                          <Text>Total de vales:</Text>
                          <Text fontWeight="bold">{selectedClient.summary.totalVouchers}</Text>
                        </HStack>
                        <HStack justify="space-between" w="full">
                          <Text>Monto total pendiente:</Text>
                          <Text fontWeight="bold" color="red.600">
                            S/ {selectedClient.summary.totalAmount.toFixed(2)}
                          </Text>
                        </HStack>
                        <HStack justify="space-between" w="full">
                          <Text>Vale más antiguo:</Text>
                          <Text>
                            {selectedClient.summary.oldestVoucher 
                              ? new Date(selectedClient.summary.oldestVoucher).toLocaleDateString()
                              : 'N/A'
                            }
                          </Text>
                        </HStack>
                        <HStack justify="space-between" w="full">
                          <Text>Vale más reciente:</Text>
                          <Text>
                            {selectedClient.summary.newestVoucher 
                              ? new Date(selectedClient.summary.newestVoucher).toLocaleDateString()
                              : 'N/A'
                            }
                          </Text>
                        </HStack>
                      </VStack>
                    </CardBody>
                  </Card>

                  {/* Lista de vales */}
                  <Card>
                    <CardHeader>
                      <Text fontWeight="bold">Vales Pendientes</Text>
                    </CardHeader>
                    <CardBody>
                      <TableContainer>
                        <Table size="sm">
                          <Thead>
                            <Tr>
                              <Th>ID Vale</Th>
                              <Th>Fecha</Th>
                              <Th>N° Pedido</Th>
                              <Th>Monto</Th>
                              <Th>Estado</Th>
                              <Th>Dirección de Entrega</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {selectedClient.pendingVouchers.length === 0 ? (
                              <Tr>
                                <Td colSpan={6} textAlign="center" py={8}>
                                  <VStack spacing={2}>
                                    <Text color="gray.500" fontSize="sm">
                                      No hay vales pendientes para este cliente
                                    </Text>
                                  </VStack>
                                </Td>
                              </Tr>
                            ) : (
                              selectedClient.pendingVouchers.map((voucher) => (
                                <Tr key={voucher.id}>
                                  <Td>{voucher.id}</Td>
                                  <Td>{new Date(voucher.createdAt).toLocaleDateString()}</Td>
                                  <Td>{voucher.orderId ? `#${voucher.orderId}` : 'N/A'}</Td>
                                  <Td>S/ {voucher.totalAmount.toFixed(2)}</Td>
                                  <Td>
                                    <Badge 
                                      colorScheme={voucher.status === 'pending' ? 'orange' : 'green'}
                                      fontSize="xs"
                                    >
                                      {voucher.status === 'pending' ? 'Pendiente' : 'Pagado'}
                                    </Badge>
                                  </Td>
                                  <Td>
                                    {voucher.deliveryAddress ? (
                                      <VStack align="start" spacing={1}>
                                        <Text fontSize="sm">{voucher.deliveryAddress}</Text>
                                        <Text fontSize="xs" color="gray.500">{voucher.deliveryDistrict}</Text>
                                      </VStack>
                                    ) : (
                                      <Text fontSize="sm" color="gray.500">N/A</Text>
                                    )}
                                  </Td>
                                </Tr>
                              ))
                            )}
                          </Tbody>
                        </Table>
                      </TableContainer>
                    </CardBody>
                  </Card>
                </VStack>
              )}
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onDetailsClose}>
                Cerrar
              </Button>
              <Button
                colorScheme="green"
                leftIcon={<FaCheck />}
                onClick={onPaymentOpen}
              >
                Marcar como Pagado
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Modal de marcar como pagado */}
        <Modal isOpen={isPaymentOpen} onClose={onPaymentClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              Marcar Vales como Pagados
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4} align="stretch">
                <Alert status="info">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>Confirmar Pago</AlertTitle>
                    <AlertDescription>
                      Se marcarán {selectedClient?.summary?.totalVouchers} vales como pagados 
                      por un total de S/ {selectedClient?.summary?.totalAmount?.toFixed(2)}
                    </AlertDescription>
                  </Box>
                </Alert>

                <Select
                  placeholder="Método de pago"
                  value={paymentForm.paymentMethod}
                  onChange={(e) => setPaymentForm({...paymentForm, paymentMethod: e.target.value})}
                >
                  <option value="efectivo">Efectivo</option>
                  <option value="tarjeta">Tarjeta</option>
                  <option value="yape">Yape</option>
                  <option value="transferencia">Transferencia</option>
                </Select>

                <Textarea
                  placeholder="Referencia de pago (opcional)"
                  value={paymentForm.paymentReference}
                  onChange={(e) => setPaymentForm({...paymentForm, paymentReference: e.target.value})}
                />

                <Textarea
                  placeholder="Notas adicionales (opcional)"
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({...paymentForm, notes: e.target.value})}
                />
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onPaymentClose}>
                Cancelar
              </Button>
              <Button
                colorScheme="green"
                leftIcon={<FaCheck />}
                onClick={markVouchersAsPaid}
                isLoading={markingPaid}
              >
                Confirmar Pago
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </VStack>
    </Box>
  );
};

export default ClientPaymentsAdmin;
