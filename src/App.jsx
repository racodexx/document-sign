import { useState } from "react";
import styled from "styled-components";
import FileUpload from "./components/FileUpload";
import InfoBox from "./components/base/InfoBox";
import SignatureRegister from "./components/SignatureRegister";
import DocumentSign from "./components/DocumentSign";

const StyledApp = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 2rem;
`;

const AppTitle = styled.h1``;

const SignSteps = {
  UPLOAD_FILE: 1,
  CREATE_SIGNATURE: 2,
  SIGN_DOCUMENT: 3,
};

const App = () => {
  const [step, setStep] = useState(SignSteps.UPLOAD_FILE);
  const [file, setFile] = useState(null);
  const [signature, setSignature] = useState(null);

  const onSetFile = (file) => {
    setFile(file);
    setStep(SignSteps.CREATE_SIGNATURE);
  };

  const onSetSignature = (signature) => {
    setSignature(signature);
    setStep(SignSteps.SIGN_DOCUMENT);
  };

  const renderUploadFile = () => {
    if (file) {
      return <></>;
    }
    return (
      <>
        <InfoBox type="info">
          This tool allows you to sign a document easily and fast.
          <br />
          Start by uploading a document, then follow the instructions to add
          your signature.
        </InfoBox>
        <FileUpload onFileSelect={onSetFile} />
      </>
    );
  };

  const renderUploadedFile = () => {
    if (!file) {
      return <></>;
    }
    return (
      <>
        <SignatureRegister onSignatureSave={onSetSignature} />
      </>
    );
  };

  const renderDocumentSign = () => {
    if (!signature) {
      return <></>;
    }
    return (
      <DocumentSign
        signature={signature}
        document={file}
        onReset={() => setStep(SignSteps.UPLOAD_FILE)}
      />
    );
  };

  const render = () => {
    switch (step) {
      case SignSteps.UPLOAD_FILE:
        return renderUploadFile();
      case SignSteps.CREATE_SIGNATURE:
        return renderUploadedFile();
      case SignSteps.SIGN_DOCUMENT:
        return renderDocumentSign();
      default:
        return <></>;
    }
  };

  return (
    <StyledApp>
      <AppTitle>Document Sign</AppTitle>
      {render()}
    </StyledApp>
  );
};

export default App;
