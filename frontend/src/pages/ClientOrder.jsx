import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Button,
  Spinner,
  Center,
  SimpleGrid,
  Badge,
  useToast,
  Select,
  Flex,
  Icon,
  Divider,
  Alert,
  AlertIcon
} from '@chakra-ui/react';
import {
  FaShoppingCart,
  FaBox,
  FaMapMarkerAlt,
  FaClock,
  FaCheckCircle,
  FaPlus,
  FaMinus
} from 'react-icons/fa';
import axios from '../utils/axios';
import useAuthStore from '../stores/authStore';
import useDistrictStore from '../stores/districtStore';
import bidonImage from '../assets/images/img_buyon.jpeg';
import paqueteImage from '../assets/images/img_paquete_botellas.jpeg';

const ClientOrder = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [deliveryFeeDetails, setDeliveryFeeDetails] = useState(null);
  const [clientProfile, setClientProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const { user } = useAuthStore();
  const { districts: storeDistricts, fetchDistricts } = useDistrictStore();

  // Función para obtener la imagen del producto
  const getProductImage = (productName) => {
    const name = productName.toLowerCase();
    if (name.includes('bidón') || name.includes('bidon') || name.includes('garrafa')) {
      return bidonImage;
    } else if (name.includes('paquete') || name.includes('pack') || name.includes('botellas')) {
      return paqueteImage;
    }
    return bidonImage; // Imagen por defecto
  };
  const toast = useToast();

  useEffect(() => {
    fetchData();
    fetchClientProfile();
    fetchDistricts();
  }, [user, fetchDistricts]);

  useEffect(() => {
    // Cargar datos del perfil del cliente cuando esté disponible
    if (clientProfile && storeDistricts.length > 0) {
      if (clientProfile.address) {
        setDeliveryAddress(clientProfile.address);
      }
      if (clientProfile.district) {
        // Buscar el ID del distrito por nombre
        const district = storeDistricts.find(d => d.name === clientProfile.district);
        if (district) {
          setSelectedDistrict(district.id.toString());
        }
      }
    }
  }, [clientProfile, storeDistricts]);

  // Efecto para calcular flete automáticamente cuando cambie el distrito o el carrito
  useEffect(() => {
    if (selectedDistrict && storeDistricts.length > 0) {
      const district = storeDistricts.find(d => d.id.toString() === selectedDistrict);
      if (district) {
        const orderAmount = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        calculateDeliveryFeeAsync(district.name, orderAmount);
      }
    }
  }, [selectedDistrict, cart, storeDistricts]);

  const fetchData = async () => {
    try {
      console.log('Cargando datos...');
      const productsRes = await axios.get('/api/products');
      
      console.log('Respuesta productos:', productsRes.data);
      
      const products = productsRes.data.data || productsRes.data || [];
      
      console.log('Productos procesados:', products);
      
      setProducts(products);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClientProfile = async () => {
    if (!user) return;
    
    setLoadingProfile(true);
    try {
      console.log('Cargando perfil del cliente...');
      const response = await axios.get('/api/client/profile');
      console.log('Perfil del cliente:', response.data);
      
      if (response.data.client) {
        setClientProfile(response.data.client);
      }
    } catch (error) {
      console.error('Error al cargar perfil del cliente:', error);
      // Si no se puede cargar el perfil, usar datos básicos del usuario
      if (user.address) setDeliveryAddress(user.address);
      if (user.district) {
        const district = storeDistricts.find(d => d.name === user.district);
        if (district) setSelectedDistrict(district.id.toString());
      }
    } finally {
      setLoadingProfile(false);
    }
  };

  // Función para calcular el precio según la cantidad
  const calculatePrice = (product, quantity) => {
    const qty = parseInt(quantity);
    
    // Verificar si hay precio por mayor
    if (product.wholesalePrice && qty >= product.wholesaleMinQuantity) {
      // Verificar si hay segundo nivel de precio por mayor
      if (product.wholesalePrice2 && qty >= product.wholesaleMinQuantity2) {
        // Verificar si hay tercer nivel de precio por mayor
        if (product.wholesalePrice3 && qty >= product.wholesaleMinQuantity3) {
          return parseFloat(product.wholesalePrice3);
        }
        return parseFloat(product.wholesalePrice2);
      }
      return parseFloat(product.wholesalePrice);
    }
    
    return parseFloat(product.unitPrice);
  };

  // Función para calcular el flete automáticamente
  const calculateDeliveryFeeAsync = async (districtName, orderAmount) => {
    try {
      const response = await axios.post('/api/districts/calculate-delivery-fee', {
        districtName,
        orderAmount
      });
      
      if (response.data.success) {
        setDeliveryFee(response.data.data.deliveryFee);
        setDeliveryFeeDetails(response.data.data);
        console.log('Flete calculado:', response.data.data);
      }
    } catch (error) {
      console.error('Error al calcular flete:', error);
      // Si hay error, usar flete por defecto
      setDeliveryFee(5); // Flete por defecto
    }
  };

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.productId === product.id);
    if (existingItem) {
      const newQuantity = existingItem.quantity + 1;
      const newPrice = calculatePrice(product, newQuantity);
      setCart(cart.map(item =>
        item.productId === product.id
          ? { ...item, quantity: newQuantity, price: newPrice }
          : item
      ));
    } else {
      setCart([...cart, {
        productId: product.id,
        product: product,
        quantity: 1,
        price: calculatePrice(product, 1)
      }]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(cart.map(item => {
      if (item.productId === productId) {
        const newPrice = calculatePrice(item.product, quantity);
        return { ...item, quantity: quantity, price: newPrice };
      }
      return item;
    }));
  };

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateDeliveryFee = () => {
    // Usar el flete calculado automáticamente
    return deliveryFee;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateDeliveryFee();
  };

  const handleSubmitOrder = async () => {
    if (cart.length === 0) {
      toast({
        title: 'Carrito vacío',
        description: 'Agrega productos al carrito antes de hacer el pedido',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!selectedDistrict || !deliveryAddress) {
      toast({
        title: 'Información incompleta',
        description: 'Selecciona un distrito y proporciona la dirección de entrega',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setSubmitting(true);
    try {
      const orderData = {
        clientId: clientProfile?.id || user.id, // ID del cliente frecuente
        products: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price
        })),
        deliveryAddress,
        deliveryDistrict: storeDistricts.find(d => d.id === parseInt(selectedDistrict))?.name,
        contactPhone: clientProfile?.phone || user.phone || 'No especificado',
        paymentMethod: 'credito', // Cliente frecuente paga a crédito (vales)
        notes: deliveryNotes
      };

      console.log('Enviando pedido de cliente frecuente:', orderData);
      const response = await axios.post('/api/orders', orderData);
      
      if (response.data.success) {
        toast({
          title: '¡Pedido Creado Exitosamente! 🎉',
          description: 'Tu pedido ha sido creado. Se generará un vale automáticamente para pago a fin de mes.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        
        // Limpiar carrito
        setCart([]);
        setSelectedDistrict('');
        setDeliveryAddress('');
        setDeliveryNotes('');
      }
    } catch (error) {
      console.error('Error al crear pedido:', error);
      console.error('Detalles del error:', error.response?.data);
      
      const errorMessage = error.response?.data?.message || 'No se pudo crear el pedido';
      
      toast({
        title: 'Error al crear pedido',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
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
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box>
          <Heading size="lg" mb={2}>
            <Icon as={FaShoppingCart} mr={2} />
            Hacer Pedido
          </Heading>
          <Text color="gray.600">
            Cliente: {user.username} - {user.email}
          </Text>
        </Box>

        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
          {/* Productos */}
          <Card>
            <CardHeader>
              <Heading size="md">Productos Disponibles</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                {console.log('Renderizando productos:', products)}
                {products.length === 0 ? (
                  <Text color="gray.500" textAlign="center" py={8}>
                    No hay productos disponibles
                  </Text>
                ) : (
                  products.map((product) => (
                  <Box key={product.id} p={4} border="1px" borderColor="gray.200" borderRadius="md">
                    <HStack spacing={4} align="start">
                      {/* Imagen del producto */}
                      <Box flexShrink={0}>
                        <img
                          src={getProductImage(product.name)}
                          alt={product.name}
                          style={{
                            width: '80px',
                            height: '80px',
                            objectFit: 'cover',
                            borderRadius: '8px',
                            border: '2px solid #e2e8f0'
                          }}
                        />
                      </Box>
                      
                      {/* Información del producto */}
                      <VStack align="start" spacing={1} flex={1}>
                        <Text fontWeight="bold" fontSize="lg">{product.name}</Text>
                        <Text fontSize="sm" color="gray.600">
                          {product.description}
                        </Text>
                        <VStack align="start" spacing={1}>
                          <Text color="blue.600" fontWeight="bold">
                            S/ {parseFloat(product.unitPrice).toFixed(2)} c/u
                          </Text>
                          {product.wholesalePrice && (
                            <Text fontSize="xs" color="green.600">
                              S/ {parseFloat(product.wholesalePrice).toFixed(2)} desde {product.wholesaleMinQuantity} unidades
                            </Text>
                          )}
                          {product.wholesalePrice2 && (
                            <Text fontSize="xs" color="green.600">
                              S/ {parseFloat(product.wholesalePrice2).toFixed(2)} desde {product.wholesaleMinQuantity2} unidades
                            </Text>
                          )}
                          {product.wholesalePrice3 && (
                            <Text fontSize="xs" color="green.600">
                              S/ {parseFloat(product.wholesalePrice3).toFixed(2)} desde {product.wholesaleMinQuantity3} unidades
                            </Text>
                          )}
                        </VStack>
                      </VStack>
                      
                      {/* Botón de agregar */}
                      <Button
                        size="sm"
                        colorScheme="blue"
                        leftIcon={<FaPlus />}
                        onClick={() => addToCart(product)}
                        flexShrink={0}
                      >
                        Agregar
                      </Button>
                    </HStack>
                  </Box>
                  ))
                )}
              </VStack>
            </CardBody>
          </Card>

          {/* Carrito y Checkout */}
          <Card>
            <CardHeader>
              <Heading size="md">Mi Carrito</Heading>
            </CardHeader>
            <CardBody>
              {cart.length === 0 ? (
                <Text color="gray.500" textAlign="center" py={8}>
                  Tu carrito está vacío
                </Text>
              ) : (
                <VStack spacing={4} align="stretch">
                  {cart.map((item) => (
                    <Box key={item.productId} p={3} border="1px" borderColor="gray.200" borderRadius="md">
                      <HStack spacing={3} align="start">
                        {/* Imagen del producto en el carrito */}
                        <Box flexShrink={0}>
                          <img
                            src={getProductImage(item.product.name)}
                            alt={item.product.name}
                            style={{
                              width: '50px',
                              height: '50px',
                              objectFit: 'cover',
                              borderRadius: '6px',
                              border: '1px solid #e2e8f0'
                            }}
                          />
                        </Box>
                        
                        {/* Información del producto */}
                        <VStack align="start" spacing={1} flex={1}>
                          <Text fontWeight="bold">{item.product.name}</Text>
                          <Text fontSize="sm" color="gray.600">
                            S/ {item.price.toFixed(2)} c/u
                          </Text>
                        </VStack>
                        
                        {/* Controles de cantidad */}
                        <HStack spacing={2}>
                          <Button
                            size="xs"
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          >
                            <FaMinus />
                          </Button>
                          <Text minW="20px" textAlign="center">
                            {item.quantity}
                          </Text>
                          <Button
                            size="xs"
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          >
                            <FaPlus />
                          </Button>
                        </HStack>
                      </HStack>
                    </Box>
                  ))}

                  <Divider />

                  {/* Información de entrega */}
                  <VStack spacing={3} align="stretch">
                    <HStack justify="space-between" align="center">
                      <Text fontWeight="bold" fontSize="md">Información de Entrega</Text>
                      {loadingProfile ? (
                        <HStack spacing={2}>
                          <Spinner size="xs" />
                          <Text fontSize="xs" color="gray.600">Cargando datos...</Text>
                        </HStack>
                      ) : clientProfile ? (
                        <Badge colorScheme="green" fontSize="xs">
                          ✓ Datos cargados automáticamente
                        </Badge>
                      ) : null}
                    </HStack>
                    
                    {clientProfile && (
                      <Alert status="success" fontSize="sm">
                        <AlertIcon />
                        <Text>
                          Usando los datos de tu perfil: {clientProfile.address}, {clientProfile.district}
                        </Text>
                      </Alert>
                    )}
                    
                    <Alert status="info">
                      <AlertIcon />
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm" fontWeight="bold">
                          Flete Automático
                        </Text>
                        <Text fontSize="xs">
                          El flete se calcula automáticamente según tu distrito. 
                          Pedidos grandes tienen descuentos: 10% desde S/50, 20% desde S/100.
                        </Text>
                      </VStack>
                    </Alert>
                    <Select
                      placeholder="Seleccionar distrito"
                      value={selectedDistrict}
                      onChange={(e) => setSelectedDistrict(e.target.value)}
                    >
                      {storeDistricts.map(district => (
                        <option key={district.id} value={district.id}>
                          {district.name} - Flete base: S/ {parseFloat(district.deliveryFee || 0).toFixed(2)}
                        </option>
                      ))}
                    </Select>

                    <input
                      type="text"
                      placeholder="Dirección de entrega"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      style={{
                        padding: '8px',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        width: '100%'
                      }}
                    />

                    <textarea
                      placeholder="Notas de entrega (opcional)"
                      value={deliveryNotes}
                      onChange={(e) => setDeliveryNotes(e.target.value)}
                      style={{
                        padding: '8px',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        width: '100%',
                        minHeight: '60px'
                      }}
                    />
                  </VStack>

                  <Divider />

                  {/* Resumen de precios */}
                  <VStack spacing={2} align="stretch">
                    <HStack justify="space-between">
                      <Text>Subtotal:</Text>
                      <Text>S/ {calculateSubtotal().toFixed(2)}</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text color="green.600" fontWeight="bold">Flete:</Text>
                      <VStack align="end" spacing={0}>
                        <Text color="green.600" fontWeight="bold">
                          S/ {calculateDeliveryFee().toFixed(2)}
                        </Text>
                        {deliveryFeeDetails && deliveryFeeDetails.discount > 0 && (
                          <Text fontSize="xs" color="green.500">
                            ¡Descuento del {deliveryFeeDetails.discount}% aplicado!
                          </Text>
                        )}
                      </VStack>
                    </HStack>
                    <HStack justify="space-between" borderTop="1px" borderColor="gray.200" pt={2}>
                      <Text fontWeight="bold" fontSize="lg">Total:</Text>
                      <Text fontWeight="bold" fontSize="lg" color="blue.600">
                        S/ {calculateTotal().toFixed(2)}
                      </Text>
                    </HStack>
                  </VStack>

                  <Alert status="info">
                    <AlertIcon />
                    <Text fontSize="sm">
                      Como cliente frecuente, se generará un vale automáticamente.
                      Pagarás todos tus vales a fin de mes con tu repartidor.
                    </Text>
                  </Alert>

                  <Button
                    colorScheme="blue"
                    size="lg"
                    onClick={handleSubmitOrder}
                    isLoading={submitting}
                    loadingText="Creando pedido..."
                    isDisabled={cart.length === 0 || !selectedDistrict || !deliveryAddress}
                  >
                    <Icon as={FaCheckCircle} mr={2} />
                    Crear Pedido y Vale
                  </Button>
                </VStack>
              )}
            </CardBody>
          </Card>
        </SimpleGrid>
      </VStack>
    </Box>
  );
};

export default ClientOrder;
