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
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Alert,
  AlertIcon,
  Spinner,
  Center,
  useBreakpointValue,
  Divider,
  useToast,
  Badge,
  SimpleGrid
} from '@chakra-ui/react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaHome, FaDownload, FaPrint, FaWhatsapp, FaTruck } from 'react-icons/fa';
import useOrderStore from '../stores/orderStore';

const Receipt = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const toast = useToast();
  const isMobile = useBreakpointValue({ base: true, md: false });

  // Store
  const { getOrderById } = useOrderStore();

  // Estados locales
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrder = async () => {
      try {
        if (id) {
          // Si tenemos ID, buscar en el store
          const orderData = getOrderById(parseInt(id));
          if (orderData) {
            setOrder(orderData);
          } else {
            // Si no está en el store, intentar cargar desde localStorage
            const savedOrderData = localStorage.getItem('guestOrderData');
            if (savedOrderData) {
              const orderData = JSON.parse(savedOrderData);
              setOrder({
                id: id,
                ...orderData,
                status: 'pendiente',
                createdAt: new Date().toISOString()
              });
            }
          }
        } else {
          // Si no hay ID, cargar desde localStorage
          const savedOrderData = localStorage.getItem('guestOrderData');
          if (savedOrderData) {
            const orderData = JSON.parse(savedOrderData);
            setOrder({
              id: 'temp',
              ...orderData,
              status: 'pendiente',
              createdAt: new Date().toISOString()
            });
          }
        }
      } catch (error) {
        console.error('Error al cargar pedido:', error);
        toast({
          title: 'Error',
          description: 'No se pudo cargar el pedido',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [id, getOrderById, toast]);

  const handleDownloadPDF = () => {
    // TODO: Implementar descarga de PDF
    toast({
      title: 'Descarga PDF',
      description: 'Funcionalidad de descarga en desarrollo',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsApp = () => {
    const message = `Hola, tengo una consulta sobre mi pedido #${order?.id}`;
    const whatsappUrl = `https://wa.me/51999888777?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleNewOrder = () => {
    localStorage.removeItem('guestOrderData');
    navigate('/guest-order');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pendiente':
        return 'yellow';
      case 'confirmado':
        return 'blue';
      case 'en_preparacion':
        return 'orange';
      case 'en_camino':
        return 'purple';
      case 'entregado':
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
      case 'confirmado':
        return 'Confirmado';
      case 'en_preparacion':
        return 'En Preparación';
      case 'en_camino':
        return 'En Camino';
      case 'entregado':
        return 'Entregado';
      case 'cancelado':
        return 'Cancelado';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <Center h="400px">
        <Spinner size="xl" />
      </Center>
    );
  }

  if (!order) {
    return (
      <Center h="400px">
        <Alert status="error">
          <AlertIcon />
          No se encontró el pedido
        </Alert>
      </Center>
    );
  }

  return (
    <Box minH="100vh" bg="gray.50" py={8}>
      <Box maxW="800px" mx="auto" px={4}>
        <VStack spacing={8}>
          {/* Header */}
          <Box textAlign="center">
            <Heading size="xl" color="blue.600" mb={2}>
              Recibo de Pedido
            </Heading>
            <Text color="gray.600" fontSize="lg">
              Comprobante de tu pedido de agua
            </Text>
          </Box>

          <Card w="full">
            <CardHeader>
              <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
                <VStack align="start" spacing={1}>
                  <Heading size="md" color="gray.700">
                    Pedido #{order.id}
                  </Heading>
                  <Text fontSize="sm" color="gray.500">
                    {new Date(order.createdAt).toLocaleString()}
                  </Text>
                </VStack>
                <Badge colorScheme={getStatusColor(order.status)} size="lg">
                  {getStatusText(order.status)}
                </Badge>
              </Flex>
            </CardHeader>
            <CardBody>
              <VStack spacing={6}>
                {/* Información del Cliente */}
                <Box w="full" p={4} bg="gray.50" borderRadius="md">
                  <Text fontWeight="bold" mb={3} color="gray.700">
                    <FaHome style={{ display: 'inline', marginRight: '8px' }} />
                    Información del Cliente
                  </Text>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                    <Box>
                      <Text fontSize="sm" color="gray.600">Nombre:</Text>
                      <Text fontWeight="bold">{order.client.name}</Text>
                    </Box>
                    <Box>
                      <Text fontSize="sm" color="gray.600">Teléfono:</Text>
                      <Text fontWeight="bold">{order.client.phone}</Text>
                    </Box>
                    {order.client.email && (
                      <Box>
                        <Text fontSize="sm" color="gray.600">Email:</Text>
                        <Text fontWeight="bold">{order.client.email}</Text>
                      </Box>
                    )}
                    <Box>
                      <Text fontSize="sm" color="gray.600">Distrito:</Text>
                      <Text fontWeight="bold">{order.client.district}</Text>
                    </Box>
                  </SimpleGrid>
                  <Box mt={3}>
                    <Text fontSize="sm" color="gray.600">Dirección:</Text>
                    <Text fontWeight="bold">{order.client.address}</Text>
                  </Box>
                  {order.client.reference && (
                    <Box mt={2}>
                      <Text fontSize="sm" color="gray.600">Referencia:</Text>
                      <Text fontWeight="bold">{order.client.reference}</Text>
                    </Box>
                  )}
                </Box>

                {/* Productos */}
                <Box w="full">
                  <Text fontWeight="bold" mb={3} color="gray.700">
                    <FaTruck style={{ display: 'inline', marginRight: '8px' }} />
                    Productos Solicitados
                  </Text>
                  {isMobile ? (
                    <VStack spacing={3}>
                      {order.items.map((item, index) => (
                        <Card key={index} variant="outline" w="full">
                          <CardBody>
                            <VStack align="start" spacing={2}>
                              <Text fontWeight="bold">{item.name}</Text>
                              <HStack justify="space-between" w="full">
                                <Text fontSize="sm" color="gray.600">
                                  Cantidad: {item.quantity}
                                </Text>
                                <Text fontSize="sm" color="gray.600">
                                  S/ {parseFloat(item.unitPrice).toFixed(2)} c/u
                                </Text>
                              </HStack>
                              <HStack justify="space-between" w="full">
                                <Text fontWeight="bold">Subtotal:</Text>
                                <Text fontWeight="bold" color="blue.600">
                                  S/ {parseFloat(item.subtotal).toFixed(2)}
                                </Text>
                              </HStack>
                            </VStack>
                          </CardBody>
                        </Card>
                      ))}
                    </VStack>
                  ) : (
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th>Producto</Th>
                          <Th isNumeric>Cantidad</Th>
                          <Th isNumeric>Precio Unit.</Th>
                          <Th isNumeric>Subtotal</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {order.items.map((item, index) => (
                          <Tr key={index}>
                            <Td>
                              <VStack align="start" spacing={1}>
                                <Text fontWeight="bold">{item.name}</Text>
                              </VStack>
                            </Td>
                            <Td isNumeric>{item.quantity}</Td>
                            <Td isNumeric>S/ {parseFloat(item.unitPrice).toFixed(2)}</Td>
                            <Td isNumeric fontWeight="bold" color="blue.600">
                              S/ {parseFloat(item.subtotal).toFixed(2)}
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  )}
                </Box>

                {/* Totales */}
                <Box w="full" p={4} border="1px" borderColor="gray.200" borderRadius="md">
                  <VStack spacing={2}>
                    <HStack justify="space-between" w="full">
                      <Text>Subtotal:</Text>
                      <Text fontWeight="bold">S/ {parseFloat(order.subtotal).toFixed(2)}</Text>
                    </HStack>
                    
                    <HStack justify="space-between" w="full">
                      <Text>Flete:</Text>
                      <Text fontWeight="bold">S/ {parseFloat(order.deliveryFee).toFixed(2)}</Text>
                    </HStack>
                    
                    <Divider />
                    
                    <HStack justify="space-between" w="full">
                      <Text fontWeight="bold" fontSize="lg">Total:</Text>
                      <Text fontWeight="bold" fontSize="lg" color="blue.600">
                        S/ {parseFloat(order.total).toFixed(2)}
                      </Text>
                    </HStack>
                  </VStack>
                </Box>

                {/* Información adicional */}
                {order.client.notes && (
                  <Box w="full" p={4} bg="yellow.50" borderRadius="md">
                    <Text fontWeight="bold" mb={2} color="gray.700">
                      Notas Adicionales:
                    </Text>
                    <Text fontSize="sm">{order.client.notes}</Text>
                  </Box>
                )}

                {/* Botones de acción */}
                <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4} w="full">
                  <Button
                    leftIcon={<FaDownload />}
                    colorScheme="blue"
                    variant="outline"
                    onClick={handleDownloadPDF}
                  >
                    Descargar PDF
                  </Button>
                  
                  <Button
                    leftIcon={<FaPrint />}
                    colorScheme="gray"
                    variant="outline"
                    onClick={handlePrint}
                  >
                    Imprimir
                  </Button>
                  
                  <Button
                    leftIcon={<FaWhatsapp />}
                    colorScheme="green"
                    variant="outline"
                    onClick={handleWhatsApp}
                  >
                    WhatsApp
                  </Button>
                  
                  <Button
                    leftIcon={<FaHome />}
                    colorScheme="purple"
                    onClick={handleNewOrder}
                  >
                    Nuevo Pedido
                  </Button>
                </SimpleGrid>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Box>
    </Box>
  );
};

export default Receipt;
