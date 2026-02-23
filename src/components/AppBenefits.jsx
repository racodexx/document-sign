import styled from "styled-components";

const Description = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 24px;
  padding: 14px 28px;

  background: linear-gradient(145deg, #f7f9fc, #eef3f9);
  border-radius: 50px;
  box-shadow: 0 8px 20px rgba(30, 60, 120, 0.08);
  font-size: 14px;
  font-weight: 500;
  color: #2d3748;
`;

const Icon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  color: #3b82f6;

  .svg {
    width: 18px;
    height: 18px;
  }
`;

const Benefit = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  transition:
    transform 0.2s ease,
    opacity 0.2s ease;
`;

const Separtor = styled.div`
  width: 1px;
  height: 18px;
  background: rgba(0, 0, 0, 0.08);
`;

const AppBenefits = () => {
  return (
    <Description>
      <Benefit>
        <Icon>
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M7 10V7a5 5 0 0110 0v3"
              stroke="currentColor"
              strokeWidth="1.8"
            />
            <rect
              x="5"
              y="10"
              width="14"
              height="10"
              rx="2"
              stroke="currentColor"
              strokeWidth="1.8"
            />
          </svg>
        </Icon>
        <span>No data stored</span>
      </Benefit>

      <Separtor />

      <Benefit>
        <Icon>
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M13 2L3 14h7l-1 8 10-12h-7l1-8z"
              stroke="currentColor"
              strokeWidth="1.8"
              fill="currentColor"
            />
          </svg>
        </Icon>
        <span>Sign in seconds</span>
      </Benefit>

      <Separtor />

      <Benefit>
        <Icon>
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M7 3h7l5 5v13H7z"
              stroke="currentColor"
              strokeWidth="1.8"
            />
            <path d="M14 3v5h5" stroke="currentColor" strokeWidth="1.8" />
          </svg>
        </Icon>
        <span>Supports PDF, DOC, DOCX</span>
      </Benefit>
    </Description>
  );
};

export default AppBenefits;
