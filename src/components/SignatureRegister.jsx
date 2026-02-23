import { useRef, useState, useEffect } from "react";
import styled from "styled-components";
import SignaturePad from "signature_pad";
import { Button, InfoBox, Container, Title } from "./base/index";

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

const ControlsContainer = styled.div`
  display: flex;
  gap: 2rem;
  align-items: center;
  padding: 1rem;
  background-color: #f8fafc;
  border-radius: 8px;
  margin-bottom: 1rem;
  flex-wrap: wrap;
`;

const ControlGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 600;
  color: #475569;
`;

const ColorPicker = styled.input`
  width: 60px;
  height: 40px;
  border: 2px solid #cbd5e1;
  border-radius: 6px;
  cursor: pointer;
  &::-webkit-color-swatch-wrapper {
    padding: 2px;
  }
  &::-webkit-color-swatch {
    border: none;
    border-radius: 4px;
  }
`;

const ColorPresets = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const Slider = styled.input`
  width: 150px;
  height: 6px;
  border-radius: 3px;
  background: #cbd5e1;
  outline: none;
  cursor: pointer;
  &::-webkit-slider-thumb {
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #3b82f6;
    cursor: pointer;
  }
  &::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #3b82f6;
    cursor: pointer;
    border: none;
  }
`;

const SliderValue = styled.span`
  font-size: 0.875rem;
  color: #64748b;
  min-width: 40px;
`;

const SignatureRegister = ({signature, onSignatureSave, onBack }) => {
  const canvasRef = useRef(null);
  const signaturePadRef = useRef(null);
  const [isEmpty, setIsEmpty] = useState(true);
  const [penColor, setPenColor] = useState("#1e40af");
  const [penWidth, setPenWidth] = useState(2);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size
    canvas.width = 800;
    canvas.height = 300;

    // Initialize SignaturePad
    signaturePadRef.current = new SignaturePad(canvas, {
      penColor: penColor,
      minWidth: penWidth * 0.5,
      maxWidth: penWidth * 1.5,
      velocityFilterWeight: 0.7,
    });

    // Listen for drawing events
    signaturePadRef.current.addEventListener("beginStroke", () => {
      setIsEmpty(false);
    });

    return () => {
      if (signaturePadRef.current) {
        signaturePadRef.current.off();
      }
    };
  }, []);

  // Load existing signature if provided
  useEffect(() => {
    if (signature && signaturePadRef.current) {
      signaturePadRef.current.fromDataURL(signature.dataUrl || signature);
      setIsEmpty(false);
    }
  }, []);

  // Update pen color when changed
  useEffect(() => {
    if (signaturePadRef.current) {
      signaturePadRef.current.penColor = penColor;
    }
  }, [penColor]);

  // Update pen width when changed
  useEffect(() => {
    if (signaturePadRef.current) {
      signaturePadRef.current.minWidth = penWidth * 0.5;
      signaturePadRef.current.maxWidth = penWidth * 1.5;
    }
  }, [penWidth]);

  const handleColorChange = (color) => {
    setPenColor(color);
  };

  const handleWidthChange = (e) => {
    setPenWidth(parseFloat(e.target.value));
  };

  const clearSignature = () => {
    if (signaturePadRef.current) {
      signaturePadRef.current.clear();
      setIsEmpty(true);
    }
  };

  const saveSignature = () => {
    if (
      isEmpty ||
      !signaturePadRef.current ||
      signaturePadRef.current.isEmpty()
    )
      return;

    // Export as PNG with transparent background
    const signatureDataUrl = signaturePadRef.current.toDataURL("image/png");

    // Also create a blob for file operations if needed
    signaturePadRef.current.canvas.toBlob((blob) => {
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

      <ControlsContainer>
        <ControlGroup>
          <Label>Pen Color</Label>
          <ColorPicker
            type="color"
            value={penColor}
            onChange={(e) => handleColorChange(e.target.value)}
          />
        </ControlGroup>

        <ControlGroup>
          <Label>Pen Thickness</Label>
          <ColorPresets>
            <Slider
              type="range"
              min="0.5"
              max="5"
              step="0.5"
              value={penWidth}
              onChange={handleWidthChange}
            />
            <SliderValue>{penWidth.toFixed(1)}px</SliderValue>
          </ColorPresets>
        </ControlGroup>
      </ControlsContainer>

      <CanvasContainer>
        <Canvas ref={canvasRef} />
      </CanvasContainer>

      <ButtonGroup>
         <Button variant="secondary" onClick={onBack}>
          Back to file upload
        </Button>
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
