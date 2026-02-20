import styled from "styled-components";

const StyledFileUpload = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const FileUpload = ({ onFileSelect }) => {

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    onFileSelect(file);
  };

  return (
    <StyledFileUpload>
      <input type="file" onChange={handleFileChange} />
    </StyledFileUpload>
  );
};
export default FileUpload;
