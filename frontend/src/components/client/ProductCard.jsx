import React from 'react';
import {
  Box,
  Image,
  Text,
  Stack,
  Heading,
  Badge,
  Button,
  Flex,
  useColorModeValue,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Placeholder de imagen si no hay URL disponible
  const imageUrl = product.imageUrl || 'https://via.placeholder.com/300x200?text=Producto+de+Agua';

  const handleOrderNow = () => {
    navigate('/client/new-order', { state: { selectedProduct: product } });
  };

  return (
    <Box
      maxW="sm"
      borderWidth="1px"
      borderRadius="lg"
      borderColor={borderColor}
      overflow="hidden"
      bg={cardBg}
      boxShadow="sm"
      transition="all 0.3s"
      _hover={{ boxShadow: 'md', transform: 'translateY(-2px)' }}
    >
      <Image
        src={imageUrl}
        alt={product.name}
        height="200px"
        width="100%"
        objectFit="cover"
      />

      <Box p={5}>
        <Stack spacing={2}>
          <Flex justify="space-between" align="center">
            <Heading size="md" isTruncated>
              {product.name}
            </Heading>
            {product.stock > 0 ? (
              <Badge colorScheme="green" fontSize="0.8em" px={2} py={1} borderRadius="md">
                Disponible
              </Badge>
            ) : (
              <Badge colorScheme="red" fontSize="0.8em" px={2} py={1} borderRadius="md">
                Agotado
              </Badge>
            )}
          </Flex>

          <Text color="gray.500" fontSize="sm">
            {product.description}
          </Text>

          <Flex justify="space-between" align="center" mt={2}>
            <Text fontWeight="bold" fontSize="xl" color="blue.600">
              S/ {product.price.toFixed(2)}
            </Text>
            <Text fontSize="sm" color="gray.500">
              {product.unit}
            </Text>
          </Flex>

          <Button
            colorScheme="blue"
            mt={3}
            onClick={handleOrderNow}
            isDisabled={product.stock <= 0}
          >
            Ordenar Ahora
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};

export default ProductCard;