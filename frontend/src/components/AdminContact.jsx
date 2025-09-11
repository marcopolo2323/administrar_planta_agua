import React from 'react';
import { 
  Box, 
  Button, 
  HStack, 
  VStack,
  Text, 
  Icon, 
  useToast,
  Tooltip,
  Badge
} from '@chakra-ui/react';
import { FaWhatsapp, FaPhone, FaEnvelope } from 'react-icons/fa';

const AdminContact = ({ variant = 'button', size = 'sm' }) => {
  const toast = useToast();
  
  const adminPhone = '+51 961 606 183';
  const adminEmail = 'aguademesaaquayara@gmail.com';
  
  const handleWhatsAppClick = () => {
    const message = encodeURIComponent('Hola, necesito ayuda con el sistema de AquaYara');
    const whatsappUrl = `https://wa.me/51961606183?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };
  
  const handlePhoneClick = () => {
    window.open(`tel:${adminPhone}`, '_self');
  };
  
  const handleEmailClick = () => {
    window.open(`mailto:${adminEmail}`, '_self');
  };
  
  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: 'Copiado',
        description: `${type} copiado al portapapeles`,
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    });
  };
  
  if (variant === 'badge') {
    return (
      <HStack spacing={2}>
        <Tooltip label="Contactar por WhatsApp" hasArrow>
          <Button
            size="xs"
            colorScheme="green"
            leftIcon={<Icon as={FaWhatsapp} />}
            onClick={handleWhatsAppClick}
          >
            WhatsApp
          </Button>
        </Tooltip>
        <Tooltip label="Llamar" hasArrow>
          <Button
            size="xs"
            variant="outline"
            leftIcon={<Icon as={FaPhone} />}
            onClick={handlePhoneClick}
          >
            {adminPhone}
          </Button>
        </Tooltip>
      </HStack>
    );
  }
  
  if (variant === 'info') {
    return (
      <Box p={3} bg="blue.50" borderRadius="md" border="1px solid" borderColor="blue.200">
        <Text fontSize="sm" fontWeight="bold" color="blue.700" mb={2}>
          📞 Soporte Técnico
        </Text>
        <VStack spacing={2} align="start">
          <HStack spacing={2}>
            <Icon as={FaWhatsapp} color="green.500" />
            <Text fontSize="sm" color="gray.600">
              WhatsApp: {adminPhone}
            </Text>
            <Button
              size="xs"
              variant="ghost"
              onClick={() => copyToClipboard(adminPhone, 'Teléfono')}
            >
              Copiar
            </Button>
          </HStack>
          <HStack spacing={2}>
            <Icon as={FaEnvelope} color="blue.500" />
            <Text fontSize="sm" color="gray.600">
              Email: {adminEmail}
            </Text>
            <Button
              size="xs"
              variant="ghost"
              onClick={() => copyToClipboard(adminEmail, 'Email')}
            >
              Copiar
            </Button>
          </HStack>
        </VStack>
      </Box>
    );
  }
  
  return (
    <HStack spacing={2}>
      <Tooltip label="Contactar por WhatsApp" hasArrow>
        <Button
          size={size}
          colorScheme="green"
          leftIcon={<Icon as={FaWhatsapp} />}
          onClick={handleWhatsAppClick}
        >
          WhatsApp
        </Button>
      </Tooltip>
      <Tooltip label="Llamar" hasArrow>
        <Button
          size={size}
          variant="outline"
          leftIcon={<Icon as={FaPhone} />}
          onClick={handlePhoneClick}
        >
          {adminPhone}
        </Button>
      </Tooltip>
    </HStack>
  );
};

export default AdminContact;
