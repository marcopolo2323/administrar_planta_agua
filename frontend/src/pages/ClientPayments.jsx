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

      </VStack>
    </Box>
  );
};

export default ClientPayments;
