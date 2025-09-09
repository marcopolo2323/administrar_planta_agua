import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  useToast,
  Alert,
  AlertIcon,
  Spinner,
  Center,
  Image
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import AquaYaraLogo from '../components/AquaYaraLogo';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const { login, error, clearError } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login(formData.username, formData.password);
      if (result.success) {
        toast({
          title: 'Éxito',
          description: 'Inicio de sesión exitoso',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error en login:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) clearError();
  };

  return (
    <Center minH="100vh" bg="gray.50">
      <Box w="full" maxW="md" p={6}>
        <Card>
          <CardBody>
            <VStack spacing={6}>
              <Box textAlign="center">
                <AquaYaraLogo 
                  size="xl" 
                  variant="vertical" 
                  color="blue.500" 
                  textColor="blue.600" 
                  taglineColor="teal.500"
                />
                <Text color="gray.600" mt={2}>
                  Sistema de Gestión
                </Text>
              </Box>

              <Box w="full">
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
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Contraseña</FormLabel>
                      <Input
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Ingresa tu contraseña"
                        size="lg"
                        autoComplete="current-password"
                      />
                    </FormControl>

                    <Button
                      type="submit"
                      colorScheme="blue"
                      size="lg"
                      w="full"
                      isLoading={loading}
                      loadingText="Iniciando sesión..."
                    >
                      Iniciar Sesión
                    </Button>
                  </VStack>
                </form>
              </Box>

              <Box textAlign="center">
                <Text fontSize="sm" color="gray.500">
                  Sistema de gestión para planta de agua
                </Text>
              </Box>
            </VStack>
          </CardBody>
        </Card>
      </Box>
    </Center>
  );
};

export default Login;
