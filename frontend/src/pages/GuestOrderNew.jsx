import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Heading,
  Text,
  VStack,
  HStack,
  Input,
  FormControl,
  FormLabel,
  FormHelperText,
  NumberInput,
  NumberInputField,
  Select,
  Textarea,
  Alert,
  AlertIcon,
  Spinner,
  Center,
  SimpleGrid,
  useBreakpointValue,
  Badge,
  Divider,
  useToast,
  RadioGroup,
  Radio,
  Stack,
  Icon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Image,
  Checkbox
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import TermsAndConditionsModal from '../components/TermsAndConditionsModal';
import { 
  FaShoppingCart, 
  FaTruck, 
  FaMapMarkerAlt, 
  FaPhone, 
  FaUser, 
  FaIdCard,
  FaMoneyBillWave,
  FaQrcode,
  FaWhatsapp,
  FaCreditCard,
  FaCheckCircle,
  FaCalendarAlt,
  FaExclamationTriangle,
  FaGift
} from 'react-icons/fa';
import useProductStore from '../stores/productStore';
import useDeliveryStore from '../stores/deliveryStore';
import useDistrictStore from '../stores/districtStore';
import axios from '../utils/axios';
import bidonImage from '../assets/images/img_buyon.jpeg';
import paqueteImage from '../assets/images/img_paquete_botellas.jpeg';
import plinQrImage from '../assets/images/plin_qr.jpeg';

const GuestOrderNew = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const isMobile = useBreakpointValue({ base: true, md: false });
  const { isOpen: isPlinModalOpen, onOpen: onPlinModalOpen, onClose: onPlinModalClose } = useDisclosure();
  
  // Función personalizada para cerrar el modal PLIN
  const handlePlinModalClose = () => {
    onPlinModalClose();
    setShowQR(false);
    setWhatsappSent(false); // Resetear estado de WhatsApp
  };

  // Stores
  const { products, fetchProducts, calculatePrice } = useProductStore();
  const { deliveryFees, fetchDeliveryFees } = useDeliveryStore();
  const { districts, fetchDistricts } = useDistrictStore();

  // Estados del flujo
  const [currentStep, setCurrentStep] = useState(1); // 1: DNI, 2: Datos, 3: Productos, 4: Modalidad, 5: Pago
  const [loading, setLoading] = useState(false);
  const [searchingDni, setSearchingDni] = useState(false);
  
  // Estados para suscripciones
  const [clientSubscriptions, setClientSubscriptions] = useState([]);
  const [isSubscriptionMode, setIsSubscriptionMode] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [selectedSubscriptionPlan, setSelectedSubscriptionPlan] = useState(null);
  const [showSubscriptionPlans, setShowSubscriptionPlans] = useState(false);
  
  // Estados para términos y condiciones
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  // Planes de suscripción disponibles (se cargan dinámicamente)
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  // ID de plan preferido pendiente de aplicar (cuando las preferencias cargan antes que los planes)
  const [pendingPreferredPlanId, setPendingPreferredPlanId] = useState(null);

  // Datos del cliente
  const [dni, setDni] = useState('');
  const [clientId, setClientId] = useState(null);
  const [clientData, setClientData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    district: '',
    reference: '',
    notes: ''
  });

  // Carrito y productos
  const [cart, setCart] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(new Set());

  // Modalidad de pago
  const [paymentMethod, setPaymentMethod] = useState('contraentrega'); // contraentrega, vale, suscripcion
  const [paymentType, setPaymentType] = useState('efectivo'); // efectivo, plin
  const [showQR, setShowQR] = useState(false);
  const [whatsappSent, setWhatsappSent] = useState(false);
  const [preferencesApplied, setPreferencesApplied] = useState(false); // Para saber si se aplicaron preferencias
  const [canChangePreference, setCanChangePreference] = useState(false); // Para permitir cambio de modalidad

  // Función para obtener la imagen del producto
  const getProductImage = (productName) => {
    const name = productName.toLowerCase();
    if (name.includes('bidón') || name.includes('bidon') || name.includes('garrafa')) {
      return bidonImage;
    } else if (name.includes('paquete') || name.includes('pack') || name.includes('botellas')) {
      return paqueteImage;
    }
    return bidonImage;
  };

  useEffect(() => {
    fetchProducts();
    fetchDeliveryFees();
    fetchDistricts();
    fetchSubscriptionPlans();
  }, [fetchProducts, fetchDeliveryFees, fetchDistricts]);

  // Función para buscar cliente por DNI
  // Función para cargar planes de suscripción
  const fetchSubscriptionPlans = async () => {
    try {
      setLoadingPlans(true);
      console.log('🔄 Cargando planes de suscripción...');
      const response = await axios.get('/api/subscription-plans');
      console.log('📦 Respuesta planes:', response.data);
      if (response.data.success) {
        // Transformar los datos del API al formato esperado
        const transformedPlans = response.data.data.map(plan => ({
          id: plan.id,
          name: plan.name,
          bottles: plan.totalBottles,
          price: parseFloat(plan.monthlyPrice),
          bonus: plan.bonusBottles,
          description: plan.description,
          color: ['blue', 'green', 'purple', 'orange', 'pink', 'teal', 'red'][plan.sortOrder % 7],
          popular: plan.sortOrder === 2, // Marcar el plan 25 como popular
          pricePerBottle: parseFloat(plan.pricePerBottle),
          maxDailyDelivery: plan.maxDailyDelivery
        }));
        console.log('✅ Planes transformados:', transformedPlans);
        setSubscriptionPlans(transformedPlans);
      }
    } catch (error) {
      console.error('❌ Error al cargar planes de suscripción:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los planes de suscripción',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoadingPlans(false);
    }
  };

  // Aplicar plan preferido de suscripción cuando los planes ya estén disponibles
  useEffect(() => {
    if (pendingPreferredPlanId && subscriptionPlans.length > 0) {
      const plan = subscriptionPlans.find(p => p.id === pendingPreferredPlanId);
      if (plan) {
        setSelectedSubscriptionPlan(plan);
        setIsSubscriptionMode(true);
        setPaymentMethod('suscripcion');
        setPendingPreferredPlanId(null);
      }
    }
  }, [pendingPreferredPlanId, subscriptionPlans]);

  // Función para buscar suscripciones del cliente
  const fetchClientSubscriptions = async (clientDni) => {
    try {
      console.log('🔄 Buscando suscripciones para DNI:', clientDni);
      const response = await axios.get(`/api/subscriptions/client/${clientDni}`);
      console.log('📦 Respuesta suscripciones:', response.data);
      if (response.data.success) {
        setClientSubscriptions(response.data.data);
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error('❌ Error al buscar suscripciones:', error);
      return [];
    }
  };

  // Función para cargar preferencias del cliente
  const fetchClientPreferences = async (clientDni) => {
    try {
      console.log('🔍 Cargando preferencias para DNI:', clientDni);
      const response = await axios.get(`/api/client-preferences/dni/${clientDni}`);
      
      if (response.data.success && response.data.data) {
        const preferences = response.data.data;
        console.log('✅ Preferencias encontradas:', preferences);
        
        // Aplicar preferencias si están activas
        if (preferences.isActive && new Date(preferences.validUntil) > new Date()) {
          setPaymentMethod(preferences.preferredPaymentMethod);
          setPreferencesApplied(true);
          setCanChangePreference(false);
          
          // Si es suscripción, cargar el plan (o dejarlo pendiente si aún no cargan los planes)
          if (preferences.preferredPaymentMethod === 'suscripcion' && preferences.subscriptionPlanId) {
            const plan = subscriptionPlans.find(p => p.id === preferences.subscriptionPlanId);
            if (plan) {
              setSelectedSubscriptionPlan(plan);
              setIsSubscriptionMode(true);
            } else {
              setPendingPreferredPlanId(preferences.subscriptionPlanId);
            }
          }
          
          return true;
        } else {
          console.log('⚠️ Preferencias expiradas o inactivas');
          setPreferencesApplied(true);
          setCanChangePreference(true);
          return false;
        }
      } else {
        console.log('❌ No se encontraron preferencias');
        setPreferencesApplied(false);
        setCanChangePreference(false);
        return false;
      }
    } catch (error) {
      console.error('❌ Error al cargar preferencias:', error);
      setPreferencesApplied(false);
      setCanChangePreference(false);
      return false;
    }
  };

  const searchClientByDni = async (dniValue) => {
    setSearchingDni(true);
    
    try {
      // Buscar cliente
      const clientResponse = await axios.get(`/api/clients/document/${dniValue}`);
      
      if (clientResponse.data.success) {
        const client = clientResponse.data.data;
        
        // Guardar el clientId
        setClientId(client.id);
        
        setClientData({
          ...clientData,
          name: client.name,
          phone: client.phone,
          email: client.email || '',
          address: client.address,
          district: client.district,
          reference: '',
          notes: ''
        });
        
        // Buscar suscripciones del cliente
        const subscriptions = await fetchClientSubscriptions(dniValue);
        
        // Buscar preferencias del cliente
        try {
          const preferencesResponse = await axios.get(`/api/client-preferences/dni/${dniValue}`);
          if (preferencesResponse.data.success && preferencesResponse.data.data) {
            const preferences = preferencesResponse.data.data;
            
            // Aplicar preferencias automáticamente
            setPaymentMethod(preferences.preferredPaymentMethod);
            setPreferencesApplied(true);
            
            // Verificar si la preferencia sigue activa (no ha expirado)
            const now = new Date();
            const validUntil = new Date(preferences.validUntil);
            const isPreferenceActive = validUntil > now;
            
            if (isPreferenceActive) {
              // La preferencia sigue activa - mostrar solo esa modalidad
              setCanChangePreference(false);
              
              // Si es suscripción, verificar si tiene suscripciones activas
              if (preferences.preferredPaymentMethod === 'suscripcion') {
                const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active' && sub.remainingBottles > 0);
                if (activeSubscriptions.length > 0) {
                  setIsSubscriptionMode(true);
                  setSelectedSubscription(activeSubscriptions[0]);
                  toast({
                    title: 'Suscripción activa encontrada',
                    description: `Tienes ${activeSubscriptions[0].remainingBottles} bidones disponibles de tu suscripción`,
                    status: 'success',
                    duration: 5000,
                    isClosable: true,
                  });
                } else {
                  // Si no tiene suscripción activa pero tiene un plan preferido guardado, preseleccionarlo
                  if (preferences.subscriptionPlanId) {
                    const plan = subscriptionPlans.find(p => p.id === preferences.subscriptionPlanId);
                    if (plan) {
                      setSelectedSubscriptionPlan(plan);
                      setIsSubscriptionMode(true);
                    } else {
                      setPendingPreferredPlanId(preferences.subscriptionPlanId);
                    }
                  }
                  toast({
                    title: 'Preferencia de suscripción activa',
                    description: 'Puedes comprar una nueva suscripción',
                    status: 'info',
                    duration: 5000,
                    isClosable: true,
                  });
                }
              } else {
                toast({
                  title: 'Modalidad activa encontrada',
                  description: `Tu modalidad de ${preferences.preferredPaymentMethod === 'vale' ? 'vale' : 'suscripción'} está activa hasta ${validUntil.toLocaleDateString()}`,
                  status: 'info',
                  duration: 5000,
                  isClosable: true,
                });
              }
            } else {
              // La preferencia expiró - mostrar todas las opciones
              setPreferencesApplied(false);
              setCanChangePreference(false);
              
              toast({
                title: 'Modalidad expirada',
                description: 'Tu modalidad anterior expiró. Elige una nueva modalidad de pago.',
                status: 'warning',
                duration: 5000,
                isClosable: true,
              });
            }
          }
        } catch (preferencesError) {
          console.log('No se encontraron preferencias para este cliente');
        }
        
        toast({
          title: 'Cliente encontrado',
          description: `Datos de ${client.name} cargados automáticamente`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        
        setCurrentStep(3); // Ir directamente a productos
      } else {
        toast({
          title: 'Cliente no encontrado',
          description: 'Completa tus datos para registrarte automáticamente',
          status: 'info',
          duration: 5000,
          isClosable: true,
        });
        setCurrentStep(2); // Ir a formulario manual
      }
    } catch (error) {
      console.error('Error al buscar cliente:', error);
      
      // Si es error 404, el cliente no existe
      if (error.response?.status === 404) {
        toast({
          title: 'Cliente no encontrado',
          description: 'Completa tus datos para registrarte automáticamente',
          status: 'info',
          duration: 5000,
          isClosable: true,
        });
        setCurrentStep(2); // Ir a formulario de datos
      } else {
        toast({
          title: 'Error al buscar cliente',
          description: 'Intenta nuevamente o regístrate como nuevo cliente',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        setCurrentStep(2); // Ir a formulario de datos
      }
    } finally {
      setSearchingDni(false);
    }
  };

  const handleDniSubmit = (e) => {
    e.preventDefault();
    
    // Validar DNI (8 dígitos) o RUC (11 dígitos)
    if (dni.length === 8) {
      // DNI válido
      searchClientByDni(dni);
    } else if (dni.length === 11) {
      // RUC válido
      searchClientByDni(dni);
    } else {
      toast({
        title: 'Documento inválido',
        description: 'El DNI debe tener 8 dígitos o el RUC debe tener 11 dígitos',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Función para registrar cliente
  const handleRegisterClient = async () => {
    try {
      setLoading(true);
      
      // Validar que el DNI esté presente
      if (!dni || dni.trim() === '') {
        toast({
          title: 'DNI requerido',
          description: 'Debes ingresar tu DNI para registrarte',
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      
      const clientDataToRegister = {
        name: clientData.name,
        document: dni,
        phone: clientData.phone,
        email: clientData.email || '',
        address: clientData.address,
        district: clientData.district,
        reference: clientData.reference || '',
        notes: clientData.notes || '',
        status: 'active'
      };

      const response = await axios.post('/api/clients', clientDataToRegister);
      
      if (response.data.success) {
        // Guardar el ID del cliente recién creado
        const newClientId = response.data.data.id;
        setClientId(newClientId);
        console.log('Cliente registrado con ID:', newClientId);
        
        toast({
          title: '¡Registro exitoso!',
          description: 'Te has registrado automáticamente. Ahora puedes elegir productos y modalidades de pago',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        
        // Continuar al siguiente paso
        setCurrentStep(3);
        
        // Forzar re-render para mantener el estado
        setTimeout(() => {
          console.log('ClientId después del registro:', newClientId);
          console.log('ClientId en estado:', clientId);
        }, 100);
      } else {
        throw new Error(response.data.message || 'Error al registrar');
      }
    } catch (error) {
      console.error('Error al registrar:', error);
      toast({
        title: 'Error al registrar',
        description: error.response?.data?.message || 'No se pudo completar el registro',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product) => {
    if (loadingProducts.has(product.id)) return;
    
    // Si está en modo suscripción, solo permitir bidones
    if (isSubscriptionMode && product.type !== 'bidon') {
      toast({
        title: 'Solo bidones en suscripción',
        description: 'Con tu suscripción solo puedes pedir bidones de agua',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setLoadingProducts(prev => new Set(prev).add(product.id));
    try {
      let pricing;
      
      // Si está en modo suscripción, usar precio fijo del plan
      if (isSubscriptionMode && selectedSubscription) {
        // Obtener el precio por bidón del plan de suscripción
        const subscriptionPlan = subscriptionPlans.find(plan => plan.name === selectedSubscription.subscriptionType);
        const pricePerBottle = subscriptionPlan ? parseFloat(subscriptionPlan.pricePerBottle) : 5.00;
        
        pricing = {
          unitPrice: pricePerBottle,
          totalPrice: pricePerBottle,
          originalPrice: pricePerBottle,
          discountApplied: 0,
          priceLevel: 'subscription'
        };
      } else {
        // Para pedidos normales, usar cálculo dinámico
        const result = await calculatePrice(product.id, 1);
        if (result.success) {
          pricing = result.data;
        } else {
          throw new Error('Error al calcular precio');
        }
      }
        
        const existingItemIndex = cart.findIndex(item => item.productId === product.id);
        
        if (existingItemIndex !== -1) {
          const updatedCart = [...cart];
          const newQuantity = updatedCart[existingItemIndex].quantity + 1;
          
          // Si está en modo suscripción, usar precio fijo
          if (isSubscriptionMode && selectedSubscription) {
            const subscriptionPlan = subscriptionPlans.find(plan => plan.name === selectedSubscription.subscriptionType);
            const pricePerBottle = subscriptionPlan ? parseFloat(subscriptionPlan.pricePerBottle) : 5.00;
            
            updatedCart[existingItemIndex].quantity = newQuantity;
            updatedCart[existingItemIndex].unitPrice = pricePerBottle;
            updatedCart[existingItemIndex].subtotal = pricePerBottle * newQuantity;
            updatedCart[existingItemIndex].pricing = {
              unitPrice: pricePerBottle,
              totalPrice: pricePerBottle * newQuantity,
              originalPrice: pricePerBottle,
              discountApplied: 0,
              priceLevel: 'subscription'
            };
            setCart(updatedCart);
          } else {
            // Para pedidos normales, usar cálculo dinámico
            const newResult = await calculatePrice(product.id, newQuantity);
            if (newResult.success) {
              const newPricing = newResult.data;
              updatedCart[existingItemIndex].quantity = newQuantity;
              updatedCart[existingItemIndex].unitPrice = parseFloat(newPricing.unitPrice);
              updatedCart[existingItemIndex].subtotal = parseFloat(newPricing.unitPrice) * newQuantity;
              updatedCart[existingItemIndex].pricing = newPricing;
              setCart(updatedCart);
            }
          }
        } else {
          const cartItem = {
            id: `${product.id}-${Date.now()}`,
            productId: product.id,
            name: product.name,
            type: product.type,
            unitPrice: parseFloat(pricing.unitPrice),
            quantity: 1,
            subtotal: parseFloat(pricing.unitPrice),
            pricing: pricing
          };
          setCart([...cart, cartItem]);
        }
        
        toast({
          title: 'Producto agregado',
          description: `${product.name} agregado al carrito`,
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
    } catch (error) {
      console.error('Error al calcular precio:', error);
    } finally {
      setLoadingProducts(prev => {
        const newSet = new Set(prev);
        newSet.delete(product.id);
        return newSet;
      });
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      setCart(cart.filter(item => item.id !== itemId));
      return;
    }

    try {
      const cartItem = cart.find(item => item.id === itemId);
      if (!cartItem) return;
      
      let pricing;
      
      // Si está en modo suscripción, usar precio fijo del plan
      if (isSubscriptionMode && selectedSubscription) {
        const subscriptionPlan = subscriptionPlans.find(plan => plan.name === selectedSubscription.subscriptionType);
        const pricePerBottle = subscriptionPlan ? parseFloat(subscriptionPlan.pricePerBottle) : 5.00;
        
        pricing = {
          unitPrice: pricePerBottle,
          totalPrice: pricePerBottle * newQuantity,
          originalPrice: pricePerBottle,
          discountApplied: 0,
          priceLevel: 'subscription'
        };
      } else {
        // Para pedidos normales, usar cálculo dinámico
        const result = await calculatePrice(cartItem.productId, newQuantity);
        if (result.success) {
          pricing = result.data;
        } else {
          throw new Error('Error al calcular precio');
        }
      }
      
      setCart(cart.map(item => 
        item.id === itemId 
          ? { 
              ...item, 
              quantity: newQuantity, 
              unitPrice: parseFloat(pricing.unitPrice),
              subtotal: parseFloat(pricing.unitPrice) * newQuantity,
              pricing: pricing
            }
          : item
      ));
    } catch (error) {
      console.error('Error al actualizar cantidad:', error);
    }
  };

  // Función para manejar cambios en el input de cantidad
  const handleQuantityChange = (itemId, value) => {
    const newQuantity = parseInt(value) || 0;
    
    // Solo actualizar si la cantidad es válida y mayor a 0
    if (newQuantity > 0) {
      updateQuantity(itemId, newQuantity);
    } else if (value === '' || value === '0') {
      // Si está vacío o es 0, solo actualizar el estado visual sin eliminar
      setCart(cart.map(item => 
        item.id === itemId 
          ? { ...item, quantity: 0 }
          : item
      ));
    }
  };

  // Función para manejar cuando se pierde el foco del input
  const handleQuantityBlur = (itemId, value) => {
    const newQuantity = parseInt(value) || 0;
    
    if (newQuantity <= 0) {
      // Si es 0 o inválido, eliminar del carrito
      setCart(cart.filter(item => item.id !== itemId));
    } else {
      // Actualizar con la cantidad válida
      updateQuantity(itemId, newQuantity);
    }
  };

  const getDeliveryFee = () => {
    if (!clientData.district) return 0;
    const district = districts.find(d => d.name === clientData.district);
    return district ? parseFloat(district.deliveryFee) : 0;
  };

  const getSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const getTotal = () => {
    return getSubtotal() + getDeliveryFee();
  };

  const handleFinalSubmit = async () => {
    console.log('Estado antes de crear pedido:', {
      clientId: clientId,
      dni: dni,
      paymentMethod: paymentMethod,
      selectedSubscriptionPlan: selectedSubscriptionPlan,
      cart: cart
    });

    // Validar que el cliente esté registrado
    if (!clientId) {
      toast({
        title: 'Cliente no registrado',
        description: 'Debes registrarte como cliente para continuar',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setCurrentStep(2);
      return;
    }

    // Para suscripciones, no validar carrito
    if (paymentMethod !== 'suscripcion' && cart.length === 0) {
      toast({
        title: 'Carrito vacío',
        description: 'Agrega al menos un producto al carrito',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Para suscripciones, validar que se haya seleccionado un plan
    if (paymentMethod === 'suscripcion' && !selectedSubscriptionPlan) {
      toast({
        title: 'Plan no seleccionado',
        description: 'Selecciona un plan de suscripción',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!clientData.name || !clientData.phone || !clientData.address || !clientData.district) {
      toast({
        title: 'Datos incompletos',
        description: 'Completa todos los campos obligatorios',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Para efectivo, crear el pedido directamente
    await createOrder();
  };

  // Funciones para manejar términos y condiciones
  const handleTermsAccept = async (terms) => {
    setTermsAccepted(true);
    setShowTermsModal(false);
    
    try {
      // Para pedidos normales, crear el pedido
      await handleConfirmPLINPayment();
      
      toast({
        title: 'Términos aceptados',
        description: 'Has aceptado los términos y condiciones',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error al crear pedido después de aceptar términos:', error);
      toast({
        title: 'Error',
        description: 'Hubo un problema al crear el pedido',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleTermsReject = () => {
    setTermsAccepted(false);
    setShowTermsModal(false);
    toast({
      title: 'Términos rechazados',
      description: 'Debes aceptar los términos y condiciones para continuar',
      status: 'error',
      duration: 3000,
      isClosable: true,
    });
  };

  const createOrder = async () => {
    // Verificar que se han aceptado los términos y condiciones (solo para pedidos normales)
    if (!termsAccepted && paymentMethod !== 'suscripcion') {
      toast({
        title: 'Términos y Condiciones',
        description: 'Debes aceptar los términos y condiciones para continuar',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      setShowTermsModal(true);
      return;
    }

    setLoading(true);

    try {
      // Si está en modo suscripción (usando bidones existentes)
      if (isSubscriptionMode && selectedSubscription) {
        // Verificar que hay suficientes bidones (solo contar productos tipo 'bidon')
        const totalBottles = cart.reduce((sum, item) => {
          const product = products.find(p => p.id === item.productId);
          if (product && product.type === 'bidon') {
            return sum + item.quantity;
          }
          return sum;
        }, 0);
        
        if (selectedSubscription.remainingBottles < totalBottles) {
          toast({
            title: 'Bidones insuficientes',
            description: `Solo tienes ${selectedSubscription.remainingBottles} bidones disponibles. Necesitas ${totalBottles} bidones.`,
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
          return;
        }

        // Preparar datos del pedido (sin pago)
        const orderData = {
          customerName: clientData.name,
          customerPhone: clientData.phone,
          customerEmail: clientData.email || '',
          deliveryAddress: clientData.address,
          deliveryDistrict: clientData.district,
          deliveryReference: clientData.reference || '',
          deliveryNotes: clientData.notes || '',
          products: cart.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.unitPrice
          })),
          subtotal: getSubtotal(),
          deliveryFee: getDeliveryFee(),
          totalAmount: getTotal(),
          paymentMethod: 'suscripcion',
          paymentType: 'cash',
          clientId: clientId,
          subscriptionId: selectedSubscription.id
        };

        console.log('Enviando pedido con suscripción:', orderData);

        // Crear el pedido
        const response = await axios.post('/api/guest-orders', orderData);
        
        if (response.data.success) {
          // Usar bidones de la suscripción
          console.log('Datos para use-bottles:', {
            subscriptionId: selectedSubscription.id,
            bottlesToUse: totalBottles,
            selectedSubscription: selectedSubscription
          });
          
          // Los bidones ya se descuentan automáticamente en el backend
          console.log('🔍 Respuesta completa del pedido:', response.data);
          const orderId = response.data.data?.id || response.data.id || 'Sin ID';
          
          toast({
            title: '¡Pedido creado exitosamente!',
            description: `Pedido #${orderId} registrado. Se usaron ${totalBottles} bidones de tu suscripción.`,
            status: 'success',
            duration: 5000,
            isClosable: true,
          });

          // Redirigir a la página de recibo usando el token de acceso
          const accessToken = response.data.data?.accessToken || response.data.accessToken;
          if (accessToken) {
            navigate(`/receipt/${accessToken}`);
          } else {
            console.error('❌ No se encontró accessToken en la respuesta');
          }
        } else {
          throw new Error(response.data.message || 'Error al crear el pedido');
        }
      } else {
        // Flujo normal (compra de suscripción o pedido regular)
        
        // Si es compra de suscripción, crear la suscripción PRIMERO
        if (paymentMethod === 'suscripcion' && selectedSubscriptionPlan) {
          try {
            console.log('Datos para crear suscripción:', {
              clientId: clientId,
              dni: dni,
              selectedSubscriptionPlan: selectedSubscriptionPlan
            });

            if (!clientId) {
              throw new Error('ClientId es requerido para crear suscripción');
            }

            const subscriptionData = {
              clientId: clientId,
              clientDni: dni,
              subscriptionType: selectedSubscriptionPlan.id,
              totalBottles: selectedSubscriptionPlan.bottles + selectedSubscriptionPlan.bonus,
              totalAmount: selectedSubscriptionPlan.price,
              paidAmount: selectedSubscriptionPlan.price,
              expiryDate: null, // Las suscripciones duran hasta que se acaben los bidones
              notes: `Suscripción ${selectedSubscriptionPlan.name} comprada`
            };

            const subscriptionResponse = await axios.post('/api/subscriptions', subscriptionData);
            console.log('Suscripción creada:', subscriptionResponse.data);

            if (subscriptionResponse.data.success) {
              const subscription = subscriptionResponse.data.data;
              
              // Guardar preferencias del cliente para suscripción
              try {
                const validUntil = new Date();
                validUntil.setMonth(validUntil.getMonth() + 1);
                
                const preferencesData = {
                  dni,
                  clientId,
                  preferredPaymentMethod: 'suscripcion',
                  subscriptionPlanId: selectedSubscriptionPlan.id,
                  subscriptionAmount: selectedSubscriptionPlan.price,
                  subscriptionQuantity: selectedSubscriptionPlan.bottles + selectedSubscriptionPlan.bonus,
                  validUntil: validUntil.toISOString()
                };
                
                await axios.post('/api/client-preferences', preferencesData);
                console.log('Preferencias de suscripción guardadas:', preferencesData);
                
                toast({
                  title: 'Modalidad guardada',
                  description: `Tu modalidad de suscripción estará activa hasta ${validUntil.toLocaleDateString()}`,
                  status: 'success',
                  duration: 4000,
                  isClosable: true,
                });
              } catch (preferencesError) {
                console.log('Error al guardar preferencias de suscripción:', preferencesError);
              }

              toast({
                title: '🎉 ¡Suscripción activada!',
                description: `Tu suscripción ${selectedSubscriptionPlan.name} está lista. Ahora puedes hacer pedidos usando tus ${selectedSubscriptionPlan.bottles + selectedSubscriptionPlan.bonus} bidones disponibles (sin costo adicional).`,
                status: 'success',
                duration: 8000,
                isClosable: true,
              });

              // Cambiar a modo suscripción para permitir más pedidos
              setIsSubscriptionMode(true);
              setSelectedSubscription({
                id: subscription.id,
                subscriptionType: selectedSubscriptionPlan.name,
                totalBottles: selectedSubscriptionPlan.bottles + selectedSubscriptionPlan.bonus,
                remainingBottles: selectedSubscriptionPlan.bottles + selectedSubscriptionPlan.bonus,
                totalAmount: selectedSubscriptionPlan.price,
                status: 'active'
              });
              
              // Si es pago con Plin, continuar con el flujo de pago
              if (paymentType === 'plin') {
                // Mostrar QR y continuar con el flujo de pago
                setCurrentStep(5);
                setShowQR(true);
                setWhatsappSent(false);
                onPlinModalOpen();
              } else {
                // Para pago en efectivo, ir directamente a productos en modo suscripción
                setCart([]);
                setCurrentStep(3); // Ir a productos
                // El modo suscripción ya está activado arriba
                
                toast({
                  title: '¡Ahora puedes hacer pedidos!',
                  description: `Tienes ${selectedSubscriptionPlan.bottles + selectedSubscriptionPlan.bonus} bidones disponibles. Agrega productos al carrito.`,
                  status: 'info',
                  duration: 6000,
                  isClosable: true,
                });
              }
            }
          } catch (subscriptionError) {
            console.log('Error al crear suscripción:', subscriptionError);
            throw subscriptionError;
          }
        } else {
          // Pedido normal (contraentrega, vale, etc.)
          const orderData = {
            customerName: clientData.name,
            customerPhone: clientData.phone,
            customerEmail: clientData.email || '',
            deliveryAddress: clientData.address,
            deliveryDistrict: clientData.district,
            deliveryReference: clientData.reference || '',
            deliveryNotes: clientData.notes || '',
            products: cart.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.unitPrice
            })),
            subtotal: getSubtotal(),
            deliveryFee: getDeliveryFee(),
            totalAmount: getTotal(),
            paymentMethod: paymentMethod,
            paymentType: paymentType === 'efectivo' ? 'cash' : paymentType,
            clientId: clientId
          };

          console.log('Enviando pedido:', orderData);
          console.log('ClientId actual:', clientId);

          const response = await axios.post('/api/guest-orders', orderData);
          
          if (response.data.success) {
            // Guardar preferencias del cliente si eligió vale o suscripción
            if (paymentMethod === 'vale' || paymentMethod === 'suscripcion') {
              try {
                if (clientId) {
                  const validUntil = new Date();
                  validUntil.setMonth(validUntil.getMonth() + 1);
                  
                  const preferencesData = {
                    dni,
                    clientId,
                    preferredPaymentMethod: paymentMethod,
                    subscriptionPlanId: paymentMethod === 'suscripcion' ? selectedSubscriptionPlan?.id : null,
                    subscriptionAmount: paymentMethod === 'suscripcion' ? getTotal() : null,
                    subscriptionQuantity: paymentMethod === 'suscripcion' ? cart.reduce((sum, item) => sum + item.quantity, 0) : null,
                    validUntil: validUntil.toISOString()
                  };
                  
                  await axios.post('/api/client-preferences', preferencesData);
                  console.log('Preferencias guardadas:', preferencesData);
                  
                  toast({
                    title: 'Modalidad guardada',
                    description: `Tu modalidad de ${paymentMethod === 'vale' ? 'vale' : 'suscripción'} estará activa hasta ${validUntil.toLocaleDateString()}`,
                    status: 'success',
                    duration: 4000,
                    isClosable: true,
                  });
                }
              } catch (preferencesError) {
                console.log('Error al guardar preferencias:', preferencesError);
              }
            }

            console.log('🔍 Respuesta completa del pedido normal:', response.data);
            const orderId = response.data.data?.id || response.data.id || 'Sin ID';
            
            toast({
              title: '¡Pedido creado exitosamente!',
              description: `Pedido #${orderId} registrado correctamente`,
              status: 'success',
              duration: 5000,
              isClosable: true,
            });

            // Redirigir a la página de recibo usando el token de acceso
            const accessToken = response.data.data?.accessToken || response.data.accessToken;
            if (accessToken) {
              navigate(`/receipt/${accessToken}`);
            } else {
              console.error('❌ No se encontró accessToken en la respuesta');
            }
          } else {
            throw new Error(response.data.message || 'Error al crear el pedido');
          }
        }
      }
    } catch (error) {
      console.error('Error al crear pedido:', error);
      toast({
        title: 'Error al crear pedido',
        description: error.response?.data?.message || 'Error interno del servidor',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePLINPayment = () => {
    // Mostrar el modal PLIN cuando se hace clic en "Pagar con PLIN"
    setShowQR(true);
    setWhatsappSent(false); // Resetear estado de WhatsApp
    onPlinModalOpen();
  };

  const handleCreateSubscription = async (paymentType) => {
    try {
      if (!selectedSubscriptionPlan || !clientId || !dni) {
        throw new Error('Plan de suscripción, cliente o DNI no seleccionado');
      }

      console.log('🔄 Creando suscripción con datos:', {
        clientDni: dni,
        subscriptionType: selectedSubscriptionPlan.name,
        totalBottles: selectedSubscriptionPlan.bottles + selectedSubscriptionPlan.bonus,
        totalAmount: selectedSubscriptionPlan.price
      });

      // Crear la suscripción
      const subscriptionData = {
        clientDni: dni,
        subscriptionType: selectedSubscriptionPlan.name,
        totalBottles: selectedSubscriptionPlan.bottles + selectedSubscriptionPlan.bonus,
        totalAmount: selectedSubscriptionPlan.price,
        paidAmount: selectedSubscriptionPlan.price,
        notes: `Plan ${selectedSubscriptionPlan.name} - ${selectedSubscriptionPlan.bottles + selectedSubscriptionPlan.bonus} bidones`
      };

      const response = await axios.post('/api/subscriptions', subscriptionData);
      
      if (response.data.success) {
        const subscription = response.data.data;
        console.log('✅ Suscripción creada:', subscription);
        
        // Actualizar el estado local con la suscripción creada
        setSelectedSubscription({
          id: subscription.id,
          subscriptionType: selectedSubscriptionPlan.name,
          totalBottles: selectedSubscriptionPlan.bottles + selectedSubscriptionPlan.bonus,
          remainingBottles: selectedSubscriptionPlan.bottles + selectedSubscriptionPlan.bonus,
          totalAmount: selectedSubscriptionPlan.price,
          status: 'active'
        });
        
        // Activar modo suscripción
        setIsSubscriptionMode(true);
        
        // Resetear el método de pago para evitar confusiones
        setPaymentMethod('suscripcion');
        
        // Resetear términos aceptados para el siguiente pedido
        setTermsAccepted(false);
        
        // Para suscripciones, ir directamente a productos en modo suscripción
        setCart([]);
        setCurrentStep(3); // Ir a productos
        // El modo suscripción ya está activado arriba
        
        // Cerrar el modal de Plin
        onPlinModalClose();
        setShowQR(false);
        setWhatsappSent(false);
        
        toast({
          title: '¡Suscripción creada exitosamente!',
          description: `Tienes ${selectedSubscriptionPlan.bottles + selectedSubscriptionPlan.bonus} bidones disponibles. Agrega productos al carrito.`,
          status: 'success',
          duration: 6000,
          isClosable: true,
        });
      }
    } catch (subscriptionError) {
      console.error('❌ Error al crear suscripción:', subscriptionError);
      toast({
        title: 'Error al crear suscripción',
        description: subscriptionError.response?.data?.message || 'No se pudo crear la suscripción. Inténtalo de nuevo.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      throw subscriptionError;
    }
  };

  const handleConfirmPLINPayment = async () => {
    try {
      // Si es compra de suscripción, la suscripción ya se creó, solo necesitamos limpiar y continuar
      if (paymentMethod === 'suscripcion' && selectedSubscriptionPlan) {
        // Limpiar el carrito y volver al paso de productos en modo suscripción
        setCart([]);
        setCurrentStep(3); // Ir a productos
        // El modo suscripción ya está activado
        
        // Cerrar el modal
        onPlinModalClose();
        setShowQR(false);
        setWhatsappSent(false);
        
        toast({
          title: '¡Pago confirmado!',
          description: `Tu suscripción ${selectedSubscriptionPlan.name} está activa. Ahora puedes hacer pedidos usando tus ${selectedSubscriptionPlan.bottles + selectedSubscriptionPlan.bonus} bidones disponibles.`,
          status: 'success',
          duration: 8000,
          isClosable: true,
        });
      } else {
        // Para pedidos normales, crear el pedido
        await createOrder();
        // Cerrar el modal después de crear el pedido
        onPlinModalClose();
        setShowQR(false);
        setWhatsappSent(false);
      }
    } catch (error) {
      console.error('Error al confirmar pago PLIN:', error);
      toast({
        title: 'Error',
        description: 'Hubo un problema al confirmar el pago',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Función auxiliar para buscar cliente por DNI
  const findClientByDni = async (dni) => {
    try {
      const response = await axios.get(`/api/clients/document/${dni}`);
      return response.data.success ? response.data.client.id : null;
    } catch (error) {
      console.log('Cliente no encontrado por DNI:', dni);
      return null;
    }
  };

  const handleWhatsAppSend = () => {
    let message = `🧾 *COMPROBANTE DE PAGO PLIN*
    
👤 Cliente: ${clientData.name}
📱 Teléfono: ${clientData.phone}
🏠 Dirección: ${clientData.address}
📍 Distrito: ${clientData.district}

`;

    // Si es suscripción, mostrar información del plan
    if (paymentMethod === 'suscripcion' && selectedSubscriptionPlan) {
      message += `🎯 *SUSCRIPCIÓN:*
📦 Plan: ${selectedSubscriptionPlan.name}
💰 Precio: S/ ${selectedSubscriptionPlan.price}
🔢 Bidones: ${selectedSubscriptionPlan.bottles} + ${selectedSubscriptionPlan.bonus} extra
📊 Total bidones: ${selectedSubscriptionPlan.bottles + selectedSubscriptionPlan.bonus}

✅ *PAGO REALIZADO VÍA PLIN*`;
    } else {
      // Para pedidos normales
      message += `🛒 *PEDIDO:*
${cart.map(item => `• ${item.name} x${item.quantity} = S/ ${item.subtotal.toFixed(2)}`).join('\n')}

💰 *TOTAL: S/ ${getTotal().toFixed(2)}*
📦 Flete: S/ ${getDeliveryFee().toFixed(2)}

✅ *PAGO REALIZADO VÍA PLIN*`;
    }
    
    const whatsappUrl = `https://wa.me/51961606183?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    // Marcar que se envió el comprobante
    setWhatsappSent(true);
    
    // Mostrar mensaje de confirmación
    toast({
      title: 'WhatsApp abierto',
      description: 'Envía el comprobante y luego confirma el pago',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'bidon': return 'blue';
      case 'botella': return 'green';
      default: return 'gray';
    }
  };

  const getTypeText = (type) => {
    switch (type) {
      case 'bidon': return 'Bidón';
      case 'botella': return 'Botella';
      default: return type;
    }
  };

  // Renderizar paso 1: Búsqueda por DNI
  const renderStep1 = () => (
    <Card maxW={{ base: "100%", sm: "md" }} mx="auto" w="100%">
      <CardHeader textAlign="center" p={{ base: 4, md: 6 }}>
        <VStack spacing={{ base: 3, md: 4 }}>
          <Icon as={FaIdCard} boxSize={{ base: 8, md: 12 }} color="blue.500" />
          <Heading size={{ base: "md", md: "lg" }}>Ingresa tu DNI</Heading>
          <Text color="gray.600" fontSize={{ base: "sm", md: "md" }} textAlign="center">
            Buscaremos tus datos automáticamente para agilizar tu pedido
          </Text>
        </VStack>
      </CardHeader>
      <CardBody p={{ base: 4, md: 6 }}>
        <form onSubmit={handleDniSubmit}>
          <VStack spacing={{ base: 3, md: 4 }}>
            <FormControl>
              <FormLabel fontSize={{ base: "sm", md: "md" }}>Número de Documento (DNI o RUC)</FormLabel>
              <Input
                value={dni}
                onChange={(e) => setDni(e.target.value)}
                placeholder="12345678 (DNI) o 12345678901 (RUC)"
                size={{ base: "md", md: "lg" }}
                textAlign="center"
                fontSize={{ base: "md", md: "xl" }}
                fontWeight="bold"
                maxLength={11}
              />
            </FormControl>
            
            <Button
              type="submit"
              colorScheme="blue"
              size={{ base: "md", md: "lg" }}
              w="full"
              isLoading={searchingDni}
              loadingText="Buscando..."
              leftIcon={<FaUser />}
            >
              Buscar Cliente
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentStep(2)}
            >
              Completar datos manualmente
            </Button>
          </VStack>
        </form>
      </CardBody>
    </Card>
  );

  // Renderizar paso 2: Formulario manual
  const renderStep2 = () => (
    <Card maxW="lg" mx="auto">
      <CardHeader>
        <Heading size="md">
          <FaUser style={{ display: 'inline', marginRight: '8px' }} />
          Datos del Cliente
        </Heading>
      </CardHeader>
      <CardBody>
        <VStack spacing={4}>
          <FormControl isRequired>
              <FormLabel>Documento</FormLabel>
            <Input
              value={dni}
              isDisabled
              placeholder="Tu documento"
              bg="gray.100"
            />
            <FormHelperText>Documento ingresado en el paso anterior</FormHelperText>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Nombre Completo</FormLabel>
            <Input
              value={clientData.name}
              onChange={(e) => setClientData({ ...clientData, name: e.target.value })}
              placeholder="Tu nombre completo"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Teléfono</FormLabel>
            <Input
              value={clientData.phone}
              onChange={(e) => setClientData({ ...clientData, phone: e.target.value })}
              placeholder="Tu número de teléfono"
            />
          </FormControl>

          <FormControl>
            <FormLabel>Email (opcional)</FormLabel>
            <Input
              type="email"
              value={clientData.email}
              onChange={(e) => setClientData({ ...clientData, email: e.target.value })}
              placeholder="Tu correo electrónico"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Dirección</FormLabel>
            <Textarea
              value={clientData.address}
              onChange={(e) => setClientData({ ...clientData, address: e.target.value })}
              placeholder="Dirección completa de entrega"
              rows={3}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Distrito</FormLabel>
            <Select
              value={clientData.district}
              onChange={(e) => setClientData({ ...clientData, district: e.target.value })}
              placeholder="Selecciona tu distrito"
            >
              {Array.isArray(districts) ? districts.map((district) => (
                <option key={district.id} value={district.name}>
                  {district.name} - S/ {parseFloat(district.deliveryFee).toFixed(2)}
                </option>
              )) : null}
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel>Referencia</FormLabel>
            <Input
              value={clientData.reference}
              onChange={(e) => setClientData({ ...clientData, reference: e.target.value })}
              placeholder="Referencia del lugar (opcional)"
            />
          </FormControl>



          <FormControl>
            <FormLabel>Notas Adicionales</FormLabel>
            <Textarea
              value={clientData.notes}
              onChange={(e) => setClientData({ ...clientData, notes: e.target.value })}
              placeholder="Información adicional, preferencias especiales, etc. (opcional)"
              rows={3}
            />
          </FormControl>

          <VStack spacing={3} w="full">
            <Button
              colorScheme="blue"
              size="lg"
              w="full"
              onClick={handleRegisterClient}
              isDisabled={!clientData.name || !clientData.phone || !clientData.address || !clientData.district}
            >
              Registrarme y Continuar
            </Button>
            
            <Alert status="info" borderRadius="md">
              <AlertIcon />
              <VStack align="start" spacing={2}>
                <Text fontSize="sm" fontWeight="bold">
                  Registro Automático
                </Text>
                <Text fontSize="xs">
                  Al continuar, te registrarás automáticamente como cliente para acceder a beneficios especiales como vales y suscripciones.
                </Text>
              </VStack>
            </Alert>
          </VStack>
        </VStack>
      </CardBody>
    </Card>
  );

  // Renderizar paso 3: Selección de productos
  const renderStep3 = () => (
    <VStack spacing={6} w="full">
      <Card w="full">
        <CardHeader>
          <Heading size="md">
            <FaShoppingCart style={{ display: 'inline', marginRight: '8px' }} />
            {isSubscriptionMode ? 'Bidones Disponibles (Suscripción)' : 'Productos Disponibles'}
          </Heading>
          {isSubscriptionMode && (
            <Alert status="info" size="sm" borderRadius="md" mt={2}>
              <AlertIcon />
              <Text fontSize="sm">
                <strong>Modo Suscripción:</strong> Solo puedes pedir bidones de agua. Los bidones se descontarán de tu suscripción sin costo adicional.
              </Text>
            </Alert>
          )}
        </CardHeader>
        <CardBody>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            {products
              .filter(product => !isSubscriptionMode || product.type === 'bidon')
              .map((product) => (
              <Card key={product.id} variant="outline">
                <CardBody>
                  <VStack align="start" spacing={3}>
                    <HStack spacing={4} align="start" w="full">
                      <Box flexShrink={0}>
                        <Image
                          src={getProductImage(product.name)}
                          alt={product.name}
                          boxSize="80px"
                          objectFit="cover"
                          borderRadius="md"
                          border="2px solid #e2e8f0"
                        />
                      </Box>
                      
                      <VStack align="start" spacing={1} flex={1}>
                        <HStack justify="space-between" w="full">
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="bold" fontSize="lg">
                              {product.name}
                            </Text>
                            <Text color="gray.600" fontSize="sm">
                              {product.description}
                            </Text>
                            {product.name === 'Paquete de Botellas de Agua' && (
                              <Badge colorScheme="green" size="sm">
                                ¡50+ unidades = S/ 9.00 c/u!
                              </Badge>
                            )}
                          </VStack>
                          <Badge colorScheme={getTypeColor(product.type)}>
                            {getTypeText(product.type)}
                          </Badge>
                        </HStack>
                      </VStack>
                    </HStack>

                    <HStack spacing={4}>
                      <Text fontWeight="bold" color="blue.600" fontSize="lg">
                        S/ {parseFloat(product.unitPrice).toFixed(2)}
                      </Text>
                      <Text color="gray.500" fontSize="sm">
                        Stock: {product.stock}
                      </Text>
                    </HStack>

                    <Button
                      colorScheme="blue"
                      size="sm"
                      leftIcon={<FaShoppingCart />}
                      onClick={() => addToCart(product)}
                      isLoading={loadingProducts.has(product.id)}
                      loadingText="Agregando..."
                      w="full"
                    >
                      Agregar al Carrito
                    </Button>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        </CardBody>
      </Card>

      {/* Carrito */}
      {cart.length > 0 && (
        <Card w="full">
          <CardHeader>
            <Heading size="md">
              <FaShoppingCart style={{ display: 'inline', marginRight: '8px' }} />
              Tu Carrito ({cart.length} {cart.length === 1 ? 'producto' : 'productos'})
            </Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4}>
              {cart.map((item) => (
                <Box key={item.id} w="full" p={3} border="1px" borderColor="gray.200" borderRadius="md">
                  <HStack spacing={3} align="start">
                    <Image
                      src={getProductImage(item.name)}
                      alt={item.name}
                      boxSize="50px"
                      objectFit="cover"
                      borderRadius="md"
                      border="1px solid #e2e8f0"
                    />
                    
                    <VStack spacing={2} flex={1}>
                      <HStack justify="space-between" w="full">
                        <Text fontWeight="bold">{item.name}</Text>
                        <Badge colorScheme={getTypeColor(item.type)}>
                          {getTypeText(item.type)}
                        </Badge>
                      </HStack>
                    
                      <HStack justify="space-between" w="full">
                        <VStack align="start" spacing={0}>
                          <Text color="gray.600" fontSize="sm">
                            S/ {parseFloat(item.unitPrice).toFixed(2)} c/u
                          </Text>
                          {item.pricing?.priceLevel === 'especial50' && (
                            <Badge colorScheme="green" size="sm">
                              ¡Descuento 50+ unidades!
                            </Badge>
                          )}
                        </VStack>
                        <HStack spacing={2}>
                          <Button
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            -
                          </Button>
                          <Input
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                            onBlur={(e) => handleQuantityBlur(item.id, e.target.value)}
                            size="sm"
                            w="60px"
                            textAlign="center"
                            type="number"
                            min="0"
                            placeholder="0"
                          />
                          <Button
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            +
                          </Button>
                        </HStack>
                      </HStack>
                      
                        <HStack justify="space-between" w="full">
                          <Text fontWeight="bold" color="blue.600">
                            Subtotal: S/ {parseFloat(item.subtotal).toFixed(2)}
                          </Text>
                        </HStack>
                    </VStack>
                  </HStack>
                </Box>
              ))}

              <Divider />

              <VStack spacing={2} w="full">
                <HStack justify="space-between" w="full">
                  <Text>Subtotal:</Text>
                  <Text fontWeight="bold">S/ {parseFloat(getSubtotal()).toFixed(2)}</Text>
                </HStack>
                
                <HStack justify="space-between" w="full">
                  <Text>Flete:</Text>
                  <Text fontWeight="bold" color="green.600">
                    S/ {parseFloat(getDeliveryFee()).toFixed(2)}
                  </Text>
                </HStack>
                
                <Divider />
                
                <HStack justify="space-between" w="full">
                  <Text fontWeight="bold" fontSize="lg">Total:</Text>
                  <Text fontWeight="bold" fontSize="lg" color="blue.600">
                    S/ {parseFloat(getTotal()).toFixed(2)}
                  </Text>
                </HStack>
              </VStack>

              <Button
                colorScheme="green"
                size="lg"
                w="full"
                onClick={() => {
                  // Si está en modo suscripción, ir directamente a confirmación
                  if (isSubscriptionMode && selectedSubscription) {
                    setCurrentStep(5); // Ir directamente a confirmación
                  } else {
                    setCurrentStep(4); // Ir a modalidad de pago
                  }
                }}
                leftIcon={<FaTruck />}
              >
                {isSubscriptionMode && selectedSubscription ? 'Continuar con Confirmación' : 'Continuar con Modalidad'}
              </Button>
            </VStack>
          </CardBody>
        </Card>
      )}
    </VStack>
  );

  // Renderizar paso 4: Modalidad de pago
  const renderStep4 = () => {
    // Si está en modo suscripción (usando bidones existentes)
    if (isSubscriptionMode && selectedSubscription) {
      return (
        <Card maxW="lg" mx="auto">
          <CardHeader textAlign="center">
            <VStack spacing={4}>
              <Icon as={FaCalendarAlt} boxSize={12} color="purple.500" />
              <Heading size="lg">Usar Suscripción</Heading>
              <Text color="gray.600" textAlign="center">
                Tienes {selectedSubscription.remainingBottles} bidones disponibles de tu suscripción
              </Text>
              <Alert status="success" size="sm" borderRadius="md">
                <AlertIcon />
                <Text fontSize="sm">
                  <strong>Suscripción activa:</strong> {selectedSubscription.remainingBottles} bidones disponibles
                </Text>
              </Alert>
            </VStack>
          </CardHeader>
          <CardBody>
            <VStack spacing={6}>
              {/* Mostrar información de la suscripción */}
              <Card 
                variant="filled"
                borderColor="purple.500"
                bg="purple.50"
              >
                <CardBody>
                  <VStack spacing={3}>
                    <HStack justify="space-between" w="full">
                      <Text fontWeight="bold">Tipo de Suscripción:</Text>
                      <Text>{selectedSubscription.subscriptionType || 'N/A'}</Text>
                    </HStack>
                    <HStack justify="space-between" w="full">
                      <Text fontWeight="bold">Bidones Totales:</Text>
                      <Text>{selectedSubscription.totalBottles || 0}</Text>
                    </HStack>
                    <HStack justify="space-between" w="full">
                      <Text fontWeight="bold">Bidones Restantes:</Text>
                      <Text color="green.600" fontWeight="bold">{selectedSubscription.remainingBottles || 0}</Text>
                    </HStack>
                    <HStack justify="space-between" w="full">
                      <Text fontWeight="bold">Total Pagado:</Text>
                      <Text>S/ {selectedSubscription.totalAmount ? parseFloat(selectedSubscription.totalAmount).toFixed(2) : '0.00'}</Text>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>

              {/* Resumen del pedido actual */}
              <Card variant="outline" w="full">
                <CardBody>
                  <VStack spacing={3}>
                    <Text fontWeight="bold" fontSize="lg">Resumen del Pedido</Text>
                    <VStack spacing={2} w="full">
                      <HStack justify="space-between" w="full">
                        <Text>Cliente:</Text>
                        <Text fontWeight="bold">{clientData.name}</Text>
                      </HStack>
                      <VStack spacing={1} w="full" align="stretch">
                        <Text>Productos:</Text>
                        {cart.map((item, index) => (
                          <HStack key={index} justify="space-between" w="full" pl={2}>
                            <Text fontSize="sm" color="gray.600">
                              • {item.name} x{item.quantity}
                            </Text>
                            <Text fontSize="sm" fontWeight="bold">
                              S/ {parseFloat(item.subtotal).toFixed(2)}
                            </Text>
                          </HStack>
                        ))}
                      </VStack>
                      <HStack justify="space-between" w="full">
                        <Text>Total Bidones:</Text>
                        <Text fontWeight="bold" color="purple.600">
                          {cart.reduce((sum, item) => sum + item.quantity, 0)} bidones
                        </Text>
                      </HStack>
                    </VStack>
                  </VStack>
                </CardBody>
              </Card>

              <Button
                colorScheme="purple"
                size="lg"
                w="full"
                onClick={() => setCurrentStep(5)}
                leftIcon={<FaCheckCircle />}
              >
                Usar Suscripción (Sin Pago)
              </Button>
            </VStack>
          </CardBody>
        </Card>
      );
    }

    // Si se aplicaron preferencias y está activa, mostrar solo la modalidad seleccionada
    if (preferencesApplied && !canChangePreference) {
      return (
        <Card maxW="lg" mx="auto">
          <CardHeader textAlign="center">
            <VStack spacing={4}>
              <Icon as={FaMoneyBillWave} boxSize={12} color="green.500" />
              <Heading size="lg">Modalidad de Pago</Heading>
              <Text color="gray.600" textAlign="center">
                Tu modalidad de pago está activa este mes
              </Text>
              <Alert status="success" size="sm" borderRadius="md">
                <AlertIcon />
                <Text fontSize="sm">
                  <strong>Modalidad activa:</strong> {paymentMethod === 'vale' ? 'A Crédito (Vale)' : paymentMethod === 'suscripcion' ? 'Suscripción Mensual' : 'Contraentrega'}
                </Text>
              </Alert>
            </VStack>
          </CardHeader>
          <CardBody>
            <VStack spacing={6}>
              {/* Mostrar solo la modalidad seleccionada */}
              <Card 
                variant="filled"
                borderColor="blue.500"
                bg="blue.50"
              >
                <CardBody>
                  <HStack spacing={4}>
                    <Radio value={paymentMethod} isChecked={true} />
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="bold">
                        {paymentMethod === 'vale' ? 'A Crédito (Vale)' : 
                         paymentMethod === 'suscripcion' ? 'Suscripción con Beneficios' : 
                         'Contraentrega'}
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        {paymentMethod === 'vale' ? 'Paga al final del mes - Se anota en tu vale' :
                         paymentMethod === 'suscripcion' ? 'Pedido recurrente mensual con bidones extra' :
                         'Pagas en efectivo o PLIN cuando recibes tu pedido'}
                      </Text>
                    </VStack>
                  </HStack>
                </CardBody>
              </Card>

              <Button
                colorScheme="blue"
                size="lg"
                w="full"
                onClick={() => {
                  // Si es suscripción, activar modo suscripción
                  if (paymentMethod === 'suscripcion') {
                    setIsSubscriptionMode(true);
                    setCurrentStep(3); // Ir a productos
                  } else {
                    setCurrentStep(5); // Ir a confirmación
                  }
                }}
                leftIcon={<FaCreditCard />}
              >
                {paymentMethod === 'vale' ? 'Continuar (Sin Pago Inmediato)' : 'Continuar con Forma de Pago'}
              </Button>
            </VStack>
          </CardBody>
        </Card>
      );
    }

    // Si se seleccionó suscripción, mostrar planes de suscripción
    if (paymentMethod === 'suscripcion' && !selectedSubscriptionPlan) {
      console.log('Mostrando planes de suscripción. Estado actual:', {
        clientId: clientId,
        dni: dni,
        paymentMethod: paymentMethod,
        selectedSubscriptionPlan: selectedSubscriptionPlan,
        isSubscriptionMode: isSubscriptionMode
      });
      
      // Activar modo suscripción cuando se está seleccionando un plan
      if (!isSubscriptionMode) {
        setIsSubscriptionMode(true);
      }
      
      // Si no hay clientId, mostrar error
      if (!clientId) {
        return (
          <Card maxW="lg" mx="auto">
            <CardHeader textAlign="center">
              <VStack spacing={4}>
                <Icon as={FaExclamationTriangle} boxSize={12} color="red.500" />
                <Heading size="lg" color="red.500">Error de Cliente</Heading>
                <Text color="gray.600" textAlign="center">
                  No se pudo identificar al cliente. Por favor, regístrate nuevamente.
                </Text>
                <Button
                  colorScheme="blue"
                  onClick={() => setCurrentStep(2)}
                >
                  Volver al Registro
                </Button>
              </VStack>
            </CardHeader>
          </Card>
        );
      }
      
      return (
        <Card maxW="4xl" mx="auto">
          <CardHeader textAlign="center">
            <VStack spacing={4}>
              <Icon as={FaCalendarAlt} boxSize={12} color="purple.500" />
              <Heading size="lg">Elige tu Plan de Suscripción</Heading>
              <Text color="gray.600" textAlign="center">
                Selecciona el plan que mejor se adapte a tus necesidades
              </Text>
              <Alert status="info" size="sm" borderRadius="md">
                <AlertIcon />
                <Text fontSize="sm">
                  <strong>Beneficios de la suscripción:</strong> Paga una vez al mes y recibe bidones extra gratis. 
                  Después solo pides la cantidad que necesites sin pagar nada más.
                </Text>
              </Alert>
            </VStack>
          </CardHeader>
          <CardBody>
            {loadingPlans ? (
              <Center py={8}>
                <VStack spacing={4}>
                  <Spinner size="xl" color="blue.500" />
                  <Text color="gray.500">Cargando planes de suscripción...</Text>
                </VStack>
              </Center>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                {subscriptionPlans.map((plan) => (
                <Card
                  key={plan.id}
                  variant={selectedSubscriptionPlan?.id === plan.id ? 'filled' : 'outline'}
                  borderColor={selectedSubscriptionPlan?.id === plan.id ? `${plan.color}.500` : 'gray.200'}
                  cursor="pointer"
                  onClick={() => setSelectedSubscriptionPlan(plan)}
                  position="relative"
                  _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
                  transition="all 0.2s"
                >
                  {plan.popular && (
                    <Badge
                      position="absolute"
                      top={-2}
                      right={4}
                      colorScheme={plan.color}
                      variant="solid"
                      borderRadius="full"
                      px={3}
                      py={1}
                    >
                      Más Popular
                    </Badge>
                  )}
                  <CardBody textAlign="center">
                    <VStack spacing={4}>
                      <VStack spacing={2}>
                        <Text fontWeight="bold" fontSize="xl" color={`${plan.color}.600`}>
                          {plan.name}
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          {plan.description}
                        </Text>
                      </VStack>
                      
                      <VStack spacing={1}>
                        <Text fontSize="3xl" fontWeight="bold" color={`${plan.color}.500`}>
                          S/ {plan.price}
                        </Text>
                        <Text fontSize="sm" color="gray.500">
                          por mes
                        </Text>
                      </VStack>
                      
                      <VStack spacing={2} w="full">
                        <HStack justify="space-between" w="full">
                          <Text fontSize="sm">Bidones incluidos:</Text>
                          <Text fontWeight="bold">{plan.bottles}</Text>
                        </HStack>
                        <HStack justify="space-between" w="full">
                          <Text fontSize="sm">Bidones extra:</Text>
                          <Text fontWeight="bold" color="green.600">+{plan.bonus}</Text>
                        </HStack>
                        <HStack justify="space-between" w="full">
                          <Text fontSize="sm">Total bidones:</Text>
                          <Text fontWeight="bold" color={`${plan.color}.600`}>
                            {plan.bottles + plan.bonus}
                          </Text>
                        </HStack>
                      </VStack>
                      
                      <Button
                        colorScheme={plan.color}
                        variant={selectedSubscriptionPlan?.id === plan.id ? 'solid' : 'outline'}
                        w="full"
                        size="sm"
                      >
                        {selectedSubscriptionPlan?.id === plan.id ? 'Seleccionado' : 'Seleccionar'}
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>
              ))}
              </SimpleGrid>
            )}
            
            <VStack spacing={4} mt={6}>
              <Button
                colorScheme="purple"
                size="lg"
                w="full"
                onClick={async () => {
                  // Si se selecciona un plan de suscripción, crear la suscripción primero
                  if (selectedSubscriptionPlan) {
                    try {
                      // Crear la suscripción y luego ir a pago
                      await handleCreateSubscription('efectivo'); // Pago en efectivo por defecto
                    } catch (error) {
                      console.error('Error al crear suscripción:', error);
                      toast({
                        title: 'Error',
                        description: 'No se pudo crear la suscripción. Inténtalo de nuevo.',
                        status: 'error',
                        duration: 5000,
                        isClosable: true,
                      });
                    }
                  } else {
                    setCurrentStep(5);
                  }
                }}
                leftIcon={<FaCreditCard />}
                isDisabled={!selectedSubscriptionPlan}
              >
                Continuar con Forma de Pago
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setPaymentMethod('contraentrega');
                  setIsSubscriptionMode(false);
                }}
              >
                Cambiar a Contraentrega
              </Button>
            </VStack>
          </CardBody>
        </Card>
      );
    }

    // Interfaz normal para cuando no hay preferencias aplicadas o expiraron
      return (
        <Card maxW={{ base: "100%", sm: "lg" }} mx="auto" w="100%">
          <CardHeader textAlign="center" p={{ base: 4, md: 6 }}>
            <VStack spacing={{ base: 3, md: 4 }}>
              <Icon as={FaMoneyBillWave} boxSize={{ base: 10, md: 12 }} color="green.500" />
              <Heading size={{ base: "md", md: "lg" }}>Modalidad de Pago</Heading>
              <Text color="gray.600" textAlign="center" fontSize={{ base: "sm", md: "md" }}>
                {preferencesApplied ? 'Tu modalidad anterior expiró. Elige una nueva modalidad:' : 'Selecciona cómo deseas pagar tu pedido'}
              </Text>
              <Alert status={preferencesApplied ? "warning" : "info"} size="sm" borderRadius="md" w="100%">
                <AlertIcon />
                <Text fontSize={{ base: "xs", md: "sm" }}>
                  {preferencesApplied ? (
                    <>
                      <strong>Modalidad expirada:</strong> Tu modalidad anterior ya no está activa. Elige una nueva modalidad de pago para este mes.
                    </>
                  ) : (
                    <>
                      <strong>Contraentrega:</strong> Pagas cuando recibes el pedido<br/>
                      <strong>A Crédito:</strong> Se anota en tu vale y pagas al final del mes<br/>
                      <strong>Suscripción:</strong> Pedido recurrente mensual
                    </>
                  )}
                </Text>
              </Alert>
            </VStack>
          </CardHeader>
          <CardBody p={{ base: 4, md: 6 }}>
            <VStack spacing={{ base: 4, md: 6 }} w="100%">
              <RadioGroup value={paymentMethod} onChange={(value) => {
                setPaymentMethod(value);
                // Si se selecciona suscripción, verificar si ya tiene una suscripción activa
                if (value === 'suscripcion') {
                  // Si ya tiene una suscripción activa, activar modo suscripción
                  if (selectedSubscription) {
                    setIsSubscriptionMode(true);
                  } else {
                    // Si no tiene suscripción, ir a seleccionar plan
                    setIsSubscriptionMode(false);
                    setCurrentStep(4); // Ir directamente a seleccionar plan
                  }
                } else {
                  setIsSubscriptionMode(false);
                }
              }} w="100%">
                <Stack spacing={{ base: 3, md: 4 }} w="100%">
                <Card 
                  variant={paymentMethod === 'contraentrega' ? 'filled' : 'outline'}
                  borderColor={paymentMethod === 'contraentrega' ? 'blue.500' : 'gray.200'}
                  cursor="pointer"
                  onClick={() => {
                    setPaymentMethod('contraentrega');
                    setIsSubscriptionMode(false);
                  }}
                  w="100%"
                >
                  <CardBody p={{ base: 3, md: 4 }}>
                    <HStack spacing={{ base: 3, md: 4 }} w="100%">
                      <Radio value="contraentrega" flexShrink={0} />
                      <VStack align="start" spacing={1} flex={1} minW={0}>
                        <Text fontWeight="bold" fontSize={{ base: "sm", md: "md" }}>Contraentrega</Text>
                        <Text fontSize={{ base: "xs", md: "sm" }} color="gray.600" noOfLines={2}>
                          Pagas en efectivo o PLIN cuando recibes tu pedido
                        </Text>
                      </VStack>
                    </HStack>
                  </CardBody>
                </Card>

                <Card 
                  variant={paymentMethod === 'vale' ? 'filled' : 'outline'}
                  borderColor={paymentMethod === 'vale' ? 'blue.500' : 'gray.200'}
                  cursor="pointer"
                  onClick={() => {
                    setPaymentMethod('vale');
                    setIsSubscriptionMode(false);
                  }}
                  w="100%"
                >
                  <CardBody p={{ base: 3, md: 4 }}>
                    <HStack spacing={{ base: 3, md: 4 }} w="100%">
                      <Radio value="vale" flexShrink={0} />
                      <VStack align="start" spacing={1} flex={1} minW={0}>
                        <Text fontWeight="bold" fontSize={{ base: "sm", md: "md" }}>A Crédito (Vale)</Text>
                        <Text fontSize={{ base: "xs", md: "sm" }} color="gray.600" noOfLines={2}>
                          Paga al final del mes - Se anota en tu vale
                        </Text>
                      </VStack>
                    </HStack>
                  </CardBody>
                </Card>

                <Card 
                  variant={paymentMethod === 'suscripcion' ? 'filled' : 'outline'}
                  borderColor={paymentMethod === 'suscripcion' ? 'blue.500' : 'gray.200'}
                  cursor="pointer"
                  onClick={() => {
                    setPaymentMethod('suscripcion');
                    // Si ya tiene una suscripción activa, activar modo suscripción
                    if (selectedSubscription) {
                      setIsSubscriptionMode(true);
                    } else {
                      // Si no tiene suscripción, ir a seleccionar plan
                      setIsSubscriptionMode(false);
                      setCurrentStep(4); // Ir directamente a seleccionar plan
                    }
                  }}
                  w="100%"
                >
                  <CardBody p={{ base: 3, md: 4 }}>
                    <HStack spacing={{ base: 3, md: 4 }} w="100%" align="start">
                      <Radio value="suscripcion" flexShrink={0} mt={1} />
                      <VStack align="start" spacing={1} flex={1} minW={0}>
                        <Text fontWeight="bold" fontSize={{ base: "sm", md: "md" }}>Suscripción con Beneficios</Text>
                      </VStack>
                    </HStack>
                  </CardBody>
                </Card>
              </Stack>
            </RadioGroup>

            <Button
              colorScheme="blue"
              size="lg"
              w="full"
              onClick={() => setCurrentStep(5)}
              leftIcon={<FaCreditCard />}
            >
              {paymentMethod === 'vale' ? 'Continuar (Sin Pago Inmediato)' : 'Continuar con Forma de Pago'}
            </Button>
          </VStack>
        </CardBody>
      </Card>
    );
  };

  // Renderizar paso 5: Forma de pago
  const renderStep5 = () => {
    // Si está confirmando una nueva suscripción
    if (paymentMethod === 'suscripcion' && selectedSubscriptionPlan && !selectedSubscription) {
      return (
        <Card maxW="lg" mx="auto">
          <CardHeader textAlign="center">
            <VStack spacing={4}>
              <Icon as={FaGift} boxSize={12} color="purple.500" />
              <Heading size="lg">Confirmar Suscripción</Heading>
              <Text color="gray.600">
                Revisa los detalles de tu plan de suscripción
              </Text>
            </VStack>
          </CardHeader>
          <CardBody>
            <VStack spacing={6}>
              {/* Información del plan seleccionado */}
              <Card variant="outline" w="full" borderColor="purple.200">
                <CardBody>
                  <VStack spacing={4}>
                    <Text fontWeight="bold" fontSize="lg" color="purple.600">
                      {selectedSubscriptionPlan.name}
                    </Text>
                    <Text fontSize="sm" color="gray.600" textAlign="center">
                      {selectedSubscriptionPlan.description}
                    </Text>
                    <VStack spacing={2} w="full">
                      <HStack justify="space-between" w="full">
                        <Text>Bidones incluidos:</Text>
                        <Text fontWeight="bold">{selectedSubscriptionPlan.bottles}</Text>
                      </HStack>
                      <HStack justify="space-between" w="full">
                        <Text>Bidones extra:</Text>
                        <Text fontWeight="bold" color="green.600">+{selectedSubscriptionPlan.bonus}</Text>
                      </HStack>
                      <HStack justify="space-between" w="full">
                        <Text>Total bidones:</Text>
                        <Text fontWeight="bold" fontSize="lg" color="purple.600">
                          {selectedSubscriptionPlan.bottles + selectedSubscriptionPlan.bonus}
                        </Text>
                      </HStack>
                      <HStack justify="space-between" w="full">
                        <Text>Precio por bidón:</Text>
                        <Text fontWeight="bold">S/ {parseFloat(selectedSubscriptionPlan.pricePerBottle).toFixed(2)}</Text>
                      </HStack>
                      <Divider />
                      <HStack justify="space-between" w="full">
                        <Text fontSize="lg" fontWeight="bold">Total a pagar:</Text>
                        <Text fontSize="xl" fontWeight="bold" color="purple.600">
                          S/ {parseFloat(selectedSubscriptionPlan.price).toFixed(2)}
                        </Text>
                      </HStack>
                    </VStack>
                  </VStack>
                </CardBody>
              </Card>

              {/* Información del cliente */}
              <Card variant="outline" w="full">
                <CardBody>
                  <VStack spacing={3}>
                    <Text fontWeight="bold" fontSize="lg">Datos del Cliente</Text>
                    <VStack spacing={2} w="full">
                      <HStack justify="space-between" w="full">
                        <Text>Nombre:</Text>
                        <Text fontWeight="bold">{clientData.name}</Text>
                      </HStack>
                      <HStack justify="space-between" w="full">
                        <Text>DNI:</Text>
                        <Text fontWeight="bold">{dni}</Text>
                      </HStack>
                      <HStack justify="space-between" w="full">
                        <Text>Teléfono:</Text>
                        <Text fontWeight="bold">{clientData.phone}</Text>
                      </HStack>
                      <HStack justify="space-between" w="full">
                        <Text>Email:</Text>
                        <Text fontWeight="bold">{clientData.email}</Text>
                      </HStack>
                    </VStack>
                  </VStack>
                </CardBody>
              </Card>

              {/* Información de cómo funciona */}
              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <VStack align="start" spacing={2}>
                  <Text fontWeight="bold">Cómo funciona la suscripción:</Text>
                  <Text fontSize="sm">
                    • Pagas una vez al mes por adelantado<br/>
                    • Recibes {selectedSubscriptionPlan.bottles + selectedSubscriptionPlan.bonus} bidones inmediatamente<br/>
                    • Después solo pides la cantidad que necesites sin pagar<br/>
                    • Los bidones se descuentan de tu suscripción
                  </Text>
                </VStack>
              </Alert>

              <Button
                colorScheme="purple"
                size="lg"
                w="full"
                onClick={() => setCurrentStep(6)} // Ir al paso de pago
                leftIcon={<FaCreditCard />}
              >
                Proceder al Pago
              </Button>
            </VStack>
          </CardBody>
        </Card>
      );
    }

    // Si está en modo suscripción (usando bidones existentes)
    if (isSubscriptionMode && selectedSubscription) {
      return (
        <Card maxW="lg" mx="auto">
          <CardHeader textAlign="center">
            <VStack spacing={4}>
              <Icon as={FaCalendarAlt} boxSize={12} color="purple.500" />
              <Heading size="lg">Confirmar Pedido con Suscripción</Heading>
              <Text color="gray.600">
                Usarás bidones de tu suscripción existente
              </Text>
            </VStack>
          </CardHeader>
          <CardBody>
            <VStack spacing={6}>
              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <VStack align="start" spacing={2}>
                  <Text fontWeight="bold">Cómo funciona con suscripción:</Text>
                  <Text fontSize="sm">
                    • Se descontarán {cart.reduce((sum, item) => {
                      const product = products.find(p => p.id === item.productId);
                      return product && product.type === 'bidon' ? sum + item.quantity : sum;
                    }, 0)} bidones de tu suscripción<br/>
                    • El repartidor NO cobrará nada en la entrega<br/>
                    • Los bidones se descontarán automáticamente<br/>
                    • Quedarán {selectedSubscription.remainingBottles - cart.reduce((sum, item) => {
                      const product = products.find(p => p.id === item.productId);
                      return product && product.type === 'bidon' ? sum + item.quantity : sum;
                    }, 0)} bidones disponibles
                  </Text>
                </VStack>
              </Alert>

              {/* Resumen del pedido */}
              <Card variant="outline" w="full">
                <CardBody>
                  <VStack spacing={3}>
                    <Text fontWeight="bold" fontSize="lg">Resumen del Pedido</Text>
                    <VStack spacing={2} w="full">
                      <HStack justify="space-between" w="full">
                        <Text>Cliente:</Text>
                        <Text fontWeight="bold">{clientData.name}</Text>
                      </HStack>
                      <HStack justify="space-between" w="full">
                        <Text>Modalidad:</Text>
                        <Badge colorScheme="purple">Suscripción (Sin Pago)</Badge>
                      </HStack>
                      <VStack spacing={1} w="full" align="stretch">
                        <Text>Productos:</Text>
                        {cart.map((item, index) => (
                          <HStack key={index} justify="space-between" w="full" pl={2}>
                            <Text fontSize="sm" color="gray.600">
                              • {item.name} x{item.quantity}
                            </Text>
                            <Text fontSize="sm" fontWeight="bold">
                              S/ {parseFloat(item.subtotal).toFixed(2)}
                            </Text>
                          </HStack>
                        ))}
                      </VStack>
                      <HStack justify="space-between" w="full">
                        <Text>Bidones a usar:</Text>
                        <Text fontWeight="bold" fontSize="lg" color="purple.600">
                          {cart.reduce((sum, item) => sum + item.quantity, 0)} bidones
                        </Text>
                      </HStack>
                    </VStack>
                  </VStack>
                </CardBody>
              </Card>

              <Button
                colorScheme="purple"
                size="lg"
                w="full"
                onClick={createOrder}
                leftIcon={<FaCheckCircle />}
                isLoading={loading}
                loadingText="Creando pedido..."
              >
                Confirmar Pedido con Suscripción
              </Button>
            </VStack>
          </CardBody>
        </Card>
      );
    }

    // Si es pago a crédito (vale), mostrar interfaz diferente
    if (paymentMethod === 'vale') {
      return (
        <Card maxW="lg" mx="auto">
          <CardHeader textAlign="center">
            <VStack spacing={4}>
              <Icon as={FaMoneyBillWave} boxSize={12} color="orange.500" />
              <Heading size="lg">Pago a Crédito</Heading>
              <Text color="gray.600">
                Tu pedido se anotará en tu vale de crédito
              </Text>
            </VStack>
          </CardHeader>
          <CardBody>
            <VStack spacing={6}>
              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <VStack align="start" spacing={2}>
                  <Text fontWeight="bold">Cómo funciona el pago a crédito:</Text>
                  <Text fontSize="sm">
                    • Tu pedido se anotará automáticamente en tu vale<br/>
                    • El reya tiene su cpartidor NO cobrará nada en la entrega<br/>
                    • Debes pagar todos tus vales al final del mes<br/>
                    • Puedes pagar en efectivo o PLIN cuando sea el momento
                  </Text>
                </VStack>
              </Alert>

              {/* Resumen del pedido */}
              <Card variant="outline" w="full">
                <CardBody>
                  <VStack spacing={3}>
                    <Text fontWeight="bold" fontSize="lg">Resumen del Pedido</Text>
                    <VStack spacing={2} w="full">
                      <HStack justify="space-between" w="full">
                        <Text>Cliente:</Text>
                        <Text fontWeight="bold">{clientData.name}</Text>
                      </HStack>
                      <HStack justify="space-between" w="full">
                        <Text>Modalidad:</Text>
                        <Badge colorScheme="orange">A Crédito (Vale)</Badge>
                      </HStack>
                      <VStack spacing={1} w="full" align="stretch">
                        <Text>Productos:</Text>
                        {cart.map((item, index) => (
                          <HStack key={index} justify="space-between" w="full" pl={2}>
                            <Text fontSize="sm" color="gray.600">
                              • {item.name} x{item.quantity}
                            </Text>
                            <Text fontSize="sm" fontWeight="bold">
                              S/ {parseFloat(item.subtotal).toFixed(2)}
                            </Text>
                          </HStack>
                        ))}
                      </VStack>
                      <HStack justify="space-between" w="full">
                        <Text>Total:</Text>
                        <Text fontWeight="bold" fontSize="lg" color="orange.600">
                          S/ {parseFloat(getTotal()).toFixed(2)} (A Crédito)
                        </Text>
                      </HStack>
                    </VStack>
                  </VStack>
                </CardBody>
              </Card>

                  <Button
                    colorScheme="orange"
                    size="lg"
                    w="full"
                    onClick={handleFinalSubmit}
                    leftIcon={<FaCheckCircle />}
                    isLoading={loading}
                    loadingText="Creando pedido..."
                  >
                    Confirmar Pedido a Crédito
                  </Button>
            </VStack>
          </CardBody>
        </Card>
      );
    }

    // Si es suscripción, mostrar interfaz específica
    if (paymentMethod === 'suscripcion' && selectedSubscriptionPlan) {
      return (
        <Card maxW="lg" mx="auto">
          <CardHeader textAlign="center">
            <VStack spacing={4}>
              <Icon as={FaCalendarAlt} boxSize={12} color="purple.500" />
              <Heading size="lg">Confirmar Suscripción</Heading>
              <Text color="gray.600">
                Plan {selectedSubscriptionPlan.name} seleccionado
              </Text>
            </VStack>
          </CardHeader>
          <CardBody>
            <VStack spacing={6}>
              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <VStack align="start" spacing={2}>
                  <Text fontWeight="bold">Cómo funciona la suscripción:</Text>
                  <Text fontSize="sm">
                    • Pagas una vez al mes por adelantado<br/>
                    • Recibes {selectedSubscriptionPlan.bottles + selectedSubscriptionPlan.bonus} bidones inmediatamente<br/>
                    • Después solo pides la cantidad que necesites sin pagar<br/>
                    • Los bidones se descuentan de tu suscripción
                  </Text>
                </VStack>
              </Alert>

              {/* Información del plan seleccionado */}
              <Card variant="outline" w="full" borderColor="purple.200">
                <CardBody>
                  <VStack spacing={3}>
                    <Text fontWeight="bold" fontSize="lg" color="purple.600">
                      {selectedSubscriptionPlan.name}
                    </Text>
                    <VStack spacing={2} w="full">
                      <HStack justify="space-between" w="full">
                        <Text>Precio del plan:</Text>
                        <Text fontWeight="bold" color="purple.600">
                          S/ {selectedSubscriptionPlan.price}
                        </Text>
                      </HStack>
                      <HStack justify="space-between" w="full">
                        <Text>Bidones incluidos:</Text>
                        <Text fontWeight="bold">{selectedSubscriptionPlan.bottles}</Text>
                      </HStack>
                      <HStack justify="space-between" w="full">
                        <Text>Bidones extra:</Text>
                        <Text fontWeight="bold" color="green.600">+{selectedSubscriptionPlan.bonus}</Text>
                      </HStack>
                      <HStack justify="space-between" w="full">
                        <Text>Total bidones:</Text>
                        <Text fontWeight="bold" fontSize="lg" color="purple.600">
                          {selectedSubscriptionPlan.bottles + selectedSubscriptionPlan.bonus}
                        </Text>
                      </HStack>
                    </VStack>
                  </VStack>
                </CardBody>
              </Card>

              {/* Resumen del pedido */}
              <Card variant="outline" w="full">
                <CardBody>
                  <VStack spacing={3}>
                    <Text fontWeight="bold" fontSize="lg">Resumen del Pedido</Text>
                    <VStack spacing={2} w="full">
                      <HStack justify="space-between" w="full">
                        <Text>Cliente:</Text>
                        <Text fontWeight="bold">{clientData.name}</Text>
                      </HStack>
                      <HStack justify="space-between" w="full">
                        <Text>Modalidad:</Text>
                        <Badge colorScheme="purple">Suscripción {selectedSubscriptionPlan.name}</Badge>
                      </HStack>
                      <HStack justify="space-between" w="full">
                        <Text>Total a pagar:</Text>
                        <Text fontWeight="bold" fontSize="lg" color="purple.600">
                          S/ {selectedSubscriptionPlan.monthlyPrice}
                        </Text>
                      </HStack>
                    </VStack>
                  </VStack>
                </CardBody>
              </Card>

              <VStack spacing={4} w="full">
                <Text fontWeight="bold" fontSize="lg">¿Cómo deseas pagar?</Text>
                <RadioGroup value={paymentType} onChange={setPaymentType}>
                  <Stack spacing={4} w="full">
                    <Card 
                      variant={paymentType === 'efectivo' ? 'filled' : 'outline'}
                      borderColor={paymentType === 'efectivo' ? 'blue.500' : 'gray.200'}
                      cursor="pointer"
                      onClick={() => setPaymentType('efectivo')}
                    >
                      <CardBody>
                        <HStack spacing={4}>
                          <Radio value="efectivo" />
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="bold">Efectivo</Text>
                            <Text fontSize="sm" color="gray.600">
                              Paga en efectivo al repartidor
                            </Text>
                          </VStack>
                        </HStack>
                      </CardBody>
                    </Card>

                    <Card 
                      variant={paymentType === 'plin' ? 'filled' : 'outline'}
                      borderColor={paymentType === 'plin' ? 'blue.500' : 'gray.200'}
                      cursor="pointer"
                      onClick={() => setPaymentType('plin')}
                    >
                      <CardBody>
                        <HStack spacing={4}>
                          <Radio value="plin" />
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="bold">PLIN</Text>
                            <Text fontSize="sm" color="gray.600">
                              Paga con PLIN 
                            </Text>
                          </VStack>
                        </HStack>
                      </CardBody>
                    </Card>
                  </Stack>
                </RadioGroup>

                <Button
                  colorScheme="purple"
                  size="lg"
                  w="full"
                  onClick={paymentType === 'efectivo' ? handleFinalSubmit : handlePLINPayment}
                  leftIcon={<FaCheckCircle />}
                  isLoading={loading}
                  loadingText="Creando suscripción..."
                >
                  {paymentType === 'efectivo' ? 'Confirmar Suscripción' : 'Pagar con PLIN'}
                </Button>
              </VStack>
            </VStack>
          </CardBody>
        </Card>
      );
    }

    // Interfaz normal solo para contraentrega
    return (
      <Card maxW="lg" mx="auto">
        <CardHeader textAlign="center">
          <VStack spacing={4}>
            <Icon as={FaCreditCard} boxSize={12} color="purple.500" />
            <Heading size="lg">Forma de Pago</Heading>
            <Text color="gray.600">
              ¿Cómo deseas pagar?
            </Text>
          </VStack>
        </CardHeader>
        <CardBody>
          <VStack spacing={6}>
            <RadioGroup value={paymentType} onChange={setPaymentType}>
              <Stack spacing={4}>
              <Card 
                variant={paymentType === 'efectivo' ? 'filled' : 'outline'}
                borderColor={paymentType === 'efectivo' ? 'blue.500' : 'gray.200'}
                cursor="pointer"
                onClick={() => setPaymentType('efectivo')}
              >
                <CardBody>
                  <HStack spacing={4}>
                    <Radio value="efectivo" />
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="bold">Efectivo</Text>
                      <Text fontSize="sm" color="gray.600">
                        Paga en efectivo al repartidor
                      </Text>
                    </VStack>
                  </HStack>
                </CardBody>
              </Card>

              <Card 
                variant={paymentType === 'plin' ? 'filled' : 'outline'}
                borderColor={paymentType === 'plin' ? 'blue.500' : 'gray.200'}
                cursor="pointer"
                onClick={() => setPaymentType('plin')}
              >
                <CardBody>
                  <HStack spacing={4}>
                    <Radio value="plin" />
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="bold">PLIN</Text>
                      <Text fontSize="sm" color="gray.600">
                        Pago digital con QR
                      </Text>
                    </VStack>
                  </HStack>
                </CardBody>
              </Card>
            </Stack>
          </RadioGroup>

          {/* Resumen del pedido */}
          <Card variant="outline" w="full">
            <CardBody>
              <VStack spacing={3}>
                <Text fontWeight="bold" fontSize="lg">Resumen del Pedido</Text>
                <VStack spacing={2} w="full">
                  <HStack justify="space-between" w="full">
                    <Text>Cliente:</Text>
                    <Text fontWeight="bold">{clientData.name}</Text>
                  </HStack>
                  <HStack justify="space-between" w="full">
                    <Text>Modalidad:</Text>
                    <Badge colorScheme="blue">
                      {paymentMethod === 'contraentrega' ? 'Contraentrega' : 
                       paymentMethod === 'vale' ? 'A Crédito (Vale)' : 'Suscripción'}
                    </Badge>
                  </HStack>
                  <VStack spacing={1} w="full" align="stretch">
                    <Text>Productos:</Text>
                    {cart.map((item, index) => (
                      <HStack key={index} justify="space-between" w="full" pl={2}>
                        <Text fontSize="sm" color="gray.600">
                          • {item.name} x{item.quantity}
                        </Text>
                        <Text fontSize="sm" fontWeight="bold">
                          S/ {parseFloat(item.subtotal).toFixed(2)}
                        </Text>
                      </HStack>
                    ))}
                  </VStack>
                  <HStack justify="space-between" w="full">
                    <Text>Total:</Text>
                    <Text fontWeight="bold" fontSize="lg" color="blue.600">
                      S/ {parseFloat(getTotal()).toFixed(2)}
                    </Text>
                  </HStack>
                </VStack>
              </VStack>
            </CardBody>
          </Card>

          {/* Términos y Condiciones */}
          <Card variant="outline" w="full">
            <CardBody>
              <VStack spacing={4}>
                <HStack w="full" justify="space-between">
                  <Text fontWeight="bold">Términos y Condiciones</Text>
                  <Button
                    size="sm"
                    variant="outline"
                    colorScheme="blue"
                    onClick={() => setShowTermsModal(true)}
                  >
                    Ver Términos
                  </Button>
                </HStack>
                <HStack w="full" spacing={3}>
                  <Checkbox
                    isChecked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    colorScheme="blue"
                    size="lg"
                  />
                  <Text fontSize="sm" color="gray.600">
                    He leído y acepto los términos y condiciones del servicio
                  </Text>
                </HStack>
              </VStack>
            </CardBody>
          </Card>

            <Button
              colorScheme="green"
              size="lg"
              w="full"
              onClick={paymentType === 'efectivo' ? handleFinalSubmit : handlePLINPayment}
              leftIcon={<FaCheckCircle />}
              isLoading={loading}
              loadingText="Creando pedido..."
              isDisabled={!termsAccepted}
            >
              {paymentType === 'efectivo' ? 'Confirmar Pedido' : 'Pagar con PLIN'}
            </Button>
          </VStack>
        </CardBody>
      </Card>
    );
  };

  // Renderizar paso 6: Pago de suscripción
  const renderStep6 = () => {
    return (
      <Card maxW="lg" mx="auto">
        <CardHeader textAlign="center">
          <VStack spacing={4}>
            <Icon as={FaCreditCard} boxSize={12} color="purple.500" />
            <Heading size="lg">Pago de Suscripción</Heading>
            <Text color="gray.600">
              Selecciona tu método de pago para la suscripción
            </Text>
          </VStack>
        </CardHeader>
        <CardBody>
          <VStack spacing={6}>
            {/* Resumen de la suscripción */}
            <Card variant="outline" w="full" borderColor="purple.200">
              <CardBody>
                <VStack spacing={3}>
                  <Text fontWeight="bold" fontSize="lg" color="purple.600">
                    {selectedSubscriptionPlan.name}
                  </Text>
                  <HStack justify="space-between" w="full">
                    <Text>Total bidones:</Text>
                    <Text fontWeight="bold">{selectedSubscriptionPlan.bottles + selectedSubscriptionPlan.bonus}</Text>
                  </HStack>
                  <HStack justify="space-between" w="full">
                    <Text>Precio por bidón:</Text>
                    <Text fontWeight="bold">S/ {parseFloat(selectedSubscriptionPlan.pricePerBottle).toFixed(2)}</Text>
                  </HStack>
                  <Divider />
                  <HStack justify="space-between" w="full">
                    <Text fontSize="lg" fontWeight="bold">Total a pagar:</Text>
                    <Text fontSize="xl" fontWeight="bold" color="purple.600">
                      S/ {parseFloat(selectedSubscriptionPlan.price).toFixed(2)}
                    </Text>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>

            {/* Opciones de pago */}
            <VStack spacing={4} w="full">
              <Text fontWeight="bold" fontSize="lg">Método de Pago</Text>
              
              {/* Pago en Efectivo */}
              <Card
                variant={paymentType === 'efectivo' ? 'filled' : 'outline'}
                borderColor={paymentType === 'efectivo' ? 'green.500' : 'gray.200'}
                cursor="pointer"
                onClick={() => setPaymentType('efectivo')}
                _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
                transition="all 0.2s"
              >
                <CardBody>
                  <HStack spacing={4}>
                    <Icon as={FaMoneyBillWave} boxSize={8} color="green.500" />
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="bold">Pago en Efectivo</Text>
                      <Text fontSize="sm" color="gray.600">
                        Paga cuando recibas tu suscripción
                      </Text>
                    </VStack>
                  </HStack>
                </CardBody>
              </Card>

              {/* Pago con Plin */}
              <Card
                variant={paymentType === 'plin' ? 'filled' : 'outline'}
                borderColor={paymentType === 'plin' ? 'purple.500' : 'gray.200'}
                cursor="pointer"
                onClick={() => setPaymentType('plin')}
                _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
                transition="all 0.2s"
              >
                <CardBody>
                  <HStack spacing={4}>
                    <Icon as={FaQrcode} boxSize={8} color="purple.500" />
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="bold">Pago con Plin</Text>
                      <Text fontSize="sm" color="gray.600">
                        Paga con QR de Plin
                      </Text>
                    </VStack>
                  </HStack>
                </CardBody>
              </Card>
            </VStack>

            {/* Botones */}
            <HStack spacing={4} w="full">
              <Button
                variant="outline"
                flex={1}
                onClick={() => setCurrentStep(5)}
              >
                ← Anterior
              </Button>
              <Button
                colorScheme="purple"
                flex={1}
                onClick={() => {
                  if (paymentType === 'efectivo') {
                    // Crear suscripción directamente
                    handleCreateSubscription('efectivo');
                  } else if (paymentType === 'plin') {
                    // Mostrar modal de Plin
                    onPlinModalOpen();
                  }
                }}
                leftIcon={paymentType === 'efectivo' ? <FaCheckCircle /> : <FaQrcode />}
                isLoading={loading}
                loadingText={paymentType === 'efectivo' ? 'Creando suscripción...' : 'Preparando pago...'}
              >
                {paymentType === 'efectivo' ? 'Confirmar Suscripción' : 'Pagar con Plin'}
              </Button>
            </HStack>
          </VStack>
        </CardBody>
      </Card>
    );
  };

  // Modal para pago PLIN
  const renderPlinModal = () => (
    <Modal isOpen={isPlinModalOpen} onClose={handlePlinModalClose} size={{ base: "full", sm: "md" }} isCentered>
      <ModalOverlay />
      <ModalContent 
        mx={{ base: 0, sm: 4 }} 
        my={{ base: 0, sm: 4 }} 
        maxH={{ base: "100vh", sm: "90vh" }}
        maxW={{ base: "100vw", sm: "500px" }}
        w={{ base: "100%", sm: "auto" }}
      >
        <ModalHeader textAlign="center" p={{ base: 3, md: 4 }}>
          <VStack spacing={2}>
            <Icon as={FaQrcode} boxSize={{ base: 6, md: 8 }} color="purple.500" />
            <Text fontSize={{ base: "md", md: "lg" }}>Pago con PLIN</Text>
          </VStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={{ base: 3, md: 4 }} px={{ base: 3, md: 4 }} overflowY="auto">
          <VStack spacing={{ base: 3, md: 4 }} w="100%">
            <Alert status="info" fontSize={{ base: "xs", md: "sm" }} w="100%">
              <AlertIcon />
              <Text>Escanea el código QR con tu app PLIN</Text>
            </Alert>

            <Box textAlign="center" w="100%" maxW="250px" mx="auto">
              <Image
                src={plinQrImage}
                alt="QR PLIN"
                w="100%"
                h="auto"
                borderRadius="md"
              />
            </Box>

            <VStack spacing={2} w="100%">
              <Text fontWeight="bold" fontSize={{ base: "md", md: "lg" }} textAlign="center">
                Total a pagar: S/ {paymentMethod === 'suscripcion' && selectedSubscriptionPlan 
                  ? parseFloat(selectedSubscriptionPlan.price).toFixed(2)
                  : parseFloat(getTotal()).toFixed(2)
                }
              </Text>
              <Text fontSize={{ base: "xs", md: "sm" }} color="gray.600" textAlign="center">
                {paymentMethod === 'suscripcion' && selectedSubscriptionPlan 
                  ? `Plan ${selectedSubscriptionPlan.name} - ${selectedSubscriptionPlan.bottles + selectedSubscriptionPlan.bonus} bidones`
                  : "Incluye productos + flete de envío"
                }
              </Text>
            </VStack>

            <Alert status={whatsappSent ? "success" : "warning"} fontSize={{ base: "xs", md: "sm" }}>
              <AlertIcon />
              <Text>
                {whatsappSent 
                  ? "✅ Comprobante enviado por WhatsApp. Ahora puedes confirmar el pago."
                  : "Después de pagar, envía el comprobante por WhatsApp"
                }
              </Text>
            </Alert>

            {/* Checkbox para suscripciones */}
        {paymentMethod === 'suscripcion' && selectedSubscriptionPlan && (
          <Alert status="info" fontSize={{ base: "xs", md: "sm" }}>
            <AlertIcon />
            <Text>
              <strong>Importante:</strong> Una vez pagada la suscripción, podrás hacer pedidos usando tus bidones sin costo adicional.
            </Text>
          </Alert>
        )}

            <VStack spacing={{ base: 2, md: 3 }} w="full">
              <Button
                colorScheme="green"
                size={{ base: "md", md: "lg" }}
                w="full"
                leftIcon={<FaWhatsapp />}
                onClick={handleWhatsAppSend}
                fontSize={{ base: "sm", md: "md" }}
              >
                Enviar Comprobante por WhatsApp
              </Button>
              
              <Button
                colorScheme="purple"
                size={{ base: "md", md: "lg" }}
                w="full"
                leftIcon={<FaCheckCircle />}
                onClick={async () => {
                  if (paymentMethod === 'suscripcion' && selectedSubscriptionPlan) {
                    // Para suscripciones, crear la suscripción directamente
                    try {
                      setLoading(true);
                      await handleCreateSubscription('plin');
                    } catch (error) {
                      console.error('Error en suscripción:', error);
                    } finally {
                      setLoading(false);
                    }
                  } else {
                    // Para pedidos normales, confirmar directamente
                    await handleConfirmPLINPayment();
                  }
                }}
                isLoading={loading}
                loadingText={paymentMethod === 'suscripcion' ? 'Creando suscripción...' : 'Creando pedido...'}
                isDisabled={!whatsappSent || loading}
                opacity={whatsappSent ? 1 : 0.5}
                fontSize={{ base: "sm", md: "md" }}
              >
                {whatsappSent ? 'Confirmar Pago y Crear Pedido' : 'Primero envía el comprobante por WhatsApp'}
              </Button>
            </VStack>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );

  return (
    <Box minH="100vh" bg="gray.50" py={{ base: 4, md: 8 }}>
      <Box maxW="1200px" mx="auto" px={{ base: 2, sm: 4 }}>
        <VStack spacing={{ base: 4, md: 8 }}>
          {/* Header */}
          <Box textAlign="center" w="100%">
            <Heading size={{ base: "lg", md: "xl" }} color="blue.600" mb={2}>
              Pedido Rápido de Agua
            </Heading>
            <Text color="gray.600" fontSize={{ base: "md", md: "lg" }}>
              Proceso simplificado en 5 pasos
            </Text>
          </Box>

          {/* Indicador de pasos */}
          <Box w="100%" overflowX="auto" pb={2}>
            <HStack 
              spacing={{ base: 1, sm: 2, md: 4 }} 
              justify="center" 
              minW="max-content"
              px={{ base: 2, md: 0 }}
            >
              {[1, 2, 3, 4, 5, 6].map((step) => (
                <VStack key={step} spacing={1} minW={{ base: "60px", sm: "70px" }}>
                  <Box
                    w={{ base: 8, sm: 10, md: 12 }}
                    h={{ base: 8, sm: 10, md: 12 }}
                    borderRadius="full"
                    bg={step <= currentStep ? 'blue.500' : 'gray.200'}
                    color={step <= currentStep ? 'white' : 'gray.500'}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    fontSize={{ base: "xs", sm: "sm", md: "md" }}
                    fontWeight="bold"
                    flexShrink={0}
                  >
                    {step}
                  </Box>
                  <Text 
                    fontSize={{ base: "2xs", sm: "xs", md: "sm" }} 
                    color={step <= currentStep ? 'blue.600' : 'gray.500'}
                    textAlign="center"
                    whiteSpace="nowrap"
                  >
                    {step === 1 ? 'DNI' : 
                     step === 2 ? 'Datos' : 
                     step === 3 ? 'Productos' : 
                     step === 4 ? 'Modalidad' : 
                     step === 5 ? 'Confirmar' :
                     step === 6 ? 'Pago' : step}
                  </Text>
                </VStack>
              ))}
            </HStack>
          </Box>

          {/* Contenido del paso actual */}
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
          {currentStep === 5 && renderStep5()}
          {currentStep === 6 && renderStep6()}

          {/* Botones de navegación */}
          {currentStep > 1 && (
            <HStack spacing={4}>
              <Button
                variant="outline"
                onClick={() => setCurrentStep(currentStep - 1)}
              >
                ← Anterior
              </Button>
              {currentStep < 6 && (
                <Button
                  colorScheme="blue"
                  onClick={() => {
                    // Si está en modo suscripción y es el paso 3, ir directamente a confirmación
                    if (isSubscriptionMode && selectedSubscription && currentStep === 3) {
                      setCurrentStep(5); // Ir directamente a confirmación
                    } else {
                      setCurrentStep(currentStep + 1);
                    }
                  }}
                >
                  Siguiente →
                </Button>
              )}
            </HStack>
          )}
        </VStack>
      </Box>

      {/* Modal PLIN */}
      {renderPlinModal()}

      {/* Modal de Términos y Condiciones */}
      <TermsAndConditionsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        onAccept={handleTermsAccept}
        onReject={handleTermsReject}
        title="Términos y Condiciones - Planta de Agua Aquayara"
        showAcceptance={true}
      />
    </Box>
  );
};

export default GuestOrderNew;
