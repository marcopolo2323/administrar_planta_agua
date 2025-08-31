import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from '../../utils/axios';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import { Input, Select, FormGroup, Label } from '../../components/ui/FormElements';
import styled from 'styled-components';
import { useCashRegisterStore } from '../../stores/cashRegisterStore';
import { useProductStore } from '../../stores/productStore';
import { useClientStore } from '../../stores/clientStore';

const POSContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 1.5rem;
  height: calc(100vh - 2rem);
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const ProductsSection = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const CartSection = styled.div`
  display: flex;
  flex-direction: column;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const SearchBar = styled.div`
  padding: 1rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  overflow-y: auto;
  padding: 0.5rem;
  flex: 1;
`;

const ProductCard = styled(Card)`
  cursor: pointer;
  transition: all 0.2s ease;
  height: 100%;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  .product-price {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--primary-color);
  }
  
  .product-stock {
    font-size: 0.875rem;
    color: ${props => props.stock > 0 ? 'var(--success-color)' : 'var(--danger-color)'};
  }
`;

const CartHeader = styled.div`
  padding: 1rem;
  border-bottom: 1px solid var(--light-gray);
  
  h2 {
    font-size: 1.25rem;
    margin-bottom: 0.5rem;
  }
`;

const CartItems = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
`;

const CartItem = styled.div`
  display: flex;
  padding: 0.75rem;
  border-bottom: 1px solid #E5E7EB;
  
  .item-details {
    flex: 1;
  }
  
  .item-name {
    font-weight: 500;
    margin-bottom: 0.25rem;
  }
  
  .item-price {
    font-size: 0.875rem;
    color: #6B7280;
  }
  
  .item-quantity {
    display: flex;
    align-items: center;
    margin: 0 0.5rem;
    
    button {
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #F3F4F6;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      
      &:hover {
        background-color: #E5E7EB;
      }
    }
    
    span {
      margin: 0 0.5rem;
      min-width: 24px;
      text-align: center;
    }
  }
`;

const CartFooter = styled.div`
  padding: 1rem;
  border-top: 1px solid #E5E7EB;
  
  .cart-total {
    display: flex;
    justify-content: space-between;
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 1rem;
  }
  
  .cart-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
  }
`;

const POS = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Usar los stores para gestionar el estado
  const { currentCashRegister, fetchCurrentCashRegister } = useCashRegisterStore();
  const { products, getAllProducts } = useProductStore();
  const { clients, getAllClients, createClient } = useClientStore();
  
  // Estados locales
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [showClientModal, setShowClientModal] = useState(false);
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [lastSaleId, setLastSaleId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('efectivo');
  const [cashReceived, setCashReceived] = useState(0);
  const [invoiceType, setInvoiceType] = useState('boleta');
  const [notes, setNotes] = useState('');
  const [isCredit, setIsCredit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newClient, setNewClient] = useState({
    name: '',
    document: '',
    email: '',
    phone: '',
    address: ''
  });
  
  // Productos filtrados usando useMemo
  const filteredProducts = useMemo(() => {
    if (!products || !Array.isArray(products)) return [];
    
    if (searchTerm.trim() === '') {
      return products;
    }
    
    return products.filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      product.barcode?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, products]);
  
  // Clientes filtrados usando useMemo
  const filteredClients = useMemo(() => {
    if (!clients || !Array.isArray(clients)) return [];
    
    if (clientSearchTerm.trim() === '') {
      return clients;
    }
    
    return clients.filter(client => 
      client.name.toLowerCase().includes(clientSearchTerm.toLowerCase()) || 
      client.document?.toLowerCase().includes(clientSearchTerm.toLowerCase())
    );
  }, [clientSearchTerm, clients]);
  
  // Cargar datos iniciales
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        // Verificar estado de caja
        await fetchCurrentCashRegister();
        // Cargar productos y clientes en paralelo
        await Promise.all([
          getAllProducts(),
          getAllClients()
        ]);
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar datos iniciales:', error);
        setError('Error al cargar datos iniciales. Por favor, recargue la página.');
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [location.pathname]); // <-- Se ejecuta cada vez que cambia la ruta
  
  // Verificar caja y seleccionar cliente por defecto
  useEffect(() => {
    if (!currentCashRegister || currentCashRegister.status !== 'abierto') {
      setError('No hay una caja abierta. Debe abrir caja antes de realizar ventas.');
      // Opcional: limpiar el carrito si la caja se cierra
      setCart([]);
      return;
    } else {
      setError(null);
    }
    // Cliente por defecto (cliente general)
    if (clients && clients.length > 0 && !selectedClient) {
      const defaultClient = clients.find(c => c.name === 'Cliente General' || c.document === '00000000');
      if (defaultClient) {
        setSelectedClient(defaultClient);
      }
    }
  }, [currentCashRegister, clients, selectedClient]);
  
  // Agregar producto al carrito
  const addToCart = useCallback((product) => {
    // Verificar si hay stock disponible
    if (product.stock <= 0) {
      setError(`No hay stock disponible para ${product.name}`);
      return;
    }
    
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      
      if (existingItem) {
        // Verificar si hay suficiente stock para aumentar la cantidad
        if (existingItem.quantity >= product.stock) {
          setError(`No hay suficiente stock para ${product.name}`);
          return prevCart;
        }
        
        return prevCart.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.price } 
            : item
        );
      } else {
        return [...prevCart, { 
          id: product.id, 
          name: product.name, 
          price: product.price, 
          quantity: 1, 
          subtotal: product.price,
          stock: product.stock
        }];
      }
    });
  }, []);
  
  // Eliminar producto del carrito
  const removeFromCart = useCallback((productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  }, []);
  
  // Actualizar cantidad de producto en el carrito
  const updateQuantity = useCallback((productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart(prevCart => {
      const product = prevCart.find(item => item.id === productId);
      
      // Verificar stock
      if (newQuantity > product.stock) {
        setError(`No hay suficiente stock para ${product.name}`);
        return prevCart;
      }
      
      return prevCart.map(item => 
        item.id === productId 
          ? { ...item, quantity: newQuantity, subtotal: newQuantity * item.price } 
          : item
      );
    });
  }, [removeFromCart]);
  
  // Calcular total
  const calculateTotal = useMemo(() => {
    return cart.reduce((total, item) => total + item.subtotal, 0);
  }, [cart]);
  
  // Calcular cambio
  const calculateChange = useMemo(() => {
    return cashReceived - calculateTotal;
  }, [cashReceived, calculateTotal]);
  
  // Función para limpiar el carrito
  const clearCart = useCallback(() => {
    if (window.confirm('¿Está seguro que desea vaciar el carrito?')) {
      setCart([]);
      setSelectedClient(null);
    }
  }, []);
  
  // Guardar nuevo cliente
  const handleSaveNewClient = async () => {
    try {
      // Validar campos requeridos
      if (!newClient.name || !newClient.document) {
        setError('El nombre y documento del cliente son obligatorios');
        return;
      }
      
      setLoading(true);
      
      // Crear cliente usando el store
      const createdClient = await createClient(newClient);
      
      // Seleccionar el nuevo cliente
      setSelectedClient(createdClient);
      
      // Cerrar modal y limpiar formulario
      setShowNewClientModal(false);
      setNewClient({
        name: '',
        document: '',
        email: '',
        phone: '',
        address: ''
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error al crear cliente:', error);
      setError('Error al crear el cliente. Por favor, intente nuevamente.');
      setLoading(false);
    }
  };
  
  // Procesar venta
  const processSale = async () => {
    try {
      if (cart.length === 0) {
        setError('El carrito está vacío');
        return;
      }
      
      if (!selectedClient) {
        setError('Debe seleccionar un cliente');
        return;
      }
      
      if (paymentMethod === 'efectivo' && cashReceived < calculateTotal && !isCredit) {
        setError('El monto recibido es menor al total');
        return;
      }
      
      setLoading(true);
      
      const saleData = {
        clientId: selectedClient.id,
        total: calculateTotal,
        invoiceType,
        status: isCredit ? 'pendiente' : 'pagado',
        notes,
        paymentMethod,
        products: cart.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price
        }))
      };
      
      // Crear venta
      const response = await axios.post('/api/sales', saleData);
      
      // Si es a crédito, crear el crédito
      if (isCredit) {
        await axios.post('/api/credits', {
          clientId: selectedClient.id,
          saleId: response.data.id,
          amount: calculateTotal,
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 días por defecto
        });
      }
      
      // Registrar movimiento de caja si es en efectivo
      if (paymentMethod === 'efectivo' && !isCredit) {
        await axios.post('/api/cash-register/movement', {
          type: 'ingreso',
          amount: calculateTotal,
          concept: `Venta #${response.data.id}`,
          reference: 'venta',
          referenceId: response.data.id
        });
      }
      
      // Limpiar carrito y resetear estados
      setCart([]);
      setCashReceived(0);
      setNotes('');
      setIsCredit(false);
      setShowPaymentModal(false);
      
      // Mostrar mensaje de éxito
      setLastSaleId(response.data.id);
      setSuccessMessage(`Venta #${response.data.id} procesada correctamente`);
      setShowSuccessModal(true);
      
      // Recargar productos para actualizar stock
      await getAllProducts();
      
    } catch (error) {
      console.error('Error al procesar venta:', error);
      setError('Error al procesar la venta. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };
  
  // Función para imprimir recibo
  const printReceipt = useCallback((saleId) => {
    // Abrir ventana de impresión en una nueva pestaña
    const printWindow = window.open(`/print/receipt/${saleId}`, '_blank', 'width=800,height=600');
    
    // Opcional: cerrar la ventana después de imprimir
    if (printWindow) {
      printWindow.addEventListener('afterprint', () => {
        printWindow.close();
      });
    }
  }, []);
  
  // Renderizar productos
  const renderProducts = () => {
    if (filteredProducts.length === 0) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <p>No se encontraron productos</p>
        </div>
      );
    }
    
    return (
      <ProductsGrid>
        {filteredProducts.map(product => (
          <ProductCard 
            key={product.id} 
            stock={product.stock}
            onClick={() => addToCart(product)}
          >
            <Card.Body>
              <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem', textAlign: 'center' }}>{product.name}</h3>
              <p className="product-price">S/ {(product.price !== undefined && product.price !== null && typeof product.price === 'number') ? product.price.toFixed(2) : (product.unitPrice !== undefined && product.unitPrice !== null) ? (typeof product.unitPrice === 'number' ? product.unitPrice.toFixed(2) : parseFloat(product.unitPrice).toFixed(2)) : '0.00'}</p>
              <p className="product-stock">
                Stock: {product.stock}
              </p>
              <Button 
                variant="primary" 
                style={{ marginTop: '0.5rem', width: '100%' }}
                disabled={product.stock <= 0}
              >
                Agregar
              </Button>
            </Card.Body>
          </ProductCard>
        ))}
      </ProductsGrid>
    );
  };
  
  // Renderizar carrito
  const renderCart = () => {
    if (cart.length === 0) {
      return (
        <CartItems>
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <p>El carrito está vacío</p>
          </div>
        </CartItems>
      );
    }
    
    return (
      <CartItems>
        {cart.map(item => (
          <CartItem key={item.id}>
            <div className="item-details">
              <div className="item-name">{item.name}</div>
              <div className="item-price">S/ {(item.price !== undefined && item.price !== null) ? item.price.toFixed(2) : '0.00'}</div>
            <div style={{ fontWeight: 'bold', marginTop: '0.25rem' }}>
              S/ {(item.subtotal !== undefined && item.subtotal !== null) ? item.subtotal.toFixed(2) : '0.00'}
            </div>
            </div>
            <div className="item-quantity">
              <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                -
              </button>
              <span>{item.quantity}</span>
              <button 
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                disabled={item.quantity >= item.stock}
                style={item.quantity >= item.stock ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
              >
                +
              </button>
            </div>
            <div style={{ marginLeft: '0.5rem' }}>
              <Button 
                variant="danger" 
                size="small"
                onClick={() => removeFromCart(item.id)}
              >
                ×
              </Button>
            </div>
          </CartItem>
        ))}
      </CartItems>
    );
  };
  
  // Modal de selección de cliente
  const renderClientModal = () => (
    <Modal 
      isOpen={showClientModal} 
      onClose={() => setShowClientModal(false)}
      title="Seleccionar Cliente"
    >
      <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Input
          type="text"
          placeholder="Buscar cliente por nombre o documento..."
          value={clientSearchTerm}
          onChange={(e) => setClientSearchTerm(e.target.value)}
          style={{ flexGrow: 1, marginRight: '0.5rem' }}
        />
        <Button 
          variant="primary" 
          onClick={() => {
            setShowClientModal(false);
            setShowNewClientModal(true);
          }}
        >
          Nuevo Cliente
        </Button>
      </div>
      
      <div style={{ maxHeight: '400px', overflowY: 'auto', borderRadius: '0.375rem', border: '1px solid #E5E7EB', marginBottom: '1rem' }}>
        {filteredClients.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p>No se encontraron clientes</p>
          </div>
        ) : (
          <div>
            {filteredClients.map(client => (
              <div 
                key={client.id} 
                style={{ 
                  padding: '0.75rem 1rem', 
                  borderBottom: '1px solid #E5E7EB',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onClick={() => {
                  setSelectedClient(client);
                  setShowClientModal(false);
                  setClientSearchTerm('');
                }}
              >
                <div>
                  <div style={{ fontWeight: '500' }}>{client.name}</div>
                  <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>{client.document}</div>
                </div>
                <Button
                  variant="primary"
                  size="small"
                >
                  Seleccionar
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
  
  // Modal para agregar nuevo cliente
  const renderNewClientModal = () => {
    return (
      <Modal
        isOpen={showNewClientModal}
        onClose={() => setShowNewClientModal(false)}
        title="Nuevo Cliente"
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '1rem' }}>
          <FormGroup style={{ gridColumn: '1 / -1' }}>
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              type="text"
              value={newClient.name}
              onChange={(e) => setNewClient({...newClient, name: e.target.value})}
              placeholder="Nombre completo"
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="document">Documento *</Label>
            <Input
              id="document"
              type="text"
              value={newClient.document}
              onChange={(e) => setNewClient({...newClient, document: e.target.value})}
              placeholder="RUT o documento de identidad"
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              type="text"
              value={newClient.phone}
              onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
              placeholder="+56 9 1234 5678"
            />
          </FormGroup>
          
          <FormGroup style={{ gridColumn: '1 / -1' }}>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={newClient.email}
              onChange={(e) => setNewClient({...newClient, email: e.target.value})}
              placeholder="correo@ejemplo.com"
            />
          </FormGroup>
          
          <FormGroup style={{ gridColumn: '1 / -1' }}>
            <Label htmlFor="address">Dirección</Label>
            <Input
              id="address"
              type="text"
              value={newClient.address}
              onChange={(e) => setNewClient({...newClient, address: e.target.value})}
              placeholder="Dirección completa"
            />
          </FormGroup>
          
          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
            <Button
              variant="secondary"
              onClick={() => setShowNewClientModal(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveNewClient}
              disabled={!newClient.name || !newClient.document || loading}
            >
              {loading ? 'Guardando...' : 'Guardar Cliente'}
            </Button>
          </div>
        </div>
      </Modal>
    );
  };
  
  // Modal de pago
  const renderPaymentModal = () => (
    <Modal 
      isOpen={showPaymentModal} 
      onClose={() => setShowPaymentModal(false)}
      title="Procesar Pago"
    >
      <div style={{ padding: '1rem' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: '1rem',
          backgroundColor: '#F3F4F6',
          borderRadius: '0.375rem',
          marginBottom: '1.5rem',
          fontSize: '1.25rem',
          fontWeight: 'bold'
        }}>
          <span>Total a pagar:</span>
          <span>S/ {typeof calculateTotal === 'number' ? calculateTotal.toFixed(2) : calculateTotal !== undefined && calculateTotal !== null ? parseFloat(calculateTotal).toFixed(2) : '0.00'}</span>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <FormGroup>
            <Label htmlFor="invoiceType">Tipo de Comprobante</Label>
            <Select
              id="invoiceType"
              value={invoiceType}
              onChange={(e) => setInvoiceType(e.target.value)}
            >
              <option value="boleta">Boleta</option>
              <option value="factura">Factura</option>
              <option value="vale">Vale</option>
            </Select>
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="paymentMethod">Método de Pago</Label>
            <Select
              id="paymentMethod"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="efectivo">Efectivo</option>
              <option value="tarjeta">Tarjeta</option>
              <option value="transferencia">Transferencia</option>
            </Select>
          </FormGroup>
        </div>
        
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          marginBottom: '1rem',
          padding: '0.75rem',
          backgroundColor: isCredit ? '#FEF3C7' : '#F3F4F6',
          borderRadius: '0.375rem'
        }}>
          <input
            type="checkbox"
            id="isCredit"
            checked={isCredit}
            onChange={(e) => setIsCredit(e.target.checked)}
            style={{ marginRight: '0.5rem' }}
          />
          <label htmlFor="isCredit" style={{ fontWeight: '500' }}>Venta a Crédito</label>
        </div>
        
        {paymentMethod === 'efectivo' && !isCredit && (
          <div style={{ marginTop: '1rem', padding: '1rem', border: '1px solid #E5E7EB', borderRadius: '0.375rem' }}>
            <FormGroup>
              <Label htmlFor="amountPaid">Monto Recibido</Label>
              <Input
                id="amountPaid"
                type="number"
                value={cashReceived}
                onChange={(e) => setCashReceived(parseFloat(e.target.value) || 0)}
                min={0}
                step="0.01"
              />
            </FormGroup>
            
            {cashReceived >= calculateTotal && (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                fontWeight: 'bold',
                marginTop: '0.75rem',
                padding: '0.5rem',
                backgroundColor: '#ECFDF5',
                borderRadius: '0.25rem',
                color: '#047857'
              }}>
                <span>Cambio:</span>
                <span>S/ {typeof calculateChange === 'number' && calculateChange !== null ? calculateChange.toFixed(2) : '0.00'}</span>
              </div>
            )}
          </div>
        )}
        
        <FormGroup style={{ marginTop: '1rem' }}>
          <Label htmlFor="notes">Notas (opcional)</Label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '0.5rem', 
              border: '1px solid #D1D5DB', 
              borderRadius: '0.375rem',
              minHeight: '80px'
            }}
            placeholder="Información adicional sobre la venta"
          />
        </FormGroup>
        
        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
          <Button 
            variant="secondary" 
            onClick={() => setShowPaymentModal(false)}
          >
            Cancelar
          </Button>
          <Button 
            variant="primary" 
            onClick={processSale}
            disabled={loading || (paymentMethod === 'efectivo' && cashReceived < calculateTotal && !isCredit)}
          >
            {loading ? 'Procesando...' : 'Completar Venta'}
          </Button>
        </div>
      </div>
    </Modal>
  );
  
  // Si no hay caja abierta, mostrar mensaje
  if (error && error.includes('No hay una caja abierta')) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ 
          backgroundColor: '#FEE2E2', 
          border: '1px solid #F87171', 
          color: '#B91C1C', 
          padding: '0.75rem 1rem', 
          borderRadius: '0.375rem', 
          marginBottom: '1rem'
        }}>
          <strong style={{ fontWeight: 'bold' }}>Error:</strong>
          <span> {error}</span>
        </div>
        
        <Button 
          variant="primary" 
          onClick={() => navigate('/cash-register')}
        >
          Ir a Gestión de Caja
        </Button>
      </div>
    );
  }
  
  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Cargando datos...</p>
      </div>
    );
  }
  
  return (
    <div style={{ padding: '1rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
        Punto de Venta
      </h1>
      
      {error && (
        <div style={{ 
          backgroundColor: '#FEE2E2', 
          border: '1px solid #F87171', 
          color: '#B91C1C', 
          padding: '0.75rem 1rem', 
          borderRadius: '0.375rem', 
          marginBottom: '1rem',
          position: 'relative'
        }}>
          <strong style={{ fontWeight: 'bold' }}>Error:</strong>
          <span> {error}</span>
          <span 
            style={{ 
              position: 'absolute', 
              top: 0, 
              bottom: 0, 
              right: 0, 
              padding: '0.75rem 1rem',
              cursor: 'pointer'
            }}
            onClick={() => setError(null)}
          >
            <svg style={{ fill: 'currentColor', height: '1.5rem', width: '1.5rem', color: '#EF4444' }} role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <title>Cerrar</title>
              <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
            </svg>
          </span>
        </div>
      )}
      
      <POSContainer>
        {/* Sección de productos */}
        <ProductsSection>
          <SearchBar>
            <Input
              type="text"
              placeholder="Buscar producto por nombre o código de barras..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchBar>
          
          {renderProducts()}
        </ProductsSection>
        
        {/* Sección de carrito */}
        <CartSection>
          <CartHeader>
            <h2>Carrito</h2>
            <Button 
              variant="secondary"
              onClick={() => setShowClientModal(true)}
            >
              Seleccionar Cliente
            </Button>
          </CartHeader>
          
          {selectedClient && (
            <div style={{ 
              backgroundColor: '#F3F4F6', 
              padding: '0.75rem', 
              borderRadius: '0.375rem', 
              margin: '0 1rem 1rem 1rem' 
            }}>
              <h3 style={{ fontWeight: '600', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Cliente seleccionado:</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.875rem' }}>{selectedClient.name}</span>
                <span style={{ fontSize: '0.875rem', color: '#4B5563' }}>{selectedClient.document}</span>
              </div>
            </div>
          )}
          
          {renderCart()}
          
          <CartFooter>
            <div className="cart-total">
            <span>Total:</span>
            <span>S/ {(calculateTotal !== undefined && calculateTotal !== null) ? calculateTotal.toFixed(2) : '0.00'}</span>
          </div>
            
            <div className="cart-actions">
              <Button 
                variant="secondary"
                onClick={clearCart}
                disabled={cart.length === 0}
              >
                Cancelar Venta
              </Button>
              <Button 
                variant="primary"
                onClick={() => setShowPaymentModal(true)}
                disabled={cart.length === 0}
              >
                Procesar Pago
              </Button>
            </div>
          </CartFooter>
        </CartSection>
      </POSContainer>
      
      {renderClientModal()}
      {renderNewClientModal()}
      {renderPaymentModal()}
      
      {/* Modal de éxito */}
      <Modal 
        isOpen={showSuccessModal} 
        onClose={() => setShowSuccessModal(false)}
        title="Venta Exitosa"
      >
        <div style={{ textAlign: 'center', padding: '1rem' }}>
          <div style={{ color: '#10B981', fontSize: '3rem', marginBottom: '1rem' }}>
            <svg xmlns="http://www.w3.org/2000/svg" style={{ height: '4rem', width: '4rem', margin: '0 auto' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>{successMessage}</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.75rem', marginTop: '1.5rem' }}>
            <Button 
              variant="secondary" 
              onClick={() => {
                setShowSuccessModal(false);
              }}
            >
              Continuar Vendiendo
            </Button>
            <Button 
              variant="primary" 
              onClick={() => {
                setShowSuccessModal(false);
                navigate(`/sales/${lastSaleId}`);
              }}
            >
              Ver Detalles de Venta
            </Button>
            <Button 
              variant="outline" 
              onClick={() => printReceipt(lastSaleId)}
            >
              <span style={{ display: 'flex', alignItems: 'center' }}>
                <svg xmlns="http://www.w3.org/2000/svg" style={{ height: '1.25rem', width: '1.25rem', marginRight: '0.5rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Imprimir Recibo
              </span>
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default POS;