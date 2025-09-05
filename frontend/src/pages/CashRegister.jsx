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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Select,
  Textarea,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Spinner,
  Center,
  SimpleGrid,
  useBreakpointValue,
  Divider,
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
  MenuItem
} from '@chakra-ui/react';
import { 
  SearchIcon, 
  AddIcon, 
  EditIcon, 
  ViewIcon,
  ChevronDownIcon,
  LockIcon,
  UnlockIcon
} from '@chakra-ui/icons';
import useCashRegisterStore from '../stores/cashRegisterStore';

const CashRegister = () => {
  // Store
  const {
    currentCashRegister,
    movements,
    stats,
    loading,
    error,
    openCashRegister,
    closeCashRegister,
    fetchCurrentCashRegister,
    fetchStats,
    addCashMovement,
    getFilteredMovements,
    getTotalByType,
    getCurrentBalance,
    clearError
  } = useCashRegisterStore();

  // Estados locales
  const [searchTerm, setSearchTerm] = useState('');
  const [openingAmount, setOpeningAmount] = useState('');
  const [closingAmount, setClosingAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [movementData, setMovementData] = useState({
    type: 'ingreso',
    amount: '',
    description: '',
    reference: '',
    paymentMethod: 'efectivo'
  });
  
  const { isOpen: isOpenModal, onOpen: onOpenModal, onClose: onCloseModal } = useDisclosure();
  const { isOpen: isCloseModal, onOpen: onOpenCloseModal, onClose: onCloseCloseModal } = useDisclosure();
  const { isOpen: isMovementModal, onOpen: onOpenMovementModal, onClose: onCloseMovementModal } = useDisclosure();
  
  const toast = useToast();
  const isMobile = useBreakpointValue({ base: true, md: false });

  useEffect(() => {
    fetchCurrentCashRegister();
    fetchStats();
  }, [fetchCurrentCashRegister, fetchStats]);

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

  const handleOpenCashRegister = async () => {
    if (!openingAmount || parseFloat(openingAmount) < 0) {
      toast({
        title: 'Error',
        description: 'Ingresa un monto de apertura válido',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const result = await openCashRegister(parseFloat(openingAmount), notes);
    if (result.success) {
      toast({
        title: 'Éxito',
        description: 'Caja abierta correctamente',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onCloseModal();
      setOpeningAmount('');
      setNotes('');
    }
  };

  const handleCloseCashRegister = async () => {
    if (!closingAmount || parseFloat(closingAmount) < 0) {
      toast({
        title: 'Error',
        description: 'Ingresa un monto de cierre válido',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const result = await closeCashRegister(parseFloat(closingAmount), notes);
    if (result.success) {
      toast({
        title: 'Éxito',
        description: 'Caja cerrada correctamente',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onCloseCloseModal();
      setClosingAmount('');
      setNotes('');
    }
  };

  const handleAddMovement = async () => {
    if (!movementData.amount || !movementData.description) {
      toast({
        title: 'Error',
        description: 'Completa todos los campos obligatorios',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const result = await addCashMovement(movementData);
    if (result.success) {
      toast({
        title: 'Éxito',
        description: 'Movimiento registrado correctamente',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onCloseMovementModal();
      setMovementData({
        type: 'ingreso',
        amount: '',
        description: '',
        reference: '',
        paymentMethod: 'efectivo'
      });
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'ingreso':
      case 'venta':
        return 'green';
      case 'egreso':
      case 'gasto':
      case 'retiro':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getTypeText = (type) => {
    switch (type) {
      case 'ingreso':
        return 'Ingreso';
      case 'egreso':
        return 'Egreso';
      case 'venta':
        return 'Venta';
      case 'gasto':
        return 'Gasto';
      case 'retiro':
        return 'Retiro';
      case 'deposito':
        return 'Depósito';
      default:
        return type;
    }
  };

  const getPaymentMethodText = (method) => {
    switch (method) {
      case 'efectivo':
        return 'Efectivo';
      case 'tarjeta':
        return 'Tarjeta';
      case 'transferencia':
        return 'Transferencia';
      case 'yape':
        return 'Yape';
      case 'plin':
        return 'Plin';
      default:
        return method;
    }
  };

  const filteredMovements = getFilteredMovements(searchTerm);
  const currentBalance = getCurrentBalance();
  const totalIngresos = getTotalByType('ingreso') + getTotalByType('venta');
  const totalEgresos = getTotalByType('egreso') + getTotalByType('gasto') + getTotalByType('retiro');

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
          Control de Caja
        </Heading>
        <HStack spacing={2}>
          {!currentCashRegister ? (
            <Button
              leftIcon={<UnlockIcon />}
              colorScheme="green"
              onClick={onOpenModal}
            >
              Abrir Caja
            </Button>
          ) : (
            <Button
              leftIcon={<LockIcon />}
              colorScheme="red"
              onClick={onOpenCloseModal}
            >
              Cerrar Caja
            </Button>
          )}
          {currentCashRegister && (
            <Button
              leftIcon={<AddIcon />}
              colorScheme="blue"
              onClick={onOpenMovementModal}
            >
              Nuevo Movimiento
            </Button>
          )}
        </HStack>
      </Flex>

      {/* Estado de la caja */}
      <Card mb={6}>
        <CardBody>
          <HStack justify="space-between" align="center">
            <VStack align="start" spacing={2}>
              <Text fontSize="sm" color="gray.600">Estado de la Caja</Text>
              <HStack spacing={4}>
                <Badge 
                  colorScheme={currentCashRegister ? 'green' : 'red'} 
                  fontSize="md" 
                  px={3} 
                  py={1}
                >
                  {currentCashRegister ? 'ABIERTA' : 'CERRADA'}
                </Badge>
                {currentCashRegister && (
                  <Text fontSize="sm" color="gray.600">
                    Abierta el {new Date(currentCashRegister.openingDate).toLocaleDateString()}
                  </Text>
                )}
              </HStack>
            </VStack>
            {currentCashRegister && (
              <VStack align="end" spacing={1}>
                <Text fontSize="sm" color="gray.600">Saldo Actual</Text>
                <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                  S/ {currentBalance.toFixed(2)}
                </Text>
              </VStack>
            )}
          </HStack>
        </CardBody>
      </Card>

      {/* Estadísticas */}
      {currentCashRegister && (
        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4} mb={6}>
          <Card>
            <CardBody>
              <Text fontSize="sm" color="gray.600">Monto Inicial</Text>
              <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                S/ {parseFloat(currentCashRegister.openingAmount).toFixed(2)}
              </Text>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <Text fontSize="sm" color="gray.600">Total Ingresos</Text>
              <Text fontSize="2xl" fontWeight="bold" color="green.600">
                S/ {totalIngresos.toFixed(2)}
              </Text>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <Text fontSize="sm" color="gray.600">Total Egresos</Text>
              <Text fontSize="2xl" fontWeight="bold" color="red.600">
                S/ {totalEgresos.toFixed(2)}
              </Text>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <Text fontSize="sm" color="gray.600">Saldo Actual</Text>
              <Text fontSize="2xl" fontWeight="bold" color="purple.600">
                S/ {currentBalance.toFixed(2)}
              </Text>
            </CardBody>
          </Card>
        </SimpleGrid>
      )}

      {/* Movimientos */}
      {currentCashRegister && (
        <Card>
          <CardHeader>
            <Flex justify="space-between" align="center">
              <Heading size="md">Movimientos de Caja</Heading>
              <InputGroup maxW="300px">
                <InputLeftElement pointerEvents="none">
                  <SearchIcon color="gray.300" />
                </InputLeftElement>
                <Input
                  placeholder="Buscar movimientos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Flex>
          </CardHeader>
          <CardBody>
            {filteredMovements.length === 0 ? (
              <Alert status="info">
                <AlertIcon />
                <AlertTitle>No hay movimientos!</AlertTitle>
                <AlertDescription>
                  {searchTerm ? 'No se encontraron movimientos con el término de búsqueda.' : 'No hay movimientos registrados.'}
                </AlertDescription>
              </Alert>
            ) : (
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Tipo</Th>
                    <Th>Descripción</Th>
                    <Th>Monto</Th>
                    <Th>Método</Th>
                    <Th>Referencia</Th>
                    <Th>Fecha</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredMovements.map((movement) => (
                    <Tr key={movement.id}>
                      <Td>
                        <Badge colorScheme={getTypeColor(movement.type)}>
                          {getTypeText(movement.type)}
                        </Badge>
                      </Td>
                      <Td>
                        <Text>{movement.description}</Text>
                      </Td>
                      <Td>
                        <Text 
                          fontWeight="bold" 
                          color={movement.type === 'ingreso' || movement.type === 'venta' ? 'green.600' : 'red.600'}
                        >
                          {movement.type === 'ingreso' || movement.type === 'venta' ? '+' : '-'}S/ {parseFloat(movement.amount).toFixed(2)}
                        </Text>
                      </Td>
                      <Td>
                        <Text fontSize="sm">
                          {getPaymentMethodText(movement.paymentMethod)}
                        </Text>
                      </Td>
                      <Td>
                        <Text fontSize="sm" color="gray.500">
                          {movement.reference || 'N/A'}
                        </Text>
                      </Td>
                      <Td>
                        <Text fontSize="sm">
                          {new Date(movement.createdAt).toLocaleString()}
                        </Text>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            )}
          </CardBody>
        </Card>
      )}

      {/* Modal para abrir caja */}
      <Modal isOpen={isOpenModal} onClose={onCloseModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Abrir Caja</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Monto de Apertura</FormLabel>
                <NumberInput
                  value={openingAmount}
                  onChange={(value) => setOpeningAmount(value)}
                  min={0}
                  precision={2}
                >
                  <NumberInputField placeholder="0.00" />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
              <FormControl>
                <FormLabel>Notas (opcional)</FormLabel>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notas adicionales..."
                  rows={3}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onCloseModal}>
              Cancelar
            </Button>
            <Button colorScheme="green" onClick={handleOpenCashRegister}>
              Abrir Caja
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal para cerrar caja */}
      <Modal isOpen={isCloseModal} onClose={onCloseCloseModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Cerrar Caja</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Alert status="info">
                <AlertIcon />
                <AlertTitle>Resumen de Caja</AlertTitle>
                <AlertDescription>
                  Monto esperado: S/ {currentBalance.toFixed(2)}
                </AlertDescription>
              </Alert>
              <FormControl isRequired>
                <FormLabel>Monto de Cierre</FormLabel>
                <NumberInput
                  value={closingAmount}
                  onChange={(value) => setClosingAmount(value)}
                  min={0}
                  precision={2}
                >
                  <NumberInputField placeholder="0.00" />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
              <FormControl>
                <FormLabel>Notas (opcional)</FormLabel>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notas adicionales..."
                  rows={3}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onCloseCloseModal}>
              Cancelar
            </Button>
            <Button colorScheme="red" onClick={handleCloseCashRegister}>
              Cerrar Caja
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal para agregar movimiento */}
      <Modal isOpen={isMovementModal} onClose={onCloseMovementModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Nuevo Movimiento</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Tipo de Movimiento</FormLabel>
                <Select
                  value={movementData.type}
                  onChange={(e) => setMovementData({ ...movementData, type: e.target.value })}
                >
                  <option value="ingreso">Ingreso</option>
                  <option value="egreso">Egreso</option>
                  <option value="venta">Venta</option>
                  <option value="gasto">Gasto</option>
                  <option value="retiro">Retiro</option>
                  <option value="deposito">Depósito</option>
                </Select>
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Monto</FormLabel>
                <NumberInput
                  value={movementData.amount}
                  onChange={(value) => setMovementData({ ...movementData, amount: value })}
                  min={0}
                  precision={2}
                >
                  <NumberInputField placeholder="0.00" />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Descripción</FormLabel>
                <Input
                  value={movementData.description}
                  onChange={(e) => setMovementData({ ...movementData, description: e.target.value })}
                  placeholder="Descripción del movimiento"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Referencia (opcional)</FormLabel>
                <Input
                  value={movementData.reference}
                  onChange={(e) => setMovementData({ ...movementData, reference: e.target.value })}
                  placeholder="Número de referencia"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Método de Pago</FormLabel>
                <Select
                  value={movementData.paymentMethod}
                  onChange={(e) => setMovementData({ ...movementData, paymentMethod: e.target.value })}
                >
                  <option value="efectivo">Efectivo</option>
                  <option value="tarjeta">Tarjeta</option>
                  <option value="transferencia">Transferencia</option>
                  <option value="yape">Yape</option>
                  <option value="plin">Plin</option>
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onCloseMovementModal}>
              Cancelar
            </Button>
            <Button colorScheme="blue" onClick={handleAddMovement}>
              Agregar Movimiento
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default CashRegister;
