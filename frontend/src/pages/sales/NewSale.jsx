import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSaleStore } from '../../stores/saleStore';
import { useProductStore } from '../../stores/productStore';
import { useClientStore } from '../../stores/clientStore';
import styled from 'styled-components';

const NewSaleContainer = styled.div`
  padding: 1.5rem;
`;

const NewSale = () => {
  const navigate = useNavigate();
  const { createSale, currentSale, addItem, removeItem, updateQuantity, clearSale } = useSaleStore();
  const { products, fetchProducts } = useProductStore();
  const { clients, fetchClients } = useClientStore();
  
  useEffect(() => {
    fetchProducts();
    fetchClients();
    clearSale();
  }, [fetchProducts, fetchClients, clearSale]);

  return (
    <NewSaleContainer>
      <h1>Nueva Venta</h1>
      <p>Esta página está en construcción. Pronto podrás registrar nuevas ventas aquí.</p>
      
      <button onClick={() => navigate('/dashboard/sales')}>Volver a Ventas</button>
    </NewSaleContainer>
  );
};

export default NewSale;