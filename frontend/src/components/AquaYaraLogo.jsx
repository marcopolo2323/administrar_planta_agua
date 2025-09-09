import React from 'react';
import { Box, Image, Text, VStack, HStack } from '@chakra-ui/react';
import logoImage from '../assets/images/logo_aquayara2.jpeg';

const AquaYaraLogo = ({ 
  size = 'md', 
  showText = true, 
  variant = 'horizontal',
  color = 'blue.500',
  textColor = 'blue.500',
  taglineColor = 'teal.400'
}) => {
  const sizes = {
    xs: { logo: '20px', text: 'xs', tagline: 'xs' },
    sm: { logo: '30px', text: 'sm', tagline: 'xs' },
    md: { logo: '40px', text: 'md', tagline: 'sm' },
    lg: { logo: '60px', text: 'lg', tagline: 'md' },
    xl: { logo: '80px', text: 'xl', tagline: 'lg' }
  };

  const currentSize = sizes[size] || sizes.md;

  const LogoIcon = () => (
    <Image
      src={logoImage}
      alt="AquaYara Logo"
      w={currentSize.logo}
      h={currentSize.logo}
      objectFit="contain"
      borderRadius="md"
      boxShadow="0 2px 8px rgba(0,0,0,0.1)"
    />
  );

  if (!showText) {
    return <LogoIcon />;
  }

  if (variant === 'vertical') {
    return (
      <VStack spacing={2} align="center">
        <LogoIcon />
        <VStack spacing={0} align="center">
          <Text
            fontSize={currentSize.text}
            fontWeight="bold"
            color={textColor}
            lineHeight="1"
          >
            Aqua<span style={{ color: '#38B2AC' }}>Yara</span>
          </Text>
          <Text
            fontSize={currentSize.tagline}
            color={taglineColor}
            fontStyle="italic"
            lineHeight="1"
          >
            Agua que encanta
          </Text>
        </VStack>
      </VStack>
    );
  }

  return (
    <HStack spacing={3} align="center">
      <LogoIcon />
      <VStack spacing={0} align="start">
        <Text
          fontSize={currentSize.text}
          fontWeight="bold"
          color={textColor}
          lineHeight="1"
        >
          Aqua<span style={{ color: '#38B2AC' }}>Yara</span>
        </Text>
        <Text
          fontSize={currentSize.tagline}
          color={taglineColor}
          fontStyle="italic"
          lineHeight="1"
        >
          Agua que encanta
        </Text>
      </VStack>
    </HStack>
  );
};

export default AquaYaraLogo;
