import React, { useState, useEffect } from 'react';
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
  InputLeftElement,
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
  AlertIcon,
  Select,
  Textarea
} from '@chakra-ui/react';
import { FaEye, FaEyeSlash, FaUser, FaGift, FaMapMarkerAlt, FaPhone } from 'react-icons/fa';
import axios from '../utils/axios';
import AquaYaraLogo from '../components/AquaYaraLogo';

const ClientRegister = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    documentType: 'DNI',
    documentNumber: '',
    phone: '',
    address: '',
    district: '',
    reference: '',
    clientStatus: 'nuevo',
    recommendations: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [districts, setDistricts] = useState([]);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    fetchDistricts();
  }, []);

  const fetchDistricts = async () => {
    try {
      const response = await axios.get('/api/districts');
      setDistricts(response.data.data || []);
    } catch (error) {
      console.error('Error al cargar distritos:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validaciones
    if (!formData.name || !formData.username || !formData.email || !formData.documentNumber || !formData.phone || !formData.address || !formData.district) {
      toast({
        title: 'Error',
        description: 'Completa todos los campos obligatorios',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'Error',
        description: 'Las contraseñas no coinciden',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: 'Error',
        description: 'La contraseña debe tener al menos 6 caracteres',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      setLoading(false);
      return;
    }

    // Validar formato de documento
    if (formData.documentType === 'DNI' && (!/^\d{8}$/.test(formData.documentNumber))) {
      toast({
        title: 'Error',
        description: 'El DNI debe tener exactamente 8 dígitos',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      setLoading(false);
      return;
    }

    if (formData.documentType === 'RUC' && (!/^\d{11}$/.test(formData.documentNumber))) {
      toast({
        title: 'Error',
        description: 'El RUC debe tener exactamente 11 dígitos',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('/api/client/register', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        name: formData.name,
        documentType: formData.documentType,
        documentNumber: formData.documentNumber,
        phone: formData.phone,
        address: formData.address,
        district: formData.district,
        defaultDeliveryAddress: formData.address,
        defaultContactPhone: formData.phone,
        clientStatus: formData.clientStatus,
        recommendations: formData.recommendations
      });

      if (response.data.success) {
        setSuccess(true);
        setLoading(false);
        
        toast({
          title: '¡Cuenta Creada Exitosamente! 🎉',
          description: 'Tu cuenta de cliente frecuente ha sido creada. Iniciando sesión automáticamente...',
          status: 'success',
          duration: 4000,
          isClosable: true,
        });
        
        // Iniciar sesión automáticamente
        try {
          const loginResponse = await axios.post('/api/auth/login', {
            username: formData.username,
            password: formData.password
          });
          
          if (loginResponse.data.success) {
            // Guardar token y datos del usuario
            localStorage.setItem('token', loginResponse.data.token);
            localStorage.setItem('user', JSON.stringify(loginResponse.data.user));
            
            toast({
              title: '¡Sesión Iniciada! 🚀',
              description: 'Has sido logueado automáticamente. Redirigiendo al dashboard...',
              status: 'success',
              duration: 2000,
              isClosable: true,
            });
            
            // Redirigir al dashboard del cliente
            setTimeout(() => {
              navigate('/client-dashboard');
            }, 2000);
          } else {
            // Si falla el login automático, redirigir al login
            setTimeout(() => {
              navigate('/client-login');
            }, 3000);
          }
        } catch (loginError) {
          console.error('Error en login automático:', loginError);
          // Si falla el login automático, redirigir al login
          setTimeout(() => {
            navigate('/client-login');
          }, 3000);
        }
      }
    } catch (error) {
      console.error('Error en registro:', error);
      toast({
        title: 'Error en el registro',
        description: error.response?.data?.message || 'No se pudo crear la cuenta',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Pantalla de éxito
  if (success) {
    return (
      <Box minH="100vh" bg="gray.50" display="flex" alignItems="center" justifyContent="center" p={4}>
        <Card maxW="md" w="full">
          <CardBody textAlign="center" py={12}>
            <VStack spacing={6}>
              <Box p={4} bg="green.100" borderRadius="full">
                <FaGift size={48} color="#38a169" />
              </Box>
              <VStack spacing={2}>
                <Heading size="lg" color="green.600">
                  ¡Cuenta Creada Exitosamente! 🎉
                </Heading>
                <Text color="gray.600" fontSize="md">
                  Tu cuenta de cliente frecuente ha sido creada correctamente
                </Text>
                <Text color="gray.500" fontSize="sm">
                  Serás redirigido al login en unos segundos...
                </Text>
              </VStack>
              <VStack spacing={3}>
                <Spinner size="lg" color="green.500" />
                <Button
                  colorScheme="green"
                  size="md"
                  onClick={() => navigate('/client-login')}
                >
                  Ir al Login Ahora
                </Button>
              </VStack>
            </VStack>
          </CardBody>
        </Card>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="gray.50" display="flex" alignItems="center" justifyContent="center" p={4}>
      <Card maxW="lg" w="full">
        <CardHeader textAlign="center">
          <VStack spacing={4}>
            <AquaYaraLogo 
              size="lg" 
              variant="vertical" 
              color="blue.500" 
              textColor="blue.600" 
              taglineColor="teal.500"
            />
            <Heading size="lg" color="blue.600">
              Registro de Cliente Frecuente
            </Heading>
            <Text color="gray.600" fontSize="sm">
              Crea tu cuenta para acceder a precios especiales y suscripciones
            </Text>
          </VStack>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit}>
            <VStack spacing={6}>
              {/* Información Personal */}
              <Box w="full">
                <Heading size="md" color="blue.600" mb={4}>Información Personal</Heading>
                <VStack spacing={4}>
                  {/* Nombre Completo */}
                  <FormControl isRequired>
                    <FormLabel>Nombre Completo</FormLabel>
                    <Input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Tu nombre completo"
                    />
                  </FormControl>

                  {/* Usuario */}
                  <FormControl isRequired>
                    <FormLabel>Usuario</FormLabel>
                    <InputGroup>
                      <InputLeftElement pointerEvents="none">
                        <FaUser color="gray.300" />
                      </InputLeftElement>
                      <Input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="Ingresa tu usuario"
                      />
                    </InputGroup>
                  </FormControl>

                  {/* Email */}
                  <FormControl isRequired>
                    <FormLabel>Email</FormLabel>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="tu@email.com"
                    />
                  </FormControl>
                </VStack>
              </Box>

              {/* Información de Documento */}
              <Box w="full">
                <Heading size="md" color="blue.600" mb={4}>Documento de Identidad</Heading>
                <VStack spacing={4}>
                  {/* Tipo de Documento y Número en la misma fila */}
                  <HStack spacing={4} w="full">
                    <FormControl isRequired flex="1">
                      <FormLabel>Tipo de Documento</FormLabel>
                      <Select
                        name="documentType"
                        value={formData.documentType}
                        onChange={handleChange}
                      >
                        <option value="DNI">DNI</option>
                        <option value="RUC">RUC</option>
                      </Select>
                    </FormControl>

                    <FormControl isRequired flex="2">
                      <FormLabel>Número de Documento</FormLabel>
                      <Input
                        type="text"
                        name="documentNumber"
                        value={formData.documentNumber}
                        onChange={handleChange}
                        placeholder={formData.documentType === 'DNI' ? '12345678' : '12345678901'}
                        maxLength={formData.documentType === 'DNI' ? 8 : 11}
                      />
                    </FormControl>
                  </HStack>

                  {/* Teléfono */}
                  <FormControl isRequired>
                    <FormLabel>Teléfono</FormLabel>
                    <InputGroup>
                      <InputLeftElement pointerEvents="none">
                        <FaPhone color="gray.300" />
                      </InputLeftElement>
                      <Input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="999999999"
                      />
                    </InputGroup>
                  </FormControl>
                </VStack>
              </Box>

              {/* Información de Ubicación */}
              <Box w="full">
                <Heading size="md" color="blue.600" mb={4}>Ubicación</Heading>
                <VStack spacing={4}>
                  {/* Distrito */}
                  <FormControl isRequired>
                    <FormLabel>Distrito</FormLabel>
                    <Select
                      name="district"
                      value={formData.district}
                      onChange={handleChange}
                      placeholder="Selecciona tu distrito"
                    >
                      {districts.map(district => (
                        <option key={district.id} value={district.name}>
                          {district.name} - Flete: S/ {parseFloat(district.deliveryFee || 0).toFixed(2)}
                        </option>
                      ))}
                    </Select>
                  </FormControl>

                  {/* Dirección */}
                  <FormControl isRequired>
                    <FormLabel>Dirección</FormLabel>
                    <InputGroup>
                      <InputLeftElement pointerEvents="none">
                        <FaMapMarkerAlt color="gray.300" />
                      </InputLeftElement>
                      <Input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Calle, número, piso, etc."
                      />
                    </InputGroup>
                  </FormControl>

                  {/* Referencia */}
                  <FormControl>
                    <FormLabel>Referencia (opcional)</FormLabel>
                    <Textarea
                      name="reference"
                      value={formData.reference}
                      onChange={handleChange}
                      placeholder="Cerca de... (opcional)"
                      rows={2}
                    />
                  </FormControl>
                </VStack>
              </Box>

              {/* Información de Cliente */}
              <Box w="full">
                <Heading size="md" color="blue.600" mb={4}>Información de Cliente</Heading>
                <VStack spacing={4}>
                  {/* Estado del Cliente */}
                  <FormControl isRequired>
                    <FormLabel>Tipo de Cliente</FormLabel>
                    <Select
                      name="clientStatus"
                      value={formData.clientStatus}
                      onChange={handleChange}
                    >
                      <option value="nuevo">Nuevo Cliente</option>
                      <option value="activo">Cliente Antiguo/Activo</option>
                      <option value="retomando">Retomando el Servicio</option>
                    </Select>
                  </FormControl>

                  {/* Recomendaciones */}
                  <FormControl>
                    <FormLabel>Recomendaciones (opcional)</FormLabel>
                    <Textarea
                      name="recommendations"
                      value={formData.recommendations}
                      onChange={handleChange}
                      placeholder="¿Qué opina sobre nuestro servicio? ¿En qué podemos mejorar? (opcional)"
                      rows={3}
                    />
                  </FormControl>
                </VStack>
              </Box>

              {/* Información de Seguridad */}
              <Box w="full">
                <Heading size="md" color="blue.600" mb={4}>Seguridad</Heading>
                <VStack spacing={4}>
                  {/* Contraseña */}
                  <FormControl isRequired>
                    <FormLabel>Contraseña</FormLabel>
                    <InputGroup>
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Mínimo 6 caracteres"
                        autoComplete="new-password"
                      />
                      <InputRightElement>
                        <IconButton
                          aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                          icon={showPassword ? <FaEyeSlash /> : <FaEye />}
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowPassword(!showPassword)}
                        />
                      </InputRightElement>
                    </InputGroup>
                  </FormControl>

                  {/* Confirmar Contraseña */}
                  <FormControl isRequired>
                    <FormLabel>Confirmar Contraseña</FormLabel>
                    <InputGroup>
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Repite tu contraseña"
                        autoComplete="new-password"
                      />
                      <InputRightElement>
                        <IconButton
                          aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                          icon={showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        />
                      </InputRightElement>
                    </InputGroup>
                  </FormControl>
                </VStack>
              </Box>

              <Button
                type="submit"
                colorScheme="blue"
                size="lg"
                w="full"
                isLoading={loading}
                loadingText="Creando cuenta..."
                isDisabled={success}
              >
                {success ? 'Cuenta Creada ✓' : 'Crear Cuenta'}
              </Button>

              <Divider />

              <HStack spacing={1}>
                <Text fontSize="sm" color="gray.600">
                  ¿Ya tienes cuenta?
                </Text>
                <ChakraLink as="button" color="blue.500" onClick={() => navigate('/client-login')}>
                  Inicia sesión
                </ChakraLink>
              </HStack>
            </VStack>
          </form>
        </CardBody>
      </Card>
    </Box>
  );
};

export default ClientRegister;
