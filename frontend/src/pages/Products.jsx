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
  Center,
  SimpleGrid,
  useBreakpointValue
} from '@chakra-ui/react';
import { SearchIcon, AddIcon, EditIcon } from '@chakra-ui/icons';
import useProductStore from '../stores/productStore';

const Products = () => {
  // Store
  const {
    products,
    loading,
    error,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getFilteredProducts,
    clearError
  } = useProductStore();

  // Estados locales
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  // Estados para el formulario
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'bidon',
    unitPrice: '',
    wholesalePrice: '',
    wholesaleMinQuantity: '',
    wholesalePrice2: '',
    wholesaleMinQuantity2: '',
    wholesalePrice3: '',
    wholesaleMinQuantity3: '',
    stock: ''
  });

  const isMobile = useBreakpointValue({ base: true, md: false });

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

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

  const handleCreateProduct = async () => {
    const result = await createProduct(formData);
    if (result.success) {
      toast({
        title: 'Éxito',
        description: 'Producto creado correctamente',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onClose();
      resetForm();
    }
  };

  const handleUpdateProduct = async () => {
    const result = await updateProduct(selectedProduct.id, formData);
    if (result.success) {
      toast({
        title: 'Éxito',
        description: 'Producto actualizado correctamente',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onClose();
      resetForm();
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      const result = await deleteProduct(productId);
      if (result.success) {
        toast({
          title: 'Éxito',
          description: 'Producto eliminado correctamente',
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
      description: '',
      type: 'bidon',
      unitPrice: '',
      wholesalePrice: '',
      wholesaleMinQuantity: '',
      wholesalePrice2: '',
      wholesaleMinQuantity2: '',
      wholesalePrice3: '',
      wholesaleMinQuantity3: '',
      stock: ''
    });
    setSelectedProduct(null);
  };

  const openCreateModal = () => {
    resetForm();
    onOpen();
  };

  const openEditModal = (product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      type: product.type,
      unitPrice: product.unitPrice,
      wholesalePrice: product.wholesalePrice || '',
      wholesaleMinQuantity: product.wholesaleMinQuantity || '',
      wholesalePrice2: product.wholesalePrice2 || '',
      wholesaleMinQuantity2: product.wholesaleMinQuantity2 || '',
      wholesalePrice3: product.wholesalePrice3 || '',
      wholesaleMinQuantity3: product.wholesaleMinQuantity3 || '',
      stock: product.stock
    });
    onOpen();
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'bidon':
        return 'blue';
      case 'botella':
        return 'green';
      default:
        return 'gray';
    }
  };

  const getTypeText = (type) => {
    switch (type) {
      case 'bidon':
        return 'Bidón';
      case 'botella':
        return 'Botella';
      default:
        return type;
    }
  };

  const filteredProducts = getFilteredProducts(searchTerm);

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
          Gestión de Productos
        </Heading>
        <Button
          leftIcon={<AddIcon />}
          colorScheme="blue"
          onClick={openCreateModal}
        >
          Nuevo Producto
        </Button>
      </Flex>

      <Card>
        <CardHeader>
          <Flex justify="space-between" align="center">
            <Heading size="md">Lista de Productos</Heading>
            <InputGroup maxW="300px">
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.300" />
              </InputLeftElement>
              <Input
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </Flex>
        </CardHeader>
        <CardBody>
          {filteredProducts.length === 0 ? (
            <Alert status="info">
              <AlertIcon />
              <AlertTitle>No hay productos!</AlertTitle>
              <AlertDescription>
                {searchTerm ? 'No se encontraron productos con el término de búsqueda.' : 'No hay productos registrados.'}
              </AlertDescription>
            </Alert>
          ) : isMobile ? (
            // Vista móvil
            <SimpleGrid columns={1} spacing={4}>
              {filteredProducts.map((product) => (
                <Card key={product.id} variant="outline">
                  <CardBody>
                    <VStack align="start" spacing={3}>
                      <HStack justify="space-between" w="full">
                        <Text fontWeight="bold" fontSize="lg">{product.name}</Text>
                        <Badge colorScheme={getTypeColor(product.type)}>
                          {getTypeText(product.type)}
                        </Badge>
                      </HStack>
                      
                      <Text color="gray.600" fontSize="sm">
                        {product.description}
                      </Text>
                      
                      <HStack spacing={4}>
                        <Text fontWeight="bold" color="blue.600">
                          S/ {parseFloat(product.unitPrice).toFixed(2)}
                        </Text>
                        <Text color="gray.500">
                          Stock: {product.stock}
                        </Text>
                      </HStack>
                      
                      {(product.wholesalePrice || product.wholesalePrice2 || product.wholesalePrice3) && (
                        <Box bg="gray.50" p={2} borderRadius="md" w="full">
                          <VStack spacing={1} align="start">
                            {product.wholesalePrice && (
                              <Text fontSize="sm" color="blue.600" fontWeight="medium">
                                <strong>Mayoreo 1:</strong> S/ {parseFloat(product.wholesalePrice).toFixed(2)} 
                                (min. {product.wholesaleMinQuantity})
                              </Text>
                            )}
                            {product.wholesalePrice2 && (
                              <Text fontSize="sm" color="purple.600" fontWeight="medium">
                                <strong>Mayoreo 2:</strong> S/ {parseFloat(product.wholesalePrice2).toFixed(2)} 
                                (min. {product.wholesaleMinQuantity2})
                              </Text>
                            )}
                            {product.wholesalePrice3 && (
                              <Text fontSize="sm" color="green.600" fontWeight="medium">
                                <strong>Mayoreo 3:</strong> S/ {parseFloat(product.wholesalePrice3).toFixed(2)} 
                                (min. {product.wholesaleMinQuantity3})
                              </Text>
                            )}
                          </VStack>
                        </Box>
                      )}
                      
                      <HStack spacing={2}>
                        <Button
                          size="sm"
                          leftIcon={<EditIcon />}
                          onClick={() => openEditModal(product)}
                        >
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          colorScheme="red"
                          variant="outline"
                          onClick={() => handleDeleteProduct(product.id)}
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
                  <Th>Tipo</Th>
                  <Th>Precio Unitario</Th>
                  <Th>Precios de Mayoreo</Th>
                  <Th>Stock</Th>
                  <Th>Acciones</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredProducts.map((product) => (
                  <Tr key={product.id}>
                    <Td>
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="bold">{product.name}</Text>
                        <Text fontSize="sm" color="gray.500">
                          {product.description}
                        </Text>
                      </VStack>
                    </Td>
                    <Td>
                      <Badge colorScheme={getTypeColor(product.type)}>
                        {getTypeText(product.type)}
                      </Badge>
                    </Td>
                    <Td>
                      <Text fontWeight="bold" color="blue.600">
                        S/ {parseFloat(product.unitPrice).toFixed(2)}
                      </Text>
                    </Td>
                    <Td>
                      <VStack align="start" spacing={1}>
                        {product.wholesalePrice && (
                          <Text fontWeight="semibold" color="blue.500" fontSize="sm">
                            S/ {parseFloat(product.wholesalePrice).toFixed(2)} (min. {product.wholesaleMinQuantity})
                          </Text>
                        )}
                        {product.wholesalePrice2 && (
                          <Text fontWeight="semibold" color="purple.500" fontSize="sm">
                            S/ {parseFloat(product.wholesalePrice2).toFixed(2)} (min. {product.wholesaleMinQuantity2})
                          </Text>
                        )}
                        {product.wholesalePrice3 && (
                          <Text fontWeight="semibold" color="green.500" fontSize="sm">
                            S/ {parseFloat(product.wholesalePrice3).toFixed(2)} (min. {product.wholesaleMinQuantity3})
                          </Text>
                        )}
                        {!product.wholesalePrice && !product.wholesalePrice2 && !product.wholesalePrice3 && (
                          <Text color="gray.400">-</Text>
                        )}
                      </VStack>
                    </Td>
                    <Td>
                      <Text fontWeight="bold" color={product.stock > 10 ? "green.600" : "orange.600"}>
                        {product.stock}
                      </Text>
                    </Td>
                    <Td>
                      <HStack spacing={2}>
                        <Button
                          size="sm"
                          leftIcon={<EditIcon />}
                          onClick={() => openEditModal(product)}
                        >
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          colorScheme="red"
                          variant="outline"
                          onClick={() => handleDeleteProduct(product.id)}
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

      {/* Modal para crear/editar producto */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedProduct ? 'Editar Producto' : 'Nuevo Producto'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Nombre</FormLabel>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nombre del producto"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Descripción</FormLabel>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descripción del producto"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Tipo</FormLabel>
                <Select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="bidon">Bidón</option>
                  <option value="botella">Botella</option>
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Precio Unitario</FormLabel>
                <NumberInput
                  value={formData.unitPrice}
                  onChange={(value) => setFormData({ ...formData, unitPrice: value })}
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
                <FormLabel>Precio de Mayoreo 1</FormLabel>
                <NumberInput
                  value={formData.wholesalePrice}
                  onChange={(value) => setFormData({ ...formData, wholesalePrice: value })}
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
                <FormLabel>Cantidad Mínima Mayoreo 1</FormLabel>
                <NumberInput
                  value={formData.wholesaleMinQuantity}
                  onChange={(value) => setFormData({ ...formData, wholesaleMinQuantity: value })}
                  min={0}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <FormControl>
                <FormLabel>Precio de Mayoreo 2</FormLabel>
                <NumberInput
                  value={formData.wholesalePrice2}
                  onChange={(value) => setFormData({ ...formData, wholesalePrice2: value })}
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
                <FormLabel>Cantidad Mínima Mayoreo 2</FormLabel>
                <NumberInput
                  value={formData.wholesaleMinQuantity2}
                  onChange={(value) => setFormData({ ...formData, wholesaleMinQuantity2: value })}
                  min={0}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <FormControl>
                <FormLabel>Precio de Mayoreo 3</FormLabel>
                <NumberInput
                  value={formData.wholesalePrice3}
                  onChange={(value) => setFormData({ ...formData, wholesalePrice3: value })}
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
                <FormLabel>Cantidad Mínima Mayoreo 3</FormLabel>
                <NumberInput
                  value={formData.wholesaleMinQuantity3}
                  onChange={(value) => setFormData({ ...formData, wholesaleMinQuantity3: value })}
                  min={0}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Stock</FormLabel>
                <NumberInput
                  value={formData.stock}
                  onChange={(value) => setFormData({ ...formData, stock: value })}
                  min={0}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancelar
            </Button>
            <Button
              colorScheme="blue"
              onClick={selectedProduct ? handleUpdateProduct : handleCreateProduct}
            >
              {selectedProduct ? 'Actualizar' : 'Crear'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Products;
