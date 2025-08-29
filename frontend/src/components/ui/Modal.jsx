import { useEffect, useRef } from 'react';
import styled from 'styled-components';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

const ModalContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: ${props => props.size === 'small' ? '400px' : props.size === 'large' ? '800px' : '600px'};
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const ModalHeader = styled.div`
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--light-gray);
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  h3 {
    margin: 0;
    font-size: 1.25rem;
    color: var(--text-color);
  }
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  font-size: 1.5rem;
  line-height: 1;
  color: var(--dark-gray);
  cursor: pointer;
  padding: 0;
  margin-left: 1rem;
  
  &:hover {
    color: var(--text-color);
  }
`;

const ModalBody = styled.div`
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
`;

const ModalFooter = styled.div`
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--light-gray);
  display: flex;
  align-items: center;
  justify-content: ${props => props.align || 'flex-end'};
  gap: 1rem;
`;

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'medium',
  closeOnOverlayClick = true,
  footer,
  footerAlign = 'flex-end'
}) => {
  const modalRef = useRef(null);
  
  // Manejar el cierre con la tecla Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);
  
  // Evitar que los clics dentro del modal cierren el modal
  const handleModalClick = (e) => {
    e.stopPropagation();
  };
  
  if (!isOpen) return null;
  
  return (
    <ModalOverlay onClick={closeOnOverlayClick ? onClose : undefined}>
      <ModalContainer 
        ref={modalRef} 
        onClick={handleModalClick}
        size={size}
      >
        <ModalHeader>
          <h3>{title}</h3>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </ModalHeader>
        
        <ModalBody>{children}</ModalBody>
        
        {footer && (
          <ModalFooter align={footerAlign}>
            {footer}
          </ModalFooter>
        )}
      </ModalContainer>
    </ModalOverlay>
  );
};

export default Modal;