import { useState, useRef } from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { InfoBox, Title, Container, Subtitle } from "./base/index";
import { AppBenefits } from "./index";

const StyledContainter = styled(Container)`
  height: 70vh;
  justify-content: center;
`;

const DropZone = styled.div`
  min-height: 200px;
  border: 2px dashed ${(props) => (props.$isDragging ? "#4f46e5" : "#cbd5e1")};
  border-radius: 8px;
  background-color: ${(props) => (props.$isDragging ? "#eef2ff" : "#f8fafc")};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 2rem;
  margin-bottom: 1rem;

  &:hover {
    border-color: #4f46e5;
    background-color: #eef2ff;
  }
`;

const UploadText = styled.h2`
  color: #64748b;
  margin: 0.5rem 0;
  text-align: center;
`;

const UploadIcon = styled.div`
  font-size: 2rem;
  color: #94a3b8;
  margin-bottom: 0.5rem;
`;

const HiddenInput = styled.input`
  display: none;
`;

const FileUpload = ({ onFileSelect }) => {
  const { t } = useTranslation();
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const Max_FILE_SIZE_MB = 15;
  const MAX_FILE_SIZE = Max_FILE_SIZE_MB * 1024 * 1024;
  const ALLOWED_TYPES = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/png",
    "image/jpeg",
    "image/jpg",
  ];

  const validateFile = (file) => {
    if (!file) return false;

    if (file.size > MAX_FILE_SIZE) {
      setError(t('fileUpload.errors.fileTooLarge', { size: Max_FILE_SIZE_MB }));
      return false;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError(t('fileUpload.errors.unsupportedType'));
      return false;
    }

    return true;
  };

  const handleFileChange = (event) => {
    setError(null); // Clear error on new upload attempt
    const file = event.target.files[0];

    if (file && validateFile(file) && onFileSelect) {
      onFileSelect(file);
    }

    // Reset input value to allow same file upload
    event.target.value = "";
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    setError(null); // Clear error on new upload attempt

    const file = event.dataTransfer.files[0];
    if (file && validateFile(file) && onFileSelect) {
      onFileSelect(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <StyledContainter>
      <Title>{t('fileUpload.title')}</Title>
      <Subtitle>{t('fileUpload.subtitle')}</Subtitle>
      <AppBenefits />
      <DropZone
        $isDragging={isDragging}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <UploadIcon>📄</UploadIcon>
        <UploadText>
          <strong>{t('fileUpload.clickToUpload')}</strong> {t('fileUpload.dragAndDrop')}
        </UploadText>
        <UploadText style={{ fontSize: "0.875rem" }}>
          {t('fileUpload.fileTypes', { size: Max_FILE_SIZE_MB })}
        </UploadText>
        <HiddenInput
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          accept=".pdf,.png,.jpg,.jpeg"
        />
      </DropZone>
      {error && <InfoBox type="error">{error}</InfoBox>}
    </StyledContainter>
  );
};
export default FileUpload;
