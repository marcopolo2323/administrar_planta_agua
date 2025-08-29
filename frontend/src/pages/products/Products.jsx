import React, { useEffect } from 'react';
import { useProductStore } from '../../stores/productStore';
import styled from 'styled-components';

const ProductsContainer = styled.div`
  padding: 1.5rem;
`;

const Products = () => {
  const { products, loading, error, fetchProducts } = useProductStore();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  if (loading) {
    return <div>Cargando productos...</div>;
  }

  if (error) {
    return <div>Error al cargar productos: {error}</div>;
  }

  return (
    <ProductsContainer>
      <h1>Gestión de Productos</h1>
      <p>Esta página está en construcción. Pronto podrás gestionar tus productos aquí.</p>
      
      {products.length > 0 ? (
        <div>
          <p>Total de productos: {products.length}</p>
        </div>
      ) : (
        <p>No hay productos registrados.</p>
      )}
    </ProductsContainer>
  );
};

export default Products;