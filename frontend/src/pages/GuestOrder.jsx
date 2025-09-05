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
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Select,
  Textarea,
  Alert,
  AlertIcon,
  Spinner,
  Center,
  SimpleGrid,
  useBreakpointValue,
  Badge,
  Divider,
  useToast
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaTruck, FaMapMarkerAlt, FaPhone, FaUser } from 'react-icons/fa';
import useProductStore from '../stores/productStore';
import useDeliveryStore from '../stores/deliveryStore';

const GuestOrder = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const isMobile = useBreakpointValue({ base: true, md: false });

  // Stores
  const { products, fetchProducts, calculatePrice } = useProductStore();
  const { deliveryFees, fetchDeliveryFees } = useDeliveryStore();

  // Estados locales
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [calculatingPrice, setCalculatingPrice] = useState(false);

  // Datos del cliente visitante
  const [clientData, setClientData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    district: '',
    reference: '',
    notes: ''
  });

  useEffect(() => {
    fetchProducts();
    fetchDeliveryFees();
  }, [fetchProducts, fetchDeliveryFees]);

  const addToCart = async (product) => {
    setCalculatingPrice(true);
    try {
      console.log('Agregando producto al carrito:', product);
      console.log('Carrito actual:', cart);
      
      const result = await calculatePrice(product.id, 1);
      if (result.success) {
        const pricing = result.data;
        console.log('Precio calculado:', pricing);
        
        // Verificar si el producto ya existe en el carrito (comparar por productId)
        const existingItemIndex = cart.findIndex(item => item.productId === product.id);
        console.log('Índice del item existente:', existingItemIndex);
        
        if (existingItemIndex !== -1) {
          // Si existe, incrementar la cantidad y recalcular precio
          const updatedCart = [...cart];
          const newQuantity = updatedCart[existingItemIndex].quantity + 1;
          console.log('Incrementando cantidad a:', newQuantity);
          
          // Recalcular precio con la nueva cantidad
          const newResult = await calculatePrice(product.id, newQuantity);
          if (newResult.success) {
            const newPricing = newResult.data;
            console.log('Nuevo precio calculado:', newPricing);
            updatedCart[existingItemIndex].quantity = newQuantity;
            updatedCart[existingItemIndex].unitPrice = newPricing.unitPrice;
            updatedCart[existingItemIndex].subtotal = newPricing.unitPrice * newQuantity;
            updatedCart[existingItemIndex].pricing = newPricing;
            setCart(updatedCart);
            console.log('Carrito actualizado:', updatedCart);
          }
        } else {
          // Si no existe, agregar nuevo item
          const cartItem = {
            id: `${product.id}-${Date.now()}`, // Clave única para React
            productId: product.id, // ID del producto original
            name: product.name,
            type: product.type,
            unitPrice: pricing.unitPrice,
            quantity: 1,
            subtotal: pricing.unitPrice,
            pricing: pricing
          };
          console.log('Agregando nuevo item:', cartItem);
          setCart([...cart, cartItem]);
        }
        
        toast({
          title: 'Producto agregado',
          description: `${product.name} agregado al carrito`,
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error al calcular precio:', error);
    } finally {
      setCalculatingPrice(false);
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      setCart(cart.filter(item => item.id !== itemId));
      return;
    }

    setCalculatingPrice(true);
    try {
      const cartItem = cart.find(item => item.id === itemId);
      if (!cartItem) return;
      
      const result = await calculatePrice(cartItem.productId, newQuantity);
      if (result.success) {
        const pricing = result.data;
        setCart(cart.map(item => 
          item.id === itemId 
            ? { 
                ...item, 
                quantity: newQuantity, 
                unitPrice: pricing.unitPrice,
                subtotal: pricing.unitPrice * newQuantity,
                pricing: pricing
              }
            : item
        ));
      }
    } catch (error) {
      console.error('Error al actualizar cantidad:', error);
    } finally {
      setCalculatingPrice(false);
    }
  };

  const getDeliveryFee = () => {
    if (!clientData.district) return 0;
    const fee = deliveryFees.find(f => f.district === clientData.district);
    return fee ? fee.amount : 0;
  };

  const getSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const getTotal = () => {
    return getSubtotal() + getDeliveryFee();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (cart.length === 0) {
      toast({
        title: 'Carrito vacío',
        description: 'Agrega al menos un producto al carrito',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!clientData.name || !clientData.phone || !clientData.address || !clientData.district) {
      toast({
        title: 'Datos incompletos',
        description: 'Completa todos los campos obligatorios',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Guardar datos en localStorage para el siguiente paso
    const orderData = {
      client: clientData,
      items: cart,
      subtotal: getSubtotal(),
      deliveryFee: getDeliveryFee(),
      total: getTotal()
    };
    
    localStorage.setItem('guestOrderData', JSON.stringify(orderData));
    navigate('/payment-method');
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

  if (loading) {
    return (
      <Center h="400px">
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <Box minH="100vh" bg="gray.50" py={8}>
      <Box maxW="1200px" mx="auto" px={4}>
        <VStack spacing={8}>
          {/* Header */}
          <Box textAlign="center">
            <Heading size="xl" color="blue.600" mb={2}>
              Pedido de Agua
            </Heading>
            <Text color="gray.600" fontSize="lg">
              Realiza tu pedido de agua de forma rápida y segura
            </Text>
          </Box>

          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8} w="full">
            {/* Productos */}
            <Card>
              <CardHeader>
                <Heading size="md" color="gray.700">
                  Productos Disponibles
                </Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={4}>
                  {products.map((product) => (
                    <Card key={product.id} variant="outline" w="full">
                      <CardBody>
                        <VStack align="start" spacing={3}>
                          <HStack justify="space-between" w="full">
                            <VStack align="start" spacing={1}>
                              <Text fontWeight="bold" fontSize="lg">
                                {product.name}
                              </Text>
                              <Text color="gray.600" fontSize="sm">
                                {product.description}
                              </Text>
                            </VStack>
                            <Badge colorScheme={getTypeColor(product.type)}>
                              {getTypeText(product.type)}
                            </Badge>
                          </HStack>

                          <HStack spacing={4}>
                            <Text fontWeight="bold" color="blue.600" fontSize="lg">
                              S/ {parseFloat(product.unitPrice).toFixed(2)}
                            </Text>
                            <Text color="gray.500" fontSize="sm">
                              Stock: {product.stock}
                            </Text>
                          </HStack>

                          {(product.wholesalePrice || product.wholesalePrice2) && (
                            <Box bg="gray.50" p={3} borderRadius="md" w="full">
                              <Text fontSize="sm" fontWeight="bold" mb={2} color="gray.700">
                                Precios de Mayoreo:
                              </Text>
                              <VStack spacing={1} align="start">
                                {product.wholesalePrice && (
                                  <Text fontSize="sm" color="blue.600">
                                    • S/ {parseFloat(product.wholesalePrice).toFixed(2)} 
                                    (mín. {product.wholesaleMinQuantity} unidades)
                                  </Text>
                                )}
                                {product.wholesalePrice2 && (
                                  <Text fontSize="sm" color="purple.600">
                                    • S/ {parseFloat(product.wholesalePrice2).toFixed(2)} 
                                    (mín. {product.wholesaleMinQuantity2} unidades)
                                  </Text>
                                )}
                              </VStack>
                            </Box>
                          )}

                          <Button
                            colorScheme="blue"
                            size="sm"
                            leftIcon={<FaShoppingCart />}
                            onClick={() => addToCart(product)}
                            isLoading={calculatingPrice}
                            loadingText="Calculando..."
                            w="full"
                          >
                            Agregar al Carrito
                          </Button>
                        </VStack>
                      </CardBody>
                    </Card>
                  ))}
                </VStack>
              </CardBody>
            </Card>

            {/* Formulario y Carrito */}
            <VStack spacing={6}>
              {/* Datos del Cliente */}
              <Card w="full">
                <CardHeader>
                  <Heading size="md" color="gray.700">
                    <FaUser style={{ display: 'inline', marginRight: '8px' }} />
                    Datos del Cliente
                  </Heading>
                </CardHeader>
                <CardBody>
                  <form onSubmit={handleSubmit}>
                    <VStack spacing={4}>
                      <FormControl isRequired>
                        <FormLabel>Nombre Completo</FormLabel>
                        <Input
                          value={clientData.name}
                          onChange={(e) => setClientData({ ...clientData, name: e.target.value })}
                          placeholder="Tu nombre completo"
                        />
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel>Teléfono</FormLabel>
                        <Input
                          value={clientData.phone}
                          onChange={(e) => setClientData({ ...clientData, phone: e.target.value })}
                          placeholder="Tu número de teléfono"
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel>Email (opcional)</FormLabel>
                        <Input
                          type="email"
                          value={clientData.email}
                          onChange={(e) => setClientData({ ...clientData, email: e.target.value })}
                          placeholder="Tu correo electrónico"
                        />
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel>Dirección</FormLabel>
                        <Textarea
                          value={clientData.address}
                          onChange={(e) => setClientData({ ...clientData, address: e.target.value })}
                          placeholder="Dirección completa de entrega"
                          rows={3}
                        />
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel>Distrito</FormLabel>
                        <Select
                          value={clientData.district}
                          onChange={(e) => setClientData({ ...clientData, district: e.target.value })}
                          placeholder="Selecciona tu distrito"
                        >
                          {deliveryFees.map((fee) => (
                            <option key={fee.id} value={fee.district}>
                              {fee.district} - S/ {parseFloat(fee.amount).toFixed(2)}
                            </option>
                          ))}
                        </Select>
                      </FormControl>

                      <FormControl>
                        <FormLabel>Referencia</FormLabel>
                        <Input
                          value={clientData.reference}
                          onChange={(e) => setClientData({ ...clientData, reference: e.target.value })}
                          placeholder="Referencia del lugar (opcional)"
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel>Notas Adicionales</FormLabel>
                        <Textarea
                          value={clientData.notes}
                          onChange={(e) => setClientData({ ...clientData, notes: e.target.value })}
                          placeholder="Instrucciones especiales para la entrega"
                          rows={2}
                        />
                      </FormControl>
                    </VStack>
                  </form>
                </CardBody>
              </Card>

              {/* Carrito */}
              <Card w="full">
                <CardHeader>
                  <Heading size="md" color="gray.700">
                    <FaShoppingCart style={{ display: 'inline', marginRight: '8px' }} />
                    Carrito de Compras
                  </Heading>
                </CardHeader>
                <CardBody>
                  {cart.length === 0 ? (
                    <Alert status="info">
                      <AlertIcon />
                      Tu carrito está vacío
                    </Alert>
                  ) : (
                    <VStack spacing={4}>
                      {cart.map((item) => (
                        <Box key={item.id} w="full" p={3} border="1px" borderColor="gray.200" borderRadius="md">
                          <VStack spacing={2}>
                            <HStack justify="space-between" w="full">
                              <Text fontWeight="bold">{item.name}</Text>
                              <Badge colorScheme={getTypeColor(item.type)}>
                                {getTypeText(item.type)}
                              </Badge>
                            </HStack>
                            
                            <HStack justify="space-between" w="full">
                              <Text color="gray.600" fontSize="sm">
                                S/ {parseFloat(item.unitPrice).toFixed(2)} c/u
                              </Text>
                              <HStack spacing={2}>
                                <Button
                                  size="sm"
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  disabled={calculatingPrice}
                                >
                                  -
                                </Button>
                                <Text minW="20px" textAlign="center">
                                  {item.quantity}
                                </Text>
                                <Button
                                  size="sm"
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  disabled={calculatingPrice}
                                >
                                  +
                                </Button>
                              </HStack>
                            </HStack>
                            
                            <HStack justify="space-between" w="full">
                              <Text fontWeight="bold" color="blue.600">
                                Subtotal: S/ {parseFloat(item.subtotal).toFixed(2)}
                              </Text>
                            </HStack>
                          </VStack>
                        </Box>
                      ))}

                      <Divider />

                      <VStack spacing={2} w="full">
                        <HStack justify="space-between" w="full">
                          <Text>Subtotal:</Text>
                          <Text fontWeight="bold">S/ {parseFloat(getSubtotal()).toFixed(2)}</Text>
                        </HStack>
                        
                        <HStack justify="space-between" w="full">
                          <Text>Flete:</Text>
                          <Text fontWeight="bold">S/ {parseFloat(getDeliveryFee()).toFixed(2)}</Text>
                        </HStack>
                        
                        <Divider />
                        
                        <HStack justify="space-between" w="full">
                          <Text fontWeight="bold" fontSize="lg">Total:</Text>
                          <Text fontWeight="bold" fontSize="lg" color="blue.600">
                            S/ {parseFloat(getTotal()).toFixed(2)}
                          </Text>
                        </HStack>
                      </VStack>

                      <Button
                        colorScheme="green"
                        size="lg"
                        w="full"
                        leftIcon={<FaTruck />}
                        onClick={handleSubmit}
                        isLoading={calculatingPrice}
                        loadingText="Procesando..."
                      >
                        Proceder al Pago
                      </Button>
                    </VStack>
                  )}
                </CardBody>
              </Card>
            </VStack>
          </SimpleGrid>
        </VStack>
      </Box>
    </Box>
  );
};

export default GuestOrder;
