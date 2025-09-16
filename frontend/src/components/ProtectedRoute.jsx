import { Navigate } from 'react-router-dom';
import { useRole } from '../hooks/useRole';
import { Box, Text, VStack, Button } from '@chakra-ui/react';
import { FaShieldAlt, FaArrowLeft } from 'react-icons/fa';

const ProtectedRoute = ({ 
  children, 
  requiredRoles, 
  fallbackPath = '/login',
  showAccessDenied = true 
}) => {
  const { canAccess, user } = useRole();

  // Si no hay usuario autenticado, redirigir al login
  if (!user) {
    console.log('🔍 ProtectedRoute: No hay usuario autenticado, redirigiendo al login');
    return <Navigate to={fallbackPath} replace />;
  }

  // Si el usuario no tiene los roles requeridos
  if (!canAccess(requiredRoles)) {
    console.log('🔍 ProtectedRoute: Usuario no tiene permisos', {
      userRole: user.role,
      requiredRoles,
      canAccess: canAccess(requiredRoles)
    });
    if (!showAccessDenied) {
      return <Navigate to="/dashboard" replace />;
    }

    return (
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="gray.50">
        <VStack spacing={6} p={8} bg="white" borderRadius="lg" boxShadow="lg" maxW="md" w="full">
          <Box color="red.500" fontSize="4xl">
            <FaShieldAlt />
          </Box>
          
          <VStack spacing={2} textAlign="center">
            <Text fontSize="2xl" fontWeight="bold" color="gray.800">
              Acceso Denegado
            </Text>
            <Text color="gray.600">
              No tienes permisos para acceder a esta sección.
            </Text>
            <Text fontSize="sm" color="gray.500">
              Tu rol actual: <strong>{user.role}</strong>
            </Text>
            <Text fontSize="sm" color="gray.500">
              Roles requeridos: <strong>{Array.isArray(requiredRoles) ? requiredRoles.join(', ') : requiredRoles}</strong>
            </Text>
          </VStack>

          <Button
            leftIcon={<FaArrowLeft />}
            colorScheme="blue"
            variant="outline"
            onClick={() => window.history.back()}
          >
            Volver
          </Button>
        </VStack>
      </Box>
    );
  }

  return children;
};

export default ProtectedRoute;
