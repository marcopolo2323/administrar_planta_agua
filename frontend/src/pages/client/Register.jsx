import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Input,
  Select,
  Stack,
  Heading,
  Text,
  useColorModeValue,
  FormErrorMessage,
  InputGroup,
  InputRightElement,
  IconButton,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    documentType: 'DNI',
    documentNumber: '',
    address: '',
    district: '',
    phone: '',
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Limpiar error del campo cuando el usuario comienza a escribir
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) newErrors.username = 'El nombre de usuario es requerido';
    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El correo electrónico no es válido';
    }
    
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }
    
    if (!formData.name.trim()) newErrors.name = 'El nombre es requerido';
    if (!formData.documentNumber.trim()) newErrors.documentNumber = 'El número de documento es requerido';
    if (!formData.phone.trim()) newErrors.phone = 'El teléfono es requerido';
    if (!formData.address.trim()) newErrors.address = 'La dirección es requerida';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/client-auth/register`,
        {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          name: formData.name,
          documentType: formData.documentType,
          documentNumber: formData.documentNumber,
          address: formData.address,
          district: formData.district,
          phone: formData.phone,
          defaultDeliveryAddress: formData.address,
          defaultContactPhone: formData.phone
        }
      );
      
      toast.success('Registro exitoso. ¡Bienvenido!');
      
      // Guardar token en localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('client', JSON.stringify(response.data.client));
      
      // Redirigir al usuario a la página principal de clientes
      navigate('/client/dashboard');
    } catch (error) {
      console.error('Error al registrar:', error);
      const errorMessage = error.response?.data?.message || 'Error al registrar. Inténtalo de nuevo.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxW="lg" py={{ base: 12, md: 24 }} px={{ base: 0, sm: 8 }}>
      <Stack spacing={8}>
        <Stack align="center">
          <Heading fontSize="2xl" textAlign="center">
            Registro de Cliente
          </Heading>
          <Text fontSize="lg" color="gray.600">
            Crea tu cuenta para realizar pedidos de agua a domicilio
          </Text>
        </Stack>
        <Box
          rounded="lg"
          bg={useColorModeValue('white', 'gray.700')}
          boxShadow="lg"
          p={8}
        >
          <form onSubmit={handleSubmit}>
            <Stack spacing={4}>
              <FormControl id="username" isRequired isInvalid={!!errors.username}>
                <FormLabel>Nombre de usuario</FormLabel>
                <Input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                />
                <FormErrorMessage>{errors.username}</FormErrorMessage>
              </FormControl>
              
              <FormControl id="email" isRequired isInvalid={!!errors.email}>
                <FormLabel>Correo electrónico</FormLabel>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
                <FormErrorMessage>{errors.email}</FormErrorMessage>
              </FormControl>
              
              <FormControl id="password" isRequired isInvalid={!!errors.password}>
                <FormLabel>Contraseña</FormLabel>
                <InputGroup>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <InputRightElement>
                    <IconButton
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                      onClick={() => setShowPassword(!showPassword)}
                      variant="ghost"
                      size="sm"
                    />
                  </InputRightElement>
                </InputGroup>
                <FormErrorMessage>{errors.password}</FormErrorMessage>
              </FormControl>
              
              <FormControl id="confirmPassword" isRequired isInvalid={!!errors.confirmPassword}>
                <FormLabel>Confirmar contraseña</FormLabel>
                <InputGroup>
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                  <InputRightElement>
                    <IconButton
                      aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      icon={showConfirmPassword ? <ViewOffIcon /> : <ViewIcon />}
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      variant="ghost"
                      size="sm"
                    />
                  </InputRightElement>
                </InputGroup>
                <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>
              </FormControl>
              
              <FormControl id="name" isRequired isInvalid={!!errors.name}>
                <FormLabel>Nombre completo</FormLabel>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                />
                <FormErrorMessage>{errors.name}</FormErrorMessage>
              </FormControl>
              
              <Stack direction={{ base: 'column', sm: 'row' }} spacing={4}>
                <FormControl id="documentType">
                  <FormLabel>Tipo de documento</FormLabel>
                  <Select
                    name="documentType"
                    value={formData.documentType}
                    onChange={handleChange}
                  >
                    <option value="DNI">DNI</option>
                    <option value="RUC">RUC</option>
                  </Select>
                </FormControl>
                
                <FormControl id="documentNumber" isRequired isInvalid={!!errors.documentNumber}>
                  <FormLabel>Número de documento</FormLabel>
                  <Input
                    type="text"
                    name="documentNumber"
                    value={formData.documentNumber}
                    onChange={handleChange}
                  />
                  <FormErrorMessage>{errors.documentNumber}</FormErrorMessage>
                </FormControl>
              </Stack>
              
              <FormControl id="phone" isRequired isInvalid={!!errors.phone}>
                <FormLabel>Teléfono</FormLabel>
                <Input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
                <FormErrorMessage>{errors.phone}</FormErrorMessage>
              </FormControl>
              
              <FormControl id="address" isRequired isInvalid={!!errors.address}>
                <FormLabel>Dirección</FormLabel>
                <Input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                />
                <FormErrorMessage>{errors.address}</FormErrorMessage>
              </FormControl>
              
              <FormControl id="district">
                <FormLabel>Distrito</FormLabel>
                <Input
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                />
              </FormControl>
              
              <Stack spacing={10} pt={2}>
                <Button
                  loadingText="Enviando"
                  size="lg"
                  bg="blue.400"
                  color="white"
                  _hover={{
                    bg: 'blue.500',
                  }}
                  type="submit"
                  isLoading={isLoading}
                >
                  Registrarse
                </Button>
              </Stack>
              
              <Stack pt={6}>
                <Text align="center">
                  ¿Ya tienes una cuenta?{' '}
                  <Link to="/client/login" style={{ color: '#4299E1' }}>
                    Iniciar sesión
                  </Link>
                </Text>
              </Stack>
            </Stack>
          </form>
        </Box>
      </Stack>
    </Container>
  );
};

export default Register;