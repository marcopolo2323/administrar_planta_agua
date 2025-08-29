import styled, { css } from 'styled-components';

const ButtonStyles = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: ${props => props.size === 'small' ? '0.5rem 0.75rem' : props.size === 'large' ? '0.75rem 1.5rem' : '0.625rem 1.25rem'};
  font-size: ${props => props.size === 'small' ? '0.875rem' : props.size === 'large' ? '1.125rem' : '1rem'};
  font-weight: 500;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  border: none;
  outline: none;
  text-decoration: none;
  gap: 0.5rem;
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  ${props => props.$fullWidth && css`
    width: 100%;
  `}
  
  ${props => props.variant === 'primary' && css`
    background-color: var(--primary-color);
    color: white;
    
    &:hover:not(:disabled) {
      background-color: #005f92;
    }
    
    &:active:not(:disabled) {
      background-color: #004d78;
    }
  `}
  
  ${props => props.variant === 'secondary' && css`
    background-color: var(--secondary-color);
    color: white;
    
    &:hover:not(:disabled) {
      background-color: #0098b5;
    }
    
    &:active:not(:disabled) {
      background-color: #007d96;
    }
  `}
  
  ${props => props.variant === 'outline' && css`
    background-color: transparent;
    color: var(--primary-color);
    border: 1px solid var(--primary-color);
    
    &:hover:not(:disabled) {
      background-color: rgba(0, 119, 182, 0.05);
    }
    
    &:active:not(:disabled) {
      background-color: rgba(0, 119, 182, 0.1);
    }
  `}
  
  ${props => props.variant === 'text' && css`
    background-color: transparent;
    color: var(--primary-color);
    padding: ${props.size === 'small' ? '0.25rem 0.5rem' : props.size === 'large' ? '0.5rem 1rem' : '0.375rem 0.75rem'};
    
    &:hover:not(:disabled) {
      background-color: rgba(0, 119, 182, 0.05);
    }
    
    &:active:not(:disabled) {
      background-color: rgba(0, 119, 182, 0.1);
    }
  `}
  
  ${props => props.variant === 'danger' && css`
    background-color: var(--danger-color);
    color: white;
    
    &:hover:not(:disabled) {
      background-color: #bd2130;
    }
    
    &:active:not(:disabled) {
      background-color: #a71d2a;
    }
  `}
  
  ${props => props.variant === 'success' && css`
    background-color: var(--success-color);
    color: white;
    
    &:hover:not(:disabled) {
      background-color: #218838;
    }
    
    &:active:not(:disabled) {
      background-color: #1e7e34;
    }
  `}
`;

// Usar transient props con $ para evitar que se pasen al DOM
const StyledButton = styled.button`
  ${ButtonStyles}
`;

// Usar transient props con $ para evitar que se pasen al DOM
const StyledLinkButton = styled.a`
  ${ButtonStyles}
`;

const Button = ({
  children,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  disabled = false,
  href,
  onClick,
  type = 'button',
  ...props
}) => {
  // Filtrar las props personalizadas para no pasarlas al DOM
  const buttonProps = { ...props };
  
  if (href) {
    return (
      <StyledLinkButton
        href={href}
        variant={variant}
        size={size}
        $fullWidth={fullWidth}
        disabled={disabled}
        {...buttonProps}
      >
        {children}
      </StyledLinkButton>
    );
  }
  
  return (
    <StyledButton
      type={type}
      variant={variant}
      size={size}
      $fullWidth={fullWidth}
      disabled={disabled}
      onClick={onClick}
      {...buttonProps}
    >
      {children}
    </StyledButton>
  );
};

export default Button;