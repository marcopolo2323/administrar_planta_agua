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
import axios from '../utils/axios';

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
    username: '',
    password: '',
    vehicleType: 'motorcycle',
    vehiclePlate: '',
    licenseNumber: '',
    address: '',
    district: '',
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
        // Actualizar repartidor existente
        const updateData = { ...formData };
        
        // Si se proporcionó una nueva contraseña (no es la enmascarada)
        if (formData.password && formData.password !== '••••••••') {
          // Actualizar credenciales del usuario
          const userUpdateData = {
            username: formData.username,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            district: formData.district,
            password: formData.password
          };
          
          await axios.put(`/api/users/${editingPerson.User?.id}`, userUpdateData);
        }
        
        // Remover campos de usuario del updateData
        delete updateData.username;
        delete updateData.password;
        delete updateData.district;
        
        await updateDeliveryPerson(editingPerson.id, updateData);
        toast({
          title: 'Repartidor actualizado',
          description: 'El repartidor y sus credenciales han sido actualizados',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      } else {
        // Crear nuevo repartidor
        const userData = {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          role: 'repartidor',
          phone: formData.phone,
          address: formData.address,
          district: formData.district
        };

        // Crear usuario en el sistema
        const userResponse = await axios.post('/api/auth/register', userData);
        
        // Crear perfil de repartidor
        const deliveryPersonData = {
          userId: userResponse.data.user.id,
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          vehicleType: formData.vehicleType,
          vehiclePlate: formData.vehiclePlate,
          licenseNumber: formData.licenseNumber,
          address: formData.address,
          status: formData.status,
          notes: formData.notes
        };

        await createDeliveryPerson(deliveryPersonData);
        
        toast({
          title: 'Repartidor creado',
          description: `Usuario creado con username: ${formData.username}`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      }
      resetForm();
      onClose();
    } catch (error) {
      console.error('Error al guardar repartidor:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'No se pudo guardar el repartidor',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleEdit = (person) => {
    setEditingPerson(person);
    setFormData({
      name: person.name || '',
      phone: person.phone || '',
      email: person.email || '',
      username: person.User?.username || '',
      password: '••••••••', // Mostrar contraseña enmascarada
      vehicleType: person.vehicleType || 'motorcycle',
      vehiclePlate: person.vehiclePlate || '',
      licenseNumber: person.licenseNumber || '',
      address: person.address || '',
      district: person.User?.district || '',
      status: person.status || 'available',
      notes: person.notes || ''
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
      username: '',
      password: '',
      vehicleType: 'motorcycle',
      vehiclePlate: '',
      licenseNumber: '',
      address: '',
      district: '',
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
          {Array.isArray(deliveryPersons) ? deliveryPersons.map((person, index) => (
            <Card key={person.id || `delivery-person-${index}`} variant="outline">
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
      <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
        <ModalOverlay />
        <ModalContent>
          <form onSubmit={handleSubmit}>
            <ModalHeader>
              {editingPerson ? 'Editar Repartidor' : 'Nuevo Repartidor'}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                {/* Información de Usuario */}
                <Box w="full" p={4} bg="blue.50" borderRadius="md">
                  <Text fontWeight="bold" mb={3} color="blue.700">
                    🔐 Credenciales de Acceso
                  </Text>
                  <SimpleGrid columns={2} spacing={4} w="full">
                    <FormControl isRequired>
                      <FormLabel>Username</FormLabel>
                      <Input
                        value={formData.username || ''}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        placeholder="Nombre de usuario"
                        readOnly={editingPerson}
                        bg={editingPerson ? "gray.100" : "white"}
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Contraseña</FormLabel>
                      <Input
                        type="password"
                        value={formData.password || ''}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder={editingPerson ? "Dejar vacío para mantener la actual" : "Contraseña temporal"}
                        autoComplete="new-password"
                      />
                    </FormControl>
                  </SimpleGrid>
                </Box>

                {/* Información Personal */}
                <Box w="full" p={4} bg="green.50" borderRadius="md">
                  <Text fontWeight="bold" mb={3} color="green.700">
                    👤 Información Personal
                  </Text>
                <SimpleGrid columns={2} spacing={4} w="full">
                  <FormControl isRequired>
                    <FormLabel>Nombre completo</FormLabel>
                    <Input
                        value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Nombre del repartidor"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Teléfono</FormLabel>
                    <Input
                        value={formData.phone || ''}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Número de teléfono"
                    />
                  </FormControl>

                    <FormControl isRequired>
                    <FormLabel>Email</FormLabel>
                    <Input
                      type="email"
                        value={formData.email || ''}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Email del repartidor"
                    />
                  </FormControl>

                    <FormControl>
                      <FormLabel>Distrito</FormLabel>
                      <Input
                        value={formData.district || ''}
                        onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                        placeholder="Distrito de residencia"
                      />
                    </FormControl>
                  </SimpleGrid>
                </Box>

                {/* Información del Vehículo */}
                <Box w="full" p={4} bg="orange.50" borderRadius="md">
                  <Text fontWeight="bold" mb={3} color="orange.700">
                    🚗 Información del Vehículo
                  </Text>
                  <SimpleGrid columns={2} spacing={4} w="full">

                  <FormControl isRequired>
                    <FormLabel>Tipo de vehículo</FormLabel>
                    <Select
                        value={formData.vehicleType || 'motorcycle'}
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
                        value={formData.vehiclePlate || ''}
                      onChange={(e) => setFormData({ ...formData, vehiclePlate: e.target.value })}
                      placeholder="ABC-123"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Número de licencia</FormLabel>
                    <Input
                        value={formData.licenseNumber || ''}
                      onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                      placeholder="Número de licencia"
                    />
                  </FormControl>
                </SimpleGrid>
                </Box>

                {/* Información Adicional */}
                <Box w="full" p={4} bg="gray.50" borderRadius="md">
                  <Text fontWeight="bold" mb={3} color="gray.700">
                    📝 Información Adicional
                  </Text>
                  <VStack spacing={4} w="full">
                <FormControl>
                  <FormLabel>Dirección</FormLabel>
                  <Textarea
                        value={formData.address || ''}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Dirección del repartidor"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Estado inicial</FormLabel>
                  <Select
                        value={formData.status || 'available'}
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
                        value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Notas adicionales"
                  />
                </FormControl>
                  </VStack>
                </Box>
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
