import React from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  Image,
  useColorModeValue,
  Container,
  Center,
  Icon,
  HStack
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { FaWifi, FaHome, FaRedo } from 'react-icons/fa';

const ErrorPage = ({ 
  type = '404', 
  title = 'Página no encontrada',
  description = 'La página que buscas no existe',
  showRetry = true 
}) => {
  const navigate = useNavigate();
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const textColor = useColorModeValue('gray.700', 'gray.200');

  const getErrorContent = () => {
    switch (type) {
      case '404':
        return {
          icon: '🦕',
          title: '¡Ups! Página no encontrada',
          description: 'La página que buscas se ha perdido en el desierto digital',
          action: 'Volver al inicio',
          color: 'blue'
        };
      case 'offline':
        return {
          icon: '📡',
          title: 'Sin conexión a internet',
          description: 'Parece que te has desconectado del mundo digital',
          action: 'Reintentar',
          color: 'orange'
        };
      case '500':
        return {
          icon: '⚠️',
          title: 'Error del servidor',
          description: 'Algo salió mal en nuestro lado',
          action: 'Reintentar',
          color: 'red'
        };
      default:
        return {
          icon: '❌',
          title: title,
          description: description,
          action: 'Volver al inicio',
          color: 'gray'
        };
    }
  };

  const errorContent = getErrorContent();

  const handleRetry = () => {
    if (type === 'offline') {
      window.location.reload();
    } else {
      navigate('/');
    }
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <Box minH="100vh" bg={bgColor} display="flex" alignItems="center" justifyContent="center">
      <Container maxW="md" centerContent>
        <VStack spacing={8} textAlign="center" py={12}>
          {/* Icono grande */}
          <Box fontSize="8xl" mb={4}>
            {errorContent.icon}
          </Box>

          {/* Título */}
          <Heading 
            size="xl" 
            color={textColor}
            fontWeight="bold"
          >
            {errorContent.title}
          </Heading>

          {/* Descripción */}
          <Text 
            fontSize="lg" 
            color="gray.500" 
            maxW="md"
            lineHeight="1.6"
          >
            {errorContent.description}
          </Text>

          {/* Código de error */}
          {type === '404' && (
            <VStack spacing={2}>
              <Text fontSize="6xl" fontWeight="bold" color="blue.500">
                404
              </Text>
              <Text fontSize="sm" color="gray.400">
                ERROR
              </Text>
            </VStack>
          )}

          {/* Botones de acción */}
          <VStack spacing={4} w="full" maxW="sm">
            {showRetry && (
              <Button
                colorScheme={errorContent.color}
                size="lg"
                w="full"
                leftIcon={<Icon as={FaRedo} />}
                onClick={handleRetry}
                _hover={{
                  transform: 'translateY(-2px)',
                  boxShadow: 'lg'
                }}
                transition="all 0.2s"
              >
                {errorContent.action}
              </Button>
            )}

            <Button
              variant="outline"
              size="lg"
              w="full"
              leftIcon={<Icon as={FaHome} />}
              onClick={handleGoHome}
              _hover={{
                transform: 'translateY(-2px)',
                boxShadow: 'md'
              }}
              transition="all 0.2s"
            >
              Ir al inicio
            </Button>
          </VStack>

          {/* Información adicional */}
          <VStack spacing={2} pt={4}>
            <Text fontSize="sm" color="gray.400">
              Si el problema persiste, contacta al administrador
            </Text>
            <HStack spacing={4} fontSize="xs" color="gray.400">
              <Text>• Verifica tu conexión</Text>
              <Text>• Intenta más tarde</Text>
              <Text>• Contacta soporte</Text>
            </HStack>
          </VStack>
        </VStack>
      </Container>
    </Box>
  );
};

export default ErrorPage;
