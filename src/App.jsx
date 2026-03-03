import { useState } from "react";
import styled from "styled-components";
import {
  SignatureRegister,
  DocumentSign,
  FileUpload,
  LanguageSelector,
} from "./components";
import TradeMark from "./components/TradeMark";
import InstallPrompt from "./components/InstallPrompt";
import "./i18n/config";

const StyledApp = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 16px 40px;
  box-sizing: border-box;
  width: 100%;
  overflow-x: hidden;
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
  const [signingOtherDocument, setSigningOtherDocument] = useState(false);

  const onSetFile = (file) => {
    setFile(file);
    if (signingOtherDocument) {
      setSigningOtherDocument(false);
      setStep(SignSteps.SIGN_DOCUMENT);
    } else {
      setStep(SignSteps.CREATE_SIGNATURE);
    }
  };

  const onSetSignature = (signature) => {
    setSignature(signature);
    setStep(SignSteps.SIGN_DOCUMENT);
  };

  const onResetFile = () => {
    setFile(null);
    setSigningOtherDocument(true);
    setStep(SignSteps.UPLOAD_FILE);
  };

  const onBack = () => {
    if (step === SignSteps.SIGN_DOCUMENT) {
      setStep(SignSteps.CREATE_SIGNATURE);
    } else if (step === SignSteps.CREATE_SIGNATURE) {
      setFile(null);
      setStep(SignSteps.UPLOAD_FILE);
    }
  };

  const render = () => {
    switch (step) {
      case SignSteps.UPLOAD_FILE:
        return <FileUpload onFileSelect={onSetFile} />;
      case SignSteps.CREATE_SIGNATURE:
        return (
          <SignatureRegister
            signature={signature}
            onSignatureSave={onSetSignature}
            onBack={onBack}
          />
        );
      case SignSteps.SIGN_DOCUMENT:
        return (
          <DocumentSign
            signature={signature}
            document={file}
            onReset={onResetFile}
            onBack={onBack}
          />
        );
      default:
        return;
    }
  };

  return (
    <StyledApp id="main-view">
      <LanguageSelector />
      <InstallPrompt />
      {step === SignSteps.UPLOAD_FILE && <TradeMark />}
      {render()}
    </StyledApp>
  );
};

export default App;
