import { useState } from "react";
import styled from "styled-components";
import { SignatureRegister, DocumentSign, FileUpload } from "./components";

const StyledApp = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

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
    if (!signature) {
      setStep(SignSteps.CREATE_SIGNATURE);
    } else {
      setStep(SignSteps.SIGN_DOCUMENT);
    }
  };

  const onSetSignature = (signature) => {
    setSignature(signature);
    setStep(SignSteps.SIGN_DOCUMENT);
  };

  const onReset = () => {
    setFile(null);
    setStep(SignSteps.UPLOAD_FILE);
  };

  const renderUploadFile = () =>
    !file && <FileUpload onFileSelect={onSetFile} />;
  const renderUploadedFile = () =>
    file && <SignatureRegister onSignatureSave={onSetSignature} />;
  const renderDocumentSign = () =>
    signature && (
      <DocumentSign signature={signature} document={file} onReset={onReset} />
    );

  const render = () => {
    switch (step) {
      case SignSteps.UPLOAD_FILE:
        return renderUploadFile();
      case SignSteps.CREATE_SIGNATURE:
        return renderUploadedFile();
      case SignSteps.SIGN_DOCUMENT:
        return renderDocumentSign();
      default:
        return;
    }
  };

  return <StyledApp>{render()}</StyledApp>;
};

export default App;
