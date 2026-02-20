import { useState, useRef } from "react";
import styled from "styled-components";
import InfoBox from "./InfoBox";

const DropZone = styled.div`
  width: 50%;
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

const UploadText = styled.p`
  color: #64748b;
  font-size: 1rem;
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
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/png",
    "image/jpeg",
    "image/jpg"
  ];

  const validateFile = (file) => {
    if (!file) return false;

    if (file.size > MAX_FILE_SIZE) {
      setError("File is too large. Maximum size is 10MB.");
      return false;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("The file you uploaded is not supported. Please upload a PDF, Word document, or an image file.");
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
    <>
      <DropZone
        $isDragging={isDragging}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <UploadIcon>📄</UploadIcon>
        <UploadText>
          <strong>Click to upload</strong> or drag and drop
        </UploadText>
        <UploadText style={{ fontSize: "0.875rem" }}>
          PDF, DOC, DOCX (max. 10MB)
        </UploadText>
        <HiddenInput
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          accept=".pdf,.docx,.png,.jpg,.jpeg"
        />
      </DropZone>
      {error && (
        <InfoBox type="error">
          {error}
        </InfoBox>
      )}
    </>
  );
};
export default FileUpload;
