import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import styled from 'styled-components';

const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
`;

const Sidebar = styled.aside`
  width: 250px;
  background-color: var(--primary-color);
  color: white;
  padding: 1.5rem 0;
  display: flex;
  flex-direction: column;
`;

const Logo = styled.div`
  padding: 0 1.5rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 1.5rem;
  
  h1 {
    font-size: 1.5rem;
    margin-bottom: 0.25rem;
  }
  
  p {
    font-size: 0.875rem;
    opacity: 0.8;
  }
`;

const NavMenu = styled.nav`
  flex: 1;
  
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
`;

const NavItem = styled(NavLink)`
  display: flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
    color: white;
  }
  
  &.active {
    background-color: rgba(255, 255, 255, 0.2);
    color: white;
    border-left: 4px solid var(--accent-color);
  }
  
  svg {
    margin-right: 0.75rem;
  }
`;

const UserSection = styled.div`
  padding: 1rem 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: auto;
  
  .user-info {
    display: flex;
    align-items: center;
    margin-bottom: 0.5rem;
    
    .avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background-color: var(--accent-color);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 0.75rem;
      font-weight: bold;
    }
    
    .user-name {
      font-weight: 500;
    }
    
    .user-role {
      font-size: 0.75rem;
      opacity: 0.8;
    }
  }
  
  .logout-btn {
    background-color: rgba(255, 255, 255, 0.1);
    color: white;
    border: none;
    padding: 0.5rem;
    border-radius: 4px;
    width: 100%;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      background-color: rgba(255, 255, 255, 0.2);
    }
  }
`;

const MainContent = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: var(--background-color);
`;

const Header = styled.header`
  background-color: white;
  padding: 1rem 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  h2 {
    font-size: 1.25rem;
    color: var(--text-color);
    margin: 0;
  }
  
  .actions {
    display: flex;
    gap: 1rem;
  }
`;

const Content = styled.div`
  padding: 2rem;
  flex: 1;
  overflow-y: auto;
`;

const DashboardLayout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  // Obtener las iniciales del usuario para el avatar
  const getUserInitials = () => {
    if (!user || !user.username) return '?';
    return user.username.charAt(0).toUpperCase();
  };

  return (
    <LayoutContainer>
      <Sidebar>
        <Logo>
          <h1>Sistema</h1>
          <p>Planta de Agua</p>
        </Logo>
        
        <NavMenu>
          <ul>
            <li>
              <NavItem to="/dashboard" end>
                <span>Dashboard</span>
              </NavItem>
            </li>
            <li>
              <NavItem to="/dashboard/products">
                <span>Productos</span>
              </NavItem>
            </li>
            <li>
              <NavItem to="/dashboard/clients">
                <span>Clientes</span>
              </NavItem>
            </li>
            <li>
              <NavItem to="/dashboard/sales">
                <span>Ventas</span>
              </NavItem>
            </li>
            <li>
              <NavItem to="/dashboard/pos">
                <span>Punto de Venta</span>
              </NavItem>
            </li>
            <li>
              <NavItem to="/dashboard/cash-register">
                <span>Caja</span>
              </NavItem>
            </li>
            <li>
              <NavItem to="/dashboard/credits">
                <span>Créditos</span>
              </NavItem>
            </li>
            <li>
              <NavItem to="/dashboard/reports">
                <span>Reportes</span>
              </NavItem>
            </li>
          </ul>
        </NavMenu>
        
        <UserSection>
          <div className="user-info">
            <div className="avatar">{getUserInitials()}</div>
            <div>
              <div className="user-name">{user?.username}</div>
              <div className="user-role">{user?.role}</div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>Cerrar Sesión</button>
        </UserSection>
      </Sidebar>
      
      <MainContent>
        <Content>
          <Outlet />
        </Content>
      </MainContent>
    </LayoutContainer>
  );
};

export default DashboardLayout;