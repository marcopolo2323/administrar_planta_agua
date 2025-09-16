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
  Alert,
  AlertIcon,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Tag,
  TagLabel,
  TagLeftIcon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Divider
} from '@chakra-ui/react';
import { 
  FaExclamationTriangle, 
  FaClock, 
  FaCheckCircle, 
  FaInfoCircle,
  FaMoneyBillWave,
  FaUser,
  FaCalendarAlt,
  FaPhone
} from 'react-icons/fa';
import axios from '../utils/axios';

const AlertsManagement = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure();
  const [selectedAlert, setSelectedAlert] = useState(null);
  
  const toast = useToast();

  useEffect(() => {
    fetchAlerts();
    
    // Actualizar cada 30 segundos
    const interval = setInterval(() => {
      fetchAlerts();
      setLastUpdate(new Date());
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/alerts/admin');
      if (response.data.success) {
        setAlerts(response.data.data || []);
      }
    } catch (error) {
      console.error('Error al cargar alertas:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las alertas',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'yellow';
      case 'info': return 'blue';
      default: return 'gray';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'urgent': return FaExclamationTriangle;
      case 'high': return FaClock;
      case 'medium': return FaInfoCircle;
      case 'info': return FaCheckCircle;
      default: return FaInfoCircle;
    }
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case 'urgent': return 'Urgente';
      case 'high': return 'Alta';
      case 'medium': return 'Media';
      case 'info': return 'Info';
      default: return priority;
    }
  };

  const handleAlertClick = (alert) => {
    setSelectedAlert(alert);
    onDetailOpen();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="center">
          <Box>
            <Heading size="lg" mb={2}>
              Centro de Alertas
            </Heading>
            <Text color="gray.600">
              Monitoreo de vales, preferencias y pagos pendientes
            </Text>
            <Text color="gray.400" fontSize="xs">
              Última actualización: {lastUpdate.toLocaleTimeString()}
            </Text>
          </Box>
          <Button
            size="sm"
            colorScheme="blue"
            variant="outline"
            onClick={() => {
              fetchAlerts();
              setLastUpdate(new Date());
            }}
            isLoading={loading}
          >
            Actualizar
          </Button>
        </Flex>

        {/* Resumen de Alertas */}
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={4}>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Total Alertas</StatLabel>
                <StatNumber color="blue.500">{alerts.length}</StatNumber>
                <StatHelpText>Alertas activas</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Urgentes</StatLabel>
                <StatNumber color="red.500">
                  {alerts.filter(a => a.priority === 'urgent').length}
                </StatNumber>
                <StatHelpText>Requieren atención inmediata</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Alta Prioridad</StatLabel>
                <StatNumber color="orange.500">
                  {alerts.filter(a => a.priority === 'high').length}
                </StatNumber>
                <StatHelpText>Próximos a vencer</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Informativas</StatLabel>
                <StatNumber color="green.500">
                  {alerts.filter(a => a.priority === 'info').length}
                </StatNumber>
                <StatHelpText>Resúmenes y estadísticas</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Lista de Alertas */}
        <Card>
          <CardHeader>
            <Heading size="md">Alertas Activas</Heading>
          </CardHeader>
          <CardBody>
            {alerts.length === 0 ? (
              <Alert status="success">
                <AlertIcon />
                No hay alertas activas
              </Alert>
            ) : (
              <VStack spacing={4} align="stretch">
                {alerts.map((alert, index) => (
                  <Card 
                    key={index} 
                    variant="outline" 
                    cursor="pointer"
                    onClick={() => handleAlertClick(alert)}
                    _hover={{ bg: 'gray.50' }}
                  >
                    <CardBody>
                      <HStack justify="space-between" align="start">
                        <HStack spacing={4}>
                          <Tag colorScheme={getPriorityColor(alert.priority)}>
                            <TagLeftIcon as={getPriorityIcon(alert.priority)} />
                            <TagLabel>{getPriorityText(alert.priority)}</TagLabel>
                          </Tag>
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="bold" fontSize="lg">
                              {alert.title}
                            </Text>
                            <Text color="gray.600">
                              {alert.message}
                            </Text>
                            {alert.count > 0 && (
                              <Text fontSize="sm" color="blue.600">
                                {alert.count} elemento(s)
                              </Text>
                            )}
                          </VStack>
                        </HStack>
                        <Text fontSize="sm" color="gray.500">
                          Ver detalles →
                        </Text>
                      </HStack>
                    </CardBody>
                  </Card>
                ))}
              </VStack>
            )}
          </CardBody>
        </Card>
      </VStack>

      {/* Modal de Detalles */}
      <Modal isOpen={isDetailOpen} onClose={onDetailClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedAlert?.title}
            <Tag ml={2} colorScheme={getPriorityColor(selectedAlert?.priority)}>
              <TagLeftIcon as={getPriorityIcon(selectedAlert?.priority)} />
              <TagLabel>{getPriorityText(selectedAlert?.priority)}</TagLabel>
            </Tag>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedAlert && (
              <VStack spacing={4} align="stretch">
                <Text>{selectedAlert.message}</Text>
                
                {selectedAlert.data && Array.isArray(selectedAlert.data) && (
                  <Box>
                    <Text fontWeight="bold" mb={3}>Detalles:</Text>
                    <Table variant="simple" size="sm">
                      <Thead>
                        <Tr>
                          <Th>Cliente</Th>
                          <Th>Monto</Th>
                          <Th>Estado</Th>
                          <Th>Fecha</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {selectedAlert.data.slice(0, 10).map((item, idx) => (
                          <Tr key={idx}>
                            <Td>
                              <HStack>
                                <FaUser size={12} color="#718096" />
                                <Text>{item.client?.name || 'N/A'}</Text>
                              </HStack>
                            </Td>
                            <Td>
                              <Text fontWeight="bold">
                                S/ {parseFloat(item.amount || item.totalAmount || 0).toFixed(2)}
                              </Text>
                            </Td>
                            <Td>
                              <Tag colorScheme={item.status === 'active' ? 'green' : 'red'}>
                                {item.status || 'Activo'}
                              </Tag>
                            </Td>
                            <Td>
                              <Text fontSize="sm">
                                {formatDate(item.dueDate || item.validUntil || item.createdAt)}
                              </Text>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                    {selectedAlert.data.length > 10 && (
                      <Text fontSize="sm" color="gray.500" mt={2}>
                        ... y {selectedAlert.data.length - 10} más
                      </Text>
                    )}
                  </Box>
                )}
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default AlertsManagement;
