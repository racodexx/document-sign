import { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";

import { Button, InfoBox, Container } from "./base/index";

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

const ImageWrapper = styled.div`
  position: relative;
  display: inline-block;
`;

const DocumentImage = styled.img`
  max-width: 100%;
  height: auto;
  display: block;
  user-select: none;
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
  justify-content: flex-end;
  flex-wrap: wrap;

  @media (max-width: 480px) {
    justify-content: center;
  }
`;

const ImageSign = ({ file, signature, onReset, onBack }) => {
  const { t } = useTranslation();
  const [imageUrl, setImageUrl] = useState(null);
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
  const imageRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

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
    if (!imageRef.current) return;

    if (isDragging) {
      const imageRect = imageRef.current.getBoundingClientRect();
      const newX = e.clientX - imageRect.left - dragOffset.x;
      const newY = e.clientY - imageRect.top - dragOffset.y;

      setSignaturePosition({
        x: Math.max(0, Math.min(newX, imageRect.width - signatureSize.width)),
        y: Math.max(0, Math.min(newY, imageRect.height - signatureSize.height)),
      });
    } else if (isResizing) {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;
      const imageRect = imageRef.current.getBoundingClientRect();

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

      // Ensure signature doesn't go outside image bounds
      if (newX < 0) {
        newWidth += newX;
        newX = 0;
      }
      if (newY < 0) {
        newHeight += newY;
        newY = 0;
      }
      if (newX + newWidth > imageRect.width) {
        newWidth = imageRect.width - newX;
      }
      if (newY + newHeight > imageRect.height) {
        newHeight = imageRect.height - newY;
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

  const handleSaveSignedImage = () => {
    if (!signature || !imageRef.current) return;

    const canvas = window.document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = imageRef.current;

    // Set canvas size to match the image's natural size
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    // Calculate the scale factor between displayed and natural size
    const scaleX = img.naturalWidth / img.width;
    const scaleY = img.naturalHeight / img.height;

    // Draw the original image
    ctx.drawImage(img, 0, 0);

    // Create signature image element
    const signatureImg = new Image();
    signatureImg.onload = () => {
      // Draw the signature at the scaled position
      const scaledX = signaturePosition.x * scaleX;
      const scaledY = signaturePosition.y * scaleY;
      const scaledWidth = signatureSize.width * scaleX;
      const scaledHeight = signatureSize.height * scaleY;

      ctx.drawImage(signatureImg, scaledX, scaledY, scaledWidth, scaledHeight);

      // Convert canvas to blob and download
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const downloadLink = window.document.createElement("a");
        downloadLink.href = url;

        // Determine file extension
        const extension = file.type.split("/")[1];
        downloadLink.download = `signed_${file.name || `image.${extension}`}`;
        downloadLink.click();

        URL.revokeObjectURL(url);
        console.info("Signed image generated and download initiated.");
      }, file.type);
    };

    signatureImg.src = signature.dataUrl;
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
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <ImageWrapper>
          {imageUrl && (
            <>
              <DocumentImage
                ref={imageRef}
                src={imageUrl}
                alt="Document"
                draggable={false}
              />

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
                    onMouseDown={(e) =>
                      handleResizeMouseDown(e, "bottom-right")
                    }
                    onTouchStart={(e) => handleResizeTouchStart(e, "bottom-right")}
                  />
                </SignatureWrapper>
              )}
            </>
          )}
        </ImageWrapper>
      </ViewerContainer>

      <ButtonGroup>
        <Button variant="secondary" onClick={onBack}>
          {t('documentSign.backToSignature')}
        </Button>
        <Button variant="secondary" onClick={onReset}>
          {t('documentSign.uploadDifferent')}
        </Button>
        <Button onClick={handleSaveSignedImage}>{t('documentSign.signDownload')}</Button>
      </ButtonGroup>
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </Container>
  );
};

export default ImageSign;
