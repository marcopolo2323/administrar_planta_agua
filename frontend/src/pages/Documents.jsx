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
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Input,
  InputGroup,
  InputLeftElement,
  VStack,
  HStack,
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
  Select,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Spinner,
  Center,
  SimpleGrid,
  useBreakpointValue,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorModeValue,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Divider
} from '@chakra-ui/react';
import { 
  SearchIcon, 
  DownloadIcon, 
  DeleteIcon, 
  ViewIcon,
  AddIcon,
  ChevronDownIcon
} from '@chakra-ui/icons';
import { FaFilePdf, FaDownload, FaTrash, FaEye, FaPlus } from 'react-icons/fa';
import useDocumentStore from '../stores/documentStore';

const Documents = () => {
  // Store
  const {
    documents,
    stats,
    loading,
    error,
    pagination,
    fetchDocuments,
    fetchStats,
    downloadDocument,
    generateDocument,
    deleteDocument,
    formatFileSize,
    formatDate,
    clearError
  } = useDocumentStore();

  // Estados locales
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [generateForm, setGenerateForm] = useState({
    orderId: '',
    orderType: 'regular',
    documentType: 'boleta'
  });

  // Modales
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();
  const { isOpen: isGenerateOpen, onOpen: onGenerateOpen, onClose: onGenerateClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();

  const toast = useToast();
  const isMobile = useBreakpointValue({ base: true, md: false });
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Cargar datos iniciales
  useEffect(() => {
    fetchDocuments({ page: currentPage, type: typeFilter });
    fetchStats();
  }, [currentPage, typeFilter]);

  // Mostrar errores
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

  // Filtrar documentos
  const filteredDocuments = documents.filter(doc => {
    const searchLower = searchTerm.toLowerCase();
    const orderId = doc.orderId?.toString() || '';
    const clientName = doc.order?.clientName || '';
    const filename = doc.filename || '';
    
    // Filtro de búsqueda
    const matchesSearch = orderId.includes(searchLower) ||
                         clientName.toLowerCase().includes(searchLower) ||
                         filename.toLowerCase().includes(searchLower);
    
    // Filtro de tipo
    const matchesType = typeFilter === 'all' || doc.type === typeFilter;
    
    // Filtro de estado
    let matchesStatus = true;
    if (statusFilter === 'problematic') {
      matchesStatus = !doc.orderId || !doc.order || doc.order.clientName === 'N/A' || doc.order.clientName === 'Sin información';
    } else if (statusFilter === 'complete') {
      matchesStatus = doc.orderId && doc.order && doc.order.clientName && doc.order.clientName !== 'N/A' && doc.order.clientName !== 'Sin información';
    }
    
    return matchesSearch && matchesType && matchesStatus;
  });

  // Manejar descarga
  const handleDownload = async (filename) => {
    const result = await downloadDocument(filename);
    if (result.success) {
      toast({
        title: 'Éxito',
        description: 'Documento descargado correctamente',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Manejar eliminación
  const handleDelete = async () => {
    if (!selectedDocument) return;
    
    const result = await deleteDocument(selectedDocument.filename);
    if (result.success) {
      toast({
        title: 'Éxito',
        description: 'Documento eliminado correctamente',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onDeleteClose();
      setSelectedDocument(null);
    }
  };

  // Manejar generación de documento
  const handleGenerate = async () => {
    if (!generateForm.orderId) {
      toast({
        title: 'Error',
        description: 'Debe ingresar un ID de pedido',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const result = await generateDocument(
      parseInt(generateForm.orderId),
      generateForm.orderType,
      generateForm.documentType
    );
    
    if (result.success) {
      toast({
        title: 'Éxito',
        description: 'Documento generado correctamente',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onGenerateClose();
      setGenerateForm({ orderId: '', orderType: 'regular', documentType: 'boleta' });
      fetchDocuments({ page: currentPage, type: typeFilter });
    }
  };

  // Abrir modal de vista
  const openViewModal = (document) => {
    setSelectedDocument(document);
    onViewOpen();
  };

  // Abrir modal de eliminación
  const openDeleteModal = (document) => {
    setSelectedDocument(document);
    onDeleteOpen();
  };

  // Obtener color del tipo de documento
  const getDocumentTypeColor = (type) => {
    switch (type) {
      case 'boleta':
        return 'blue';
      case 'factura':
        return 'green';
      default:
        return 'gray';
    }
  };

  // Obtener texto del tipo de documento
  const getDocumentTypeText = (type) => {
    switch (type) {
      case 'boleta':
        return 'Boleta';
      case 'factura':
        return 'Factura';
      default:
        return type;
    }
  };

  if (loading && documents.length === 0) {
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
          Gestión de Documentos
        </Heading>
        <Button
          leftIcon={<AddIcon />}
          colorScheme="blue"
          onClick={onGenerateOpen}
        >
          Generar Documento
        </Button>
      </Flex>

      {/* Estadísticas */}
      {stats && (
        <SimpleGrid columns={{ base: 2, md: 4, lg: 6 }} spacing={4} mb={6}>
          <Card bg={cardBg} borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel color="blue.600">Total Documentos</StatLabel>
                <StatNumber color="blue.500" fontSize="2xl">{stats.totalDocuments}</StatNumber>
                <StatHelpText>
                  {stats.totalBoletas} boletas, {stats.totalFacturas} facturas
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel color="green.600">Boletas</StatLabel>
                <StatNumber color="green.500" fontSize="2xl">{stats.totalBoletas}</StatNumber>
                <StatHelpText>
                  Documentos de venta
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel color="purple.600">Facturas</StatLabel>
                <StatNumber color="purple.500" fontSize="2xl">{stats.totalFacturas}</StatNumber>
                <StatHelpText>
                  Documentos fiscales
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel color="orange.600">Tamaño Total</StatLabel>
                <StatNumber color="orange.500" fontSize="2xl">
                  {formatFileSize(stats.totalSize)}
                </StatNumber>
                <StatHelpText>
                  Espacio utilizado
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel color="teal.600">Recientes</StatLabel>
                <StatNumber color="teal.500" fontSize="2xl">{stats.recentDocuments}</StatNumber>
                <StatHelpText>
                  Últimos 30 días
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel color="gray.600">Promedio</StatLabel>
                <StatNumber color="gray.500" fontSize="2xl">
                  {formatFileSize(stats.averageSize)}
                </StatNumber>
                <StatHelpText>
                  Por documento
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>
      )}

      <Card bg={cardBg} borderColor={borderColor}>
        <CardHeader>
          <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
            <Heading size="md">Lista de Documentos</Heading>
            <HStack spacing={4}>
              <Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                maxW="200px"
              >
                <option value="all">Todos los tipos</option>
                <option value="boleta">Solo Boletas</option>
                <option value="factura">Solo Facturas</option>
              </Select>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                maxW="200px"
              >
                <option value="all">Todos los estados</option>
                <option value="complete">Completos</option>
                <option value="problematic">Problemáticos</option>
              </Select>
              <InputGroup maxW="300px">
                <InputLeftElement pointerEvents="none">
                  <SearchIcon color="gray.300" />
                </InputLeftElement>
                <Input
                  placeholder="Buscar documentos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </HStack>
          </Flex>
        </CardHeader>
        <CardBody>
          {filteredDocuments.length === 0 ? (
            <Alert status="info">
              <AlertIcon />
              <AlertTitle>No hay documentos!</AlertTitle>
              <AlertDescription>
                {searchTerm || typeFilter !== 'all' 
                  ? 'No se encontraron documentos con los filtros aplicados.' 
                  : 'No hay documentos generados.'
                }
              </AlertDescription>
            </Alert>
          ) : (
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Archivo</Th>
                  <Th>Pedido</Th>
                  <Th>Cliente</Th>
                  <Th>Tipo</Th>
                  <Th>Tamaño</Th>
                  <Th>Fecha</Th>
                  <Th>Acciones</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredDocuments.map((doc) => (
                  <Tr key={doc.filename}>
                    <Td>
                      <HStack spacing={2}>
                        <FaFilePdf color="#e53e3e" size="20px" />
                        <VStack align="start" spacing={1}>
                          <Text fontSize="sm" fontWeight="bold" noOfLines={1}>
                            {doc.filename}
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            ID: {doc.orderId}
                          </Text>
                        </VStack>
                      </HStack>
                    </Td>
                    <Td>
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="bold" color={
                          doc.orderId ? 'inherit' : 'red.500'
                        }>
                          {doc.orderId ? `#${doc.orderId}` : 'Sin ID'}
                        </Text>
                        <Badge size="sm" colorScheme={
                          doc.orderType === 'regular' ? 'blue' : 
                          doc.orderType === 'guest' ? 'green' : 
                          doc.orderType === 'unknown' ? 'gray' : 'red'
                        }>
                          {doc.orderType === 'regular' ? 'Cliente Frecuente' : 
                           doc.orderType === 'guest' ? 'Invitado' :
                           doc.orderType === 'unknown' ? 'Desconocido' : 'Error'}
                        </Badge>
                        {!doc.orderId && (
                          <Text fontSize="xs" color="red.500">
                            Archivo sin ID de pedido
                          </Text>
                        )}
                      </VStack>
                    </Td>
                    <Td>
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="bold" color={
                          doc.order?.clientName === 'N/A' || !doc.order?.clientName ? 'red.500' : 'inherit'
                        }>
                          {doc.order?.clientName || 'Sin información'}
                        </Text>
                        <Text fontSize="sm" color="gray.500">
                          {doc.order?.clientPhone || 'Sin teléfono'}
                        </Text>
                        {doc.order?.clientEmail && doc.order.clientEmail !== 'N/A' && (
                          <Text fontSize="xs" color="gray.400">
                            {doc.order.clientEmail}
                          </Text>
                        )}
                      </VStack>
                    </Td>
                    <Td>
                      <Badge colorScheme={getDocumentTypeColor(doc.type)}>
                        {getDocumentTypeText(doc.type)}
                      </Badge>
                    </Td>
                    <Td>
                      <Text fontSize="sm">
                        {formatFileSize(doc.size)}
                      </Text>
                    </Td>
                    <Td>
                      <Text fontSize="sm">
                        {formatDate(doc.createdAt)}
                      </Text>
                    </Td>
                    <Td>
                      <HStack spacing={2}>
                        <IconButton
                          size="sm"
                          icon={<FaEye />}
                          colorScheme="blue"
                          variant="outline"
                          onClick={() => openViewModal(doc)}
                        />
                        <IconButton
                          size="sm"
                          icon={<FaDownload />}
                          colorScheme="green"
                          variant="outline"
                          onClick={() => handleDownload(doc.filename)}
                        />
                        {doc.orderId && (
                          <IconButton
                            size="sm"
                            icon={<FaPlus />}
                            colorScheme="purple"
                            variant="outline"
                            onClick={() => {
                              setGenerateForm({
                                orderId: doc.orderId,
                                orderType: doc.orderType === 'regular' ? 'regular' : 'guest',
                                documentType: doc.type
                              });
                              onGenerateOpen();
                            }}
                            title="Regenerar documento"
                          />
                        )}
                        <IconButton
                          size="sm"
                          icon={<FaTrash />}
                          colorScheme="red"
                          variant="outline"
                          onClick={() => openDeleteModal(doc)}
                        />
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </CardBody>
      </Card>

      {/* Modal para ver documento */}
      <Modal isOpen={isViewOpen} onClose={onViewClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Documento: {selectedDocument?.filename}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedDocument && (
              <VStack spacing={4} align="start">
                <SimpleGrid columns={2} spacing={4} w="full">
                  <Box>
                    <Text fontSize="sm" color="gray.600">Archivo:</Text>
                    <Text fontWeight="bold">{selectedDocument.filename}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.600">Tipo:</Text>
                    <Badge colorScheme={getDocumentTypeColor(selectedDocument.type)}>
                      {getDocumentTypeText(selectedDocument.type)}
                    </Badge>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.600">Tamaño:</Text>
                    <Text fontWeight="bold">{formatFileSize(selectedDocument.size)}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.600">Fecha:</Text>
                    <Text fontWeight="bold">{formatDate(selectedDocument.createdAt)}</Text>
                  </Box>
                </SimpleGrid>

                <Divider />

                {selectedDocument.order && (
                  <Box w="full">
                    <Text fontWeight="bold" mb={3}>Información del Pedido</Text>
                    <SimpleGrid columns={2} spacing={4} w="full">
                      <Box>
                        <Text fontSize="sm" color="gray.600">Pedido ID:</Text>
                        <Text fontWeight="bold">#{selectedDocument.order.id}</Text>
                      </Box>
                      <Box>
                        <Text fontSize="sm" color="gray.600">Tipo:</Text>
                        <Badge colorScheme={selectedDocument.orderType === 'regular' ? 'blue' : 'green'}>
                          {selectedDocument.orderType === 'regular' ? 'Cliente Frecuente' : 'Invitado'}
                        </Badge>
                      </Box>
                      <Box>
                        <Text fontSize="sm" color="gray.600">Cliente:</Text>
                        <Text fontWeight="bold">{selectedDocument.order.clientName}</Text>
                      </Box>
                      <Box>
                        <Text fontSize="sm" color="gray.600">Teléfono:</Text>
                        <Text fontWeight="bold">{selectedDocument.order.clientPhone}</Text>
                      </Box>
                      <Box>
                        <Text fontSize="sm" color="gray.600">Total:</Text>
                        <Text fontWeight="bold" color="blue.600">
                          S/ {parseFloat(selectedDocument.order.total || 0).toFixed(2)}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="sm" color="gray.600">Estado:</Text>
                        <Badge colorScheme="green">{selectedDocument.order.status}</Badge>
                      </Box>
                    </SimpleGrid>
                  </Box>
                )}
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onViewClose}>
              Cerrar
            </Button>
            <Button
              colorScheme="green"
              leftIcon={<FaDownload />}
              onClick={() => {
                handleDownload(selectedDocument?.filename);
                onViewClose();
              }}
            >
              Descargar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal para generar documento */}
      <Modal isOpen={isGenerateOpen} onClose={onGenerateClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Generar Documento</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>ID del Pedido</FormLabel>
                <Input
                  type="number"
                  value={generateForm.orderId}
                  onChange={(e) => setGenerateForm({ ...generateForm, orderId: e.target.value })}
                  placeholder="Ingrese el ID del pedido"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Tipo de Pedido</FormLabel>
                <Select
                  value={generateForm.orderType}
                  onChange={(e) => setGenerateForm({ ...generateForm, orderType: e.target.value })}
                >
                  <option value="regular">Cliente Frecuente</option>
                  <option value="guest">Invitado</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Tipo de Documento</FormLabel>
                <Select
                  value={generateForm.documentType}
                  onChange={(e) => setGenerateForm({ ...generateForm, documentType: e.target.value })}
                >
                  <option value="boleta">Boleta</option>
                  <option value="factura">Factura</option>
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onGenerateClose}>
              Cancelar
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleGenerate}
              isLoading={loading}
            >
              Generar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal para confirmar eliminación */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirmar Eliminación</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>
              ¿Está seguro de que desea eliminar el documento "{selectedDocument?.filename}"?
              Esta acción no se puede deshacer.
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onDeleteClose}>
              Cancelar
            </Button>
            <Button
              colorScheme="red"
              onClick={handleDelete}
              isLoading={loading}
            >
              Eliminar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Documents;
