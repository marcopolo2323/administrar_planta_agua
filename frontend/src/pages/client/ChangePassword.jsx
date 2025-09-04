import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  Box,
  Container,
  Heading,
  Button,
  Flex,
  Stack,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  IconButton,
  useColorModeValue,
  InputGroup,
  InputRightElement,
} from '@chakra-ui/react';
import { ArrowBackIcon, ViewIcon, ViewOffIcon } from '@chakra-ui/icons';

const ChangePassword = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

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
    
    if (!formData.currentPassword) {
      newErrors.currentPassword = 'La contraseña actual es requerida';
    }
    
    if (!formData.newPassword) {
      newErrors.newPassword = 'La nueva contraseña es requerida';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'La contraseña debe tener al menos 6 caracteres';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirma tu nueva contraseña';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/client/login');
        return;
      }
      
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      await axios.put(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/client-auth/change-password`,
        formData,
        config
      );
      
      toast.success('Contraseña actualizada correctamente');
      
      // Limpiar el formulario
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      
      // Redirigir al dashboard
      navigate('/client/dashboard');
    } catch (error) {
      console.error('Error al cambiar la contraseña:', error);
      
      if (error.response?.status === 401 && error.response?.data?.message === 'Contraseña actual incorrecta') {
        setErrors({
          ...errors,
          currentPassword: 'La contraseña actual es incorrecta'
        });
      } else if (error.response?.status === 401) {
        // Token expirado o inválido
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('client');
        navigate('/client/login');
      } else {
        toast.error(error.response?.data?.message || 'Error al cambiar la contraseña. Inténtalo de nuevo.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoBack = () => {
    navigate('/client/dashboard');
  };

  return (
    <Container maxW="container.md" py={8}>
      <Flex direction="column" gap={6}>
        <Flex align="center" gap={4}>
          <IconButton
            icon={<ArrowBackIcon />}
            aria-label="Volver"
            onClick={handleGoBack}
            variant="outline"
          />
          <Heading size="lg">Cambiar Contraseña</Heading>
        </Flex>

        <Box
          borderWidth="1px"
          borderRadius="lg"
          borderColor={borderColor}
          bg={bgColor}
          p={6}
          boxShadow="sm"
        >
          <form onSubmit={handleSubmit}>
            <Stack spacing={4}>
              <FormControl id="currentPassword" isRequired isInvalid={!!errors.currentPassword}>
                <FormLabel>Contraseña actual</FormLabel>
                <InputGroup>
                  <Input
                    type={showCurrentPassword ? 'text' : 'password'}
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                  />
                  <InputRightElement>
                    <IconButton
                      size="sm"
                      variant="ghost"
                      icon={showCurrentPassword ? <ViewOffIcon /> : <ViewIcon />}
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      aria-label={showCurrentPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    />
                  </InputRightElement>
                </InputGroup>
                <FormErrorMessage>{errors.currentPassword}</FormErrorMessage>
              </FormControl>
              
              <FormControl id="newPassword" isRequired isInvalid={!!errors.newPassword}>
                <FormLabel>Nueva contraseña</FormLabel>
                <InputGroup>
                  <Input
                    type={showNewPassword ? 'text' : 'password'}
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                  />
                  <InputRightElement>
                    <IconButton
                      size="sm"
                      variant="ghost"
                      icon={showNewPassword ? <ViewOffIcon /> : <ViewIcon />}
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      aria-label={showNewPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    />
                  </InputRightElement>
                </InputGroup>
                <FormErrorMessage>{errors.newPassword}</FormErrorMessage>
              </FormControl>
              
              <FormControl id="confirmPassword" isRequired isInvalid={!!errors.confirmPassword}>
                <FormLabel>Confirmar nueva contraseña</FormLabel>
                <InputGroup>
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                  <InputRightElement>
                    <IconButton
                      size="sm"
                      variant="ghost"
                      icon={showConfirmPassword ? <ViewOffIcon /> : <ViewIcon />}
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    />
                  </InputRightElement>
                </InputGroup>
                <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>
              </FormControl>
              
              <Stack direction="row" spacing={4} pt={4} justify="flex-end">
                <Button
                  variant="outline"
                  onClick={handleGoBack}
                >
                  Cancelar
                </Button>
                <Button
                  colorScheme="blue"
                  type="submit"
                  isLoading={isSubmitting}
                  loadingText="Guardando"
                >
                  Cambiar Contraseña
                </Button>
              </Stack>
            </Stack>
          </form>
        </Box>
      </Flex>
    </Container>
  );
};

export default ChangePassword;