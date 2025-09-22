import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Text,
  Box,
  VStack,
  HStack,
  Checkbox,
  Alert,
  AlertIcon,
  Spinner,
  Center,
  useColorModeValue,
  Divider,
  Badge
} from '@chakra-ui/react';
import axios from 'axios';

const TermsAndConditionsModal = ({ 
  isOpen, 
  onClose, 
  onAccept, 
  onReject,
  title = "Términos y Condiciones",
  showAcceptance = true 
}) => {
  const [terms, setTerms] = useState(null);
  const [loading, setLoading] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState(null);
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.700', 'gray.200');

  useEffect(() => {
    if (isOpen) {
      fetchActiveTerms();
    }
  }, [isOpen]);

  const fetchActiveTerms = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/terms-and-conditions/active');
      setTerms(response.data.data);
    } catch (error) {
      console.error('Error fetching terms:', error);
      setError('No se pudieron cargar los términos y condiciones');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = () => {
    if (accepted && onAccept) {
      onAccept(terms);
    }
  };

  const handleReject = () => {
    if (onReject) {
      onReject();
    } else {
      onClose();
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
      <ModalOverlay />
      <ModalContent maxW="800px" maxH="90vh" bg={bgColor}>
        <ModalHeader>
          <VStack align="stretch" spacing={2}>
            <Text fontSize="xl" fontWeight="bold" color="blue.600">
              {title}
            </Text>
            {terms && (
              <HStack justify="space-between">
                <Badge colorScheme="blue" variant="subtle">
                  Versión {terms.version}
                </Badge>
                <Text fontSize="sm" color="gray.500">
                  Vigente desde: {formatDate(terms.effectiveDate)}
                </Text>
              </HStack>
            )}
          </VStack>
        </ModalHeader>
        
        <ModalBody overflowY="auto" pb={4}>
          {loading && (
            <Center py={8}>
              <Spinner size="xl" />
            </Center>
          )}

          {error && (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              <Text>{error}</Text>
            </Alert>
          )}

          {terms && !loading && (
            <Box>
              <Text fontSize="lg" fontWeight="semibold" mb={4} color={textColor}>
                {terms.title}
              </Text>
              
              <Divider mb={4} />
              
              <Box
                whiteSpace="pre-wrap"
                fontSize="sm"
                lineHeight="1.6"
                color={textColor}
                maxH="400px"
                overflowY="auto"
                p={4}
                bg={useColorModeValue('gray.50', 'gray.700')}
                borderRadius="md"
                border="1px solid"
                borderColor={useColorModeValue('gray.200', 'gray.600')}
              >
                {terms.content}
              </Box>
            </Box>
          )}
        </ModalBody>

        {showAcceptance && terms && !loading && (
          <ModalFooter>
            <VStack w="full" spacing={4}>
              <Checkbox
                isChecked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                colorScheme="blue"
                size="lg"
              >
                <Text fontSize="sm">
                  He leído y acepto los términos y condiciones
                </Text>
              </Checkbox>
              
              <HStack w="full" justify="space-between">
                <Button
                  variant="outline"
                  onClick={handleReject}
                  colorScheme="red"
                >
                  Rechazar
                </Button>
                <Button
                  colorScheme="blue"
                  onClick={handleAccept}
                  isDisabled={!accepted}
                >
                  Aceptar
                </Button>
              </HStack>
            </VStack>
          </ModalFooter>
        )}

        {!showAcceptance && (
          <ModalFooter>
            <Button onClick={onClose} colorScheme="blue">
              Cerrar
            </Button>
          </ModalFooter>
        )}
      </ModalContent>
    </Modal>
  );
};

export default TermsAndConditionsModal;
