import React, { useState } from 'react';
import { useReportStore } from '../../stores/reportStore';
import styled from 'styled-components';

const ReportsContainer = styled.div`
  padding: 1.5rem;
`;

const ReportSection = styled.div`
  margin-bottom: 2rem;
`;

const Reports = () => {
  const { 
    salesByPeriod, 
    salesByClient, 
    salesByProduct, 
    salesByDistrict,
    loading, 
    error,
    fetchSalesByPeriod,
    fetchSalesByClient,
    fetchSalesByProduct,
    fetchSalesByDistrict
  } = useReportStore();

  return (
    <ReportsContainer>
      <h1>Reportes y Estadísticas</h1>
      <p>Esta página está en construcción. Pronto podrás ver reportes detallados aquí.</p>
      
      <ReportSection>
        <h2>Ventas por Período</h2>
        <p>Selecciona un rango de fechas para ver las ventas en ese período.</p>
      </ReportSection>
      
      <ReportSection>
        <h2>Ventas por Cliente</h2>
        <p>Selecciona un cliente para ver sus compras.</p>
      </ReportSection>
      
      <ReportSection>
        <h2>Ventas por Producto</h2>
        <p>Selecciona un producto para ver su historial de ventas.</p>
      </ReportSection>
      
      <ReportSection>
        <h2>Ventas por Distrito</h2>
        <p>Visualiza las ventas por distrito geográfico.</p>
      </ReportSection>
    </ReportsContainer>
  );
};

export default Reports;