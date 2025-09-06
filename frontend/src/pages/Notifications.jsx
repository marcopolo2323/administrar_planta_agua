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
  Input,
  InputGroup,
  InputLeftElement,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Spinner,
  Center,
  SimpleGrid,
  useBreakpointValue,
  Badge,
  Divider,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  Select
} from '@chakra-ui/react';
import { 
  SearchIcon, 
  DeleteIcon, 
  CheckIcon, 
  ViewIcon,
  ChevronDownIcon,
  BellIcon
} from '@chakra-ui/icons';
import useNotificationStore from '../stores/notificationStore';

const Notifications = () => {
  // Store
  const {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createTestNotification,
    getUnreadNotifications,
    getNotificationsByType,
    clearError
  } = useNotificationStore();

  // Estados locales
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const isMobile = useBreakpointValue({ base: true, md: false });

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

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

  const handleMarkAsRead = async (notificationId) => {
    const result = await markAsRead(notificationId);
    if (result.success) {
      toast({
        title: 'Notificación marcada como leída',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    const result = await markAllAsRead();
    if (result.success) {
      toast({
        title: 'Todas las notificaciones marcadas como leídas',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta notificación?')) {
      const result = await deleteNotification(notificationId);
      if (result.success) {
        toast({
          title: 'Notificación eliminada',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      }
    }
  };

  const handleCreateTestNotification = async () => {
    const result = await createTestNotification();
    if (result.success) {
      toast({
        title: 'Notificación de prueba creada',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'new_order':
        return 'blue';
      case 'order_status_update':
        return 'green';
      case 'payment_update':
        return 'purple';
      case 'delivery_assigned':
        return 'orange';
      default:
        return 'gray';
    }
  };

  const getTypeText = (type) => {
    switch (type) {
      case 'new_order':
        return 'Nuevo Pedido';
      case 'order_status_update':
        return 'Actualización de Estado';
      case 'payment_update':
        return 'Actualización de Pago';
      case 'delivery_assigned':
        return 'Repartidor Asignado';
      default:
        return type;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'new_order':
        return '🛒';
      case 'order_status_update':
        return '📦';
      case 'payment_update':
        return '💳';
      case 'delivery_assigned':
        return '🚚';
      default:
        return '🔔';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || notification.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'read' && notification.read) ||
                         (statusFilter === 'unread' && !notification.read);
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Hace unos minutos';
    } else if (diffInHours < 24) {
      return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <Center h="400px">
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <Box p={6}>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg" color="gray.700">
          Centro de Notificaciones
        </Heading>
        <HStack spacing={2}>
          <Button
            leftIcon={<BellIcon />}
            colorScheme="blue"
            variant="outline"
            onClick={handleCreateTestNotification}
          >
            Crear Prueba
          </Button>
          {unreadCount > 0 && (
            <Button
              leftIcon={<CheckIcon />}
              colorScheme="green"
              onClick={handleMarkAllAsRead}
            >
              Marcar Todas como Leídas
            </Button>
          )}
        </HStack>
      </Flex>

      {/* Estadísticas */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={6}>
        <Card>
          <CardBody>
            <Text fontSize="sm" color="gray.600">Total Notificaciones</Text>
            <Text fontSize="2xl" fontWeight="bold" color="blue.600">
              {notifications.length}
            </Text>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Text fontSize="sm" color="gray.600">Sin Leer</Text>
            <Text fontSize="2xl" fontWeight="bold" color="red.600">
              {unreadCount}
            </Text>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Text fontSize="sm" color="gray.600">Leídas</Text>
            <Text fontSize="2xl" fontWeight="bold" color="green.600">
              {notifications.length - unreadCount}
            </Text>
          </CardBody>
        </Card>
      </SimpleGrid>

      <Card>
        <CardHeader>
          <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
            <Heading size="md">Notificaciones</Heading>
            <HStack spacing={4}>
              <Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                maxW="200px"
              >
                <option value="all">Todos los tipos</option>
                <option value="new_order">Nuevo Pedido</option>
                <option value="order_status_update">Actualización de Estado</option>
                <option value="payment_update">Actualización de Pago</option>
                <option value="delivery_assigned">Repartidor Asignado</option>
              </Select>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                maxW="150px"
              >
                <option value="all">Todas</option>
                <option value="unread">Sin leer</option>
                <option value="read">Leídas</option>
              </Select>
              <InputGroup maxW="300px">
                <InputLeftElement pointerEvents="none">
                  <SearchIcon color="gray.300" />
                </InputLeftElement>
                <Input
                  placeholder="Buscar notificaciones..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </HStack>
          </Flex>
        </CardHeader>
        <CardBody>
          {filteredNotifications.length === 0 ? (
            <Alert status="info">
              <AlertIcon />
              <AlertTitle>No hay notificaciones!</AlertTitle>
              <AlertDescription>
                {searchTerm || typeFilter !== 'all' || statusFilter !== 'all'
                  ? 'No se encontraron notificaciones con los filtros aplicados.'
                  : 'No hay notificaciones registradas.'
                }
              </AlertDescription>
            </Alert>
          ) : (
            <VStack spacing={3}>
              {filteredNotifications.map((notification) => (
                <Card
                  key={notification._id}
                  w="full"
                  variant="outline"
                  bg={notification.read ? 'white' : 'blue.50'}
                  borderColor={notification.read ? 'gray.200' : 'blue.200'}
                >
                  <CardBody>
                    <HStack spacing={4} align="start">
                      <Text fontSize="2xl">
                        {getTypeIcon(notification.type)}
                      </Text>
                      <VStack align="start" spacing={2} flex={1}>
                        <HStack justify="space-between" w="full">
                          <Text fontWeight="bold" fontSize="lg">
                            {notification.title}
                          </Text>
                          <HStack spacing={2}>
                            <Badge colorScheme={getTypeColor(notification.type)}>
                              {getTypeText(notification.type)}
                            </Badge>
                            {!notification.read && (
                              <Badge colorScheme="red" size="sm">
                                Nuevo
                              </Badge>
                            )}
                          </HStack>
                        </HStack>
                        
                        <Text color="gray.600">
                          {notification.message}
                        </Text>
                        
                        <HStack justify="space-between" w="full">
                          <Text fontSize="sm" color="gray.500">
                            {formatDate(notification.createdAt)}
                          </Text>
                          <HStack spacing={2}>
                            {!notification.read && (
                              <Button
                                size="sm"
                                leftIcon={<CheckIcon />}
                                colorScheme="green"
                                variant="outline"
                                onClick={() => handleMarkAsRead(notification._id)}
                              >
                                Marcar como leída
                              </Button>
                            )}
                            <Button
                              size="sm"
                              leftIcon={<DeleteIcon />}
                              colorScheme="red"
                              variant="outline"
                              onClick={() => handleDeleteNotification(notification._id)}
                            >
                              Eliminar
                            </Button>
                          </HStack>
                        </HStack>
                      </VStack>
                    </HStack>
                  </CardBody>
                </Card>
              ))}
            </VStack>
          )}
        </CardBody>
      </Card>
    </Box>
  );
};

export default Notifications;
