import React, { createContext, useState, useEffect } from 'react';
import { SUPPORTED_LANGUAGES, translations, getTranslation } from '../locales/index.js';

export const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    const saved = localStorage.getItem("quickbites_lang");
    const exists = SUPPORTED_LANGUAGES.some((l) => l.code === saved);
    return exists ? saved : "en";
  });

  useEffect(() => {
    try {
      localStorage.setItem("quickbites_lang", lang);
      // Update HTML document language attribute for accessibility & screen readers
      if (typeof document !== "undefined" && document.documentElement) {
        document.documentElement.lang = lang;
      }
    } catch (e) {
      console.warn("Language persistence notice:", e);
    }
  }, [lang]);

  const setLanguage = (newLangCode) => {
    const valid = SUPPORTED_LANGUAGES.some((l) => l.code === newLangCode);
    if (valid) {
      setLang(newLangCode);
    }
  };

  const toggleLanguage = () => {
    setLang((prev) => (prev === "en" ? "hi" : "en"));
  };

  const currentLanguage =
    SUPPORTED_LANGUAGES.find((l) => l.code === lang) || SUPPORTED_LANGUAGES[0];

  const t = (key) => {
    return getTranslation(lang, key);
  };

  return (
    <LanguageContext.Provider
      value={{
        lang,
        setLang,
        setLanguage,
        toggleLanguage,
        currentLanguage,
        supportedLanguages: SUPPORTED_LANGUAGES,
        t
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageProvider;
