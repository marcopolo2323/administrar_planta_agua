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
  useToast,
  RadioGroup,
  Radio,
  Stack,
  Icon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Image
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { 
  FaShoppingCart, 
  FaTruck, 
  FaMapMarkerAlt, 
  FaPhone, 
  FaUser, 
  FaIdCard,
  FaMoneyBillWave,
  FaQrcode,
  FaWhatsapp,
  FaCreditCard,
  FaCheckCircle
} from 'react-icons/fa';
import useProductStore from '../stores/productStore';
import useDeliveryStore from '../stores/deliveryStore';
import useDistrictStore from '../stores/districtStore';
import axios from '../utils/axios';
import bidonImage from '../assets/images/img_buyon.jpeg';
import paqueteImage from '../assets/images/img_paquete_botellas.jpeg';
import plinQrImage from '../assets/images/plin_qr.jpeg';

const GuestOrderNew = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const isMobile = useBreakpointValue({ base: true, md: false });
  const { isOpen: isPlinModalOpen, onOpen: onPlinModalOpen, onClose: onPlinModalClose } = useDisclosure();

  // Stores
  const { products, fetchProducts, calculatePrice } = useProductStore();
  const { deliveryFees, fetchDeliveryFees } = useDeliveryStore();
  const { districts, fetchDistricts } = useDistrictStore();

  // Estados del flujo
  const [currentStep, setCurrentStep] = useState(1); // 1: DNI, 2: Datos, 3: Productos, 4: Modalidad, 5: Pago
  const [loading, setLoading] = useState(false);
  const [searchingDni, setSearchingDni] = useState(false);

  // Datos del cliente
  const [dni, setDni] = useState('');
  const [clientData, setClientData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    district: '',
    reference: '',
    notes: ''
  });

  // Carrito y productos
  const [cart, setCart] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(new Set());

  // Modalidad de pago
  const [paymentMethod, setPaymentMethod] = useState('contraentrega'); // contraentrega, vale, suscripcion
  const [paymentType, setPaymentType] = useState('efectivo'); // efectivo, plin

  // Función para obtener la imagen del producto
  const getProductImage = (productName) => {
    const name = productName.toLowerCase();
    if (name.includes('bidón') || name.includes('bidon') || name.includes('garrafa')) {
      return bidonImage;
    } else if (name.includes('paquete') || name.includes('pack') || name.includes('botellas')) {
      return paqueteImage;
    }
    return bidonImage;
  };

  useEffect(() => {
    fetchProducts();
    fetchDeliveryFees();
    fetchDistricts();
  }, [fetchProducts, fetchDeliveryFees, fetchDistricts]);

  // Función para buscar cliente por DNI
  const searchClientByDni = async (dniValue) => {
    setSearchingDni(true);
    
    try {
      const response = await fetch(`/api/clients/document/${dniValue}`);
      
      if (response.ok) {
        const client = await response.json();
        
        setClientData({
          ...clientData,
          name: client.name,
          phone: client.phone,
          email: client.email || '',
          address: client.address,
          district: client.district,
          reference: '',
          notes: ''
        });
        
        toast({
          title: 'Cliente encontrado',
          description: `Datos de ${client.name} cargados automáticamente`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        
        setCurrentStep(3); // Ir directamente a productos
      } else {
        toast({
          title: 'Cliente no encontrado',
          description: 'Completa tus datos manualmente',
          status: 'info',
          duration: 3000,
          isClosable: true,
        });
        setCurrentStep(2); // Ir a formulario manual
      }
    } catch (error) {
      console.error('Error al buscar cliente:', error);
      toast({
        title: 'Error de conexión',
        description: 'No se pudo conectar con el servidor',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      setCurrentStep(2); // Ir a formulario manual
    }
    
    setSearchingDni(false);
  };

  const handleDniSubmit = (e) => {
    e.preventDefault();
    if (dni.length >= 8) {
      searchClientByDni(dni);
    } else {
      toast({
        title: 'DNI inválido',
        description: 'El DNI debe tener al menos 8 dígitos',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const addToCart = async (product) => {
    if (loadingProducts.has(product.id)) return;
    
    setLoadingProducts(prev => new Set(prev).add(product.id));
    try {
      const result = await calculatePrice(product.id, 1);
      if (result.success) {
        const pricing = result.data;
        
        const existingItemIndex = cart.findIndex(item => item.productId === product.id);
        
        if (existingItemIndex !== -1) {
          const updatedCart = [...cart];
          const newQuantity = updatedCart[existingItemIndex].quantity + 1;
          
          const newResult = await calculatePrice(product.id, newQuantity);
          if (newResult.success) {
            const newPricing = newResult.data;
            updatedCart[existingItemIndex].quantity = newQuantity;
            updatedCart[existingItemIndex].unitPrice = parseFloat(newPricing.unitPrice);
            updatedCart[existingItemIndex].subtotal = parseFloat(newPricing.unitPrice) * newQuantity;
            updatedCart[existingItemIndex].pricing = newPricing;
            setCart(updatedCart);
          }
        } else {
          const cartItem = {
            id: `${product.id}-${Date.now()}`,
            productId: product.id,
            name: product.name,
            type: product.type,
            unitPrice: parseFloat(pricing.unitPrice),
            quantity: 1,
            subtotal: parseFloat(pricing.unitPrice),
            pricing: pricing
          };
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
      setLoadingProducts(prev => {
        const newSet = new Set(prev);
        newSet.delete(product.id);
        return newSet;
      });
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      setCart(cart.filter(item => item.id !== itemId));
      return;
    }

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
                unitPrice: parseFloat(pricing.unitPrice),
                subtotal: parseFloat(pricing.unitPrice) * newQuantity,
                pricing: pricing
              }
            : item
        ));
      }
    } catch (error) {
      console.error('Error al actualizar cantidad:', error);
    }
  };

  const getDeliveryFee = () => {
    if (!clientData.district) return 0;
    const district = districts.find(d => d.name === clientData.district);
    return district ? parseFloat(district.deliveryFee) : 0;
  };

  const getSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const getTotal = () => {
    return getSubtotal() + getDeliveryFee();
  };

  const handleFinalSubmit = async () => {
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

    setLoading(true);

    try {
      // Preparar datos del pedido
      const orderData = {
        customerName: clientData.name,
        customerPhone: clientData.phone,
        customerEmail: clientData.email || '',
        deliveryAddress: clientData.address,
        deliveryDistrict: clientData.district,
        deliveryReference: clientData.reference || '',
        deliveryNotes: clientData.notes || '',
        products: cart.map(item => ({
          productId: parseInt(item.id.toString().split('-')[0]), // Solo tomar la parte numérica del ID
          quantity: item.quantity,
          price: item.unitPrice
        })),
        subtotal: getSubtotal(),
        deliveryFee: getDeliveryFee(),
        totalAmount: getTotal(),
        paymentMethod: paymentType,
        paymentType: paymentMethod, // contraentrega, vale, suscripcion
        clientId: dni ? await findClientByDni(dni) : null
      };

      console.log('Enviando pedido:', orderData);

      // Crear el pedido
      const response = await axios.post('/api/guest-orders', orderData);
      
      if (response.data.success) {
        toast({
          title: '¡Pedido creado exitosamente!',
          description: `Pedido #${response.data.data.id} registrado correctamente`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });

        // Redirigir a la página de recibo
        navigate(`/receipt/${response.data.data.id}`);
      } else {
        throw new Error(response.data.message || 'Error al crear el pedido');
      }
    } catch (error) {
      console.error('Error al crear pedido:', error);
      toast({
        title: 'Error al crear pedido',
        description: error.response?.data?.message || 'No se pudo procesar el pedido',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Función auxiliar para buscar cliente por DNI
  const findClientByDni = async (dni) => {
    try {
      const response = await axios.get(`/api/clients/document/${dni}`);
      return response.data.success ? response.data.client.id : null;
    } catch (error) {
      console.log('Cliente no encontrado por DNI:', dni);
      return null;
    }
  };

  const handleWhatsAppSend = () => {
    const message = `🧾 *COMPROBANTE DE PAGO PLIN*
    
👤 Cliente: ${clientData.name}
📱 Teléfono: ${clientData.phone}
🏠 Dirección: ${clientData.address}
📍 Distrito: ${clientData.district}

🛒 *PEDIDO:*
${cart.map(item => `• ${item.name} x${item.quantity} = S/ ${item.subtotal.toFixed(2)}`).join('\n')}

💰 *TOTAL: S/ ${getTotal().toFixed(2)}*
📦 Flete: S/ ${getDeliveryFee().toFixed(2)}

✅ *PAGO REALIZADO VÍA PLIN*`;
    
    const whatsappUrl = `https://wa.me/51987654321?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    // Continuar con el proceso
    navigate('/payment-method');
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'bidon': return 'blue';
      case 'botella': return 'green';
      default: return 'gray';
    }
  };

  const getTypeText = (type) => {
    switch (type) {
      case 'bidon': return 'Bidón';
      case 'botella': return 'Botella';
      default: return type;
    }
  };

  // Renderizar paso 1: Búsqueda por DNI
  const renderStep1 = () => (
    <Card maxW="md" mx="auto">
      <CardHeader textAlign="center">
        <VStack spacing={4}>
          <Icon as={FaIdCard} boxSize={12} color="blue.500" />
          <Heading size="lg">Ingresa tu DNI</Heading>
          <Text color="gray.600">
            Buscaremos tus datos automáticamente para agilizar tu pedido
          </Text>
        </VStack>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleDniSubmit}>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel>Número de DNI</FormLabel>
              <Input
                value={dni}
                onChange={(e) => setDni(e.target.value)}
                placeholder="12345678"
                size="lg"
                textAlign="center"
                fontSize="xl"
                fontWeight="bold"
                maxLength={8}
              />
            </FormControl>
            
            <Button
              type="submit"
              colorScheme="blue"
              size="lg"
              w="full"
              isLoading={searchingDni}
              loadingText="Buscando..."
              leftIcon={<FaUser />}
            >
              Buscar Cliente
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentStep(2)}
            >
              Completar datos manualmente
            </Button>
          </VStack>
        </form>
      </CardBody>
    </Card>
  );

  // Renderizar paso 2: Formulario manual
  const renderStep2 = () => (
    <Card maxW="lg" mx="auto">
      <CardHeader>
        <Heading size="md">
          <FaUser style={{ display: 'inline', marginRight: '8px' }} />
          Datos del Cliente
        </Heading>
      </CardHeader>
      <CardBody>
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
              {Array.isArray(districts) ? districts.map((district) => (
                <option key={district.id} value={district.name}>
                  {district.name} - S/ {parseFloat(district.deliveryFee).toFixed(2)}
                </option>
              )) : null}
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

          <Button
            colorScheme="blue"
            size="lg"
            w="full"
            onClick={() => setCurrentStep(3)}
            isDisabled={!clientData.name || !clientData.phone || !clientData.address || !clientData.district}
          >
            Continuar con Productos
          </Button>
        </VStack>
      </CardBody>
    </Card>
  );

  // Renderizar paso 3: Selección de productos
  const renderStep3 = () => (
    <VStack spacing={6} w="full">
      <Card w="full">
        <CardHeader>
          <Heading size="md">
            <FaShoppingCart style={{ display: 'inline', marginRight: '8px' }} />
            Productos Disponibles
          </Heading>
        </CardHeader>
        <CardBody>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            {products.map((product) => (
              <Card key={product.id} variant="outline">
                <CardBody>
                  <VStack align="start" spacing={3}>
                    <HStack spacing={4} align="start" w="full">
                      <Box flexShrink={0}>
                        <Image
                          src={getProductImage(product.name)}
                          alt={product.name}
                          boxSize="80px"
                          objectFit="cover"
                          borderRadius="md"
                          border="2px solid #e2e8f0"
                        />
                      </Box>
                      
                      <VStack align="start" spacing={1} flex={1}>
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
                      </VStack>
                    </HStack>

                    <HStack spacing={4}>
                      <Text fontWeight="bold" color="blue.600" fontSize="lg">
                        S/ {parseFloat(product.unitPrice).toFixed(2)}
                      </Text>
                      <Text color="gray.500" fontSize="sm">
                        Stock: {product.stock}
                      </Text>
                    </HStack>

                    <Button
                      colorScheme="blue"
                      size="sm"
                      leftIcon={<FaShoppingCart />}
                      onClick={() => addToCart(product)}
                      isLoading={loadingProducts.has(product.id)}
                      loadingText="Agregando..."
                      w="full"
                    >
                      Agregar al Carrito
                    </Button>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        </CardBody>
      </Card>

      {/* Carrito */}
      {cart.length > 0 && (
        <Card w="full">
          <CardHeader>
            <Heading size="md">
              <FaShoppingCart style={{ display: 'inline', marginRight: '8px' }} />
              Tu Carrito ({cart.length} {cart.length === 1 ? 'producto' : 'productos'})
            </Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4}>
              {cart.map((item) => (
                <Box key={item.id} w="full" p={3} border="1px" borderColor="gray.200" borderRadius="md">
                  <HStack spacing={3} align="start">
                    <Image
                      src={getProductImage(item.name)}
                      alt={item.name}
                      boxSize="50px"
                      objectFit="cover"
                      borderRadius="md"
                      border="1px solid #e2e8f0"
                    />
                    
                    <VStack spacing={2} flex={1}>
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
                          >
                            -
                          </Button>
                          <Text minW="20px" textAlign="center">
                            {item.quantity}
                          </Text>
                          <Button
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
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
                  </HStack>
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
                  <Text fontWeight="bold" color="green.600">
                    S/ {parseFloat(getDeliveryFee()).toFixed(2)}
                  </Text>
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
                onClick={() => setCurrentStep(4)}
                leftIcon={<FaTruck />}
              >
                Continuar con Modalidad
              </Button>
            </VStack>
          </CardBody>
        </Card>
      )}
    </VStack>
  );

  // Renderizar paso 4: Modalidad de pago
  const renderStep4 = () => (
    <Card maxW="lg" mx="auto">
      <CardHeader textAlign="center">
        <VStack spacing={4}>
          <Icon as={FaMoneyBillWave} boxSize={12} color="green.500" />
          <Heading size="lg">Modalidad de Pago</Heading>
          <Text color="gray.600" textAlign="center">
            Selecciona cómo deseas pagar tu pedido
          </Text>
          <Alert status="info" size="sm" borderRadius="md">
            <AlertIcon />
            <Text fontSize="sm">
              <strong>Contraentrega:</strong> Pagas cuando recibes el pedido<br/>
              <strong>A Crédito:</strong> Se anota en tu vale y pagas al final del mes<br/>
              <strong>Suscripción:</strong> Pedido recurrente mensual
            </Text>
          </Alert>
        </VStack>
      </CardHeader>
      <CardBody>
        <VStack spacing={6}>
          <RadioGroup value={paymentMethod} onChange={setPaymentMethod}>
            <Stack spacing={4}>
              <Card 
                variant={paymentMethod === 'contraentrega' ? 'filled' : 'outline'}
                borderColor={paymentMethod === 'contraentrega' ? 'blue.500' : 'gray.200'}
                cursor="pointer"
                onClick={() => setPaymentMethod('contraentrega')}
              >
                <CardBody>
                  <HStack spacing={4}>
                    <Radio value="contraentrega" />
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="bold">Contraentrega</Text>
                      <Text fontSize="sm" color="gray.600">
                        Pagas en efectivo o PLIN cuando recibes tu pedido
                      </Text>
                    </VStack>
                  </HStack>
                </CardBody>
              </Card>

              <Card 
                variant={paymentMethod === 'vale' ? 'filled' : 'outline'}
                borderColor={paymentMethod === 'vale' ? 'blue.500' : 'gray.200'}
                cursor="pointer"
                onClick={() => setPaymentMethod('vale')}
              >
                <CardBody>
                  <HStack spacing={4}>
                    <Radio value="vale" />
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="bold">A Crédito (Vale)</Text>
                      <Text fontSize="sm" color="gray.600">
                        Paga al final del mes - Se anota en tu vale
                      </Text>
                    </VStack>
                  </HStack>
                </CardBody>
              </Card>

              <Card 
                variant={paymentMethod === 'suscripcion' ? 'filled' : 'outline'}
                borderColor={paymentMethod === 'suscripcion' ? 'blue.500' : 'gray.200'}
                cursor="pointer"
                onClick={() => setPaymentMethod('suscripcion')}
              >
                <CardBody>
                  <HStack spacing={4}>
                    <Radio value="suscripcion" />
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="bold">Suscripción</Text>
                      <Text fontSize="sm" color="gray.600">
                        Pedido recurrente mensual - Se cobra automáticamente
                      </Text>
                    </VStack>
                  </HStack>
                </CardBody>
              </Card>
            </Stack>
          </RadioGroup>

          {paymentMethod === 'vale' && (
            <Alert status="warning" borderRadius="md">
              <AlertIcon />
              <VStack align="start" spacing={1}>
                <Text fontWeight="bold">Importante - Pago a Crédito:</Text>
                <Text fontSize="sm">
                  • Tu pedido se anotará en tu vale de crédito<br/>
                  • Debes pagar todos los vales al final del mes<br/>
                  • El repartidor no cobrará nada en el momento de la entrega
                </Text>
              </VStack>
            </Alert>
          )}

          <Button
            colorScheme="blue"
            size="lg"
            w="full"
            onClick={() => setCurrentStep(5)}
            leftIcon={<FaCreditCard />}
          >
            {paymentMethod === 'vale' ? 'Continuar (Sin Pago Inmediato)' : 'Continuar con Forma de Pago'}
          </Button>
        </VStack>
      </CardBody>
    </Card>
  );

  // Renderizar paso 5: Forma de pago
  const renderStep5 = () => {
    // Si es pago a crédito (vale), mostrar interfaz diferente
    if (paymentMethod === 'vale') {
      return (
        <Card maxW="lg" mx="auto">
          <CardHeader textAlign="center">
            <VStack spacing={4}>
              <Icon as={FaMoneyBillWave} boxSize={12} color="orange.500" />
              <Heading size="lg">Pago a Crédito</Heading>
              <Text color="gray.600">
                Tu pedido se anotará en tu vale de crédito
              </Text>
            </VStack>
          </CardHeader>
          <CardBody>
            <VStack spacing={6}>
              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <VStack align="start" spacing={2}>
                  <Text fontWeight="bold">Cómo funciona el pago a crédito:</Text>
                  <Text fontSize="sm">
                    • Tu pedido se anotará automáticamente en tu vale<br/>
                    • El repartidor NO cobrará nada en la entrega<br/>
                    • Debes pagar todos tus vales al final del mes<br/>
                    • Puedes pagar en efectivo o PLIN cuando sea el momento
                  </Text>
                </VStack>
              </Alert>

              {/* Resumen del pedido */}
              <Card variant="outline" w="full">
                <CardBody>
                  <VStack spacing={3}>
                    <Text fontWeight="bold" fontSize="lg">Resumen del Pedido</Text>
                    <VStack spacing={2} w="full">
                      <HStack justify="space-between" w="full">
                        <Text>Cliente:</Text>
                        <Text fontWeight="bold">{clientData.name}</Text>
                      </HStack>
                      <HStack justify="space-between" w="full">
                        <Text>Modalidad:</Text>
                        <Badge colorScheme="orange">A Crédito (Vale)</Badge>
                      </HStack>
                      <VStack spacing={1} w="full" align="stretch">
                        <Text>Productos:</Text>
                        {cart.map((item, index) => (
                          <HStack key={index} justify="space-between" w="full" pl={2}>
                            <Text fontSize="sm" color="gray.600">
                              • {item.name} x{item.quantity}
                            </Text>
                            <Text fontSize="sm" fontWeight="bold">
                              S/ {parseFloat(item.subtotal).toFixed(2)}
                            </Text>
                          </HStack>
                        ))}
                      </VStack>
                      <HStack justify="space-between" w="full">
                        <Text>Total:</Text>
                        <Text fontWeight="bold" fontSize="lg" color="orange.600">
                          S/ {parseFloat(getTotal()).toFixed(2)} (A Crédito)
                        </Text>
                      </HStack>
                    </VStack>
                  </VStack>
                </CardBody>
              </Card>

                  <Button
                    colorScheme="orange"
                    size="lg"
                    w="full"
                    onClick={handleFinalSubmit}
                    leftIcon={<FaCheckCircle />}
                    isLoading={loading}
                    loadingText="Creando pedido..."
                  >
                    Confirmar Pedido a Crédito
                  </Button>
            </VStack>
          </CardBody>
        </Card>
      );
    }

    // Interfaz normal para contraentrega y suscripción
    return (
      <Card maxW="lg" mx="auto">
        <CardHeader textAlign="center">
          <VStack spacing={4}>
            <Icon as={FaCreditCard} boxSize={12} color="purple.500" />
            <Heading size="lg">Forma de Pago</Heading>
            <Text color="gray.600">
              ¿Cómo deseas pagar?
            </Text>
          </VStack>
        </CardHeader>
        <CardBody>
          <VStack spacing={6}>
            <RadioGroup value={paymentType} onChange={setPaymentType}>
              <Stack spacing={4}>
              <Card 
                variant={paymentType === 'efectivo' ? 'filled' : 'outline'}
                borderColor={paymentType === 'efectivo' ? 'blue.500' : 'gray.200'}
                cursor="pointer"
                onClick={() => setPaymentType('efectivo')}
              >
                <CardBody>
                  <HStack spacing={4}>
                    <Radio value="efectivo" />
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="bold">Efectivo</Text>
                      <Text fontSize="sm" color="gray.600">
                        Paga en efectivo al repartidor
                      </Text>
                    </VStack>
                  </HStack>
                </CardBody>
              </Card>

              <Card 
                variant={paymentType === 'plin' ? 'filled' : 'outline'}
                borderColor={paymentType === 'plin' ? 'blue.500' : 'gray.200'}
                cursor="pointer"
                onClick={() => setPaymentType('plin')}
              >
                <CardBody>
                  <HStack spacing={4}>
                    <Radio value="plin" />
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="bold">PLIN</Text>
                      <Text fontSize="sm" color="gray.600">
                        Pago digital con QR
                      </Text>
                    </VStack>
                  </HStack>
                </CardBody>
              </Card>
            </Stack>
          </RadioGroup>

          {/* Resumen del pedido */}
          <Card variant="outline" w="full">
            <CardBody>
              <VStack spacing={3}>
                <Text fontWeight="bold" fontSize="lg">Resumen del Pedido</Text>
                <VStack spacing={2} w="full">
                  <HStack justify="space-between" w="full">
                    <Text>Cliente:</Text>
                    <Text fontWeight="bold">{clientData.name}</Text>
                  </HStack>
                  <HStack justify="space-between" w="full">
                    <Text>Modalidad:</Text>
                    <Badge colorScheme="blue">
                      {paymentMethod === 'contraentrega' ? 'Contraentrega' : 
                       paymentMethod === 'vale' ? 'A Crédito (Vale)' : 'Suscripción'}
                    </Badge>
                  </HStack>
                  <VStack spacing={1} w="full" align="stretch">
                    <Text>Productos:</Text>
                    {cart.map((item, index) => (
                      <HStack key={index} justify="space-between" w="full" pl={2}>
                        <Text fontSize="sm" color="gray.600">
                          • {item.name} x{item.quantity}
                        </Text>
                        <Text fontSize="sm" fontWeight="bold">
                          S/ {parseFloat(item.subtotal).toFixed(2)}
                        </Text>
                      </HStack>
                    ))}
                  </VStack>
                  <HStack justify="space-between" w="full">
                    <Text>Total:</Text>
                    <Text fontWeight="bold" fontSize="lg" color="blue.600">
                      S/ {parseFloat(getTotal()).toFixed(2)}
                    </Text>
                  </HStack>
                </VStack>
              </VStack>
            </CardBody>
          </Card>

            <Button
              colorScheme="green"
              size="lg"
              w="full"
              onClick={handleFinalSubmit}
              leftIcon={<FaCheckCircle />}
              isLoading={loading}
              loadingText="Creando pedido..."
            >
              {paymentType === 'efectivo' ? 'Confirmar Pedido' : 'Pagar con PLIN'}
            </Button>
          </VStack>
        </CardBody>
      </Card>
    );
  };

  // Modal para pago PLIN
  const renderPlinModal = () => (
    <Modal isOpen={isPlinModalOpen} onClose={onPlinModalClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader textAlign="center">
          <VStack spacing={2}>
            <Icon as={FaQrcode} boxSize={8} color="purple.500" />
            <Text>Pago con PLIN</Text>
          </VStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={6}>
            <Alert status="info">
              <AlertIcon />
              Escanea el código QR con tu app PLIN
            </Alert>

            <Box textAlign="center">
              <Image
                src={plinQrImage}
                alt="QR PLIN"
                maxW="200px"
                mx="auto"
                borderRadius="md"
              />
            </Box>

            <VStack spacing={2}>
              <Text fontWeight="bold" fontSize="lg">
                Total a pagar: S/ {parseFloat(getTotal()).toFixed(2)}
              </Text>
              <Text fontSize="sm" color="gray.600">
                Incluye productos + flete de envío
              </Text>
            </VStack>

            <Alert status="warning">
              <AlertIcon />
              <Text fontSize="sm">
                Después de pagar, envía el comprobante por WhatsApp
              </Text>
            </Alert>

            <Button
              colorScheme="green"
              size="lg"
              w="full"
              leftIcon={<FaWhatsapp />}
              onClick={handleWhatsAppSend}
            >
              Enviar Comprobante por WhatsApp
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );

  return (
    <Box minH="100vh" bg="gray.50" py={8}>
      <Box maxW="1200px" mx="auto" px={4}>
        <VStack spacing={8}>
          {/* Header */}
          <Box textAlign="center">
            <Heading size="xl" color="blue.600" mb={2}>
              Pedido Rápido de Agua
            </Heading>
            <Text color="gray.600" fontSize="lg">
              Proceso simplificado en 5 pasos
            </Text>
          </Box>

          {/* Indicador de pasos */}
          <HStack spacing={4} justify="center" flexWrap="wrap">
            {[1, 2, 3, 4, 5].map((step) => (
              <HStack key={step} spacing={2}>
                <Box
                  w={8}
                  h={8}
                  borderRadius="full"
                  bg={step <= currentStep ? 'blue.500' : 'gray.200'}
                  color={step <= currentStep ? 'white' : 'gray.500'}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  fontSize="sm"
                  fontWeight="bold"
                >
                  {step}
                </Box>
                <Text fontSize="sm" color={step <= currentStep ? 'blue.600' : 'gray.500'}>
                  {step === 1 ? 'DNI' : 
                   step === 2 ? 'Datos' : 
                   step === 3 ? 'Productos' : 
                   step === 4 ? 'Modalidad' : 'Pago'}
                </Text>
              </HStack>
            ))}
          </HStack>

          {/* Contenido del paso actual */}
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
          {currentStep === 5 && renderStep5()}

          {/* Botones de navegación */}
          {currentStep > 1 && (
            <HStack spacing={4}>
              <Button
                variant="outline"
                onClick={() => setCurrentStep(currentStep - 1)}
              >
                ← Anterior
              </Button>
              {currentStep < 5 && (
                <Button
                  colorScheme="blue"
                  onClick={() => setCurrentStep(currentStep + 1)}
                >
                  Siguiente →
                </Button>
              )}
            </HStack>
          )}
        </VStack>
      </Box>

      {/* Modal PLIN */}
      {renderPlinModal()}
    </Box>
  );
};

export default GuestOrderNew;
