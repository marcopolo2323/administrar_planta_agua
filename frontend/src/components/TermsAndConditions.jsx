import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  Text,
  Box,
  Divider,
  Heading,
  UnorderedList,
  ListItem,
  Link,
  useDisclosure,
  IconButton
} from '@chakra-ui/react';
import { ExternalLinkIcon, InfoIcon } from '@chakra-ui/icons';

const TermsAndConditions = ({ isOpen, onClose, showAcceptButton = false, onAccept }) => {
  const [accepted, setAccepted] = useState(false);

  const handleAccept = () => {
    setAccepted(true);
    if (onAccept) {
      onAccept();
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent maxH="90vh">
        <ModalHeader>
          <Heading size="md">Términos y Condiciones - AquaYara</Heading>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={4} align="stretch">
            <Text fontSize="sm" color="gray.600">
              <strong>Fecha de última actualización:</strong> 10 de enero de 2025
            </Text>

            <Box>
              <Heading size="sm" mb={2}>1. Información General</Heading>
              <Text fontSize="sm" mb={2}>
                <strong>AquaYara</strong> es una empresa dedicada a la purificación y distribución de agua, 
                con domicilio legal en Pucallpa, Perú.
              </Text>
              <Text fontSize="sm">
                Proporcionamos servicios de purificación de agua, distribución, sistema de suscripciones, 
                servicio de delivery y gestión de clientes frecuentes.
              </Text>
            </Box>

            <Box>
              <Heading size="sm" mb={2}>2. Aceptación de Términos</Heading>
              <Text fontSize="sm" mb={2}>
                Al utilizar nuestros servicios, usted acepta estos términos y condiciones en su totalidad. 
                Si no está de acuerdo con alguna parte de estos términos, no debe utilizar nuestros servicios.
              </Text>
              <Text fontSize="sm">
                Nos reservamos el derecho de modificar estos términos en cualquier momento. 
                Las modificaciones entrarán en vigor inmediatamente después de su publicación.
              </Text>
            </Box>

            <Box>
              <Heading size="sm" mb={2}>3. Servicios Ofrecidos</Heading>
              <UnorderedList fontSize="sm" spacing={1}>
                <ListItem>Bidón de Agua 20L y Paquete de Botellas</ListItem>
                <ListItem>Servicio de entrega a domicilio con tarifas según distrito</ListItem>
                <ListItem>Horarios de entrega: Lunes a Sábado de 8:00 AM a 6:00 PM</ListItem>
                <ListItem>Sistema de suscripciones con bonificaciones</ListItem>
                <ListItem>Control de botellas restantes y pagos mensuales automáticos</ListItem>
              </UnorderedList>
            </Box>

            <Box>
              <Heading size="sm" mb={2}>4. Precios y Pagos</Heading>
              <Text fontSize="sm" mb={2}>
                Los precios están sujetos a cambios sin previo aviso. Aceptamos efectivo, 
                tarjeta de crédito/débito, Yape y Plin.
              </Text>
              <Text fontSize="sm">
                Los pagos deben realizarse al momento de la entrega. Los pagos mensuales 
                de suscripciones se procesan automáticamente.
              </Text>
            </Box>

            <Box>
              <Heading size="sm" mb={2}>5. Entregas y Devoluciones</Heading>
              <Text fontSize="sm" mb={2}>
                Las entregas se realizan en el horario acordado. El cliente debe estar presente 
                para recibir el pedido. En caso de ausencia, se reprogramará la entrega.
              </Text>
              <Text fontSize="sm">
                No se aceptan devoluciones de productos abiertos. Las devoluciones deben 
                solicitarse dentro de las 24 horas posteriores a la entrega.
              </Text>
            </Box>

            <Box>
              <Heading size="sm" mb={2}>6. Responsabilidades del Cliente</Heading>
              <UnorderedList fontSize="sm" spacing={1}>
                <ListItem>Proporcionar información veraz y actualizada</ListItem>
                <ListItem>No utilizar el sistema para fines ilegales</ListItem>
                <ListItem>No compartir credenciales de acceso</ListItem>
                <ListItem>Notificar cualquier uso no autorizado de su cuenta</ListItem>
              </UnorderedList>
            </Box>

            <Box>
              <Heading size="sm" mb={2}>7. Privacidad y Protección de Datos</Heading>
              <Text fontSize="sm" mb={2}>
                Recopilamos datos personales, de uso y técnicos para procesar pedidos, 
                comunicarnos con usted y mejorar nuestros servicios.
              </Text>
              <Text fontSize="sm">
                Implementamos medidas de seguridad como encriptación de datos sensibles, 
                acceso restringido y políticas de confidencialidad.
              </Text>
            </Box>

            <Box>
              <Heading size="sm" mb={2}>8. Sus Derechos</Heading>
              <UnorderedList fontSize="sm" spacing={1}>
                <ListItem>Derecho de acceso a sus datos</ListItem>
                <ListItem>Derecho de rectificación de información inexacta</ListItem>
                <ListItem>Derecho de eliminación de datos</ListItem>
                <ListItem>Derecho de portabilidad de datos</ListItem>
                <ListItem>Derecho de oposición al tratamiento</ListItem>
              </UnorderedList>
            </Box>

            <Box>
              <Heading size="sm" mb={2}>9. Contacto</Heading>
              <Text fontSize="sm" mb={1}>
                <strong>Teléfono:</strong> +51 961 606 183
              </Text>
              <Text fontSize="sm" mb={1}>
                <strong>Email:</strong> aguademesaaquayara@gmail.com
              </Text>
              <Text fontSize="sm" mb={1}>
                <strong>Dirección:</strong> Pucallpa, Perú
              </Text>
              <Text fontSize="sm">
                <strong>Horario:</strong> Lunes a Sábado 8:00 AM - 6:00 PM
              </Text>
            </Box>

            <Divider />

            <Text fontSize="xs" color="gray.500" textAlign="center">
              Al utilizar nuestros servicios, usted confirma que ha leído, entendido y aceptado 
              estos términos y condiciones.
            </Text>

            {showAcceptButton && (
              <Box textAlign="center" pt={4}>
                <Button
                  colorScheme="blue"
                  onClick={handleAccept}
                  isDisabled={accepted}
                  size="lg"
                  width="full"
                >
                  {accepted ? 'Aceptado' : 'Acepto los Términos y Condiciones'}
                </Button>
              </Box>
            )}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

// Componente para mostrar el botón de términos y condiciones
export const TermsAndConditionsButton = ({ onAccept, showAcceptButton = false }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Button
        variant="link"
        size="sm"
        color="blue.500"
        onClick={onOpen}
        leftIcon={<InfoIcon />}
      >
        Términos y Condiciones
      </Button>
      <TermsAndConditions
        isOpen={isOpen}
        onClose={onClose}
        showAcceptButton={showAcceptButton}
        onAccept={onAccept}
      />
    </>
  );
};

// Componente para mostrar el enlace de política de privacidad
export const PrivacyPolicyButton = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Button
        variant="link"
        size="sm"
        color="blue.500"
        onClick={onOpen}
        leftIcon={<ExternalLinkIcon />}
      >
        Política de Privacidad
      </Button>
      <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent maxH="90vh">
          <ModalHeader>
            <Heading size="md">Política de Privacidad - AquaYara</Heading>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4} align="stretch">
              <Text fontSize="sm" color="gray.600">
                <strong>Fecha de última actualización:</strong> 10 de enero de 2025
              </Text>

              <Box>
                <Heading size="sm" mb={2}>1. Información General</Heading>
                <Text fontSize="sm" mb={2}>
                  <strong>AquaYara</strong> es responsable del tratamiento de sus datos personales.
                </Text>
                <Text fontSize="sm">
                  <strong>Contacto:</strong> aguademesaaquayara@gmail.com | +51 961 606 183
                </Text>
              </Box>

              <Box>
                <Heading size="sm" mb={2}>2. Datos que Recopilamos</Heading>
                <UnorderedList fontSize="sm" spacing={1}>
                  <ListItem><strong>Datos Personales:</strong> Nombre, DNI/RUC, email, teléfono, dirección</ListItem>
                  <ListItem><strong>Datos de Uso:</strong> Historial de pedidos, preferencias, patrones de compra</ListItem>
                  <ListItem><strong>Datos Técnicos:</strong> IP, dispositivo, navegador, fecha y hora</ListItem>
                </UnorderedList>
              </Box>

              <Box>
                <Heading size="sm" mb={2}>3. Finalidades del Tratamiento</Heading>
                <UnorderedList fontSize="sm" spacing={1}>
                  <ListItem>Procesar pedidos y gestionar entregas</ListItem>
                  <ListItem>Comunicarnos con usted</ListItem>
                  <ListItem>Procesar pagos y generar comprobantes</ListItem>
                  <ListItem>Mejorar nuestros servicios</ListItem>
                  <ListItem>Prevenir fraudes y proteger el sistema</ListItem>
                </UnorderedList>
              </Box>

              <Box>
                <Heading size="sm" mb={2}>4. Sus Derechos</Heading>
                <UnorderedList fontSize="sm" spacing={1}>
                  <ListItem>Derecho de acceso a sus datos</ListItem>
                  <ListItem>Derecho de rectificación</ListItem>
                  <ListItem>Derecho de eliminación</ListItem>
                  <ListItem>Derecho de portabilidad</ListItem>
                  <ListItem>Derecho de oposición</ListItem>
                </UnorderedList>
              </Box>

              <Box>
                <Heading size="sm" mb={2}>5. Seguridad</Heading>
                <Text fontSize="sm">
                  Implementamos medidas de seguridad como encriptación de datos sensibles, 
                  acceso restringido, monitoreo continuo y políticas de confidencialidad.
                </Text>
              </Box>

              <Box>
                <Heading size="sm" mb={2}>6. Contacto</Heading>
                <Text fontSize="sm" mb={1}>
                  <strong>Email:</strong> aguademesaaquayara@gmail.com
                </Text>
                <Text fontSize="sm" mb={1}>
                  <strong>Teléfono:</strong> +51 961 606 183
                </Text>
                <Text fontSize="sm">
                  <strong>Autoridad de Control:</strong> proteccion.datos@minjus.gob.pe
                </Text>
              </Box>

              <Divider />

              <Text fontSize="xs" color="gray.500" textAlign="center">
                Esta política se rige por la Ley de Protección de Datos Personales del Perú (Ley N° 29733).
              </Text>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default TermsAndConditions;
