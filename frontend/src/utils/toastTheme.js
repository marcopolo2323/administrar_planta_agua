// Configuración global para toasts más sutiles
export const toastTheme = {
  components: {
    Toast: {
      baseStyle: {
        container: {
          // Configuración para móviles
          '@media (max-width: 768px)': {
            maxWidth: '90vw',
            fontSize: 'sm',
            padding: '8px 12px',
            borderRadius: '8px',
            boxShadow: 'sm',
            margin: '8px',
            zIndex: 9999,
          },
          // Configuración para desktop
          '@media (min-width: 769px)': {
            maxWidth: '400px',
            fontSize: 'md',
            padding: '12px 16px',
            borderRadius: '12px',
            boxShadow: 'lg',
            margin: '16px',
            zIndex: 9999,
          },
        },
      },
      variants: {
        subtle: {
          container: {
            bg: 'white',
            border: '1px solid',
            borderColor: 'gray.200',
            color: 'gray.700',
          },
        },
      },
    },
  },
};

// Configuración por defecto para toasts
export const defaultToastOptions = {
  duration: 3000,
  position: 'top',
  isClosable: true,
  variant: 'subtle',
};
