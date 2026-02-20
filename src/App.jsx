import styled from "styled-components";
import FileUpload from "./components/base/FileUpload";

const StyledApp = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const AppTitle = styled.h1`
`;

const App = () => {
  return (
    <StyledApp>
      <AppTitle>Document Sign</AppTitle>
      <FileUpload onFileSelect={(file) => console.log("Selected file:", file)} />
    </StyledApp>
  );
};

export default App;
