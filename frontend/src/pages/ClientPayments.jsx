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
  Flex,
  FormControl,
  FormLabel
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
import plinQR from '../assets/images/plin_qr.jpeg';

const ClientPayments = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('cash');
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
      // Obtener resumen mensual en lugar de vales individuales
      const response = await axios.get('/api/monthly-payments/client/summary');
      if (response.data.success) {
        setVouchers(response.data.data.vouchers || []);
      }
    } catch (error) {
      console.error('Error al cargar vales:', error);
    } finally {
      setLoading(false);
    }
  };

  const pendingVouchers = vouchers.filter(v => v.status === 'pending');
  const subtotalPending = pendingVouchers.reduce((sum, v) => sum + parseFloat(v.totalAmount || 0), 0);
  const deliveryFee = summary?.deliveryFee || 1.00; // Flete del distrito del cliente
  const totalPending = subtotalPending + deliveryFee;

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
        description: 'No tienes vales pendientes para pagar este mes',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsProcessing(true);
    try {
      // Procesar pago mensual completo
      const response = await axios.post('/api/monthly-payments/client/pay-monthly', {
        paymentMethod,
        paymentReference: `PAGO_MENSUAL_${new Date().getFullYear()}_${new Date().getMonth() + 1}`,
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
      });

      if (response.data.success) {
        const { subtotal, deliveryFee, totalAmount, vouchersPaid } = response.data.data;

        toast({
          title: 'Pago mensual procesado exitosamente',
          description: `Se procesaron ${vouchersPaid} vales por S/ ${totalAmount.toFixed(2)} (Subtotal: S/ ${subtotal.toFixed(2)} + Flete: S/ ${deliveryFee.toFixed(2)})`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });

        // Actualizar datos
        fetchVouchers();
        onClose();
      }

    } catch (error) {
      console.error('Error al procesar pago mensual:', error);
      toast({
        title: 'Error en el pago',
        description: error.response?.data?.message || 'No se pudo procesar el pago mensual. Intenta nuevamente.',
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
                <Text color="gray.500" fontSize="xs">
                  Subtotal: S/ {subtotalPending.toFixed(2)} + Flete: S/ {deliveryFee.toFixed(2)}
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

        {/* Tabla de vales */}
        {vouchers.length > 0 ? (
          <Card>
            <CardHeader>
              <Heading size="md">Lista de Vales</Heading>
            </CardHeader>
            <CardBody>
              <TableContainer>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Fecha</Th>
                      <Th>Producto</Th>
                      <Th>Cantidad</Th>
                      <Th>Precio Unit.</Th>
                      <Th>Subtotal</Th>
                      <Th>Flete</Th>
                      <Th>Total</Th>
                      <Th>Estado</Th>
                      <Th>Acciones</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {vouchers.map((voucher) => (
                      <Tr key={voucher.id}>
                        <Td>
                          {new Date(voucher.createdAt).toLocaleDateString('es-PE')}
                        </Td>
                        <Td>
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="bold">
                              {voucher.product || 'Producto no disponible'}
                            </Text>
                            <Text fontSize="sm" color="gray.600">
                              {voucher.description || ''}
                            </Text>
                          </VStack>
                        </Td>
                        <Td>{voucher.quantity}</Td>
                        <Td>S/ {parseFloat(voucher.unitPrice || 0).toFixed(2)}</Td>
                        <Td fontWeight="bold">
                          S/ {parseFloat(voucher.totalAmount || 0).toFixed(2)}
                        </Td>
                        <Td color="blue.600" fontWeight="bold">
                          S/ {deliveryFee.toFixed(2)}
                        </Td>
                        <Td fontWeight="bold" color="green.600">
                          S/ {(parseFloat(voucher.totalAmount || 0) + deliveryFee).toFixed(2)}
                        </Td>
                        <Td>
                          <Badge colorScheme={getStatusColor(voucher.status)}>
                            {getStatusText(voucher.status)}
                          </Badge>
                        </Td>
                        <Td>
                          <HStack spacing={2}>
                            <Button
                              size="sm"
                              variant="outline"
                              leftIcon={<FaEye />}
                              onClick={() => handleViewVoucher(voucher)}
                            >
                              Ver
                            </Button>
                            {voucher.status === 'pending' && (
                              <Button
                                size="sm"
                                colorScheme="blue"
                                onClick={() => {
                                  setSelectedVoucher(voucher);
                                  onOpen();
                                }}
                              >
                                Pagar
                              </Button>
                            )}
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            </CardBody>
          </Card>
        ) : (
          <Card>
            <CardBody textAlign="center" py={12}>
              <VStack spacing={4}>
                <Icon as={FaFileInvoice} boxSize={16} color="gray.400" />
                <VStack spacing={2}>
                  <Heading size="md" color="gray.600">
                    No tienes vales
                  </Heading>
                  <Text color="gray.500">
                    Los vales aparecerán aquí cuando hagas pedidos a crédito
                  </Text>
                </VStack>
              </VStack>
            </CardBody>
          </Card>
        )}

        {/* Botón de pago masivo */}
        {pendingVouchers.length > 0 && (
          <Card>
            <CardBody>
              <VStack spacing={4}>
                <Heading size="md" color="blue.600">
                  Pago Mensual
                </Heading>
                <Text color="gray.600">
                  Paga todos los vales del mes de una vez (incluye flete según tu distrito)
                </Text>
                <Button
                  colorScheme="blue"
                  size="lg"
                  onClick={onOpen}
                  leftIcon={<FaMoneyBillWave />}
                  isDisabled={isProcessing}
                >
                  {isProcessing ? 'Procesando...' : `Pagar Mes Completo (${pendingVouchers.length} vales - S/ ${totalPending.toFixed(2)})`}
                </Button>
              </VStack>
            </CardBody>
          </Card>
        )}

        {/* Modal de pago */}
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              {selectedVoucher ? 'Pagar Vale Individual' : 'Pago Mensual Completo'}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <VStack spacing={4}>
                {selectedVoucher ? (
                  <Box w="full">
                    <Text fontWeight="bold" mb={2}>Detalles del Vale:</Text>
                    <VStack align="start" spacing={1} p={3} bg="gray.50" borderRadius="md">
                      <Text><strong>Producto:</strong> {selectedVoucher.product?.name}</Text>
                      <Text><strong>Cantidad:</strong> {selectedVoucher.quantity}</Text>
                      <Text><strong>Precio Unitario:</strong> S/ {parseFloat(selectedVoucher.unitPrice || 0).toFixed(2)}</Text>
                      <Text><strong>Total:</strong> S/ {parseFloat(selectedVoucher.totalAmount || 0).toFixed(2)}</Text>
                    </VStack>
                  </Box>
                ) : (
                  <Box w="full">
                    <Text fontWeight="bold" mb={2}>Resumen de Pago Mensual:</Text>
                    <VStack align="start" spacing={1} p={3} bg="gray.50" borderRadius="md">
                      <Text><strong>Total de Vales:</strong> {pendingVouchers.length}</Text>
                      <Text><strong>Subtotal:</strong> S/ {subtotalPending.toFixed(2)}</Text>
                      <Text><strong>Flete (Distrito: {summary?.client?.district || 'N/A'}):</strong> S/ {deliveryFee.toFixed(2)}</Text>
                      <Divider />
                      <Text fontWeight="bold" color="green.600"><strong>Total a Pagar:</strong> S/ {totalPending.toFixed(2)}</Text>
                    </VStack>
                  </Box>
                )}

                <Divider />

                <FormControl>
                  <FormLabel>Método de Pago</FormLabel>
                  <RadioGroup value={paymentMethod} onChange={setPaymentMethod}>
                    <Stack direction="row" spacing={4}>
                      <Radio value="cash">
                        <HStack>
                          <FaMoneyBillWave />
                          <Text>Efectivo</Text>
                        </HStack>
                      </Radio>
                      <Radio value="plin">
                        <HStack>
                          <FaMobile />
                          <Text>Plin</Text>
                        </HStack>
                      </Radio>
                    </Stack>
                  </RadioGroup>
                </FormControl>

                {paymentMethod === 'plin' && (
                  <Box textAlign="center">
                    <Text mb={2}>Escanea el código QR para pagar con Plin:</Text>
                    <img 
                      src={plinQR} 
                      alt="QR de Plin" 
                      style={{ maxWidth: '200px', height: 'auto' }}
                    />
                    <Text fontSize="sm" color="gray.600" mt={2}>
                      Número: +51 961 606 183
                    </Text>
                  </Box>
                )}

                <Button
                  colorScheme="blue"
                  size="lg"
                  w="full"
                  onClick={handlePayment}
                  isLoading={isProcessing}
                  loadingText="Procesando pago..."
                >
                  {selectedVoucher ? 'Pagar Vale' : 'Pagar Mes Completo'}
                </Button>
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>

        {/* Modal de vista de vale */}
        <Modal isOpen={isViewOpen} onClose={onViewClose} size="md">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Detalles del Vale</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              {selectedVoucher && (
                <VStack spacing={4} align="stretch">
                  <Box>
                    <Text fontWeight="bold" mb={2}>Información del Vale:</Text>
                    <VStack align="start" spacing={2} p={3} bg="gray.50" borderRadius="md">
                      <Text><strong>ID:</strong> {selectedVoucher.id}</Text>
                      <Text><strong>Fecha:</strong> {new Date(selectedVoucher.createdAt).toLocaleDateString('es-PE')}</Text>
                      <Text><strong>Producto:</strong> {selectedVoucher.product?.name}</Text>
                      <Text><strong>Descripción:</strong> {selectedVoucher.product?.description || 'N/A'}</Text>
                      <Text><strong>Cantidad:</strong> {selectedVoucher.quantity}</Text>
                      <Text><strong>Precio Unitario:</strong> S/ {parseFloat(selectedVoucher.unitPrice || 0).toFixed(2)}</Text>
                      <Text><strong>Total:</strong> S/ {parseFloat(selectedVoucher.totalAmount || 0).toFixed(2)}</Text>
                      <Text><strong>Estado:</strong> 
                        <Badge colorScheme={getStatusColor(selectedVoucher.status)} ml={2}>
                          {getStatusText(selectedVoucher.status)}
                        </Badge>
                      </Text>
                      {selectedVoucher.notes && (
                        <Text><strong>Notas:</strong> {selectedVoucher.notes}</Text>
                      )}
                    </VStack>
                  </Box>
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
