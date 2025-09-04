import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  Stack,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Spinner,
  Card,
  CardBody,
  Divider,
  Badge,
  Grid,
  Flex,
  Link,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  VStack,
  HStack,
  Image,
  FormControl,
  FormLabel,
  Input
} from '@chakra-ui/react';
import { CheckIcon } from '@chakra-ui/icons';
import axios from 'axios';

const TrackOrder = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Función para redirigir a la página de selección de método de pago
  const handlePayment = () => {
    // Redirigir a la página de selección de método de pago
    window.location.href = `/payment-method/${id}`;
  };

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await axios.get(`/api/guest-orders/track/${id}`);
        setOrder(response.data);
        setLoading(false);
      } catch (err) {
        setError('No se pudo encontrar el pedido. Verifique el número de pedido e intente nuevamente.');
        setLoading(false);
      }
    };

    if (id) {
      fetchOrder();
    }
  }, [id]);

  // Función para mostrar el estado del pedido con color
  const getStatusBadge = (status) => {
    let colorScheme = 'gray';
    
    switch (status.toLowerCase()) {
      case 'pendiente':
        colorScheme = 'yellow';
        break;
      case 'en proceso':
      case 'procesando':
        colorScheme = 'blue';
        break;
      case 'en camino':
      case 'enviado':
        colorScheme = 'purple';
        break;
      case 'entregado':
      case 'completado':
        colorScheme = 'green';
        break;
      case 'cancelado':
        colorScheme = 'red';
        break;
      default:
        colorScheme = 'gray';
    }
    
    return <Badge colorScheme={colorScheme} fontSize="0.9em" p={1}>{status}</Badge>;
  };

  // Función para mostrar el estado del pago con color
  const getPaymentStatusBadge = (status) => {
    let colorScheme = 'gray';
    
    switch (status.toLowerCase()) {
      case 'pendiente':
        colorScheme = 'yellow';
        break;
      case 'pagado':
      case 'completado':
        colorScheme = 'green';
        break;
      case 'rechazado':
      case 'fallido':
        colorScheme = 'red';
        break;
      default:
        colorScheme = 'gray';
    }
    
    return <Badge colorScheme={colorScheme} fontSize="0.9em" p={1}>{status}</Badge>;
  };

  // Si está cargando
  if (loading) {
    return (
      <Container maxW="container.md" py={8} centerContent>
        <Spinner size="xl" />
        <Text mt={4}>Cargando información del pedido...</Text>
      </Container>
    );
  }

  // Si hay un error
  if (error) {
    return (
      <Container maxW="container.md" py={8}>
        <Alert status="error">
          <AlertIcon />
          <Box>
            <AlertTitle>Error al buscar el pedido</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Box>
        </Alert>
        <Button as={RouterLink} to="/" mt={4} colorScheme="blue">
          Volver al inicio
        </Button>
      </Container>
    );
  }

  // Si no se encontró el pedido
  if (!order) {
    return (
      <Container maxW="container.md" py={8}>
        <Alert status="warning">
          <AlertIcon />
          <Box>
            <AlertTitle>Pedido no encontrado</AlertTitle>
            <AlertDescription>
              No pudimos encontrar un pedido con el número {id}. Por favor, verifique el número e intente nuevamente.
            </AlertDescription>
          </Box>
        </Alert>
        <Button as={RouterLink} to="/" mt={4} colorScheme="blue">
          Volver al inicio
        </Button>
      </Container>
    );
  }

  return (
    <Container maxW="container.lg" py={8}>
      <Card mb={6}>
        <CardBody>
          <Flex justify="space-between" align="center" mb={4}>
            <Heading size="lg">Pedido #{order.id}</Heading>
            <Box>
              <Text fontWeight="bold" mb={2}>Estado del pedido:</Text>
              {getStatusBadge(order.status)}
            </Box>
          </Flex>
          
          <Divider mb={4} />
          
          <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
            {/* Información del cliente */}
            <Box>
              <Heading size="md" mb={3}>Información de contacto</Heading>
              <Stack spacing={2}>
                <Text><strong>Nombre:</strong> {order.guestOrder?.guestName}</Text>
                <Text><strong>Teléfono:</strong> {order.guestOrder?.guestPhone}</Text>
                <Text><strong>Email:</strong> {order.guestOrder?.guestEmail}</Text>
              </Stack>
            </Box>
            
            {/* Información del pedido */}
            <Box>
              <Heading size="md" mb={3}>Detalles del pedido</Heading>
              <Stack spacing={2}>
                <Text><strong>Fecha:</strong> {new Date(order.orderDate).toLocaleDateString()}</Text>
                <Text><strong>Método de pago:</strong> {order.paymentMethod}</Text>
                <Text>
                  <strong>Estado de pago:</strong> {getPaymentStatusBadge(order.paymentStatus)}
                </Text>
              </Stack>
            </Box>
          </Grid>
          
          <Box mt={6}>
            <Heading size="md" mb={3}>Dirección de entrega</Heading>
            <Text><strong>Dirección:</strong> {order.deliveryAddress}</Text>
            <Text><strong>Distrito:</strong> {order.deliveryDistrict}</Text>
            <Text><strong>Teléfono de contacto:</strong> {order.contactPhone}</Text>
          </Box>
        </CardBody>
      </Card>
      
      {/* Productos del pedido */}
      <Card>
        <CardBody>
          <Heading size="md" mb={4}>Productos</Heading>
          
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Producto</Th>
                <Th isNumeric>Precio</Th>
                <Th isNumeric>Cantidad</Th>
                <Th isNumeric>Subtotal</Th>
              </Tr>
            </Thead>
            <Tbody>
              {order.orderDetails?.map((detail) => (
                <Tr key={detail.id}>
                  <Td>{detail.product?.name}</Td>
                  <Td isNumeric>S/ {parseFloat(detail.unitPrice || 0).toFixed(2)}</Td>
                  <Td isNumeric>{detail.quantity}</Td>
                  <Td isNumeric>S/ {parseFloat(detail.subtotal || 0).toFixed(2)}</Td>
                </Tr>
              ))}
              {/* Fila de flete/costo de envío */}
              {order.deliveryFee > 0 && (
                <Tr>
                  <Td colSpan={3} fontWeight="bold">Flete / Costo de envío</Td>
                  <Td isNumeric fontWeight="bold">S/ {parseFloat(order.deliveryFee || 0).toFixed(2)}</Td>
                </Tr>
              )}
              <Tr>
                <Td colSpan={3} fontWeight="bold">Total</Td>
                <Td isNumeric fontWeight="bold">S/ {parseFloat(order.total || 0).toFixed(2)}</Td>
              </Tr>
            </Tbody>
          </Table>
          
          <Box mt={6}>
            {order.paymentStatus === 'pendiente' ? (
              <>
                <Heading size="md" mb={4}>Opciones de Pago</Heading>
                {paymentSuccess ? (
                  <Alert status="success" mb={4}>
                    <AlertIcon />
                    <Box>
                      <AlertTitle>¡Pago procesado exitosamente!</AlertTitle>
                      <AlertDescription>
                        Gracias por su compra. Su pedido será procesado a la brevedad.
                      </AlertDescription>
                    </Box>
                  </Alert>
                ) : (
                  <Tabs variant="enclosed" colorScheme="blue" mb={4}>
                  <TabList>
                    <Tab>Yape</Tab>
                    <Tab>Tarjeta</Tab>
                    <Tab>Efectivo</Tab>
                  </TabList>
                  
                  <TabPanels>
                    {/* Panel de Yape */}
                    <TabPanel>
                      <VStack spacing={4} align="stretch">
                        <Alert status="info" borderRadius="md">
                          <AlertIcon />
                          <Box>
                            <AlertTitle>Pago con Yape</AlertTitle>
                            <AlertDescription>
                              Escanea el código QR o envía el pago al número indicado.
                            </AlertDescription>
                          </Box>
                        </Alert>
                        
                        <Box textAlign="center">
                          <Image 
                            src="https://via.placeholder.com/200x200?text=QR+YAPE" 
                            alt="Código QR Yape" 
                            maxH="200px" 
                            mx="auto"
                            mb={2}
                          />
                          <Text fontWeight="bold">Número: 999-999-999</Text>
                          <Text>A nombre de: Punto de Venta SAC</Text>
                        </Box>
                        
                        <Button 
                          colorScheme="green" 
                          leftIcon={<CheckIcon />} 
                          mt={2} 
                          onClick={handlePayment}
                          isLoading={isProcessingPayment}
                        >
                          Continuar con Pago Yape
                        </Button>
                      </VStack>
                    </TabPanel>
                    
                    {/* Panel de Tarjeta */}
                    <TabPanel>
                      <VStack spacing={4} align="stretch">
                        <Alert status="info" borderRadius="md">
                          <AlertIcon />
                          <Box>
                            <AlertTitle>Pago con Tarjeta</AlertTitle>
                            <AlertDescription>
                              Ingresa los datos de tu tarjeta para procesar el pago de forma segura.
                            </AlertDescription>
                          </Box>
                        </Alert>
                        
                        <FormControl isRequired>
                          <FormLabel>Número de Tarjeta</FormLabel>
                          <Input placeholder="1234 5678 9012 3456" maxLength={16} />
                        </FormControl>
                        
                        <FormControl isRequired>
                          <FormLabel>Nombre del Titular</FormLabel>
                          <Input placeholder="Como aparece en la tarjeta" />
                        </FormControl>
                        
                        <HStack spacing={4}>
                          <FormControl isRequired>
                            <FormLabel>Fecha de Expiración</FormLabel>
                            <Input placeholder="MM/YY" maxLength={5} />
                          </FormControl>
                          
                          <FormControl isRequired>
                            <FormLabel>CVV</FormLabel>
                            <Input placeholder="123" maxLength={4} type="password" />
                          </FormControl>
                        </HStack>
                        
                        <Button 
                          colorScheme="blue" 
                          leftIcon={<CheckIcon />} 
                          mt={2} 
                          onClick={handlePayment}
                          isLoading={isProcessingPayment}
                        >
                          Continuar con Pago con Tarjeta
                        </Button>
                      </VStack>
                    </TabPanel>
                    
                    {/* Panel de Efectivo */}
                    <TabPanel>
                      <VStack spacing={4} align="stretch">
                        <Alert status="info" borderRadius="md">
                          <AlertIcon />
                          <Box>
                            <AlertTitle>Pago en Efectivo</AlertTitle>
                            <AlertDescription>
                              Paga en efectivo al momento de la entrega.
                            </AlertDescription>
                          </Box>
                        </Alert>
                        
                        <Button 
                          colorScheme="yellow" 
                          leftIcon={<CheckIcon />} 
                          mt={2} 
                          onClick={handlePayment}
                          isLoading={isProcessingPayment}
                        >
                          Continuar con Pago en Efectivo
                        </Button>
                      </VStack>
                    </TabPanel>
                  </TabPanels>
                  </Tabs>
                )}
              </>
            ) : (
              <Alert status="info" mb={4}>
                <AlertIcon />
                <Box>
                  <AlertTitle>Estado de pago: {order.paymentStatus}</AlertTitle>
                  <AlertDescription>
                    Método de pago: {order.paymentMethod}
                  </AlertDescription>
                </Box>
              </Alert>
            )}
            
            <Flex justify="center" mt={6}>
              <Button as={RouterLink} to="/guest-order" colorScheme="blue" mr={4}>
                Realizar otro pedido
              </Button>
              <Button as={RouterLink} to="/" variant="outline">
                Volver al inicio
              </Button>
            </Flex>
          </Box>
        </CardBody>
      </Card>
    </Container>
  );
};

export default TrackOrder;