import React, { createContext, useContext, useEffect, useState } from 'react';
import { Storage } from '../api/storage';

export type Lang = 'en' | 'hi' | 'te';

export const LANGUAGES: { code: Lang; label: string; native: string; tag: string }[] = [
  { code: 'en', label: 'English', native: 'English', tag: 'En' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी', tag: 'अ' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు', tag: 'తె' },
];

const STORAGE_KEY = '@bodhira/lang';

interface LanguageContextValue {
  language: Lang;
  setLanguage: (l: Lang) => void;
  /** The human label of the active language, e.g. "English". */
  label: string;
}

const LanguageContext = createContext<LanguageContextValue>({
  language: 'en',
  setLanguage: () => {},
  label: 'English',
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLang] = useState<Lang>('en');

  useEffect(() => {
    (async () => {
      const stored = await Storage.getItem(STORAGE_KEY);
      if (stored === 'en' || stored === 'hi' || stored === 'te') setLang(stored);
    })();
  }, []);

  const setLanguage = (l: Lang) => {
    setLang(l);
    void Storage.setItem(STORAGE_KEY, l);
  };

  const label = LANGUAGES.find(l => l.code === language)?.label ?? 'English';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, label }}>{children}</LanguageContext.Provider>
  );
};

export function useLanguage(): LanguageContextValue {
  return useContext(LanguageContext);
}
