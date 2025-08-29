import styled from 'styled-components';

export const FormGroup = styled.div`
  margin-bottom: 1.25rem;
`;

export const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-color);
  font-size: 0.875rem;
`;

export const Input = styled.input`
  width: 100%;
  padding: 0.625rem 0.75rem;
  border: 1px solid var(--medium-gray);
  border-radius: 4px;
  font-size: 1rem;
  transition: all 0.2s ease-in-out;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(0, 119, 182, 0.2);
  }
  
  &:disabled {
    background-color: var(--light-gray);
    cursor: not-allowed;
  }
  
  &::placeholder {
    color: var(--medium-gray);
  }
`;

export const Select = styled.select`
  width: 100%;
  padding: 0.625rem 0.75rem;
  border: 1px solid var(--medium-gray);
  border-radius: 4px;
  font-size: 1rem;
  transition: all 0.2s ease-in-out;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23495057' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 16px;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(0, 119, 182, 0.2);
  }
  
  &:disabled {
    background-color: var(--light-gray);
    cursor: not-allowed;
  }
`;

export const Textarea = styled.textarea`
  width: 100%;
  padding: 0.625rem 0.75rem;
  border: 1px solid var(--medium-gray);
  border-radius: 4px;
  font-size: 1rem;
  transition: all 0.2s ease-in-out;
  min-height: 100px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(0, 119, 182, 0.2);
  }
  
  &:disabled {
    background-color: var(--light-gray);
    cursor: not-allowed;
  }
  
  &::placeholder {
    color: var(--medium-gray);
  }
`;

export const Checkbox = styled.div`
  display: flex;
  align-items: center;
  
  input {
    margin-right: 0.5rem;
    width: 16px;
    height: 16px;
    cursor: pointer;
  }
  
  label {
    font-size: 0.875rem;
    cursor: pointer;
  }
`;

export const Radio = styled.div`
  display: flex;
  align-items: center;
  
  input {
    margin-right: 0.5rem;
    width: 16px;
    height: 16px;
    cursor: pointer;
  }
  
  label {
    font-size: 0.875rem;
    cursor: pointer;
  }
`;

export const RadioGroup = styled.div`
  display: flex;
  flex-direction: ${props => props.inline ? 'row' : 'column'};
  gap: ${props => props.inline ? '1rem' : '0.5rem'};
`;

export const ErrorMessage = styled.div`
  color: var(--danger-color);
  font-size: 0.75rem;
  margin-top: 0.25rem;
`;

export const HelperText = styled.div`
  color: var(--dark-gray);
  font-size: 0.75rem;
  margin-top: 0.25rem;
`;

export const FormActions = styled.div`
  display: flex;
  justify-content: ${props => props.align || 'flex-end'};
  gap: 1rem;
  margin-top: 1.5rem;
`;