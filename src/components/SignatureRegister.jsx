import { useRef, useState, useEffect } from "react";
import styled from "styled-components";
import Button from "./base/Button";
import InfoBox from "./base/InfoBox";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 800px;
  margin: 0 auto;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
`;

const CanvasContainer = styled.div`
  border: 2px solid #cbd5e1;
  border-radius: 8px;
  background-color: #ffffff;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const Canvas = styled.canvas`
  display: block;
  cursor: crosshair;
  touch-action: none;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
`;

const SignatureRegister = ({ onSignatureSave }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    // Set canvas size
    canvas.width = 800;
    canvas.height = 300;

    // Configure drawing style
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();

    const x = e.clientX
      ? e.clientX - rect.left
      : e.touches[0].clientX - rect.left;
    const y = e.clientY
      ? e.clientY - rect.top
      : e.touches[0].clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setIsEmpty(false);
  };

  const draw = (e) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();

    const x = e.clientX
      ? e.clientX - rect.left
      : e.touches[0].clientX - rect.left;
    const y = e.clientY
      ? e.clientY - rect.top
      : e.touches[0].clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
  };

  const saveSignature = () => {
    if (isEmpty) return;

    const canvas = canvasRef.current;

    // Export as PNG with transparent background
    const signatureDataUrl = canvas.toDataURL("image/png");

    // Also create a blob for file operations if needed
    canvas.toBlob((blob) => {
      if (onSignatureSave) {
        onSignatureSave({
          dataUrl: signatureDataUrl,
          blob: blob,
        });
      }
    }, "image/png");
  };

  return (
    <Container>
      <Title>Create Your Signature</Title>

      <InfoBox type="info">
        Draw your signature in the box below using your mouse or touchscreen.
        You can use this signature to sign documents later.
      </InfoBox>

      <CanvasContainer>
        <Canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </CanvasContainer>

      <ButtonGroup>
        <Button variant="secondary" onClick={clearSignature}>
          Retry
        </Button>
        <Button onClick={saveSignature} disabled={isEmpty}>
          Apply to document
        </Button>
      </ButtonGroup>
    </Container>
  );
};

export default SignatureRegister;
