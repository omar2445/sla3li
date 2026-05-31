import { createContext, useContext, useState, useEffect } from 'react';
import en from '../i18n/en';
import ar from '../i18n/ar';

const LangContext = createContext();

export const LangProvider = ({ children }) => {
  const [lang, setLang] = useState(() => localStorage.getItem('sla3li_lang') || 'en');
  const t = lang === 'ar' ? ar : en;
  const isRTL = lang === 'ar';

  useEffect(() => {
    localStorage.setItem('sla3li_lang', lang);
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    document.body.className = isRTL ? 'font-arabic' : 'font-sans';
  }, [lang, isRTL]);

  const toggleLang = () => setLang(l => l === 'en' ? 'ar' : 'en');

  return (
    <LangContext.Provider value={{ lang, t, isRTL, toggleLang }}>
      {children}
    </LangContext.Provider>
  );
};

export const useLang = () => useContext(LangContext);
