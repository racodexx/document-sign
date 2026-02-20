import styled from "styled-components";

const StyledFabButton = styled.button`
  position: fixed;
  bottom: 2.5rem;
  right: 2.5rem;
  width: 5.5rem;
  height: 5.5rem;
  border-radius: 50%;
  background-color: #4f46e5;
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  &:hover {
    background-color: #4338ca;
  }
`;

const FabButton = ({ label, onClick }) => {
  return <StyledFabButton onClick={onClick}>{label}</StyledFabButton>;
};
export default FabButton;
