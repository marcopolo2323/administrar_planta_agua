import React, { useEffect } from 'react';
import { useClientStore } from '../../stores/clientStore';
import styled from 'styled-components';

const ClientsContainer = styled.div`
  padding: 1.5rem;
`;

const Clients = () => {
  const { clients, loading, error, fetchClients } = useClientStore();

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  if (loading) {
    return <div>Cargando clientes...</div>;
  }

  if (error) {
    return <div>Error al cargar clientes: {error}</div>;
  }

  return (
    <ClientsContainer>
      <h1>Gestión de Clientes</h1>
      <p>Esta página está en construcción. Pronto podrás gestionar tus clientes aquí.</p>
      
      {clients.length > 0 ? (
        <div>
          <p>Total de clientes: {clients.length}</p>
        </div>
      ) : (
        <p>No hay clientes registrados.</p>
      )}
    </ClientsContainer>
  );
};

export default Clients;