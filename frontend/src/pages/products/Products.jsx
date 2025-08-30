import React, { useState, useEffect } from 'react';
import { useProductStore } from '../../stores/productStore';
import styled from 'styled-components';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import { FormGroup, Label, Input, Select, Textarea, ErrorMessage } from '../../components/ui/FormElements';
import Alert from '../../components/ui/Alert';

const ProductsContainer = styled.div`
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

const Products = () => {
  const { 
    products, 
    loading, 
    error, 
    fetchProducts, 
    createProduct, 
    updateProduct, 
    deleteProduct,
    clearError 
  } = useProductStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'botella',
    unitPrice: '',
    wholesalePrice: '',
    wholesaleMinQuantity: '',
    stock: '0'
  });
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setFormError('');
    
    // Validación básica
    if (!formData.name || !formData.unitPrice) {
      setFormError('El nombre y el precio unitario son obligatorios');
      return;
    }
    
    // Convertir valores numéricos
    const productData = {
      ...formData,
      unitPrice: parseFloat(formData.unitPrice),
      wholesalePrice: formData.wholesalePrice ? parseFloat(formData.wholesalePrice) : null,
      wholesaleMinQuantity: formData.wholesaleMinQuantity ? parseInt(formData.wholesaleMinQuantity) : null,
      stock: parseInt(formData.stock)
    };
    
    const result = await createProduct(productData);
    if (result) {
      setShowCreateModal(false);
      resetForm();
      setSuccessMessage('Producto creado correctamente');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const handleEditProduct = async (e) => {
    e.preventDefault();
    setFormError('');
    
    if (!currentProduct) return;
    
    // Validación básica
    if (!formData.name || !formData.unitPrice) {
      setFormError('El nombre y el precio unitario son obligatorios');
      return;
    }
    
    // Convertir valores numéricos
    const productData = {
      ...formData,
      unitPrice: parseFloat(formData.unitPrice),
      wholesalePrice: formData.wholesalePrice ? parseFloat(formData.wholesalePrice) : null,
      wholesaleMinQuantity: formData.wholesaleMinQuantity ? parseInt(formData.wholesaleMinQuantity) : null,
      stock: parseInt(formData.stock)
    };
    
    const result = await updateProduct(currentProduct.id, productData);
    if (result) {
      setShowEditModal(false);
      resetForm();
      setSuccessMessage('Producto actualizado correctamente');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const handleDeleteProduct = async () => {
    if (!currentProduct) return;
    
    const result = await deleteProduct(currentProduct.id);
    if (result) {
      setShowDeleteModal(false);
      setCurrentProduct(null);
      setSuccessMessage('Producto eliminado correctamente');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const openEditModal = (product) => {
    setCurrentProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      type: product.type,
      unitPrice: product.unitPrice.toString(),
      wholesalePrice: product.wholesalePrice ? product.wholesalePrice.toString() : '',
      wholesaleMinQuantity: product.wholesaleMinQuantity ? product.wholesaleMinQuantity.toString() : '',
      stock: product.stock.toString()
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (product) => {
    setCurrentProduct(product);
    setShowDeleteModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: 'botella',
      unitPrice: '',
      wholesalePrice: '',
      wholesaleMinQuantity: '',
      stock: '0'
    });
    setFormError('');
    clearError();
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setCurrentProduct(null);
    resetForm();
  };

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading && products.length === 0) {
    return <div>Cargando productos...</div>;
  }

  return (
    <ProductsContainer>
      {successMessage && (
        <Alert type="success" onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      )}
      
      <Card>
        <Card.Header>
          <h3>Gestión de Productos</h3>
        </Card.Header>
        <Card.Body>
          <ActionsBar>
            <div className="search-container">
              <Input 
                type="text" 
                placeholder="Buscar productos..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button 
              variant="primary" 
              onClick={() => setShowCreateModal(true)}
            >
              Nuevo Producto
            </Button>
          </ActionsBar>
          
          <Table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>Precio Unitario</th>
                <th>Precio Mayoreo</th>
                <th>Stock</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map(product => (
                  <tr key={product.id}>
                    <td>{product.name}</td>
                    <td>{product.type === 'botella' ? 'Botella' : 'Bidón'}</td>
                    <td>S/ {typeof product.unitPrice === 'number' ? product.unitPrice.toFixed(2) : product.unitPrice !== undefined && product.unitPrice !== null ? parseFloat(product.unitPrice).toFixed(2) : '0.00'}</td>
                    <td>
                      {product.wholesalePrice 
                        ? `S/ ${typeof product.wholesalePrice === 'number' ? product.wholesalePrice.toFixed(2) : parseFloat(product.wholesalePrice).toFixed(2)} (min. ${product.wholesaleMinQuantity})` 
                        : '-'}
                    </td>
                    <td>{product.stock}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Button 
                          variant="secondary" 
                          size="small"
                          onClick={() => openEditModal(product)}
                        >
                          Editar
                        </Button>
                        <Button 
                          variant="danger" 
                          size="small"
                          onClick={() => openDeleteModal(product)}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center' }}>
                    {searchTerm 
                      ? 'No se encontraron productos con ese término de búsqueda' 
                      : 'No hay productos registrados'}
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
      
      {/* Modal para crear producto */}
      <Modal 
        isOpen={showCreateModal} 
        onClose={handleCloseModal}
        title="Crear Nuevo Producto"
      >
        <form onSubmit={handleCreateProduct}>
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
            <Label htmlFor="description">Descripción</Label>
            <Textarea 
              id="description" 
              name="description" 
              value={formData.description}
              onChange={handleInputChange}
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="type">Tipo *</Label>
            <Select 
              id="type" 
              name="type" 
              value={formData.type}
              onChange={handleInputChange}
              required
            >
              <option value="botella">Botella</option>
              <option value="bidon">Bidón</option>
            </Select>
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="unitPrice">Precio Unitario (S/) *</Label>
            <Input 
              type="number" 
              id="unitPrice" 
              name="unitPrice" 
              value={formData.unitPrice}
              onChange={handleInputChange}
              step="0.01"
              min="0"
              required
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="wholesalePrice">Precio Mayoreo (S/)</Label>
            <Input 
              type="number" 
              id="wholesalePrice" 
              name="wholesalePrice" 
              value={formData.wholesalePrice}
              onChange={handleInputChange}
              step="0.01"
              min="0"
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="wholesaleMinQuantity">Cantidad Mínima para Mayoreo</Label>
            <Input 
              type="number" 
              id="wholesaleMinQuantity" 
              name="wholesaleMinQuantity" 
              value={formData.wholesaleMinQuantity}
              onChange={handleInputChange}
              min="0"
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="stock">Stock Inicial</Label>
            <Input 
              type="number" 
              id="stock" 
              name="stock" 
              value={formData.stock}
              onChange={handleInputChange}
              min="0"
            />
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
              Guardar Producto
            </Button>
          </div>
        </form>
      </Modal>
      
      {/* Modal para editar producto */}
      <Modal 
        isOpen={showEditModal} 
        onClose={handleCloseModal}
        title="Editar Producto"
      >
        <form onSubmit={handleEditProduct}>
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
            <Label htmlFor="edit-description">Descripción</Label>
            <Textarea 
              id="edit-description" 
              name="description" 
              value={formData.description}
              onChange={handleInputChange}
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="edit-type">Tipo *</Label>
            <Select 
              id="edit-type" 
              name="type" 
              value={formData.type}
              onChange={handleInputChange}
              required
            >
              <option value="botella">Botella</option>
              <option value="bidon">Bidón</option>
            </Select>
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="edit-unitPrice">Precio Unitario (S/) *</Label>
            <Input 
              type="number" 
              id="edit-unitPrice" 
              name="unitPrice" 
              value={formData.unitPrice}
              onChange={handleInputChange}
              step="0.01"
              min="0"
              required
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="edit-wholesalePrice">Precio Mayoreo (S/)</Label>
            <Input 
              type="number" 
              id="edit-wholesalePrice" 
              name="wholesalePrice" 
              value={formData.wholesalePrice}
              onChange={handleInputChange}
              step="0.01"
              min="0"
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="edit-wholesaleMinQuantity">Cantidad Mínima para Mayoreo</Label>
            <Input 
              type="number" 
              id="edit-wholesaleMinQuantity" 
              name="wholesaleMinQuantity" 
              value={formData.wholesaleMinQuantity}
              onChange={handleInputChange}
              min="0"
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="edit-stock">Stock</Label>
            <Input 
              type="number" 
              id="edit-stock" 
              name="stock" 
              value={formData.stock}
              onChange={handleInputChange}
              min="0"
            />
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
              Actualizar Producto
            </Button>
          </div>
        </form>
      </Modal>
      
      {/* Modal para eliminar producto */}
      <Modal 
        isOpen={showDeleteModal} 
        onClose={handleCloseModal}
        title="Eliminar Producto"
      >
        {error && <Alert type="danger">{error}</Alert>}
        
        <p>¿Estás seguro de que deseas eliminar el producto <strong>{currentProduct?.name}</strong>?</p>
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
            onClick={handleDeleteProduct}
          >
            Eliminar
          </Button>
        </div>
      </Modal>
    </ProductsContainer>
  );
};

export default Products;