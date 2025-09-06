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
  const [selectedVouchers, setSelectedVouchers] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuthStore();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

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

  const pendingVouchers = vouchers.filter(v => v.status === 'delivered');
  const totalPending = pendingVouchers.reduce((sum, v) => sum + parseFloat(v.totalAmount || 0), 0);

  const handleSelectVoucher = (voucherId) => {
    setSelectedVouchers(prev => 
      prev.includes(voucherId) 
        ? prev.filter(id => id !== voucherId)
        : [...prev, voucherId]
    );
  };

  const handleSelectAll = () => {
    if (selectedVouchers.length === pendingVouchers.length) {
      setSelectedVouchers([]);
    } else {
      setSelectedVouchers(pendingVouchers.map(v => v.id));
    }
  };

  const selectedVouchersData = vouchers.filter(v => selectedVouchers.includes(v.id));
  const selectedTotal = selectedVouchersData.reduce((sum, v) => sum + parseFloat(v.totalAmount || 0), 0);

  const handlePayment = async () => {
    if (selectedVouchers.length === 0) {
      toast({
        title: 'Selecciona vales',
        description: 'Debes seleccionar al menos un vale para pagar',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsProcessing(true);
    try {
      // Simular procesamiento de pago
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Actualizar vales como pagados
      await Promise.all(
        selectedVouchers.map(voucherId =>
          axios.put(`/api/vouchers/${voucherId}/status`, { status: 'paid' })
        )
      );

      // Generar boleta/factura
      const invoiceData = {
        vouchers: selectedVouchersData,
        total: selectedTotal,
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
        title: 'Pago procesado',
        description: `Se procesaron ${selectedVouchers.length} vales por S/ ${selectedTotal.toFixed(2)}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Limpiar selección y actualizar datos
      setSelectedVouchers([]);
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
          <Alert status="warning">
            <AlertIcon />
            <Box>
              <Text fontWeight="bold">
                ¡Es fin de mes! Tienes {pendingVouchers.length} vales pendientes por S/ {totalPending.toFixed(2)}
              </Text>
              <Text fontSize="sm">
                Realiza tu pago ahora para mantener tu cuenta al día.
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
                  colorScheme="blue"
                  leftIcon={<FaCreditCard />}
                  onClick={onOpen}
                  isDisabled={selectedVouchers.length === 0}
                >
                  Pagar Seleccionados ({selectedVouchers.length})
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
                      {pendingVouchers.length > 0 && (
                        <Th>
                          <input
                            type="checkbox"
                            checked={selectedVouchers.length === pendingVouchers.length && pendingVouchers.length > 0}
                            onChange={handleSelectAll}
                          />
                        </Th>
                      )}
                      <Th>Vale #</Th>
                      <Th>Producto</Th>
                      <Th>Cantidad</Th>
                      <Th>Monto</Th>
                      <Th>Estado</Th>
                      <Th>Fecha</Th>
                      <Th>Acciones</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {vouchers.map((voucher) => (
                      <Tr key={voucher.id}>
                        {voucher.status === 'delivered' && (
                          <Td>
                            <input
                              type="checkbox"
                              checked={selectedVouchers.includes(voucher.id)}
                              onChange={() => handleSelectVoucher(voucher.id)}
                            />
                          </Td>
                        )}
                        <Td fontWeight="bold">#{voucher.id}</Td>
                        <Td>{voucher.product?.name || 'N/A'}</Td>
                        <Td>{voucher.quantity}</Td>
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
                            <Button size="sm" leftIcon={<FaEye />}>
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
                {/* Resumen de vales seleccionados */}
                <Box p={4} bg="gray.50" borderRadius="md">
                  <Text fontWeight="bold" mb={2}>
                    Vales seleccionados ({selectedVouchers.length}):
                  </Text>
                  {selectedVouchersData.map(voucher => (
                    <HStack key={voucher.id} justify="space-between">
                      <Text fontSize="sm">Vale #{voucher.id} - {voucher.product?.name}</Text>
                      <Text fontSize="sm" fontWeight="bold">
                        S/ {parseFloat(voucher.totalAmount || 0).toFixed(2)}
                      </Text>
                    </HStack>
                  ))}
                  <Divider my={2} />
                  <HStack justify="space-between" fontWeight="bold">
                    <Text>Total a pagar:</Text>
                    <Text color="blue.600" fontSize="lg">
                      S/ {selectedTotal.toFixed(2)}
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

                {/* Botones de acción */}
                <HStack spacing={3} justify="flex-end">
                  <Button onClick={onClose} variant="outline">
                    Cancelar
                  </Button>
                  <Button
                    colorScheme="blue"
                    onClick={handlePayment}
                    isLoading={isProcessing}
                    loadingText="Procesando..."
                    leftIcon={<FaCreditCard />}
                  >
                    Procesar Pago
                  </Button>
                </HStack>
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>
      </VStack>
    </Box>
  );
};

export default ClientPayments;
