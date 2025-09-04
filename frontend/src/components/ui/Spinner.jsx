import React from 'react';
import { Spinner as ChakraSpinner } from '@chakra-ui/react';

// Este componente es un wrapper para el Spinner de Chakra UI
// que evita el problema con forwardRef
const Spinner = (props) => {
  return <ChakraSpinner {...props} />;
};

export default Spinner;