import { createStandaloneToast } from '@chakra-ui/react';
import { useBreakpointValue } from '@chakra-ui/react';

// Configuración global para toasts más sutiles
export const createSubtleToast = () => {
  const { toast } = createStandaloneToast();

  const showToast = (options) => {
    const {
      title,
      description,
      status = 'success',
      duration = 3000,
      position = 'top',
      ...rest
    } = options;

    // Detectar si es móvil basado en el ancho de pantalla
    const isMobile = window.innerWidth < 768;

    // Configuración para móviles
    const mobileConfig = {
      title,
      description,
      status,
      duration: isMobile ? 2000 : duration, // Más corto en móviles
      position: isMobile ? 'top' : position,
      size: isMobile ? 'sm' : 'md',
      variant: isMobile ? 'subtle' : 'solid',
      isClosable: true,
      containerStyle: {
        maxWidth: isMobile ? '90vw' : '400px',
        fontSize: isMobile ? 'sm' : 'md',
        padding: isMobile ? '8px 12px' : '12px 16px',
        borderRadius: isMobile ? '8px' : '12px',
        boxShadow: isMobile ? 'sm' : 'lg',
        margin: isMobile ? '8px' : '16px',
        zIndex: 9999,
      },
      ...rest
    };

    // Configuración para desktop
    const desktopConfig = {
      title,
      description,
      status,
      duration,
      position,
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
    };

    return toast(isMobile ? mobileConfig : desktopConfig);
  };

  return { showToast };
};

// Hook personalizado para usar en componentes
export const useSubtleToast = () => {
  const { showToast } = createSubtleToast();
  return { showToast };
};
