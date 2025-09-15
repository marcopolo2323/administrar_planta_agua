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
  useToast,
  Select,
  Flex,
  Icon,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Input,
  Alert,
  AlertIcon,
  Divider,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText
} from '@chakra-ui/react';
import {
  FaMoneyBillWave,
  FaCalendarAlt,
  FaUser,
  FaBox,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaEye,
  FaPlus
} from 'react-icons/fa';
import axios from '../utils/axios';

const CreditsManagement = () => {
  const toast = useToast();
  
  // Estados principales
  const [activeTab, setActiveTab] = useState('vouchers'); // 'vouchers', 'subscriptions'
  const [loading, setLoading] = useState(true);
  
  // Estados para vales
  const [vouchers, setVouchers] = useState([]);
  const [voucherFilter, setVoucherFilter] = useState('all');
  const [selectedClient, setSelectedClient] = useState('');
  const [clients, setClients] = useState([]);
  
  // Estados para suscripciones
  const [subscriptions, setSubscriptions] = useState([]);
  const [subscriptionFilter, setSubscriptionFilter] = useState('active');
  
  // Modales
  const { isOpen: isPaymentOpen, onOpen: onPaymentOpen, onClose: onPaymentClose } = useDisclosure();
  const [selectedVouchers, setSelectedVouchers] = useState([]);
  const [paymentForm, setPaymentForm] = useState({
    paymentMethod: '',
    paymentReference: '',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchVouchers(),
        fetchSubscriptions(),
        fetchClients()
      ]);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVouchers = async () => {
    try {
      const response = await axios.get('/api/vouchers');
      setVouchers(response.data.data || []);
    } catch (error) {
      console.error('Error al cargar vales:', error);
    }
  };

  const fetchSubscriptions = async () => {
    try {
      const response = await axios.get('/api/subscriptions');
      setSubscriptions(response.data || []);
    } catch (error) {
      console.error('Error al cargar suscripciones:', error);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await axios.get('/api/clients');
      setClients(response.data || []);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
    }
  };

  // Filtrar vales
  const filteredVouchers = vouchers.filter(voucher => {
    const matchesStatus = voucherFilter === 'all' || voucher.status === voucherFilter;
    const matchesClient = !selectedClient || voucher.clientId === parseInt(selectedClient);
    return matchesStatus && matchesClient;
  });

  // Filtrar suscripciones
  const filteredSubscriptions = subscriptions.filter(subscription => {
    return subscriptionFilter === 'all' || subscription.status === subscriptionFilter;
  });

  // Estadísticas de vales
  const voucherStats = {
    total: vouchers.length,
    pending: vouchers.filter(v => v.status === 'pending').length,
    delivered: vouchers.filter(v => v.status === 'delivered').length,
    paid: vouchers.filter(v => v.status === 'paid').length,
    totalPending: vouchers
      .filter(v => v.status === 'pending')
      .reduce((sum, v) => sum + parseFloat(v.totalAmount || 0), 0)
  };

  // Estadísticas de suscripciones
  const subscriptionStats = {
    total: subscriptions.length,
    active: subscriptions.filter(s => s.status === 'active').length,
    completed: subscriptions.filter(s => s.status === 'completed').length,
    cancelled: subscriptions.filter(s => s.status === 'cancelled').length,
    totalRevenue: subscriptions
      .filter(s => s.status === 'active')
      .reduce((sum, s) => sum + parseFloat(s.monthlyPrice || 0), 0)
  };

  const getVoucherStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'orange';
      case 'delivered': return 'blue';
      case 'paid': return 'green';
      default: return 'gray';
    }
  };

  const getVoucherStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'delivered': return 'Entregado';
      case 'paid': return 'Pagado';
      default: return status;
    }
  };

  const getSubscriptionStatusColor = (status) => {
    switch (status) {
      case 'active': return 'green';
      case 'paused': return 'yellow';
      case 'completed': return 'blue';
      case 'cancelled': return 'red';
      case 'expired': return 'gray';
      default: return 'gray';
    }
  };

  const getSubscriptionStatusText = (status) => {
    switch (status) {
      case 'active': return 'Activa';
      case 'paused': return 'Pausada';
      case 'completed': return 'Completada';
      case 'cancelled': return 'Cancelada';
      case 'expired': return 'Expirada';
      default: return status;
    }
  };

  const handleProcessPayment = async () => {
    if (selectedVouchers.length === 0) {
      toast({
        title: 'Error',
        description: 'Selecciona al menos un vale para procesar',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      // Procesar pago para cada vale seleccionado
      for (const voucherId of selectedVouchers) {
        await axios.put(`/api/vouchers/${voucherId}/status`, {
          status: 'paid',
          paymentMethod: paymentForm.paymentMethod,
          paymentReference: paymentForm.paymentReference,
          notes: paymentForm.notes
        });
      }

      toast({
        title: 'Pagos procesados',
        description: `${selectedVouchers.length} vales marcados como pagados`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      setSelectedVouchers([]);
      setPaymentForm({ paymentMethod: '', paymentReference: '', notes: '' });
      onPaymentClose();
      fetchVouchers();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron procesar los pagos',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const openPaymentModal = (voucherIds) => {
    setSelectedVouchers(voucherIds);
    setPaymentForm({ paymentMethod: '', paymentReference: '', notes: '' });
    onPaymentOpen();
  };

  // Renderizar tarjeta de vale
  const renderVoucherCard = (voucher) => (
    <Card key={voucher.id} variant="outline" size="sm">
      <CardBody>
        <VStack spacing={3} align="stretch">
          <HStack justify="space-between">
            <Text fontWeight="bold" fontSize="sm">
              Vale #{voucher.id}
            </Text>
            <Badge colorScheme={getVoucherStatusColor(voucher.status)}>
              {getVoucherStatusText(voucher.status)}
            </Badge>
          </HStack>

          <VStack spacing={2} align="stretch">
            <HStack spacing={2}>
              <FaUser size={12} color="#718096" />
              <Text fontSize="sm">
                {voucher.Client?.name || 'Cliente no encontrado'}
              </Text>
            </HStack>
            
            <HStack spacing={2}>
              <FaBox size={12} color="#718096" />
              <Text fontSize="sm">
                {voucher.product?.name || 'Producto no especificado'}
              </Text>
            </HStack>
            
            <HStack spacing={2}>
              <Text fontSize="sm">Cantidad:</Text>
              <Text fontWeight="bold">{voucher.quantity}</Text>
            </HStack>
            
            <HStack justify="space-between">
              <Text fontSize="sm">Total:</Text>
              <Text fontWeight="bold" color="green.600">
                S/ {parseFloat(voucher.totalAmount).toFixed(2)}
              </Text>
            </HStack>
          </VStack>

          {voucher.notes && (
            <Alert status="info" size="sm">
              <AlertIcon />
              <Text fontSize="xs">{voucher.notes}</Text>
            </Alert>
          )}

          <HStack spacing={2} justify="center">
            {voucher.status === 'pending' && (
              <Button
                size="sm"
                colorScheme="blue"
                onClick={() => openPaymentModal([voucher.id])}
              >
                Marcar como Pagado
              </Button>
            )}
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  );

  // Renderizar tarjeta de suscripción
  const renderSubscriptionCard = (subscription) => (
    <Card key={subscription.id} variant="outline" size="sm">
      <CardBody>
        <VStack spacing={3} align="stretch">
          <HStack justify="space-between">
            <Text fontWeight="bold" fontSize="sm">
              {subscription.planName}
            </Text>
            <Badge colorScheme={getSubscriptionStatusColor(subscription.status)}>
              {getSubscriptionStatusText(subscription.status)}
            </Badge>
          </HStack>

          <VStack spacing={2} align="stretch">
            <HStack spacing={2}>
              <FaUser size={12} color="#718096" />
              <Text fontSize="sm">
                Cliente ID: {subscription.clientId}
              </Text>
            </HStack>
            
            <HStack spacing={2}>
              <FaBox size={12} color="#718096" />
              <Text fontSize="sm">
                Bidones: {subscription.bottlesDelivered}/{subscription.totalBottlesWithBonus}
              </Text>
            </HStack>
            
            <HStack justify="space-between">
              <Text fontSize="sm">Precio mensual:</Text>
              <Text fontWeight="bold" color="green.600">
                S/ {parseFloat(subscription.monthlyPrice).toFixed(2)}
              </Text>
            </HStack>

            <HStack justify="space-between">
              <Text fontSize="sm">Vencimiento:</Text>
              <Text fontSize="sm">
                {new Date(subscription.endDate).toLocaleDateString()}
              </Text>
            </HStack>
          </VStack>

          {subscription.notes && (
            <Alert status="info" size="sm">
              <AlertIcon />
              <Text fontSize="xs">{subscription.notes}</Text>
            </Alert>
          )}
        </VStack>
      </CardBody>
    </Card>
  );

  // Modal de procesamiento de pago
  const renderPaymentModal = () => (
    <Modal isOpen={isPaymentOpen} onClose={onPaymentClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Procesar Pago de Vales</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <Alert status="info">
              <AlertIcon />
              <Text fontSize="sm">
                Procesando pago para {selectedVouchers.length} vale(s)
              </Text>
            </Alert>

            <FormControl isRequired>
              <FormLabel>Método de Pago</FormLabel>
              <Select
                value={paymentForm.paymentMethod}
                onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                placeholder="Selecciona el método de pago"
              >
                <option value="efectivo">Efectivo</option>
                <option value="plin">PLIN</option>
                <option value="transferencia">Transferencia Bancaria</option>
                <option value="tarjeta">Tarjeta de Crédito/Débito</option>
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Referencia de Pago</FormLabel>
              <Input
                value={paymentForm.paymentReference}
                onChange={(e) => setPaymentForm({ ...paymentForm, paymentReference: e.target.value })}
                placeholder="Número de operación, referencia, etc."
              />
            </FormControl>

            <FormControl>
              <FormLabel>Notas</FormLabel>
              <Input
                value={paymentForm.notes}
                onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                placeholder="Observaciones adicionales..."
              />
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" mr={3} onClick={onPaymentClose}>
            Cancelar
          </Button>
          <Button 
            colorScheme="green" 
            onClick={handleProcessPayment}
            isDisabled={!paymentForm.paymentMethod}
          >
            Procesar Pago
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );

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
          <Heading size="lg" mb={2}>
            Gestión de Créditos
          </Heading>
          <Text color="gray.600">
            Administra vales y suscripciones de clientes
          </Text>
        </Box>

        {/* Tabs */}
        <Tabs index={activeTab === 'vouchers' ? 0 : 1} onChange={(index) => setActiveTab(index === 0 ? 'vouchers' : 'subscriptions')}>
          <TabList>
            <Tab>
              <HStack spacing={2}>
                <FaMoneyBillWave />
                <Text>Vales ({vouchers.length})</Text>
              </HStack>
            </Tab>
            <Tab>
              <HStack spacing={2}>
                <FaCalendarAlt />
                <Text>Suscripciones ({subscriptions.length})</Text>
              </HStack>
            </Tab>
          </TabList>

          <TabPanels>
            {/* Tab de Vales */}
            <TabPanel px={0}>
              <VStack spacing={6} align="stretch">
                {/* Estadísticas de vales */}
                <SimpleGrid columns={{ base: 2, md: 5 }} spacing={4}>
                  <Stat>
                    <StatLabel>Total Vales</StatLabel>
                    <StatNumber>{voucherStats.total}</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>Pendientes</StatLabel>
                    <StatNumber color="orange.500">{voucherStats.pending}</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>Entregados</StatLabel>
                    <StatNumber color="blue.500">{voucherStats.delivered}</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>Pagados</StatLabel>
                    <StatNumber color="green.500">{voucherStats.paid}</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>Monto Pendiente</StatLabel>
                    <StatNumber color="red.500">S/ {voucherStats.totalPending.toFixed(2)}</StatNumber>
                  </Stat>
                </SimpleGrid>

                {/* Filtros */}
                <Card>
                  <CardBody>
                    <HStack spacing={4}>
                      <FormControl maxW="200px">
                        <FormLabel>Estado</FormLabel>
                        <Select
                          value={voucherFilter}
                          onChange={(e) => setVoucherFilter(e.target.value)}
                        >
                          <option value="all">Todos</option>
                          <option value="pending">Pendientes</option>
                          <option value="delivered">Entregados</option>
                          <option value="paid">Pagados</option>
                        </Select>
                      </FormControl>

                      <FormControl maxW="200px">
                        <FormLabel>Cliente</FormLabel>
                        <Select
                          value={selectedClient}
                          onChange={(e) => setSelectedClient(e.target.value)}
                          placeholder="Todos los clientes"
                        >
                          {clients.map((client) => (
                            <option key={client.id} value={client.id}>
                              {client.name}
                            </option>
                          ))}
                        </Select>
                      </FormControl>

                      <Button
                        colorScheme="green"
                        onClick={() => {
                          const pendingVouchers = filteredVouchers
                            .filter(v => v.status === 'pending')
                            .map(v => v.id);
                          if (pendingVouchers.length > 0) {
                            openPaymentModal(pendingVouchers);
                          }
                        }}
                        isDisabled={filteredVouchers.filter(v => v.status === 'pending').length === 0}
                      >
                        Pagar Todos los Pendientes
                      </Button>
                    </HStack>
                  </CardBody>
                </Card>

                {/* Lista de vales */}
                {filteredVouchers.length > 0 ? (
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                    {filteredVouchers.map(renderVoucherCard)}
                  </SimpleGrid>
                ) : (
                  <Center h="200px">
                    <VStack spacing={4}>
                      <Icon as={FaMoneyBillWave} boxSize={12} color="gray.400" />
                      <Text color="gray.500" fontSize="lg">
                        No hay vales que coincidan con los filtros
                      </Text>
                    </VStack>
                  </Center>
                )}
              </VStack>
            </TabPanel>

            {/* Tab de Suscripciones */}
            <TabPanel px={0}>
              <VStack spacing={6} align="stretch">
                {/* Estadísticas de suscripciones */}
                <SimpleGrid columns={{ base: 2, md: 5 }} spacing={4}>
                  <Stat>
                    <StatLabel>Total Suscripciones</StatLabel>
                    <StatNumber>{subscriptionStats.total}</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>Activas</StatLabel>
                    <StatNumber color="green.500">{subscriptionStats.active}</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>Completadas</StatLabel>
                    <StatNumber color="blue.500">{subscriptionStats.completed}</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>Canceladas</StatLabel>
                    <StatNumber color="red.500">{subscriptionStats.cancelled}</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>Ingresos Mensuales</StatLabel>
                    <StatNumber color="green.500">S/ {subscriptionStats.totalRevenue.toFixed(2)}</StatNumber>
                  </Stat>
                </SimpleGrid>

                {/* Filtros */}
                <Card>
                  <CardBody>
                    <HStack spacing={4}>
                      <FormControl maxW="200px">
                        <FormLabel>Estado</FormLabel>
                        <Select
                          value={subscriptionFilter}
                          onChange={(e) => setSubscriptionFilter(e.target.value)}
                        >
                          <option value="all">Todas</option>
                          <option value="active">Activas</option>
                          <option value="paused">Pausadas</option>
                          <option value="completed">Completadas</option>
                          <option value="cancelled">Canceladas</option>
                          <option value="expired">Expiradas</option>
                        </Select>
                      </FormControl>
                    </HStack>
                  </CardBody>
                </Card>

                {/* Lista de suscripciones */}
                {filteredSubscriptions.length > 0 ? (
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                    {filteredSubscriptions.map(renderSubscriptionCard)}
                  </SimpleGrid>
                ) : (
                  <Center h="200px">
                    <VStack spacing={4}>
                      <Icon as={FaCalendarAlt} boxSize={12} color="gray.400" />
                      <Text color="gray.500" fontSize="lg">
                        No hay suscripciones que coincidan con los filtros
                      </Text>
                    </VStack>
                  </Center>
                )}
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>

        {/* Modales */}
        {renderPaymentModal()}
      </VStack>
    </Box>
  );
};

export default CreditsManagement;
