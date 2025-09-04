import React, { forwardRef } from 'react';
import { Icon } from '@chakra-ui/react';
import { useId } from 'react';

// Componente personalizado para reemplazar el Spinner de @chakra-ui/icons
const ChakraIconSpinner = forwardRef((props, ref) => {
  const id = useId();
  return (
    <Icon ref={ref} viewBox="0 0 24 24" {...props}>
      <defs>
        <linearGradient
          x1="28.154%"
          y1="63.74%"
          x2="74.629%"
          y2="17.783%"
          id={id}
        >
          <stop stopColor="currentColor" offset="0%" />
          <stop stopColor="#fff" stopOpacity="0" offset="100%" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="10" fill={`url(#${id})`} />
    </Icon>
  );
});

ChakraIconSpinner.displayName = "ChakraIconSpinner";

export default ChakraIconSpinner;