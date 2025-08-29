import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSaleStore } from '../../stores/saleStore';
import styled from 'styled-components';

const SalesContainer = styled.div`
  padding: 1.5rem;
`;

const NewSaleButton = styled(Link)`
  display: inline-block;
  background-color: var(--primary-color);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  text-decoration: none;
  margin-bottom: 1rem;
  
  &:hover {
    background-color: var(--primary-dark);
  }
`;

const Sales = () => {
  const { sales, loading, error, fetchSales } = useSaleStore();

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  if (loading) {
    return <div>Cargando ventas...</div>;
  }

  if (error) {
    return <div>Error al cargar ventas: {error}</div>;
  }

  return (
    <SalesContainer>
      <h1>Gestión de Ventas</h1>
      <NewSaleButton to="/dashboard/sales/new">Nueva Venta</NewSaleButton>
      
      <p>Esta página está en construcción. Pronto podrás ver el historial de ventas aquí.</p>
      
      {sales.length > 0 ? (
        <div>
          <p>Total de ventas: {sales.length}</p>
        </div>
      ) : (
        <p>No hay ventas registradas.</p>
      )}
    </SalesContainer>
  );
};

export default Sales;