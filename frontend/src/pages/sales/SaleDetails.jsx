import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import { useSaleStore } from '../../stores/saleStore';

const SaleDetailsContainer = styled.div`
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const DetailsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const DetailsSection = styled.div`
  margin-bottom: 1.5rem;
`;

const DetailRow = styled.div`
  display: flex;
  margin-bottom: 0.5rem;
  
  .label {
    font-weight: 600;
    width: 150px;
  }
  
  .value {
    flex: 1;
  }
`;

const ProductsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  
  th, td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid var(--border-color);
  }
  
  th {
    background-color: var(--bg-light);
    font-weight: 600;
  }
`;

const StatusBadge = styled.span`
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
  background-color: ${props => {
    switch (props.status) {
      case 'pagado':
        return 'var(--success-color)';
      case 'pendiente':
        return 'var(--warning-color)';
      case 'anulado':
        return 'var(--danger-color)';
      default:
        return 'var(--gray-color)';
    }
  }};
  color: white;
`;

const SaleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchSaleById } = useSaleStore();
  
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [documentPath, setDocumentPath] = useState(null);

  useEffect(() => {
    const loadSale = async () => {
      try {
        setLoading(true);
        const saleData = await fetchSaleById(id);
        setSale(saleData);
        
        // Verificar si hay un documento PDF generado
        if (saleData && saleData.documentPath) {
          setDocumentPath(saleData.documentPath);
        }
      } catch (err) {
        console.error('Error al cargar la venta:', err);
        setError('No se pudo cargar la información de la venta');
      } finally {
        setLoading(false);
      }
    };
    
    loadSale();
  }, [id, fetchSaleById]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDownloadDocument = () => {
    if (documentPath) {
      // Extraer el nombre del archivo del path
      const filename = documentPath.split('\\').pop();
      // Crear un enlace para descargar el documento
      window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/documents/${filename}`, '_blank');
    }
  };

  if (loading) {
    return <div>Cargando detalles de la venta...</div>;
  }

  if (error) {
    return <Alert type="danger">{error}</Alert>;
  }

  if (!sale) {
    return <Alert type="warning">No se encontró la venta solicitada</Alert>;
  }

  return (
    <SaleDetailsContainer>
      <Card>
        <Card.Header>
          <DetailsHeader>
            <h3>Detalles de Venta #{sale.id}</h3>
            <div>
              <Button 
                variant="outline" 
                onClick={() => navigate('/dashboard/sales')}
                style={{ marginRight: '0.5rem' }}
              >
                Volver
              </Button>
              {documentPath && (
                <Button 
                  variant="primary"
                  onClick={handleDownloadDocument}
                >
                  Descargar Documento
                </Button>
              )}
            </div>
          </DetailsHeader>
        </Card.Header>
        <Card.Body>
          <DetailsSection>
            <h4>Información General</h4>
            <DetailRow>
              <div className="label">Fecha:</div>
              <div className="value">{formatDate(sale.date)}</div>
            </DetailRow>
            <DetailRow>
              <div className="label">Cliente:</div>
              <div className="value">{sale.Client?.name || 'Cliente no registrado'}</div>
            </DetailRow>
            <DetailRow>
              <div className="label">Documento:</div>
              <div className="value">{sale.invoiceType.toUpperCase()}: {sale.invoiceNumber || 'S/N'}</div>
            </DetailRow>
            <DetailRow>
              <div className="label">Estado:</div>
              <div className="value">
                <StatusBadge status={sale.status}>
                  {sale.status === 'pagado' ? 'Pagado' : 
                   sale.status === 'pendiente' ? 'Pendiente' : 'Anulado'}
                </StatusBadge>
              </div>
            </DetailRow>
            <DetailRow>
              <div className="label">Método de Pago:</div>
              <div className="value">{sale.paymentMethod || 'No especificado'}</div>
            </DetailRow>
          </DetailsSection>
          
          {sale.invoiceType === 'factura' && sale.invoiceData && (
            <DetailsSection>
              <h4>Datos de Facturación</h4>
              <DetailRow>
                <div className="label">RUC:</div>
                <div className="value">{sale.invoiceData.ruc || 'No especificado'}</div>
              </DetailRow>
              <DetailRow>
                <div className="label">Razón Social:</div>
                <div className="value">{sale.invoiceData.businessName || 'No especificado'}</div>
              </DetailRow>
              <DetailRow>
                <div className="label">Dirección:</div>
                <div className="value">{sale.invoiceData.address || 'No especificado'}</div>
              </DetailRow>
            </DetailsSection>
          )}
          
          <DetailsSection>
            <h4>Productos</h4>
            <ProductsTable>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Precio Unitario</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {sale.SaleDetails && sale.SaleDetails.map((detail, index) => (
                  <tr key={index}>
                    <td>{detail.Product?.name || 'Producto no disponible'}</td>
                    <td>{detail.quantity}</td>
                    <td>S/ {parseFloat(detail.unitPrice).toFixed(2)}</td>
                    <td>S/ {parseFloat(detail.subtotal).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="3" style={{ textAlign: 'right', fontWeight: 'bold' }}>Total:</td>
                  <td style={{ fontWeight: 'bold' }}>S/ {parseFloat(sale.total).toFixed(2)}</td>
                </tr>
              </tfoot>
            </ProductsTable>
          </DetailsSection>
        </Card.Body>
      </Card>
    </SaleDetailsContainer>
  );
};

export default SaleDetails;