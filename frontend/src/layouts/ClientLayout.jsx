import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
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
import {
  FaUser,
  FaShoppingCart,
  FaMoneyBillWave,
  FaGift,
  FaSignOutAlt,
  FaHome,
  FaCalendarAlt,
  FaTint
} from 'react-icons/fa';

const ClientLayout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const isMobile = useBreakpointValue({ base: true, lg: false });
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const clientMenuItems = [
    {
      name: 'Mi Cuenta',
      path: '/client-dashboard',
      icon: FaUser,
      exact: true
    },
    {
      name: 'Hacer Pedido',
      path: '/client-dashboard/order',
      icon: FaShoppingCart
    },
    {
      name: 'Mis Pagos',
      path: '/client-dashboard/payments',
      icon: FaMoneyBillWave
    },
    {
      name: 'Suscripciones',
      path: '/client-dashboard/subscriptions',
      icon: FaCalendarAlt
    },
    {
      name: 'Pedido Suscripción',
      path: '/client-dashboard/subscription-order',
      icon: FaTint
    }
  ];

  const Sidebar = () => (
    <VStack spacing={4} align="stretch" p={4} h="full">
      {/* Logo/Header */}
      <Box textAlign="center" pb={4} borderBottom="1px" borderColor="gray.200">
        <Text fontSize="xl" fontWeight="bold" color="blue.600">
          💧 AGUA PURA
        </Text>
        <Text fontSize="sm" color="gray.600">
          Cliente Frecuente
        </Text>
      </Box>

      {/* Navigation */}
      <VStack spacing={2} align="stretch" flex={1}>
        {clientMenuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.exact}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            {({ isActive }) => (
              <HStack
                p={3}
                borderRadius="md"
                bg={isActive ? 'blue.50' : 'transparent'}
                color={isActive ? 'blue.600' : 'gray.600'}
                _hover={{ bg: 'blue.50', color: 'blue.600' }}
                transition="all 0.2s"
              >
                <item.icon />
                <Text fontWeight={isActive ? 'bold' : 'normal'}>
                  {item.name}
                </Text>
              </HStack>
            )}
          </NavLink>
        ))}
      </VStack>

      {/* User Info */}
      <Box pt={4} borderTop="1px" borderColor="gray.200">
        <HStack spacing={3}>
          <Avatar size="sm" name={user?.username} />
          <VStack align="start" spacing={0} flex={1}>
            <Text fontSize="sm" fontWeight="bold">
              {user?.username}
            </Text>
            <Text fontSize="xs" color="gray.500">
              Cliente Frecuente
            </Text>
          </VStack>
        </HStack>
      </Box>
    </VStack>
  );

  return (
    <Flex h="100vh" bg="gray.50">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Box
          w="250px"
          bg="white"
          borderRight="1px"
          borderColor="gray.200"
          boxShadow="sm"
        >
          <Sidebar />
        </Box>
      )}

      {/* Mobile Drawer */}
      <Drawer
        isOpen={isOpen}
        onClose={onClose}
        placement="left"
        size="xs"
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>
            <Text fontSize="lg" fontWeight="bold" color="blue.600">
              💧 AGUA PURA
            </Text>
          </DrawerHeader>
          <DrawerBody p={0}>
            <Sidebar />
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Main Content */}
      <Flex direction="column" flex={1} overflow="hidden">
        {/* Header */}
        <Box
          bg="white"
          borderBottom="1px"
          borderColor="gray.200"
          px={4}
          py={3}
          boxShadow="sm"
        >
          <HStack justify="space-between">
            <HStack spacing={4}>
              {isMobile && (
                <IconButton
                  icon={<HamburgerIcon />}
                  variant="ghost"
                  onClick={onOpen}
                  aria-label="Abrir menú"
                />
              )}
              <Text fontSize="lg" fontWeight="bold" color="gray.700">
                Panel del Cliente
              </Text>
            </HStack>

            {/* User Menu */}
            <Menu>
              <MenuButton as={Button} variant="ghost" rightIcon={<ChevronDownIcon />}>
                <HStack spacing={2}>
                  <Avatar size="sm" name={user?.username} />
                  <Text fontSize="sm">{user?.username}</Text>
                </HStack>
              </MenuButton>
              <MenuList>
                <MenuItem icon={<FaHome />} onClick={() => navigate('/client-dashboard')}>
                  Mi Cuenta
                </MenuItem>
                <Divider />
                <MenuItem icon={<FaSignOutAlt />} onClick={handleLogout} color="red.500">
                  Cerrar Sesión
                </MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        </Box>

        {/* Page Content */}
        <Box flex={1} overflow="auto">
          <Outlet />
        </Box>
      </Flex>

      {/* Footer */}
      <Footer />
    </Flex>
  );
};

export default ClientLayout;
