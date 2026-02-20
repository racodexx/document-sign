import styled from "styled-components";

const StyledButton = styled.button`
  padding: 0.625rem 1.25rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
  
  ${props => props.$variant === 'secondary' ? `
    background-color: #ffffff;
    color: #475569;
    border: 1px solid #cbd5e1;
    
    &:hover:not(:disabled) {
      background-color: #f8fafc;
      border-color: #94a3b8;
    }
  ` : `
    background-color: #4f46e5;
    color: #ffffff;
    
    &:hover:not(:disabled) {
      background-color: #4338ca;
    }
  `}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &:active:not(:disabled) {
    transform: translateY(1px);
  }
`;

const Button = ({ label, children, onClick, type, disabled, variant = 'primary' }) => {
  return (
    <StyledButton onClick={onClick} type={type} disabled={disabled} $variant={variant}>
      {children || label}
    </StyledButton>
  );
};
export default Button;
