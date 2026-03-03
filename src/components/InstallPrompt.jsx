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

const InstallBtn = styled.button`
  padding: 0.375rem 0.875rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  background-color: #4f46e5;
  color: #ffffff;
  transition: background-color 0.2s;
  &:hover { background-color: #4338ca; }
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

const STORAGE_KEY = "install_prompt_dismissed";

const isIos = () =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.navigator.standalone;

const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;

const InstallPrompt = () => {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [promptEvent, setPromptEvent] = useState(null);
  const [show, setShow] = useState(false);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    if (!isMobile) return;
    if (isStandalone()) return;
    if (localStorage.getItem(STORAGE_KEY)) return;

    const iosDevice = isIos();
    setIos(iosDevice);

    if (iosDevice) {
      setShow(true);
      return;
    }

    const handler = (e) => {
      e.preventDefault();
      setPromptEvent(e);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, [isMobile]);

  const handleInstall = async () => {
    if (ios) {
      if (navigator.share) {
        try {
          await navigator.share({
            title: document.title,
            url: window.location.href,
          });
        } catch (_) {
          // user cancelled or share failed — keep banner visible
        }
      }
      return;
    }
    if (!promptEvent) return;
    promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    if (outcome === "accepted") {
      dismiss();
    }
  };

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
        <BannerText>
          {ios ? t("install.iosInstructions") : t("install.message")}
        </BannerText>
        <ButtonRow>
          <InstallBtn onClick={handleInstall}>{t("install.install")}</InstallBtn>
          <DismissBtn onClick={dismiss}>{t("install.dismiss")}</DismissBtn>
        </ButtonRow>
      </Body>
    </Banner>
  );
};

export default InstallPrompt;
