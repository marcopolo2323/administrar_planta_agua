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
  NumberInput,
  NumberInputField,
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
  Textarea
} from '@chakra-ui/react';
import { 
  AddIcon, 
  EditIcon, 
  DeleteIcon
} from '@chakra-ui/icons';
import {
  FaTruck,
  FaMapMarkerAlt,
  FaMoneyBillWave
} from 'react-icons/fa';
import useDeliveryStore from '../stores/deliveryStore';
import useDistrictStore from '../stores/districtStore';

const DeliveryFeesManagement = () => {
  const [editingFee, setEditingFee] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const isMobile = useBreakpointValue({ base: true, md: false });

  // Helper function para formatear números de manera segura
  const formatNumber = (value, decimals = 2) => {
    if (value === null || value === undefined || value === '') return '0.00';
    const num = parseFloat(value);
    return isNaN(num) ? '0.00' : num.toFixed(decimals);
  };

  // Store
  const {
    deliveryFees,
    loading,
    error,
    fetchDeliveryFees,
    createDeliveryFee,
    updateDeliveryFee,
    deleteDeliveryFee,
    clearError
  } = useDeliveryStore();

  const {
    districts,
    loading: districtsLoading,
    error: districtsError,
    fetchDistricts,
    updateDistrict,
    createDistrict,
    clearError: clearDistrictsError
  } = useDistrictStore();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    price: 0
  });

  useEffect(() => {
    console.log('🔄 Cargando tarifas de envío y distritos...');
    fetchDeliveryFees().then(result => {
      console.log('📦 Resultado de fetchDeliveryFees:', result);
      console.log('📦 deliveryFees en estado:', deliveryFees);
    });
    fetchDistricts().then(result => {
      console.log('📦 Resultado de fetchDistricts:', result);
      console.log('📦 districts en estado:', districts);
    });
  }, [fetchDeliveryFees, fetchDistricts]);

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
    console.log('🔄 Enviando formulario con datos:', formData);
    console.log('🔄 Editando distrito:', editingFee);
    
    const result = editingFee 
      ? await updateDistrict(editingFee.id, { name: formData.name, deliveryFee: formData.price })
      : await createDistrict({ name: formData.name, deliveryFee: formData.price });
    
    console.log('📦 Resultado de la operación:', result);
    
    if (result.success) {
      toast({
        title: editingFee ? 'Distrito actualizado' : 'Distrito creado',
        description: `El distrito ha sido ${editingFee ? 'actualizado' : 'creado'}`,
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
      resetForm();
      onClose();
    }
  };

  const handleEdit = (district) => {
    setEditingFee(district);
    setFormData({
      name: district.name,
      price: district.deliveryFee || 0
    });
    onOpen();
  };

  const handleDelete = async (districtId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este distrito?')) {
      // Por ahora solo mostramos un mensaje, ya que no tenemos función de eliminar distritos
      toast({
        title: 'Función no disponible',
        description: 'La eliminación de distritos no está disponible por el momento',
        status: 'warning',
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: 0
    });
    setEditingFee(null);
  };

  const openModal = () => {
    resetForm();
    onOpen();
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
          Gestión de Distritos y Fletes
        </Heading>
        <Button
          colorScheme="blue"
          leftIcon={<AddIcon />}
          onClick={openModal}
        >
          Nuevo Distrito
        </Button>
      </Flex>

      {/* Lista de distritos */}
      {districts.length === 0 ? (
        <Alert status="info">
          <AlertIcon />
          No hay distritos configurados.
        </Alert>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {Array.isArray(districts) ? districts.map((district, index) => (
            <Card key={district.id || `district-${index}`} variant="outline">
              <CardHeader>
                <Flex justify="space-between" align="center">
                  <Heading size="md">{district.name || 'Sin nombre'}</Heading>
                  <Badge colorScheme="green">
                    Activo
                  </Badge>
                </Flex>
              </CardHeader>
              <CardBody>
                <VStack spacing={3} align="start">
                  <HStack>
                    <FaMoneyBillWave color="gray.500" />
                    <Text fontSize="lg" fontWeight="bold" color="blue.600">
                      S/ {formatNumber(district.deliveryFee || 0)}
                    </Text>
                  </HStack>

                  <HStack spacing={2} w="full" justify="end">
                    <IconButton
                      size="sm"
                      icon={<EditIcon />}
                      onClick={() => handleEdit(district)}
                      colorScheme="blue"
                      variant="outline"
                    />
                    <IconButton
                      size="sm"
                      icon={<DeleteIcon />}
                      onClick={() => handleDelete(district.id)}
                      colorScheme="red"
                      variant="outline"
                    />
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
              {editingFee ? 'Editar Distrito' : 'Nuevo Distrito'}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Nombre del Distrito/Ciudad</FormLabel>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej: San Isidro, Miraflores, Lima Centro"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Precio de Flete por Distrito (S/)</FormLabel>
                  <NumberInput
                    value={formData.price}
                    onChange={(value) => setFormData({ ...formData, price: parseFloat(value) || 0 })}
                    min={0}
                    precision={2}
                  >
                    <NumberInputField />
                  </NumberInput>
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Cancelar
              </Button>
              <Button colorScheme="blue" type="submit">
                {editingFee ? 'Actualizar' : 'Crear'}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default DeliveryFeesManagement;
