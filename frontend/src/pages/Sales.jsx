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
    timeFilter,
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
    fetchSales(timeFilter);
    fetchClients();
    fetchProducts();
  }, [fetchSales, fetchClients, fetchProducts, timeFilter]);

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

  const handleTimeFilterChange = (newFilter) => {
    fetchSales(newFilter);
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
        <VStack align="start" spacing={1}>
          <Heading size="lg" color="gray.700">
            {timeFilter === 'today' ? 'Pedidos del Día' : 
             timeFilter === 'yesterday' ? 'Pedidos de Ayer' :
             timeFilter === 'weekly' ? 'Pedidos de la Semana' : 
             timeFilter === 'lastWeek' ? 'Pedidos de la Semana Pasada' :
             timeFilter === 'monthly' ? 'Pedidos del Mes' : 'Pedidos del Mes Pasado'}
          </Heading>
          <Text color="gray.600" fontSize="sm">
            {timeFilter === 'today' ? new Date().toLocaleDateString('es-ES', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            }) : 
            timeFilter === 'yesterday' ? (() => {
              const yesterday = new Date();
              yesterday.setDate(yesterday.getDate() - 1);
              return yesterday.toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              });
            })() :
            timeFilter === 'weekly' ? 'Semana actual' : 
            timeFilter === 'lastWeek' ? 'Semana pasada' :
            timeFilter === 'monthly' ? 'Mes actual' : 'Mes pasado'}
          </Text>
        </VStack>
        <Button
          leftIcon={<AddIcon />}
          colorScheme="blue"
          onClick={openCreateModal}
        >
          Nuevo Pedido
        </Button>
      </Flex>

      {/* Filtros de tiempo */}
      <Card mb={6} bg="gray.50" border="1px" borderColor="gray.200">
        <CardBody>
          <VStack spacing={3} align="stretch">
            <HStack spacing={4} align="center" justify="space-between">
              <HStack spacing={4} align="center">
                <Text fontWeight="bold" color="gray.700" fontSize="lg">
                  📊 Período de Análisis:
                </Text>
                <Select
                  value={timeFilter}
                  onChange={(e) => handleTimeFilterChange(e.target.value)}
                  maxW="280px"
                  bg="white"
                  borderColor="blue.300"
                  _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px blue.500" }}
                >
                  <option value="today">📅 Hoy</option>
                  <option value="yesterday">📅 Ayer</option>
                  <option value="weekly">📅 Esta Semana</option>
                  <option value="lastWeek">📅 Semana Pasada</option>
                  <option value="monthly">📅 Este Mes</option>
                  <option value="lastMonth">📅 Mes Pasado</option>
                </Select>
              </HStack>
              <HStack spacing={2}>
                <Button
                  size="sm"
                  variant="outline"
                  colorScheme="blue"
                  onClick={() => {
                    if (timeFilter === 'today') handleTimeFilterChange('yesterday');
                    else if (timeFilter === 'weekly') handleTimeFilterChange('lastWeek');
                    else if (timeFilter === 'monthly') handleTimeFilterChange('lastMonth');
                  }}
                  isDisabled={timeFilter === 'yesterday' || timeFilter === 'lastWeek' || timeFilter === 'lastMonth'}
                >
                  🔄 Comparar
                </Button>
              </HStack>
            </HStack>
            <HStack spacing={2} align="center" justify="space-between">
              <HStack spacing={2} align="center">
                <Text fontSize="sm" color="blue.600" fontWeight="medium">
                  ℹ️
                </Text>
                <Text fontSize="sm" color="gray.600">
                  {timeFilter === 'today' ? 'Mostrando pedidos del día actual' : 
                   timeFilter === 'yesterday' ? 'Mostrando pedidos del día anterior' :
                   timeFilter === 'weekly' ? 'Mostrando pedidos de domingo a sábado (semana actual)' : 
                   timeFilter === 'lastWeek' ? 'Mostrando pedidos de la semana anterior' :
                   timeFilter === 'monthly' ? 'Mostrando pedidos del mes actual' : 'Mostrando pedidos del mes anterior'}
                </Text>
              </HStack>
              <Badge 
                colorScheme={timeFilter === 'today' || timeFilter === 'weekly' || timeFilter === 'monthly' ? 'green' : 'blue'}
                fontSize="xs"
                px={2}
                py={1}
                borderRadius="md"
              >
                {timeFilter === 'today' ? 'ACTUAL' : 
                 timeFilter === 'yesterday' ? 'ANTERIOR' :
                 timeFilter === 'weekly' ? 'ACTUAL' : 
                 timeFilter === 'lastWeek' ? 'ANTERIOR' :
                 timeFilter === 'monthly' ? 'ACTUAL' : 'ANTERIOR'}
              </Badge>
            </HStack>
          </VStack>
        </CardBody>
      </Card>

      {/* Estadísticas */}
      <SimpleGrid columns={{ base: 1, md: 6 }} spacing={4} mb={6}>
        <Card>
          <CardBody>
            <Text fontSize="sm" color="gray.600">Total Pedidos</Text>
            <Text fontSize="2xl" fontWeight="bold" color="blue.600">
              {salesStats.totalOrders}
            </Text>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Text fontSize="sm" color="gray.600">Entregados</Text>
            <Text fontSize="2xl" fontWeight="bold" color="green.600">
              S/ {salesStats.deliveredAmount.toFixed(2)}
            </Text>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Text fontSize="sm" color="gray.600">Pendientes</Text>
            <Text fontSize="2xl" fontWeight="bold" color="orange.600">
              S/ {salesStats.pendingAmount.toFixed(2)}
            </Text>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Text fontSize="sm" color="gray.600">Bidones Vendidos</Text>
            <Text fontSize="2xl" fontWeight="bold" color="purple.600">
              {salesStats.totalBidones}
            </Text>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Text fontSize="sm" color="gray.600">Paquetes Vendidos</Text>
            <Text fontSize="2xl" fontWeight="bold" color="cyan.600">
              {salesStats.totalPaquetes}
            </Text>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Text fontSize="sm" color="gray.600">Total del Día</Text>
            <Text fontSize="2xl" fontWeight="bold" color="red.600">
              S/ {salesStats.totalAmount.toFixed(2)}
            </Text>
          </CardBody>
        </Card>
      </SimpleGrid>

      <Card>
        <CardHeader>
          <Flex justify="space-between" align="center">
            <Heading size="md">
              {timeFilter === 'today' ? 'Pedidos del Día' : 
               timeFilter === 'yesterday' ? 'Pedidos de Ayer' :
               timeFilter === 'weekly' ? 'Pedidos de la Semana' : 
               timeFilter === 'lastWeek' ? 'Pedidos de la Semana Pasada' :
               timeFilter === 'monthly' ? 'Pedidos del Mes' : 'Pedidos del Mes Pasado'}
            </Heading>
            <InputGroup maxW="300px">
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.300" />
              </InputLeftElement>
              <Input
                placeholder="Buscar por cliente o dirección..."
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
              <AlertTitle>
                {timeFilter === 'today' ? 'No hay pedidos del día' : 
                 timeFilter === 'yesterday' ? 'No hay pedidos de ayer' :
                 timeFilter === 'weekly' ? 'No hay pedidos de la semana' : 
                 timeFilter === 'lastWeek' ? 'No hay pedidos de la semana pasada' :
                 timeFilter === 'monthly' ? 'No hay pedidos del mes' : 'No hay pedidos del mes pasado'}
              </AlertTitle>
              <AlertDescription>
                {searchTerm ? 'No se encontraron pedidos con el término de búsqueda.' : 
                 'No se han registrado pedidos en este período. Los pedidos aparecerán aquí cuando se creen.'}
              </AlertDescription>
            </Alert>
          ) : (
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Hora</Th>
                  <Th>Cliente</Th>
                  <Th>Productos</Th>
                  <Th>Estado</Th>
                  <Th>Dirección</Th>
                  <Th>Total</Th>
                  <Th>Repartidor</Th>
                  <Th>Acciones</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredSales.map((delivery) => {
                  const productCount = delivery.products ? delivery.products.length : 0;
                  const productNames = delivery.products ? 
                    delivery.products.map(product => `${product.name} (${product.quantity})`).join(', ') : 
                    'Sin productos';
                  
                  return (
                    <Tr key={`${delivery.type}-${delivery.id}`}>
                      <Td>
                        <Text fontSize="sm" fontWeight="bold">
                          {new Date(delivery.deliveredAt).toLocaleTimeString('es-ES', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </Text>
                      </Td>
                      <Td>
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="bold">{delivery.clientName}</Text>
                          <Text fontSize="xs" color="gray.500">
                            {delivery.type === 'regular' ? 'Cliente frecuente' : 'Cliente visitante'}
                          </Text>
                        </VStack>
                      </Td>
                      <Td>
                        <VStack align="start" spacing={0}>
                          <Text fontSize="sm">{productCount} producto(s)</Text>
                          <Text fontSize="xs" color="gray.500" maxW="200px" isTruncated>
                            {productNames}
                          </Text>
                        </VStack>
                      </Td>
                      <Td>
                        <Badge 
                          colorScheme={
                            delivery.status === 'entregado' || delivery.status === 'delivered' ? 'green' : 
                            delivery.status === 'pendiente' || delivery.status === 'confirmed' ? 'yellow' : 'gray'
                          }
                        >
                          {delivery.status === 'entregado' ? 'Entregado' : 
                           delivery.status === 'delivered' ? 'Entregado' :
                           delivery.status === 'pendiente' ? 'Pendiente' :
                           delivery.status === 'confirmed' ? 'Confirmado' : delivery.status}
                        </Badge>
                      </Td>
                      <Td>
                        <VStack align="start" spacing={0}>
                          <Text fontSize="sm" fontWeight="bold">{delivery.address}</Text>
                          <Text fontSize="xs" color="gray.500">{delivery.district}</Text>
                        </VStack>
                      </Td>
                      <Td>
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="bold" color="green.600" fontSize="lg">
                            S/ {parseFloat(delivery.total).toFixed(2)}
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            Flete: S/ {parseFloat(delivery.deliveryFee || 0).toFixed(2)}
                          </Text>
                        </VStack>
                      </Td>
                      <Td>
                        <Text fontSize="sm" color="gray.600">
                          {delivery.deliveryPerson}
                        </Text>
                      </Td>
                      <Td>
                        <HStack spacing={2}>
                          <Button
                            size="sm"
                            leftIcon={<ViewIcon />}
                            onClick={() => openEditModal(delivery)}
                            colorScheme="blue"
                            variant="outline"
                          >
                            Ver
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
