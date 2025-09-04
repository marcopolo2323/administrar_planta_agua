import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  Box,
  Container,
  Heading,
  Text,
  Stack,
  Flex,
  Spinner,
  useColorModeValue,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Select,
  Switch,
} from '@chakra-ui/react';
import { SearchIcon, ChevronDownIcon, AddIcon } from '@chakra-ui/icons';
import { FaEye, FaEdit, FaTrash, FaMotorcycle, FaCar, FaBicycle } from 'react-icons/fa';

const DeliveryPersonManagement = () => {
  const [deliveryPersons, setDeliveryPersons] = useState([]);
  const [filteredDeliveryPersons, setFilteredDeliveryPersons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Estado para el formulario de nuevo repartidor
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    documentType: 'DNI',
    documentNumber: '',
    phone: '',
    address: '',
    vehicleType: 'motorcycle',
    vehiclePlate: '',
    status: 'available',
    notes: ''
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [selectedDeliveryPerson, setSelectedDeliveryPerson] = useState(null);
  
  // Modales
  const { 
    isOpen: isCreateModalOpen, 
    onOpen: onCreateModalOpen, 
    onClose: onCreateModalClose 
  } = useDisclosure();
  
  const { 
    isOpen: isEditModalOpen, 
    onOpen: onEditModalOpen, 
    onClose: onEditModalClose 
  } = useDisclosure();
  
  const { 
    isOpen: isDeleteModalOpen, 
    onOpen: onDeleteModalOpen, 
    onClose: onDeleteModalClose 
  } = useDisclosure();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    fetchDeliveryPersons();
  }, []);

  const fetchDeliveryPersons = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/delivery-persons`,
        config
      );

      setDeliveryPersons(response.data);
      setFilteredDeliveryPersons(response.data);
    } catch (error) {
      console.error('Error al cargar repartidores:', error);
      toast.error('Error al cargar la lista de repartidores');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Aplicar filtros cuando cambian los criterios
    let result = [...deliveryPersons];

    // Filtrar por término de búsqueda (nombre, documento, etc)
    if (searchTerm) {
      const searchTermLower = searchTerm.toLowerCase();
      result = result.filter(dp => 
        dp.name.toLowerCase().includes(searchTermLower) ||
        dp.documentNumber.includes(searchTerm) ||
        dp.email.toLowerCase().includes(searchTermLower) ||
        dp.phone.includes(searchTerm) ||
        dp.vehiclePlate?.toLowerCase().includes(searchTermLower)
      );
    }

    // Filtrar por estado
    if (statusFilter !== 'all') {
      if (statusFilter === 'active') {
        result = result.filter(dp => dp.active);
      } else if (statusFilter === 'inactive') {
        result = result.filter(dp => !dp.active);
      } else {
        result = result.filter(dp => dp.status === statusFilter);
      }
    }

    setFilteredDeliveryPersons(result);
  }, [searchTerm, statusFilter, deliveryPersons]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Limpiar error cuando el usuario comienza a escribir
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) errors.name = 'El nombre es obligatorio';
    if (!formData.email.trim()) errors.email = 'El correo electrónico es obligatorio';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Formato de correo inválido';
    
    if (!selectedDeliveryPerson && !formData.password.trim()) errors.password = 'La contraseña es obligatoria';
    if (!formData.documentNumber.trim()) errors.documentNumber = 'El número de documento es obligatorio';
    if (!formData.phone.trim()) errors.phone = 'El teléfono es obligatorio';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateDeliveryPerson = async () => {
    if (!validateForm()) return;
    
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/delivery-persons`,
        formData,
        config
      );

      toast.success('Repartidor creado correctamente');
      onCreateModalClose();
      fetchDeliveryPersons();
      resetForm();
    } catch (error) {
      console.error('Error al crear repartidor:', error);
      toast.error(error.response?.data?.message || 'Error al crear el repartidor');
    }
  };

  const handleEditDeliveryPerson = async () => {
    if (!validateForm()) return;
    
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      // Si la contraseña está vacía, la eliminamos para no actualizarla
      const dataToSend = {...formData};
      if (!dataToSend.password) delete dataToSend.password;

      await axios.put(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/delivery-persons/${selectedDeliveryPerson.id}`,
        dataToSend,
        config
      );

      toast.success('Repartidor actualizado correctamente');
      onEditModalClose();
      fetchDeliveryPersons();
      resetForm();
    } catch (error) {
      console.error('Error al actualizar repartidor:', error);
      toast.error(error.response?.data?.message || 'Error al actualizar el repartidor');
    }
  };

  const handleDeactivateDeliveryPerson = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      await axios.delete(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/delivery-persons/${selectedDeliveryPerson.id}`,
        config
      );

      toast.success('Repartidor desactivado correctamente');
      onDeleteModalClose();
      fetchDeliveryPersons();
    } catch (error) {
      console.error('Error al desactivar repartidor:', error);
      toast.error(error.response?.data?.message || 'Error al desactivar el repartidor');
    }
  };

  const handleUpdateStatus = async (deliveryPersonId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      await axios.put(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/delivery-persons/${deliveryPersonId}/status`,
        { status: newStatus },
        config
      );

      toast.success('Estado actualizado correctamente');
      fetchDeliveryPersons();
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      toast.error('Error al actualizar el estado del repartidor');
    }
  };

  const openEditModal = (deliveryPerson) => {
    setSelectedDeliveryPerson(deliveryPerson);
    setFormData({
      name: deliveryPerson.name,
      email: deliveryPerson.email,
      password: '', // No incluimos la contraseña por seguridad
      documentType: deliveryPerson.documentType,
      documentNumber: deliveryPerson.documentNumber,
      phone: deliveryPerson.phone,
      address: deliveryPerson.address || '',
      vehicleType: deliveryPerson.vehicleType,
      vehiclePlate: deliveryPerson.vehiclePlate || '',
      status: deliveryPerson.status,
      notes: deliveryPerson.notes || ''
    });
    onEditModalOpen();
  };

  const openDeleteModal = (deliveryPerson) => {
    setSelectedDeliveryPerson(deliveryPerson);
    onDeleteModalOpen();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      documentType: 'DNI',
      documentNumber: '',
      phone: '',
      address: '',
      vehicleType: 'motorcycle',
      vehiclePlate: '',
      status: 'available',
      notes: ''
    });
    setFormErrors({});
    setSelectedDeliveryPerson(null);
  };

  const getStatusBadge = (status, active) => {
    if (!active) {
      return (
        <Badge colorScheme="gray" variant="solid">
          Inactivo
        </Badge>
      );
    }
    
    const statusMap = {
      'available': { color: 'green', text: 'Disponible' },
      'busy': { color: 'orange', text: 'Ocupado' },
      'offline': { color: 'red', text: 'Desconectado' }
    };
    
    const statusInfo = statusMap[status] || { color: 'gray', text: status };
    
    return (
      <Badge colorScheme={statusInfo.color} variant="solid">
        {statusInfo.text}
      </Badge>
    );
  };

  const getVehicleIcon = (vehicleType) => {
    switch (vehicleType) {
      case 'motorcycle':
        return <FaMotorcycle />;
      case 'car':
        return <FaCar />;
      case 'bicycle':
        return <FaBicycle />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <Flex justify="center" align="center" height="80vh">
        <Spinner size="xl" color="blue.500" />
      </Flex>
    );
  }

  return (
    <Container maxW="container.xl" py={6}>
      <Stack spacing={6}>
        <Flex justify="space-between" align="center">
          <Heading size="lg">Gestión de Repartidores</Heading>
          <Button
            leftIcon={<AddIcon />}
            colorScheme="blue"
            onClick={() => {
              resetForm();
              onCreateModalOpen();
            }}
          >
            Nuevo Repartidor
          </Button>
        </Flex>

        {/* Filtros */}
        <Flex 
          direction={{ base: 'column', md: 'row' }} 
          gap={4} 
          bg={bgColor} 
          p={4} 
          borderRadius="md"
          borderWidth="1px"
          borderColor={borderColor}
        >
          <InputGroup maxW={{ base: '100%', md: '60%' }}>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.400" />
            </InputLeftElement>
            <Input 
              placeholder="Buscar por nombre, documento, email, teléfono o placa" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
          
          <Select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            maxW={{ base: '100%', md: '40%' }}
          >
            <option value="all">Todos</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
            <option value="available">Disponibles</option>
            <option value="busy">Ocupados</option>
            <option value="offline">Desconectados</option>
          </Select>
        </Flex>

        {/* Tabla de repartidores */}
        <Box
          bg={bgColor}
          borderWidth="1px"
          borderColor={borderColor}
          borderRadius="md"
          overflow="hidden"
        >
          <Box overflowX="auto">
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Nombre</Th>
                  <Th>Documento</Th>
                  <Th>Contacto</Th>
                  <Th>Vehículo</Th>
                  <Th>Estado</Th>
                  <Th>Acciones</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredDeliveryPersons.length > 0 ? (
                  filteredDeliveryPersons.map((dp) => (
                    <Tr key={dp.id}>
                      <Td>{dp.name}</Td>
                      <Td>
                        {dp.documentType}: {dp.documentNumber}
                      </Td>
                      <Td>
                        <Text>{dp.email}</Text>
                        <Text fontSize="sm" color="gray.600">{dp.phone}</Text>
                      </Td>
                      <Td>
                        <Flex align="center" gap={2}>
                          {getVehicleIcon(dp.vehicleType)}
                          <Text>{dp.vehiclePlate || 'Sin placa'}</Text>
                        </Flex>
                      </Td>
                      <Td>{getStatusBadge(dp.status, dp.active)}</Td>
                      <Td>
                        <Menu>
                          <MenuButton
                            as={Button}
                            rightIcon={<ChevronDownIcon />}
                            size="sm"
                            colorScheme="blue"
                            variant="outline"
                          >
                            Acciones
                          </MenuButton>
                          <MenuList>
                            <MenuItem icon={<FaEye />} onClick={() => console.log('Ver detalles', dp.id)}>
                              Ver detalles
                            </MenuItem>
                            <MenuItem icon={<FaEdit />} onClick={() => openEditModal(dp)}>
                              Editar
                            </MenuItem>
                            {dp.active && (
                              <MenuItem 
                                icon={<FaTrash />} 
                                onClick={() => openDeleteModal(dp)}
                                color="red.500"
                              >
                                Desactivar
                              </MenuItem>
                            )}
                            {dp.active && dp.status !== 'available' && (
                              <MenuItem 
                                onClick={() => handleUpdateStatus(dp.id, 'available')}
                                color="green.500"
                              >
                                Marcar como disponible
                              </MenuItem>
                            )}
                            {dp.active && dp.status !== 'offline' && (
                              <MenuItem 
                                onClick={() => handleUpdateStatus(dp.id, 'offline')}
                                color="red.500"
                              >
                                Marcar como desconectado
                              </MenuItem>
                            )}
                          </MenuList>
                        </Menu>
                      </Td>
                    </Tr>
                  ))
                ) : (
                  <Tr>
                    <Td colSpan={6} textAlign="center" py={4}>
                      No se encontraron repartidores con los filtros seleccionados
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          </Box>
        </Box>
      </Stack>

      {/* Modal para crear repartidor */}
      <Modal isOpen={isCreateModalOpen} onClose={onCreateModalClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Crear Nuevo Repartidor</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={4}>
              <FormControl isInvalid={formErrors.name}>
                <FormLabel>Nombre completo</FormLabel>
                <Input 
                  name="name" 
                  value={formData.name} 
                  onChange={handleInputChange} 
                  placeholder="Nombre completo"
                />
                <FormErrorMessage>{formErrors.name}</FormErrorMessage>
              </FormControl>
              
              <Flex gap={4}>
                <FormControl>
                  <FormLabel>Tipo de documento</FormLabel>
                  <Select 
                    name="documentType" 
                    value={formData.documentType} 
                    onChange={handleInputChange}
                  >
                    <option value="DNI">DNI</option>
                    <option value="Pasaporte">Pasaporte</option>
                    <option value="Carnet de Extranjería">Carnet de Extranjería</option>
                  </Select>
                </FormControl>
                
                <FormControl isInvalid={formErrors.documentNumber}>
                  <FormLabel>Número de documento</FormLabel>
                  <Input 
                    name="documentNumber" 
                    value={formData.documentNumber} 
                    onChange={handleInputChange} 
                    placeholder="Número de documento"
                  />
                  <FormErrorMessage>{formErrors.documentNumber}</FormErrorMessage>
                </FormControl>
              </Flex>
              
              <FormControl isInvalid={formErrors.email}>
                <FormLabel>Correo electrónico</FormLabel>
                <Input 
                  name="email" 
                  type="email" 
                  value={formData.email} 
                  onChange={handleInputChange} 
                  placeholder="correo@ejemplo.com"
                />
                <FormErrorMessage>{formErrors.email}</FormErrorMessage>
              </FormControl>
              
              <FormControl isInvalid={formErrors.password}>
                <FormLabel>{selectedDeliveryPerson ? 'Contraseña (dejar en blanco para no cambiar)' : 'Contraseña'}</FormLabel>
                <Input 
                  name="password" 
                  type="password" 
                  value={formData.password} 
                  onChange={handleInputChange} 
                  placeholder="Contraseña"
                />
                <FormErrorMessage>{formErrors.password}</FormErrorMessage>
              </FormControl>
              
              <FormControl isInvalid={formErrors.phone}>
                <FormLabel>Teléfono</FormLabel>
                <Input 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleInputChange} 
                  placeholder="Número de teléfono"
                />
                <FormErrorMessage>{formErrors.phone}</FormErrorMessage>
              </FormControl>
              
              <FormControl>
                <FormLabel>Dirección</FormLabel>
                <Input 
                  name="address" 
                  value={formData.address} 
                  onChange={handleInputChange} 
                  placeholder="Dirección"
                />
              </FormControl>
              
              <Flex gap={4}>
                <FormControl>
                  <FormLabel>Tipo de vehículo</FormLabel>
                  <Select 
                    name="vehicleType" 
                    value={formData.vehicleType} 
                    onChange={handleInputChange}
                  >
                    <option value="motorcycle">Motocicleta</option>
                    <option value="car">Automóvil</option>
                    <option value="bicycle">Bicicleta</option>
                  </Select>
                </FormControl>
                
                <FormControl>
                  <FormLabel>Placa del vehículo</FormLabel>
                  <Input 
                    name="vehiclePlate" 
                    value={formData.vehiclePlate} 
                    onChange={handleInputChange} 
                    placeholder="Placa del vehículo"
                  />
                </FormControl>
              </Flex>
              
              <FormControl>
                <FormLabel>Estado inicial</FormLabel>
                <Select 
                  name="status" 
                  value={formData.status} 
                  onChange={handleInputChange}
                >
                  <option value="available">Disponible</option>
                  <option value="offline">Desconectado</option>
                </Select>
              </FormControl>
              
              <FormControl>
                <FormLabel>Notas adicionales</FormLabel>
                <Input 
                  name="notes" 
                  value={formData.notes} 
                  onChange={handleInputChange} 
                  placeholder="Notas adicionales"
                />
              </FormControl>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onCreateModalClose}>
              Cancelar
            </Button>
            <Button colorScheme="blue" onClick={handleCreateDeliveryPerson}>
              Crear Repartidor
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal para editar repartidor */}
      <Modal isOpen={isEditModalOpen} onClose={onEditModalClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Editar Repartidor</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={4}>
              <FormControl isInvalid={formErrors.name}>
                <FormLabel>Nombre completo</FormLabel>
                <Input 
                  name="name" 
                  value={formData.name} 
                  onChange={handleInputChange} 
                  placeholder="Nombre completo"
                />
                <FormErrorMessage>{formErrors.name}</FormErrorMessage>
              </FormControl>
              
              <Flex gap={4}>
                <FormControl>
                  <FormLabel>Tipo de documento</FormLabel>
                  <Select 
                    name="documentType" 
                    value={formData.documentType} 
                    onChange={handleInputChange}
                  >
                    <option value="DNI">DNI</option>
                    <option value="Pasaporte">Pasaporte</option>
                    <option value="Carnet de Extranjería">Carnet de Extranjería</option>
                  </Select>
                </FormControl>
                
                <FormControl isInvalid={formErrors.documentNumber}>
                  <FormLabel>Número de documento</FormLabel>
                  <Input 
                    name="documentNumber" 
                    value={formData.documentNumber} 
                    onChange={handleInputChange} 
                    placeholder="Número de documento"
                  />
                  <FormErrorMessage>{formErrors.documentNumber}</FormErrorMessage>
                </FormControl>
              </Flex>
              
              <FormControl isInvalid={formErrors.email}>
                <FormLabel>Correo electrónico</FormLabel>
                <Input 
                  name="email" 
                  type="email" 
                  value={formData.email} 
                  onChange={handleInputChange} 
                  placeholder="correo@ejemplo.com"
                />
                <FormErrorMessage>{formErrors.email}</FormErrorMessage>
              </FormControl>
              
              <FormControl isInvalid={formErrors.password}>
                <FormLabel>Contraseña (dejar en blanco para no cambiar)</FormLabel>
                <Input 
                  name="password" 
                  type="password" 
                  value={formData.password} 
                  onChange={handleInputChange} 
                  placeholder="Nueva contraseña"
                />
                <FormErrorMessage>{formErrors.password}</FormErrorMessage>
              </FormControl>
              
              <FormControl isInvalid={formErrors.phone}>
                <FormLabel>Teléfono</FormLabel>
                <Input 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleInputChange} 
                  placeholder="Número de teléfono"
                />
                <FormErrorMessage>{formErrors.phone}</FormErrorMessage>
              </FormControl>
              
              <FormControl>
                <FormLabel>Dirección</FormLabel>
                <Input 
                  name="address" 
                  value={formData.address} 
                  onChange={handleInputChange} 
                  placeholder="Dirección"
                />
              </FormControl>
              
              <Flex gap={4}>
                <FormControl>
                  <FormLabel>Tipo de vehículo</FormLabel>
                  <Select 
                    name="vehicleType" 
                    value={formData.vehicleType} 
                    onChange={handleInputChange}
                  >
                    <option value="motorcycle">Motocicleta</option>
                    <option value="car">Automóvil</option>
                    <option value="bicycle">Bicicleta</option>
                  </Select>
                </FormControl>
                
                <FormControl>
                  <FormLabel>Placa del vehículo</FormLabel>
                  <Input 
                    name="vehiclePlate" 
                    value={formData.vehiclePlate} 
                    onChange={handleInputChange} 
                    placeholder="Placa del vehículo"
                  />
                </FormControl>
              </Flex>
              
              <FormControl>
                <FormLabel>Estado</FormLabel>
                <Select 
                  name="status" 
                  value={formData.status} 
                  onChange={handleInputChange}
                >
                  <option value="available">Disponible</option>
                  <option value="busy">Ocupado</option>
                  <option value="offline">Desconectado</option>
                </Select>
              </FormControl>
              
              <FormControl>
                <FormLabel>Notas adicionales</FormLabel>
                <Input 
                  name="notes" 
                  value={formData.notes} 
                  onChange={handleInputChange} 
                  placeholder="Notas adicionales"
                />
              </FormControl>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onEditModalClose}>
              Cancelar
            </Button>
            <Button colorScheme="blue" onClick={handleEditDeliveryPerson}>
              Guardar Cambios
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal para confirmar desactivación */}
      <Modal isOpen={isDeleteModalOpen} onClose={onDeleteModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirmar Desactivación</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>¿Estás seguro de que deseas desactivar al repartidor {selectedDeliveryPerson?.name}?</Text>
            <Text mt={2} fontWeight="bold" color="red.500">
              Esta acción también desactivará la cuenta de usuario asociada.
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onDeleteModalClose}>
              Cancelar
            </Button>
            <Button colorScheme="red" onClick={handleDeactivateDeliveryPerson}>
              Desactivar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default DeliveryPersonManagement;