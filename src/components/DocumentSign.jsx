import { PdfSign, ImageSign } from "./index";
import { InfoBox, Container, Title } from "../components/base";

const DocumentSign = ({ signature, document, onReset }) => {
  const fileType = document.type;
  const isPdf = fileType === "application/pdf";
  const isImage = fileType.startsWith("image/");

  return (
    <Container id="document-sign">
      <Title>Sign Your Document</Title>

      {isPdf && (
        <PdfSign file={document} signature={signature} onReset={onReset} />
      )}

      {isImage && (
        <ImageSign file={document} signature={signature} onReset={onReset} />
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
