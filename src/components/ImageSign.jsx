import { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import Button from "./base/Button";
import InfoBox from "./base/InfoBox";

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
  justify-content: flex-end;
`;

const ImageSign = ({ file, signature, onReset }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [signaturePosition, setSignaturePosition] = useState({ x: 100, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [success, setSuccess] = useState(false);
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
    setIsDragging(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !imageRef.current) return;

    const imageRect = imageRef.current.getBoundingClientRect();
    const newX = e.clientX - imageRect.left - dragOffset.x;
    const newY = e.clientY - imageRect.top - dragOffset.y;

    setSignaturePosition({
      x: Math.max(0, Math.min(newX, imageRect.width - 200)),
      y: Math.max(0, Math.min(newY, imageRect.height - 80))
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleSaveSignedImage = () => {
    if (!signature || !imageRef.current) return;

    const canvas = window.document.createElement('canvas');
    const ctx = canvas.getContext('2d');
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
      const scaledWidth = 200 * scaleX;
      const scaledHeight = 80 * scaleY;

      ctx.drawImage(signatureImg, scaledX, scaledY, scaledWidth, scaledHeight);

      // Convert canvas to blob and download
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const downloadLink = window.document.createElement('a');
        downloadLink.href = url;
        
        // Determine file extension
        const extension = file.type.split('/')[1];
        downloadLink.download = `signed_${file.name || `image.${extension}`}`;
        downloadLink.click();
        
        URL.revokeObjectURL(url);
        setSuccess(true);
      }, file.type);
    };

    signatureImg.src = signature.dataUrl;
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
        Drag the signature to position it on the image, then click "Sign & Download".
      </InfoBox>

      <ViewerContainer
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
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
            </>
          )}
        </ImageWrapper>
      </ViewerContainer>

      <ButtonGroup>
        <Button variant="secondary" onClick={onReset}>
          Upload Different File
        </Button>
        <Button onClick={handleSaveSignedImage}>
          Sign & Download
        </Button>
      </ButtonGroup>

      {success && (
        <InfoBox type="success">
          Image signed successfully! The file has been downloaded.
        </InfoBox>
      )}

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </Container>
  );
};

export default ImageSign;
