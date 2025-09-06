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
  Divider
} from '@chakra-ui/react';
import { 
  FaChartLine,
  FaDollarSign,
  FaShoppingCart,
  FaTruck,
  FaUsers,
  FaCalendarAlt,
  FaDownload
} from 'react-icons/fa';
import useReportStore from '../stores/reportStore';

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
      <Heading size="lg" color="gray.700" mb={6}>
        Reportes y Análisis
      </Heading>

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
          <Spinner size="xl" />
        </Center>
      ) : reportData ? (
        <VStack spacing={6} align="stretch">
          {/* Resumen estadístico */}
          <Card>
            <CardHeader>
              <Heading size="md">
                Resumen del Reporte - {reportTypes.find(r => r.value === reportType)?.label}
              </Heading>
            </CardHeader>
            <CardBody>
              <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6}>
                <Stat>
                  <StatLabel>Total Ventas</StatLabel>
                  <StatNumber color="green.500">
                    {formatCurrency(reportData.totalSales || 0)}
                  </StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    {reportData.growthPercentage || 0}% vs período anterior
                  </StatHelpText>
                </Stat>

                <Stat>
                  <StatLabel>Total Pedidos</StatLabel>
                  <StatNumber color="blue.500">
                    {reportData.totalOrders || 0}
                  </StatNumber>
                  <StatHelpText>
                    Promedio: {reportData.averageOrderValue ? formatCurrency(reportData.averageOrderValue) : 'N/A'}
                  </StatHelpText>
                </Stat>

                <Stat>
                  <StatLabel>Entregas Completadas</StatLabel>
                  <StatNumber color="purple.500">
                    {reportData.completedDeliveries || 0}
                  </StatNumber>
                  <StatHelpText>
                    Tasa de éxito: {reportData.deliverySuccessRate || 0}%
                  </StatHelpText>
                </Stat>

                <Stat>
                  <StatLabel>Nuevos Clientes</StatLabel>
                  <StatNumber color="orange.500">
                    {reportData.newCustomers || 0}
                  </StatNumber>
                  <StatHelpText>
                    Total clientes: {reportData.totalCustomers || 0}
                  </StatHelpText>
                </Stat>
              </SimpleGrid>
            </CardBody>
          </Card>

          {/* Tabla de detalles */}
          {reportData.details && reportData.details.length > 0 && (
            <Card>
              <CardHeader>
                <Heading size="md">Detalles del Reporte</Heading>
              </CardHeader>
              <CardBody>
                <TableContainer>
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        <Th>Fecha</Th>
                        <Th>Descripción</Th>
                        <Th isNumeric>Monto</Th>
                        <Th>Estado</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {Array.isArray(reportData.details) ? reportData.details.map((item, index) => (
                        <Tr key={index}>
                          <Td>{formatDate(item.date)}</Td>
                          <Td>{item.description}</Td>
                          <Td isNumeric>{formatCurrency(item.amount)}</Td>
                          <Td>
                            <Badge colorScheme={item.status === 'completed' ? 'green' : 'yellow'}>
                              {item.status}
                            </Badge>
                          </Td>
                        </Tr>
                      )) : null}
                    </Tbody>
                  </Table>
                </TableContainer>
              </CardBody>
            </Card>
          )}

          {/* Gráficos (placeholder) */}
          <Card>
            <CardHeader>
              <Heading size="md">Análisis Visual</Heading>
            </CardHeader>
            <CardBody>
              <Center h="300px" bg="gray.50" borderRadius="md">
                <VStack>
                  <FaChartLine size="48px" color="gray.400" />
                  <Text color="gray.500">
                    Los gráficos se implementarán con una librería como Chart.js
                  </Text>
                </VStack>
              </Center>
            </CardBody>
          </Card>
        </VStack>
      ) : (
        <Alert status="info">
          <AlertIcon />
          Selecciona un tipo de reporte y un rango de fechas para generar el análisis.
        </Alert>
      )}
    </Box>
  );
};

export default Reports;
