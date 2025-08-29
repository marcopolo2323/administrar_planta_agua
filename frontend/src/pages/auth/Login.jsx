import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuthStore } from '../../stores/authStore';
import { FormGroup, Label, Input, ErrorMessage } from '../../components/ui/FormElements';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';

const LoginForm = styled.form`
  width: 100%;
`;

const Login = () => {
  const navigate = useNavigate();
  const { login, error, clearError } = useAuthStore();
  
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Limpiar errores al editar
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };
  
  const validateForm = () => {
    const errors = {};
    
    if (!formData.username.trim()) {
      errors.username = 'El nombre de usuario es requerido';
    }
    
    if (!formData.password) {
      errors.password = 'La contraseña es requerida';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    clearError();
    
    const success = await login(formData);
    
    setIsSubmitting(false);
    
    if (success) {
      navigate('/dashboard');
    }
  };
  
  return (
    <>
      {error && (
        <Alert 
          type="danger" 
          message={error} 
          dismissible 
          onClose={clearError}
        />
      )}
      
      <LoginForm onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="username">Nombre de Usuario</Label>
          <Input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Ingrese su nombre de usuario"
          />
          {formErrors.username && (
            <ErrorMessage>{formErrors.username}</ErrorMessage>
          )}
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="password">Contraseña</Label>
          <Input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Ingrese su contraseña"
          />
          {formErrors.password && (
            <ErrorMessage>{formErrors.password}</ErrorMessage>
          )}
        </FormGroup>
        
        <Button 
          type="submit" 
          variant="primary" 
          fullWidth 
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Iniciando sesión...' : 'Iniciar Sesión'}
        </Button>
      </LoginForm>
    </>
  );
};

export default Login;