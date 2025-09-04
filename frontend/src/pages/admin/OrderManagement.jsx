import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  Box,
  Container,
  Heading,
  Text,
  Stack,
  Flex,
  Spinner,
  useColorModeValue,
  Button,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';
import { SearchIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { FaEye, FaEdit, FaTruck, FaMoneyBillWave } from 'react-icons/fa';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [deliveryPersons, setDeliveryPersons] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedDeliveryPerson, setSelectedDeliveryPerson] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('');

  // Modales
  const { 
    isOpen: isAssignModalOpen, 
    onOpen: onAssignModalOpen, 
    onClose: onAssignModalClose 
  } = useDisclosure();
  
  const { 
    isOpen: isStatusModalOpen, 
    onOpen: onStatusModalOpen, 
    onClose: onStatusModalClose 
  } = useDisclosure();
  
  const { 
    isOpen: isPaymentModalOpen, 
    onOpen: onPaymentModalOpen, 
    onClose: onPaymentModalClose 
  } = useDisclosure();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        const config = {
          headers: { Authorization: `Bearer ${token}` }
        };

        const response = await axios.get(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/orders`,
          config
        );

        // Ordenar pedidos por fecha (más recientes primero)
        const sortedOrders = response.data.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );

        setOrders(sortedOrders);
        setFilteredOrders(sortedOrders);
      } catch (error) {
        console.error('Error al cargar pedidos:', error);
        toast.error('Error al cargar los pedidos');
      } finally {
        setIsLoading(false);
      }
    };

    const fetchDeliveryPersons = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = {
          headers: { Authorization: `Bearer ${token}` }
        };

        const response = await axios.get(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/delivery-persons`,
          config
        );

        // Filtrar solo repartidores activos
        const activeDeliveryPersons = response.data.filter(dp => dp.active && dp.status === 'available');
        setDeliveryPersons(activeDeliveryPersons);
      } catch (error) {
        console.error('Error al cargar repartidores:', error);
        toast.error('Error al cargar la lista de repartidores');
      }
    };

    fetchOrders();
    fetchDeliveryPersons();
  }, []);

  useEffect(() => {
    // Aplicar filtros cuando cambian los criterios
    let result = [...orders];

    // Filtrar por término de búsqueda (ID de pedido o cliente)
    if (searchTerm) {
      result = result.filter(order => 
        order.id.toString().includes(searchTerm) ||
        order.orderNumber?.toString().includes(searchTerm) ||
        order.client?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por estado de pedido
    if (statusFilter !== 'all') {
      result = result.filter(order => order.status === statusFilter);
    }

    // Filtrar por estado de pago
    if (paymentFilter !== 'all') {
      result = result.filter(order => order.paymentStatus === paymentFilter);
    }

    setFilteredOrders(result);
  }, [searchTerm, statusFilter, paymentFilter, orders]);

  const handleViewOrder = (orderId) => {
    // Implementar vista detallada del pedido
    console.log('Ver pedido:', orderId);
  };

  const handleOpenAssignModal = (order) => {
    setSelectedOrder(order);
    setSelectedDeliveryPerson(order.deliveryPersonId || '');
    onAssignModalOpen();
  };

  const handleOpenStatusModal = (order) => {
    setSelectedOrder(order);
    setSelectedStatus(order.status);
    onStatusModalOpen();
  };

  const handleOpenPaymentModal = (order) => {
    setSelectedOrder(order);
    setSelectedPaymentStatus(order.paymentStatus);
    onPaymentModalOpen();
  };

  const handleAssignDeliveryPerson = async () => {
    if (!selectedDeliveryPerson) {
      toast.error('Debes seleccionar un repartidor');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      await axios.put(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/orders/${selectedOrder.id}/assign-delivery`,
        { deliveryPersonId: selectedDeliveryPerson },
        config
      );

      // Actualizar la lista de pedidos
      const updatedOrders = orders.map(order => {
        if (order.id === selectedOrder.id) {
          return { ...order, deliveryPersonId: selectedDeliveryPerson };
        }
        return order;
      });

      setOrders(updatedOrders);
      toast.success('Repartidor asignado correctamente');
      onAssignModalClose();
    } catch (error) {
      console.error('Error al asignar repartidor:', error);
      toast.error('Error al asignar el repartidor');
    }
  };

  const handleUpdateOrderStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      await axios.put(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/orders/${selectedOrder.id}/status`,
        { status: selectedStatus },
        config
      );

      // Actualizar la lista de pedidos
      const updatedOrders = orders.map(order => {
        if (order.id === selectedOrder.id) {
          return { ...order, status: selectedStatus };
        }
        return order;
      });

      setOrders(updatedOrders);
      toast.success('Estado del pedido actualizado correctamente');
      onStatusModalClose();
    } catch (error) {
      console.error('Error al actualizar estado del pedido:', error);
      toast.error('Error al actualizar el estado del pedido');
    }
  };

  const handleUpdatePaymentStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      await axios.put(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/payments/${selectedOrder.id}/status`,
        { status: selectedPaymentStatus },
        config
      );

      // Actualizar la lista de pedidos
      const updatedOrders = orders.map(order => {
        if (order.id === selectedOrder.id) {
          return { ...order, paymentStatus: selectedPaymentStatus };
        }
        return order;
      });

      setOrders(updatedOrders);
      toast.success('Estado del pago actualizado correctamente');
      onPaymentModalClose();
    } catch (error) {
      console.error('Error al actualizar estado del pago:', error);
      toast.error('Error al actualizar el estado del pago');
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'pending': { color: 'yellow', text: 'Pendiente' },
      'processing': { color: 'blue', text: 'En proceso' },
      'shipped': { color: 'purple', text: 'Enviado' },
      'delivered': { color: 'green', text: 'Entregado' },
      'cancelled': { color: 'red', text: 'Cancelado' }
    };
    
    const statusInfo = statusMap[status] || { color: 'gray', text: status };
    
    return (
      <Badge colorScheme={statusInfo.color} variant="solid">
        {statusInfo.text}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (status) => {
    const statusMap = {
      'pending': { color: 'yellow', text: 'Pendiente' },
      'paid': { color: 'green', text: 'Pagado' },
      'failed': { color: 'red', text: 'Fallido' }
    };
    
    const statusInfo = statusMap[status] || { color: 'gray', text: status };
    
    return (
      <Badge colorScheme={statusInfo.color} variant="solid">
        {statusInfo.text}
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

  if (isLoading) {
    return (
      <Flex justify="center" align="center" height="80vh">
        <Spinner size="xl" color="blue.500" />
      </Flex>
    );
  }

  return (
    <Container maxW="container.xl" py={6}>
      <Stack spacing={6}>
        <Heading size="lg">Gestión de Pedidos</Heading>

        {/* Filtros */}
        <Flex 
          direction={{ base: 'column', md: 'row' }} 
          gap={4} 
          bg={bgColor} 
          p={4} 
          borderRadius="md"
          borderWidth="1px"
          borderColor={borderColor}
        >
          <InputGroup maxW={{ base: '100%', md: '40%' }}>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.400" />
            </InputLeftElement>
            <Input 
              placeholder="Buscar por número de pedido o cliente" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
          
          <Select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            maxW={{ base: '100%', md: '30%' }}
          >
            <option value="all">Todos los estados</option>
            <option value="pending">Pendiente</option>
            <option value="processing">En proceso</option>
            <option value="shipped">Enviado</option>
            <option value="delivered">Entregado</option>
            <option value="cancelled">Cancelado</option>
          </Select>
          
          <Select 
            value={paymentFilter} 
            onChange={(e) => setPaymentFilter(e.target.value)}
            maxW={{ base: '100%', md: '30%' }}
          >
            <option value="all">Todos los pagos</option>
            <option value="pending">Pago pendiente</option>
            <option value="paid">Pagado</option>
            <option value="failed">Fallido</option>
          </Select>
        </Flex>

        {/* Tabla de pedidos */}
        <Box
          bg={bgColor}
          borderWidth="1px"
          borderColor={borderColor}
          borderRadius="md"
          overflow="hidden"
        >
          <Box overflowX="auto">
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>ID</Th>
                  <Th>Cliente</Th>
                  <Th>Fecha</Th>
                  <Th>Total</Th>
                  <Th>Estado</Th>
                  <Th>Pago</Th>
                  <Th>Repartidor</Th>
                  <Th>Acciones</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <Tr key={order.id}>
                      <Td>#{order.orderNumber || order.id}</Td>
                      <Td>{order.client?.name || 'Cliente no disponible'}</Td>
                      <Td>{formatDate(order.createdAt)}</Td>
                      <Td>${order.total?.toFixed(2) || '0.00'}</Td>
                      <Td>{getStatusBadge(order.status)}</Td>
                      <Td>{getPaymentStatusBadge(order.paymentStatus)}</Td>
                      <Td>
                        {order.deliveryPerson ? (
                          order.deliveryPerson.name
                        ) : (
                          <Text color="gray.500">No asignado</Text>
                        )}
                      </Td>
                      <Td>
                        <Menu>
                          <MenuButton
                            as={Button}
                            rightIcon={<ChevronDownIcon />}
                            size="sm"
                            colorScheme="blue"
                            variant="outline"
                          >
                            Acciones
                          </MenuButton>
                          <MenuList>
                            <MenuItem icon={<FaEye />} onClick={() => handleViewOrder(order.id)}>
                              Ver detalles
                            </MenuItem>
                            <MenuItem icon={<FaEdit />} onClick={() => handleOpenStatusModal(order)}>
                              Actualizar estado
                            </MenuItem>
                            <MenuItem icon={<FaTruck />} onClick={() => handleOpenAssignModal(order)}>
                              Asignar repartidor
                            </MenuItem>
                            <MenuItem icon={<FaMoneyBillWave />} onClick={() => handleOpenPaymentModal(order)}>
                              Actualizar pago
                            </MenuItem>
                          </MenuList>
                        </Menu>
                      </Td>
                    </Tr>
                  ))
                ) : (
                  <Tr>
                    <Td colSpan={8} textAlign="center" py={4}>
                      No se encontraron pedidos con los filtros seleccionados
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          </Box>
        </Box>
      </Stack>

      {/* Modal para asignar repartidor */}
      <Modal isOpen={isAssignModalOpen} onClose={onAssignModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Asignar Repartidor</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Seleccionar Repartidor</FormLabel>
              <Select
                value={selectedDeliveryPerson}
                onChange={(e) => setSelectedDeliveryPerson(e.target.value)}
                placeholder="Seleccionar repartidor"
              >
                {deliveryPersons.map((dp) => (
                  <option key={dp.id} value={dp.id}>
                    {dp.name} - {dp.vehicleType} ({dp.vehiclePlate || 'Sin placa'})
                  </option>
                ))}
              </Select>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onAssignModalClose}>
              Cancelar
            </Button>
            <Button colorScheme="blue" onClick={handleAssignDeliveryPerson}>
              Asignar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal para actualizar estado del pedido */}
      <Modal isOpen={isStatusModalOpen} onClose={onStatusModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Actualizar Estado del Pedido</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Estado del Pedido</FormLabel>
              <Select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="pending">Pendiente</option>
                <option value="processing">En proceso</option>
                <option value="shipped">Enviado</option>
                <option value="delivered">Entregado</option>
                <option value="cancelled">Cancelado</option>
              </Select>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onStatusModalClose}>
              Cancelar
            </Button>
            <Button colorScheme="blue" onClick={handleUpdateOrderStatus}>
              Actualizar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal para actualizar estado del pago */}
      <Modal isOpen={isPaymentModalOpen} onClose={onPaymentModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Actualizar Estado del Pago</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Estado del Pago</FormLabel>
              <Select
                value={selectedPaymentStatus}
                onChange={(e) => setSelectedPaymentStatus(e.target.value)}
              >
                <option value="pending">Pendiente</option>
                <option value="paid">Pagado</option>
                <option value="failed">Fallido</option>
              </Select>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onPaymentModalClose}>
              Cancelar
            </Button>
            <Button colorScheme="blue" onClick={handleUpdatePaymentStatus}>
              Actualizar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default OrderManagement;