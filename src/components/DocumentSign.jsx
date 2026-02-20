import styled from "styled-components";
import PdfSign from "./PdfSign";
import ImageSign from "./ImageSign";
import InfoBox from "./base/InfoBox";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
`;

const DocumentSign = ({ signature, document, onReset }) => {
  const fileType = document.type;
  const isPdf = fileType === "application/pdf";
  const isImage = fileType.startsWith("image/");

  return (
    <Container>
      <Title>Sign Your Document</Title>
      
      {isPdf && (
        <PdfSign 
          file={document} 
          signature={signature} 
          onReset={onReset}
        />
      )}
      
      {isImage && (
        <ImageSign 
          file={document} 
          signature={signature} 
          onReset={onReset}
        />
      )}

      {!isPdf && !isImage && (
        <InfoBox type="error">
          Unsupported file type. Please upload a PDF or image file.
        </InfoBox>
      )}
    </Container>
  );
};

export default DocumentSign;
