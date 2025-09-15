import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  FormControl,
  FormLabel,
  InputGroup,
  InputRightElement,
  IconButton,
  useToast,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Divider,
  Link as ChakraLink,
  Spinner,
  Alert,
  AlertIcon
} from '@chakra-ui/react';
import { FaEye, FaEyeSlash, FaTruck } from 'react-icons/fa';
import useAuthStore from '../stores/authStore';

const DeliveryLogin = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, error } = useAuthStore();
  const navigate = useNavigate();
  const toast = useToast();

  // Debug log
  console.log('🚚 DeliveryLogin component rendered');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login(formData.username, formData.password);
      
      if (result.success) {
        // Obtener el usuario del estado del store
        const currentUser = useAuthStore.getState().user;
        
        if (currentUser && currentUser.role === 'repartidor') {
          toast({
            title: 'Bienvenido',
            description: `Hola ${currentUser.username}, bienvenido al panel de repartidor`,
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
          navigate('/delivery-dashboard');
        } else {
          toast({
            title: 'Acceso Denegado',
            description: 'Esta cuenta no es de un repartidor',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
          useAuthStore.getState().logout();
        }
      }
    } catch (error) {
      console.error('Error en login:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box minH="100vh" bg="gray.50" display="flex" alignItems="center" justifyContent="center" p={4}>
      <Card maxW="md" w="full" boxShadow="xl">
        <CardHeader textAlign="center" pb={2}>
          <VStack spacing={4}>
            <Box color="purple.600" fontSize="4xl">
              <FaTruck />
            </Box>
            <Heading size="lg" color="gray.700">
              Panel de Repartidor
            </Heading>
            <Text color="gray.600" fontSize="sm">
              Inicia sesión para gestionar tus pedidos asignados
            </Text>
          </VStack>
        </CardHeader>

        <CardBody pt={0}>
          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              {error && (
                <Alert status="error" borderRadius="md">
                  <AlertIcon />
                  {error}
                </Alert>
              )}

              <FormControl isRequired>
                <FormLabel>Usuario</FormLabel>
                <Input
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Ingresa tu usuario"
                  size="lg"
                  autoComplete="username"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Contraseña</FormLabel>
                <InputGroup size="lg">
                  <Input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Ingresa tu contraseña"
                  />
                  <InputRightElement>
                    <IconButton
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      icon={showPassword ? <FaEyeSlash /> : <FaEye />}
                      variant="ghost"
                      onClick={() => setShowPassword(!showPassword)}
                    />
                  </InputRightElement>
                </InputGroup>
              </FormControl>

              <Button
                type="submit"
                colorScheme="purple"
                size="lg"
                w="full"
                isLoading={loading}
                loadingText="Iniciando sesión..."
                leftIcon={<FaTruck />}
              >
                Iniciar Sesión
              </Button>

              <Divider />

              <VStack spacing={2} textAlign="center">
                <Text fontSize="sm" color="gray.600">
                  ¿No eres repartidor?
                </Text>
                <HStack spacing={4}>
                  <ChakraLink
                    color="blue.500"
                    onClick={() => navigate('/')}
                    _hover={{ textDecoration: 'underline' }}
                  >
                    Panel de Administración
                  </ChakraLink>
                  <Text color="gray.400">|</Text>
                  <ChakraLink
                    color="green.500"
                    onClick={() => navigate('/client-login')}
                    _hover={{ textDecoration: 'underline' }}
                  >
                    Área de Clientes
                  </ChakraLink>
                </HStack>
              </VStack>
            </VStack>
          </form>
        </CardBody>
      </Card>
    </Box>
  );
};

export default DeliveryLogin;
