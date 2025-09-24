import useAuthStore from '../stores/authStore';

export const useRole = () => {
  const { user } = useAuthStore();

  const hasRole = (roles) => {
    if (!user || !user.role) return false;
    if (Array.isArray(roles)) {
      return roles.includes(user.role);
    }
    return user.role === roles;
  };

  const isAdmin = () => hasRole('admin');
  const isSeller = () => hasRole('vendedor');
  const isClient = () => hasRole('cliente');
  const isDeliveryPerson = () => hasRole('repartidor');

  const canAccess = (requiredRoles) => {
    return hasRole(requiredRoles);
  };

  return {
    user,
    hasRole,
    isAdmin,
    isSeller,
    isClient,
    isDeliveryPerson,
    canAccess
  };
};
