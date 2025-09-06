import React, { useState, useEffect } from 'react';
import { Box, Text, Badge, Button, VStack, HStack } from '@chakra-ui/react';

const TokenDebug = () => {
  const [tokenInfo, setTokenInfo] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  const checkToken = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setTokenInfo(null);
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = payload.exp - now;
      const hoursUntilExpiry = Math.floor(timeUntilExpiry / 3600);
      const minutesUntilExpiry = Math.floor((timeUntilExpiry % 3600) / 60);

      setTokenInfo({
        userId: payload.id,
        role: payload.role,
        issuedAt: new Date(payload.iat * 1000).toLocaleString(),
        expiresAt: new Date(payload.exp * 1000).toLocaleString(),
        timeUntilExpiry: timeUntilExpiry,
        hoursUntilExpiry,
        minutesUntilExpiry,
        isExpired: timeUntilExpiry <= 0
      });
    } catch (error) {
      console.error('Error al decodificar token:', error);
      setTokenInfo({ error: 'Token inválido' });
    }
  };

  useEffect(() => {
    checkToken();
    const interval = setInterval(checkToken, 10000); // Verificar cada 10 segundos
    return () => clearInterval(interval);
  }, []);

  if (!isVisible) {
    return (
      <Button
        position="fixed"
        bottom="20px"
        right="20px"
        size="sm"
        colorScheme="blue"
        onClick={() => setIsVisible(true)}
      >
        Debug Token
      </Button>
    );
  }

  return (
    <Box
      position="fixed"
      bottom="20px"
      right="20px"
      bg="white"
      p={4}
      borderRadius="md"
      boxShadow="lg"
      border="1px solid"
      borderColor="gray.200"
      maxW="300px"
      zIndex={1000}
    >
      <VStack align="stretch" spacing={2}>
        <HStack justify="space-between">
          <Text fontWeight="bold" fontSize="sm">Token Debug</Text>
          <Button size="xs" onClick={() => setIsVisible(false)}>×</Button>
        </HStack>
        
        {tokenInfo ? (
          <>
            <Text fontSize="xs">Usuario: {tokenInfo.userId}</Text>
            <Text fontSize="xs">Rol: {tokenInfo.role}</Text>
            <Text fontSize="xs">Expira: {tokenInfo.expiresAt}</Text>
            <HStack>
              <Text fontSize="xs">Tiempo restante:</Text>
              <Badge 
                colorScheme={tokenInfo.isExpired ? 'red' : tokenInfo.timeUntilExpiry < 3600 ? 'yellow' : 'green'}
              >
                {tokenInfo.isExpired ? 'EXPIRADO' : `${tokenInfo.hoursUntilExpiry}h ${tokenInfo.minutesUntilExpiry}m`}
              </Badge>
            </HStack>
          </>
        ) : (
          <Text fontSize="xs" color="red.500">No hay token</Text>
        )}
        
        <Button size="xs" onClick={checkToken}>
          Actualizar
        </Button>
      </VStack>
    </Box>
  );
};

export default TokenDebug;
