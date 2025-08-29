import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useAuthStore } from '../../stores/authStore';
import { useProductStore } from '../../stores/productStore';
import { useClientStore } from '../../stores/clientStore';
import { useSaleStore } from '../../stores/saleStore';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const WelcomeSection = styled.div`
  h1 {
    font-size: 1.75rem;
    margin-bottom: 0.5rem;
    color: var(--text-color);
  }
  
  p {
    color: var(--dark-gray);
    margin-bottom: 1.5rem;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
`;

const StatCard = styled(Card)`
  .stat-value {
    font-size: 2rem;
    font-weight: 600;
    color: var(--primary-color);
    margin-bottom: 0.5rem;
  }
  
  .stat-label {
    color: var(--dark-gray);
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
`;

const ActionsSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
`;

const ActionCard = styled(Card)`
  h3 {
    margin-bottom: 1rem;
  }
  
  p {
    color: var(--dark-gray);
    margin-bottom: 1.5rem;
  }
`;

const Dashboard = () => {
  const { user } = useAuthStore();
  const { products, fetchProducts } = useProductStore();
  const { clients, fetchClients } = useClientStore();
  const { sales, fetchSales } = useSaleStore();
  
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [todaySales, setTodaySales] = useState(0);
  const [todayAmount, setTodayAmount] = useState(0);
  
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchProducts(),
        fetchClients(),
        fetchSales()
      ]);
    };
    
    loadData();
  }, [fetchProducts, fetchClients, fetchSales]);
  
  useEffect(() => {
    // Identificar productos con stock bajo (menos de 10 unidades)
    if (products.length > 0) {
      const lowStock = products.filter(product => product.stock < 10);
      setLowStockProducts(lowStock);
    }
    
    // Calcular ventas de hoy
    if (sales.length > 0) {
      const today = new Date().toISOString().split('T')[0];
      const todaySalesData = sales.filter(sale => {
        const saleDate = new Date(sale.date).toISOString().split('T')[0];
        return saleDate === today && sale.status === 'completada';
      });
      
      setTodaySales(todaySalesData.length);
      setTodayAmount(todaySalesData.reduce((sum, sale) => sum + sale.total, 0));
    }
  }, [products, sales]);
  
  return (
    <DashboardContainer>
      <WelcomeSection>
        <h1>Bienvenido, {user?.username}</h1>
        <p>Aquí tienes un resumen de la actividad reciente y acciones rápidas.</p>
      </WelcomeSection>
      
      <StatsGrid>
        <StatCard>
          <Card.Body>
            <div className="stat-value">{products.length}</div>
            <div className="stat-label">Productos Activos</div>
          </Card.Body>
        </StatCard>
        
        <StatCard>
          <Card.Body>
            <div className="stat-value">{clients.length}</div>
            <div className="stat-label">Clientes Registrados</div>
          </Card.Body>
        </StatCard>
        
        <StatCard>
          <Card.Body>
            <div className="stat-value">{todaySales}</div>
            <div className="stat-label">Ventas Hoy</div>
          </Card.Body>
        </StatCard>
        
        <StatCard>
          <Card.Body>
            <div className="stat-value">S/ {todayAmount.toFixed(2)}</div>
            <div className="stat-label">Ingresos Hoy</div>
          </Card.Body>
        </StatCard>
      </StatsGrid>
      
      <ActionsSection>
        <ActionCard>
          <Card.Body>
            <h3>Nueva Venta</h3>
            <p>Registra una nueva venta de productos a un cliente.</p>
            <Button as={Link} to="/dashboard/sales/new" variant="primary">
              Crear Venta
            </Button>
          </Card.Body>
        </ActionCard>
        
        <ActionCard>
          <Card.Body>
            <h3>Gestionar Productos</h3>
            <p>Administra el inventario, precios y detalles de productos.</p>
            <Button as={Link} to="/dashboard/products" variant="secondary">
              Ver Productos
            </Button>
          </Card.Body>
        </ActionCard>
        
        <ActionCard>
          <Card.Body>
            <h3>Gestionar Clientes</h3>
            <p>Administra la información y el historial de tus clientes.</p>
            <Button as={Link} to="/dashboard/clients" variant="secondary">
              Ver Clientes
            </Button>
          </Card.Body>
        </ActionCard>
        
        <ActionCard>
          <Card.Body>
            <h3>Reportes de Ventas</h3>
            <p>Visualiza reportes y estadísticas de ventas por período.</p>
            <Button as={Link} to="/dashboard/reports" variant="secondary">
              Ver Reportes
            </Button>
          </Card.Body>
        </ActionCard>
      </ActionsSection>
      
      {lowStockProducts.length > 0 && (
        <Card>
          <Card.Header>
            <h3>Alerta de Stock Bajo</h3>
          </Card.Header>
          <Card.Body>
            <p>Los siguientes productos tienen un stock menor a 10 unidades:</p>
            <ul>
              {lowStockProducts.map(product => (
                <li key={product.id}>
                  {product.name} - Stock actual: {product.stock} unidades
                </li>
              ))}
            </ul>
          </Card.Body>
          <Card.Footer>
            <Button as={Link} to="/dashboard/products" variant="outline">
              Gestionar Inventario
            </Button>
          </Card.Footer>
        </Card>
      )}
    </DashboardContainer>
  );
};

export default Dashboard;