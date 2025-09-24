import { Outlet } from 'react-router-dom';
import { Box, Flex, VStack, Heading, Text } from '@chakra-ui/react';

const AuthLayout = () => {
  return (
    <Flex
      justify="center"
      align="center"
      minH="100vh"
      bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
    >
      <Box
        w="100%"
        maxW="450px"
        p={8}
        bg="white"
        borderRadius="8px"
        boxShadow="0 4px 12px rgba(0, 0, 0, 0.1)"
      >
        <VStack spacing={4} mb={8} textAlign="center">
          <Heading color="blue.600" size="lg">
            Sistema de Gestión
          </Heading>
          <Text color="gray.600">
            Planta de Agua
          </Text>
        </VStack>
        <Outlet />
      </Box>
    </Flex>
  );
};

export default AuthLayout;