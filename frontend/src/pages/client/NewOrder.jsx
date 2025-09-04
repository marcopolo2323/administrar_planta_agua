import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Button,
  Flex,
  Stack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Divider,
  useColorModeValue,
  Image,
  Badge,
  IconButton,
  HStack,
  VStack,
  Radio,
  RadioGroup,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  CloseButton,
} from '@chakra-ui/react';
import { ArrowBackIcon, DeleteIcon, AddIcon } from '@chakra-ui/icons';

const NewOrder = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [client, setClient] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderDetails, setOrderDetails] = useState({
    deliveryAddress: '',
    contactPhone: '',
    notes: '',
    paymentMethod: 'efectivo',
  });

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const responsiveBoxShadow = useColorModeValue('0 2px 8px rgba(0,0,0,0.05)', '0 2px 8px rgba(0,0,0,0.2)');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const clientData = localStorage.getItem('client');
    
    if (!token || !clientData) {
      navigate('/client/login');
      return;
    }
    
    const parsedClient = JSON.parse(clientData);
    setClient(parsedClient);
    
    // Inicializar la dirección y teléfono con los valores por defecto del cliente
    setOrderDetails(prev => ({
      ...prev,
      deliveryAddress: parsedClient.defaultDeliveryAddress || '',
      contactPhone: parsedClient.defaultContactPhone || '',
    }));
    
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const config = {
          headers: { Authorization: `Bearer ${token}` }
        };
        
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/products`,
          config
        );
        
        setProducts(response.data);
        
        // Si hay un producto seleccionado desde otra página
        if (location.state?.selectedProduct) {
          const product = location.state.selectedProduct;
          addProductToOrder(product, 1);
        }
      } catch (error) {
        console.error('Error al cargar productos:', error);
        toast.error('Error al cargar los productos disponibles.');
        
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('client');
          navigate('/client/login');
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProducts();
  }, [navigate, location.state]);

  const addProductToOrder = (product, quantity = 1) => {
    // Verificar si el producto ya está en la orden
    const existingProductIndex = selectedProducts.findIndex(item => item.id === product.id);
    
    if (existingProductIndex >= 0) {
      // Actualizar la cantidad si ya existe
      const updatedProducts = [...selectedProducts];
      updatedProducts[existingProductIndex].quantity += quantity;
      setSelectedProducts(updatedProducts);
    } else {
      // Agregar nuevo producto
      setSelectedProducts([...selectedProducts, { ...product, quantity }]);
    }
    
    toast.success(`${product.name} agregado al pedido`);
  };

  const removeProductFromOrder = (productId) => {
    setSelectedProducts(selectedProducts.filter(item => item.id !== productId));
  };

  const updateProductQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeProductFromOrder(productId);
      return;
    }
    
    const updatedProducts = selectedProducts.map(item => {
      if (item.id === productId) {
        return { ...item, quantity: newQuantity };
      }
      return item;
    });
    
    setSelectedProducts(updatedProducts);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOrderDetails({
      ...orderDetails,
      [name]: value,
    });
  };

  const handlePaymentMethodChange = (value) => {
    setOrderDetails({
      ...orderDetails,
      paymentMethod: value,
    });
  };

  const calculateTotal = () => {
    return selectedProducts.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleSubmitOrder = async () => {
    if (selectedProducts.length === 0) {
      toast.error('Debes agregar al menos un producto a tu pedido');
      return;
    }
    
    if (!orderDetails.deliveryAddress) {
      toast.error('La dirección de entrega es obligatoria');
      return;
    }
    
    if (!orderDetails.contactPhone) {
      toast.error('El teléfono de contacto es obligatorio');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      const orderData = {
        items: selectedProducts.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        deliveryAddress: orderDetails.deliveryAddress,
        contactPhone: orderDetails.contactPhone,
        notes: orderDetails.notes,
        paymentMethod: orderDetails.paymentMethod,
        total: calculateTotal()
      };
      
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/orders`,
        orderData,
        config
      );
      
      toast.success('¡Pedido realizado con éxito!');
      
      // Si el método de pago es en línea, redirigir a la página de pago
      if (orderDetails.paymentMethod === 'online') {
        navigate(`/client/payment/${response.data.id}`);
      } else {
        navigate('/client/dashboard', { state: { newOrder: true } });
      }
    } catch (error) {
      console.error('Error al crear el pedido:', error);
      toast.error(error.response?.data?.message || 'Error al procesar el pedido. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoBack = () => {
    navigate('/client/dashboard');
  };

  if (isLoading) {
    return (
      <Flex justify="center" align="center" height="100vh">
        <Spinner size="xl" color="blue.500" />
      </Flex>
    );
  }

  return (
    <Container maxW={{ base: "100vw", md: "container.lg", xl: "container.xl" }} px={{ base: 2, md: 6 }} py={{ base: 4, md: 8 }}>
      <Flex direction="column" gap={6}>
        <Flex align="center" gap={4}>
          <IconButton
            icon={<ArrowBackIcon />}
            aria-label="Volver"
            onClick={handleGoBack}
            variant="outline"
            size={{ base: "sm", md: "md" }}
          />
          <Heading size={{ base: "md", md: "lg" }}>Nuevo Pedido</Heading>
        </Flex>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 4, md: 8 }}>
          {/* Columna de productos */}
          <Box>
            <Heading size="md" mb={4}>Productos Disponibles</Heading>
            <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
              {products.map(product => (
                <Box
                  key={product.id}
                  borderWidth="1px"
                  borderRadius="lg"
                  borderColor={borderColor}
                  overflow="hidden"
                  bg={bgColor}
                  boxShadow={responsiveBoxShadow}
                  mb={{ base: 2, md: 0 }}
                >
                  <Flex direction={{ base: "column", sm: "row" }}>
                    <Image
                      src={product.imageUrl || 'https://via.placeholder.com/100?text=Agua'}
                      alt={product.name}
                      boxSize={{ base: "100%", sm: "100px" }}
                      objectFit="cover"
                    />
                    <Box p={3} flex="1">
                      <Flex justify="space-between" align="start" wrap="wrap">
                        <Heading size="sm">{product.name}</Heading>
                        {product.stock > 0 ? (
                          <Badge colorScheme="green">Disponible</Badge>
                        ) : (
                          <Badge colorScheme="red">Agotado</Badge>
                        )}
                      </Flex>
                      <Text fontSize="sm" color="gray.600" mt={1} noOfLines={2}>
                        {product.description}
                      </Text>
                      <Flex justify="space-between" align="center" mt={2} wrap="wrap">
                        <Text fontWeight="bold">S/ {product.price.toFixed(2)}</Text>
                        <Button
                          size="sm"
                          colorScheme="blue"
                          leftIcon={<AddIcon />}
                          isDisabled={product.stock <= 0}
                          onClick={() => addProductToOrder(product)}
                        >
                          Agregar
                        </Button>
                      </Flex>
                    </Box>
                  </Flex>
                </Box>
              ))}
            </SimpleGrid>
          </Box>

          {/* Columna de resumen del pedido */}
          <Box>
            <Heading size="md" mb={4}>Resumen del Pedido</Heading>
            <Box
              borderWidth="1px"
              borderRadius="lg"
              borderColor={borderColor}
              bg={bgColor}
              p={{ base: 3, md: 5 }}
              boxShadow={responsiveBoxShadow}
            >
              {selectedProducts.length > 0 ? (
                <>
                  <VStack spacing={4} align="stretch" mb={6}>
                    {selectedProducts.map(item => (
                      <Flex key={item.id} justify="space-between" align="center" wrap="wrap">
                        <HStack spacing={3}>
                          <NumberInput
                            size="sm"
                            maxW={20}
                            min={1}
                            max={item.stock}
                            value={item.quantity}
                            onChange={(valueString) => updateProductQuantity(item.id, parseInt(valueString))}
                          >
                            <NumberInputField />
                            <NumberInputStepper>
                              <NumberIncrementStepper />
                              <NumberDecrementStepper />
                            </NumberInputStepper>
                          </NumberInput>
                          <Text fontWeight="medium">{item.name}</Text>
                        </HStack>
                        <HStack spacing={4}>
                          <Text>S/ {(item.price * item.quantity).toFixed(2)}</Text>
                          <IconButton
                            icon={<DeleteIcon />}
                            aria-label="Eliminar producto"
                            size="sm"
                            colorScheme="red"
                            variant="ghost"
                            onClick={() => removeProductFromOrder(item.id)}
                          />
                        </HStack>
                      </Flex>
                    ))}
                  </VStack>

                  <Divider my={4} />

                  <Flex justify="space-between" fontWeight="bold" fontSize="lg" mb={6} wrap="wrap">
                    <Text>Total:</Text>
                    <Text>S/ {calculateTotal().toFixed(2)}</Text>
                  </Flex>

                  <Stack spacing={4}>
                    <FormControl isRequired>
                      <FormLabel>Dirección de entrega</FormLabel>
                      <Input
                        name="deliveryAddress"
                        value={orderDetails.deliveryAddress}
                        onChange={handleInputChange}
                        placeholder="Ingresa la dirección completa"
                        fontSize={{ base: "sm", md: "md" }}
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Teléfono de contacto</FormLabel>
                      <Input
                        name="contactPhone"
                        value={orderDetails.contactPhone}
                        onChange={handleInputChange}
                        placeholder="Ingresa un número de teléfono"
                        fontSize={{ base: "sm", md: "md" }}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Notas adicionales</FormLabel>
                      <Textarea
                        name="notes"
                        value={orderDetails.notes}
                        onChange={handleInputChange}
                        placeholder="Instrucciones especiales para la entrega"
                        rows={3}
                        fontSize={{ base: "sm", md: "md" }}
                      />
                    </FormControl>

                    <FormControl as="fieldset">
                      <FormLabel as="legend">Método de pago</FormLabel>
                      <RadioGroup
                        value={orderDetails.paymentMethod}
                        onChange={handlePaymentMethodChange}
                      >
                        <Stack direction={{ base: "column", sm: "row" }}>
                          <Radio value="efectivo">Efectivo</Radio>
                          <Radio value="online">Pago en línea</Radio>
                        </Stack>
                      </RadioGroup>
                    </FormControl>

                    <Button
                      colorScheme="blue"
                      size={{ base: "md", md: "lg" }}
                      onClick={handleSubmitOrder}
                      isLoading={isSubmitting}
                      loadingText="Procesando"
                      mt={4}
                      w="100%"
                    >
                      {orderDetails.paymentMethod === 'online' ? 'Continuar al pago' : 'Confirmar pedido'}
                    </Button>
                  </Stack>
                </>
              ) : (
                <Alert status="info" borderRadius="md">
                  <AlertIcon />
                  <Box flex="1">
                    <AlertTitle>Carrito vacío</AlertTitle>
                    <AlertDescription>
                      Agrega productos de la lista para comenzar tu pedido.
                    </AlertDescription>
                  </Box>
                </Alert>
              )}
            </Box>
          </Box>
        </SimpleGrid>
      </Flex>
    </Container>
  );
};

export default NewOrder;