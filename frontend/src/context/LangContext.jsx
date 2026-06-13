import { createContext, useContext, useState, useEffect } from 'react';
import en from '../i18n/en';
import ar from '../i18n/ar';
import fr from '../i18n/fr';

const LangContext = createContext();

const DICTS = { en, fr, ar };
const CYCLE = ['en', 'fr', 'ar'];

export const LangProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    const saved = localStorage.getItem('sla3li_lang');
    return CYCLE.includes(saved) ? saved : 'en';
  });
  const t = DICTS[lang] || en;
  const isRTL = lang === 'ar';

  useEffect(() => {
    localStorage.setItem('sla3li_lang', lang);
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    document.body.className = isRTL ? 'font-arabic' : 'font-sans';
  }, [lang, isRTL]);

  const toggleLang = () => setLang(l => CYCLE[(CYCLE.indexOf(l) + 1) % CYCLE.length]);

  return (
    <LangContext.Provider value={{ lang, t, isRTL, toggleLang, setLang }}>
      {children}
    </LangContext.Provider>
  );
};

export const useLang = () => useContext(LangContext);
