import { Outlet } from 'react-router-dom';
import styled from 'styled-components';

const AuthContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: var(--background-color);
`;

const AuthCard = styled.div`
  width: 100%;
  max-width: 450px;
  padding: 2rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const Logo = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  
  h1 {
    color: var(--primary-color);
    font-size: 1.8rem;
    margin-bottom: 0.5rem;
  }
  
  p {
    color: var(--dark-gray);
    font-size: 1rem;
  }
`;

const AuthLayout = () => {
  return (
    <AuthContainer>
      <AuthCard>
        <Logo>
          <h1>Sistema de Gestión</h1>
          <p>Planta de Agua</p>
        </Logo>
        <Outlet />
      </AuthCard>
    </AuthContainer>
  );
};

export default AuthLayout;