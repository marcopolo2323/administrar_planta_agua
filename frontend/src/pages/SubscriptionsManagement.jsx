import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Heading,
  Text,
  VStack,
  HStack,
  useToast,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  Table,
  TableContainer,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
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
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Textarea,
  Alert,
  AlertIcon,
  Spinner,
  Center,
  SimpleGrid,
  useBreakpointValue,
  Divider,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Icon,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorModeValue,
  StatArrow
} from '@chakra-ui/react';
import {
  FaSearch,
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaCalendarAlt,
  FaUsers,
  FaDollarSign,
  FaGift,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaEllipsisV
} from 'react-icons/fa';
import axios from '../utils/axios';
import AquaYaraLogo from '../components/AquaYaraLogo';
import AdminContact from '../components/AdminContact';

const SubscriptionsManagement = () => {
  // Estados
  const [subscriptions, setSubscriptions] = useState([]);
  const [clients, setClients] = useState([]);
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  
  // Modales
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();
  
  // Formularios
  const [createForm, setCreateForm] = useState({
    clientId: '',
    planId: '',
    startDate: '',
    notes: ''
  });
  
  const [editForm, setEditForm] = useState({
    id: '',
    status: '',
    remainingBottles: '',
    notes: ''
  });

  const toast = useToast();
  const isMobile = useBreakpointValue({ base: true, md: false });
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [clientsRes, subscriptionsRes] = await Promise.all([
        axios.get('/api/clients'),
        axios.get('/api/subscriptions') // Usar el endpoint directo de suscripciones
      ]);

      setSubscriptions(subscriptionsRes.data.data || []);
      setClients(clientsRes.data.data || []);
      
      // Definir planes de suscripción estáticos (como en el frontend)
      setSubscriptionPlans([
        {
          id: 1,
          name: 'Plan Básico',
          bottles: 20,
          bonus: 2,
          price: 100,
          description: '20 bidones + 2 extra'
        },
        {
          id: 2,
          name: 'Plan Intermedio',
          bottles: 30,
          bonus: 5,
          price: 150,
          description: '30 bidones + 5 extra'
        },
        {
          id: 3,
          name: 'Plan Premium',
          bottles: 50,
          bonus: 10,
          price: 250,
          description: '50 bidones + 10 extra'
        }
      ]);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los datos',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredSubscriptions = (Array.isArray(subscriptions) ? subscriptions : []).filter(subscription => {
    const matchesSearch = subscription.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subscription.client?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || subscription.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'green';
      case 'paused': return 'yellow';
      case 'cancelled': return 'red';
      case 'expired': return 'gray';
      default: return 'gray';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Activa';
      case 'paused': return 'Pausada';
      case 'cancelled': return 'Cancelada';
      case 'expired': return 'Expirada';
      default: return 'Desconocido';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const handleCreateSubscription = async () => {
    try {
      // Obtener el cliente seleccionado para obtener el DNI
      const selectedClient = clients.find(client => client.id === parseInt(createForm.clientId));
      const selectedPlan = subscriptionPlans.find(plan => plan.id === parseInt(createForm.planId));
      
      if (!selectedClient || !selectedPlan) {
        toast({
          title: 'Error',
          description: 'Cliente o plan no encontrado',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      // Preparar datos según el modelo del backend
      const subscriptionData = {
        clientId: selectedClient.id,
        clientDni: selectedClient.documentNumber,
        subscriptionType: selectedPlan.name,
        totalBottles: selectedPlan.bottles + selectedPlan.bonus,
        totalAmount: selectedPlan.price,
        paidAmount: selectedPlan.price,
        expiryDate: null, // Las suscripciones duran hasta que se acaben los bidones
        notes: createForm.notes
      };

      await axios.post('/api/subscriptions', subscriptionData);
      toast({
        title: 'Suscripción creada',
        description: 'La suscripción se ha creado correctamente',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onCreateClose();
      setCreateForm({ clientId: '', planId: '', startDate: '', notes: '' });
      fetchData();
    } catch (error) {
      console.error('Error al crear suscripción:', error);
      toast({
        title: 'Error',
        description: 'No se pudo crear la suscripción',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleUpdateSubscription = async () => {
    try {
      await axios.put(`/api/subscriptions/${editForm.id}`, editForm);
      toast({
        title: 'Suscripción actualizada',
        description: 'La suscripción se ha actualizado correctamente',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onEditClose();
      setEditForm({ id: '', status: '', remainingBottles: '', notes: '' });
      fetchData();
    } catch (error) {
      console.error('Error al actualizar suscripción:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar la suscripción',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleViewSubscription = (subscription) => {
    setSelectedSubscription(subscription);
    onViewOpen();
  };

  const handleEditSubscription = (subscription) => {
    setEditForm({
      id: subscription.id,
      status: subscription.status,
      remainingBottles: subscription.remainingBottles,
      notes: subscription.notes || ''
    });
    onEditOpen();
  };

  // Estadísticas
  const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length;
  const totalRevenue = subscriptions
    .filter(s => s.status === 'active')
    .reduce((sum, s) => sum + (s.plan?.price || 0), 0);

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
        <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
          <VStack align="start" spacing={1}>
            <Heading size="lg">
              <Icon as={FaCalendarAlt} mr={2} />
              Gestión de Suscripciones
            </Heading>
            <Text color="gray.600">
              Administra las suscripciones de clientes frecuentes
            </Text>
          </VStack>
          <Button
            leftIcon={<FaPlus />}
            colorScheme="blue"
            onClick={onCreateOpen}
            size="lg"
          >
            Nueva Suscripción
          </Button>
        </Flex>

        {/* Estadísticas */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
          <Card bg={cardBg} borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel>Total Suscripciones</StatLabel>
                <StatNumber>{subscriptions.length}</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  {activeSubscriptions} activas
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          <Card bg={cardBg} borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel>Ingresos Mensuales</StatLabel>
                <StatNumber>S/ {totalRevenue.toFixed(2)}</StatNumber>
                <StatHelpText>De suscripciones activas</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          <Card bg={cardBg} borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel>Planes Disponibles</StatLabel>
                <StatNumber>{subscriptionPlans.length}</StatNumber>
                <StatHelpText>Planes de suscripción</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Filtros */}
        <Card bg={cardBg} borderColor={borderColor}>
          <CardBody>
            <HStack spacing={4} wrap="wrap">
              <InputGroup maxW="300px">
                <InputLeftElement pointerEvents="none">
                  <Icon as={FaSearch} color="gray.300" />
                </InputLeftElement>
                <Input
                  placeholder="Buscar por cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                maxW="200px"
              >
                <option value="all">Todos los estados</option>
                <option value="active">Activas</option>
                <option value="paused">Pausadas</option>
                <option value="cancelled">Canceladas</option>
                <option value="expired">Expiradas</option>
              </Select>
            </HStack>
          </CardBody>
        </Card>

        {/* Tabla de suscripciones */}
        <Card bg={cardBg} borderColor={borderColor}>
          <CardHeader>
            <Heading size="md">Suscripciones</Heading>
          </CardHeader>
          <CardBody>
            {filteredSubscriptions.length === 0 ? (
              <Center py={10}>
                <Text color="gray.500" fontSize="lg">
                  No hay suscripciones registradas
                </Text>
              </Center>
            ) : (
              <TableContainer>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Cliente</Th>
                      <Th>Plan</Th>
                      <Th>Estado</Th>
                      <Th>Bidones Restantes</Th>
                      <Th>Fecha Inicio</Th>
                      <Th>Duración</Th>
                      <Th>Acciones</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {(Array.isArray(filteredSubscriptions) ? filteredSubscriptions : []).map((subscription) => (
                      <Tr key={subscription.id}>
                        <Td>
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="bold">
                              {subscription.client?.name || 'N/A'}
                            </Text>
                            <Text fontSize="sm" color="gray.600">
                              {subscription.client?.email || 'N/A'}
                            </Text>
                          </VStack>
                        </Td>
                        <Td>
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="bold">
                              {subscription.subscriptionType || 'N/A'}
                            </Text>
                            <Text fontSize="sm" color="gray.600">
                              S/ {subscription.totalAmount || 0}
                            </Text>
                          </VStack>
                        </Td>
                        <Td>
                          <Badge colorScheme={getStatusColor(subscription.status)}>
                            {getStatusText(subscription.status)}
                          </Badge>
                        </Td>
                        <Td>
                          <Text fontWeight="bold" color="blue.600">
                            {subscription.remainingBottles || 0}
                          </Text>
                        </Td>
                        <Td>{formatDate(subscription.purchaseDate)}</Td>
                        <Td>
                          <Text color="green.600" fontWeight="bold">
                            Hasta agotar bidones
                          </Text>
                        </Td>
                        <Td>
                          <Menu>
                            <MenuButton as={Button} size="sm" variant="ghost">
                              <Icon as={FaEllipsisV} />
                            </MenuButton>
                            <MenuList>
                              <MenuItem
                                icon={<FaEye />}
                                onClick={() => handleViewSubscription(subscription)}
                              >
                                Ver Detalles
                              </MenuItem>
                              <MenuItem
                                icon={<FaEdit />}
                                onClick={() => handleEditSubscription(subscription)}
                              >
                                Editar
                              </MenuItem>
                            </MenuList>
                          </Menu>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            )}
          </CardBody>
        </Card>

        {/* Modal Crear Suscripción */}
        <Modal isOpen={isCreateOpen} onClose={onCreateClose} size="lg" isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Nueva Suscripción</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Cliente</FormLabel>
                  <Select
                    placeholder="Seleccionar cliente"
                    value={createForm.clientId}
                    onChange={(e) => setCreateForm({ ...createForm, clientId: e.target.value })}
                  >
                    {(Array.isArray(clients) ? clients : []).map(client => (
                      <option key={client.id} value={client.id}>
                        {client.name} - {client.email}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Plan de Suscripción</FormLabel>
                  <Select
                    placeholder="Seleccionar plan"
                    value={createForm.planId}
                    onChange={(e) => setCreateForm({ ...createForm, planId: e.target.value })}
                  >
                    {(Array.isArray(subscriptionPlans) ? subscriptionPlans : []).map(plan => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name} - S/ {plan.price} ({plan.bottles + plan.bonus} bidones)
                      </option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Fecha de Inicio</FormLabel>
                  <Input
                    type="date"
                    value={createForm.startDate}
                    onChange={(e) => setCreateForm({ ...createForm, startDate: e.target.value })}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Notas</FormLabel>
                  <Textarea
                    placeholder="Notas adicionales..."
                    value={createForm.notes}
                    onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
                  />
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onCreateClose}>
                Cancelar
              </Button>
              <Button colorScheme="blue" onClick={handleCreateSubscription}>
                Crear Suscripción
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Modal Editar Suscripción */}
        <Modal isOpen={isEditOpen} onClose={onEditClose} size="lg" isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Editar Suscripción</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Estado</FormLabel>
                  <Select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  >
                    <option value="active">Activa</option>
                    <option value="paused">Pausada</option>
                    <option value="cancelled">Cancelada</option>
                    <option value="expired">Expirada</option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Bidones Restantes</FormLabel>
                  <NumberInput
                    value={editForm.remainingBottles}
                    onChange={(value) => setEditForm({ ...editForm, remainingBottles: value })}
                    min={0}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
                <FormControl>
                  <FormLabel>Notas</FormLabel>
                  <Textarea
                    placeholder="Notas adicionales..."
                    value={editForm.notes}
                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  />
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onEditClose}>
                Cancelar
              </Button>
              <Button colorScheme="blue" onClick={handleUpdateSubscription}>
                Actualizar Suscripción
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Modal Ver Detalles */}
        <Modal isOpen={isViewOpen} onClose={onViewClose} size="lg" isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Detalles de la Suscripción</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              {selectedSubscription && (
                <VStack spacing={4} align="stretch">
                  <SimpleGrid columns={2} spacing={4}>
                    <Box>
                      <Text fontWeight="bold" color="gray.600">Cliente:</Text>
                      <Text>{selectedSubscription.client?.name || 'N/A'}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="bold" color="gray.600">Email:</Text>
                      <Text>{selectedSubscription.client?.email || 'N/A'}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="bold" color="gray.600">Tipo de Suscripción:</Text>
                      <Text>{selectedSubscription.subscriptionType || 'N/A'}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="bold" color="gray.600">Total Pagado:</Text>
                      <Text>S/ {selectedSubscription.totalAmount || 0}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="bold" color="gray.600">Estado:</Text>
                      <Badge colorScheme={getStatusColor(selectedSubscription.status)}>
                        {getStatusText(selectedSubscription.status)}
                      </Badge>
                    </Box>
                    <Box>
                      <Text fontWeight="bold" color="gray.600">Bidones Restantes:</Text>
                      <Text fontWeight="bold" color="blue.600">
                        {selectedSubscription.remainingBottles || 0}
                      </Text>
                    </Box>
                    <Box>
                      <Text fontWeight="bold" color="gray.600">Fecha de Compra:</Text>
                      <Text>{formatDate(selectedSubscription.purchaseDate)}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="bold" color="gray.600">Duración:</Text>
                      <Text color="green.600" fontWeight="bold">Hasta agotar bidones</Text>
                    </Box>
                  </SimpleGrid>
                  
                  {selectedSubscription.notes && (
                    <Box>
                      <Text fontWeight="bold" color="gray.600">Notas:</Text>
                      <Text>{selectedSubscription.notes}</Text>
                    </Box>
                  )}
                </VStack>
              )}
            </ModalBody>
          </ModalContent>
        </Modal>

        {/* Footer con información de contacto */}
        <AdminContact />
      </VStack>
    </Box>
  );
};

export default SubscriptionsManagement;
