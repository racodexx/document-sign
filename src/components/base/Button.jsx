import styled from "styled-components";

const StyledButton = styled.button``;

const Button = ({ label, onClick, type, disabled }) => {
  return (
    <StyledButton onClick={onClick} disabled={disabled}>
      {label}
    </StyledButton>
  );
};
export default Button;
