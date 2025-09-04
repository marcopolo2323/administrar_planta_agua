import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  Flex,
  Divider,
  Badge,
  Spinner,
  useColorModeValue,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  HStack,
  VStack,
  useToast,
  Icon,
} from '@chakra-ui/react';
import { ArrowBackIcon, CheckCircleIcon, DownloadIcon } from '@chakra-ui/icons';
import { FaReceipt, FaShoppingBag, FaArrowLeft, FaPrint, FaFileInvoice, FaFileAlt, FaMapMarkerAlt, FaClock } from 'react-icons/fa';

const Receipt = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [documentPath, setDocumentPath] = useState(null);
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    // Obtener el método de pago de la URL
    const queryParams = new URLSearchParams(location.search);
    const method = queryParams.get('method');
    if (method) {
      setPaymentMethod(method);
    }

    const fetchOrder = async () => {
      setIsLoading(true);
      try {
        // Intentar obtener el ID del pedido de la URL o del localStorage
        let orderIdToUse = orderId;
        
        // Si no hay orderId en la URL, intentar obtenerlo del localStorage
        if (!orderIdToUse) {
          const savedOrderId = localStorage.getItem('lastOrderId');
          if (savedOrderId) {
            orderIdToUse = savedOrderId;
            // Actualizar la URL para reflejar el ID correcto sin recargar la página
            window.history.replaceState(null, '', `/receipt/${savedOrderId}${location.search}`);
          } else {
            toast({
              title: 'Error',
              description: 'ID de pedido no válido o no especificado',
              status: 'error',
              duration: 5000,
              isClosable: true,
            });
            setIsLoading(false);
            return;
          }
        }

        const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/guest-orders/track/${orderIdToUse}`);
        setOrder(response.data);
        // Si no hay método de pago en la URL, usar el del pedido
        if (!method && response.data.paymentMethod) {
          setPaymentMethod(response.data.paymentMethod);
        }
        
        // Verificar si hay un documento PDF generado
        if (response.data.payment && response.data.payment.documentPath) {
          setDocumentPath(response.data.payment.documentPath);
        }
      } catch (error) {
        console.error('Error al cargar el pedido:', error);
        toast({
          title: 'Error',
          description: 'No se pudo cargar la información del pedido.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, location.search, toast]);

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  const getPaymentMethodName = (method) => {
    switch(method) {
      case 'yape': return 'Yape';
      case 'tarjeta': return 'Tarjeta';
      case 'efectivo': return 'Efectivo';
      case 'credito': return 'Crédito (30 días)';
      default: return method || 'No especificado';
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleNewOrder = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  if (isLoading) {
    return (
      <Container maxW="container.md" py={8} centerContent>
        <Box 
          p={8} 
          borderRadius="lg" 
          bg={bgColor} 
          boxShadow="lg" 
          w="100%"
          textAlign="center"
        >
          <Flex direction="column" align="center" justify="center" h="50vh">
            <Spinner 
              size="xl" 
              mb={4} 
              color="purple.500" 
              thickness="4px"
              speed="0.65s"
              emptyColor="gray.200"
            />
            <Text fontSize="lg" fontWeight="medium">Cargando información del recibo...</Text>
          </Flex>
        </Box>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container maxW="container.md" py={8}>
        <Box
          borderWidth="1px"
          borderRadius="lg"
          overflow="hidden"
          bg={bgColor}
          p={6}
          boxShadow="lg"
        >
          <Flex direction="column" align="center" textAlign="center">
            <Icon as={FaReceipt} boxSize={12} color="red.500" mb={4} />
            <Heading size="md" mb={3} color="red.500">Pedido no encontrado</Heading>
            <Text mb={5} fontSize="md">No se pudo encontrar información para este pedido.</Text>
            <Button 
              leftIcon={<FaArrowLeft />} 
              onClick={() => navigate('/')} 
              colorScheme="purple" 
              size="md"
              boxShadow="sm"
              _hover={{ transform: 'translateY(-2px)', boxShadow: 'md' }}
            >
              Volver al inicio
            </Button>
          </Flex>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxW="container.md" py={8} className="receipt-container">
      <Flex direction="column" w="full">
        <HStack spacing={4} mb={6} className="no-print">
          <Button
            leftIcon={<FaArrowLeft />}
            variant="outline"
            colorScheme="purple"
            onClick={handleGoBack}
            boxShadow="sm"
            _hover={{ transform: 'translateY(-2px)', boxShadow: 'md' }}
          >
            Volver
          </Button>
          <Button
            leftIcon={<FaPrint />}
            colorScheme="purple"
            onClick={handlePrint}
            boxShadow="sm"
            _hover={{ transform: 'translateY(-2px)', boxShadow: 'md' }}
          >
            Imprimir Recibo
          </Button>
          <Button
            leftIcon={<FaShoppingBag />}
            colorScheme="purple"
            variant="solid"
            onClick={handleNewOrder}
            boxShadow="sm"
            _hover={{ transform: 'translateY(-2px)', boxShadow: 'md' }}
          >
            Nuevo Pedido
          </Button>
          {documentPath && (
            <Button
              leftIcon={<DownloadIcon />}
              colorScheme="purple"
              variant="outline"
              as="a"
              href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/documents/${documentPath.split('\\').pop()}`}
              download
              target="_blank"
              boxShadow="sm"
              _hover={{ transform: 'translateY(-2px)', boxShadow: 'md' }}
            >
              Descargar PDF
            </Button>
          )}
        </HStack>

        <Box
          borderWidth="1px"
          borderRadius="lg"
          overflow="hidden"
          bg={bgColor}
          p={6}
          boxShadow="lg"
          id="receipt-content"
        >
          <Flex 
            justify="space-between" 
            align="center" 
            mb={5}
            bg="purple.50"
            p={4}
            borderRadius="md"
            boxShadow="sm"
          >
            <Heading size="lg" color="purple.700">
              {order.documentType === 'factura' ? 'Factura Electrónica' : 'Boleta de Venta'}
            </Heading>
            <Icon 
              as={order.documentType === 'factura' ? FaFileInvoice : FaFileAlt} 
              boxSize={8} 
              color="purple.500" 
            />
          </Flex>
          <Divider mb={4} />

          <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" mb={6}>
            <Box 
              mb={{ base: 4, md: 0 }}
              p={4}
              borderRadius="md"
              borderWidth="1px"
              borderColor="purple.100"
              bg="white"
              boxShadow="sm"
              width={{ base: '100%', md: '48%' }}
            >
              <HStack spacing={2} mb={2}>
                <Icon as={FaReceipt} color="purple.500" />
                <Text fontWeight="bold" color="purple.700">Información del Pedido</Text>
              </HStack>
              <Divider mb={3} borderColor="purple.100" />
              <VStack align="start" spacing={3}>
                <Box>
                  <Text fontWeight="bold" color="gray.600">Número de Pedido:</Text>
                  <Text fontSize="xl" color="purple.600">{order.id}</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold" color="gray.600">Fecha:</Text>
                  <Text color="gray.700">{formatDate(order.createdAt)}</Text>
                </Box>
              </VStack>
            </Box>
            <Box 
              p={4}
              borderRadius="md"
              borderWidth="1px"
              borderColor="purple.100"
              bg="white"
              boxShadow="sm"
              width={{ base: '100%', md: '48%' }}
            >
              <HStack spacing={2} mb={2}>
                <Icon as={FaShoppingBag} color="purple.500" />
                <Text fontWeight="bold" color="purple.700">Estado del Pedido</Text>
              </HStack>
              <Divider mb={3} borderColor="purple.100" />
              <VStack align="start" spacing={3}>
                <Box>
                  <Text fontWeight="bold" color="gray.600">Estado:</Text>
                  <Badge colorScheme="purple" p={2} borderRadius="md" fontSize="sm">
                    {order.status}
                  </Badge>
                </Box>
                <Box>
                  <Text fontWeight="bold" color="gray.600">Estado del Pago:</Text>
                  <Badge 
                    colorScheme={order.paymentStatus === 'pagado' ? 'green' : order.paymentStatus === 'credito' ? 'yellow' : 'orange'} 
                    p={2} 
                    borderRadius="md" 
                    fontSize="sm"
                  >
                    {order.paymentStatus === 'pagado' ? 'Pagado' : 
                     order.paymentStatus === 'credito' ? 'Crédito (30 días)' : 
                     order.paymentStatus}
                  </Badge>
                </Box>
                <Box>
                  <Text fontWeight="bold" color="gray.600">Método de Pago:</Text>
                  <Text color="gray.700" fontWeight="medium">{getPaymentMethodName(paymentMethod || order.paymentMethod)}</Text>
                </Box>
              </VStack>
            </Box>
          </Flex>

          <Box 
            mb={6} 
            p={4} 
            borderRadius="md" 
            borderWidth="1px" 
            borderColor="purple.100" 
            bg="white" 
            boxShadow="sm"
          >
            <HStack spacing={2} mb={2}>
              <Icon 
                as={order.documentType === 'factura' ? FaFileInvoice : FaFileAlt} 
                color="purple.500" 
              />
              <Heading size="md" color="purple.700">
                {order.documentType === 'factura' ? 'Información de Facturación' : 'Información del Cliente'}
              </Heading>
            </HStack>
            <Divider mb={3} borderColor="purple.100" />
            {order.documentType === 'factura' && order.invoiceData ? (
              <VStack align="start" spacing={2}>
                <HStack>
                  <Text fontWeight="bold" color="gray.600" width="120px">RUC:</Text>
                  <Text color="gray.700">{JSON.parse(order.invoiceData).ruc}</Text>
                </HStack>
                <HStack>
                  <Text fontWeight="bold" color="gray.600" width="120px">Razón Social:</Text>
                  <Text color="gray.700">{JSON.parse(order.invoiceData).businessName}</Text>
                </HStack>
                <HStack>
                  <Text fontWeight="bold" color="gray.600" width="120px">Dirección Fiscal:</Text>
                  <Text color="gray.700">{JSON.parse(order.invoiceData).address}</Text>
                </HStack>
              </VStack>
            ) : (
              <VStack align="start" spacing={2}>
                <HStack>
                  <Text fontWeight="bold" color="gray.600" width="120px">Nombre:</Text>
                  <Text color="gray.700">{order.customerName || (order.guestOrder && order.guestOrder.guestName) || 'No especificado'}</Text>
                </HStack>
                <HStack>
                  <Text fontWeight="bold" color="gray.600" width="120px">Teléfono:</Text>
                  <Text color="gray.700">{order.customerPhone || (order.guestOrder && order.guestOrder.guestPhone) || 'No especificado'}</Text>
                </HStack>
                <HStack>
                  <Text fontWeight="bold" color="gray.600" width="120px">Email:</Text>
                  <Text color="gray.700">{order.customerEmail || (order.guestOrder && order.guestOrder.guestEmail) || 'No especificado'}</Text>
                </HStack>
              </VStack>
            )}
          </Box>

          {order.deliveryAddress && (
            <Box 
              mb={6} 
              p={4} 
              borderRadius="md" 
              borderWidth="1px" 
              borderColor="purple.100" 
              bg="white" 
              boxShadow="sm"
            >
              <HStack spacing={2} mb={2}>
                <Icon as={FaMapMarkerAlt} color="purple.500" />
                <Heading size="md" color="purple.700">Dirección de Entrega</Heading>
              </HStack>
              <Divider mb={3} borderColor="purple.100" />
              <Text color="gray.700">{order.deliveryAddress}</Text>
            </Box>
          )}

          <Box 
            mb={6} 
            p={4} 
            borderRadius="md" 
            borderWidth="1px" 
            borderColor="purple.100" 
            bg="white" 
            boxShadow="sm"
          >
            <HStack spacing={2} mb={2}>
              <Icon as={FaShoppingBag} color="purple.500" />
              <Heading size="md" color="purple.700">Detalle de Productos</Heading>
            </HStack>
            <Divider mb={3} borderColor="purple.100" />
            <Box overflowX="auto">
              <Table variant="simple" size="sm" mt={2} colorScheme="purple">
                <Thead bg="purple.50">
                  <Tr>
                    <Th color="purple.600">Producto</Th>
                    <Th isNumeric color="purple.600">Cantidad</Th>
                    <Th isNumeric color="purple.600">Precio Unit.</Th>
                    <Th isNumeric color="purple.600">Subtotal</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {order.items && order.items.map((item, index) => {
                    // Asegurar que tengamos valores numéricos para precio unitario y subtotal
                    const unitPrice = typeof item.unitPrice === 'number' ? item.unitPrice : 
                                     (typeof item.price === 'number' ? item.price : 0);
                    const quantity = item.quantity || 1;
                    const subtotal = typeof item.subtotal === 'number' ? item.subtotal : 
                                     (unitPrice * quantity);
                    
                    return (
                      <Tr key={index} _hover={{ bg: 'purple.50' }}>
                        <Td fontWeight="medium">{item.product?.name || item.productName || 'Producto'}</Td>
                        <Td isNumeric>{quantity}</Td>
                        <Td isNumeric>S/ {unitPrice.toFixed(2)}</Td>
                        <Td isNumeric fontWeight="bold">S/ {subtotal.toFixed(2)}</Td>
                      </Tr>
                    );
                  })}
                  {!order.items && order.orderDetails && order.orderDetails.map((detail, index) => {
                    // Asegurar que tengamos valores numéricos para precio unitario y subtotal
                    const unitPrice = typeof detail.unitPrice === 'number' ? detail.unitPrice : 
                                     (typeof detail.price === 'number' ? detail.price : 0);
                    const quantity = detail.quantity || 1;
                    const subtotal = typeof detail.subtotal === 'number' ? detail.subtotal : 
                                     (unitPrice * quantity);
                    
                    return (
                      <Tr key={index} _hover={{ bg: 'purple.50' }}>
                        <Td fontWeight="medium">{detail.product?.name || 'Producto'}</Td>
                        <Td isNumeric>{quantity}</Td>
                        <Td isNumeric>S/ {unitPrice.toFixed(2)}</Td>
                        <Td isNumeric fontWeight="bold">S/ {subtotal.toFixed(2)}</Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            </Box>
          </Box>

          {/* Información de Crédito */}
          {order.paymentStatus === 'credito' && (
            <Box 
              mb={6} 
              p={4} 
              borderRadius="md" 
              borderWidth="1px" 
              borderColor="yellow.200" 
              bg="yellow.50" 
              boxShadow="sm"
            >
              <HStack spacing={2} mb={2}>
                <Icon as={FaClock} color="yellow.600" />
                <Heading size="md" color="yellow.700">Información de Crédito</Heading>
              </HStack>
              <Divider mb={3} borderColor="yellow.200" />
              <VStack align="start" spacing={2}>
                <HStack>
                  <Text fontWeight="bold" color="gray.600" width="180px">Fecha de Emisión:</Text>
                  <Text color="gray.700">{formatDate(order.createdAt)}</Text>
                </HStack>
                <HStack>
                  <Text fontWeight="bold" color="gray.600" width="180px">Fecha de Vencimiento:</Text>
                  <Text color="gray.700">{formatDate(new Date(new Date(order.createdAt).getTime() + 30 * 24 * 60 * 60 * 1000))}</Text>
                </HStack>
                <HStack>
                  <Text fontWeight="bold" color="gray.600" width="180px">Monto Total a Pagar:</Text>
                  <Text fontWeight="bold" color="yellow.700">S/ {typeof order.total === 'number' ? order.total.toFixed(2) : order.total}</Text>
                </HStack>
              </VStack>
            </Box>
          )}

          <Box 
            mb={4} 
            p={4} 
            borderRadius="md" 
            borderWidth="1px" 
            borderColor="purple.100" 
            bg="purple.50" 
            boxShadow="sm"
            alignSelf="flex-end"
            width={{ base: '100%', md: '300px' }}
          >
            <HStack spacing={2} mb={3}>
              <Icon as={FaReceipt} color="purple.500" />
              <Text fontWeight="bold" color="purple.700">Resumen de Pago</Text>
            </HStack>
            <Divider mb={3} borderColor="purple.200" />
            <VStack spacing={3} align="stretch">
              <Flex justify="space-between">
                <Text color="gray.600">Subtotal:</Text>
                <Text fontWeight="medium">
                  S/ {(() => {
                    // Calcular subtotal
                    if (typeof order.subtotal === 'number') {
                      return order.subtotal.toFixed(2);
                    } else if (order.subtotal) {
                      return parseFloat(order.subtotal).toFixed(2);
                    } else if (typeof order.total === 'number') {
                      return (order.total / 1.18).toFixed(2);
                    } else if (order.total) {
                      return (parseFloat(order.total) / 1.18).toFixed(2);
                    } else {
                      // Calcular desde los items si no hay subtotal ni total
                      let calculatedSubtotal = 0;
                      if (order.items && order.items.length > 0) {
                        calculatedSubtotal = order.items.reduce((sum, item) => {
                          const itemSubtotal = typeof item.subtotal === 'number' ? item.subtotal : 
                                             ((typeof item.unitPrice === 'number' ? item.unitPrice : 
                                               (typeof item.price === 'number' ? item.price : 0)) * (item.quantity || 1));
                          return sum + itemSubtotal;
                        }, 0);
                      } else if (order.orderDetails && order.orderDetails.length > 0) {
                        calculatedSubtotal = order.orderDetails.reduce((sum, detail) => {
                          const detailSubtotal = typeof detail.subtotal === 'number' ? detail.subtotal : 
                                               ((typeof detail.unitPrice === 'number' ? detail.unitPrice : 
                                                 (typeof detail.price === 'number' ? detail.price : 0)) * (detail.quantity || 1));
                          return sum + detailSubtotal;
                        }, 0);
                      }
                      return (calculatedSubtotal / 1.18).toFixed(2);
                    }
                  })()}
                </Text>
              </Flex>
              {/* IGV eliminado. Solo se muestra el flete/costo de envío */}
              {order.deliveryFee > 0 && (
                <Flex justify="space-between">
                  <Text color="gray.600">Costo de envío:</Text>
                  <Text fontWeight="medium">
                    S/ {typeof order.deliveryFee === 'number' ? order.deliveryFee.toFixed(2) : parseFloat(order.deliveryFee || 0).toFixed(2)}
                  </Text>
                </Flex>
              )}
              <Flex justify="space-between" fontWeight="bold" fontSize="lg" mt={2} pt={2} borderTopWidth="1px" borderColor="purple.200">
                <Text color="purple.700">Total:</Text>
                <Text color="purple.700">
                  S/ {(() => {
                    // Calcular total
                    if (typeof order.total === 'number') {
                      return order.total.toFixed(2);
                    } else if (order.total) {
                      return parseFloat(order.total).toFixed(2);
                    } else {
                      // Calcular desde los items si no hay total
                      let calculatedTotal = 0;
                      if (order.items && order.items.length > 0) {
                        calculatedTotal = order.items.reduce((sum, item) => {
                          const itemSubtotal = typeof item.subtotal === 'number' ? item.subtotal : 
                                             ((typeof item.unitPrice === 'number' ? item.unitPrice : 
                                               (typeof item.price === 'number' ? item.price : 0)) * (item.quantity || 1));
                          return sum + itemSubtotal;
                        }, 0);
                      } else if (order.orderDetails && order.orderDetails.length > 0) {
                        calculatedTotal = order.orderDetails.reduce((sum, detail) => {
                          const detailSubtotal = typeof detail.subtotal === 'number' ? detail.subtotal : 
                                               ((typeof detail.unitPrice === 'number' ? detail.unitPrice : 
                                                 (typeof detail.price === 'number' ? detail.price : 0)) * (detail.quantity || 1));
                          return sum + detailSubtotal;
                        }, 0);
                      }
                      return calculatedTotal.toFixed(2);
                    }
                  })()}
                </Text>
              </Flex>
            </VStack>
          </Box>

          <Box 
            mt={6} 
            p={6} 
            borderWidth="2px" 
            borderRadius="lg" 
            borderStyle="dashed" 
            borderColor="purple.200"
            bg="purple.50"
            boxShadow="sm"
          >
            <Flex direction="column" align="center" textAlign="center">
              <Icon as={CheckCircleIcon} color="purple.500" boxSize={10} mb={3} />
              <Text fontWeight="bold" fontSize="xl" color="purple.700" mb={2}>¡Gracias por su compra!</Text>
              <Text fontSize="md" color="gray.700">Este recibo sirve como comprobante de pago.</Text>
              <Text fontSize="sm" mt={3} color="gray.600" fontStyle="italic">
                Para cualquier consulta, contáctenos al número de atención al cliente.
              </Text>
            </Flex>
          </Box>
        </Box>
      </Flex>

      <style jsx="true" global="true">{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            padding: 0;
            margin: 0;
          }
          .receipt-container {
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          #receipt-content {
            border: none !important;
            box-shadow: none !important;
            padding: 1cm !important;
          }
        }
      `}</style>
    </Container>
  );
};

export default Receipt;