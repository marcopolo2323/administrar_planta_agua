import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useToast, Box, VStack, Heading, Text, Flex, Badge, IconButton, Drawer, DrawerBody, DrawerHeader, DrawerOverlay, DrawerContent, DrawerCloseButton, useDisclosure, Button, Spinner } from '@chakra-ui/react';
import { BellIcon, CheckIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const navigate = useNavigate();

  // Obtener el rol del usuario desde localStorage
  const userRole = localStorage.getItem('userRole');
  
  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/notifications`,
        config
      );

      setNotifications(response.data);
      
      // Contar notificaciones no leídas
      const unread = response.data.filter(notification => !notification.read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error al cargar notificaciones:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    
    // Configurar intervalo para verificar nuevas notificaciones cada minuto
    const intervalId = setInterval(fetchNotifications, 60000);
    
    return () => clearInterval(intervalId);
  }, [fetchNotifications]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      await axios.put(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/notifications/${notificationId}/read`,
        {},
        config
      );

      // Actualizar estado local
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true } 
            : notification
        )
      );
      
      // Actualizar contador de no leídas
      setUnreadCount(prevCount => Math.max(0, prevCount - 1));
    } catch (error) {
      console.error('Error al marcar notificación como leída:', error);
      toast({
        title: 'Error',
        description: 'No se pudo marcar la notificación como leída',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      await axios.put(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/notifications/mark-all-read`,
        {},
        config
      );

      // Actualizar estado local
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => ({ ...notification, read: true }))
      );
      
      // Actualizar contador de no leídas
      setUnreadCount(0);
      
      toast({
        title: 'Éxito',
        description: 'Todas las notificaciones marcadas como leídas',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error al marcar todas las notificaciones como leídas:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron marcar todas las notificaciones como leídas',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleNotificationClick = (notification) => {
    // Marcar como leída
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }
    
    // Navegar según el tipo de notificación
    if (notification.type === 'new_order') {
      // Administrador va a gestión de pedidos, cliente va a detalles de su pedido
      if (userRole === 'admin') {
        navigate('/dashboard/orders');
      } else if (userRole === 'client') {
        navigate(`/client/orders/${notification.orderId}`);
      } else if (userRole === 'repartidor') {
        navigate('/delivery/orders');
      }
    } else if (notification.type === 'order_status_update') {
      // Navegar a los detalles del pedido
      if (userRole === 'admin') {
        navigate('/dashboard/orders');
      } else if (userRole === 'client') {
        navigate(`/client/orders/${notification.orderId}`);
      } else if (userRole === 'repartidor') {
        navigate(`/delivery/orders/${notification.orderId}`);
      }
    } else if (notification.type === 'payment_update') {
      // Navegar a los detalles del pedido
      if (userRole === 'admin') {
        navigate('/dashboard/orders');
      } else if (userRole === 'client') {
        navigate(`/client/orders/${notification.orderId}`);
      }
    } else if (notification.type === 'delivery_assigned') {
      // Repartidor va a sus pedidos asignados
      if (userRole === 'repartidor') {
        navigate('/delivery/orders');
      }
    }
    
    // Cerrar el drawer después de navegar
    onClose();
  };

  const getNotificationBadge = (type) => {
    const typeMap = {
      'new_order': { color: 'blue', text: 'Nuevo Pedido' },
      'order_status_update': { color: 'purple', text: 'Actualización' },
      'payment_update': { color: 'green', text: 'Pago' },
      'delivery_assigned': { color: 'orange', text: 'Asignación' },
    };
    
    const typeInfo = typeMap[type] || { color: 'gray', text: type };
    
    return (
      <Badge colorScheme={typeInfo.color} variant="solid" fontSize="xs">
        {typeInfo.text}
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <IconButton
        aria-label="Notificaciones"
        icon={<BellIcon />}
        onClick={onOpen}
        position="relative"
        variant="ghost"
      >
        {unreadCount > 0 && (
          <Box
            position="absolute"
            top="0"
            right="0"
            transform="translate(25%, -25%)"
            bg="red.500"
            color="white"
            borderRadius="full"
            w="18px"
            h="18px"
            fontSize="xs"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            {unreadCount}
          </Box>
        )}
      </IconButton>

      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>
            <Flex justify="space-between" align="center">
              <Heading size="md">Notificaciones</Heading>
              {notifications.length > 0 && (
                <Button size="sm" leftIcon={<CheckIcon />} onClick={handleMarkAllAsRead}>
                  Marcar todas como leídas
                </Button>
              )}
            </Flex>
          </DrawerHeader>

          <DrawerBody>
            {isLoading ? (
              <Flex justify="center" align="center" height="200px">
                <Spinner size="lg" color="blue.500" />
              </Flex>
            ) : notifications.length > 0 ? (
              <VStack spacing={4} align="stretch">
                {notifications.map((notification) => (
                  <Box
                    key={notification.id}
                    p={4}
                    borderWidth="1px"
                    borderRadius="md"
                    bg={notification.read ? 'transparent' : 'blue.50'}
                    _dark={{
                      bg: notification.read ? 'transparent' : 'blue.900'
                    }}
                    cursor="pointer"
                    onClick={() => handleNotificationClick(notification)}
                    position="relative"
                  >
                    <Flex justify="space-between" align="center" mb={2}>
                      {getNotificationBadge(notification.type)}
                      <Text fontSize="xs" color="gray.500">
                        {formatDate(notification.createdAt)}
                      </Text>
                    </Flex>
                    <Text fontWeight={notification.read ? 'normal' : 'bold'}>
                      {notification.title}
                    </Text>
                    <Text fontSize="sm" noOfLines={2}>
                      {notification.message}
                    </Text>
                    
                    {!notification.read && (
                      <IconButton
                        aria-label="Marcar como leída"
                        icon={<CheckIcon />}
                        size="xs"
                        position="absolute"
                        top="4"
                        right="4"
                        colorScheme="blue"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(notification.id);
                        }}
                      />
                    )}
                  </Box>
                ))}
              </VStack>
            ) : (
              <Flex 
                direction="column" 
                align="center" 
                justify="center" 
                height="200px"
                color="gray.500"
              >
                <Text>No tienes notificaciones</Text>
              </Flex>
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default NotificationCenter;