import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Badge,
  Input,
  InputGroup,
  InputLeftElement,
  VStack,
  HStack,
  useToast,
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
  Select,
  Switch,
  Textarea,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Spinner,
  Center,
  SimpleGrid,
  useBreakpointValue
} from '@chakra-ui/react';
import { SearchIcon, AddIcon, EditIcon } from '@chakra-ui/icons';
import useClientStore from '../stores/clientStore';

const Clients = () => {
  // Store
  const {
    clients,
    loading,
    error,
    fetchClients,
    createClient,
    updateClient,
    deleteClient,
    getFilteredClients,
    clearError
  } = useClientStore();

  // Estados locales
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  // Estados para el formulario
  const [formData, setFormData] = useState({
    name: '',
    documentType: 'DNI',
    documentNumber: '',
    address: '',
    district: '',
    phone: '',
    email: '',
    isCompany: false,
    hasCredit: false,
    creditLimit: '',
    paymentDueDay: '',
    active: true,
    clientStatus: 'nuevo',
    recommendations: '',
    notes: ''
  });

  const isMobile = useBreakpointValue({ base: true, md: false });

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // Mostrar errores del store
  useEffect(() => {
    if (error) {
      toast({
        title: 'Error',
        description: error,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      clearError();
    }
  }, [error, toast, clearError]);

  const handleCreateClient = async () => {
    const result = await createClient(formData);
    if (result.success) {
      toast({
        title: 'Éxito',
        description: 'Cliente creado correctamente',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onClose();
      resetForm();
    }
  };

  const handleUpdateClient = async () => {
    const result = await updateClient(selectedClient.id, formData);
    if (result.success) {
      toast({
        title: 'Éxito',
        description: 'Cliente actualizado correctamente',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onClose();
      resetForm();
    }
  };

  const handleDeleteClient = async (clientId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este cliente?')) {
      const result = await deleteClient(clientId);
      if (result.success) {
        toast({
          title: 'Éxito',
          description: 'Cliente eliminado correctamente',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      documentType: 'DNI',
      documentNumber: '',
      address: '',
      district: '',
      phone: '',
      email: '',
      isCompany: false,
      hasCredit: false,
      creditLimit: '',
      paymentDueDay: '',
      active: true
    });
    setSelectedClient(null);
  };

  const openCreateModal = () => {
    resetForm();
    onOpen();
  };

  const openEditModal = (client) => {
    setSelectedClient(client);
    setFormData({
      name: client.name,
      documentType: client.documentType,
      documentNumber: client.documentNumber,
      address: client.address || '',
      district: client.district || '',
      phone: client.phone || '',
      email: client.email || '',
      isCompany: client.isCompany || false,
      hasCredit: client.hasCredit || false,
      creditLimit: client.creditLimit || '',
      paymentDueDay: client.paymentDueDay || '',
      active: client.active,
      clientStatus: client.clientStatus || 'nuevo',
      recommendations: client.recommendations || '',
      notes: client.notes || ''
    });
    onOpen();
  };

  const getDocumentTypeColor = (type) => {
    switch (type) {
      case 'DNI':
        return 'blue';
      case 'RUC':
        return 'green';
      case 'CE':
        return 'purple';
      default:
        return 'gray';
    }
  };

  const getClientStatusColor = (status) => {
    switch (status) {
      case 'activo':
        return 'green';
      case 'nuevo':
        return 'blue';
      case 'inactivo':
        return 'red';
      case 'retomando':
        return 'orange';
      default:
        return 'gray';
    }
  };

  const getClientStatusText = (status) => {
    switch (status) {
      case 'activo':
        return 'Activo';
      case 'nuevo':
        return 'Nuevo';
      case 'inactivo':
        return 'Inactivo';
      case 'retomando':
        return 'Retomando';
      default:
        return 'Nuevo';
    }
  };

  const filteredClients = getFilteredClients(searchTerm);

  if (loading) {
    return (
      <Center h="400px">
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <Box p={6}>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg" color="gray.700">
          Gestión de Clientes
        </Heading>
        <Button
          leftIcon={<AddIcon />}
          colorScheme="blue"
          onClick={openCreateModal}
        >
          Nuevo Cliente
        </Button>
      </Flex>

      <Card>
        <CardHeader>
          <Flex justify="space-between" align="center">
            <Heading size="md">Lista de Clientes</Heading>
            <InputGroup maxW="300px">
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.300" />
              </InputLeftElement>
              <Input
                placeholder="Buscar clientes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </Flex>
        </CardHeader>
        <CardBody>
          {filteredClients.length === 0 ? (
            <Alert status="info">
              <AlertIcon />
              <AlertTitle>No hay clientes!</AlertTitle>
              <AlertDescription>
                {searchTerm ? 'No se encontraron clientes con el término de búsqueda.' : 'No hay clientes registrados.'}
              </AlertDescription>
            </Alert>
          ) : isMobile ? (
            // Vista móvil
            <SimpleGrid columns={1} spacing={4}>
              {filteredClients.map((client) => (
                <Card key={client.id} variant="outline">
                  <CardBody>
                    <VStack align="start" spacing={3}>
                      <HStack justify="space-between" w="full">
                        <Text fontWeight="bold" fontSize="lg">{client.name}</Text>
                        <Badge colorScheme={client.active ? "green" : "red"}>
                          {client.active ? "Activo" : "Inactivo"}
                        </Badge>
                      </HStack>
                      
                      <HStack spacing={4}>
                        <Badge colorScheme={getDocumentTypeColor(client.documentType)}>
                          {client.documentType}
                        </Badge>
                        <Text color="gray.600" fontSize="sm">
                          {client.documentNumber}
                        </Text>
                      </HStack>
                      
                      {client.phone && (
                        <Text color="gray.600" fontSize="sm">
                          📞 {client.phone}
                        </Text>
                      )}
                      
                      {client.email && (
                        <Text color="gray.600" fontSize="sm">
                          ✉️ {client.email}
                        </Text>
                      )}
                      
                      {client.hasCredit && (
                        <Badge colorScheme="purple">
                          Crédito: S/ {parseFloat(client.creditLimit || 0).toFixed(2)}
                        </Badge>
                      )}
                      
                      <HStack spacing={2}>
                        <Button
                          size="sm"
                          leftIcon={<EditIcon />}
                          onClick={() => openEditModal(client)}
                        >
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          colorScheme="red"
                          variant="outline"
                          onClick={() => handleDeleteClient(client.id)}
                        >
                          Eliminar
                        </Button>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          ) : (
            // Vista desktop
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Nombre</Th>
                  <Th>Documento</Th>
                  <Th>Contacto</Th>
                  <Th>Estado</Th>
                  <Th>Tipo Cliente</Th>
                  <Th>Crédito</Th>
                  <Th>Pedidos</Th>
                  <Th>Acciones</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredClients.map((client) => (
                  <Tr key={client.id}>
                    <Td>
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="bold">{client.name}</Text>
                        <Text fontSize="sm" color="gray.500">
                          {client.address}
                        </Text>
                      </VStack>
                    </Td>
                    <Td>
                      <VStack align="start" spacing={1}>
                        <Badge colorScheme={getDocumentTypeColor(client.documentType)}>
                          {client.documentType}
                        </Badge>
                        <Text fontSize="sm">{client.documentNumber}</Text>
                      </VStack>
                    </Td>
                    <Td>
                      <VStack align="start" spacing={1}>
                        {client.phone && (
                          <Text fontSize="sm">📞 {client.phone}</Text>
                        )}
                        {client.email && (
                          <Text fontSize="sm">✉️ {client.email}</Text>
                        )}
                      </VStack>
                    </Td>
                    <Td>
                      <Badge colorScheme={client.active ? "green" : "red"}>
                        {client.active ? "Activo" : "Inactivo"}
                      </Badge>
                    </Td>
                    <Td>
                      <Badge colorScheme={getClientStatusColor(client.clientStatus)}>
                        {getClientStatusText(client.clientStatus)}
                      </Badge>
                    </Td>
                    <Td>
                      {client.hasCredit ? (
                        <Text color="purple.600" fontWeight="bold">
                          S/ {parseFloat(client.creditLimit || 0).toFixed(2)}
                        </Text>
                      ) : (
                        <Text color="gray.400">-</Text>
                      )}
                    </Td>
                    <Td>
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm" fontWeight="bold">
                          {client.totalOrders || 0} pedidos
                        </Text>
                        {client.lastOrderDate && (
                          <Text fontSize="xs" color="gray.500">
                            Último: {new Date(client.lastOrderDate).toLocaleDateString()}
                          </Text>
                        )}
                      </VStack>
                    </Td>
                    <Td>
                      <HStack spacing={2}>
                        <Button
                          size="sm"
                          leftIcon={<EditIcon />}
                          onClick={() => openEditModal(client)}
                        >
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          colorScheme="red"
                          variant="outline"
                          onClick={() => handleDeleteClient(client.id)}
                        >
                          Eliminar
                        </Button>
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </CardBody>
      </Card>

      {/* Modal para crear/editar cliente */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedClient ? 'Editar Cliente' : 'Nuevo Cliente'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Nombre</FormLabel>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nombre del cliente"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Tipo de Documento</FormLabel>
                <Select
                  value={formData.documentType}
                  onChange={(e) => setFormData({ ...formData, documentType: e.target.value })}
                >
                  <option value="DNI">DNI</option>
                  <option value="RUC">RUC</option>
                  <option value="CE">Carné de Extranjería</option>
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Número de Documento</FormLabel>
                <Input
                  value={formData.documentNumber}
                  onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
                  placeholder="Número de documento"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Dirección</FormLabel>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Dirección del cliente"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Distrito</FormLabel>
                <Input
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  placeholder="Distrito"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Teléfono</FormLabel>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Número de teléfono"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Correo electrónico"
                />
              </FormControl>

              <FormControl>
                <FormLabel>¿Es empresa?</FormLabel>
                <Switch
                  isChecked={formData.isCompany}
                  onChange={(e) => setFormData({ ...formData, isCompany: e.target.checked })}
                />
              </FormControl>

              <FormControl>
                <FormLabel>¿Tiene crédito?</FormLabel>
                <Switch
                  isChecked={formData.hasCredit}
                  onChange={(e) => setFormData({ ...formData, hasCredit: e.target.checked })}
                />
              </FormControl>

              {formData.hasCredit && (
                <FormControl>
                  <FormLabel>Límite de Crédito</FormLabel>
                  <Input
                    type="number"
                    value={formData.creditLimit}
                    onChange={(e) => setFormData({ ...formData, creditLimit: e.target.value })}
                    placeholder="Límite de crédito"
                  />
                </FormControl>
              )}

              <FormControl>
                <FormLabel>¿Activo?</FormLabel>
                <Switch
                  isChecked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Estado del Cliente</FormLabel>
                <Select
                  value={formData.clientStatus}
                  onChange={(e) => setFormData({ ...formData, clientStatus: e.target.value })}
                >
                  <option value="nuevo">Nuevo</option>
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                  <option value="retomando">Retomando</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Recomendaciones del Cliente</FormLabel>
                <Textarea
                  value={formData.recommendations}
                  onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
                  placeholder="¿Qué puede mejorar la empresa? ¿Qué sugiere el cliente?"
                  rows={3}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Notas Adicionales</FormLabel>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Notas adicionales sobre el cliente"
                  rows={2}
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancelar
            </Button>
            <Button
              colorScheme="blue"
              onClick={selectedClient ? handleUpdateClient : handleCreateClient}
            >
              {selectedClient ? 'Actualizar' : 'Crear'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Clients;
