import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  Flex,
  Stack,
  FormControl,
  FormLabel,
  Input,
  Select,
  FormErrorMessage,
  IconButton,
  useColorModeValue,
  Divider,
  Spinner,
} from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';

const EditProfile = () => {
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    documentType: 'DNI',
    documentNumber: '',
    address: '',
    district: '',
    phone: '',
    defaultDeliveryAddress: '',
    defaultContactPhone: '',
    email: '',
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const clientData = localStorage.getItem('client');
    
    if (!token || !clientData) {
      navigate('/client/login');
      return;
    }
    
    const parsedClient = JSON.parse(clientData);
    setClient(parsedClient);
    
    const fetchClientProfile = async () => {
      setIsLoading(true);
      try {
        const config = {
          headers: { Authorization: `Bearer ${token}` }
        };
        
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/client-auth/profile`,
          config
        );
        
        const clientData = response.data;
        
        setFormData({
          name: clientData.name || '',
          documentType: clientData.documentType || 'DNI',
          documentNumber: clientData.documentNumber || '',
          address: clientData.address || '',
          district: clientData.district || '',
          phone: clientData.phone || '',
          defaultDeliveryAddress: clientData.defaultDeliveryAddress || clientData.address || '',
          defaultContactPhone: clientData.defaultContactPhone || clientData.phone || '',
          email: clientData.email || '',
        });
      } catch (error) {
        console.error('Error al cargar perfil del cliente:', error);
        toast.error('Error al cargar los datos del perfil.');
        
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
    
    fetchClientProfile();
  }, [navigate]);

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
    
    if (!formData.name.trim()) newErrors.name = 'El nombre es requerido';
    if (!formData.documentNumber.trim()) newErrors.documentNumber = 'El número de documento es requerido';
    if (!formData.phone.trim()) newErrors.phone = 'El teléfono es requerido';
    if (!formData.address.trim()) newErrors.address = 'La dirección es requerida';
    if (!formData.defaultDeliveryAddress.trim()) newErrors.defaultDeliveryAddress = 'La dirección de entrega es requerida';
    if (!formData.defaultContactPhone.trim()) newErrors.defaultContactPhone = 'El teléfono de contacto es requerido';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/client-auth/profile`,
        formData,
        config
      );
      
      // Actualizar datos en localStorage
      localStorage.setItem('client', JSON.stringify(response.data));
      
      toast.success('Perfil actualizado correctamente');
      navigate('/client/dashboard');
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      toast.error(error.response?.data?.message || 'Error al actualizar el perfil. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoBack = () => {
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
    <Container maxW="container.md" py={8}>
      <Flex direction="column" gap={6}>
        <Flex align="center" gap={4}>
          <IconButton
            icon={<ArrowBackIcon />}
            aria-label="Volver"
            onClick={handleGoBack}
            variant="outline"
          />
          <Heading size="lg">Editar Perfil</Heading>
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
              <Heading size="md" mb={2}>Información Personal</Heading>
              
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
              
              <FormControl id="email">
                <FormLabel>Correo electrónico</FormLabel>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  isReadOnly
                />
                <Text fontSize="sm" color="gray.500" mt={1}>
                  El correo electrónico no se puede modificar
                </Text>
              </FormControl>
              
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
              
              <Divider my={4} />
              
              <Heading size="md" mb={2}>Preferencias de Entrega</Heading>
              
              <FormControl id="defaultDeliveryAddress" isRequired isInvalid={!!errors.defaultDeliveryAddress}>
                <FormLabel>Dirección de entrega predeterminada</FormLabel>
                <Input
                  type="text"
                  name="defaultDeliveryAddress"
                  value={formData.defaultDeliveryAddress}
                  onChange={handleChange}
                />
                <FormErrorMessage>{errors.defaultDeliveryAddress}</FormErrorMessage>
              </FormControl>
              
              <FormControl id="defaultContactPhone" isRequired isInvalid={!!errors.defaultContactPhone}>
                <FormLabel>Teléfono de contacto predeterminado</FormLabel>
                <Input
                  type="tel"
                  name="defaultContactPhone"
                  value={formData.defaultContactPhone}
                  onChange={handleChange}
                />
                <FormErrorMessage>{errors.defaultContactPhone}</FormErrorMessage>
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
                  Guardar Cambios
                </Button>
              </Stack>
            </Stack>
          </form>
        </Box>
      </Flex>
    </Container>
  );
};

export default EditProfile;