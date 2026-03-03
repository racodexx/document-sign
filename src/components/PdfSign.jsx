import { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { Document, Page, pdfjs } from "react-pdf";
import { PDFDocument } from "pdf-lib";
import { Button, InfoBox, Container } from "./base/index";
import useIsMobile from "../hooks/useIsMobile";

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const ViewerContainer = styled.div`
  border: 2px solid #cbd5e1;
  border-radius: 8px;
  background-color: #f8fafc;
  padding: 2rem;
  position: relative;
  display: flex;
  justify-content: center;
  overflow: auto;
  -webkit-overflow-scrolling: touch;

  @media (max-width: 640px) {
    padding: 1rem 0.5rem;
  }
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
  touch-action: none;
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
  gap: 0.75rem;
  justify-content: space-between;
  flex-wrap: wrap;

  @media (max-width: 640px) {
    justify-content: center;
  }
`;

const Controls = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
`;

const PageInfo = styled.span`
  color: #64748b;
  font-size: 0.875rem;
`;

const ZoomBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

const ZoomLabel = styled.span`
  font-size: 0.875rem;
  color: #64748b;
  min-width: 3.5rem;
  text-align: center;
`;

const ZOOM_STEP = 0.25;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;

const PdfSign = ({ file, signature, onReset, onBack }) => {
  const { t } = useTranslation();
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
  const [zoom, setZoom] = useState(1);
  const [pageWidth, setPageWidth] = useState(null);
  const pageRef = useRef(null);
  const viewerRef = useRef(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPdfUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  // Measure viewer container to compute fit-to-width page size
  useEffect(() => {
    if (!viewerRef.current) return;
    const measure = () => {
      const el = viewerRef.current;
      const style = window.getComputedStyle(el);
      const paddingH = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
      setPageWidth(Math.max(200, el.clientWidth - paddingH));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(viewerRef.current);
    return () => ro.disconnect();
  }, []);

  const zoomIn = () => setZoom((z) => Math.min(MAX_ZOOM, parseFloat((z + ZOOM_STEP).toFixed(2))));
  const zoomOut = () => setZoom((z) => Math.max(MIN_ZOOM, parseFloat((z - ZOOM_STEP).toFixed(2))));
  const resetZoom = () => setZoom(1);

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

  const handleSignatureTouchStart = (e) => {
    e.stopPropagation();
    const touch = e.touches[0];
    setIsDragging(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
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

  const handleResizeTouchStart = (e, handle) => {
    e.stopPropagation();
    const touch = e.touches[0];
    setIsResizing(true);
    setResizeHandle(handle);
    setResizeStart({
      x: touch.clientX,
      y: touch.clientY,
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

  const handleTouchMove = (e) => {
    if (!isDragging && !isResizing) return;
    e.preventDefault();
    const touch = e.touches[0];
    handleMouseMove({ clientX: touch.clientX, clientY: touch.clientY });
  };

  const handleTouchEnd = () => {
    handleMouseUp();
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
      const { width: pdfW, height: pdfH } = page.getSize();

      // Scale screen-pixel coords back to PDF point space
      const renderedW = pageRef.current ? pageRef.current.offsetWidth : pdfW;
      const renderedH = pageRef.current ? pageRef.current.offsetHeight : pdfH;
      const scaleX = pdfW / renderedW;
      const scaleY = pdfH / renderedH;

      const sigX = signaturePosition.x * scaleX;
      const sigW = signatureSize.width * scaleX;
      const sigH = signatureSize.height * scaleY;
      // PDF Y-axis is bottom-up
      const sigY = pdfH - signaturePosition.y * scaleY - sigH;

      // Draw the signature on the PDF
      page.drawImage(signatureImage, {
        x: sigX,
        y: sigY,
        width: sigW,
        height: sigH,
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
        {t('documentSign.errors.noSignature')}
      </InfoBox>
    );
  }

  return (
    <Container>
      <InfoBox type="info">
        {t('documentSign.instructions')}
      </InfoBox>

      <ViewerContainer
        ref={viewerRef}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {pdfUrl && pageWidth && (
          <PageWrapper ref={pageRef}>
            <PdfPageWrapper>
              <Document file={pdfUrl} onLoadSuccess={onDocumentLoadSuccess}>
                <Page pageNumber={currentPage} width={pageWidth * zoom} />
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
                  onTouchStart={handleSignatureTouchStart}
                  draggable={false}
                />
                <ResizeHandle
                  className="top-left"
                  onMouseDown={(e) => handleResizeMouseDown(e, "top-left")}
                  onTouchStart={(e) => handleResizeTouchStart(e, "top-left")}
                />
                <ResizeHandle
                  className="top-right"
                  onMouseDown={(e) => handleResizeMouseDown(e, "top-right")}
                  onTouchStart={(e) => handleResizeTouchStart(e, "top-right")}
                />
                <ResizeHandle
                  className="bottom-left"
                  onMouseDown={(e) => handleResizeMouseDown(e, "bottom-left")}
                  onTouchStart={(e) => handleResizeTouchStart(e, "bottom-left")}
                />
                <ResizeHandle
                  className="bottom-right"
                  onMouseDown={(e) => handleResizeMouseDown(e, "bottom-right")}
                  onTouchStart={(e) => handleResizeTouchStart(e, "bottom-right")}
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
            {t('documentSign.previous')}
          </Button>
          <PageInfo>
            {t('documentSign.page', { current: currentPage, total: numPages })}
          </PageInfo>
          <Button
            variant="secondary"
            onClick={handleNextPage}
            disabled={currentPage >= numPages}
          >
            {t('documentSign.next')}
          </Button>
        </Controls>

        {isMobile && (
        <ZoomBar>
          <Button variant="secondary" onClick={zoomOut} disabled={zoom <= MIN_ZOOM}>−</Button>
          <ZoomLabel>{Math.round(zoom * 100)}%</ZoomLabel>
          <Button variant="secondary" onClick={zoomIn} disabled={zoom >= MAX_ZOOM}>+</Button>
          <Button variant="secondary" onClick={resetZoom}>↺</Button>
        </ZoomBar>
        )}

        <Controls>
          <Button variant="secondary" onClick={onBack}>
            {t('documentSign.backToSignature')}
          </Button>
          <Button variant="secondary" onClick={onReset}>
            {t('documentSign.uploadDifferent')}
          </Button>
          <Button onClick={handleSaveSignedPdf}>{t('documentSign.signDownload')}</Button>
        </Controls>
      </ButtonGroup>

      {success && (
        <InfoBox type="success">
          {t('documentSign.success')}
        </InfoBox>
      )}
    </Container>
  );
};

export default PdfSign;
