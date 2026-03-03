import { useTranslation } from "react-i18next";
import styled from "styled-components";

const LanguageSwitcher = styled.div`
  align-self: flex-end;
`;

const Select = styled.select`
  padding: 6px 10px;
  border: 2px solid #cbd5e1;
  border-radius: 8px;
  background-color: #ffffff;
  color: #475569;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  outline: none;
  transition: all 0.2s ease;
  max-width: 150px;

  &:hover {
    border-color: #3b82f6;
  }

  &:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  @media (max-width: 480px) {
    padding: 4px 8px;
    font-size: 0.75rem;
    max-width: 120px;
  }
`;

const languages = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
  { code: "pt", name: "Português", flag: "🇧🇷" },
  { code: "ro", name: "Română", flag: "🇷🇴" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
  { code: "ja", name: "日本語", flag: "🇯🇵" },
  { code: "ko", name: "한국어", flag: "🇰🇷" },
  { code: "hi", name: "हिन्दी", flag: "🇮🇳" },
];

const LanguageSelector = () => {
  const { i18n } = useTranslation();

  const handleLanguageChange = (event) => {
    const newLanguage = event.target.value;
    i18n.changeLanguage(newLanguage);
    localStorage.setItem("language", newLanguage);
  };

  return (
    <LanguageSwitcher>
      <Select value={i18n.language} onChange={handleLanguageChange}>
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.name}
          </option>
        ))}
      </Select>
    </LanguageSwitcher>
  );
};

export default LanguageSelector;
