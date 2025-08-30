import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSaleStore } from '../../stores/saleStore';
import { useClientStore } from '../../stores/clientStore';
import styled from 'styled-components';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import { FormGroup, Label, Input, Select } from '../../components/ui/FormElements';
import Alert from '../../components/ui/Alert';

const SalesContainer = styled.div`
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const ActionsBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  
  .search-container {
    display: flex;
    gap: 0.5rem;
    width: 100%;
    max-width: 400px;
  }
  
  .filters {
    display: flex;
    gap: 0.5rem;
  }
`;

const StatusBadge = styled.span`
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
  background-color: ${props => {
    switch (props.status) {
      case 'pagado':
        return 'var(--success-color)';
      case 'pendiente':
        return 'var(--warning-color)';
      case 'anulado':
        return 'var(--danger-color)';
      default:
        return 'var(--gray-color)';
    }
  }};
  color: white;
`;

const Sales = () => {
  const { sales, loading, error, fetchSales, fetchSalesByClient, fetchSalesByDate, cancelSale } = useSaleStore();
  const { clients, fetchClients } = useClientStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClient, setFilterClient] = useState('');
  const [filterDateStart, setFilterDateStart] = useState('');
  const [filterDateEnd, setFilterDateEnd] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [currentSale, setCurrentSale] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchSales();
    fetchClients();
  }, [fetchSales, fetchClients]);

  const handleSearch = () => {
    if (filterClient) {
      fetchSalesByClient(filterClient);
    } else if (filterDateStart && filterDateEnd) {
      fetchSalesByDate(filterDateStart, filterDateEnd);
    } else {
      fetchSales();
    }
  };

  const handleResetFilters = () => {
    setFilterClient('');
    setFilterDateStart('');
    setFilterDateEnd('');
    fetchSales();
  };

  const handleCancelSale = async () => {
    if (!currentSale) return;
    
    const result = await cancelSale(currentSale.id);
    if (result) {
      setShowCancelModal(false);
      setCurrentSale(null);
      setSuccessMessage('Venta anulada correctamente');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const openCancelModal = (sale) => {
    setCurrentSale(sale);
    setShowCancelModal(true);
  };

  const handleCloseModal = () => {
    setShowCancelModal(false);
    setCurrentSale(null);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredSales = sales.filter(sale => {
    const clientName = sale.Client?.name?.toLowerCase() || '';
    const invoiceNumber = sale.invoiceNumber?.toLowerCase() || '';
    const searchLower = searchTerm.toLowerCase();
    
    return clientName.includes(searchLower) || invoiceNumber.includes(searchLower);
  });

  if (loading && sales.length === 0) {
    return <div>Cargando ventas...</div>;
  }

  return (
    <SalesContainer>
      {successMessage && (
        <Alert type="success" onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      )}
      
      <Card>
        <Card.Header>
          <h3>Gestión de Ventas</h3>
        </Card.Header>
        <Card.Body>
          <ActionsBar>
            <div className="search-container">
              <Input 
                type="text" 
                placeholder="Buscar ventas..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button 
                variant="secondary" 
                size="small"
                onClick={() => setShowFilters(!showFilters)}
              >
                Filtros
              </Button>
            </div>
            <Link to="/dashboard/sales/new">
              <Button variant="primary">Nueva Venta</Button>
            </Link>
          </ActionsBar>
          
          {showFilters && (
            <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: 'var(--bg-light)', borderRadius: '4px' }}>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <FormGroup style={{ flex: 1 }}>
                  <Label htmlFor="filterClient">Cliente</Label>
                  <Select 
                    id="filterClient" 
                    value={filterClient}
                    onChange={(e) => setFilterClient(e.target.value)}
                  >
                    <option value="">Todos los clientes</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>{client.name}</option>
                    ))}
                  </Select>
                </FormGroup>
                
                <FormGroup style={{ flex: 1 }}>
                  <Label htmlFor="filterDateStart">Fecha Inicio</Label>
                  <Input 
                    type="date" 
                    id="filterDateStart" 
                    value={filterDateStart}
                    onChange={(e) => setFilterDateStart(e.target.value)}
                  />
                </FormGroup>
                
                <FormGroup style={{ flex: 1 }}>
                  <Label htmlFor="filterDateEnd">Fecha Fin</Label>
                  <Input 
                    type="date" 
                    id="filterDateEnd" 
                    value={filterDateEnd}
                    onChange={(e) => setFilterDateEnd(e.target.value)}
                  />
                </FormGroup>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <Button 
                  variant="outline" 
                  size="small"
                  onClick={handleResetFilters}
                >
                  Limpiar
                </Button>
                <Button 
                  variant="primary" 
                  size="small"
                  onClick={handleSearch}
                >
                  Aplicar Filtros
                </Button>
              </div>
            </div>
          )}
          
          <Table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Comprobante</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.length > 0 ? (
                filteredSales.map(sale => (
                  <tr key={sale.id}>
                    <td>{formatDate(sale.date)}</td>
                    <td>{sale.Client?.name || 'Cliente no registrado'}</td>
                    <td>{sale.invoiceType.toUpperCase()}: {sale.invoiceNumber || 'S/N'}</td>
                    <td>S/ {typeof sale.total === 'number' ? sale.total.toFixed(2) : (sale.total && !isNaN(parseFloat(sale.total))) ? parseFloat(sale.total).toFixed(2) : '0.00'}</td>
                    <td>
                      <StatusBadge status={sale.status}>
                        {sale.status === 'pagado' ? 'Pagado' : 
                         sale.status === 'pendiente' ? 'Pendiente' : 'Anulado'}
                      </StatusBadge>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Link to={`/dashboard/sales/${sale.id}`}>
                          <Button 
                            variant="secondary" 
                            size="small"
                          >
                            Ver
                          </Button>
                        </Link>
                        {sale.status !== 'anulado' && (
                          <Button 
                            variant="danger" 
                            size="small"
                            onClick={() => openCancelModal(sale)}
                          >
                            Anular
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center' }}>
                    {searchTerm || filterClient || filterDateStart 
                      ? 'No se encontraron ventas con los filtros aplicados' 
                      : 'No hay ventas registradas'}
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
      
      {/* Modal para anular venta */}
      <Modal 
        isOpen={showCancelModal} 
        onClose={handleCloseModal}
        title="Anular Venta"
      >
        {error && <Alert type="danger">{error}</Alert>}
        
        <p>¿Estás seguro de que deseas anular la venta {currentSale?.invoiceType.toUpperCase()}: {currentSale?.invoiceNumber || 'S/N'}?</p>
        <p>Esta acción devolverá el stock de los productos y no se puede deshacer.</p>
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
          <Button 
            variant="outline" 
            onClick={handleCloseModal}
          >
            Cancelar
          </Button>
          <Button 
            variant="danger" 
            onClick={handleCancelSale}
          >
            Anular Venta
          </Button>
        </div>
      </Modal>
    </SalesContainer>
  );
};

export default Sales;