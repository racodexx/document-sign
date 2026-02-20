import styled from "styled-components";
import FileUpload from "./components/base/FileUpload";
import InfoBox from "./components/base/InfoBox";

const StyledApp = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 2rem;
`;

const AppTitle = styled.h1``;

const App = () => {
  return (
    <StyledApp>
      <AppTitle>Document Sign</AppTitle>
      <InfoBox type="info">
        This tool allows you to sign a document easily and fast.
        <br />
        Start by uploading a document, then follow the instructions to add your
        signature.
      </InfoBox>
      <FileUpload
        onFileSelect={(file) => console.log("Selected file:", file)}
      />
    </StyledApp>
  );
};

export default App;
