import React from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Divider,
  Link as ChakraLink,
  Icon
} from '@chakra-ui/react';
import { FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import { TermsAndConditionsButton, PrivacyPolicyButton } from './TermsAndConditions';

const Footer = () => {
  return (
    <Box bg="gray.50" py={8} mt="auto">
      <Container maxW="container.xl">
        <VStack spacing={6}>
          {/* Información de contacto */}
          <HStack spacing={8} wrap="wrap" justify="center">
            <HStack spacing={2}>
              <Icon as={FaPhone} color="blue.500" />
              <Text fontSize="sm" color="gray.600">
                +51 961 606 183
              </Text>
            </HStack>
            <HStack spacing={2}>
              <Icon as={FaEnvelope} color="blue.500" />
              <Text fontSize="sm" color="gray.600">
                aguademesaaquayara@gmail.com
              </Text>
            </HStack>
            <HStack spacing={2}>
              <Icon as={FaMapMarkerAlt} color="blue.500" />
              <Text fontSize="sm" color="gray.600">
                Pucallpa, Perú
              </Text>
            </HStack>
          </HStack>

          <Divider />

          {/* Enlaces legales */}
          <HStack spacing={6} wrap="wrap" justify="center">
            <TermsAndConditionsButton />
            <PrivacyPolicyButton />
            <ChakraLink
              href="mailto:aguademesaaquayara@gmail.com"
              color="blue.500"
              fontSize="sm"
              _hover={{ textDecoration: 'underline' }}
            >
              Soporte Técnico
            </ChakraLink>
          </HStack>

          <Divider />

          {/* Copyright */}
          <VStack spacing={2}>
            <Text fontSize="sm" color="gray.500" textAlign="center">
              © 2025 AquaYara - Agua Purificada de Calidad
            </Text>
            <Text fontSize="xs" color="gray.400" textAlign="center">
              Todos los derechos reservados | Horario: Lunes a Sábado 8:00 AM - 6:00 PM
            </Text>
          </VStack>
        </VStack>
      </Container>
    </Box>
  );
};

export default Footer;
