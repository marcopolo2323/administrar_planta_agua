import React, { useState, useEffect } from 'react';
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Button,
  HStack,
  VStack,
  Text,
  Badge,
  useToast
} from '@chakra-ui/react';
import { FaMoneyBillWave, FaCalendarAlt } from 'react-icons/fa';
import axios from '../utils/axios';
import useAuthStore from '../stores/authStore';

const MonthlyPaymentNotification = () => {
  const [pendingAmount, setPendingAmount] = useState(0);
  const [voucherCount, setVoucherCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const toast = useToast();

  useEffect(() => {
    if (user && user.role === 'cliente') {
      fetchPendingAmount();
    }
  }, [user]);

  const fetchPendingAmount = async () => {
    try {
      const response = await axios.get('/api/vouchers/client');
      if (response.data.success) {
        const vouchers = response.data.data || [];
        // Cambiar a 'pending' ya que ahora los vales se crean con estado 'pending'
        const pendingVouchers = vouchers.filter(v => v.status === 'pending');
        
        const totalAmount = pendingVouchers.reduce((sum, voucher) => 
          sum + parseFloat(voucher.totalAmount || 0), 0
        );
        
        setPendingAmount(totalAmount);
        setVoucherCount(pendingVouchers.length);
      }
    } catch (error) {
      console.error('Error al obtener monto pendiente:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentReminder = () => {
    toast({
      title: 'Recordatorio de Pago',
      description: `Tienes ${voucherCount} vales pendientes por un total de S/ ${pendingAmount.toFixed(2)}. Contacta con tu repartidor para coordinar el pago.`,
      status: 'info',
      duration: 8000,
      isClosable: true,
    });
  };

  // Mostrar notificación solo si hay montos pendientes
  if (loading || pendingAmount === 0) {
    return null;
  }

  // Detectar si estamos cerca del fin de mes (últimos 5 días del mes)
  const today = new Date();
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const daysUntilEndOfMonth = lastDayOfMonth - today.getDate();
  const isEndOfMonth = daysUntilEndOfMonth <= 5; // Últimos 5 días del mes

  return (
    <Alert
      status={isEndOfMonth ? "warning" : "info"}
      variant="left-accent"
      borderRadius="md"
      mb={4}
    >
      <AlertIcon />
      <VStack align="start" spacing={2} flex={1}>
        <HStack>
          <AlertTitle>
            {isEndOfMonth ? "¡Es fin de mes!" : "Recordatorio de Pago"}
          </AlertTitle>
          <Badge colorScheme={isEndOfMonth ? "red" : "blue"}>
            {voucherCount} vales
          </Badge>
        </HStack>
        <AlertDescription>
          Tienes <strong>S/ {pendingAmount.toFixed(2)}</strong> en vales pendientes de pago.
          {isEndOfMonth 
            ? ` ¡Es fin de mes! Debes pagar TODOS los vales pendientes (${voucherCount} vales). Contacta con tu repartidor inmediatamente.`
            : " Recuerda que todos los vales deben pagarse a fin de mes."
          }
        </AlertDescription>
        <HStack spacing={2}>
          <Button
            size="sm"
            leftIcon={<FaMoneyBillWave />}
            colorScheme={isEndOfMonth ? "red" : "blue"}
            onClick={handlePaymentReminder}
          >
            Ver Detalles
          </Button>
          <Button
            size="sm"
            variant="outline"
            leftIcon={<FaCalendarAlt />}
          >
            Programar Pago
          </Button>
        </HStack>
      </VStack>
    </Alert>
  );
};

export default MonthlyPaymentNotification;
