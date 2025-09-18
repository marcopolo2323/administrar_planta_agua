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
  SimpleGrid,
  Select,
  FormControl,
  FormLabel
} from '@chakra-ui/react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaHome, FaDownload, FaPrint, FaWhatsapp, FaTruck } from 'react-icons/fa';
import axios from '../utils/axios';

const Receipt = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const toast = useToast();
  const isMobile = useBreakpointValue({ base: true, md: false });

  // No necesitamos store, usamos API directa

  // Estados locales
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [documentType, setDocumentType] = useState('boleta');

  useEffect(() => {
    const loadOrder = async () => {
      try {
        if (id) {
          // Si tenemos ID, intentar cargar desde el servidor usando token
          try {
            // Usar la ruta segura por token
            const response = await axios.get(`/api/guest-orders/token/${id}`);
            if (response.data.success) {
              const orderData = response.data.data;
              // Transformar los datos para que coincidan con el formato esperado
              setOrder({
                id: orderData.id,
                client: {
                  name: orderData.customerName,
                  phone: orderData.customerPhone,
                  email: orderData.customerEmail,
                  address: orderData.deliveryAddress,
                  district: orderData.deliveryDistrict,
                  reference: orderData.deliveryNotes,
                  notes: orderData.deliveryNotes
                },
                items: orderData.products?.map(product => ({
                  name: product.product?.name || 'Producto',
                  quantity: product.quantity,
                  unitPrice: product.price,
                  subtotal: product.subtotal
                })) || [],
                paymentMethod: orderData.paymentMethod,
                paymentType: orderData.paymentType,
                subtotal: orderData.totalAmount - orderData.deliveryFee,
                deliveryFee: orderData.deliveryFee,
                total: orderData.totalAmount,
                status: orderData.status === 'pending' ? 'pendiente' : orderData.status,
                createdAt: orderData.createdAt
              });
              return;
            }
          } catch (serverError) {
            console.log('No se pudo cargar desde el servidor, intentando localStorage');
          }
          
          // Si no se pudo cargar desde el servidor, intentar desde localStorage
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
  }, [id, toast]);

  const handleDownloadPDF = async () => {
    if (!order) return;
    
    try {
      toast({
        title: 'Generando PDF',
        description: 'Preparando el documento...',
        status: 'info',
        duration: 2000,
        isClosable: true,
      });

      // Preparar datos para el backend
      console.log('Datos del order original:', order);
      console.log('Items del order:', order.items);
      console.log('Payment method del order:', order.paymentMethod);
      
      // Verificar si hay productos duplicados
      const productCounts = {};
      order.items.forEach((item, index) => {
        const key = `${item.name}-${item.unitPrice}`;
        productCounts[key] = (productCounts[key] || 0) + 1;
        console.log(`🔍 Item ${index}:`, {
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: item.subtotal,
          key: key
        });
      });
      console.log('Conteo de productos:', productCounts);
      
      // Verificar duplicados
      const duplicates = Object.entries(productCounts).filter(([key, count]) => count > 1);
      if (duplicates.length > 0) {
        console.warn('⚠️ Productos duplicados detectados:', duplicates);
      }
      
      const orderData = {
        id: order.id,
        customerName: order.client.name,
        customerPhone: order.client.phone,
        customerEmail: order.client.email || null,
        deliveryAddress: order.client.address,
        deliveryDistrict: order.client.district,
        deliveryNotes: order.client.reference || null,
        paymentMethod: order.paymentMethod || 'contraentrega',
        paymentType: order.paymentType || 'cash',
        // Usar solo orderDetails para evitar duplicados
        orderDetails: order.items.map(item => {
          console.log('Mapeando item para orderDetails:', item);
          return {
            product: { name: item.name },
            productName: item.name,
            quantity: parseInt(item.quantity),
            unitPrice: parseFloat(item.unitPrice),
            subtotal: parseFloat(item.subtotal)
          };
        }),
        // No enviar items para evitar duplicados
        items: [],
        subtotal: parseFloat(order.subtotal),
        deliveryFee: parseFloat(order.deliveryFee),
        total: parseFloat(order.total),
        status: order.status,
        createdAt: order.createdAt
      };
      
      console.log('Datos finales enviados al backend:', orderData);

      // Log de depuración
      console.log('Datos del pedido que se envían al backend:', {
        order: order,
        orderData: orderData,
        items: order.items,
        subtotal: order.subtotal,
        deliveryFee: order.deliveryFee,
        total: order.total
      });

      // Llamar al endpoint del backend para generar el PDF
      console.log('Llamando al endpoint del backend para generar PDF...');
      console.log('URL:', '/api/guest-payments/generate-pdf');
      console.log('Datos enviados:', { orderData, documentType: 'boleta' });
      
      const response = await axios.post('/api/guest-payments/generate-pdf', {
        orderData: orderData,
        documentType: documentType
      }, {
        responseType: 'blob'
      });
      
      console.log('Respuesta del backend:', {
        status: response.status,
        headers: response.headers,
        dataType: typeof response.data,
        dataLength: response.data.length
      });

      // Crear un blob y descargar el PDF
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${documentType}_${order.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: 'PDF Generado',
        description: 'El documento se ha descargado exitosamente',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error al generar PDF:', error);
      toast({
        title: 'Error',
        description: 'Error al generar el PDF',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsApp = () => {
    const message = `Hola, tengo una consulta sobre mi pedido #${order?.id}`;
    const whatsappUrl = `https://wa.me/51961606183?text=${encodeURIComponent(message)}`;
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

                {/* Selector de tipo de documento */}
                <Box w="full" maxW="300px">
                  <FormControl>
                    <FormLabel>Tipo de Documento</FormLabel>
                    <Select
                      value={documentType}
                      onChange={(e) => setDocumentType(e.target.value)}
                    >
                      <option value="boleta">Boleta</option>
                      <option value="factura">Factura</option>
                    </Select>
                  </FormControl>
                </Box>

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
