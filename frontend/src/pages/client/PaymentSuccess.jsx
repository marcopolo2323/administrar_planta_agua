import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  Flex,
  VStack,
  Icon,
  Spinner,
  useColorModeValue,
} from '@chakra-ui/react';
import { CheckCircleIcon, ArrowForwardIcon } from '@chakra-ui/icons';

const PaymentSuccess = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      navigate('/client/login');
      return;
    }
    
    const fetchOrderDetails = async () => {
      setIsLoading(true);
      try {
        const config = {
          headers: { Authorization: `Bearer ${token}` }
        };
        
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/orders/${orderId}`,
          config
        );
        
        setOrder(response.data);
      } catch (error) {
        console.error('Error al cargar detalles del pedido:', error);
        
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('client');
          navigate('/client/login');
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrderDetails();
  }, [orderId, navigate]);

  const handleViewOrder = () => {
    navigate(`/client/orders/${orderId}`);
  };

  const handleBackToDashboard = () => {
    navigate('/client/dashboard');
  };

  if (isLoading) {
    return (
      <Flex justify="center" align="center" height="100vh">
        <Spinner size="xl" color="blue.500" />
      </Flex>
    );
  }

  return (
    <Container maxW={{ base: "100vw", md: "container.md" }} px={{ base: 2, md: 6 }} py={{ base: 8, md: 20 }}>
      <Box
        borderWidth="1px"
        borderRadius="lg"
        borderColor={borderColor}
        bg={bgColor}
        p={{ base: 4, md: 10 }}
        boxShadow="lg"
        textAlign="center"
      >
        <VStack spacing={{ base: 4, md: 6 }}>
          <Icon as={CheckCircleIcon} w={{ base: 16, md: 20 }} h={{ base: 16, md: 20 }} color="green.500" />
          <Heading size={{ base: "lg", md: "xl" }}>¡Pago Exitoso!</Heading>
          <Text fontSize={{ base: "md", md: "lg" }} color="gray.600">
            Tu pago ha sido procesado correctamente y tu pedido está en camino.
          </Text>
          <Box py={4}>
            <Text fontWeight="bold" fontSize={{ base: "lg", md: "xl" }}>Detalles del Pedido</Text>
            <Text fontSize={{ base: "sm", md: "md" }} mt={2}>Pedido #{orderId}</Text>
            {order && (
              <>
                <Text fontSize={{ base: "sm", md: "md" }} mt={1}>Total: S/ {order.total.toFixed(2)}</Text>
                <Text fontSize={{ base: "xs", md: "sm" }} color="gray.500" mt={1}>
                  {order.items?.length || 0} productos
                </Text>
              </>
            )}
          </Box>
          <Text color="gray.600" fontSize={{ base: "sm", md: "md" }}>
            Recibirás un correo electrónico con los detalles de tu compra.<br />
            Puedes hacer seguimiento a tu pedido desde tu panel de cliente.
          </Text>
          <Flex direction={{ base: 'column', sm: 'row' }} gap={4} w="full" justify="center" mt={4}>
            <Button
              colorScheme="blue"
              size={{ base: "md", md: "lg" }}
              rightIcon={<ArrowForwardIcon />}
              onClick={handleViewOrder}
              w={{ base: "100%", sm: "auto" }}
            >
              Ver Detalles del Pedido
            </Button>
            <Button
              variant="outline"
              size={{ base: "md", md: "lg" }}
              onClick={handleBackToDashboard}
              w={{ base: "100%", sm: "auto" }}
              mt={{ base: 2, sm: 0 }}
            >
              Volver al Dashboard
            </Button>
          </Flex>
        </VStack>
      </Box>
    </Container>
  );
};

export default PaymentSuccess;