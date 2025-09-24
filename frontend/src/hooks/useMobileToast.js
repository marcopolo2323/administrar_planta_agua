import { useToast } from '@chakra-ui/react';
import { useBreakpointValue } from '@chakra-ui/react';

export const useMobileToast = () => {
  const toast = useToast();
  const isMobile = useBreakpointValue({ base: true, md: false });

  const showToast = (options) => {
    const {
      title,
      description,
      status = 'success',
      duration = 3000,
      position = 'top',
      ...rest
    } = options;

    // Configuración optimizada para móviles
    if (isMobile) {
      return toast({
        title,
        description,
        status,
        duration: 2000, // Más corto en móviles
        position: 'top',
        size: 'sm',
        variant: 'subtle',
        isClosable: true,
        containerStyle: {
          maxWidth: '90vw',
          fontSize: 'sm',
          padding: '8px 12px',
          borderRadius: '8px',
          boxShadow: 'sm',
          margin: '8px',
          zIndex: 9999,
        },
        ...rest
      });
    }

    // Configuración para desktop
    return toast({
      title,
      description,
      status,
      duration: 3000,
      position: 'top',
      size: 'md',
      variant: 'solid',
      isClosable: true,
      containerStyle: {
        maxWidth: '400px',
        fontSize: 'md',
        padding: '12px 16px',
        borderRadius: '12px',
        boxShadow: 'lg',
        margin: '16px',
        zIndex: 9999,
      },
      ...rest
    });
  };

  return { showToast };
};
