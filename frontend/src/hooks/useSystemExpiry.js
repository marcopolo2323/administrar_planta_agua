import { useState, useEffect } from 'react';

// Fecha de inicio del sistema (ajusta esta fecha según cuando se implemente)
const SYSTEM_START_DATE = new Date('2025-09-24'); // Cambia esta fecha
const EXPIRY_MONTHS = 2; // 2 meses de prueba

export const useSystemExpiry = () => {
  const [isExpired, setIsExpired] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkExpiry = () => {
      try {
        const now = new Date();
        const expiryDate = new Date(SYSTEM_START_DATE);
        expiryDate.setMonth(expiryDate.getMonth() + EXPIRY_MONTHS);

        console.log('🔍 Verificando expiración del sistema:');
        console.log('📅 Fecha de inicio:', SYSTEM_START_DATE.toLocaleDateString());
        console.log('⏰ Fecha de expiración:', expiryDate.toLocaleDateString());
        console.log('📅 Fecha actual:', now.toLocaleDateString());

        if (now >= expiryDate) {
          console.log('❌ Sistema expirado');
          setIsExpired(true);
          setDaysRemaining(0);
        } else {
          const timeDiff = expiryDate.getTime() - now.getTime();
          const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));
          console.log('✅ Sistema activo, días restantes:', daysLeft);
          setIsExpired(false);
          setDaysRemaining(daysLeft);
        }
      } catch (error) {
        console.error('Error verificando expiración:', error);
        // En caso de error, permitir acceso (fallback)
        setIsExpired(false);
        setDaysRemaining(999);
      } finally {
        setIsLoading(false);
      }
    };

    checkExpiry();
    
    // Verificar cada hora
    const interval = setInterval(checkExpiry, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    isExpired,
    daysRemaining,
    isLoading,
    expiryDate: new Date(new Date(SYSTEM_START_DATE).setMonth(new Date(SYSTEM_START_DATE).getMonth() + EXPIRY_MONTHS))
  };
};
