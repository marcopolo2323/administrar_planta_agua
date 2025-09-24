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
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Alert,
  AlertIcon,
  Spinner,
  Center,
  useBreakpointValue,
  Badge,
  SimpleGrid,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  IconButton,
  Tooltip
} from '@chakra-ui/react';
import { FaPlus, FaEdit, FaTrash, FaEye, FaSync, FaUser, FaPhone, FaMapMarkerAlt, FaIdCard } from 'react-icons/fa';
import axios from '../utils/axios';
import useDistrictStore from '../stores/districtStore';

const ClientsManagement = () => {
  const toast = useToast();
  const isMobile = useBreakpointValue({ base: true, md: false });
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();
  
  // Store de distritos
  const { districts, fetchDistricts } = useDistrictStore();

  // Estados
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSilentlyUpdating, setIsSilentlyUpdating] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [selectedClient, setSelectedClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDistrict, setFilterDistrict] = useState('all');

  // Estados del formulario
  const [formData, setFormData] = useState({
    name: '',
    document: '',
    phone: '',
    email: '',
    address: '',
    district: '',
    reference: '',
    notes: ''
  });

  // Cargar clientes
  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/clients');
      if (response.data.success) {
        setClients(response.data.data);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Error al cargar clientes:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los clientes',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Cargar clientes silenciosamente (sin loading)
  const fetchClientsSilently = async () => {
    try {
      setIsSilentlyUpdating(true);
      const response = await axios.get('/api/clients');
      if (response.data.success) {
        setClients(response.data.data);
        setLastUpdate(new Date());
        console.log('🔄 Actualización silenciosa de clientes');
      }
    } catch (error) {
      console.error('Error en actualización silenciosa de clientes:', error);
    } finally {
      setIsSilentlyUpdating(false);
    }
  };

  useEffect(() => {
    fetchClients();
    fetchDistricts(); // Cargar distritos
    
    // Auto-refresh silencioso cada 30 segundos
    const interval = setInterval(fetchClientsSilently, 30000);
    return () => clearInterval(interval);
  }, []);

  // Crear cliente
  const handleCreateClient = async () => {
    try {
      const response = await axios.post('/api/clients', formData);
      if (response.data.success) {
        toast({
          title: 'Cliente creado',
          description: 'El cliente se ha registrado exitosamente',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        fetchClients();
        onCreateClose();
        resetForm();
      }
    } catch (error) {
      console.error('Error al crear cliente:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'No se pudo crear el cliente',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Actualizar cliente
  const handleUpdateClient = async () => {
    try {
      const response = await axios.put(`/api/clients/${selectedClient.id}`, formData);
      if (response.data.success) {
        toast({
          title: 'Cliente actualizado',
          description: 'Los datos del cliente se han actualizado',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        fetchClients();
        onEditClose();
        resetForm();
      }
    } catch (error) {
      console.error('Error al actualizar cliente:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'No se pudo actualizar el cliente',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Eliminar cliente
  const handleDeleteClient = async (clientId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este cliente?')) {
      try {
        const response = await axios.delete(`/api/clients/${clientId}`);
        if (response.data.success) {
          toast({
            title: 'Cliente eliminado',
            description: 'El cliente ha sido eliminado exitosamente',
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
          fetchClients();
        }
      } catch (error) {
        console.error('Error al eliminar cliente:', error);
        toast({
          title: 'Error',
          description: 'No se pudo eliminar el cliente',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  // Abrir modal de edición
  const openEditModal = (client) => {
    setSelectedClient(client);
    setFormData({
      name: client.name || '',
      document: client.documentNumber || '',
      phone: client.phone || '',
      email: client.email || '',
      address: client.address || '',
      district: client.district || '',
      reference: client.reference || '',
      notes: client.notes || ''
    });
    onEditOpen();
  };

  // Abrir modal de visualización
  const openViewModal = (client) => {
    setSelectedClient(client);
    onViewOpen();
  };

  // Resetear formulario
  const resetForm = () => {
    setFormData({
      name: '',
      document: '',
      phone: '',
      email: '',
      address: '',
      district: '',
      reference: '',
      notes: ''
    });
    setSelectedClient(null);
  };

  // Filtrar clientes
  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.documentNumber.includes(searchTerm) ||
                         client.phone.includes(searchTerm);
    
    const matchesStatus = filterStatus === 'all' || client.status === filterStatus;
    
    const matchesDistrict = filterDistrict === 'all' || client.district === filterDistrict;
    
    return matchesSearch && matchesStatus && matchesDistrict;
  });

  // Estadísticas
  const totalClients = clients.length;
  const activeClients = clients.filter(client => client.status === 'active').length;

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
          <VStack align="start" spacing={2}>
            <Heading size="lg" color="blue.600">
              Gestión de Clientes
            </Heading>
            <Text color="gray.600">
              Administra la información de tus clientes
            </Text>
          </VStack>
          <HStack spacing={4}>
            <Button
              leftIcon={<FaSync />}
              onClick={fetchClientsSilently}
              variant="outline"
              isLoading={isSilentlyUpdating}
            >
              Actualizar
            </Button>
            <Button
              leftIcon={<FaPlus />}
              onClick={onCreateOpen}
              colorScheme="blue"
            >
              Nuevo Cliente
            </Button>
          </HStack>
        </Flex>

        {/* Estadísticas */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
          <Card>
            <CardBody>
              <HStack justify="space-between">
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm" color="gray.600">Total Clientes</Text>
                  <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                    {totalClients}
                  </Text>
                </VStack>
                <FaUser size={24} color="#3182CE" />
              </HStack>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <HStack justify="space-between">
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm" color="gray.600">Clientes Activos</Text>
                  <Text fontSize="2xl" fontWeight="bold" color="green.600">
                    {activeClients}
                  </Text>
                </VStack>
                <FaUser size={24} color="#38A169" />
              </HStack>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <HStack justify="space-between">
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm" color="gray.600">Última Actualización</Text>
                  <HStack spacing={2}>
                    <Text fontSize="sm" fontWeight="bold" color="gray.600">
                      {lastUpdate.toLocaleTimeString()}
                    </Text>
                    {isSilentlyUpdating && (
                      <Box
                        w="8px"
                        h="8px"
                        bg="blue.500"
                        borderRadius="50%"
                        animation="pulse 1.5s ease-in-out infinite"
                      />
                    )}
                  </HStack>
                </VStack>
                <FaSync size={20} color="#718096" />
              </HStack>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Filtros */}
        <Card>
          <CardBody>
            <HStack spacing={4} wrap="wrap">
              <Input
                placeholder="Buscar por nombre, DNI o teléfono..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                maxW="300px"
              />
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                maxW="200px"
              >
                <option value="all">Todos los estados</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
              </Select>
              <Select
                value={filterDistrict}
                onChange={(e) => setFilterDistrict(e.target.value)}
                maxW="200px"
                placeholder="Seleccionar distrito"
              >
                <option value="all">Todos los distritos</option>
                {districts.map((district) => (
                  <option key={district.id} value={district.name}>
                    {district.name}
                  </option>
                ))}
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                  setFilterDistrict('all');
                }}
              >
                Limpiar Filtros
              </Button>
            </HStack>
          </CardBody>
        </Card>

        {/* Tabla de clientes */}
        <Card>
          <CardHeader>
            <HStack justify="space-between">
              <Heading size="md">Lista de Clientes</Heading>
              <Text fontSize="sm" color="gray.600">
                Mostrando {filteredClients.length} de {totalClients} clientes
                {filterDistrict !== 'all' && ` en ${filterDistrict}`}
                {filterStatus !== 'all' && ` (${filterStatus === 'active' ? 'Activos' : 'Inactivos'})`}
              </Text>
            </HStack>
          </CardHeader>
          <CardBody>
            {isMobile ? (
              <VStack spacing={4}>
                {filteredClients.map((client) => (
                  <Card key={client.id} w="full" variant="outline">
                    <CardBody>
                      <VStack align="start" spacing={3}>
                        <HStack justify="space-between" w="full">
                          <Text fontWeight="bold">{client.name}</Text>
                          <Badge colorScheme={client.status === 'active' ? 'green' : 'gray'}>
                            {client.status === 'active' ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </HStack>
                        <VStack align="start" spacing={1} w="full">
                          <HStack>
                            <FaIdCard size={14} color="#718096" />
                            <Text fontSize="sm" color="gray.600">DNI: {client.documentNumber}</Text>
                          </HStack>
                          <HStack>
                            <FaPhone size={14} color="#718096" />
                            <Text fontSize="sm" color="gray.600">{client.phone}</Text>
                          </HStack>
                          <HStack>
                            <FaMapMarkerAlt size={14} color="#718096" />
                            <Text fontSize="sm" color="gray.600">{client.district}</Text>
                          </HStack>
                        </VStack>
                        <HStack spacing={2}>
                          <Tooltip label="Ver detalles">
                            <IconButton
                              icon={<FaEye />}
                              size="sm"
                              onClick={() => openViewModal(client)}
                            />
                          </Tooltip>
                          <Tooltip label="Editar">
                            <IconButton
                              icon={<FaEdit />}
                              size="sm"
                              colorScheme="blue"
                              onClick={() => openEditModal(client)}
                            />
                          </Tooltip>
                          <Tooltip label="Eliminar">
                            <IconButton
                              icon={<FaTrash />}
                              size="sm"
                              colorScheme="red"
                              onClick={() => handleDeleteClient(client.id)}
                            />
                          </Tooltip>
                        </HStack>
                      </VStack>
                    </CardBody>
                  </Card>
                ))}
              </VStack>
            ) : (
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Cliente</Th>
                    <Th>DNI</Th>
                    <Th>Teléfono</Th>
                    <Th>Distrito</Th>
                    <Th>Estado</Th>
                    <Th>Acciones</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredClients.map((client) => (
                    <Tr key={client.id}>
                      <Td>
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="bold">{client.name}</Text>
                          <Text fontSize="sm" color="gray.600">{client.email}</Text>
                        </VStack>
                      </Td>
                      <Td>{client.documentNumber}</Td>
                      <Td>{client.phone}</Td>
                      <Td>{client.district}</Td>
                      <Td>
                        <Badge colorScheme={client.status === 'active' ? 'green' : 'gray'}>
                          {client.status === 'active' ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </Td>
                      <Td>
                        <HStack spacing={2}>
                          <Tooltip label="Ver detalles">
                            <IconButton
                              icon={<FaEye />}
                              size="sm"
                              onClick={() => openViewModal(client)}
                            />
                          </Tooltip>
                          <Tooltip label="Editar">
                            <IconButton
                              icon={<FaEdit />}
                              size="sm"
                              colorScheme="blue"
                              onClick={() => openEditModal(client)}
                            />
                          </Tooltip>
                          <Tooltip label="Eliminar">
                            <IconButton
                              icon={<FaTrash />}
                              size="sm"
                              colorScheme="red"
                              onClick={() => handleDeleteClient(client.id)}
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

      {/* Modal de creación */}
      <Modal isOpen={isCreateOpen} onClose={onCreateClose} size="lg" isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Nuevo Cliente</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Nombre Completo</FormLabel>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Ingresa el nombre completo"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>DNI</FormLabel>
                <Input
                  value={formData.document}
                  onChange={(e) => setFormData({...formData, document: e.target.value})}
                  placeholder="Ingresa el DNI"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Teléfono</FormLabel>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="Ingresa el teléfono"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="Ingresa el email"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Dirección</FormLabel>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  placeholder="Ingresa la dirección"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Distrito</FormLabel>
                <Input
                  value={formData.district}
                  onChange={(e) => setFormData({...formData, district: e.target.value})}
                  placeholder="Ingresa el distrito"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Referencia</FormLabel>
                <Input
                  value={formData.reference}
                  onChange={(e) => setFormData({...formData, reference: e.target.value})}
                  placeholder="Referencia de la dirección"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Notas</FormLabel>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Notas adicionales"
                />
              </FormControl>
              <Button
                colorScheme="blue"
                onClick={handleCreateClient}
                w="full"
              >
                Crear Cliente
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Modal de edición */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="lg" isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Editar Cliente</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Nombre Completo</FormLabel>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Ingresa el nombre completo"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>DNI</FormLabel>
                <Input
                  value={formData.document}
                  onChange={(e) => setFormData({...formData, document: e.target.value})}
                  placeholder="Ingresa el DNI"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Teléfono</FormLabel>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="Ingresa el teléfono"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="Ingresa el email"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Dirección</FormLabel>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  placeholder="Ingresa la dirección"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Distrito</FormLabel>
                <Input
                  value={formData.district}
                  onChange={(e) => setFormData({...formData, district: e.target.value})}
                  placeholder="Ingresa el distrito"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Referencia</FormLabel>
                <Input
                  value={formData.reference}
                  onChange={(e) => setFormData({...formData, reference: e.target.value})}
                  placeholder="Referencia de la dirección"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Notas</FormLabel>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Notas adicionales"
                />
              </FormControl>
              <Button
                colorScheme="blue"
                onClick={handleUpdateClient}
                w="full"
              >
                Actualizar Cliente
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Modal de visualización */}
      <Modal isOpen={isViewOpen} onClose={onViewClose} size="md" isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Detalles del Cliente</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedClient && (
              <VStack spacing={4} align="stretch">
                <Card>
                  <CardBody>
                    <VStack spacing={3} align="stretch">
                      <HStack justify="space-between">
                        <Text fontWeight="bold">Nombre:</Text>
                        <Text>{selectedClient.name}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontWeight="bold">DNI:</Text>
                        <Text>{selectedClient.documentNumber}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontWeight="bold">Teléfono:</Text>
                        <Text>{selectedClient.phone}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontWeight="bold">Email:</Text>
                        <Text>{selectedClient.email || 'No especificado'}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontWeight="bold">Dirección:</Text>
                        <Text>{selectedClient.address}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontWeight="bold">Distrito:</Text>
                        <Text>{selectedClient.district}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontWeight="bold">Referencia:</Text>
                        <Text>{selectedClient.reference || 'No especificada'}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontWeight="bold">Estado:</Text>
                        <Badge colorScheme={selectedClient.status === 'active' ? 'green' : 'gray'}>
                          {selectedClient.status === 'active' ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </HStack>
                      {selectedClient.notes && (
                        <VStack align="stretch">
                          <Text fontWeight="bold">Notas:</Text>
                          <Text fontSize="sm" color="gray.600">{selectedClient.notes}</Text>
                        </VStack>
                      )}
                    </VStack>
                  </CardBody>
                </Card>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ClientsManagement;
