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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  RadioGroup,
  Stack,
  Radio,
  Divider,
  Alert,
  AlertIcon,
  Input,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Icon,
  Flex
} from '@chakra-ui/react';
import {
  FaCreditCard,
  FaMoneyBillWave,
  FaMobile,
  FaFileInvoice,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaDownload,
  FaEye
} from 'react-icons/fa';
import axios from '../utils/axios';
import useAuthStore from '../stores/authStore';
import { generateInvoice, generateInvoiceNumber } from '../utils/invoiceGenerator';

const ClientPayments = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const { user } = useAuthStore();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();

  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    try {
      const response = await axios.get('/api/vouchers/client');
      if (response.data.success) {
        setVouchers(response.data.data || []);
      }
    } catch (error) {
      console.error('Error al cargar vales:', error);
    } finally {
      setLoading(false);
    }
  };

  const pendingVouchers = vouchers.filter(v => v.status === 'pending');
  const totalPending = pendingVouchers.reduce((sum, v) => sum + parseFloat(v.totalAmount || 0), 0);

  // Detectar si estamos cerca del fin de mes
  const today = new Date();
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const daysUntilEndOfMonth = lastDayOfMonth - today.getDate();
  const isEndOfMonth = daysUntilEndOfMonth <= 5;

  const handleViewVoucher = (voucher) => {
    setSelectedVoucher(voucher);
    onViewOpen();
  };

  const handlePayment = async () => {
    if (pendingVouchers.length === 0) {
      toast({
        title: 'No hay vales pendientes',
        description: 'No tienes vales pendientes para pagar',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsProcessing(true);
    try {
      // Simular procesamiento de pago
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Actualizar TODOS los vales pendientes como pagados
      await Promise.all(
        pendingVouchers.map(voucher =>
          axios.put(`/api/vouchers/${voucher.id}/status`, { status: 'paid' })
        )
      );

      // Generar boleta/factura
      const invoiceData = {
        vouchers: pendingVouchers,
        total: totalPending,
        paymentMethod,
        clientId: user.id,
        clientName: user.username,
        clientEmail: user.email,
        invoiceNumber: generateInvoiceNumber(),
        date: new Date().toLocaleDateString('es-PE')
      };

      // Generar y descargar boleta
      await generateInvoice(invoiceData);

      toast({
        title: 'Pago procesado exitosamente',
        description: `Se procesaron TODOS los vales pendientes (${pendingVouchers.length} vales) por S/ ${totalPending.toFixed(2)}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Actualizar datos
      fetchVouchers();
      onClose();

    } catch (error) {
      console.error('Error al procesar pago:', error);
      toast({
        title: 'Error en el pago',
        description: 'No se pudo procesar el pago. Intenta nuevamente.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'orange';
      case 'delivered': return 'blue';
      case 'paid': return 'green';
      default: return 'gray';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'delivered': return 'Entregado';
      case 'paid': return 'Pagado';
      default: return 'Desconocido';
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
            <Icon as={FaCreditCard} mr={2} />
            Mis Pagos y Vales
          </Heading>
          <Text color="gray.600">
            Gestiona tus vales y realiza pagos de forma segura
          </Text>
        </Box>

        {/* Resumen de vales */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
          <Card>
            <CardBody>
              <VStack spacing={2}>
                <Icon as={FaClock} boxSize={8} color="orange.500" />
                <Text fontWeight="bold" fontSize="2xl">
                  {pendingVouchers.length}
                </Text>
                <Text color="gray.600" fontSize="sm">
                  Vales Pendientes
                </Text>
              </VStack>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <VStack spacing={2}>
                <Icon as={FaMoneyBillWave} boxSize={8} color="blue.500" />
                <Text fontWeight="bold" fontSize="2xl" color="blue.600">
                  S/ {totalPending.toFixed(2)}
                </Text>
                <Text color="gray.600" fontSize="sm">
                  Total a Pagar
                </Text>
              </VStack>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <VStack spacing={2}>
                <Icon as={FaCheckCircle} boxSize={8} color="green.500" />
                <Text fontWeight="bold" fontSize="2xl" color="green.600">
                  {vouchers.filter(v => v.status === 'paid').length}
                </Text>
                <Text color="gray.600" fontSize="sm">
                  Vales Pagados
                </Text>
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Alerta de fin de mes */}
        {pendingVouchers.length > 0 && (
          <Alert status={isEndOfMonth ? "error" : "warning"}>
            <AlertIcon />
            <Box>
              <Text fontWeight="bold">
                {isEndOfMonth 
                  ? `¡ES FIN DE MES! Debes pagar TODOS los vales pendientes: ${pendingVouchers.length} vales por S/ ${totalPending.toFixed(2)}`
                  : `Tienes ${pendingVouchers.length} vales pendientes por S/ ${totalPending.toFixed(2)}`
                }
              </Text>
              <Text fontSize="sm">
                {isEndOfMonth 
                  ? "Es OBLIGATORIO pagar todos los vales ahora. No puedes elegir cuáles pagar."
                  : "Recuerda que todos los vales deben pagarse a fin de mes."
                }
              </Text>
            </Box>
          </Alert>
        )}

        {/* Lista de vales */}
        <Card>
          <CardHeader>
            <HStack justify="space-between">
              <Heading size="md">Mis Vales</Heading>
              {pendingVouchers.length > 0 && (
                <Button
                  colorScheme={isEndOfMonth ? "red" : "blue"}
                  leftIcon={<FaCreditCard />}
                  onClick={onOpen}
                  size="lg"
                >
                  {isEndOfMonth 
                    ? `PAGAR TODOS LOS VALES (${pendingVouchers.length}) - S/ ${totalPending.toFixed(2)}`
                    : `Pagar Todos los Vales (${pendingVouchers.length}) - S/ ${totalPending.toFixed(2)}`
                  }
                </Button>
              )}
            </HStack>
          </CardHeader>
          <CardBody>
            {vouchers.length === 0 ? (
              <Center py={10}>
                <Text color="gray.500">No tienes vales registrados</Text>
              </Center>
            ) : (
              <TableContainer>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Vale #</Th>
                      <Th>Pedido</Th>
                      <Th>Descripción</Th>
                      <Th>Monto</Th>
                      <Th>Estado</Th>
                      <Th>Fecha</Th>
                      <Th>Acciones</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {vouchers.map((voucher) => (
                      <Tr key={voucher.id}>
                        <Td fontWeight="bold">#{voucher.id}</Td>
                        <Td>
                          <Text fontWeight="bold" color="blue.600">
                            #{voucher.orderId || 'N/A'}
                          </Text>
                        </Td>
                        <Td>
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="bold">
                              {voucher.product?.name || 'Pedido Completo'}
                            </Text>
                            <Text fontSize="sm" color="gray.600">
                              {voucher.notes || 'Vale por pedido completo'}
                            </Text>
                          </VStack>
                        </Td>
                        <Td fontWeight="bold" color="blue.600">
                          S/ {parseFloat(voucher.totalAmount || 0).toFixed(2)}
                        </Td>
                        <Td>
                          <Badge colorScheme={getStatusColor(voucher.status)}>
                            {getStatusText(voucher.status)}
                          </Badge>
                        </Td>
                        <Td>{new Date(voucher.createdAt).toLocaleDateString()}</Td>
                        <Td>
                          <HStack spacing={2}>
                            {voucher.status === 'paid' && (
                              <Button size="sm" leftIcon={<FaFileInvoice />}>
                                Boleta
                              </Button>
                            )}
                            <Button 
                              size="sm" 
                              leftIcon={<FaEye />}
                              onClick={() => handleViewVoucher(voucher)}
                            >
                              Ver
                            </Button>
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            )}
          </CardBody>
        </Card>

        {/* Modal de pago */}
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Procesar Pago</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <VStack spacing={4} align="stretch">
                {/* Resumen de TODOS los vales pendientes */}
                <Box p={4} bg={isEndOfMonth ? "red.50" : "gray.50"} borderRadius="md" borderColor={isEndOfMonth ? "red.200" : "gray.200"}>
                  <Text fontWeight="bold" mb={2} color={isEndOfMonth ? "red.600" : "gray.600"}>
                    {isEndOfMonth 
                      ? `¡ES FIN DE MES! Se pagarán TODOS los vales pendientes (${pendingVouchers.length}):`
                      : `Se pagarán todos los vales pendientes (${pendingVouchers.length}):`
                    }
                  </Text>
                  {pendingVouchers.map(voucher => (
                    <HStack key={voucher.id} justify="space-between">
                      <VStack align="start" spacing={0}>
                        <Text fontSize="sm" fontWeight="bold">
                          Vale #{voucher.id} - Pedido #{voucher.orderId || 'N/A'}
                        </Text>
                        <Text fontSize="xs" color="gray.600">
                          {voucher.notes || 'Pedido completo'}
                        </Text>
                      </VStack>
                      <Text fontSize="sm" fontWeight="bold">
                        S/ {parseFloat(voucher.totalAmount || 0).toFixed(2)}
                      </Text>
                    </HStack>
                  ))}
                  <Divider my={2} />
                  <HStack justify="space-between" fontWeight="bold">
                    <Text color={isEndOfMonth ? "red.600" : "gray.600"}>Total a pagar:</Text>
                    <Text color={isEndOfMonth ? "red.600" : "blue.600"} fontSize="lg">
                      S/ {totalPending.toFixed(2)}
                    </Text>
                  </HStack>
                </Box>

                {/* Método de pago */}
                <Box>
                  <Text fontWeight="bold" mb={3}>
                    Selecciona método de pago:
                  </Text>
                  <RadioGroup value={paymentMethod} onChange={setPaymentMethod}>
                    <Stack spacing={3}>
                      <Radio value="card">
                        <HStack>
                          <Icon as={FaCreditCard} />
                          <Text>Tarjeta de Crédito/Débito</Text>
                        </HStack>
                      </Radio>
                      <Radio value="yape">
                        <HStack>
                          <Icon as={FaMobile} />
                          <Text>Yape</Text>
                        </HStack>
                      </Radio>
                      <Radio value="cash">
                        <HStack>
                          <Icon as={FaMoneyBillWave} />
                          <Text>Efectivo (con repartidor)</Text>
                        </HStack>
                      </Radio>
                    </Stack>
                  </RadioGroup>
                </Box>

                {/* Información de pago según método seleccionado */}
                {paymentMethod === 'yape' && (
                  <Box p={4} bg="green.50" borderRadius="md" border="1px" borderColor="green.200">
                    <VStack spacing={3}>
                      <HStack>
                        <Icon as={FaMobile} color="green.500" />
                        <Text fontWeight="bold" color="green.700">Pago con Yape</Text>
                      </HStack>
                      <Box textAlign="center">
                        <Box 
                          p={4} 
                          bg="white" 
                          borderRadius="md" 
                          border="2px dashed" 
                          borderColor="green.300"
                          mb={3}
                        >
                          <Text fontSize="sm" color="gray.600" mb={2}>
                            [QR CODE DE YAPE]
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            Escanea con tu app Yape
                          </Text>
                        </Box>
                        <VStack spacing={1}>
                          <Text fontSize="sm" fontWeight="bold">
                            Número: +51 999 888 777
                          </Text>
                          <Text fontSize="sm">
                            Nombre: Planta de Agua
                          </Text>
                          <Text fontSize="sm" fontWeight="bold" color="green.600">
                            Monto: S/ {totalPending.toFixed(2)}
                          </Text>
                        </VStack>
                      </Box>
                      <Alert status="info" size="sm">
                        <AlertIcon />
                        <Text fontSize="sm">
                          Después de pagar, envía el comprobante por WhatsApp al +51 999 888 777
                        </Text>
                      </Alert>
                    </VStack>
                  </Box>
                )}

                {paymentMethod === 'card' && (
                  <Box p={4} bg="blue.50" borderRadius="md" border="1px" borderColor="blue.200">
                    <VStack spacing={3}>
                      <HStack>
                        <Icon as={FaCreditCard} color="blue.500" />
                        <Text fontWeight="bold" color="blue.700">Pago con Tarjeta</Text>
                      </HStack>
                      <VStack spacing={2} align="stretch">
                        <Box>
                          <Text fontSize="sm" fontWeight="bold" mb={1}>Número de Tarjeta:</Text>
                          <Input placeholder="1234 5678 9012 3456" />
                        </Box>
                        <HStack spacing={2}>
                          <Box flex={1}>
                            <Text fontSize="sm" fontWeight="bold" mb={1}>Vencimiento:</Text>
                            <Input placeholder="MM/AA" />
                          </Box>
                          <Box flex={1}>
                            <Text fontSize="sm" fontWeight="bold" mb={1}>CVV:</Text>
                            <Input placeholder="123" />
                          </Box>
                        </HStack>
                        <Box>
                          <Text fontSize="sm" fontWeight="bold" mb={1}>Nombre en la Tarjeta:</Text>
                          <Input placeholder="Juan Pérez" />
                        </Box>
                      </VStack>
                    </VStack>
                  </Box>
                )}

                {paymentMethod === 'cash' && (
                  <Box p={4} bg="orange.50" borderRadius="md" border="1px" borderColor="orange.200">
                    <VStack spacing={3}>
                      <HStack>
                        <Icon as={FaMoneyBillWave} color="orange.500" />
                        <Text fontWeight="bold" color="orange.700">Pago en Efectivo</Text>
                      </HStack>
                      <Alert status="warning" size="sm">
                        <AlertIcon />
                        <Text fontSize="sm">
                          Coordina el pago en efectivo con tu repartidor al momento de la entrega.
                          Monto a pagar: S/ {totalPending.toFixed(2)}
                        </Text>
                      </Alert>
                    </VStack>
                  </Box>
                )}

                {/* Botones de acción */}
                <HStack spacing={3} justify="flex-end">
                  <Button onClick={onClose} variant="outline">
                    Cancelar
                  </Button>
                  <Button
                    colorScheme={isEndOfMonth ? "red" : "blue"}
                    onClick={handlePayment}
                    isLoading={isProcessing}
                    loadingText="Procesando..."
                    leftIcon={<FaCreditCard />}
                    size="lg"
                  >
                    {isEndOfMonth 
                      ? `PAGAR TODOS LOS VALES - S/ ${totalPending.toFixed(2)}`
                      : `Pagar Todos los Vales - S/ ${totalPending.toFixed(2)}`
                    }
                  </Button>
                </HStack>
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>

        {/* Modal de detalles del vale */}
        <Modal isOpen={isViewOpen} onClose={onViewClose} size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Detalles del Vale #{selectedVoucher?.id}</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              {selectedVoucher && (
                <VStack spacing={4} align="stretch">
                  <SimpleGrid columns={2} spacing={4}>
                    <Box>
                      <Text fontWeight="bold" color="gray.600">Vale #:</Text>
                      <Text fontWeight="bold" color="blue.600">#{selectedVoucher.id}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="bold" color="gray.600">Pedido #:</Text>
                      <Text fontWeight="bold" color="green.600">#{selectedVoucher.orderId || 'N/A'}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="bold" color="gray.600">Estado:</Text>
                      <Badge colorScheme={getStatusColor(selectedVoucher.status)}>
                        {getStatusText(selectedVoucher.status)}
                      </Badge>
                    </Box>
                    <Box>
                      <Text fontWeight="bold" color="gray.600">Fecha:</Text>
                      <Text>{new Date(selectedVoucher.createdAt).toLocaleDateString('es-ES')}</Text>
                    </Box>
                  </SimpleGrid>
                  
                  <Box>
                    <Text fontWeight="bold" color="gray.600">Descripción:</Text>
                    <Text>{selectedVoucher.notes || 'Vale por pedido completo'}</Text>
                  </Box>

                  <Box>
                    <Text fontWeight="bold" color="gray.600">Monto Total:</Text>
                    <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                      S/ {parseFloat(selectedVoucher.totalAmount || 0).toFixed(2)}
                    </Text>
                  </Box>

                  {selectedVoucher.deliveryPerson && (
                    <Box>
                      <Text fontWeight="bold" color="gray.600">Repartidor:</Text>
                      <Text>{selectedVoucher.deliveryPerson.username}</Text>
                    </Box>
                  )}

                  {selectedVoucher.paidAt && (
                    <Box>
                      <Text fontWeight="bold" color="gray.600">Fecha de Pago:</Text>
                      <Text>{new Date(selectedVoucher.paidAt).toLocaleDateString('es-ES')}</Text>
                    </Box>
                  )}
                </VStack>
              )}
            </ModalBody>
          </ModalContent>
        </Modal>
      </VStack>
    </Box>
  );
};

export default ClientPayments;
