import React from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  Card,
  CardBody,
  Icon,
  useColorModeValue,
  Container,
  Divider,
  Badge
} from '@chakra-ui/react';
import { FaLock, FaPhone, FaExclamationTriangle } from 'react-icons/fa';
import AquaYaraLogo from './AquaYaraLogo';

const SystemExpired = () => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('red.200', 'red.600');
  const textColor = useColorModeValue('gray.700', 'gray.200');

  return (
    <Container maxW="md" centerContent>
      <VStack spacing={6} py={8}>
        {/* Logo */}
        <AquaYaraLogo 
          size="lg" 
          variant="horizontal" 
          color="red.500" 
          textColor="red.600" 
          taglineColor="red.400"
        />

        {/* Card principal */}
        <Card 
          bg={cardBg} 
          borderColor={borderColor}
          borderWidth="2px"
          boxShadow="xl"
          borderRadius="xl"
          w="100%"
        >
          <CardBody p={8}>
            <VStack spacing={6} textAlign="center">
              {/* Icono de bloqueo */}
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                w="80px"
                h="80px"
                borderRadius="full"
                bg="red.100"
                color="red.500"
              >
                <Icon as={FaLock} boxSize={10} />
              </Box>

              {/* Título */}
              <VStack spacing={2}>
                <Heading size="lg" color="red.500">
                  Sistema Expirado
                </Heading>
                <Badge colorScheme="red" variant="solid" fontSize="sm" px={3} py={1}>
                  <Icon as={FaExclamationTriangle} mr={1} />
                  Acceso Restringido
                </Badge>
              </VStack>

              {/* Mensaje principal */}
              <VStack spacing={4}>
                <Text fontSize="md" color={textColor} lineHeight="1.6">
                  El período de prueba del sistema ha expirado.
                </Text>
                
                <Text fontSize="sm" color="gray.500" lineHeight="1.5">
                  Para continuar utilizando este sistema o resolver cualquier problema técnico, 
                  contacta con el programador.
                </Text>
              </VStack>

              <Divider />

              {/* Información de contacto */}
              <VStack spacing={4} w="100%">
                <Text fontSize="sm" fontWeight="bold" color="gray.600">
                  📞 Contacto del Programador
                </Text>
                
                <Card bg="blue.50" borderColor="blue.200" w="100%">
                  <CardBody p={4}>
                    <VStack spacing={3}>
                      <Text fontSize="lg" fontWeight="bold" color="blue.600">
                        987654321
                      </Text>
                      <Text fontSize="sm" color="blue.500">
                        Disponible para soporte técnico y renovación del sistema
                      </Text>
                    </VStack>
                  </CardBody>
                </Card>

                <Button
                  colorScheme="blue"
                  size="lg"
                  w="100%"
                  leftIcon={<Icon as={FaPhone} />}
                  onClick={() => {
                    // Abrir WhatsApp con el número
                    window.open('https://wa.me/51987654321?text=Hola, necesito soporte técnico para el sistema AquaYara', '_blank');
                  }}
                  _hover={{
                    transform: 'translateY(-2px)',
                    boxShadow: 'lg'
                  }}
                  transition="all 0.2s"
                >
                  Contactar por WhatsApp
                </Button>
              </VStack>

              {/* Información adicional */}
              <VStack spacing={2} pt={4}>
                <Text fontSize="xs" color="gray.400" textAlign="center">
                  Sistema desarrollado por: Programador de Software
                </Text>
                <Text fontSize="xs" color="gray.400">
                  © 2024 AquaYara - Todos los derechos reservados
                </Text>
              </VStack>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  );
};

export default SystemExpired;
