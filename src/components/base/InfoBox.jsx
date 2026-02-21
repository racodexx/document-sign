import styled from "styled-components";

const typeStyles = {
  success: {
    background: '#f0fdf4',
    border: '#86efac',
    text: '#166534',
    icon: '✓'
  },
  error: {
    background: '#fef2f2',
    border: '#fca5a5',
    text: '#991b1b',
    icon: '✕'
  },
  warning: {
    background: '#fffbeb',
    border: '#fcd34d',
    text: '#92400e',
    icon: '⚠'
  },
  info: {
    background: '#eff6ff',
    border: '#93c5fd',
    text: '#1e40af',
    icon: 'ℹ'
  }
};

const StyledInfoBox = styled.div`
  width: 100%;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid ${props => typeStyles[props.$type]?.border || typeStyles.info.border};
  background-color: ${props => typeStyles[props.$type]?.background || typeStyles.info.background};
  color: ${props => typeStyles[props.$type]?.text || typeStyles.info.text};
  font-size: 1rem;
  line-height: 1.5;
  margin-bottom: 1rem;
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  font-weight: bold;
  flex-shrink: 0;
`;

const Content = styled.div`
  flex: 1;
`;

// type can be 'success', 'error', 'warning', 'info'
const InfoBox = ({ type = 'info', children }) => {
  const icon = typeStyles[type]?.icon || typeStyles.info.icon;
  
  return (
    <StyledInfoBox $type={type}>
      <IconWrapper>{icon}</IconWrapper>
      <Content>{children}</Content>
    </StyledInfoBox>
  );
};
export default InfoBox;
