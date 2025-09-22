import React, { useState, useEffect } from 'react';
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
  Textarea,
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
  Switch,
  useColorModeValue
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon, ViewIcon, AddIcon } from '@chakra-ui/icons';
import axios from 'axios';

const TermsAndConditionsManagement = () => {
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    version: '',
    title: '',
    content: '',
    effectiveDate: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [statusFilter, setStatusFilter] = useState('all');
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    fetchTerms();
  }, [pagination.page, statusFilter]);

  const fetchTerms = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit
      });
      
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const response = await axios.get(`/api/terms-and-conditions?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setTerms(response.data.data || []);
      setPagination(prev => ({
        ...prev,
        total: response.data.pagination?.total || 0,
        pages: response.data.pagination?.pages || 1
      }));
    } catch (error) {
      console.error('Error fetching terms:', error);
      toast({
        title: 'Error',
        description: 'Error al cargar términos y condiciones',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedTerm(null);
    setIsEditing(true);
    setFormData({
      version: '',
      title: '',
      content: '',
      effectiveDate: new Date().toISOString().split('T')[0]
    });
    onOpen();
  };

  const handleEdit = (term) => {
    setSelectedTerm(term);
    setIsEditing(true);
    setFormData({
      version: term.version,
      title: term.title,
      content: term.content,
      effectiveDate: term.effectiveDate.split('T')[0]
    });
    onOpen();
  };

  const handleView = (term) => {
    setSelectedTerm(term);
    setIsEditing(false);
    setFormData({
      version: term.version,
      title: term.title,
      content: term.content,
      effectiveDate: term.effectiveDate.split('T')[0]
    });
    onOpen();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      if (selectedTerm) {
        // Actualizar
        await axios.put(`/api/terms-and-conditions/${selectedTerm.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast({
          title: 'Éxito',
          description: 'Términos y condiciones actualizados',
          status: 'success',
          duration: 3000,
          isClosable: true
        });
      } else {
        // Crear
        await axios.post('/api/terms-and-conditions', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast({
          title: 'Éxito',
          description: 'Términos y condiciones creados',
          status: 'success',
          duration: 3000,
          isClosable: true
        });
      }
      
      onClose();
      fetchTerms();
    } catch (error) {
      console.error('Error saving terms:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Error al guardar términos',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  };

  const handleToggleStatus = async (term) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`/api/terms-and-conditions/${term.id}/toggle`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast({
        title: 'Éxito',
        description: `Términos ${term.isActive ? 'desactivados' : 'activados'}`,
        status: 'success',
        duration: 3000,
        isClosable: true
      });
      
      fetchTerms();
    } catch (error) {
      console.error('Error toggling status:', error);
      toast({
        title: 'Error',
        description: 'Error al cambiar estado',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  };

  const handleDelete = async (term) => {
    if (!window.confirm('¿Estás seguro de eliminar estos términos y condiciones?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/terms-and-conditions/${term.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast({
        title: 'Éxito',
        description: 'Términos y condiciones eliminados',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
      
      fetchTerms();
    } catch (error) {
      console.error('Error deleting terms:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Error al eliminar términos',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-PE');
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
            Gestión de Términos y Condiciones
          </Text>
          <Button
            leftIcon={<AddIcon />}
            colorScheme="blue"
            onClick={handleCreate}
          >
            Crear Nuevos Términos
          </Button>
        </HStack>

        {/* Filtros */}
        <HStack spacing={4}>
          <FormControl maxW="200px">
            <FormLabel>Estado</FormLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Todos</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </Select>
          </FormControl>
        </HStack>

        {/* Tabla */}
        <Box overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Versión</Th>
                <Th>Título</Th>
                <Th>Estado</Th>
                <Th>Fecha Vigencia</Th>
                <Th>Creado</Th>
                <Th>Acciones</Th>
              </Tr>
            </Thead>
            <Tbody>
              {terms.map((term) => (
                <Tr key={term.id}>
                  <Td fontWeight="bold">{term.version}</Td>
                  <Td maxW="300px" isTruncated>{term.title}</Td>
                  <Td>
                    <Badge
                      colorScheme={term.isActive ? 'green' : 'red'}
                      variant="subtle"
                    >
                      {term.isActive ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </Td>
                  <Td>{formatDate(term.effectiveDate)}</Td>
                  <Td>{formatDate(term.createdAt)}</Td>
                  <Td>
                    <HStack spacing={2}>
                      <Tooltip label="Ver">
                        <IconButton
                          icon={<ViewIcon />}
                          size="sm"
                          variant="ghost"
                          onClick={() => handleView(term)}
                        />
                      </Tooltip>
                      <Tooltip label="Editar">
                        <IconButton
                          icon={<EditIcon />}
                          size="sm"
                          variant="ghost"
                          colorScheme="blue"
                          onClick={() => handleEdit(term)}
                        />
                      </Tooltip>
                      <Tooltip label={term.isActive ? 'Desactivar' : 'Activar'}>
                        <Switch
                          isChecked={term.isActive}
                          onChange={() => handleToggleStatus(term)}
                          colorScheme="green"
                        />
                      </Tooltip>
                      {!term.isActive && (
                        <Tooltip label="Eliminar">
                          <IconButton
                            icon={<DeleteIcon />}
                            size="sm"
                            variant="ghost"
                            colorScheme="red"
                            onClick={() => handleDelete(term)}
                          />
                        </Tooltip>
                      )}
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
        <ModalContent maxW="800px">
          <ModalHeader>
            {isEditing ? 'Editar Términos y Condiciones' : 'Ver Términos y Condiciones'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <form onSubmit={handleSubmit}>
              <VStack spacing={4} align="stretch">
                <HStack>
                  <FormControl isRequired>
                    <FormLabel>Versión</FormLabel>
                    <Input
                      value={formData.version}
                      onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))}
                      placeholder="ej: 1.0, 2.0"
                      isDisabled={!isEditing}
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Fecha de Vigencia</FormLabel>
                    <Input
                      type="date"
                      value={formData.effectiveDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, effectiveDate: e.target.value }))}
                      isDisabled={!isEditing}
                    />
                  </FormControl>
                </HStack>

                <FormControl isRequired>
                  <FormLabel>Título</FormLabel>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Título de los términos y condiciones"
                    isDisabled={!isEditing}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Contenido</FormLabel>
                  <Textarea
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Contenido completo de los términos y condiciones..."
                    rows={15}
                    isDisabled={!isEditing}
                  />
                </FormControl>

                {isEditing && (
                  <HStack justify="flex-end">
                    <Button variant="ghost" onClick={onClose}>
                      Cancelar
                    </Button>
                    <Button type="submit" colorScheme="blue">
                      {selectedTerm ? 'Actualizar' : 'Crear'}
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

export default TermsAndConditionsManagement;
