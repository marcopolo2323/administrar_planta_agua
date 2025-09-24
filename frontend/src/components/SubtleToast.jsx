import React from 'react';
import {
  Box,
  Text,
  Icon,
  useBreakpointValue,
  useColorModeValue,
  CloseButton,
  HStack,
  VStack
} from '@chakra-ui/react';
import { FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaTimesCircle } from 'react-icons/fa';

const SubtleToast = ({ 
  title, 
  description, 
  status = 'success', 
  onClose, 
  duration = 3000 
}) => {
  const isMobile = useBreakpointValue({ base: true, md: false });
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  // Configurar colores según el status
  const getStatusConfig = (status) => {
    switch (status) {
      case 'success':
        return {
          icon: FaCheckCircle,
          color: 'green.500',
          bgColor: 'green.50',
          borderColor: 'green.200'
        };
      case 'error':
        return {
          icon: FaTimesCircle,
          color: 'red.500',
          bgColor: 'red.50',
          borderColor: 'red.200'
        };
      case 'warning':
        return {
          icon: FaExclamationTriangle,
          color: 'orange.500',
          bgColor: 'orange.50',
          borderColor: 'orange.200'
        };
      case 'info':
        return {
          icon: FaInfoCircle,
          color: 'blue.500',
          bgColor: 'blue.50',
          borderColor: 'blue.200'
        };
      default:
        return {
          icon: FaCheckCircle,
          color: 'green.500',
          bgColor: 'green.50',
          borderColor: 'green.200'
        };
    }
  };

  const statusConfig = getStatusConfig(status);

  // Auto-close después del duration
  React.useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <Box
      bg={isMobile ? statusConfig.bgColor : bg}
      border="1px solid"
      borderColor={isMobile ? statusConfig.borderColor : borderColor}
      borderRadius={isMobile ? '8px' : '12px'}
      p={isMobile ? '8px 12px' : '12px 16px'}
      maxW={isMobile ? '90vw' : '400px'}
      boxShadow={isMobile ? 'sm' : 'lg'}
      position="fixed"
      top={isMobile ? '10px' : '20px'}
      right={isMobile ? '10px' : '20px'}
      zIndex={9999}
      animation="slideInRight 0.3s ease-out"
      fontSize={isMobile ? 'sm' : 'md'}
    >
      <HStack spacing={3} align="flex-start">
        <Icon
          as={statusConfig.icon}
          color={statusConfig.color}
          boxSize={isMobile ? '16px' : '20px'}
          flexShrink={0}
          mt="1px"
        />
        
        <VStack spacing={1} align="flex-start" flex={1} minW={0}>
          {title && (
            <Text
              fontWeight="bold"
              color={isMobile ? statusConfig.color : 'gray.700'}
              fontSize={isMobile ? 'sm' : 'md'}
              lineHeight="1.2"
            >
              {title}
            </Text>
          )}
          {description && (
            <Text
              color={isMobile ? 'gray.600' : 'gray.600'}
              fontSize={isMobile ? 'xs' : 'sm'}
              lineHeight="1.3"
              noOfLines={3}
            >
              {description}
            </Text>
          )}
        </VStack>

        {onClose && (
          <CloseButton
            size="sm"
            onClick={onClose}
            color={isMobile ? statusConfig.color : 'gray.400'}
            _hover={{ color: statusConfig.color }}
            flexShrink={0}
          />
        )}
      </HStack>

      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </Box>
  );
};

export default SubtleToast;
