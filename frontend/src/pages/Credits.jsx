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
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Select,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Spinner,
  Center
} from '@chakra-ui/react';
import { SearchIcon, AddIcon, EditIcon } from '@chakra-ui/icons';
import useCreditStore from '../stores/creditStore';
import useClientStore from '../stores/clientStore';

const Credits = () => {
  // Stores
  const {
    credits,
    loading: creditsLoading,
    error: creditsError,
    fetchCredits,
    createCredit,
    updateCredit,
    getFilteredCredits,
    clearError: clearCreditsError
  } = useCreditStore();

  const {
    clients,
    loading: clientsLoading,
    error: clientsError,
    fetchClients,
    clearError: clearClientsError
  } = useClientStore();

  // Estados locales
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCredit, setSelectedCredit] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  // Estados para el formulario
  const [formData, setFormData] = useState({
    clientId: '',
    amount: '',
    description: '',
    dueDate: '',
    status: 'activo'
  });

  useEffect(() => {
    fetchCredits();
    fetchClients();
  }, [fetchCredits, fetchClients]);

  // Mostrar errores del store
  useEffect(() => {
    if (creditsError) {
      toast({
        title: 'Error',
        description: creditsError,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      clearCreditsError();
    }
  }, [creditsError, toast, clearCreditsError]);

  useEffect(() => {
    if (clientsError) {
      toast({
        title: 'Error',
        description: clientsError,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      clearClientsError();
    }
  }, [clientsError, toast, clearClientsError]);

  const handleCreateCredit = async () => {
    const result = await createCredit(formData);
    if (result.success) {
      toast({
        title: 'Éxito',
        description: 'Crédito creado correctamente',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onClose();
      resetForm();
    }
  };

  const handleUpdateCredit = async () => {
    const result = await updateCredit(selectedCredit.id, formData);
    if (result.success) {
      toast({
        title: 'Éxito',
        description: 'Crédito actualizado correctamente',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onClose();
      resetForm();
    }
  };

  const resetForm = () => {
    setFormData({
      clientId: '',
      amount: '',
      description: '',
      dueDate: '',
      status: 'activo'
    });
    setSelectedCredit(null);
  };

  const openCreateModal = () => {
    resetForm();
    onOpen();
  };

  const openEditModal = (credit) => {
    setSelectedCredit(credit);
    setFormData({
      clientId: credit.clientId,
      amount: credit.amount,
      description: credit.description,
      dueDate: credit.dueDate ? credit.dueDate.split('T')[0] : '',
      status: credit.status
    });
    onOpen();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'activo':
        return 'green';
      case 'vencido':
        return 'red';
      case 'pagado':
        return 'blue';
      case 'cancelado':
        return 'gray';
      default:
        return 'gray';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'activo':
        return 'Activo';
      case 'vencido':
        return 'Vencido';
      case 'pagado':
        return 'Pagado';
      case 'cancelado':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const filteredCredits = getFilteredCredits(searchTerm);
  const loading = creditsLoading || clientsLoading;

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
          Gestión de Créditos
        </Heading>
        <Button
          leftIcon={<AddIcon />}
          colorScheme="blue"
          onClick={openCreateModal}
        >
          Nuevo Crédito
        </Button>
      </Flex>

      <Card>
        <CardHeader>
          <Flex justify="space-between" align="center">
            <Heading size="md">Lista de Créditos</Heading>
            <InputGroup maxW="300px">
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.300" />
              </InputLeftElement>
              <Input
                placeholder="Buscar por cliente o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </Flex>
        </CardHeader>
        <CardBody>
          {filteredCredits.length === 0 ? (
            <Alert status="info">
              <AlertIcon />
              <AlertTitle>No hay créditos!</AlertTitle>
              <AlertDescription>
                {searchTerm ? 'No se encontraron créditos con el término de búsqueda.' : 'No hay créditos registrados.'}
              </AlertDescription>
            </Alert>
          ) : (
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Cliente</Th>
                  <Th>Monto</Th>
                  <Th>Descripción</Th>
                  <Th>Fecha de Vencimiento</Th>
                  <Th>Estado</Th>
                  <Th>Acciones</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredCredits.map((credit) => {
                  const client = clients.find(c => c.id === credit.clientId);
                  return (
                    <Tr key={credit.id}>
                      <Td>
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="medium">
                            {client ? client.name : 'Cliente no encontrado'}
                          </Text>
                          <Text fontSize="sm" color="gray.500">
                            {client ? client.documentNumber : ''}
                          </Text>
                        </VStack>
                      </Td>
                      <Td>
                        <Text fontWeight="bold" color="blue.600">
                          S/ {parseFloat(credit.amount).toFixed(2)}
                        </Text>
                      </Td>
                      <Td>
                        <Text noOfLines={2}>
                          {credit.description || 'Sin descripción'}
                        </Text>
                      </Td>
                      <Td>
                        <Text>
                          {credit.dueDate ? new Date(credit.dueDate).toLocaleDateString() : 'Sin fecha'}
                        </Text>
                      </Td>
                      <Td>
                        <Badge colorScheme={getStatusColor(credit.status)}>
                          {getStatusText(credit.status)}
                        </Badge>
                      </Td>
                      <Td>
                        <HStack spacing={2}>
                          <Button
                            size="sm"
                            leftIcon={<EditIcon />}
                            onClick={() => openEditModal(credit)}
                          >
                            Editar
                          </Button>
                        </HStack>
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          )}
        </CardBody>
      </Card>

      {/* Modal para crear/editar crédito */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedCredit ? 'Editar Crédito' : 'Nuevo Crédito'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Cliente</FormLabel>
                <Select
                  placeholder="Seleccionar cliente"
                  value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                >
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name} - {client.documentNumber}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Monto</FormLabel>
                <NumberInput
                  value={formData.amount}
                  onChange={(value) => setFormData({ ...formData, amount: value })}
                  min={0}
                  precision={2}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <FormControl>
                <FormLabel>Descripción</FormLabel>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descripción del crédito"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Fecha de Vencimiento</FormLabel>
                <Input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Estado</FormLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="activo">Activo</option>
                  <option value="vencido">Vencido</option>
                  <option value="pagado">Pagado</option>
                  <option value="cancelado">Cancelado</option>
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancelar
            </Button>
            <Button
              colorScheme="blue"
              onClick={selectedCredit ? handleUpdateCredit : handleCreateCredit}
            >
              {selectedCredit ? 'Actualizar' : 'Crear'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Credits;
