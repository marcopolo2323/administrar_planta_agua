import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  Heading,
  Input,
  Stack,
  Text,
  Image,
  useToast,
  Card,
  CardBody,
  Divider,
  Badge,
  IconButton,
  Textarea,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Link,
  InputGroup,
  InputLeftElement,
  Select
} from '@chakra-ui/react';
import { FaPlus, FaMinus, FaTrash, FaUser, FaPhone, FaEnvelope, FaMapMarkerAlt, FaShoppingCart } from 'react-icons/fa';
import axios from 'axios';
import { Link as RouterLink } from 'react-router-dom';
import DeliveryFeeService from '../services/DeliveryFeeService';

const GuestOrder = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [guestInfo, setGuestInfo] = useState({
    guestName: '',
    guestPhone: '',
    guestEmail: '',
    shippingAddress: '',
    deliveryDistrict: ''
  });
  
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [documentNumber, setDocumentNumber] = useState('');
  const [searchingClient, setSearchingClient] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const toast = useToast();

  // Lista de distritos con sus tarifas de envío
  // Estado para almacenar los distritos y sus tarifas de envío
  const [districts, setDistricts] = useState([
    { name: 'San Isidro', deliveryFee: 0 },
    { name: 'Miraflores', deliveryFee: 5 },
    { name: 'San Borja', deliveryFee: 5 },
    { name: 'San Miguel', deliveryFee: 8 },
    { name: 'Surco', deliveryFee: 8 },
    { name: 'La Molina', deliveryFee: 10 },
    { name: 'Callao', deliveryFee: 12 },
    { name: 'Otros', deliveryFee: 15 }
  ]);
  const [loadingDistricts, setLoadingDistricts] = useState(true);

  // Función para buscar cliente por número de documento
  const searchClientByDocument = async () => {
    if (!documentNumber) {
      toast({
        title: 'Ingrese un número de documento',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setSearchingClient(true);
    
    try {
      const response = await axios.get(`/api/clients/document/${documentNumber}`);
      
      if (response.data) {
        // Llenar el formulario con los datos del cliente
        setGuestInfo({
          guestName: response.data.name || '',
          guestPhone: response.data.phone || '',
          guestEmail: response.data.email || '',
          shippingAddress: response.data.address || '',
          deliveryDistrict: guestInfo.deliveryDistrict // Mantener el distrito seleccionado
        });
        
        toast({
          title: 'Cliente encontrado',
          description: `Se han cargado los datos de ${response.data.name}`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error al buscar cliente:', error);
      
      if (error.response && error.response.status === 404) {
        toast({
          title: 'Cliente no encontrado',
          description: 'No se encontró ningún cliente con ese número de documento',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Error',
          description: 'Ocurrió un error al buscar el cliente',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } finally {
      setSearchingClient(false);
    }
  };
  
  // Cargar productos
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('/api/products');
        const validProducts = response.data
          .filter(product => product.stock > 0)
          .map(product => ({
            ...product,
            price: parseFloat(product.unitPrice) || 0
          }));
        setProducts(validProducts);
        setLoading(false);
      } catch (err) {
        setError('Error al cargar productos. Por favor, intente de nuevo más tarde.');
        setLoading(false);
      }
    };

    const fetchDeliveryFees = async () => {
      try {
        setLoadingDistricts(true);
        const response = await DeliveryFeeService.getAllDeliveryFees();
        if (response && response.length > 0) {
          // Transformar los datos de la API al formato esperado
          const apiDistricts = response.map(item => ({
            name: item.district,
            deliveryFee: parseFloat(item.fee) || 0,
            active: item.active
          }));
          // Filtrar solo distritos activos
          const activeDistricts = apiDistricts.filter(d => d.active);
          if (activeDistricts.length > 0) {
            setDistricts(activeDistricts);
          }
        }
      } catch (err) {
        console.error('Error al cargar tarifas de envío:', err);
        // Mantener los distritos por defecto en caso de error
      } finally {
        setLoadingDistricts(false);
      }
    };

    fetchProducts();
    fetchDeliveryFees();
  }, []);

  // Manejar cambios en los campos del formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setGuestInfo(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Actualizar tarifa de envío cuando cambia el distrito
    if (name === 'deliveryDistrict') {
      const selectedDistrict = districts.find(d => d.name === value);
      if (selectedDistrict) {
        setDeliveryFee(selectedDistrict.deliveryFee);
      } else {
        setDeliveryFee(0);
      }
    }
  };

  // Calcular precio con descuentos según cantidad y tipo de producto
  const calculateDiscountedPrice = (product, quantity) => {
    let price = product.price;
    
    // Aplicar descuento para bidones cuando se compran 2 o más
    if ((product.name.toLowerCase().includes('bidon') || product.type === 'bidon') && quantity >= 2) {
      price = 5.00; // Precio especial de 5 soles por bidón
    }
    
    // Aplicar precio especial para paquetes de botellas de agua
    if ((product.name.toLowerCase().includes('botella') || product.name.toLowerCase().includes('agua') || product.type === 'botella') && quantity >= 50) {
      price = 9.00; // Precio especial de 9 soles por paquete
    }
    
    return price;
  };
  
  // Agregar producto al carrito
  const addToCart = (product) => {
    const existingItem = cart.find(item => item.productId === product.id);
    
    if (existingItem) {
      // Si ya está en el carrito, aumentar cantidad
      const newQuantity = existingItem.quantity + 1;
      const newPrice = calculateDiscountedPrice(product, newQuantity);
      
      setCart(cart.map(item => 
        item.productId === product.id 
          ? { ...item, quantity: newQuantity, price: newPrice } 
          : item
      ));
    } else {
      // Si no está en el carrito, agregarlo
      setCart([...cart, {
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.image,
        type: product.type
      }]);
    }

    toast({
      title: 'Producto agregado',
      description: `${product.name} agregado al carrito`,
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  // Remover producto del carrito
  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  // Actualizar cantidad de un producto en el carrito
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    const product = products.find(p => p.id === productId);
    if (product && newQuantity > product.stock) {
      toast({
        title: 'Stock insuficiente',
        description: `Solo hay ${product.stock} unidades disponibles`,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    // Calcular el nuevo precio basado en la cantidad
    const newPrice = calculateDiscountedPrice(product, newQuantity);
    
    setCart(cart.map(item => 
      item.productId === productId 
        ? { ...item, quantity: newQuantity, price: newPrice } 
        : item
    ));
  };

  // Calcular total del carrito
  const calculateSubtotal = () => {
    return cart.reduce((total, item) => {
      const price = item.price || 0;
      const quantity = item.quantity || 0;
      return total + (price * quantity);
    }, 0);
  };
  
  // Calcular total del carrito (incluyendo tarifa de envío)
  const calculateTotal = () => {
    return calculateSubtotal() + deliveryFee;
  };

  // Enviar pedido
  const submitOrder = async () => {
    // Validar información del cliente
    if (!guestInfo.guestName || !guestInfo.guestPhone || !guestInfo.guestEmail || !guestInfo.shippingAddress) {
      toast({
        title: 'Información incompleta',
        description: 'Por favor complete todos los campos requeridos',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Validar carrito
    if (cart.length === 0) {
      toast({
        title: 'Carrito vacío',
        description: 'Agregue al menos un producto al carrito',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const orderData = {
        ...guestInfo,
        products: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        })),
        // No establecemos método de pago aquí, se seleccionará en la siguiente pantalla
      };

      const response = await axios.post('/api/guest-orders', orderData);
      
      // Redirigir a la página de selección de método de pago
      window.location.href = `/payment-method/${response.data.orderId}`;
      
    } catch (err) {
      toast({
        title: 'Error al crear pedido',
        description: err.response?.data?.message || 'Ocurrió un error al procesar su pedido',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Si hay un error al cargar productos
  if (error) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="error">
          <AlertIcon />
          <AlertTitle mr={2}>Error!</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </Container>
    );
  }

  // Si el pedido fue exitoso
  if (orderSuccess) {
    return (
      <Container maxW="container.md" py={8}>
        <Card borderRadius="xl" borderColor="green.100" boxShadow="xl">
          <CardBody>
            <Box 
              bg="green.50" 
              p={4} 
              borderRadius="lg" 
              mb={6}
              position="relative"
              overflow="hidden"
            >
              <Box 
                position="absolute" 
                top="-10px" 
                right="-10px" 
                bg="green.100" 
                borderRadius="full" 
                w="80px" 
                h="80px" 
                opacity="0.5"
              />
              <Flex direction="column" align="center">
                <Box 
                  bg="green.100" 
                  color="green.700" 
                  borderRadius="full" 
                  p={3} 
                  mb={3}
                  boxShadow="md"
                >
                  <FaShoppingCart size={24} />
                </Box>
                <Heading size="lg" color="green.700" mb={2}>¡Pedido realizado con éxito!</Heading>
                <Text fontSize="md" color="green.600">
                  Su pedido ha sido registrado y está siendo procesado
                </Text>
              </Flex>
            </Box>
            
            <Box p={4} bg="gray.50" borderRadius="md" mb={6}>
              <Text mb={2} fontWeight="medium" color="gray.600">Número de pedido:</Text>
              <Text 
                fontSize="2xl" 
                fontWeight="bold" 
                letterSpacing="wide" 
                color="green.600"
                p={2}
                bg="white"
                borderRadius="md"
                boxShadow="sm"
                mb={4}
              >
                {orderId}
              </Text>
              
              <Text fontSize="sm" color="gray.500">
                Guarde este número para futuras referencias
              </Text>
            </Box>
            
            <Stack spacing={4} align="center">
              <Button 
                as={RouterLink} 
                to={`/track-order/${orderId}`} 
                colorScheme="green" 
                size="lg"
                width="full"
                boxShadow="md"
                _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
                transition="all 0.2s"
              >
                Seguir mi pedido
              </Button>
              
              <Button 
                as={RouterLink} 
                to="/" 
                variant="outline"
                width="full"
                _hover={{ bg: "gray.50" }}
              >
                Volver al inicio
              </Button>
            </Stack>
          </CardBody>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxW="container.2xl" py={{ base: 8, xl: 12 }}>
      <Box
        bg="teal.50"
        p={{ base: 4, xl: 6 }}
        borderRadius="lg"
        mb={{ base: 6, xl: 8 }}
        boxShadow="sm"
      >
        <Heading mb={2} color="teal.700" size={{ base: "md", xl: "lg" }}>Realizar pedido como invitado</Heading>
        <Text color="gray.600" fontSize={{ base: "md", xl: "lg" }}>Complete el formulario y seleccione los productos que desea ordenar</Text>
      </Box>

      <Grid templateColumns={{ base: "1fr", md: "3fr 2fr", xl: "4fr 3fr" }} gap={{ base: 8, xl: 12 }}>
        {/* Lista de productos */}
        <Box>
          <Box
            bg="linear-gradient(to right, blue.500, blue.600)"
            p={{ base: 4, xl: 6 }}
            borderRadius="lg"
            mb={{ base: 4, xl: 6 }}
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            boxShadow="md"
            color="white"
            position="relative"
            overflow="hidden"
          >
            <Box
              position="absolute"
              top="-20px"
              right="-20px"
              bg="blue.400"
              borderRadius="full"
              w={{ base: "100px", xl: "120px" }}
              h={{ base: "100px", xl: "120px" }}
              opacity="0.3"
            />
            <Heading size={{ base: "md", xl: "lg" }}>Productos disponibles</Heading>
            <Badge colorScheme="blue" fontSize={{ base: "md", xl: "lg" }} borderRadius="full" px={{ base: 3, xl: 4 }} py={{ base: 1, xl: 2 }} bg="white" color="blue.700">
              {products.length} productos
            </Badge>
          </Box>
          
          {loading ? (
            <Flex direction="column" align="center" justify="center" py={10}>
              <Box as="span" fontSize="3xl" mb={4} animation="spin 2s infinite linear">🔄</Box>
              <Text fontSize="lg" color="gray.500" fontWeight="medium">Cargando productos...</Text>
            </Flex>
          ) : (
            <Grid templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)", xl: "repeat(4, 1fr)", "2xl": "repeat(5, 1fr)" }} gap={{ base: 6, xl: 8 }}>
              {products.map(product => (
                <Card
                  key={product.id}
                  overflow="hidden"
                  borderRadius="lg"
                  boxShadow="md"
                  transition="all 0.3s"
                  _hover={{ transform: "translateY(-5px)", boxShadow: "lg" }}
                  borderColor="blue.100"
                  borderWidth="1px"
                  minH={{ base: "auto", xl: "400px" }}
                >
                  <Box position="relative">
                    {product.image ? (
                      <Image 
                        src={product.image} 
                        alt={product.name} 
                        height="200px" 
                        objectFit="cover" 
                        width="100%"
                      />
                    ) : (
                      <Flex 
                        height="200px" 
                        bg="gray.100" 
                        justify="center" 
                        align="center"
                      >
                        <Text color="gray.400">Sin imagen</Text>
                      </Flex>
                    )}
                    {product.stock <= 5 && product.stock > 0 && (
                      <Badge 
                        position="absolute" 
                        top="10px" 
                        right="10px" 
                        colorScheme="orange" 
                        variant="solid"
                        borderRadius="full"
                        px={2}
                      >
                        ¡Últimas unidades!
                      </Badge>
                    )}
                  </Box>
                  
                  <CardBody>
                    <Heading size="sm" mb={2} noOfLines={2}>{product.name}</Heading>
                    <Flex justify="space-between" align="center" mb={2}>
                      <Text color="blue.600" fontSize="xl" fontWeight="bold">
                        S/ {(product.price || 0).toFixed(2)}
                      </Text>
                      <Badge colorScheme={product.stock > 10 ? "green" : "orange"} variant="subtle">
                        Stock: {product.stock}
                      </Badge>
                    </Flex>
                    <Button 
                      colorScheme="blue" 
                      leftIcon={<FaPlus />} 
                      onClick={() => addToCart(product)}
                      size="sm"
                      width="full"
                      borderRadius="md"
                      boxShadow="sm"
                      _hover={{ transform: "scale(1.02)", boxShadow: "md" }}
                      transition="all 0.2s"
                    >
                      Agregar al carrito
                    </Button>
                  </CardBody>
                </Card>
              ))}
            </Grid>
          )}
        </Box>
        
        {/* Carrito y formulario */}
        <Box>
          <Card mb={6} borderRadius="lg" boxShadow="md" borderColor="blue.100" borderWidth="1px">
            <CardBody>
              <Box 
                bg="blue.50" 
                p={3} 
                borderRadius="md" 
                mb={4} 
                display="flex" 
                justifyContent="space-between" 
                alignItems="center"
              >
                <Heading size="md" color="blue.700">Su pedido</Heading>
                <Badge colorScheme="blue" fontSize="md" borderRadius="full" px={3} py={1}>
                  {cart.length} {cart.length === 1 ? 'producto' : 'productos'}
                </Badge>
              </Box>
              
              {cart.length === 0 ? (
                <Flex direction="column" align="center" justify="center" py={6} bg="gray.50" borderRadius="md">
                  <Box as="span" fontSize="3xl" mb={3}>🛒</Box>
                  <Text fontSize="lg" color="gray.500">No hay productos en el carrito</Text>
                  <Text fontSize="sm" color="gray.400" mt={2}>Agregue productos desde la lista de disponibles</Text>
                </Flex>
              ) : (
                <Stack spacing={4}>
                  {cart.map(item => (
                    <Box 
                      key={item.productId} 
                      p={3} 
                      borderWidth="1px" 
                      borderRadius="md"
                      boxShadow="sm"
                      bg="white"
                      transition="all 0.2s"
                      _hover={{ borderColor: "blue.200", boxShadow: "md" }}
                    >
                      <Flex justify="space-between" wrap={{base: "wrap", sm: "nowrap"}}>
                        <Box flex="1" mr={3} mb={{base: 2, sm: 0}}>
                          <Text fontWeight="bold" fontSize="md" mb={1}>{item.name}</Text>
                          <Text color="gray.600">S/ {(item.price || 0).toFixed(2)} x {item.quantity || 0}</Text>
                        </Box>
                        <Box>
                          <Text fontWeight="bold" color="blue.600" fontSize="lg" textAlign="right">
                            S/ {((item.price || 0) * (item.quantity || 0)).toFixed(2)}
                          </Text>
                          <Flex align="center" mt={2} justify="flex-end">
                            <IconButton 
                              icon={<FaMinus />} 
                              size="xs" 
                              colorScheme="blue"
                              variant="outline"
                              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                              aria-label="Disminuir cantidad"
                              isDisabled={item.quantity <= 1}
                              borderRadius="md"
                            />
                            <Text mx={2} fontWeight="medium" minW="20px" textAlign="center">{item.quantity}</Text>
                            <IconButton 
                              icon={<FaPlus />} 
                              size="xs" 
                              colorScheme="blue"
                              variant="outline"
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              aria-label="Aumentar cantidad"
                              borderRadius="md"
                            />
                            <IconButton 
                              icon={<FaTrash />} 
                              size="xs" 
                              colorScheme="red" 
                              ml={2}
                              onClick={() => removeFromCart(item.productId)}
                              aria-label="Eliminar del carrito"
                              borderRadius="md"
                              variant="outline"
                            />
                          </Flex>
                        </Box>
                      </Flex>
                    </Box>
                  ))}
                  
                  <Divider />
                  
                  <Box 
                    p={3} 
                    bg="blue.50" 
                    borderRadius="md"
                  >
                    <Stack spacing={2}>
                      <Flex justify="space-between" align="center">
                        <Text fontWeight="medium">Subtotal:</Text>
                        <Text fontWeight="medium">S/ {(calculateSubtotal() || 0).toFixed(2)}</Text>
                      </Flex>
                      
                      {deliveryFee > 0 && (
                        <Flex justify="space-between" align="center">
                          <Text fontWeight="medium">Costo de envío:</Text>
                          <Text fontWeight="medium">S/ {deliveryFee.toFixed(2)}</Text>
                        </Flex>
                      )}
                      
                      <Divider />
                      
                      <Flex justify="space-between" align="center">
                        <Text fontWeight="bold" fontSize="lg">Total:</Text>
                        <Text fontWeight="bold" fontSize="xl" color="blue.700">S/ {(calculateTotal() || 0).toFixed(2)}</Text>
                      </Flex>
                    </Stack>
                  </Box>
                </Stack>
              )}
            </CardBody>
          </Card>
          
          <Card borderRadius="lg" boxShadow="md" borderColor="teal.100" borderWidth="1px">
            <CardBody>
              <Box 
                bg="teal.50" 
                p={3} 
                borderRadius="md" 
                mb={4}
                display="flex"
                alignItems="center"
              >
                <Heading size="md" color="teal.700">Información de contacto</Heading>
              </Box>
              
              {/* Búsqueda de cliente frecuente */}
              <Box mb={4} p={4} borderWidth="1px" borderRadius="lg" bg="gray.50">
                <Heading as="h3" size="md" mb={3}>
                  ¿Cliente frecuente?
                </Heading>
                <Text mb={3}>Busque por número de documento para autocompletar los datos</Text>
                
                <Flex mb={2}>
                  <Input
                    placeholder="Ingrese DNI o RUC"
                    value={documentNumber}
                    onChange={(e) => setDocumentNumber(e.target.value)}
                    mr={2}
                  />
                  <Button
                    colorScheme="blue"
                    onClick={searchClientByDocument}
                    isLoading={searchingClient}
                  >
                    Buscar
                  </Button>
                </Flex>
              </Box>
              
              <Stack spacing={4}>
                <FormControl isRequired>
                  <FormLabel fontWeight="medium" color="gray.700">Nombre completo</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <FaUser color="gray.300" />
                    </InputLeftElement>
                    <Input 
                      name="guestName" 
                      value={guestInfo.guestName} 
                      onChange={handleInputChange} 
                      placeholder="Ingrese su nombre completo"
                      borderRadius="md"
                      focusBorderColor="teal.400"
                    />
                  </InputGroup>
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel fontWeight="medium" color="gray.700">Teléfono</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <FaPhone color="gray.300" />
                    </InputLeftElement>
                    <Input 
                      name="guestPhone" 
                      value={guestInfo.guestPhone} 
                      onChange={handleInputChange} 
                      placeholder="Ingrese su número de teléfono"
                      borderRadius="md"
                      focusBorderColor="teal.400"
                    />
                  </InputGroup>
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel fontWeight="medium" color="gray.700">Email</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <FaEnvelope color="gray.300" />
                    </InputLeftElement>
                    <Input 
                      name="guestEmail" 
                      type="email"
                      value={guestInfo.guestEmail} 
                      onChange={handleInputChange} 
                      placeholder="Ingrese su email"
                      borderRadius="md"
                      focusBorderColor="teal.400"
                    />
                  </InputGroup>
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel fontWeight="medium" color="gray.700">Distrito</FormLabel>
                  <Select
                    name="deliveryDistrict"
                    value={guestInfo.deliveryDistrict}
                    onChange={handleInputChange}
                    placeholder="Seleccione su distrito"
                    borderRadius="md"
                    focusBorderColor="teal.400"
                  >
                    {districts.map(district => (
                      <option key={district.name} value={district.name}>
                        {district.name} {district.deliveryFee > 0 ? `(+S/ ${district.deliveryFee.toFixed(2)})` : '(Gratis)'}
                      </option>
                    ))}
                  </Select>
                  <Text fontSize="sm" color="gray.500" mt={1}>
                    {deliveryFee > 0 ? 
                      `Se cobrará un costo adicional de S/ ${deliveryFee.toFixed(2)} por envío a este distrito` : 
                      'Envío gratuito para este distrito'}
                  </Text>
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel fontWeight="medium" color="gray.700">Dirección de entrega</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <FaMapMarkerAlt color="gray.300" />
                    </InputLeftElement>
                    <Textarea 
                      name="shippingAddress" 
                      value={guestInfo.shippingAddress} 
                      onChange={handleInputChange} 
                      placeholder="Ingrese su dirección completa para la entrega"
                      borderRadius="md"
                      focusBorderColor="teal.400"
                      minH="100px"
                      paddingLeft="2.5rem"
                    />
                  </InputGroup>
                  <Text fontSize="sm" color="gray.500" mt={1}>Incluya calle, número, ciudad y código postal</Text>
                </FormControl>
                
                <Button 
                  colorScheme="teal" 
                  size="lg" 
                  width="full" 
                  mt={4} 
                  onClick={submitOrder}
                  isDisabled={cart.length === 0}
                  borderRadius="md"
                  boxShadow="md"
                  _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
                  transition="all 0.2s"
                  leftIcon={<FaShoppingCart />}
                  fontWeight="bold"
                  letterSpacing="wide"
                  py={6}
                >
                  Realizar pedido
                </Button>
                
                <Text fontSize="sm" textAlign="center" mt={2}>
                  ¿Ya tiene una cuenta? <Link as={RouterLink} to="/login" color="teal.500" fontWeight="medium">Inicie sesión</Link>
                </Text>
              </Stack>
            </CardBody>
          </Card>
        </Box>
      </Grid>
    </Container>
  );
};

export default GuestOrder;