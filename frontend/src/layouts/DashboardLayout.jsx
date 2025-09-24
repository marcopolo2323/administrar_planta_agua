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
import { HamburgerIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { useState, useEffect } from 'react';

const DashboardLayout = () => {
  const { user, logout } = useAuthStore();
  const { isAdmin, isSeller, isDeliveryPerson } = useRole();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved ? JSON.parse(saved) : false;
  });
  
  // Hook para renovación automática del JWT
  useAutoRefresh();
  
  const isMobile = useBreakpointValue({ base: true, lg: false });
  
  // Persistir estado del sidebar en localStorage
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(isSidebarCollapsed));
  }, [isSidebarCollapsed]);
  
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
    
    // Gestión de pedidos y clientes
    { to: '/dashboard/orders-management', label: 'Gestión de Pedidos', icon: '📦', adminOnly: true },
    { to: '/dashboard/clients', label: 'Clientes', icon: '👥', adminOnly: true },
    
    // Pagos y créditos
    { to: '/dashboard/vales', label: 'Gestión de Vales', icon: '🎫', adminOnly: true },
    { to: '/dashboard/collection-report', label: 'Reporte de Cobranza', icon: '💰', adminOnly: true },
    
    // Suscripciones
    { to: '/dashboard/subscriptions', label: 'Suscripciones', icon: '📅', adminOnly: true },
    
    // Configuración del sistema
    { to: '/dashboard/delivery-fees', label: 'Tarifas de Envío', icon: '🚚', adminOnly: true },
    { to: '/dashboard/terms-and-conditions', label: 'Términos y Condiciones', icon: '📄', adminOnly: true },
    { to: '/dashboard/users-management', label: 'Gestión de Usuarios', icon: '👥', adminOnly: true }
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

  // Función para cerrar el menú móvil
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const SidebarContent = ({ isCollapsed = false }) => (
    <VStack spacing={0} h="full" align="stretch">
      {/* Logo */}
      <Box p={isCollapsed ? 3 : 6} borderBottom="1px solid" borderColor="whiteAlpha.200">
        {isCollapsed ? (
          <Text fontSize="2xl" textAlign="center" color="white">
            🏠
          </Text>
        ) : (
          <AquaYaraLogo 
            size="md" 
            variant="vertical" 
            color="white" 
            textColor="white" 
            taglineColor="whiteAlpha.700"
          />
        )}
      </Box>

      {/* Navigation Menu */}
      <VStack spacing={1} flex={1} align="stretch" p={isCollapsed ? 0 : 2}>
        {menuItems.map((item) => (
          <Button
            key={item.to}
            as={NavLink}
            to={item.to}
            variant="ghost"
            color="white"
            justifyContent={isCollapsed ? "center" : "flex-start"}
            leftIcon={isCollapsed ? undefined : <Text>{item.icon}</Text>}
            _hover={{ bg: 'whiteAlpha.200' }}
            _active={{ bg: 'whiteAlpha.300' }}
            size="sm"
            h="40px"
            onClick={closeMobileMenu}
            title={isCollapsed ? item.label : undefined}
            px={isCollapsed ? 2 : 4}
            minW={isCollapsed ? "40px" : "auto"}
            w={isCollapsed ? "40px" : "100%"}
          >
            {isCollapsed ? <Text>{item.icon}</Text> : item.label}
          </Button>
        ))}
      </VStack>

      {/* User Section */}
      <Box p={isCollapsed ? 1 : 4} borderTop="1px solid" borderColor="whiteAlpha.200">
        <Menu>
          <MenuButton
            as={Button}
            variant="ghost"
            color="white"
            w="full"
            justifyContent={isCollapsed ? "center" : "flex-start"}
            leftIcon={<Avatar size="sm" name={getUserInitials()} />}
            rightIcon={!isCollapsed ? <ChevronDownIcon /> : undefined}
            title={isCollapsed ? `${user?.username} (${user?.role})` : undefined}
          >
            {!isCollapsed && (
              <VStack spacing={0} align="flex-start">
                <Text fontSize="sm" fontWeight="medium">
                  {user?.username}
                </Text>
                <Text fontSize="xs" color="whiteAlpha.700">
                  {user?.role}
                </Text>
              </VStack>
            )}
          </MenuButton>
          <MenuList>
            <MenuItem onClick={() => { handleLogout(); closeMobileMenu(); }} color="red.500">
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
          w={isSidebarCollapsed ? "60px" : "280px"}
          bg="purple.600"
          color="white"
          position="fixed"
          h="100vh"
          overflowY="auto"
          zIndex={1000}
          left={0}
          top={0}
          transition="width 0.3s ease"
        >
          <SidebarContent isCollapsed={isSidebarCollapsed} />
          
          {/* Botón de colapsar/expandir */}
          <IconButton
            icon={isSidebarCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            variant="ghost"
            color="white"
            size="sm"
            position="absolute"
            right="-12px"
            top="50%"
            transform="translateY(-50%)"
            bg="purple.600"
            border="2px solid"
            borderColor="purple.600"
            borderRadius="full"
            _hover={{ bg: 'purple.700' }}
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            zIndex={1001}
          />
        </Box>
      )}

      {/* Mobile Drawer */}
      <Drawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        placement="left"
        size="xs"
        closeOnOverlayClick={true}
        closeOnEsc={true}
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
        ml={!isMobile ? (isSidebarCollapsed ? "60px" : "280px") : 0}
        display="flex"
        flexDirection="column"
        transition="margin-left 0.3s ease"
      >
        {/* Header - Solo mostrar en móviles o cuando sidebar está expandido */}
        {isMobile || !isSidebarCollapsed ? (
          <Box
            bg="white"
            px={{ base: 4, md: 6 }}
            py={4}
            boxShadow="sm"
            borderBottom="1px solid"
            borderColor="gray.200"
            position="sticky"
            top={0}
            zIndex={999}
          >
            <Flex align="center" justify="space-between">
              <HStack spacing={4}>
                {isMobile ? (
                  <IconButton
                    icon={<HamburgerIcon />}
                    variant="ghost"
                    onClick={() => setIsMobileMenuOpen(true)}
                    aria-label="Abrir menú"
                  />
                ) : (
                  <IconButton
                    icon={isSidebarCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                    variant="ghost"
                    onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                    aria-label={isSidebarCollapsed ? "Expandir sidebar" : "Colapsar sidebar"}
                    size="sm"
                  />
                )}
                {!isSidebarCollapsed && (
                  <>
                    <AquaYaraLogo size="sm" variant="horizontal" />
                    <Text fontSize="lg" fontWeight="semibold" color="gray.700">
                      {isDeliveryPerson() ? 'Panel de Repartidor' : 'Panel de Administración'}
                    </Text>
                  </>
                )}
              </HStack>
              
              <HStack spacing={4}>
                <AdminContact variant="badge" />
                <Badge colorScheme="green" variant="subtle">
                  En línea
                </Badge>
              </HStack>
            </Flex>
          </Box>
        ) : null}

        {/* Page Content */}
        <Box 
          flex={1} 
          p={{ base: 4, md: 6 }} 
          overflowY="auto"
          position="relative"
          zIndex={1}
        >
          <Outlet />
        </Box>

        {/* Footer */}
        <Footer />
      </Box>
      
    </Flex>
  );
};

export default DashboardLayout;