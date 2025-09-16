import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import useAutoRefresh from '../hooks/useAutoRefresh';
import { useRole } from '../hooks/useRole';
import AquaYaraLogo from '../components/AquaYaraLogo';
import AdminContact from '../components/AdminContact';
import Footer from '../components/Footer';
import {
  Box,
  Flex,
  VStack,
  HStack,
  Text,
  Button,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  IconButton,
  useBreakpointValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
  Badge,
  Divider
} from '@chakra-ui/react';
import { HamburgerIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { useState } from 'react';

const DashboardLayout = () => {
  const { user, logout } = useAuthStore();
  const { isAdmin, isSeller, isDeliveryPerson } = useRole();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Hook para renovación automática del JWT
  useAutoRefresh();
  
  const isMobile = useBreakpointValue({ base: true, lg: false });
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  // Obtener las iniciales del usuario para el avatar
  const getUserInitials = () => {
    if (!user || !user.username) return '?';
    return user.username.charAt(0).toUpperCase();
  };

  // Menú para administradores y vendedores
  const adminMenuItems = [
    // Dashboard principal
    { to: '/dashboard', label: 'Dashboard', icon: '🏠' },
    
    // Gestión de pedidos (unificado)
    { to: '/dashboard/orders-management', label: 'Gestión de Pedidos', icon: '📦', adminOnly: true },
    
    // Clientes
    { to: '/dashboard/clients', label: 'Clientes', icon: '👥', adminOnly: true },
    
    // Pagos
    { to: '/dashboard/client-payments', label: 'Pagos Clientes', icon: '💳', adminOnly: true },
    
    // Créditos y suscripciones
    { to: '/dashboard/credits', label: 'Créditos y Vales', icon: '🎫', adminOnly: true },
    { to: '/dashboard/vales', label: 'Gestión de Vales', icon: '🎫', adminOnly: true },
    { to: '/dashboard/alerts', label: 'Centro de Alertas', icon: '🚨', adminOnly: true },
    { to: '/dashboard/vale-payment', label: 'Pago de Vales', icon: '💳', adminOnly: true },
    { to: '/dashboard/subscriptions', label: 'Suscripciones', icon: '📅', adminOnly: true },
    
    // Documentos y reportes
    { to: '/dashboard/documents', label: 'Documentos', icon: '📄', adminOnly: true },
    { to: '/dashboard/reports', label: 'Reportes', icon: '📊', adminOnly: true },
    
    // Configuración del sistema
    { to: '/dashboard/delivery-fees', label: 'Tarifas de Envío', icon: '🚚', adminOnly: true },
    { to: '/dashboard/delivery-persons', label: 'Repartidores', icon: '👨‍💼', adminOnly: true }
  ];

  // Menú para repartidores
  const deliveryMenuItems = [
    { to: '/delivery-dashboard', label: 'Dashboard', icon: '🏠' },
    { to: '/delivery-dashboard#orders', label: 'Mis Pedidos', icon: '📦' },
    { to: '/delivery-dashboard#stats', label: 'Estadísticas', icon: '📊' },
    { to: '/delivery-dashboard#vouchers', label: 'Vales', icon: '🎫' }
  ];

  // Determinar qué menú mostrar según el rol
  const getMenuItems = () => {
    if (isDeliveryPerson()) {
      return deliveryMenuItems;
    }
    return adminMenuItems.filter(item => !item.adminOnly || isAdmin());
  };

  const menuItems = getMenuItems();

  const SidebarContent = () => (
    <VStack spacing={0} h="full" align="stretch">
      {/* Logo */}
      <Box p={6} borderBottom="1px solid" borderColor="whiteAlpha.200">
        <AquaYaraLogo 
          size="md" 
          variant="vertical" 
          color="white" 
          textColor="white" 
          taglineColor="whiteAlpha.700"
        />
      </Box>

      {/* Navigation Menu */}
      <VStack spacing={1} flex={1} align="stretch" p={2}>
        {menuItems.map((item) => (
          <Button
            key={item.to}
            as={NavLink}
            to={item.to}
            variant="ghost"
            color="white"
            justifyContent="flex-start"
            leftIcon={<Text>{item.icon}</Text>}
            _hover={{ bg: 'whiteAlpha.200' }}
            _active={{ bg: 'whiteAlpha.300' }}
            size="sm"
            h="40px"
          >
            {item.label}
          </Button>
        ))}
      </VStack>

      {/* User Section */}
      <Box p={4} borderTop="1px solid" borderColor="whiteAlpha.200">
        <Menu>
          <MenuButton
            as={Button}
            variant="ghost"
            color="white"
            w="full"
            justifyContent="flex-start"
            leftIcon={<Avatar size="sm" name={getUserInitials()} />}
            rightIcon={<ChevronDownIcon />}
          >
            <VStack spacing={0} align="flex-start">
              <Text fontSize="sm" fontWeight="medium">
                {user?.username}
              </Text>
              <Text fontSize="xs" color="whiteAlpha.700">
                {user?.role}
              </Text>
            </VStack>
          </MenuButton>
          <MenuList>
            <MenuItem onClick={handleLogout} color="red.500">
              Cerrar Sesión
            </MenuItem>
          </MenuList>
        </Menu>
      </Box>
    </VStack>
  );

  return (
    <Flex minH="100vh" bg="gray.50">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Box
          w="280px"
          bg="purple.600"
          color="white"
          position="fixed"
          h="100vh"
          overflowY="auto"
        >
          <SidebarContent />
        </Box>
      )}

      {/* Mobile Drawer */}
      <Drawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        placement="left"
        size="xs"
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader bg="purple.600" color="white">
            <AquaYaraLogo 
              size="sm" 
              variant="horizontal" 
              color="white" 
              textColor="white" 
              taglineColor="whiteAlpha.700"
            />
          </DrawerHeader>
          <DrawerBody p={0}>
            <Box bg="purple.600" color="white" h="full">
              <SidebarContent />
            </Box>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Main Content */}
      <Box
        flex={1}
        ml={!isMobile ? "280px" : 0}
        display="flex"
        flexDirection="column"
      >
        {/* Header */}
        <Box
          bg="white"
          px={{ base: 4, md: 6 }}
          py={4}
          boxShadow="sm"
          borderBottom="1px solid"
          borderColor="gray.200"
        >
          <Flex align="center" justify="space-between">
            <HStack spacing={4}>
              {isMobile && (
                <IconButton
                  icon={<HamburgerIcon />}
                  variant="ghost"
                  onClick={() => setIsMobileMenuOpen(true)}
                  aria-label="Abrir menú"
                />
              )}
              <AquaYaraLogo size="sm" variant="horizontal" />
              <Text fontSize="lg" fontWeight="semibold" color="gray.700">
                {isDeliveryPerson() ? 'Panel de Repartidor' : 'Panel de Administración'}
              </Text>
            </HStack>
            
            <HStack spacing={4}>
              <AdminContact variant="badge" />
              <Badge colorScheme="green" variant="subtle">
                En línea
              </Badge>
            </HStack>
          </Flex>
        </Box>

        {/* Page Content */}
        <Box flex={1} p={{ base: 4, md: 6 }} overflowY="auto">
          <Outlet />
        </Box>

        {/* Footer */}
        <Footer />
      </Box>
      
    </Flex>
  );
};

export default DashboardLayout;