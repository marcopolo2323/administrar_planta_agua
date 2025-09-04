import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Select,
  Stack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormErrorMessage,
  Switch,
  Text,
  useToast,
} from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons';
import DeliveryFeeService from '../../services/DeliveryFeeService';

const DeliveryFeeManagement = () => {
  const [deliveryFees, setDeliveryFees] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentFee, setCurrentFee] = useState(null);
  const [formData, setFormData] = useState({
    district: '',
    fee: '',
    active: true,
  });
  const [errors, setErrors] = useState({});
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  // Cargar tarifas de envío al montar el componente
  useEffect(() => {
    fetchDeliveryFees();
  }, []);

  // Obtener todas las tarifas de envío
  const fetchDeliveryFees = async () => {
    setIsLoading(true);
    try {
      const response = await DeliveryFeeService.getAllDeliveryFees();
      setDeliveryFees(response.data);
    } catch (error) {
      console.error('Error al obtener tarifas de envío:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las tarifas de envío',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });

    // Limpiar errores al escribir
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};
    if (!formData.district.trim()) {
      newErrors.district = 'El distrito es requerido';
    }

    if (!formData.fee.toString().trim()) {
      newErrors.fee = 'La tarifa es requerida';
    } else if (isNaN(formData.fee) || parseFloat(formData.fee) < 0) {
      newErrors.fee = 'La tarifa debe ser un número positivo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Abrir modal para crear nueva tarifa
  const handleOpenCreateModal = () => {
    setCurrentFee(null);
    setFormData({
      district: '',
      fee: '',
      active: true,
    });
    setErrors({});
    onOpen();
  };

  // Abrir modal para editar tarifa existente
  const handleOpenEditModal = (fee) => {
    setCurrentFee(fee);
    setFormData({
      district: fee.district,
      fee: fee.fee,
      active: fee.active,
    });
    setErrors({});
    onOpen();
  };

  // Guardar tarifa (crear o actualizar)
  const handleSaveDeliveryFee = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      if (currentFee) {
        // Actualizar tarifa existente
        await DeliveryFeeService.updateDeliveryFee(currentFee.id, formData);
        toast({
          title: 'Éxito',
          description: 'Tarifa de envío actualizada correctamente',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else {
        // Crear nueva tarifa
        await DeliveryFeeService.createDeliveryFee(formData);
        toast({
          title: 'Éxito',
          description: 'Tarifa de envío creada correctamente',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      }
      onClose();
      fetchDeliveryFees();
    } catch (error) {
      console.error('Error al guardar tarifa de envío:', error);
      const errorMessage = error.response?.data?.message || 'Error al guardar la tarifa de envío';
      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Cambiar estado de tarifa (activo/inactivo)
  const handleToggleStatus = async (fee) => {
    setIsLoading(true);
    try {
      await DeliveryFeeService.updateDeliveryFee(fee.id, {
        ...fee,
        active: !fee.active,
      });
      toast({
        title: 'Éxito',
        description: `Tarifa de envío ${fee.active ? 'desactivada' : 'activada'} correctamente`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      fetchDeliveryFees();
    } catch (error) {
      console.error('Error al cambiar estado de tarifa:', error);
      toast({
        title: 'Error',
        description: 'No se pudo cambiar el estado de la tarifa',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Eliminar tarifa
  const handleDeleteDeliveryFee = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta tarifa de envío?')) return;

    setIsLoading(true);
    try {
      await DeliveryFeeService.deleteDeliveryFee(id);
      toast({
        title: 'Éxito',
        description: 'Tarifa de envío eliminada correctamente',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      fetchDeliveryFees();
    } catch (error) {
      console.error('Error al eliminar tarifa:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar la tarifa de envío',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxW="container.xl" py={5}>
      <Flex justifyContent="space-between" alignItems="center" mb={5}>
        <Heading size="lg">Gestión de Tarifas de Envío</Heading>
        <Button
          leftIcon={<AddIcon />}
          colorScheme="blue"
          onClick={handleOpenCreateModal}
          isLoading={isLoading}
        >
          Nueva Tarifa
        </Button>
      </Flex>

      <Box overflowX="auto">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Distrito</Th>
              <Th>Tarifa (S/)</Th>
              <Th>Estado</Th>
              <Th>Acciones</Th>
            </Tr>
          </Thead>
          <Tbody>
            {deliveryFees.length > 0 ? (
              deliveryFees.map((fee) => (
                <Tr key={fee.id}>
                  <Td>{fee.district}</Td>
                  <Td>S/ {parseFloat(fee.fee).toFixed(2)}</Td>
                  <Td>
                    <Switch
                      isChecked={fee.active}
                      onChange={() => handleToggleStatus(fee)}
                      colorScheme="green"
                      isDisabled={isLoading}
                    />
                    <Text as="span" ml={2}>
                      {fee.active ? 'Activo' : 'Inactivo'}
                    </Text>
                  </Td>
                  <Td>
                    <IconButton
                      icon={<EditIcon />}
                      aria-label="Editar"
                      colorScheme="blue"
                      size="sm"
                      mr={2}
                      onClick={() => handleOpenEditModal(fee)}
                      isDisabled={isLoading}
                    />
                    <IconButton
                      icon={<DeleteIcon />}
                      aria-label="Eliminar"
                      colorScheme="red"
                      size="sm"
                      onClick={() => handleDeleteDeliveryFee(fee.id)}
                      isDisabled={isLoading}
                    />
                  </Td>
                </Tr>
              ))
            ) : (
              <Tr>
                <Td colSpan={4} textAlign="center">
                  No hay tarifas de envío registradas
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </Box>

      {/* Modal para crear/editar tarifa */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {currentFee ? 'Editar Tarifa de Envío' : 'Nueva Tarifa de Envío'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={4}>
              <FormControl isInvalid={!!errors.district}>
                <FormLabel>Distrito</FormLabel>
                <Input
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  placeholder="Ingrese el distrito"
                />
                <FormErrorMessage>{errors.district}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.fee}>
                <FormLabel>Tarifa (S/)</FormLabel>
                <Input
                  name="fee"
                  value={formData.fee}
                  onChange={handleChange}
                  placeholder="Ingrese la tarifa"
                  type="number"
                  step="0.01"
                  min="0"
                />
                <FormErrorMessage>{errors.fee}</FormErrorMessage>
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="active" mb="0">
                  Activo
                </FormLabel>
                <Switch
                  id="active"
                  name="active"
                  isChecked={formData.active}
                  onChange={handleChange}
                  colorScheme="green"
                />
              </FormControl>
            </Stack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancelar
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleSaveDeliveryFee}
              isLoading={isLoading}
            >
              Guardar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default DeliveryFeeManagement;