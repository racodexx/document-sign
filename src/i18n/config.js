import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import fr from "./locales/fr.json";
import de from "./locales/de.json";
import it from "./locales/it.json";
import ro from "./locales/ro.json";
import zh from "./locales/zh.json";
import ja from "./locales/ja.json";
import ko from "./locales/ko.json";
import hi from "./locales/hi.json";
import pt from "./locales/pt.json";

const resources = {
  en: { translation: en },
  fr: { translation: fr },
  de: { translation: de },
  it: { translation: it },
  ro: { translation: ro },
  zh: { translation: zh },
  ja: { translation: ja },
  ko: { translation: ko },
  hi: { translation: hi },
  pt: { translation: pt },
};

// Detect browser language
const getBrowserLanguage = () => {
  const browserLang = navigator.language || navigator.userLanguage;
  // Extract language code (e.g., "en" from "en-US")
  const langCode = browserLang.split('-')[0];
  // Check if the language is supported
  return resources[langCode] ? langCode : "en";
};

i18n.use(initReactI18next).init({
  resources,
  lng: localStorage.getItem("language") || getBrowserLanguage(),
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
