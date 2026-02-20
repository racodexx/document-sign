import { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { Document, Page, pdfjs } from "react-pdf";
import { PDFDocument } from "pdf-lib";
import Button from "./base/Button";
import InfoBox from "./base/InfoBox";

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const ViewerContainer = styled.div`
  border: 2px solid #cbd5e1;
  border-radius: 8px;
  background-color: #f8fafc;
  padding: 2rem;
  position: relative;
  overflow: auto;
  max-height: 70vh;
  display: flex;
  justify-content: center;
`;

const PageWrapper = styled.div`
  position: relative;
  display: inline-block;
`;

const SignatureOverlay = styled.img`
  position: absolute;
  cursor: move;
  border: 2px dashed #4f46e5;
  user-select: none;
  ${props => props.$isDragging ? 'opacity: 0.7;' : ''}
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: space-between;
`;

const Controls = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const PageInfo = styled.span`
  color: #64748b;
  font-size: 0.875rem;
`;

const PdfSign = ({ file, signature, onReset }) => {
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [signaturePosition, setSignaturePosition] = useState({ x: 100, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [pdfUrl, setPdfUrl] = useState(null);
  const [success, setSuccess] = useState(false);
  const pageRef = useRef(null);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPdfUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const handleSignatureMouseDown = (e) => {
    setIsDragging(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !pageRef.current) return;

    const pageRect = pageRef.current.getBoundingClientRect();
    const newX = e.clientX - pageRect.left - dragOffset.x;
    const newY = e.clientY - pageRect.top - dragOffset.y;

    setSignaturePosition({
      x: Math.max(0, Math.min(newX, pageRect.width - 200)),
      y: Math.max(0, Math.min(newY, pageRect.height - 80))
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(numPages, prev + 1));
  };

  const handleSaveSignedPdf = async () => {
    if (!signature || !file) return;

    try {
      const existingPdfBytes = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      
      // Get the page where we want to add the signature
      const pages = pdfDoc.getPages();
      const page = pages[currentPage - 1];
      
      // Embed the signature image
      const signatureImageBytes = await fetch(signature.dataUrl).then(res => res.arrayBuffer());
      const signatureImage = await pdfDoc.embedPng(signatureImageBytes);
      
      // Get page dimensions
      const { width, height } = page.getSize();
      
      // Calculate signature dimensions and position
      // PDF coordinates start from bottom-left, so we need to convert
      const signatureWidth = 200;
      const signatureHeight = 80;
      const x = signaturePosition.x;
      const y = height - signaturePosition.y - signatureHeight;
      
      // Draw the signature on the PDF
      page.drawImage(signatureImage, {
        x: x,
        y: y,
        width: signatureWidth,
        height: signatureHeight,
      });
      
      // Save the PDF
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      // Download the signed PDF
      const downloadLink = window.document.createElement('a');
      downloadLink.href = url;
      downloadLink.download = `signed_${file.name}`;
      downloadLink.click();
      
      URL.revokeObjectURL(url);
      setSuccess(true);
    } catch (error) {
      console.error("Error signing PDF:", error);
      alert("Failed to sign PDF. Please try again.");
    }
  };

  if (!signature) {
    return (
      <InfoBox type="warning">
        Please create your signature first before signing documents.
      </InfoBox>
    );
  }

  return (
    <Container>
      <InfoBox type="info">
        Drag the signature to position it on the document, then click "Sign & Download".
      </InfoBox>

      <ViewerContainer
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {pdfUrl && (
          <PageWrapper ref={pageRef}>
            <Document file={pdfUrl} onLoadSuccess={onDocumentLoadSuccess}>
              <Page pageNumber={currentPage} />
            </Document>
            
            {signature && (
              <SignatureOverlay
                src={signature.dataUrl}
                alt="Signature"
                style={{
                  left: `${signaturePosition.x}px`,
                  top: `${signaturePosition.y}px`,
                  width: '200px',
                  height: '80px'
                }}
                $isDragging={isDragging}
                onMouseDown={handleSignatureMouseDown}
                draggable={false}
              />
            )}
          </PageWrapper>
        )}
      </ViewerContainer>

      <ButtonGroup>
        <Controls>
          <Button variant="secondary" onClick={handlePreviousPage} disabled={currentPage <= 1}>
            Previous
          </Button>
          <PageInfo>
            Page {currentPage} of {numPages}
          </PageInfo>
          <Button variant="secondary" onClick={handleNextPage} disabled={currentPage >= numPages}>
            Next
          </Button>
        </Controls>
        
        <Controls>
          <Button variant="secondary" onClick={onReset}>
            Upload Different File
          </Button>
          <Button onClick={handleSaveSignedPdf}>
            Sign & Download
          </Button>
        </Controls>
      </ButtonGroup>

      {success && (
        <InfoBox type="success">
          PDF signed successfully! The file has been downloaded.
        </InfoBox>
      )}
    </Container>
  );
};

export default PdfSign;
