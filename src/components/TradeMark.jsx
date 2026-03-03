import styled from "styled-components";
import { useTranslation } from "react-i18next";

const TradeMarkContainer = styled.div`
  position: fixed;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  color: #555555;
  font-size: 0.75rem;
  white-space: nowrap;
  pointer-events: none;

  @media (max-width: 480px) {
    font-size: 0.65rem;
    bottom: 8px;
  }
`;

const TradeMark = () => {
  const { t } = useTranslation();
  return <TradeMarkContainer>{t('app.trademark')}</TradeMarkContainer>;
};
export default TradeMark;
