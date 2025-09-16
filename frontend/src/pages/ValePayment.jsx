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
  Select,
  useToast,
  Alert,
  AlertIcon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Divider,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  RadioGroup,
  Radio,
  Stack
} from '@chakra-ui/react';
import { 
  FaMoneyBillWave, 
  FaQrcode, 
  FaCheckCircle,
  FaUser,
  FaPhone,
  FaCalendarAlt
} from 'react-icons/fa';
import axios from '../utils/axios';

const ValePayment = () => {
  const [clientId, setClientId] = useState('');
  const [clientData, setClientData] = useState(null);
  const [vales, setVales] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('efectivo');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentReference, setPaymentReference] = useState('');
  const { isOpen: isConfirmOpen, onOpen: onConfirmOpen, onClose: onConfirmClose } = useDisclosure();
  
  const toast = useToast();

  const handleSearchClient = async () => {
    if (!clientId) {
      toast({
        title: 'Error',
        description: 'Ingresa un ID de cliente',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(`/api/vale-payments/summary/${clientId}`);
      
      if (response.data.success) {
        setClientData(response.data.data.client);
        setVales(response.data.data.vales);
        setSummary(response.data.data.summary);
        setPaymentAmount(response.data.data.summary.totalRemaining.toString());
      } else {
        throw new Error(response.data.message || 'Cliente no encontrado');
      }
    } catch (error) {
      console.error('Error al buscar cliente:', error);
      toast({
        title: 'Error',
        description: 'No se encontraron vales para este cliente',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      setClientData(null);
      setVales([]);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayment = async () => {
    if (!paymentAmount || parseFloat(paymentAmount) < summary.totalRemaining) {
      toast({
        title: 'Error',
        description: 'El monto debe ser mayor o igual al saldo pendiente',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post('/api/vale-payments/process', {
        clientId,
        paymentMethod,
        paymentAmount: parseFloat(paymentAmount),
        paymentReference
      });

      if (response.data.success) {
        toast({
          title: 'Pago procesado',
          description: 'Los vales han sido pagados exitosamente',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        
        // Recargar datos
        handleSearchClient();
        onConfirmClose();
        
        // Limpiar formulario
        setPaymentAmount('');
        setPaymentReference('');
      } else {
        throw new Error(response.data.message || 'Error al procesar el pago');
      }
    } catch (error) {
      console.error('Error al procesar pago:', error);
      toast({
        title: 'Error',
        description: 'No se pudo procesar el pago',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Heading size="lg" mb={4}>
          Pago de Vales
        </Heading>

        {/* Búsqueda de Cliente */}
        <Card>
          <CardHeader>
            <Heading size="md">Buscar Cliente</Heading>
          </CardHeader>
          <CardBody>
            <HStack spacing={4}>
              <FormControl>
                <FormLabel>ID del Cliente</FormLabel>
                <Input
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  placeholder="Ingresa el ID del cliente"
                />
              </FormControl>
              <Button
                colorScheme="blue"
                onClick={handleSearchClient}
                isLoading={loading}
                loadingText="Buscando..."
              >
                Buscar Vales
              </Button>
            </HStack>
          </CardBody>
        </Card>

        {/* Información del Cliente y Vales */}
        {clientData && (
          <Card>
            <CardHeader>
              <Heading size="md">Información del Cliente</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <HStack spacing={6}>
                  <HStack>
                    <FaUser color="#718096" />
                    <Text fontWeight="bold">{clientData.name}</Text>
                  </HStack>
                  <HStack>
                    <FaPhone color="#718096" />
                    <Text>{clientData.phone}</Text>
                  </HStack>
                  <HStack>
                    <FaCalendarAlt color="#718096" />
                    <Text>{vales.length} vale(s) activo(s)</Text>
                  </HStack>
                </HStack>

                <Divider />

                <VStack spacing={3} align="stretch">
                  <Text fontWeight="bold" fontSize="lg">Resumen de Vales</Text>
                  <HStack justify="space-between">
                    <Text>Total de Vales:</Text>
                    <Text fontWeight="bold">{summary.total}</Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text>Monto Total:</Text>
                    <Text fontWeight="bold" color="green.600">
                      S/ {summary.totalAmount.toFixed(2)}
                    </Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text>Monto Usado:</Text>
                    <Text fontWeight="bold" color="blue.600">
                      S/ {summary.totalUsed.toFixed(2)}
                    </Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text>Saldo Pendiente:</Text>
                    <Text fontWeight="bold" color="red.600" fontSize="lg">
                      S/ {summary.totalRemaining.toFixed(2)}
                    </Text>
                  </HStack>
                </VStack>
              </VStack>
            </CardBody>
          </Card>
        )}

        {/* Lista de Vales */}
        {vales.length > 0 && (
          <Card>
            <CardHeader>
              <Heading size="md">Detalle de Vales</Heading>
            </CardHeader>
            <CardBody>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>ID</Th>
                    <Th>Monto</Th>
                    <Th>Usado</Th>
                    <Th>Restante</Th>
                    <Th>Estado</Th>
                    <Th>Vencimiento</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {vales.map((vale) => (
                    <Tr key={vale.id}>
                      <Td>{vale.id}</Td>
                      <Td>
                        <Text fontWeight="bold" color="green.600">
                          S/ {parseFloat(vale.amount).toFixed(2)}
                        </Text>
                      </Td>
                      <Td>
                        <Text color="blue.600">
                          S/ {parseFloat(vale.usedAmount).toFixed(2)}
                        </Text>
                      </Td>
                      <Td>
                        <Text color="red.600">
                          S/ {parseFloat(vale.remainingAmount).toFixed(2)}
                        </Text>
                      </Td>
                      <Td>
                        <Badge colorScheme={vale.status === 'active' ? 'green' : 'red'}>
                          {vale.status === 'active' ? 'Activo' : 'Usado'}
                        </Badge>
                      </Td>
                      <Td>
                        <Text fontSize="sm">
                          {vale.dueDate ? formatDate(vale.dueDate) : 'Sin fecha'}
                        </Text>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </CardBody>
          </Card>
        )}

        {/* Formulario de Pago */}
        {summary && summary.totalRemaining > 0 && (
          <Card>
            <CardHeader>
              <Heading size="md">Procesar Pago</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <HStack spacing={4}>
                  <FormControl>
                    <FormLabel>Método de Pago</FormLabel>
                    <RadioGroup value={paymentMethod} onChange={setPaymentMethod}>
                      <Stack direction="row">
                        <Radio value="efectivo">Efectivo</Radio>
                        <Radio value="plin">PLIN</Radio>
                      </Stack>
                    </RadioGroup>
                  </FormControl>
                </HStack>

                <HStack spacing={4}>
                  <FormControl>
                    <FormLabel>Monto a Pagar</FormLabel>
                    <Input
                      type="number"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      placeholder="0.00"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Referencia (opcional)</FormLabel>
                    <Input
                      value={paymentReference}
                      onChange={(e) => setPaymentReference(e.target.value)}
                      placeholder="Referencia del pago"
                    />
                  </FormControl>
                </HStack>

                <Alert status="info">
                  <AlertIcon />
                  <Text fontSize="sm">
                    El cliente debe pagar al menos S/ {summary.totalRemaining.toFixed(2)} para cubrir todos los vales.
                    {parseFloat(paymentAmount) > summary.totalRemaining && (
                      <Text as="span" color="green.600" fontWeight="bold">
                        {' '}Cambio: S/ {(parseFloat(paymentAmount) - summary.totalRemaining).toFixed(2)}
                      </Text>
                    )}
                  </Text>
                </Alert>

                <Button
                  colorScheme="green"
                  size="lg"
                  onClick={onConfirmOpen}
                  leftIcon={<FaMoneyBillWave />}
                  isDisabled={!paymentAmount || parseFloat(paymentAmount) < summary.totalRemaining}
                >
                  Procesar Pago
                </Button>
              </VStack>
            </CardBody>
          </Card>
        )}

        {/* Modal de Confirmación */}
        <Modal isOpen={isConfirmOpen} onClose={onConfirmClose} size="md">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Confirmar Pago</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <VStack spacing={4} align="stretch">
                <Text>¿Estás seguro de procesar este pago?</Text>
                
                <VStack spacing={2} align="stretch" p={4} bg="gray.50" borderRadius="md">
                  <HStack justify="space-between">
                    <Text>Cliente:</Text>
                    <Text fontWeight="bold">{clientData?.name}</Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text>Método:</Text>
                    <Text fontWeight="bold">{paymentMethod === 'efectivo' ? 'Efectivo' : 'PLIN'}</Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text>Monto:</Text>
                    <Text fontWeight="bold" color="green.600">
                      S/ {parseFloat(paymentAmount).toFixed(2)}
                    </Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text>Saldo a cubrir:</Text>
                    <Text fontWeight="bold" color="red.600">
                      S/ {summary?.totalRemaining.toFixed(2)}
                    </Text>
                  </HStack>
                  {parseFloat(paymentAmount) > summary?.totalRemaining && (
                    <HStack justify="space-between">
                      <Text>Cambio:</Text>
                      <Text fontWeight="bold" color="blue.600">
                        S/ {(parseFloat(paymentAmount) - summary.totalRemaining).toFixed(2)}
                      </Text>
                    </HStack>
                  )}
                </VStack>

                <HStack spacing={4}>
                  <Button variant="outline" onClick={onConfirmClose} flex={1}>
                    Cancelar
                  </Button>
                  <Button
                    colorScheme="green"
                    onClick={handleProcessPayment}
                    isLoading={loading}
                    loadingText="Procesando..."
                    flex={1}
                    leftIcon={<FaCheckCircle />}
                  >
                    Confirmar Pago
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

export default ValePayment;
