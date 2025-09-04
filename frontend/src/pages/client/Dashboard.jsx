import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Button,
  Flex,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Badge,
  Spinner,
  useColorModeValue,
  Stack,
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import OrderCard from '../../components/client/OrderCard';
import ProductCard from '../../components/client/ProductCard';

const Dashboard = () => {
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tabIndex, setTabIndex] = useState(0);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const clientData = localStorage.getItem('client');
    
    if (!token || !clientData) {
      navigate('/client/login');
      return;
    }
    
    setClient(JSON.parse(clientData));
    
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Configuración de headers con token
        const config = {
          headers: { Authorization: `Bearer ${token}` }
        };
        
        // Obtener pedidos del cliente
        const ordersResponse = await axios.get(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/orders/client`,
          config
        );
        
        // Obtener productos disponibles
        const productsResponse = await axios.get(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/products`,
          config
        );
        
        setOrders(ordersResponse.data);
        setProducts(productsResponse.data);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        toast.error('Error al cargar los datos. Por favor, intenta de nuevo.');
        
        // Si hay un error de autenticación, redirigir al login
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
    
    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('client');
    navigate('/client/login');
    toast.info('Has cerrado sesión correctamente');
  };

  const handleNewOrder = () => {
    navigate('/client/new-order');
  };

  const handleTabsChange = (index) => {
    setTabIndex(index);
  };

  if (isLoading) {
    return (
      <Flex justify="center" align="center" height="100vh">
        <Spinner size="xl" color="blue.500" />
      </Flex>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <Flex direction="column" gap={6}>
        <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
          <Box>
            <Heading size="lg">Bienvenido, {client?.name}</Heading>
            <Text color="gray.600" mt={1}>
              Gestiona tus pedidos de agua a domicilio
            </Text>
          </Box>
          
          <Flex gap={4}>
            <Button
              leftIcon={<AddIcon />}
              colorScheme="blue"
              onClick={handleNewOrder}
            >
              Nuevo Pedido
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              Cerrar Sesión
            </Button>
          </Flex>
        </Flex>

        <Box
          bg={bgColor}
          borderRadius="lg"
          borderWidth="1px"
          borderColor={borderColor}
          overflow="hidden"
        >
          <Tabs isFitted variant="enclosed" index={tabIndex} onChange={handleTabsChange}>
            <TabList>
              <Tab>Mis Pedidos</Tab>
              <Tab>Productos Disponibles</Tab>
              <Tab>Mi Perfil</Tab>
            </TabList>

            <TabPanels>
              {/* Panel de Pedidos */}
              <TabPanel>
                {orders.length > 0 ? (
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} py={4}>
                    {orders.map((order) => (
                      <OrderCard key={order.id} order={order} />
                    ))}
                  </SimpleGrid>
                ) : (
                  <Flex
                    direction="column"
                    align="center"
                    justify="center"
                    py={10}
                    px={6}
                    textAlign="center"
                  >
                    <Text fontSize="xl" mb={4}>
                      No tienes pedidos activos
                    </Text>
                    <Button
                      colorScheme="blue"
                      leftIcon={<AddIcon />}
                      onClick={handleNewOrder}
                    >
                      Realizar tu primer pedido
                    </Button>
                  </Flex>
                )}
              </TabPanel>

              {/* Panel de Productos */}
              <TabPanel>
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} py={4}>
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </SimpleGrid>
              </TabPanel>

              {/* Panel de Perfil */}
              <TabPanel>
                <Box
                  borderWidth="1px"
                  borderRadius="lg"
                  p={6}
                  maxW="container.md"
                  mx="auto"
                >
                  <Stack spacing={4}>
                    <Heading size="md">Información Personal</Heading>
                    
                    <Flex direction={{ base: 'column', md: 'row' }} gap={4}>
                      <Box flex={1}>
                        <Text fontWeight="bold">Nombre:</Text>
                        <Text>{client?.name}</Text>
                      </Box>
                      <Box flex={1}>
                        <Text fontWeight="bold">Documento:</Text>
                        <Text>{client?.documentType} {client?.documentNumber}</Text>
                      </Box>
                    </Flex>
                    
                    <Flex direction={{ base: 'column', md: 'row' }} gap={4}>
                      <Box flex={1}>
                        <Text fontWeight="bold">Correo electrónico:</Text>
                        <Text>{client?.email}</Text>
                      </Box>
                      <Box flex={1}>
                        <Text fontWeight="bold">Teléfono:</Text>
                        <Text>{client?.phone}</Text>
                      </Box>
                    </Flex>
                    
                    <Box>
                      <Text fontWeight="bold">Dirección de entrega:</Text>
                      <Text>{client?.defaultDeliveryAddress}</Text>
                    </Box>
                    
                    {client?.district && (
                      <Box>
                        <Text fontWeight="bold">Distrito:</Text>
                        <Text>{client?.district}</Text>
                      </Box>
                    )}
                    
                    <Flex justify="flex-end" mt={4}>
                      <Button
                        colorScheme="blue"
                        variant="outline"
                        onClick={() => navigate('/client/profile/edit')}
                      >
                        Editar Perfil
                      </Button>
                    </Flex>
                  </Stack>
                </Box>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </Flex>
    </Container>
  );
};

export default Dashboard;