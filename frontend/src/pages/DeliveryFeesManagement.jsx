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

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    basePrice: 0,
    pricePerKm: 0,
    minOrderAmount: 0,
    maxDistance: 0,
    isActive: true
  });

  useEffect(() => {
    console.log('🔄 Cargando tarifas de envío...');
    fetchDeliveryFees().then(result => {
      console.log('📦 Resultado de fetchDeliveryFees:', result);
      console.log('📦 deliveryFees en estado:', deliveryFees);
    });
  }, [fetchDeliveryFees]);

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
    const result = editingFee 
      ? await updateDeliveryFee(editingFee.id, formData)
      : await createDeliveryFee(formData);
    
    if (result.success) {
      toast({
        title: editingFee ? 'Tarifa actualizada' : 'Tarifa creada',
        description: `La tarifa de envío ha sido ${editingFee ? 'actualizada' : 'creada'}`,
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
      resetForm();
      onClose();
    }
  };

  const handleEdit = (fee) => {
    setEditingFee(fee);
    setFormData({
      name: fee.name,
      description: fee.description,
      basePrice: fee.basePrice,
      pricePerKm: fee.pricePerKm,
      minOrderAmount: fee.minOrderAmount,
      maxDistance: fee.maxDistance,
      isActive: fee.isActive
    });
    onOpen();
  };

  const handleDelete = async (feeId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta tarifa?')) {
      const result = await deleteDeliveryFee(feeId);
      if (result.success) {
        toast({
          title: 'Tarifa eliminada',
          description: 'La tarifa de envío ha sido eliminada',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      basePrice: 0,
      pricePerKm: 0,
      minOrderAmount: 0,
      maxDistance: 0,
      isActive: true
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
          Gestión de Tarifas de Envío
        </Heading>
        <Button
          colorScheme="blue"
          leftIcon={<AddIcon />}
          onClick={openModal}
        >
          Nueva Tarifa
        </Button>
      </Flex>

      {/* Lista de tarifas */}
      {deliveryFees.length === 0 ? (
        <Alert status="info">
          <AlertIcon />
          No hay tarifas de envío configuradas.
        </Alert>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {Array.isArray(deliveryFees) ? deliveryFees.map((fee) => {
            console.log('📦 Fee data:', fee);
            return (
            <Card key={fee.id} variant="outline">
              <CardHeader>
                <Flex justify="space-between" align="center">
                  <Heading size="md">{fee.name || 'Sin nombre'}</Heading>
                  <Badge colorScheme={fee.isActive ? 'green' : 'red'}>
                    {fee.isActive ? 'Activa' : 'Inactiva'}
                  </Badge>
                </Flex>
              </CardHeader>
              <CardBody>
                <VStack spacing={3} align="start">
                  <Text fontSize="sm" color="gray.600">
                    {fee.description || 'Sin descripción'}
                  </Text>
                  
                  <HStack>
                    <FaMoneyBillWave color="gray.500" />
                    <Text fontSize="sm">
                      Precio base: S/ {formatNumber(fee.basePrice)}
                    </Text>
                  </HStack>
                  
                  <HStack>
                    <FaTruck color="gray.500" />
                    <Text fontSize="sm">
                      Por km: S/ {formatNumber(fee.pricePerKm)}
                    </Text>
                  </HStack>
                  
                  <HStack>
                    <FaMapMarkerAlt color="gray.500" />
                    <Text fontSize="sm">
                      Distancia máxima: {formatNumber(fee.maxDistance, 0)} km
                    </Text>
                  </HStack>
                  
                  <Text fontSize="sm" color="gray.600">
                    Pedido mínimo: S/ {formatNumber(fee.minOrderAmount)}
                  </Text>

                  <HStack spacing={2} w="full" justify="end">
                    <IconButton
                      size="sm"
                      icon={<EditIcon />}
                      onClick={() => handleEdit(fee)}
                      colorScheme="blue"
                      variant="outline"
                    />
                    <IconButton
                      size="sm"
                      icon={<DeleteIcon />}
                      onClick={() => handleDelete(fee.id)}
                      colorScheme="red"
                      variant="outline"
                    />
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
            );
          }) : null}
        </SimpleGrid>
      )}

      {/* Modal de formulario */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <form onSubmit={handleSubmit}>
            <ModalHeader>
              {editingFee ? 'Editar Tarifa de Envío' : 'Nueva Tarifa de Envío'}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Nombre de la tarifa</FormLabel>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej: Envío local, Envío express"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Descripción</FormLabel>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descripción de la tarifa"
                  />
                </FormControl>

                <SimpleGrid columns={2} spacing={4} w="full">
                  <FormControl isRequired>
                    <FormLabel>Precio base (S/)</FormLabel>
                    <NumberInput
                      value={formData.basePrice}
                      onChange={(value) => setFormData({ ...formData, basePrice: parseFloat(value) || 0 })}
                      min={0}
                      precision={2}
                    >
                      <NumberInputField />
                    </NumberInput>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Precio por km (S/)</FormLabel>
                    <NumberInput
                      value={formData.pricePerKm}
                      onChange={(value) => setFormData({ ...formData, pricePerKm: parseFloat(value) || 0 })}
                      min={0}
                      precision={2}
                    >
                      <NumberInputField />
                    </NumberInput>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Pedido mínimo (S/)</FormLabel>
                    <NumberInput
                      value={formData.minOrderAmount}
                      onChange={(value) => setFormData({ ...formData, minOrderAmount: parseFloat(value) || 0 })}
                      min={0}
                      precision={2}
                    >
                      <NumberInputField />
                    </NumberInput>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Distancia máxima (km)</FormLabel>
                    <NumberInput
                      value={formData.maxDistance}
                      onChange={(value) => setFormData({ ...formData, maxDistance: parseFloat(value) || 0 })}
                      min={0}
                      precision={1}
                    >
                      <NumberInputField />
                    </NumberInput>
                  </FormControl>
                </SimpleGrid>

                <FormControl>
                  <HStack>
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    />
                    <FormLabel htmlFor="isActive" mb={0}>
                      Tarifa activa
                    </FormLabel>
                  </HStack>
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
