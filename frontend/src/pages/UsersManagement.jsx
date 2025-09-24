import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Input,
  FormControl,
  FormLabel,
  Select,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast,
  Spinner,
  Center,
  Divider,
  IconButton,
  Tooltip,
  useColorModeValue,
  Switch,
  InputGroup,
  InputRightElement,
  Icon
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon, ViewIcon, AddIcon, ViewOffIcon } from '@chakra-ui/icons';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import axios from 'axios';
import useAuthStore from '../stores/authStore';

const UsersManagement = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useAuthStore();
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'repartidor',
    isActive: true,
    // Datos personales
    firstName: '',
    lastName: '',
    documentNumber: '',
    phone: '',
    address: '',
    district: '',
    reference: '',
    // Datos de repartidor
    vehicleType: '',
    vehiclePlate: '',
    licenseNumber: '',
    insuranceNumber: '',
    emergencyContact: '',
    emergencyPhone: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [roleFilter, setRoleFilter] = useState('all');
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Inicializar filtro desde URL
  useEffect(() => {
    const roleFromUrl = searchParams.get('role');
    if (roleFromUrl && roleFromUrl !== 'all') {
      setRoleFilter(roleFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      console.log('🔑 Token para usuarios:', token ? 'Presente' : 'Ausente');
      console.log('🔑 Token completo:', token);
      
      // Configurar el token en axios si no está configurado
      if (token && !axios.defaults.headers.common['Authorization']) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        console.log('🔑 Token configurado en axios');
      }
      
      // Verificar que el token esté en el header de axios
      console.log('🔑 Header Authorization actual:', axios.defaults.headers.common['Authorization']);
      
      // Usar endpoint que sabemos que funciona - obtener usuarios por rol
      console.log('🔄 Llamando a /api/users/role con role:', roleFilter);
      
      let response;
      if (roleFilter === 'all') {
        // Si es 'all', obtener usuarios de cada rol por separado
        console.log('🔄 Obteniendo usuarios de todos los roles...');
        const [adminUsers, vendedorUsers, repartidorUsers] = await Promise.all([
          axios.get('/api/users/role?role=admin'),
          axios.get('/api/users/role?role=vendedor'),
          axios.get('/api/users/role?role=repartidor')
        ]);
        
        console.log('📦 Admin users:', adminUsers.data);
        console.log('📦 Vendedor users:', vendedorUsers.data);
        console.log('📦 Repartidor users:', repartidorUsers.data);
        
        const allUsers = [
          ...(adminUsers.data.success ? adminUsers.data.data : []),
          ...(vendedorUsers.data.success ? vendedorUsers.data.data : []),
          ...(repartidorUsers.data.success ? repartidorUsers.data.data : [])
        ];
        
        response = { data: { success: true, data: allUsers } };
      } else {
        console.log('🔄 Obteniendo usuarios del rol:', roleFilter);
        response = await axios.get(`/api/users/role?role=${roleFilter}`);
      }
      
      console.log('📦 Respuesta usuarios:', response.data);

      if (response.data.success) {
        setUsers(response.data.data || []);
        setPagination(prev => ({
          ...prev,
          total: response.data.data?.length || 0,
          pages: 1
        }));
      } else {
        setUsers([]);
        setPagination(prev => ({ ...prev, total: 0, pages: 1 }));
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      console.error('Error details:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error headers:', error.response?.headers);
      toast({
        title: 'Error',
        description: 'Error al cargar usuarios',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedUser(null);
    setIsCreating(true);
    setIsEditing(true);
    setFormData({
      username: '',
      email: '',
      password: '',
      role: 'repartidor',
      isActive: true,
      // Datos personales
      firstName: '',
      lastName: '',
      documentNumber: '',
      phone: '',
      address: '',
      district: '',
      reference: '',
      // Datos de repartidor
      vehicleType: '',
      vehiclePlate: '',
      licenseNumber: '',
      insuranceNumber: '',
      emergencyContact: '',
      emergencyPhone: ''
    });
    onOpen();
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setIsCreating(false);
    setIsEditing(true);
    setFormData({
      username: user.username,
      email: user.email,
      password: '', // No mostrar contraseña existente
      role: user.role,
      isActive: user.isActive,
      // Datos personales
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      documentNumber: user.documentNumber || '',
      phone: user.phone || '',
      address: user.address || '',
      district: user.district || '',
      reference: user.reference || '',
      // Datos de repartidor
      vehicleType: user.vehicleType || '',
      vehiclePlate: user.vehiclePlate || '',
      licenseNumber: user.licenseNumber || '',
      insuranceNumber: user.insuranceNumber || '',
      emergencyContact: user.emergencyContact || '',
      emergencyPhone: user.emergencyPhone || ''
    });
    onOpen();
  };

  const handleView = (user) => {
    setSelectedUser(user);
    setIsCreating(false);
    setIsEditing(false);
    setFormData({
      username: user.username,
      email: user.email,
      password: '', // No mostrar contraseña
      role: user.role,
      isActive: user.isActive,
      // Datos personales
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      documentNumber: user.documentNumber || '',
      phone: user.phone || '',
      address: user.address || '',
      district: user.district || '',
      reference: user.reference || '',
      // Datos de repartidor
      vehicleType: user.vehicleType || '',
      vehiclePlate: user.vehiclePlate || '',
      licenseNumber: user.licenseNumber || '',
      insuranceNumber: user.insuranceNumber || '',
      emergencyContact: user.emergencyContact || '',
      emergencyPhone: user.emergencyPhone || ''
    });
    onOpen();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      // Preparar datos para envío
      const submitData = {
        username: formData.username,
        email: formData.email,
        role: formData.role,
        isActive: formData.isActive,
        firstName: formData.firstName || '',
        lastName: formData.lastName || '',
        phone: formData.phone || '',
        address: formData.address || '',
        district: formData.district || '',
        reference: formData.reference || ''
      };

      // Solo incluir password si se está creando o si se proporcionó una nueva
      if (isCreating || formData.password) {
        submitData.password = formData.password;
      }

      if (isCreating) {
        // Crear usuario
        await axios.post('/api/users', submitData);
        toast({
          title: 'Éxito',
          description: 'Usuario creado exitosamente',
          status: 'success',
          duration: 3000,
          isClosable: true
        });
      } else {
        // Actualizar usuario
        await axios.put(`/api/users/${selectedUser.id}`, submitData);
        toast({
          title: 'Éxito',
          description: 'Usuario actualizado exitosamente',
          status: 'success',
          duration: 3000,
          isClosable: true
        });
      }
      
      onClose();
      fetchUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Error al guardar usuario',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`/api/users/${user.id}/toggle-status`, {});
      
      toast({
        title: 'Éxito',
        description: `Usuario ${user.isActive ? 'desactivado' : 'activado'}`,
        status: 'success',
        duration: 3000,
        isClosable: true
      });
      
      fetchUsers();
    } catch (error) {
      console.error('Error toggling status:', error);
      toast({
        title: 'Error',
        description: 'Error al cambiar estado del usuario',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  };

  const handleDelete = async (user) => {
    // Prevenir que el admin se elimine a sí mismo
    if (currentUser && currentUser.id === user.id) {
      toast({
        title: 'Error',
        description: 'No puedes eliminarte a ti mismo',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
      return;
    }

    if (!window.confirm(`¿Estás seguro de eliminar al usuario "${user.username}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/users/${user.id}`);
      
      toast({
        title: 'Éxito',
        description: 'Usuario eliminado exitosamente',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
      
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Error al eliminar usuario',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'red';
      case 'vendedor': return 'blue';
      case 'repartidor': return 'green';
      default: return 'gray';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'vendedor': return 'Vendedor';
      case 'repartidor': return 'Repartidor';
      default: return role;
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
    <Box p={6} bg={bgColor} borderRadius="lg" boxShadow="sm">
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between">
          <Text fontSize="2xl" fontWeight="bold" color="blue.600">
            Gestión de Usuarios
          </Text>
          <Button
            leftIcon={<AddIcon />}
            colorScheme="blue"
            onClick={handleCreate}
          >
            Crear Usuario
          </Button>
        </HStack>

        {/* Filtros */}
        <HStack spacing={4}>
          <FormControl maxW="200px">
            <FormLabel>Rol</FormLabel>
            <Select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">Todos</option>
              <option value="admin">Administrador</option>
              <option value="vendedor">Vendedor</option>
              <option value="repartidor">Repartidor</option>
            </Select>
          </FormControl>
        </HStack>

        {/* Tabla */}
        <Box overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Usuario</Th>
                <Th>Nombre</Th>
                <Th>Email</Th>
                <Th>Rol</Th>
                <Th>Estado</Th>
                <Th>Creado</Th>
                <Th>Acciones</Th>
              </Tr>
            </Thead>
            <Tbody>
              {users.map((user) => (
                <Tr key={user.id}>
                  <Td fontWeight="bold">{user.username}</Td>
                  <Td>
                    {user.firstName && user.lastName 
                      ? `${user.firstName} ${user.lastName}` 
                      : user.firstName || user.lastName || '-'
                    }
                  </Td>
                  <Td>{user.email}</Td>
                  <Td>
                    <Badge
                      colorScheme={getRoleColor(user.role)}
                      variant="subtle"
                    >
                      {getRoleLabel(user.role)}
                    </Badge>
                  </Td>
                  <Td>
                    <Badge
                      colorScheme={user.isActive ? 'green' : 'red'}
                      variant="subtle"
                    >
                      {user.isActive ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </Td>
                  <Td>{new Date(user.createdAt).toLocaleDateString('es-PE')}</Td>
                  <Td>
                    <HStack spacing={2}>
                      <Tooltip label="Ver">
                        <IconButton
                          icon={<ViewIcon />}
                          size="sm"
                          variant="ghost"
                          onClick={() => handleView(user)}
                        />
                      </Tooltip>
                      <Tooltip label="Editar">
                        <IconButton
                          icon={<EditIcon />}
                          size="sm"
                          variant="ghost"
                          colorScheme="blue"
                          onClick={() => handleEdit(user)}
                        />
                      </Tooltip>
                      <Tooltip label={user.isActive ? 'Desactivar' : 'Activar'}>
                        <Switch
                          isChecked={user.isActive}
                          onChange={() => handleToggleStatus(user)}
                          colorScheme="green"
                        />
                      </Tooltip>
                      <Tooltip 
                        label={currentUser && currentUser.id === user.id ? 'No puedes eliminarte a ti mismo' : 'Eliminar'}
                      >
                        <IconButton
                          icon={<DeleteIcon />}
                          size="sm"
                          variant="ghost"
                          colorScheme="red"
                          isDisabled={currentUser && currentUser.id === user.id}
                          onClick={() => handleDelete(user)}
                        />
                      </Tooltip>
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>

        {/* Paginación */}
        {pagination.pages > 1 && (
          <HStack justify="center" spacing={4}>
            <Button
              isDisabled={pagination.page === 1}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            >
              Anterior
            </Button>
            <Text>
              Página {pagination.page} de {pagination.pages}
            </Text>
            <Button
              isDisabled={pagination.page === pagination.pages}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            >
              Siguiente
            </Button>
          </HStack>
        )}
      </VStack>

      {/* Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent maxW="800px" maxH="90vh" overflowY="auto">
          <ModalHeader>
            {isCreating ? 'Crear Usuario' : isEditing ? 'Editar Usuario' : 'Ver Usuario'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <form onSubmit={handleSubmit}>
              <VStack spacing={6} align="stretch">
                {/* Información básica */}
                <Box>
                  <Text fontSize="lg" fontWeight="bold" mb={4} color="blue.600">
                    Información Básica
                  </Text>
                  <VStack spacing={4}>
                    <HStack spacing={4} w="full">
                      <FormControl isRequired>
                        <FormLabel>Nombre de Usuario</FormLabel>
                        <Input
                          value={formData.username}
                          onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                          placeholder="Nombre de usuario"
                          isDisabled={!isEditing}
                        />
                      </FormControl>
                      <FormControl isRequired>
                        <FormLabel>Email</FormLabel>
                        <Input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="correo@ejemplo.com"
                          isDisabled={!isEditing}
                        />
                      </FormControl>
                    </HStack>

                    <HStack spacing={4} w="full">
                      <FormControl isRequired>
                        <FormLabel>Nombre</FormLabel>
                        <Input
                          value={formData.firstName}
                          onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                          placeholder="Nombre"
                          isDisabled={!isEditing}
                        />
                      </FormControl>
                      <FormControl isRequired>
                        <FormLabel>Apellido</FormLabel>
                        <Input
                          value={formData.lastName}
                          onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                          placeholder="Apellido"
                          isDisabled={!isEditing}
                        />
                      </FormControl>
                    </HStack>

                    <HStack spacing={4} w="full">
                      <FormControl>
                        <FormLabel>DNI</FormLabel>
                        <Input
                          value={formData.documentNumber}
                          onChange={(e) => setFormData(prev => ({ ...prev, documentNumber: e.target.value }))}
                          placeholder="12345678"
                          isDisabled={!isEditing}
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Teléfono</FormLabel>
                        <Input
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="987654321"
                          isDisabled={!isEditing}
                        />
                      </FormControl>
                    </HStack>

                    <FormControl isRequired={isCreating}>
                      <FormLabel>
                        Contraseña {!isCreating && '(dejar vacío para mantener la actual)'}
                      </FormLabel>
                      <InputGroup>
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                          placeholder={isCreating ? 'Contraseña' : 'Nueva contraseña (opcional)'}
                          isDisabled={!isEditing}
                        />
                        <InputRightElement>
                          <IconButton
                            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                            icon={showPassword ? <FaEyeSlash /> : <FaEye />}
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowPassword(!showPassword)}
                            isDisabled={!isEditing}
                          />
                        </InputRightElement>
                      </InputGroup>
                    </FormControl>

                    <HStack spacing={4} w="full">
                      <FormControl isRequired>
                        <FormLabel>Rol</FormLabel>
                        <Select
                          value={formData.role}
                          onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                          isDisabled={!isEditing}
                        >
                          <option value="repartidor">Repartidor</option>
                          <option value="vendedor">Vendedor</option>
                          <option value="admin">Administrador</option>
                        </Select>
                      </FormControl>
                      <FormControl>
                        <HStack justify="space-between">
                          <FormLabel mb={0}>Usuario Activo</FormLabel>
                          <Switch
                            isChecked={formData.isActive}
                            onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                            isDisabled={!isEditing}
                            colorScheme="green"
                          />
                        </HStack>
                      </FormControl>
                    </HStack>
                  </VStack>
                </Box>

                {/* Dirección */}
                <Box>
                  <Text fontSize="lg" fontWeight="bold" mb={4} color="blue.600">
                    Dirección
                  </Text>
                  <VStack spacing={4}>
                    <FormControl>
                      <FormLabel>Dirección</FormLabel>
                      <Input
                        value={formData.address}
                        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                        placeholder="Jr. Las Flores 123"
                        isDisabled={!isEditing}
                      />
                    </FormControl>
                    <HStack spacing={4} w="full">
                      <FormControl>
                        <FormLabel>Distrito</FormLabel>
                        <Input
                          value={formData.district}
                          onChange={(e) => setFormData(prev => ({ ...prev, district: e.target.value }))}
                          placeholder="Callería"
                          isDisabled={!isEditing}
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Referencia</FormLabel>
                        <Input
                          value={formData.reference}
                          onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
                          placeholder="Frente al parque"
                          isDisabled={!isEditing}
                        />
                      </FormControl>
                    </HStack>
                  </VStack>
                </Box>

                {/* Datos de repartidor (solo si es repartidor) */}
                {formData.role === 'repartidor' && (
                  <Box>
                    <Text fontSize="lg" fontWeight="bold" mb={4} color="green.600">
                      Datos de Repartidor
                    </Text>
                    <VStack spacing={4}>
                      <HStack spacing={4} w="full">
                        <FormControl>
                          <FormLabel>Tipo de Vehículo</FormLabel>
                          <Select
                            value={formData.vehicleType}
                            onChange={(e) => setFormData(prev => ({ ...prev, vehicleType: e.target.value }))}
                            isDisabled={!isEditing}
                          >
                            <option value="">Seleccionar</option>
                            <option value="motorcycle">Motocicleta</option>
                            <option value="bicycle">Bicicleta</option>
                            <option value="car">Auto</option>
                            <option value="truck">Camión</option>
                          </Select>
                        </FormControl>
                        <FormControl>
                          <FormLabel>Placa del Vehículo</FormLabel>
                          <Input
                            value={formData.vehiclePlate}
                            onChange={(e) => setFormData(prev => ({ ...prev, vehiclePlate: e.target.value }))}
                            placeholder="ABC-123"
                            isDisabled={!isEditing}
                          />
                        </FormControl>
                      </HStack>

                      <HStack spacing={4} w="full">
                        <FormControl>
                          <FormLabel>Número de Licencia</FormLabel>
                          <Input
                            value={formData.licenseNumber}
                            onChange={(e) => setFormData(prev => ({ ...prev, licenseNumber: e.target.value }))}
                            placeholder="12345678"
                            isDisabled={!isEditing}
                          />
                        </FormControl>
                        <FormControl>
                          <FormLabel>Número de Seguro</FormLabel>
                          <Input
                            value={formData.insuranceNumber}
                            onChange={(e) => setFormData(prev => ({ ...prev, insuranceNumber: e.target.value }))}
                            placeholder="987654321"
                            isDisabled={!isEditing}
                          />
                        </FormControl>
                      </HStack>

                      <HStack spacing={4} w="full">
                        <FormControl>
                          <FormLabel>Contacto de Emergencia</FormLabel>
                          <Input
                            value={formData.emergencyContact}
                            onChange={(e) => setFormData(prev => ({ ...prev, emergencyContact: e.target.value }))}
                            placeholder="María García"
                            isDisabled={!isEditing}
                          />
                        </FormControl>
                        <FormControl>
                          <FormLabel>Teléfono de Emergencia</FormLabel>
                          <Input
                            value={formData.emergencyPhone}
                            onChange={(e) => setFormData(prev => ({ ...prev, emergencyPhone: e.target.value }))}
                            placeholder="987654321"
                            isDisabled={!isEditing}
                          />
                        </FormControl>
                      </HStack>
                    </VStack>
                  </Box>
                )}

                {/* Botones */}
                {isEditing && (
                  <HStack justify="flex-end">
                    <Button variant="ghost" onClick={onClose}>
                      Cancelar
                    </Button>
                    <Button type="submit" colorScheme="blue">
                      {isCreating ? 'Crear' : 'Actualizar'}
                    </Button>
                  </HStack>
                )}

                {!isEditing && (
                  <HStack justify="flex-end">
                    <Button onClick={onClose}>
                      Cerrar
                    </Button>
                  </HStack>
                )}
              </VStack>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default UsersManagement;
