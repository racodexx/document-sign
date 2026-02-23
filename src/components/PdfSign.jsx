import { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { Document, Page, pdfjs } from "react-pdf";
import { PDFDocument } from "pdf-lib";
import { Button, InfoBox, Container } from "./base/index";

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

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

const PdfPageWrapper = styled.div`
  pointer-events: none;
  position: relative;
`;

const SignatureWrapper = styled.div`
  position: absolute;
  pointer-events: auto;
  z-index: 10;
  ${(props) => (props.$isDragging ? "opacity: 0.7;" : "")}
`;

const SignatureOverlay = styled.img`
  width: 100%;
  height: 100%;
  cursor: move;
  border: 2px dashed #4f46e5;
  user-select: none;
  display: block;
`;

const ResizeHandle = styled.div`
  position: absolute;
  width: 12px;
  height: 12px;
  background-color: #4f46e5;
  border: 2px solid white;
  border-radius: 50%;
  pointer-events: auto;
  z-index: 11;

  &.top-left {
    top: -6px;
    left: -6px;
    cursor: nwse-resize;
  }

  &.top-right {
    top: -6px;
    right: -6px;
    cursor: nesw-resize;
  }

  &.bottom-left {
    bottom: -6px;
    left: -6px;
    cursor: nesw-resize;
  }

  &.bottom-right {
    bottom: -6px;
    right: -6px;
    cursor: nwse-resize;
  }
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

const PdfSign = ({ file, signature, onReset, onBack }) => {
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [signaturePosition, setSignaturePosition] = useState({
    x: 100,
    y: 100,
  });
  const [signatureSize, setSignatureSize] = useState({
    width: 200,
    height: 80,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    posX: 0,
    posY: 0,
  });
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
    e.stopPropagation();
    setIsDragging(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleResizeMouseDown = (e, handle) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeHandle(handle);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: signatureSize.width,
      height: signatureSize.height,
      posX: signaturePosition.x,
      posY: signaturePosition.y,
    });
  };

  const handleMouseMove = (e) => {
    if (!pageRef.current) return;

    if (isDragging) {
      const pageRect = pageRef.current.getBoundingClientRect();
      const newX = e.clientX - pageRect.left - dragOffset.x;
      const newY = e.clientY - pageRect.top - dragOffset.y;

      setSignaturePosition({
        x: Math.max(0, Math.min(newX, pageRect.width - signatureSize.width)),
        y: Math.max(0, Math.min(newY, pageRect.height - signatureSize.height)),
      });
    } else if (isResizing) {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;
      const pageRect = pageRef.current.getBoundingClientRect();

      let newWidth = signatureSize.width;
      let newHeight = signatureSize.height;
      let newX = signaturePosition.x;
      let newY = signaturePosition.y;

      // Calculate new dimensions based on which handle is being dragged
      switch (resizeHandle) {
        case "top-left":
          newWidth = resizeStart.width - deltaX;
          newHeight = resizeStart.height - deltaY;
          newX = resizeStart.posX + deltaX;
          newY = resizeStart.posY + deltaY;
          break;
        case "top-right":
          newWidth = resizeStart.width + deltaX;
          newHeight = resizeStart.height - deltaY;
          newY = resizeStart.posY + deltaY;
          break;
        case "bottom-left":
          newWidth = resizeStart.width - deltaX;
          newHeight = resizeStart.height + deltaY;
          newX = resizeStart.posX + deltaX;
          break;
        case "bottom-right":
          newWidth = resizeStart.width + deltaX;
          newHeight = resizeStart.height + deltaY;
          break;
      }

      // Enforce minimum size
      newWidth = Math.max(50, newWidth);
      newHeight = Math.max(20, newHeight);

      // Ensure signature doesn't go outside page bounds
      if (newX < 0) {
        newWidth += newX;
        newX = 0;
      }
      if (newY < 0) {
        newHeight += newY;
        newY = 0;
      }
      if (newX + newWidth > pageRect.width) {
        newWidth = pageRect.width - newX;
      }
      if (newY + newHeight > pageRect.height) {
        newHeight = pageRect.height - newY;
      }

      setSignatureSize({ width: newWidth, height: newHeight });
      setSignaturePosition({ x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(numPages, prev + 1));
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
      const signatureImageBytes = await fetch(signature.dataUrl).then((res) =>
        res.arrayBuffer(),
      );
      const signatureImage = await pdfDoc.embedPng(signatureImageBytes);

      // Get page dimensions
      const { width, height } = page.getSize();

      // Calculate signature dimensions and position
      // PDF coordinates start from bottom-left, so we need to convert
      const signatureWidth = signatureSize.width;
      const signatureHeight = signatureSize.height;
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
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      // Download the signed PDF
      const downloadLink = window.document.createElement("a");
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
        Drag the signature to position it, or use the corner handles to resize
        it. Then click "Sign & Download".
      </InfoBox>

      <ViewerContainer
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {pdfUrl && (
          <PageWrapper ref={pageRef}>
            <PdfPageWrapper>
              <Document file={pdfUrl} onLoadSuccess={onDocumentLoadSuccess}>
                <Page pageNumber={currentPage} />
              </Document>
            </PdfPageWrapper>

            {signature && (
              <SignatureWrapper
                style={{
                  left: `${signaturePosition.x}px`,
                  top: `${signaturePosition.y}px`,
                  width: `${signatureSize.width}px`,
                  height: `${signatureSize.height}px`,
                }}
                $isDragging={isDragging || isResizing}
              >
                <SignatureOverlay
                  src={signature.dataUrl}
                  alt="Signature"
                  onMouseDown={handleSignatureMouseDown}
                  draggable={false}
                />
                <ResizeHandle
                  className="top-left"
                  onMouseDown={(e) => handleResizeMouseDown(e, "top-left")}
                />
                <ResizeHandle
                  className="top-right"
                  onMouseDown={(e) => handleResizeMouseDown(e, "top-right")}
                />
                <ResizeHandle
                  className="bottom-left"
                  onMouseDown={(e) => handleResizeMouseDown(e, "bottom-left")}
                />
                <ResizeHandle
                  className="bottom-right"
                  onMouseDown={(e) => handleResizeMouseDown(e, "bottom-right")}
                />
              </SignatureWrapper>
            )}
          </PageWrapper>
        )}
      </ViewerContainer>

      <ButtonGroup>
        <Controls>
          <Button
            variant="secondary"
            onClick={handlePreviousPage}
            disabled={currentPage <= 1}
          >
            Previous
          </Button>
          <PageInfo>
            Page {currentPage} of {numPages}
          </PageInfo>
          <Button
            variant="secondary"
            onClick={handleNextPage}
            disabled={currentPage >= numPages}
          >
            Next
          </Button>
        </Controls>

        <Controls>
          <Button variant="secondary" onClick={onBack}>
            Back to signature
          </Button>
          <Button variant="secondary" onClick={onReset}>
            Upload Different File
          </Button>
          <Button onClick={handleSaveSignedPdf}>Sign & Download</Button>
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
