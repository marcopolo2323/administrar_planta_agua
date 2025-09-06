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
  Input,
  FormControl,
  FormLabel,
  Select,
  useToast,
  Alert,
  AlertIcon,
  Spinner,
  Center,
  SimpleGrid,
  useBreakpointValue,
  Badge,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  Textarea,
  Avatar
} from '@chakra-ui/react';
import { 
  AddIcon, 
  EditIcon, 
  DeleteIcon
} from '@chakra-ui/icons';
import {
  FaTruck,
  FaPhone,
  FaUser,
  FaMapMarkerAlt,
  FaMotorcycle,
  FaCar
} from 'react-icons/fa';
import useDeliveryStore from '../stores/deliveryStore';

const DeliveryPersonsManagement = () => {
  const [editingPerson, setEditingPerson] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const isMobile = useBreakpointValue({ base: true, md: false });

  // Store
  const {
    deliveryPersons,
    loading,
    error,
    fetchDeliveryPersons,
    createDeliveryPerson,
    updateDeliveryPerson,
    updateDeliveryPersonStatus,
    deleteDeliveryPerson,
    clearError
  } = useDeliveryStore();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    vehicleType: 'motorcycle',
    vehiclePlate: '',
    licenseNumber: '',
    address: '',
    status: 'available',
    notes: ''
  });

  useEffect(() => {
    fetchDeliveryPersons();
  }, [fetchDeliveryPersons]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPerson) {
        await axios.put(`/api/delivery-persons/${editingPerson.id}`, formData);
        setDeliveryPersons(Array.isArray(deliveryPersons) ? deliveryPersons.map(person => 
          person.id === editingPerson.id ? { ...person, ...formData } : person
        ) : []);
        toast({
          title: 'Repartidor actualizado',
          description: 'El repartidor ha sido actualizado',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      } else {
        const response = await axios.post('/api/delivery-persons', formData);
        setDeliveryPersons([...deliveryPersons, response.data]);
        toast({
          title: 'Repartidor creado',
          description: 'El repartidor ha sido creado',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      }
      resetForm();
      onClose();
    } catch (error) {
      console.error('Error al guardar repartidor:', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar el repartidor',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleEdit = (person) => {
    setEditingPerson(person);
    setFormData({
      name: person.name,
      phone: person.phone,
      email: person.email,
      vehicleType: person.vehicleType,
      vehiclePlate: person.vehiclePlate,
      licenseNumber: person.licenseNumber,
      address: person.address,
      status: person.status,
      notes: person.notes
    });
    onOpen();
  };

  const handleDelete = async (personId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este repartidor?')) {
      try {
        await axios.delete(`/api/delivery-persons/${personId}`);
        setDeliveryPersons(deliveryPersons.filter(person => person.id !== personId));
        toast({
          title: 'Repartidor eliminado',
          description: 'El repartidor ha sido eliminado',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      } catch (error) {
        console.error('Error al eliminar repartidor:', error);
        toast({
          title: 'Error',
          description: 'No se pudo eliminar el repartidor',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  const updateStatus = async (personId, newStatus) => {
    try {
      await axios.put(`/api/delivery-persons/${personId}/status`, { status: newStatus });
      setDeliveryPersons(Array.isArray(deliveryPersons) ? deliveryPersons.map(person => 
        person.id === personId ? { ...person, status: newStatus } : person
      ) : []);
      toast({
        title: 'Estado actualizado',
        description: 'El estado del repartidor ha sido actualizado',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el estado',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      vehicleType: 'motorcycle',
      vehiclePlate: '',
      licenseNumber: '',
      address: '',
      status: 'available',
      notes: ''
    });
    setEditingPerson(null);
  };

  const openModal = () => {
    resetForm();
    onOpen();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'green';
      case 'busy': return 'orange';
      case 'offline': return 'red';
      default: return 'gray';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'available': return 'Disponible';
      case 'busy': return 'Ocupado';
      case 'offline': return 'Desconectado';
      default: return status;
    }
  };

  const getVehicleIcon = (vehicleType) => {
    switch (vehicleType) {
      case 'motorcycle': return <FaMotorcycle />;
      case 'car': return <FaCar />;
      case 'truck': return <FaTruck />;
      default: return <FaTruck />;
    }
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
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg" color="gray.700">
          Gestión de Repartidores
        </Heading>
        <Button
          colorScheme="blue"
          leftIcon={<AddIcon />}
          onClick={openModal}
        >
          Nuevo Repartidor
        </Button>
      </Flex>

      {/* Lista de repartidores */}
      {deliveryPersons.length === 0 ? (
        <Alert status="info">
          <AlertIcon />
          No hay repartidores registrados.
        </Alert>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {Array.isArray(deliveryPersons) ? deliveryPersons.map((person) => (
            <Card key={person.id} variant="outline">
              <CardHeader>
                <Flex justify="space-between" align="center">
                  <HStack>
                    <Avatar size="sm" name={person.name} />
                    <Text fontWeight="bold">{person.name}</Text>
                  </HStack>
                  <Badge colorScheme={getStatusColor(person.status)}>
                    {getStatusText(person.status)}
                  </Badge>
                </Flex>
              </CardHeader>
              <CardBody>
                <VStack spacing={3} align="start">
                  <HStack>
                    <FaPhone color="gray.500" />
                    <Text fontSize="sm">{person.phone}</Text>
                  </HStack>
                  
                  <HStack>
                    {getVehicleIcon(person.vehicleType)}
                    <Text fontSize="sm" textTransform="capitalize">
                      {person.vehicleType} - {person.vehiclePlate}
                    </Text>
                  </HStack>
                  
                  {person.address && (
                    <HStack>
                      <FaMapMarkerAlt color="gray.500" />
                      <Text fontSize="sm" color="gray.600" noOfLines={2}>
                        {person.address}
                      </Text>
                    </HStack>
                  )}

                  {person.notes && (
                    <Text fontSize="sm" color="gray.600" noOfLines={2}>
                      {person.notes}
                    </Text>
                  )}

                  <HStack spacing={2} w="full" justify="space-between">
                    <Select
                      size="sm"
                      value={person.status}
                      onChange={(e) => updateStatus(person.id, e.target.value)}
                      maxW="120px"
                    >
                      <option value="available">Disponible</option>
                      <option value="busy">Ocupado</option>
                      <option value="offline">Desconectado</option>
                    </Select>

                    <HStack spacing={1}>
                      <IconButton
                        size="sm"
                        icon={<EditIcon />}
                        onClick={() => handleEdit(person)}
                        colorScheme="blue"
                        variant="outline"
                      />
                      <IconButton
                        size="sm"
                        icon={<DeleteIcon />}
                        onClick={() => handleDelete(person.id)}
                        colorScheme="red"
                        variant="outline"
                      />
                    </HStack>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          )) : null}
        </SimpleGrid>
      )}

      {/* Modal de formulario */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <form onSubmit={handleSubmit}>
            <ModalHeader>
              {editingPerson ? 'Editar Repartidor' : 'Nuevo Repartidor'}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <SimpleGrid columns={2} spacing={4} w="full">
                  <FormControl isRequired>
                    <FormLabel>Nombre completo</FormLabel>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Nombre del repartidor"
                    />
                  </FormControl>

                  <FormControl isRequired>
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
                      placeholder="Email del repartidor"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Tipo de vehículo</FormLabel>
                    <Select
                      value={formData.vehicleType}
                      onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                    >
                      <option value="motorcycle">Motocicleta</option>
                      <option value="car">Automóvil</option>
                      <option value="truck">Camión</option>
                    </Select>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Placa del vehículo</FormLabel>
                    <Input
                      value={formData.vehiclePlate}
                      onChange={(e) => setFormData({ ...formData, vehiclePlate: e.target.value })}
                      placeholder="ABC-123"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Número de licencia</FormLabel>
                    <Input
                      value={formData.licenseNumber}
                      onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                      placeholder="Número de licencia"
                    />
                  </FormControl>
                </SimpleGrid>

                <FormControl>
                  <FormLabel>Dirección</FormLabel>
                  <Textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Dirección del repartidor"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Estado inicial</FormLabel>
                  <Select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="available">Disponible</option>
                    <option value="busy">Ocupado</option>
                    <option value="offline">Desconectado</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Notas</FormLabel>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Notas adicionales"
                  />
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Cancelar
              </Button>
              <Button colorScheme="blue" type="submit">
                {editingPerson ? 'Actualizar' : 'Crear'}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default DeliveryPersonsManagement;
