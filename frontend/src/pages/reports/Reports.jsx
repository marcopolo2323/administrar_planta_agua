import React, { useState, useEffect } from 'react';
import { useReportStore } from '../../stores/reportStore';
import styled, { keyframes } from 'styled-components';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { FormGroup, Label, Input, Select } from '../../components/ui/FormElements';

const ReportsContainer = styled.div`
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const ReportSection = styled.div`
  margin-bottom: 2rem;
`;

const ReportTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--dark-color);
`;

const ReportDescription = styled.p`
  margin-bottom: 1.5rem;
  color: var(--medium-gray);
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
`;

const ReportContent = styled.div`
  margin-top: 1.5rem;
`;

const NoDataMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: var(--medium-gray);
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const Reports = () => {
  const { 
    periodReport, 
    clientReport, 
    productReport, 
    districtReport,
    loading, 
    error,
    fetchSalesByPeriod,
    fetchSalesByClient,
    fetchSalesByProduct,
    fetchSalesByDistrict,
    clearError
  } = useReportStore();

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [activeReport, setActiveReport] = useState('period');

  // Establecer fechas por defecto (último mes)
  useEffect(() => {
    const today = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    setEndDate(today.toISOString().split('T')[0]);
    setStartDate(lastMonth.toISOString().split('T')[0]);
  }, []);

  const handleGenerateReport = () => {
    if (!startDate || !endDate) {
      return;
    }

    switch (activeReport) {
      case 'period':
        fetchSalesByPeriod(startDate, endDate);
        break;
      case 'client':
        fetchSalesByClient(startDate, endDate);
        break;
      case 'product':
        fetchSalesByProduct(startDate, endDate);
        break;
      case 'district':
        fetchSalesByDistrict(startDate, endDate);
        break;
      default:
        break;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(amount);
  };

  return (
    <ReportsContainer>
      <h1>Reportes y Estadísticas</h1>
      
      <Card>
        <div style={{ padding: '1.5rem' }}>
          <FilterContainer>
            <FormGroup>
              <Label>Fecha Inicio</Label>
              <Input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)}
              />
            </FormGroup>
            
            <FormGroup>
              <Label>Fecha Fin</Label>
              <Input 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)}
              />
            </FormGroup>
            
            <FormGroup>
              <Label>Tipo de Reporte</Label>
              <Select
                value={activeReport}
                onChange={(e) => setActiveReport(e.target.value)}
              >
                <option value="period">Ventas por Período</option>
                <option value="client">Ventas por Cliente</option>
                <option value="product">Ventas por Producto</option>
                <option value="district">Ventas por Distrito</option>
              </Select>
            </FormGroup>
            
            <div style={{ alignSelf: 'flex-end' }}>
              <Button 
                variant="primary" 
                onClick={handleGenerateReport}
                disabled={loading}
              >
                {loading ? 'Generando...' : 'Generar Reporte'}
              </Button>
            </div>
          </FilterContainer>

          {error && (
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ padding: '0.75rem', backgroundColor: 'var(--danger-light)', color: 'var(--danger-color)', borderRadius: '4px' }}>
                {error}
              </div>
            </div>
          )}
          
          {activeReport === 'period' && (
            <ReportSection>
              <ReportTitle>Ventas por Período</ReportTitle>
              <ReportDescription>Resumen de ventas en el período seleccionado.</ReportDescription>
              
              {loading ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <div style={{ display: 'inline-block', width: '2rem', height: '2rem', border: '3px solid rgba(0, 0, 0, 0.1)', borderTopColor: 'var(--primary-color)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                </div>
              ) : periodReport ? (
                <ReportContent>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Resumen</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                      <div style={{ padding: '1rem', backgroundColor: 'var(--light-gray)', borderRadius: '4px' }}>
                        <div style={{ fontSize: '0.875rem', color: 'var(--medium-gray)' }}>Total Ventas</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: '600' }}>{periodReport.resumen?.totalVentas || 0}</div>
                      </div>
                      <div style={{ padding: '1rem', backgroundColor: 'var(--light-gray)', borderRadius: '4px' }}>
                        <div style={{ fontSize: '0.875rem', color: 'var(--medium-gray)' }}>Monto Total</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: '600' }}>{formatCurrency(periodReport.resumen?.montoTotal || 0)}</div>
                      </div>
                    </div>
                  </div>
                </ReportContent>
              ) : (
                <NoDataMessage>No hay datos disponibles. Genera un reporte para ver los resultados.</NoDataMessage>
              )}
            </ReportSection>
          )}
          
          {activeReport === 'client' && (
            <ReportSection>
              <ReportTitle>Ventas por Cliente</ReportTitle>
              <ReportDescription>Análisis de ventas agrupadas por cliente.</ReportDescription>
              
              {loading ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <div style={{ display: 'inline-block', width: '2rem', height: '2rem', border: '3px solid rgba(0, 0, 0, 0.1)', borderTopColor: 'var(--primary-color)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                </div>
              ) : clientReport && clientReport.length > 0 ? (
                <ReportContent>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr>
                          <th style={{ textAlign: 'left', padding: '0.75rem', borderBottom: '1px solid var(--light-gray)' }}>Cliente</th>
                          <th style={{ textAlign: 'center', padding: '0.75rem', borderBottom: '1px solid var(--light-gray)' }}>Total Ventas</th>
                          <th style={{ textAlign: 'right', padding: '0.75rem', borderBottom: '1px solid var(--light-gray)' }}>Monto Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {clientReport.map((client, index) => (
                          <tr key={index}>
                            <td style={{ padding: '0.75rem', borderBottom: '1px solid var(--light-gray)' }}>{client.clientName}</td>
                            <td style={{ textAlign: 'center', padding: '0.75rem', borderBottom: '1px solid var(--light-gray)' }}>{client.totalVentas}</td>
                            <td style={{ textAlign: 'right', padding: '0.75rem', borderBottom: '1px solid var(--light-gray)' }}>{formatCurrency(client.montoTotal)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </ReportContent>
              ) : (
                <NoDataMessage>No hay datos disponibles. Genera un reporte para ver los resultados.</NoDataMessage>
              )}
            </ReportSection>
          )}
          
          {activeReport === 'product' && (
            <ReportSection>
              <ReportTitle>Ventas por Producto</ReportTitle>
              <ReportDescription>Análisis de ventas agrupadas por producto.</ReportDescription>
              
              {loading ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <div style={{ display: 'inline-block', width: '2rem', height: '2rem', border: '3px solid rgba(0, 0, 0, 0.1)', borderTopColor: 'var(--primary-color)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                </div>
              ) : productReport && productReport.length > 0 ? (
                <ReportContent>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr>
                          <th style={{ textAlign: 'left', padding: '0.75rem', borderBottom: '1px solid var(--light-gray)' }}>Producto</th>
                          <th style={{ textAlign: 'center', padding: '0.75rem', borderBottom: '1px solid var(--light-gray)' }}>Cantidad</th>
                          <th style={{ textAlign: 'right', padding: '0.75rem', borderBottom: '1px solid var(--light-gray)' }}>Monto Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {productReport.map((product, index) => (
                          <tr key={index}>
                            <td style={{ padding: '0.75rem', borderBottom: '1px solid var(--light-gray)' }}>{product.productName}</td>
                            <td style={{ textAlign: 'center', padding: '0.75rem', borderBottom: '1px solid var(--light-gray)' }}>{product.cantidadTotal}</td>
                            <td style={{ textAlign: 'right', padding: '0.75rem', borderBottom: '1px solid var(--light-gray)' }}>{formatCurrency(product.montoTotal)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </ReportContent>
              ) : (
                <NoDataMessage>No hay datos disponibles. Genera un reporte para ver los resultados.</NoDataMessage>
              )}
            </ReportSection>
          )}
          
          {activeReport === 'district' && (
            <ReportSection>
              <ReportTitle>Ventas por Distrito</ReportTitle>
              <ReportDescription>Análisis de ventas agrupadas por distrito geográfico.</ReportDescription>
              
              {loading ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <div style={{ display: 'inline-block', width: '2rem', height: '2rem', border: '3px solid rgba(0, 0, 0, 0.1)', borderTopColor: 'var(--primary-color)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                </div>
              ) : districtReport && districtReport.length > 0 ? (
                <ReportContent>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr>
                          <th style={{ textAlign: 'left', padding: '0.75rem', borderBottom: '1px solid var(--light-gray)' }}>Distrito</th>
                          <th style={{ textAlign: 'center', padding: '0.75rem', borderBottom: '1px solid var(--light-gray)' }}>Total Ventas</th>
                          <th style={{ textAlign: 'right', padding: '0.75rem', borderBottom: '1px solid var(--light-gray)' }}>Monto Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {districtReport.map((district, index) => (
                          <tr key={index}>
                            <td style={{ padding: '0.75rem', borderBottom: '1px solid var(--light-gray)' }}>{district.distrito}</td>
                            <td style={{ textAlign: 'center', padding: '0.75rem', borderBottom: '1px solid var(--light-gray)' }}>{district.totalVentas}</td>
                            <td style={{ textAlign: 'right', padding: '0.75rem', borderBottom: '1px solid var(--light-gray)' }}>{formatCurrency(district.montoTotal)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </ReportContent>
              ) : (
                <NoDataMessage>No hay datos disponibles. Genera un reporte para ver los resultados.</NoDataMessage>
              )}
            </ReportSection>
          )}
        </div>
      </Card>
    </ReportsContainer>
  );
};

export default Reports;