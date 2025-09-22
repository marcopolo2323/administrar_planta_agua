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
  Badge,
  SimpleGrid,
  useToast,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Tag,
  TagLabel,
  TagLeftIcon,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Alert,
  AlertIcon,
  Spinner,
  Center,
  useColorModeValue,
  Divider,
  IconButton,
  Tooltip,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure
} from '@chakra-ui/react';
import {
  FaMoneyBillWave,
  FaUsers,
  FaCalendarAlt,
  FaFileAlt,
  FaDownload,
  FaEye,
  FaPhone,
  FaEnvelope,
  FaIdCard
} from 'react-icons/fa';
import axios from '../utils/axios';

const CollectionReport = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedClient, setSelectedClient] = useState(null);
  
  const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure();
  
  const toast = useToast();
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    fetchReport();
  }, [selectedYear, selectedMonth]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/reports/collection?year=${selectedYear}&month=${selectedMonth}`);
      
      if (response.data.success) {
        console.log('🔍 Datos del reporte de cobranza recibidos:', response.data.data);
        if (response.data.data.clients && response.data.data.clients.length > 0) {
          console.log('🔍 Primer cliente:', response.data.data.clients[0]);
        }
        setReportData(response.data.data);
      }
    } catch (error) {
      console.error('Error al cargar reporte:', error);
      toast({
        title: 'Error',
        description: 'No se pudo cargar el reporte de cobranza',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const getMonthName = (month) => {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return months[month - 1];
  };

  const formatCurrency = (amount) => {
    const numericAmount = parseFloat(amount) || 0;
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(numericAmount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const handleViewClientDetails = (client) => {
    setSelectedClient(client);
    onDetailOpen();
  };

  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear; i >= currentYear - 2; i--) {
      years.push(i);
    }
    return years;
  };

  const months = [
    { value: 1, label: 'Enero' },
    { value: 2, label: 'Febrero' },
    { value: 3, label: 'Marzo' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Mayo' },
    { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Septiembre' },
    { value: 10, label: 'Octubre' },
    { value: 11, label: 'Noviembre' },
    { value: 12, label: 'Diciembre' }
  ];

  if (loading) {
    return (
      <Center h="400px">
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
          <Box>
            <Heading size="lg" mb={2}>
              <HStack>
                <FaFileAlt />
                <Text>Reporte de Cobranza Mensual</Text>
              </HStack>
            </Heading>
            <Text color="gray.600">
              Total de deudas por cliente en vales pendientes de pago
            </Text>
          </Box>
          <Button
            leftIcon={<FaDownload />}
            colorScheme="blue"
            variant="outline"
            onClick={fetchReport}
            isLoading={loading}
          >
            Actualizar
          </Button>
        </Flex>

        {/* Filtros */}
        <Card bg={cardBg} borderColor={borderColor}>
          <CardBody>
            <HStack spacing={4} wrap="wrap">
              <Select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                maxW="150px"
              >
                {generateYears().map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </Select>
              <Select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                maxW="200px"
              >
                {months.map(month => (
                  <option key={month.value} value={month.value}>{month.label}</option>
                ))}
              </Select>
            </HStack>
          </CardBody>
        </Card>

        {reportData ? (
          <>
            {/* Resumen */}
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
              <Card bg={cardBg} borderColor={borderColor}>
                <CardBody>
                  <Stat>
                    <StatLabel>Período</StatLabel>
                    <StatNumber fontSize="lg">
                      {getMonthName(reportData.period.month)} {reportData.period.year}
                    </StatNumber>
                    <StatHelpText>
                      <FaCalendarAlt style={{ display: 'inline', marginRight: '4px' }} />
                      Reporte mensual
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>

              <Card bg={cardBg} borderColor={borderColor}>
                <CardBody>
                  <Stat>
                    <StatLabel>Clientes con Deuda</StatLabel>
                    <StatNumber color="orange.500">
                      {reportData.summary.totalClients}
                    </StatNumber>
                    <StatHelpText>
                      <FaUsers style={{ display: 'inline', marginRight: '4px' }} />
                      Clientes pendientes
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>

              <Card bg={cardBg} borderColor={borderColor}>
                <CardBody>
                  <Stat>
                    <StatLabel>Total a Cobrar</StatLabel>
                    <StatNumber color="red.500">
                      {formatCurrency(reportData.summary.totalDebt)}
                    </StatNumber>
                    <StatHelpText>
                      <FaMoneyBillWave style={{ display: 'inline', marginRight: '4px' }} />
                      Monto total
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
            </SimpleGrid>

            {/* Lista de clientes */}
            <Card bg={cardBg} borderColor={borderColor}>
              <CardHeader>
                <Heading size="md">Clientes con Deuda Pendiente</Heading>
              </CardHeader>
              <CardBody>
                {reportData.clients.length === 0 ? (
                  <Alert status="success">
                    <AlertIcon />
                    <Text>¡Excelente! No hay deudas pendientes para este período.</Text>
                  </Alert>
                ) : (
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Cliente</Th>
                        <Th>Contacto</Th>
                        <Th>Total Deuda</Th>
                        <Th>Vales</Th>
                        <Th>Acciones</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {(reportData.clients || []).map((clientData) => {
                        console.log('🔍 Renderizando cliente:', {
                          name: clientData.client.name,
                          remainingAmount: clientData.remainingAmount,
                          totalAmount: clientData.totalAmount,
                          valesCount: clientData.valesCount
                        });
                        return (
                        <Tr key={clientData.client.id}>
                          <Td>
                            <VStack align="start" spacing={1}>
                              <Text fontWeight="bold">{clientData.client.name}</Text>
                              <Text fontSize="sm" color="gray.600">
                                DNI: {clientData.client.documentNumber}
                              </Text>
                            </VStack>
                          </Td>
                          <Td>
                            <VStack align="start" spacing={1}>
                              <HStack>
                                <FaPhone size={12} color="#718096" />
                                <Text fontSize="sm">{clientData.client.phone}</Text>
                              </HStack>
                              <HStack>
                                <FaEnvelope size={12} color="#718096" />
                                <Text fontSize="sm">{clientData.client.email}</Text>
                              </HStack>
                            </VStack>
                          </Td>
                          <Td>
                            <VStack align="start" spacing={1}>
                              <Text fontWeight="bold" color="red.600" fontSize="lg">
                                {formatCurrency(clientData.remainingAmount || 0)}
                              </Text>
                              <Text fontSize="xs" color="gray.500">
                                De {formatCurrency(clientData.totalAmount || 0)} total
                              </Text>
                            </VStack>
                          </Td>
                          <Td>
                            <Tag colorScheme="blue">
                              <TagLabel>{clientData.valesCount || 0} vales</TagLabel>
                            </Tag>
                          </Td>
                          <Td>
                            <Tooltip label="Ver detalles de vales">
                              <IconButton
                                size="sm"
                                icon={<FaEye />}
                                onClick={() => handleViewClientDetails(clientData)}
                              />
                            </Tooltip>
                          </Td>
                        </Tr>
                        );
                      })}
                    </Tbody>
                  </Table>
                )}
              </CardBody>
            </Card>
          </>
        ) : (
          <Alert status="info">
            <AlertIcon />
            <Text>Selecciona un período para generar el reporte de cobranza.</Text>
          </Alert>
        )}

        {/* Modal de detalles del cliente */}
        <Modal isOpen={isDetailOpen} onClose={onDetailClose} size="lg" isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Detalles de Vales - {selectedClient?.client.name}</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              {selectedClient && (
                <VStack spacing={4} align="stretch">
                  <HStack justify="space-between">
                    <Text fontWeight="bold">Cliente:</Text>
                    <Text>{selectedClient.client.name}</Text>
                  </HStack>
                  
                  <HStack justify="space-between">
                    <Text fontWeight="bold">Total Deuda:</Text>
                    <Text color="red.600" fontWeight="bold" fontSize="lg">
                      {formatCurrency(selectedClient.remainingAmount)}
                    </Text>
                  </HStack>
                  
                  <Divider />
                  
                  <Text fontWeight="bold">Detalle de Vales:</Text>
                  
                  {(selectedClient.vouchers || selectedClient.vales || []).map((vale, index) => (
                    <Card key={vale.id} variant="outline" size="sm">
                      <CardBody>
                        <VStack spacing={2} align="stretch">
                          <HStack justify="space-between">
                            <Text fontWeight="bold">Vale #{vale.id}</Text>
                            <Text fontSize="sm" color="gray.500">
                              {formatDate(vale.createdAt)}
                            </Text>
                          </HStack>
                          
                          <HStack justify="space-between">
                            <Text fontSize="sm">Monto Original:</Text>
                            <Text fontSize="sm">{formatCurrency(vale.amount)}</Text>
                          </HStack>
                          
                          <HStack justify="space-between">
                            <Text fontSize="sm">Usado:</Text>
                            <Text fontSize="sm" color="green.600">
                              {formatCurrency(vale.usedAmount)}
                            </Text>
                          </HStack>
                          
                          <HStack justify="space-between">
                            <Text fontSize="sm" fontWeight="bold">Pendiente:</Text>
                            <Text fontSize="sm" fontWeight="bold" color="red.600">
                              {formatCurrency(vale.remainingAmount)}
                            </Text>
                          </HStack>
                          
                          {vale.description && (
                            <Text fontSize="xs" color="gray.500">
                              {vale.description}
                            </Text>
                          )}
                        </VStack>
                      </CardBody>
                    </Card>
                  ))}
                </VStack>
              )}
            </ModalBody>
          </ModalContent>
        </Modal>
      </VStack>
    </Box>
  );
};

export default CollectionReport;
