import { useState, useEffect } from 'react';
import styled from 'styled-components';

const AlertContainer = styled.div`
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  
  ${props => {
    switch (props.type) {
      case 'success':
        return `
          background-color: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        `;
      case 'warning':
        return `
          background-color: #fff3cd;
          color: #856404;
          border: 1px solid #ffeeba;
        `;
      case 'danger':
        return `
          background-color: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        `;
      case 'info':
      default:
        return `
          background-color: #d1ecf1;
          color: #0c5460;
          border: 1px solid #bee5eb;
        `;
    }
  }}
`;

const AlertContent = styled.div`
  flex: 1;
  
  .alert-title {
    font-weight: 600;
    margin-bottom: 0.25rem;
  }
  
  .alert-message {
    font-size: 0.875rem;
  }
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: inherit;
  cursor: pointer;
  font-size: 1.25rem;
  line-height: 1;
  opacity: 0.5;
  padding: 0;
  margin-left: 1rem;
  
  &:hover {
    opacity: 0.75;
  }
`;

const Alert = ({
  type = 'info',
  title,
  message,
  dismissible = true,
  autoClose = false,
  autoCloseTime = 5000,
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(true);
  
  useEffect(() => {
    if (autoClose && isVisible) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onClose) onClose();
      }, autoCloseTime);
      
      return () => clearTimeout(timer);
    }
  }, [autoClose, autoCloseTime, isVisible, onClose]);
  
  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };
  
  if (!isVisible) return null;
  
  return (
    <AlertContainer type={type}>
      <AlertContent>
        {title && <div className="alert-title">{title}</div>}
        {message && <div className="alert-message">{message}</div>}
      </AlertContent>
      {dismissible && (
        <CloseButton onClick={handleClose}>
          &times;
        </CloseButton>
      )}
    </AlertContainer>
  );
};

export default Alert;