import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext.jsx';
import webSocketService from '../../services/WebSocketService';
import styled from 'styled-components';

const TrackingContainer = styled.div`
  max-width: 100vw;
  width: 100%;
  margin: 0 auto;
  padding: 1rem 0.5rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  @media (min-width: 600px) {
    max-width: 800px;
    padding: 2rem;
  }
`;

const OrderHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  justify-content: flex-start;
  align-items: flex-start;
  margin-bottom: 2rem;
  h1 {
    font-size: 1.2rem;
    margin: 0;
    @media (min-width: 600px) {
      font-size: 1.5rem;
    }
  }
  .order-id {
    color: #666;
    font-size: 0.85rem;
    @media (min-width: 600px) {
      font-size: 0.9rem;
    }
  }
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 500;
  font-size: 0.9rem;
  text-transform: uppercase;
  background-color: ${props => {
    switch (props.status) {
      case 'pendiente': return '#FFF3CD';
      case 'confirmado': return '#D1ECF1';
      case 'en_preparacion': return '#D4EDDA';
      case 'en_camino': return '#CCE5FF';
      case 'entregado': return '#C3E6CB';
      case 'cancelado': return '#F8D7DA';
      default: return '#E2E3E5';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'pendiente': return '#856404';
      case 'confirmado': return '#0C5460';
      case 'en_preparacion': return '#155724';
      case 'en_camino': return '#004085';
      case 'entregado': return '#155724';
      case 'cancelado': return '#721C24';
      default: return '#383D41';
    }
  }};
`;

const TrackingSteps = styled.div`
  margin: 2rem 0;
`;

const StepItem = styled.div`
  display: flex;
  margin-bottom: 1.5rem;
  position: relative;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  &:not(:last-child):after {
    content: '';
    position: absolute;
    left: 15px;
    top: 30px;
    bottom: -15px;
    width: 2px;
    background-color: ${props => props.completed ? '#28a745' : '#e9ecef'};
  }
`;

const StepIcon = styled.div`
  width: 28px;
  height: 28px;
  font-size: 1rem;
  @media (min-width: 600px) {
    width: 32px;
    height: 32px;
    font-size: 1.2rem;
  }
  border-radius: 50%;
  background-color: ${props => props.completed ? '#28a745' : '#e9ecef'};
  color: ${props => props.completed ? 'white' : '#6c757d'};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  flex-shrink: 0;
`;

const StepContent = styled.div`
  flex: 1;
  h3 {
    margin: 0 0 0.25rem;
    font-size: 0.95rem;
    color: ${props => props.completed ? '#212529' : '#6c757d'};
    @media (min-width: 600px) {
      font-size: 1rem;
    }
  }
  p {
    margin: 0;
    font-size: 0.85rem;
    color: #6c757d;
    @media (min-width: 600px) {
      font-size: 0.9rem;
    }
  }
  .step-time {
    font-size: 0.75rem;
    color: #adb5bd;
    @media (min-width: 600px) {
      font-size: 0.8rem;
    }
  }
`;

const OrderDetails = styled.div`
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e9ecef;
`;

const DetailSection = styled.div`
  margin-bottom: 1.5rem;
  
  h3 {
    font-size: 1.1rem;
    margin: 0 0 1rem;
    color: #495057;
  }
`;

const ProductList = styled.div`
  margin-bottom: 1.5rem;
`;

const ProductItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  justify-content: flex-start;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e9ecef;
  @media (min-width: 600px) {
    flex-direction: row;
    justify-content: space-between;
    gap: 0;
    padding: 0.75rem 0;
  }
  &:last-child {
    border-bottom: none;
  }
  .product-info {
    display: flex;
    align-items: center;
    .quantity {
      background-color: #e9ecef;
      color: #495057;
      padding: 0.2rem 0.4rem;
      border-radius: 4px;
      margin-right: 0.5rem;
      font-size: 0.85rem;
      @media (min-width: 600px) {
        font-size: 0.9rem;
        margin-right: 0.75rem;
      }
    }
    .name {
      font-weight: 500;
    }
  }
  .price {
    font-weight: 500;
    font-size: 0.95rem;
    @media (min-width: 600px) {
      font-size: 1rem;
    }
  }
`;

const TotalSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  justify-content: flex-start;
  font-weight: bold;
  font-size: 1rem;
  padding-top: 0.5rem;
  border-top: 1px solid #e9ecef;
  @media (min-width: 600px) {
    flex-direction: row;
    justify-content: space-between;
    font-size: 1.1rem;
    gap: 0;
    padding-top: 1rem;
  }
`;

const DeliveryInfo = styled.div`
  display: flex;
  margin-top: 1.5rem;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  
  .delivery-person {
    flex: 1;
    
    h4 {
      margin: 0 0 0.5rem;
      font-size: 1rem;
    }
    
    p {
      margin: 0;
      font-size: 0.9rem;
      color: #6c757d;
    }
  }
  
  .delivery-contact {
    display: flex;
    flex-direction: column;
    justify-content: center;
    
    a {
      display: inline-block;
      padding: 0.5rem 1rem;
      background-color: #28a745;
      color: white;
      text-decoration: none;
      border-radius: 4px;
      font-weight: 500;
      margin-bottom: 0.5rem;
      text-align: center;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      &:hover {
        background-color: #218838;
      }
    }
  }
`;

const MapContainer = styled.div`
  height: 300px;
  background-color: #e9ecef;
  border-radius: 8px;
  margin-top: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6c757d;
`;

const OrderTracking = () => {
  const { orderId } = useParams();
  const { auth } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Definir los pasos del seguimiento
  const trackingSteps = [
    { id: 'pendiente', label: 'Pedido Recibido', description: 'Tu pedido ha sido recibido y está pendiente de confirmación.' },
    { id: 'confirmado', label: 'Pedido Confirmado', description: 'Tu pedido ha sido confirmado y está siendo procesado.' },
    { id: 'en_preparacion', label: 'En Preparación', description: 'Tu pedido está siendo preparado.' },
    { id: 'en_camino', label: 'En Camino', description: 'Tu pedido está en camino a tu dirección.' },
    { id: 'entregado', label: 'Entregado', description: 'Tu pedido ha sido entregado con éxito.' }
  ];
  
  // Función para determinar si un paso está completado
  const isStepCompleted = (stepId) => {
    if (!order) return false;
    
    const statusIndex = trackingSteps.findIndex(step => step.id === order.status);
    const stepIndex = trackingSteps.findIndex(step => step.id === stepId);
    
    return stepIndex <= statusIndex;
  };
  
  // Función para formatear la fecha
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  // Función para manejar actualizaciones en tiempo real
  const handleRealTimeUpdate = (notification) => {
    if (notification.orderId === orderId && notification.type === 'order_status') {
      // Actualizar el pedido con la nueva información
      fetchOrderDetails();
    }
  };
  
  // Función para obtener los detalles del pedido
  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      setOrder(response.data);
      setError(null);
    } catch (err) {
      console.error('Error al obtener detalles del pedido:', err);
      setError('No se pudo cargar la información del pedido. Por favor, intenta de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    // Obtener detalles del pedido
    fetchOrderDetails();
    
    // Configurar WebSocket para actualizaciones en tiempo real
    if (auth.token) {
      webSocketService.connect(auth.token);
      
      // Registrar listener para notificaciones en tiempo real
      const removeListener = webSocketService.addNotificationListener(
        'orderTracking', 
        handleRealTimeUpdate
      );
      
      return () => {
        removeListener(); // Eliminar listener al desmontar
      };
    }
  }, [orderId, auth.token]);
  
  if (loading) {
    return (
      <TrackingContainer>
        <div className="loading">Cargando información del pedido...</div>
      </TrackingContainer>
    );
  }
  
  if (error) {
    return (
      <TrackingContainer>
        <div className="error">{error}</div>
      </TrackingContainer>
    );
  }
  
  if (!order) {
    return (
      <TrackingContainer>
        <div className="error">No se encontró el pedido.</div>
      </TrackingContainer>
    );
  }
  
  return (
    <TrackingContainer>
      <OrderHeader>
        <div>
          <h1>Seguimiento de Pedido</h1>
          <div className="order-id">Pedido #{order._id.substring(order._id.length - 6)}</div>
        </div>
        <StatusBadge status={order.status}>
          {order.status === 'pendiente' && 'Pendiente'}
          {order.status === 'confirmado' && 'Confirmado'}
          {order.status === 'en_preparacion' && 'En Preparación'}
          {order.status === 'en_camino' && 'En Camino'}
          {order.status === 'entregado' && 'Entregado'}
          {order.status === 'cancelado' && 'Cancelado'}
        </StatusBadge>
      </OrderHeader>
      
      <TrackingSteps>
        {trackingSteps.map((step) => (
          <StepItem key={step.id} completed={isStepCompleted(step.id)}>
            <StepIcon completed={isStepCompleted(step.id)}>
              {isStepCompleted(step.id) ? '✓' : ''}
            </StepIcon>
            <StepContent completed={isStepCompleted(step.id)}>
              <h3>{step.label}</h3>
              <p>{step.description}</p>
              {step.id === order.status && (
                <div className="step-time">
                  {formatDate(order.updatedAt)}
                </div>
              )}
            </StepContent>
          </StepItem>
        ))}
      </TrackingSteps>
      
      {order.status === 'en_camino' && order.deliveryPerson && (
        <DeliveryInfo>
          <div className="delivery-person">
            <h4>Repartidor</h4>
            <p>{order.deliveryPerson.name}</p>
            <p>Teléfono: {order.deliveryPerson.phone}</p>
          </div>
          <div className="delivery-contact">
            <a href={`tel:${order.deliveryPerson.phone}`}>Llamar</a>
            <a href={`sms:${order.deliveryPerson.phone}`}>Enviar SMS</a>
          </div>
        </DeliveryInfo>
      )}
      
      {order.status === 'en_camino' && (
        <MapContainer>
          Mapa de seguimiento en tiempo real (Simulado)
        </MapContainer>
      )}
      
      <OrderDetails>
        <DetailSection>
          <h3>Detalles del Pedido</h3>
          <ProductList>
            {order.orderDetails.map((item, index) => (
              <ProductItem key={index}>
                <div className="product-info">
                  <span className="quantity">{item.quantity}</span>
                  <span className="name">{item.product.name}</span>
                </div>
                <div className="price">${item.price.toFixed(2)}</div>
              </ProductItem>
            ))}
          </ProductList>
          <TotalSection>
            <span>Total</span>
            <span>${order.total.toFixed(2)}</span>
          </TotalSection>
        </DetailSection>
        
        <DetailSection>
          <h3>Información de Entrega</h3>
          <p><strong>Dirección:</strong> {order.shippingAddress}</p>
          <p><strong>Fecha de Pedido:</strong> {formatDate(order.createdAt)}</p>
          <p><strong>Método de Pago:</strong> {order.payment?.method || 'No especificado'}</p>
          <p><strong>Estado del Pago:</strong> {order.payment?.status || 'No especificado'}</p>
        </DetailSection>
      </OrderDetails>
    </TrackingContainer>
  );
};

export default OrderTracking;