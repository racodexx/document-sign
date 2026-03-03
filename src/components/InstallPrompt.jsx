import { useState, useEffect } from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import useIsMobile from "../hooks/useIsMobile";

const Banner = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.875rem;
  width: 100%;
  box-sizing: border-box;
  padding: 0.875rem 1rem;
  background: linear-gradient(135deg, #eef2ff, #f5f3ff);
  border: 1px solid #c7d2fe;
  border-radius: 12px;
  margin-bottom: 0.5rem;
  margin-top: 0.75rem;
`;

const Icon = styled.div`
  font-size: 1.75rem;
  flex-shrink: 0;
  line-height: 1;
`;

const Body = styled.div`
  flex: 1;
  min-width: 0;
`;

const BannerTitle = styled.p`
  margin: 0 0 0.2rem;
  font-weight: 700;
  font-size: 0.9rem;
  color: #3730a3;
`;

const BannerText = styled.p`
  margin: 0;
  font-size: 0.8rem;
  color: #4338ca;
  line-height: 1.4;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.625rem;
  flex-wrap: wrap;
`;

const DismissBtn = styled.button`
  padding: 0.375rem 0.875rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid #a5b4fc;
  background-color: transparent;
  color: #4338ca;
  transition: background-color 0.2s;
  &:hover { background-color: #e0e7ff; }
`;

const IosSteps = styled.ol`
  margin: 0.4rem 0 0;
  padding-left: 1.25rem;
  font-size: 0.78rem;
  color: #3730a3;
  line-height: 1.7;
  li { margin-bottom: 0.1rem; }
`;

const STORAGE_KEY = "install_prompt_dismissed";

const isIos = () =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.navigator.standalone;

const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;

const InstallPrompt = () => {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!isMobile) return;
    if (isStandalone()) return;
    if (localStorage.getItem(STORAGE_KEY)) return;
    // Only show the custom banner on iOS — Android gets the browser's native prompt
    if (isIos()) setShow(true);
  }, [isMobile]);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setShow(false);
  };

  if (!show) return null;

  return (
    <Banner>
      <Icon>📲</Icon>
      <Body>
        <BannerTitle>{t("install.title")}</BannerTitle>
        <BannerText>{t("install.message")}</BannerText>
        <IosSteps>
          <li>{t("install.iosStep1")}</li>
          <li>{t("install.iosStep2")}</li>
          <li>{t("install.iosStep3")}</li>
        </IosSteps>
        <ButtonRow>
          <DismissBtn onClick={dismiss}>{t("install.dismiss")}</DismissBtn>
        </ButtonRow>
      </Body>
    </Banner>
  );
};

export default InstallPrompt;
