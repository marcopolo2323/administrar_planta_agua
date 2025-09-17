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
  Badge,
  SimpleGrid,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  useToast,
  Alert,
  AlertIcon,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  IconButton,
  Tooltip,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Tag,
  TagLabel,
  TagLeftIcon
} from '@chakra-ui/react';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaMoneyBillWave,
  FaCalendarAlt,
  FaUser,
  FaCheckCircle,
  FaTimesCircle
} from 'react-icons/fa';
import axios from '../utils/axios';

const ValesManagement = () => {
  const [vales, setVales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedVale, setSelectedVale] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  
  // Modales
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  
  const toast = useToast();

  // Estados del formulario
  const [formData, setFormData] = useState({
    clientId: '',
    amount: '',
    description: '',
    dueDate: '',
    status: 'active'
  });

  useEffect(() => {
    fetchVales();
    
    // Actualizar cada 30 segundos
    const interval = setInterval(() => {
      fetchVales();
      setLastUpdate(new Date());
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchVales = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/vales');
      if (response.data.success) {
        setVales(response.data.data || []);
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

  const handleCreateVale = async () => {
    try {
      const response = await axios.post('/api/vales', formData);
      if (response.data.success) {
        toast({
          title: 'Vale creado',
          description: 'El vale se ha creado exitosamente',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        fetchVales();
        onCreateClose();
        setFormData({
          clientId: '',
          amount: '',
          description: '',
          dueDate: '',
          status: 'active'
        });
      }
    } catch (error) {
      console.error('Error al crear vale:', error);
      toast({
        title: 'Error',
        description: 'No se pudo crear el vale',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleStatusUpdate = async (valeId, newStatus) => {
    try {
      const response = await axios.put(`/api/vales/${valeId}`, { status: newStatus });
      if (response.data.success) {
        toast({
          title: 'Estado actualizado',
          description: 'El estado del vale se ha actualizado',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        fetchVales();
      }
    } catch (error) {
      console.error('Error al actualizar vale:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el vale',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'green';
      case 'used': return 'blue';
      case 'expired': return 'red';
      case 'cancelled': return 'gray';
      default: return 'gray';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Activo';
      case 'used': return 'Usado';
      case 'expired': return 'Expirado';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return FaCheckCircle;
      case 'used': return FaMoneyBillWave;
      case 'expired': return FaTimesCircle;
      case 'cancelled': return FaTimesCircle;
      default: return FaCheckCircle;
    }
  };

  // Estadísticas
  const stats = {
    total: vales.length,
    active: vales.filter(v => v.status === 'active').length,
    used: vales.filter(v => v.status === 'used').length,
    expired: vales.filter(v => v.status === 'expired').length,
    totalAmount: vales.reduce((sum, v) => sum + parseFloat(v.amount || 0), 0),
    usedAmount: vales.reduce((sum, v) => sum + parseFloat(v.usedAmount || 0), 0),
    remainingAmount: vales.reduce((sum, v) => sum + parseFloat(v.remainingAmount || 0), 0)
  };

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="center">
          <Box>
            <Heading size="lg" mb={2}>
              Gestión de Vales
            </Heading>
            <Text color="gray.600">
              Administra los vales de crédito de los clientes
            </Text>
            <Text color="gray.400" fontSize="xs">
              Última actualización: {lastUpdate.toLocaleTimeString()}
            </Text>
          </Box>
          <Button
            size="sm"
            colorScheme="blue"
            variant="outline"
            onClick={() => {
              fetchVales();
              setLastUpdate(new Date());
            }}
            isLoading={loading}
          >
            Actualizar
          </Button>
        </Flex>

        {/* Estadísticas */}
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={4}>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Total Vales</StatLabel>
                <StatNumber color="blue.500">{stats.total}</StatNumber>
                <StatHelpText>Vales creados</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Activos</StatLabel>
                <StatNumber color="green.500">{stats.active}</StatNumber>
                <StatHelpText>Disponibles</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Usados</StatLabel>
                <StatNumber color="blue.500">{stats.used}</StatNumber>
                <StatHelpText>Utilizados</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Monto Total</StatLabel>
                <StatNumber color="purple.500">S/ {stats.totalAmount.toFixed(2)}</StatNumber>
                <StatHelpText>En vales</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Usado</StatLabel>
                <StatNumber color="blue.500">S/ {stats.usedAmount.toFixed(2)}</StatNumber>
                <StatHelpText>Consumido</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Disponible</StatLabel>
                <StatNumber color="green.500">S/ {stats.remainingAmount.toFixed(2)}</StatNumber>
                <StatHelpText>Saldo restante</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Lista de Vales */}
        <Card>
          <CardHeader>
            <Flex justify="space-between" align="center">
              <Heading size="md">Lista de Vales</Heading>
              <Button
                leftIcon={<FaPlus />}
                colorScheme="green"
                onClick={onCreateOpen}
              >
                Nuevo Vale
              </Button>
            </Flex>
          </CardHeader>
          <CardBody>
            {vales.length === 0 ? (
              <Alert status="info">
                <AlertIcon />
                <VStack align="start" spacing={2}>
                  <Text fontWeight="bold">No hay vales registrados</Text>
                  <Text fontSize="sm">
                    Los vales se crean automáticamente cuando los clientes eligen la modalidad "vale" en sus pedidos.
                    <br/>
                    Puedes crear vales manualmente usando el botón "Crear Vale" arriba.
                  </Text>
                </VStack>
              </Alert>
            ) : (
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Cliente</Th>
                    <Th>Monto</Th>
                    <Th>Estado</Th>
                    <Th>Fecha Vencimiento</Th>
                    <Th>Descripción</Th>
                    <Th>Acciones</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {vales.map((vale) => (
                    <Tr key={vale.id}>
                      <Td>
                        <HStack>
                          <FaUser size={14} color="#718096" />
                          <Text>{vale.client?.name || 'Cliente no encontrado'}</Text>
                        </HStack>
                      </Td>
                      <Td>
                        <VStack spacing={1} align="start">
                          <Text fontWeight="bold" color="green.600">
                            S/ {parseFloat(vale.amount || 0).toFixed(2)}
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            Usado: S/ {parseFloat(vale.usedAmount || 0).toFixed(2)}
                          </Text>
                          <Text fontSize="xs" color="blue.500">
                            Restante: S/ {parseFloat(vale.remainingAmount || 0).toFixed(2)}
                          </Text>
                        </VStack>
                      </Td>
                      <Td>
                        <Tag colorScheme={getStatusColor(vale.status)}>
                          <TagLeftIcon as={getStatusIcon(vale.status)} />
                          <TagLabel>{getStatusText(vale.status)}</TagLabel>
                        </Tag>
                      </Td>
                      <Td>
                        <Text fontSize="sm">
                          {vale.dueDate ? new Date(vale.dueDate).toLocaleDateString() : 'Sin fecha'}
                        </Text>
                      </Td>
                      <Td>
                        <Text fontSize="sm" noOfLines={2}>
                          {vale.description || 'Sin descripción'}
                        </Text>
                      </Td>
                      <Td>
                        <HStack spacing={2}>
                          <Tooltip label="Ver detalles">
                            <IconButton
                              size="sm"
                              icon={<FaEye />}
                              onClick={() => {
                                setSelectedVale(vale);
                                onDetailOpen();
                              }}
                            />
                          </Tooltip>
                          <Tooltip label="Editar">
                            <IconButton
                              size="sm"
                              icon={<FaEdit />}
                              onClick={() => {
                                setSelectedVale(vale);
                                onEditOpen();
                              }}
                            />
                          </Tooltip>
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            )}
          </CardBody>
        </Card>
      </VStack>

      {/* Modal de Crear Vale */}
      <Modal isOpen={isCreateOpen} onClose={onCreateClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Crear Nuevo Vale</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Cliente</FormLabel>
                <Select
                  value={formData.clientId}
                  onChange={(e) => setFormData({...formData, clientId: e.target.value})}
                  placeholder="Selecciona un cliente"
                >
                  {/* Aquí se cargarían los clientes */}
                  <option value="1">Cliente de Prueba</option>
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Monto</FormLabel>
                <Input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  placeholder="0.00"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Descripción</FormLabel>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Descripción del vale"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Fecha de Vencimiento</FormLabel>
                <Input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                />
              </FormControl>

              <Button
                colorScheme="green"
                w="full"
                onClick={handleCreateVale}
                leftIcon={<FaPlus />}
              >
                Crear Vale
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Modal de Detalles */}
      <Modal isOpen={isDetailOpen} onClose={onDetailClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Detalles del Vale</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedVale && (
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between">
                  <Text fontWeight="bold">Cliente:</Text>
                  <Text>{selectedVale.client?.name || 'Cliente no encontrado'}</Text>
                </HStack>
                
                <HStack justify="space-between">
                  <Text fontWeight="bold">Monto:</Text>
                  <Text color="green.600" fontWeight="bold">
                    S/ {parseFloat(selectedVale.amount || 0).toFixed(2)}
                  </Text>
                </HStack>
                
                <HStack justify="space-between">
                  <Text fontWeight="bold">Estado:</Text>
                  <Tag colorScheme={getStatusColor(selectedVale.status)}>
                    <TagLeftIcon as={getStatusIcon(selectedVale.status)} />
                    <TagLabel>{getStatusText(selectedVale.status)}</TagLabel>
                  </Tag>
                </HStack>
                
                <HStack justify="space-between">
                  <Text fontWeight="bold">Fecha de Vencimiento:</Text>
                  <Text>
                    {selectedVale.dueDate ? new Date(selectedVale.dueDate).toLocaleDateString() : 'Sin fecha'}
                  </Text>
                </HStack>
                
                {selectedVale.description && (
                  <Box>
                    <Text fontWeight="bold" mb={2}>Descripción:</Text>
                    <Text>{selectedVale.description}</Text>
                  </Box>
                )}
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ValesManagement;
