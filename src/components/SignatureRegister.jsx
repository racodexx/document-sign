import { useRef, useState, useEffect } from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import SignaturePad from "signature_pad";
import { Button, InfoBox, Container, Title } from "./base/index";
import useIsMobile from "../hooks/useIsMobile";

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
  gap: 0.75rem;
  justify-content: flex-end;
  flex-wrap: wrap;

  @media (max-width: 480px) {
    justify-content: center;
  }
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

  @media (max-width: 480px) {
    width: 110px;
  }
`;

const SliderValue = styled.span`
  font-size: 0.875rem;
  color: #64748b;
  min-width: 40px;
`;

const SignatureRegister = ({signature, onSignatureSave, onBack }) => {
  const { t } = useTranslation();
  const canvasRef = useRef(null);
  const canvasContainerRef = useRef(null);
  const signaturePadRef = useRef(null);
  const hasContentRef = useRef(false);
  const [isEmpty, setIsEmpty] = useState(true);

  const isMobile = useIsMobile();
  const PEN_MIN = isMobile ? 2 : 3;
  const PEN_MAX = isMobile ? 6 : 10;
  const PEN_DEFAULT = isMobile ? 3 : 5;

  const [penColor, setPenColor] = useState(
    () => localStorage.getItem('sig_penColor') || '#1e40af'
  );
  const [penWidth, setPenWidth] = useState(() => {
    const saved = parseFloat(localStorage.getItem('sig_penWidth'));
    if (!isNaN(saved)) return Math.min(PEN_MAX, Math.max(PEN_MIN, saved));
    return PEN_DEFAULT;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = canvasContainerRef.current;
    if (!canvas || !container) return;

    const setSize = (w) => {
      canvas.width = w;
      canvas.height = Math.max(150, Math.min(300, Math.round(w * 0.375)));
    };

    const createPad = () => {
      if (signaturePadRef.current) {
        signaturePadRef.current.off();
      }
      signaturePadRef.current = new SignaturePad(canvas, {
        penColor: penColor,
        minWidth: penWidth * 0.5,
        maxWidth: penWidth * 1.5,
        velocityFilterWeight: 0.7,
      });
      signaturePadRef.current.addEventListener("beginStroke", () => {
        setIsEmpty(false);
        hasContentRef.current = true;
      });
    };

    const drawScaled = (src) => {
      const img = new Image();
      img.onload = () => {
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = src;
    };

    // Initial setup
    setSize(container.offsetWidth);
    createPad();

    // Load existing signature if provided
    if (signature) {
      const src = signature.dataUrl || signature;
      drawScaled(src);
      hasContentRef.current = true;
      setIsEmpty(false);
    }

    // ResizeObserver — skip the first call (initial report, dimensions haven't changed)
    let firstCall = true;
    const resizeObserver = new ResizeObserver(() => {
      if (firstCall) {
        firstCall = false;
        return;
      }
      const dataUrl = hasContentRef.current ? canvas.toDataURL() : null;
      setSize(container.offsetWidth);
      createPad();
      if (dataUrl) {
        drawScaled(dataUrl);
      }
    });
    resizeObserver.observe(container);

    return () => {
      if (signaturePadRef.current) {
        signaturePadRef.current.off();
      }
      resizeObserver.disconnect();
    };
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
    localStorage.setItem('sig_penColor', color);
  };

  const handleWidthChange = (e) => {
    const val = parseFloat(e.target.value);
    setPenWidth(val);
    localStorage.setItem('sig_penWidth', val);
  };

  const clearSignature = () => {
    if (signaturePadRef.current) {
      signaturePadRef.current.clear();
      hasContentRef.current = false;
      setIsEmpty(true);
    }
  };

  const saveSignature = () => {
    if (isEmpty || !canvasRef.current) return;

    const canvas = canvasRef.current;
    // Export directly from canvas so pre-loaded signatures are included
    const signatureDataUrl = canvas.toDataURL("image/png");

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
    <Container id="signature-register">
      <Title>{t('signature.title')}</Title>

      <InfoBox type="info">
        {t('signature.instructions')}
      </InfoBox>

      <ControlsContainer>
        <ControlGroup>
          <Label>{t('signature.penColor')}</Label>
          <ColorPicker
            type="color"
            value={penColor}
            onChange={(e) => handleColorChange(e.target.value)}
          />
        </ControlGroup>

        <ControlGroup>
          <Label>{t('signature.penThickness')}</Label>
          <ColorPresets>
            <Slider
              type="range"
              min={PEN_MIN}
              max={PEN_MAX}
              step="0.5"
              value={penWidth}
              onChange={handleWidthChange}
            />
            <SliderValue>{penWidth.toFixed(1)}px</SliderValue>
          </ColorPresets>
        </ControlGroup>
      </ControlsContainer>

      <CanvasContainer ref={canvasContainerRef}>
        <Canvas ref={canvasRef} />
      </CanvasContainer>

      <ButtonGroup>
         <Button variant="secondary" onClick={onBack}>
          {t('signature.backToUpload')}
        </Button>
        <Button variant="secondary" onClick={clearSignature}>
          {t('signature.retry')}
        </Button>
        <Button onClick={saveSignature} disabled={isEmpty}>
          {t('signature.applyToDocument')}
        </Button>
      </ButtonGroup>
    </Container>
  );
};

export default SignatureRegister;
