import { useState, useEffect } from 'react';
import axios from '../../utils/axios';
import styled, { keyframes } from 'styled-components';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import { FormGroup, Label, Input, Select, Textarea, ErrorMessage } from '../../components/ui/FormElements';
import Alert from '../../components/ui/Alert';

const Credits = () => {
  const [credits, setCredits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCredit, setSelectedCredit] = useState(null);
  const [payments, setPayments] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPaymentsHistoryModal, setShowPaymentsHistoryModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDescription, setPaymentDescription] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'paid', 'overdue'
  const [clientFilter, setClientFilter] = useState('');
  const [clients, setClients] = useState([]);

  useEffect(() => {
    const fetchCredits = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/credits');
        setCredits(response.data);
        setError(null);
      } catch (err) {
        setError('Error al cargar los créditos: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchClients = async () => {
      try {
        const response = await axios.get('/api/clients');
        setClients(response.data);
      } catch (err) {
        console.error('Error al cargar los clientes:', err);
      }
    };

    fetchCredits();
    fetchClients();
  }, []);

  const fetchCreditPayments = async (creditId) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/credits/${creditId}/payments`);
      setPayments(response.data);
      setError(null);
    } catch (err) {
      setError('Error al cargar los pagos: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterPayment = async (e) => {
    e.preventDefault();
    if (!selectedCredit || !paymentAmount) return;

    try {
      setLoading(true);
      await axios.post(`/api/credits/${selectedCredit.id}/payments`, {
        amount: parseFloat(paymentAmount),
        description: paymentDescription || 'Pago de crédito'
      });
      
      // Recargar los créditos para actualizar el estado
      const response = await axios.get('/api/credits');
      setCredits(response.data);
      
      // Limpiar el formulario y cerrar el modal
      setPaymentAmount('');
      setPaymentDescription('');
      setShowPaymentModal(false);
      setError(null);
    } catch (err) {
      setError('Error al registrar el pago: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const openPaymentModal = (credit) => {
    setSelectedCredit(credit);
    setPaymentAmount('');
    setPaymentDescription('');
    setShowPaymentModal(true);
  };

  const openPaymentsHistoryModal = async (credit) => {
    setSelectedCredit(credit);
    await fetchCreditPayments(credit.id);
    setShowPaymentsHistoryModal(true);
  };

  const filteredCredits = credits.filter(credit => {
    // Filtrar por estado
    if (filter === 'pending' && credit.status !== 'pendiente') return false;
    if (filter === 'paid' && credit.status !== 'pagado') return false;
    if (filter === 'overdue' && !credit.isOverdue) return false;
    
    // Filtrar por cliente
    if (clientFilter && credit.client && credit.client.id !== parseInt(clientFilter)) return false;
    
    return true;
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

// Styled Components
const CreditsContainer = styled.div`
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  items: center;
  height: 16rem;
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const Spinner = styled.div`
  border: 2px solid var(--primary-color);
  border-radius: 50%;
  width: 3rem;
  height: 3rem;
  border-top-color: transparent;
  animation: ${spin} 1s linear infinite;
`;

const ActionsBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const FilterContainer = styled.div`
  flex: 1;
  min-width: 250px;
`;

const StatusBadge = styled.span`
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  background-color: ${props => {
    switch (props.status) {
      case 'pagado': return 'var(--success-color)';
      case 'vencido': return 'var(--danger-color)';
      default: return 'var(--warning-color)';
    }
  }};
  color: white;
`;

const PaymentHistorySpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 10rem;
  
  div {
    border: 2px solid var(--primary-color);
    border-radius: 50%;
    width: 2rem;
    height: 2rem;
    border-top-color: transparent;
    animation: ${spin} 1s linear infinite;
  }
`;

  // Loading inicial
  if (loading && credits.length === 0) {
    return (
      <CreditsContainer>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Gestión de Créditos</h1>
        <LoadingContainer>
          <Spinner />
        </LoadingContainer>
      </CreditsContainer>
    );
  }

  return (
    <CreditsContainer>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Gestión de Créditos</h1>
      
      {error && (
        <Alert type="danger">{error}</Alert>
      )}
      
      <ActionsBar>
        <FilterContainer>
          <Label>Filtrar por estado</Label>
          <Select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">Todos los créditos</option>
            <option value="pending">Pendientes</option>
            <option value="paid">Pagados</option>
            <option value="overdue">Vencidos</option>
          </Select>
        </FilterContainer>
        
        <FilterContainer>
          <Label>Filtrar por cliente</Label>
          <Select
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
          >
            <option value="">Todos los clientes</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </Select>
        </FilterContainer>
      </ActionsBar>
      
      <Card>
        <Card.Body>
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Cliente</Table.HeaderCell>
                <Table.HeaderCell>Monto</Table.HeaderCell>
                <Table.HeaderCell>Saldo</Table.HeaderCell>
                <Table.HeaderCell>Fecha</Table.HeaderCell>
                <Table.HeaderCell>Vencimiento</Table.HeaderCell>
                <Table.HeaderCell>Estado</Table.HeaderCell>
                <Table.HeaderCell>Acciones</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {filteredCredits.length > 0 ? (
                filteredCredits.map(credit => (
                  <Table.Row key={credit.id}>
                    <Table.Cell>
                      {credit.client ? credit.client.name : 'Cliente no disponible'}
                    </Table.Cell>
                    <Table.Cell>
                      {formatCurrency(credit.amount)}
                    </Table.Cell>
                    <Table.Cell>
                      {formatCurrency(credit.balance)}
                    </Table.Cell>
                    <Table.Cell>
                      {formatDate(credit.createdAt)}
                    </Table.Cell>
                    <Table.Cell>
                      {formatDate(credit.dueDate)}
                    </Table.Cell>
                    <Table.Cell>
                      <StatusBadge status={credit.status === 'pagado' ? 'pagado' : credit.isOverdue ? 'vencido' : 'pendiente'}>
                        {credit.status === 'pagado' ? 'Pagado' : credit.isOverdue ? 'Vencido' : 'Pendiente'}
                      </StatusBadge>
                    </Table.Cell>
                    <Table.Cell>
                      <Button
                        variant="link"
                        onClick={() => openPaymentsHistoryModal(credit)}
                        style={{ marginRight: '0.5rem' }}
                      >
                        Ver pagos
                      </Button>
                      {credit.status !== 'pagado' && (
                        <Button
                          variant="link"
                          onClick={() => openPaymentModal(credit)}
                        >
                          Registrar pago
                        </Button>
                      )}
                    </Table.Cell>
                  </Table.Row>
                ))
              ) : (
                <Table.Row>
                  <Table.Cell colSpan="7" style={{ textAlign: 'center', color: 'var(--medium-gray)' }}>
                    No se encontraron créditos con los filtros seleccionados
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table>
        </Card.Body>
      </Card>
      
      {/* Modal para registrar pago */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Registrar Pago"
      >
        <form onSubmit={handleRegisterPayment}>
          {error && <Alert type="danger">{error}</Alert>}
          
          <FormGroup>
            <Label>Cliente</Label>
            <Input 
              type="text" 
              value={selectedCredit?.client ? selectedCredit.client.name : 'Cliente no disponible'} 
              disabled 
            />
          </FormGroup>
          
          <FormGroup>
            <Label>Saldo pendiente</Label>
            <Input 
              type="text" 
              value={selectedCredit ? formatCurrency(selectedCredit.balance) : ''} 
              disabled 
            />
          </FormGroup>
          
          <FormGroup>
            <Label>Monto del pago *</Label>
            <Input
              type="number"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              required
              min="1"
              max={selectedCredit?.balance}
            />
          </FormGroup>
          
          <FormGroup>
            <Label>Descripción</Label>
            <Textarea
              value={paymentDescription}
              onChange={(e) => setPaymentDescription(e.target.value)}
              rows="2"
            />
          </FormGroup>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowPaymentModal(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
            >
              {loading ? 'Procesando...' : 'Registrar Pago'}
            </Button>
          </div>
        </form>
      </Modal>
      
      {/* Modal para historial de pagos */}
      <Modal
        isOpen={showPaymentsHistoryModal}
        onClose={() => setShowPaymentsHistoryModal(false)}
        title={`Historial de Pagos - ${selectedCredit?.client ? selectedCredit.client.name : 'Cliente'}`}
        size="large"
      >
        {loading ? (
          <PaymentHistorySpinner>
            <div></div>
          </PaymentHistorySpinner>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <p style={{ fontSize: '0.875rem', color: 'var(--dark-gray)' }}>Monto total del crédito</p>
                <p style={{ fontSize: '1.125rem', fontWeight: '600' }}>{formatCurrency(selectedCredit?.amount)}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.875rem', color: 'var(--dark-gray)' }}>Saldo pendiente</p>
                <p style={{ fontSize: '1.125rem', fontWeight: '600' }}>{formatCurrency(selectedCredit?.balance)}</p>
              </div>
            </div>
            
            {payments.length > 0 ? (
              <Table>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>Fecha</Table.HeaderCell>
                    <Table.HeaderCell>Monto</Table.HeaderCell>
                    <Table.HeaderCell>Descripción</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {payments.map(payment => (
                    <Table.Row key={payment.id}>
                      <Table.Cell>
                        {formatDate(payment.createdAt)}
                      </Table.Cell>
                      <Table.Cell>
                        {formatCurrency(payment.amount)}
                      </Table.Cell>
                      <Table.Cell>
                        {payment.description || 'Sin descripción'}
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            ) : (
              <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--medium-gray)' }}>
                No hay pagos registrados para este crédito
              </div>
            )}
          </>
        )}
      </Modal>
    </CreditsContainer>
  );
};

export default Credits;