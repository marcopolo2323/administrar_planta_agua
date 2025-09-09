import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Heading,
  Text,
  VStack,
  HStack,
  Select,
  Input,
  FormControl,
  FormLabel,
  useToast,
  Alert,
  AlertIcon,
  Spinner,
  Center,
  SimpleGrid,
  useBreakpointValue,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Divider,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel
} from '@chakra-ui/react';
import { 
  FaChartLine,
  FaDollarSign,
  FaShoppingCart,
  FaTruck,
  FaUsers,
  FaCalendarAlt,
  FaDownload,
  FaBox,
  FaUserPlus,
  FaCheckCircle
} from 'react-icons/fa';
import useReportStore from '../stores/reportStore';
import AquaYaraLogo from '../components/AquaYaraLogo';
import AdminContact from '../components/AdminContact';

const Reports = () => {
  const [reportType, setReportType] = useState('sales');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const toast = useToast();
  const isMobile = useBreakpointValue({ base: true, md: false });

  // Store
  const {
    reportData,
    loading,
    error,
    generateReport,
    exportReport,
    clearError
  } = useReportStore();

  const reportTypes = [
    { value: 'sales', label: 'Ventas', icon: FaDollarSign },
    { value: 'orders', label: 'Pedidos', icon: FaShoppingCart },
    { value: 'deliveries', label: 'Entregas', icon: FaTruck },
    { value: 'customers', label: 'Clientes', icon: FaUsers },
    { value: 'products', label: 'Productos', icon: FaChartLine }
  ];

  useEffect(() => {
    // Establecer fechas por defecto (último mes)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);
    
    setDateRange({
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    });
  }, []);

  // Mostrar errores del store
  useEffect(() => {
    if (error) {
      toast({
        title: 'Error',
        description: error,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      clearError();
    }
  }, [error, toast, clearError]);

  const handleGenerateReport = async () => {
    if (!dateRange.startDate || !dateRange.endDate) {
      toast({
        title: 'Error',
        description: 'Selecciona un rango de fechas',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const result = await generateReport(reportType, dateRange.startDate, dateRange.endDate);
    if (!result.success) {
      toast({
        title: 'Error',
        description: 'No se pudo generar el reporte',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleExportReport = () => {
    if (!reportData) return;
    exportReport(reportType, dateRange.startDate, dateRange.endDate);
  };

  const getReportIcon = (type) => {
    const report = reportTypes.find(r => r.value === type);
    return report ? report.icon : FaChartLine;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  return (
    <Box p={6}>
      <Flex justify="space-between" align="center" mb={6}>
        <HStack spacing={4}>
          <AquaYaraLogo size="md" variant="horizontal" />
          <VStack align="start" spacing={0}>
            <Heading size="lg" color="gray.700">
              Reportes y Análisis
            </Heading>
            <Text color="gray.500" fontSize="sm">
              Análisis detallado del negocio
            </Text>
          </VStack>
        </HStack>
        <AdminContact variant="info" />
      </Flex>

      {/* Filtros */}
      <Card mb={6}>
        <CardHeader>
          <Heading size="md">Filtros del Reporte</Heading>
        </CardHeader>
        <CardBody>
          <VStack spacing={4}>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} w="full">
              <FormControl>
                <FormLabel>Tipo de Reporte</FormLabel>
                <Select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                >
                  {Array.isArray(reportTypes) ? reportTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  )) : null}
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Fecha Inicio</FormLabel>
                <Input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Fecha Fin</FormLabel>
                <Input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                />
              </FormControl>
            </SimpleGrid>

            <HStack spacing={4}>
              <Button
                colorScheme="blue"
                onClick={handleGenerateReport}
                isLoading={loading}
                leftIcon={<FaChartLine />}
              >
                Generar Reporte
              </Button>
              
              {reportData && (
                <Button
                  colorScheme="green"
                  onClick={handleExportReport}
                  leftIcon={<FaDownload />}
                >
                  Exportar CSV
                </Button>
              )}
            </HStack>
          </VStack>
        </CardBody>
      </Card>

      {/* Resultados del reporte */}
      {loading ? (
        <Center h="400px">
          <VStack spacing={4}>
            <Spinner size="xl" color="blue.500" />
            <Text color="gray.500">Generando reporte...</Text>
          </VStack>
        </Center>
      ) : reportData ? (
        <VStack spacing={6} align="stretch">
          {/* Resumen estadístico */}
          <Card>
            <CardHeader>
              <HStack justify="space-between" align="center">
                <Heading size="md">
                  📊 Resumen del Reporte - {reportTypes.find(r => r.value === reportType)?.label}
                </Heading>
                <Badge colorScheme="blue" variant="subtle">
                  {reportData.period ? `${reportData.period.start} - ${reportData.period.end}` : 'Período seleccionado'}
                </Badge>
              </HStack>
            </CardHeader>
            <CardBody>
              <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6}>
                <Stat>
                  <StatLabel color="green.600">💰 Total Ventas</StatLabel>
                  <StatNumber color="green.500" fontSize="2xl">
                    {formatCurrency(reportData.totalSales || 0)}
                  </StatNumber>
                  <StatHelpText>
                    <StatArrow type={reportData.growthPercentage >= 0 ? "increase" : "decrease"} />
                    {Math.abs(reportData.growthPercentage || 0).toFixed(1)}% vs período anterior
                  </StatHelpText>
                </Stat>

                <Stat>
                  <StatLabel color="blue.600">📦 Total Pedidos</StatLabel>
                  <StatNumber color="blue.500" fontSize="2xl">
                    {reportData.totalOrders || 0}
                  </StatNumber>
                  <StatHelpText>
                    Promedio: {reportData.averageOrderValue ? formatCurrency(reportData.averageOrderValue) : 'N/A'}
                  </StatHelpText>
                </Stat>

                <Stat>
                  <StatLabel color="purple.600">🚚 Entregas Completadas</StatLabel>
                  <StatNumber color="purple.500" fontSize="2xl">
                    {reportData.completedDeliveries || 0}
                  </StatNumber>
                  <StatHelpText>
                    Tasa de éxito: {(reportData.deliverySuccessRate || 0).toFixed(1)}%
                  </StatHelpText>
                </Stat>

                <Stat>
                  <StatLabel color="orange.600">👥 Nuevos Clientes</StatLabel>
                  <StatNumber color="orange.500" fontSize="2xl">
                    {reportData.newCustomers || 0}
                  </StatNumber>
                  <StatHelpText>
                    Total clientes: {reportData.totalCustomers || 0}
                  </StatHelpText>
                </Stat>
              </SimpleGrid>
            </CardBody>
          </Card>

          {/* Detalles del reporte con pestañas */}
          <Card>
            <CardHeader>
              <Heading size="md">📋 Detalles del Reporte</Heading>
            </CardHeader>
            <CardBody>
              <Tabs variant="enclosed" colorScheme="blue">
                <TabList>
                  <Tab>📊 Resumen</Tab>
                  <Tab>📦 Pedidos</Tab>
                  <Tab>👥 Clientes</Tab>
                  <Tab>📈 Productos</Tab>
                </TabList>
                
                <TabPanels>
                  <TabPanel>
                    {reportData.details && reportData.details.length > 0 ? (
                      <TableContainer>
                        <Table variant="simple" size="sm">
                          <Thead>
                            <Tr>
                              <Th>Fecha</Th>
                              <Th>Descripción</Th>
                              <Th isNumeric>Monto</Th>
                              <Th>Estado</Th>
                              <Th>Tipo</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {reportData.details.slice(0, 10).map((item, index) => (
                              <Tr key={index}>
                                <Td>{formatDate(item.date)}</Td>
                                <Td>{item.description}</Td>
                                <Td isNumeric>{formatCurrency(item.amount)}</Td>
                                <Td>
                                  <Badge 
                                    colorScheme={item.status === 'completed' ? 'green' : 'yellow'}
                                    variant="subtle"
                                  >
                                    {item.status === 'completed' ? 'Completado' : 'Pendiente'}
                                  </Badge>
                                </Td>
                                <Td>
                                  <Badge 
                                    colorScheme={item.type === 'regular' ? 'blue' : 'purple'}
                                    variant="outline"
                                  >
                                    {item.type === 'regular' ? 'Regular' : 'Visitante'}
                                  </Badge>
                                </Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Text color="gray.500" textAlign="center" py={8}>
                        No hay detalles disponibles para este período
                      </Text>
                    )}
                  </TabPanel>
                  
                  <TabPanel>
                    {reportData.orders && reportData.orders.length > 0 ? (
                      <TableContainer>
                        <Table variant="simple" size="sm">
                          <Thead>
                            <Tr>
                              <Th>ID</Th>
                              <Th>Cliente</Th>
                              <Th>Total</Th>
                              <Th>Estado</Th>
                              <Th>Repartidor</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {reportData.orders.slice(0, 10).map((order, index) => (
                              <Tr key={index}>
                                <Td>#{order.id}</Td>
                                <Td>{order.clientName}</Td>
                                <Td isNumeric>{formatCurrency(order.total)}</Td>
                                <Td>
                                  <Badge 
                                    colorScheme={
                                      order.status === 'entregado' ? 'green' : 
                                      order.status === 'en_camino' ? 'blue' : 'yellow'
                                    }
                                    variant="subtle"
                                  >
                                    {order.status}
                                  </Badge>
                                </Td>
                                <Td>{order.deliveryPerson || 'Sin asignar'}</Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Text color="gray.500" textAlign="center" py={8}>
                        No hay pedidos disponibles para este período
                      </Text>
                    )}
                  </TabPanel>
                  
                  <TabPanel>
                    {reportData.clients && reportData.clients.length > 0 ? (
                      <TableContainer>
                        <Table variant="simple" size="sm">
                          <Thead>
                            <Tr>
                              <Th>Cliente</Th>
                              <Th>Email</Th>
                              <Th>Pedidos</Th>
                              <Th isNumeric>Total Gastado</Th>
                              <Th>Último Pedido</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {reportData.clients.slice(0, 10).map((client, index) => (
                              <Tr key={index}>
                                <Td fontWeight="medium">{client.name}</Td>
                                <Td>{client.email}</Td>
                                <Td>{client.totalOrders}</Td>
                                <Td isNumeric>{formatCurrency(client.totalSpent)}</Td>
                                <Td>{client.lastOrderDate ? formatDate(client.lastOrderDate) : 'N/A'}</Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Text color="gray.500" textAlign="center" py={8}>
                        No hay clientes disponibles para este período
                      </Text>
                    )}
                  </TabPanel>
                  
                  <TabPanel>
                    {reportData.products && reportData.products.length > 0 ? (
                      <TableContainer>
                        <Table variant="simple" size="sm">
                          <Thead>
                            <Tr>
                              <Th>Producto</Th>
                              <Th>Cantidad Vendida</Th>
                              <Th isNumeric>Ingresos</Th>
                              <Th isNumeric>Precio Promedio</Th>
                              <Th>Pedidos</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {reportData.products.slice(0, 10).map((product, index) => (
                              <Tr key={index}>
                                <Td fontWeight="medium">{product.name}</Td>
                                <Td>{product.totalQuantity}</Td>
                                <Td isNumeric>{formatCurrency(product.totalRevenue)}</Td>
                                <Td isNumeric>{formatCurrency(product.averagePrice)}</Td>
                                <Td>{product.orders}</Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Text color="gray.500" textAlign="center" py={8}>
                        No hay productos disponibles para este período
                      </Text>
                    )}
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </CardBody>
          </Card>

          {/* Gráficos (placeholder) */}
          <Card>
            <CardHeader>
              <Heading size="md">📈 Análisis Visual</Heading>
            </CardHeader>
            <CardBody>
              <Center h="300px" bg="gradient-to-r" bgGradient="linear(to-r, blue.50, teal.50)" borderRadius="md" border="2px dashed" borderColor="blue.200">
                <VStack spacing={4}>
                  <AquaYaraLogo size="lg" variant="vertical" color="blue.500" textColor="blue.600" taglineColor="teal.500" />
                  <Text color="gray.600" textAlign="center" maxW="300px">
                    Los gráficos interactivos se implementarán próximamente con Chart.js para un análisis más detallado
                  </Text>
                  <Button colorScheme="blue" variant="outline" size="sm">
                    Próximamente
                  </Button>
                </VStack>
              </Center>
            </CardBody>
          </Card>
        </VStack>
      ) : (
        <Card>
          <CardBody>
            <Center py={12}>
              <VStack spacing={4}>
                <AquaYaraLogo size="xl" variant="vertical" color="gray.400" textColor="gray.500" taglineColor="gray.400" />
                <VStack spacing={2}>
                  <Text fontSize="lg" color="gray.600" fontWeight="medium">
                    📊 Genera tu primer reporte
                  </Text>
                  <Text color="gray.500" textAlign="center" maxW="400px">
                    Selecciona un tipo de reporte y un rango de fechas para comenzar el análisis de tu negocio
                  </Text>
                </VStack>
                <HStack spacing={4} mt={4}>
                  <Button colorScheme="blue" size="sm">
                    <FaChartLine style={{ marginRight: '8px' }} />
                    Generar Reporte
                  </Button>
                  <AdminContact variant="button" size="sm" />
                </HStack>
              </VStack>
            </Center>
          </CardBody>
        </Card>
      )}
    </Box>
  );
};

export default Reports;
