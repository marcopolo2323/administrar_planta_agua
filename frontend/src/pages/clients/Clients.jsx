import React, { useState, useEffect } from 'react';
import { useClientStore } from '../../stores/clientStore';
import styled from 'styled-components';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import { FormGroup, Label, Input, Select, ErrorMessage } from '../../components/ui/FormElements';
import Alert from '../../components/ui/Alert';

const ClientsContainer = styled.div`
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
`;

const Clients = () => {
  const { 
    clients, 
    loading, 
    error, 
    fetchClients, 
    createClient, 
    updateClient, 
    deleteClient,
    clearError 
  } = useClientStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentClient, setCurrentClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    documentType: 'DNI',
    documentNumber: '',
    address: '',
    district: '',
    phone: '',
    email: '',
    isCompany: false,
    hasCredit: false
  });
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const validateForm = () => {
    if (!formData.name) {
      setFormError('El nombre es obligatorio');
      return false;
    }
    
    if (!formData.documentNumber) {
      setFormError('El número de documento es obligatorio');
      return false;
    }
    
    // Validar DNI (8 dígitos)
    if (formData.documentType === 'DNI' && !/^\d{8}$/.test(formData.documentNumber)) {
      setFormError('El DNI debe tener 8 dígitos');
      return false;
    }
    
    // Validar RUC (11 dígitos y comienza con 10 o 20)
    if (formData.documentType === 'RUC' && (!/^\d{11}$/.test(formData.documentNumber) || !/^[12]0/.test(formData.documentNumber))) {
      setFormError('El RUC debe tener 11 dígitos y comenzar con 10 o 20');
      return false;
    }
    
    // Validar email si se proporciona
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setFormError('El correo electrónico no es válido');
      return false;
    }
    
    return true;
  };

  const handleCreateClient = async (e) => {
    e.preventDefault();
    setFormError('');
    
    if (!validateForm()) return;
    
    const result = await createClient(formData);
    if (result) {
      setShowCreateModal(false);
      resetForm();
      setSuccessMessage('Cliente creado correctamente');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const handleEditClient = async (e) => {
    e.preventDefault();
    setFormError('');
    
    if (!currentClient) return;
    if (!validateForm()) return;
    
    const result = await updateClient(currentClient.id, formData);
    if (result) {
      setShowEditModal(false);
      resetForm();
      setSuccessMessage('Cliente actualizado correctamente');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const handleDeleteClient = async () => {
    if (!currentClient) return;
    
    const result = await deleteClient(currentClient.id);
    if (result) {
      setShowDeleteModal(false);
      setCurrentClient(null);
      setSuccessMessage('Cliente eliminado correctamente');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const openEditModal = (client) => {
    setCurrentClient(client);
    setFormData({
      name: client.name,
      documentType: client.documentType,
      documentNumber: client.documentNumber,
      address: client.address || '',
      district: client.district || '',
      phone: client.phone || '',
      email: client.email || '',
      isCompany: client.isCompany,
      hasCredit: client.hasCredit
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (client) => {
    setCurrentClient(client);
    setShowDeleteModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      documentType: 'DNI',
      documentNumber: '',
      address: '',
      district: '',
      phone: '',
      email: '',
      isCompany: false,
      hasCredit: false
    });
    setFormError('');
    clearError();
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setCurrentClient(null);
    resetForm();
  };

  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.documentNumber.includes(searchTerm)
  );

  if (loading && clients.length === 0) {
    return <div>Cargando clientes...</div>;
  }

  return (
    <ClientsContainer>
      {successMessage && (
        <Alert type="success" onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      )}
      
      <Card>
        <Card.Header>
          <h3>Gestión de Clientes</h3>
        </Card.Header>
        <Card.Body>
          <ActionsBar>
            <div className="search-container">
              <Input 
                type="text" 
                placeholder="Buscar clientes..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button 
              variant="primary" 
              onClick={() => setShowCreateModal(true)}
            >
              Nuevo Cliente
            </Button>
          </ActionsBar>
          
          <Table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Documento</th>
                <th>Teléfono</th>
                <th>Distrito</th>
                <th>Tipo</th>
                <th>Crédito</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.length > 0 ? (
                filteredClients.map(client => (
                  <tr key={client.id}>
                    <td>{client.name}</td>
                    <td>{client.documentType}: {client.documentNumber}</td>
                    <td>{client.phone || '-'}</td>
                    <td>{client.district || '-'}</td>
                    <td>{client.isCompany ? 'Empresa' : 'Persona'}</td>
                    <td>{client.hasCredit ? 'Sí' : 'No'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Button 
                          variant="secondary" 
                          size="small"
                          onClick={() => openEditModal(client)}
                        >
                          Editar
                        </Button>
                        <Button 
                          variant="danger" 
                          size="small"
                          onClick={() => openDeleteModal(client)}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center' }}>
                    {searchTerm 
                      ? 'No se encontraron clientes con ese término de búsqueda' 
                      : 'No hay clientes registrados'}
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
      
      {/* Modal para crear cliente */}
      <Modal 
        isOpen={showCreateModal} 
        onClose={handleCloseModal}
        title="Crear Nuevo Cliente"
      >
        <form onSubmit={handleCreateClient}>
          {error && <Alert type="danger">{error}</Alert>}
          {formError && <Alert type="danger">{formError}</Alert>}
          
          <FormGroup>
            <Label htmlFor="name">Nombre *</Label>
            <Input 
              type="text" 
              id="name" 
              name="name" 
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="documentType">Tipo de Documento *</Label>
            <Select 
              id="documentType" 
              name="documentType" 
              value={formData.documentType}
              onChange={handleInputChange}
              required
            >
              <option value="DNI">DNI</option>
              <option value="RUC">RUC</option>
            </Select>
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="documentNumber">Número de Documento *</Label>
            <Input 
              type="text" 
              id="documentNumber" 
              name="documentNumber" 
              value={formData.documentNumber}
              onChange={handleInputChange}
              required
              maxLength={formData.documentType === 'DNI' ? 8 : 11}
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="address">Dirección</Label>
            <Input 
              type="text" 
              id="address" 
              name="address" 
              value={formData.address}
              onChange={handleInputChange}
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="district">Distrito</Label>
            <Input 
              type="text" 
              id="district" 
              name="district" 
              value={formData.district}
              onChange={handleInputChange}
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="phone">Teléfono</Label>
            <Input 
              type="text" 
              id="phone" 
              name="phone" 
              value={formData.phone}
              onChange={handleInputChange}
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input 
              type="email" 
              id="email" 
              name="email" 
              value={formData.email}
              onChange={handleInputChange}
            />
          </FormGroup>
          
          <FormGroup>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Input 
                type="checkbox" 
                id="isCompany" 
                name="isCompany" 
                checked={formData.isCompany}
                onChange={handleInputChange}
                style={{ width: 'auto' }}
              />
              <Label htmlFor="isCompany" style={{ margin: 0 }}>Es una empresa</Label>
            </div>
          </FormGroup>
          
          <FormGroup>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Input 
                type="checkbox" 
                id="hasCredit" 
                name="hasCredit" 
                checked={formData.hasCredit}
                onChange={handleInputChange}
                style={{ width: 'auto' }}
              />
              <Label htmlFor="hasCredit" style={{ margin: 0 }}>Habilitar crédito</Label>
            </div>
          </FormGroup>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleCloseModal}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              variant="primary"
            >
              Guardar Cliente
            </Button>
          </div>
        </form>
      </Modal>
      
      {/* Modal para editar cliente */}
      <Modal 
        isOpen={showEditModal} 
        onClose={handleCloseModal}
        title="Editar Cliente"
      >
        <form onSubmit={handleEditClient}>
          {error && <Alert type="danger">{error}</Alert>}
          {formError && <Alert type="danger">{formError}</Alert>}
          
          <FormGroup>
            <Label htmlFor="edit-name">Nombre *</Label>
            <Input 
              type="text" 
              id="edit-name" 
              name="name" 
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="edit-documentType">Tipo de Documento *</Label>
            <Select 
              id="edit-documentType" 
              name="documentType" 
              value={formData.documentType}
              onChange={handleInputChange}
              required
            >
              <option value="DNI">DNI</option>
              <option value="RUC">RUC</option>
            </Select>
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="edit-documentNumber">Número de Documento *</Label>
            <Input 
              type="text" 
              id="edit-documentNumber" 
              name="documentNumber" 
              value={formData.documentNumber}
              onChange={handleInputChange}
              required
              maxLength={formData.documentType === 'DNI' ? 8 : 11}
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="edit-address">Dirección</Label>
            <Input 
              type="text" 
              id="edit-address" 
              name="address" 
              value={formData.address}
              onChange={handleInputChange}
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="edit-district">Distrito</Label>
            <Input 
              type="text" 
              id="edit-district" 
              name="district" 
              value={formData.district}
              onChange={handleInputChange}
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="edit-phone">Teléfono</Label>
            <Input 
              type="text" 
              id="edit-phone" 
              name="phone" 
              value={formData.phone}
              onChange={handleInputChange}
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="edit-email">Correo Electrónico</Label>
            <Input 
              type="email" 
              id="edit-email" 
              name="email" 
              value={formData.email}
              onChange={handleInputChange}
            />
          </FormGroup>
          
          <FormGroup>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Input 
                type="checkbox" 
                id="edit-isCompany" 
                name="isCompany" 
                checked={formData.isCompany}
                onChange={handleInputChange}
                style={{ width: 'auto' }}
              />
              <Label htmlFor="edit-isCompany" style={{ margin: 0 }}>Es una empresa</Label>
            </div>
          </FormGroup>
          
          <FormGroup>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Input 
                type="checkbox" 
                id="edit-hasCredit" 
                name="hasCredit" 
                checked={formData.hasCredit}
                onChange={handleInputChange}
                style={{ width: 'auto' }}
              />
              <Label htmlFor="edit-hasCredit" style={{ margin: 0 }}>Habilitar crédito</Label>
            </div>
          </FormGroup>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleCloseModal}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              variant="primary"
            >
              Actualizar Cliente
            </Button>
          </div>
        </form>
      </Modal>
      
      {/* Modal para eliminar cliente */}
      <Modal 
        isOpen={showDeleteModal} 
        onClose={handleCloseModal}
        title="Eliminar Cliente"
      >
        {error && <Alert type="danger">{error}</Alert>}
        
        <p>¿Estás seguro de que deseas eliminar el cliente <strong>{currentClient?.name}</strong>?</p>
        <p>Esta acción no se puede deshacer.</p>
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
          <Button 
            variant="outline" 
            onClick={handleCloseModal}
          >
            Cancelar
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDeleteClient}
          >
            Eliminar
          </Button>
        </div>
      </Modal>
    </ClientsContainer>
  );
};

export default Clients;