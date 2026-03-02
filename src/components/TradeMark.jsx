import styled from "styled-components";
import { useTranslation } from "react-i18next";

const TradeMarkContainer = styled.div`
  position: absolute;
  bottom: 16px;
  color: #555555;
`;

const TradeMark = () => {
  const { t } = useTranslation();
  return <TradeMarkContainer>{t('app.trademark')}</TradeMarkContainer>;
};
export default TradeMark;
