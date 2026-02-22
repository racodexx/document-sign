import styled from "styled-components";


const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
`;

const Title = styled.h1`
  font-weight: 600;
  color: #1e293b;
  margin: 0;
`;

const SubTitle = styled.h3`
  font-weight: 600;
  color: #313946;
  margin: 0;
`;

export { Container, Title, SubTitle };