import { extendTheme, keyframes } from '@chakra-ui/react';
import { zIndices } from './zIndex';

// Animaciones personalizadas
const pulse = keyframes`
  0% { opacity: 0.8; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(1.2); }
  100% { opacity: 0.8; transform: scale(1); }
`;

// Configuración personalizada del tema
const theme = extendTheme({
  // Z-Index personalizado
  zIndices,
  
  // Animaciones globales
  styles: {
    global: {
      '.pulse-animation': {
        animation: `${pulse} 2s infinite`,
      },
    },
  },
  
  // Configuración de componentes específicos
  components: {
    // Modal con z-index personalizado
    Modal: {
      baseStyle: {
        overlay: {
          zIndex: zIndices.modal,
        },
        dialogContainer: {
          zIndex: zIndices.modal,
        },
      },
    },
    
    // Menu/Dropdown con z-index personalizado  
    Menu: {
      baseStyle: {
        list: {
          zIndex: zIndices.dropdown,
        },
      },
    },
    
    // Popover con z-index personalizado
    Popover: {
      baseStyle: {
        content: {
          zIndex: zIndices.popover,
        },
      },
    },
    
    // Tooltip con z-index personalizado
    Tooltip: {
      baseStyle: {
        zIndex: zIndices.tooltip,
      },
    },
    
    // Drawer con z-index personalizado
    Drawer: {
      baseStyle: {
        overlay: {
          zIndex: zIndices.modal,
        },
        dialogContainer: {
          zIndex: zIndices.modal,
        },
      },
    },
  },
  
  // Colores personalizados (mantener los existentes)
  colors: {
    brand: {
      50: '#e3f2fd',
      100: '#bbdefb',
      200: '#90caf9',
      300: '#64b5f6',
      400: '#42a5f5',
      500: '#2196f3',
      600: '#1e88e5',
      700: '#1976d2',
      800: '#1565c0',
      900: '#0d47a1',
    },
  },
});

export default theme;
