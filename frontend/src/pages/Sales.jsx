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
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
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
import { SearchIcon, AddIcon, EditIcon, ViewIcon } from '@chakra-ui/icons';
import useSaleStore from '../stores/saleStore';
import useClientStore from '../stores/clientStore';
import useProductStore from '../stores/productStore';

const Sales = () => {
  // Stores
  const {
    sales,
    loading: salesLoading,
    error: salesError,
    fetchSales,
    createSale,
    updateSale,
    deleteSale,
    getFilteredSales,
    getSalesStats,
    clearError: clearSalesError
  } = useSaleStore();

  const {
    clients,
    loading: clientsLoading,
    fetchClients
  } = useClientStore();

  const {
    products,
    loading: productsLoading,
    fetchProducts
  } = useProductStore();

  // Estados locales
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSale, setSelectedSale] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  // Estados para el formulario
  const [formData, setFormData] = useState({
    clientId: '',
    invoiceNumber: '',
    items: [],
    subtotal: 0,
    total: 0,
    notes: ''
  });

  const [newItem, setNewItem] = useState({
    productId: '',
    quantity: 1,
    unitPrice: 0,
    subtotal: 0
  });

  const isMobile = useBreakpointValue({ base: true, md: false });

  useEffect(() => {
    fetchSales();
    fetchClients();
    fetchProducts();
  }, [fetchSales, fetchClients, fetchProducts]);

  // Mostrar errores del store
  useEffect(() => {
    if (salesError) {
      toast({
        title: 'Error',
        description: salesError,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      clearSalesError();
    }
  }, [salesError, toast, clearSalesError]);

  const handleCreateSale = async () => {
    if (formData.items.length === 0) {
      toast({
        title: 'Error',
        description: 'Agrega al menos un producto',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const result = await createSale(formData);
    if (result.success) {
      toast({
        title: 'Éxito',
        description: 'Venta creada correctamente',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onClose();
      resetForm();
    }
  };

  const handleUpdateSale = async () => {
    const result = await updateSale(selectedSale.id, formData);
    if (result.success) {
      toast({
        title: 'Éxito',
        description: 'Venta actualizada correctamente',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onClose();
      resetForm();
    }
  };

  const handleDeleteSale = async (saleId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta venta?')) {
      const result = await deleteSale(saleId);
      if (result.success) {
        toast({
          title: 'Éxito',
          description: 'Venta eliminada correctamente',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  const addItem = () => {
    if (!newItem.productId || newItem.quantity <= 0) {
      toast({
        title: 'Error',
        description: 'Selecciona un producto y cantidad válida',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const product = products.find(p => p.id === parseInt(newItem.productId));
    if (product) {
      const item = {
        ...newItem,
        productId: parseInt(newItem.productId),
        unitPrice: product.unitPrice,
        subtotal: product.unitPrice * newItem.quantity,
        productName: product.name
      };

      setFormData({
        ...formData,
        items: [...formData.items, item],
        subtotal: formData.subtotal + item.subtotal,
        total: formData.subtotal + item.subtotal
      });

      setNewItem({
        productId: '',
        quantity: 1,
        unitPrice: 0,
        subtotal: 0
      });
    }
  };

  const removeItem = (index) => {
    const item = formData.items[index];
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
      subtotal: formData.subtotal - item.subtotal,
      total: formData.subtotal - item.subtotal
    });
  };

  const resetForm = () => {
    setFormData({
      clientId: '',
      invoiceNumber: '',
      items: [],
      subtotal: 0,
      total: 0,
      notes: ''
    });
    setNewItem({
      productId: '',
      quantity: 1,
      unitPrice: 0,
      subtotal: 0
    });
    setSelectedSale(null);
  };

  const openCreateModal = () => {
    resetForm();
    onOpen();
  };

  const openEditModal = (sale) => {
    setSelectedSale(sale);
    setFormData({
      clientId: sale.clientId || '',
      invoiceNumber: sale.invoiceNumber || '',
      items: sale.items || [],
      subtotal: sale.subtotal || 0,
      total: sale.total || 0,
      notes: sale.notes || ''
    });
    onOpen();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pendiente':
        return 'yellow';
      case 'completado':
        return 'green';
      case 'cancelado':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pendiente':
        return 'Pendiente';
      case 'completado':
        return 'Completado';
      case 'cancelado':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const filteredSales = getFilteredSales(searchTerm);
  const salesStats = getSalesStats();
  const loading = salesLoading || clientsLoading || productsLoading;

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
          Gestión de Ventas
        </Heading>
        <Button
          leftIcon={<AddIcon />}
          colorScheme="blue"
          onClick={openCreateModal}
        >
          Nueva Venta
        </Button>
      </Flex>

      {/* Estadísticas */}
      <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4} mb={6}>
        <Card>
          <CardBody>
            <Text fontSize="sm" color="gray.600">Total Ventas</Text>
            <Text fontSize="2xl" fontWeight="bold" color="blue.600">
              {salesStats.totalSales}
            </Text>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Text fontSize="sm" color="gray.600">Monto Total</Text>
            <Text fontSize="2xl" fontWeight="bold" color="green.600">
              S/ {salesStats.totalAmount.toFixed(2)}
            </Text>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Text fontSize="sm" color="gray.600">Ventas Hoy</Text>
            <Text fontSize="2xl" fontWeight="bold" color="purple.600">
              {salesStats.todaySales}
            </Text>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Text fontSize="sm" color="gray.600">Monto Hoy</Text>
            <Text fontSize="2xl" fontWeight="bold" color="orange.600">
              S/ {salesStats.todayAmount.toFixed(2)}
            </Text>
          </CardBody>
        </Card>
      </SimpleGrid>

      <Card>
        <CardHeader>
          <Flex justify="space-between" align="center">
            <Heading size="md">Lista de Ventas</Heading>
            <InputGroup maxW="300px">
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.300" />
              </InputLeftElement>
              <Input
                placeholder="Buscar ventas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </Flex>
        </CardHeader>
        <CardBody>
          {filteredSales.length === 0 ? (
            <Alert status="info">
              <AlertIcon />
              <AlertTitle>No hay ventas!</AlertTitle>
              <AlertDescription>
                {searchTerm ? 'No se encontraron ventas con el término de búsqueda.' : 'No hay ventas registradas.'}
              </AlertDescription>
            </Alert>
          ) : (
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>N° Factura</Th>
                  <Th>Cliente</Th>
                  <Th>Total</Th>
                  <Th>Fecha</Th>
                  <Th>Estado</Th>
                  <Th>Acciones</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredSales.map((sale) => {
                  const client = clients.find(c => c.id === sale.clientId);
                  return (
                    <Tr key={sale.id}>
                      <Td>
                        <Text fontWeight="bold">{sale.invoiceNumber || `#${sale.id}`}</Text>
                      </Td>
                      <Td>
                        <Text>{client ? client.name : 'Cliente no encontrado'}</Text>
                      </Td>
                      <Td>
                        <Text fontWeight="bold" color="blue.600">
                          S/ {parseFloat(sale.total).toFixed(2)}
                        </Text>
                      </Td>
                      <Td>
                        <Text fontSize="sm">
                          {new Date(sale.date).toLocaleDateString()}
                        </Text>
                      </Td>
                      <Td>
                        <Badge colorScheme={getStatusColor(sale.status)}>
                          {getStatusText(sale.status)}
                        </Badge>
                      </Td>
                      <Td>
                        <HStack spacing={2}>
                          <Button
                            size="sm"
                            leftIcon={<ViewIcon />}
                            onClick={() => openEditModal(sale)}
                          >
                            Ver
                          </Button>
                          <Button
                            size="sm"
                            leftIcon={<EditIcon />}
                            onClick={() => openEditModal(sale)}
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

      {/* Modal para crear/editar venta */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedSale ? 'Editar Venta' : 'Nueva Venta'}
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

              <FormControl>
                <FormLabel>Número de Factura</FormLabel>
                <Input
                  value={formData.invoiceNumber}
                  onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                  placeholder="Número de factura (opcional)"
                />
              </FormControl>

              {/* Agregar productos */}
              <Box w="full" p={4} border="1px" borderColor="gray.200" borderRadius="md">
                <Text fontWeight="bold" mb={3}>Agregar Producto</Text>
                <HStack spacing={4}>
                  <Select
                    placeholder="Seleccionar producto"
                    value={newItem.productId}
                    onChange={(e) => {
                      const productId = e.target.value;
                      const product = products.find(p => p.id === parseInt(productId));
                      setNewItem({
                        ...newItem,
                        productId,
                        unitPrice: product ? product.unitPrice : 0,
                        subtotal: product ? product.unitPrice * newItem.quantity : 0
                      });
                    }}
                    flex={1}
                  >
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} - S/ {parseFloat(product.unitPrice).toFixed(2)}
                      </option>
                    ))}
                  </Select>
                  <NumberInput
                    value={newItem.quantity}
                    onChange={(value) => {
                      const qty = parseInt(value) || 1;
                      setNewItem({
                        ...newItem,
                        quantity: qty,
                        subtotal: newItem.unitPrice * qty
                      });
                    }}
                    min={1}
                    w="100px"
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  <Button colorScheme="green" onClick={addItem}>
                    Agregar
                  </Button>
                </HStack>
              </Box>

              {/* Lista de productos */}
              {formData.items.length > 0 && (
                <Box w="full">
                  <Text fontWeight="bold" mb={3}>Productos Agregados</Text>
                  <VStack spacing={2}>
                    {formData.items.map((item, index) => (
                      <HStack key={index} justify="space-between" w="full" p={2} bg="gray.50" borderRadius="md">
                        <Text flex={1}>{item.productName}</Text>
                        <Text>x {item.quantity}</Text>
                        <Text fontWeight="bold">S/ {parseFloat(item.subtotal).toFixed(2)}</Text>
                        <Button size="sm" colorScheme="red" onClick={() => removeItem(index)}>
                          Eliminar
                        </Button>
                      </HStack>
                    ))}
                  </VStack>
                  
                  <Divider my={4} />
                  
                  <HStack justify="space-between" w="full">
                    <Text fontWeight="bold" fontSize="lg">Total:</Text>
                    <Text fontWeight="bold" fontSize="lg" color="blue.600">
                      S/ {parseFloat(formData.total).toFixed(2)}
                    </Text>
                  </HStack>
                </Box>
              )}

              <FormControl>
                <FormLabel>Notas</FormLabel>
                <Input
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Notas adicionales (opcional)"
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancelar
            </Button>
            <Button
              colorScheme="blue"
              onClick={selectedSale ? handleUpdateSale : handleCreateSale}
            >
              {selectedSale ? 'Actualizar' : 'Crear'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Sales;
