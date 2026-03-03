import styled from "styled-components";

const typeStyles = {
  success: {
    background: '#f0fdf4',
    border: '#86efac',
    text: '#166534',
  },
  error: {
    background: '#fef2f2',
    border: '#fca5a5',
    text: '#991b1b',
  },
  warning: {
    background: '#fffbeb',
    border: '#fcd34d',
    text: '#92400e',
  },
  info: {
    background: '#eff6ff',
    border: '#93c5fd',
    text: '#1e40af',
  }
};

const StyledInfoBox = styled.div`
  display: flex;
  align-items: center;
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

const Content = styled.div``;

// type can be 'success', 'error', 'warning', 'info'
const InfoBox = ({ type = 'info', children }) => {
  return (
    <StyledInfoBox $type={type}>
      <Content>{children}</Content>
    </StyledInfoBox>
  );
};
export default InfoBox;
