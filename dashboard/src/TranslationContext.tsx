import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from './lib/api';

export type Language = 'TR' | 'EN';

export interface SupportedLanguage {
  code: Language;
  name: string;
  nativeName: string;
}

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  { code: 'TR', name: 'Turkish', nativeName: 'Türkçe' },
  { code: 'EN', name: 'English', nativeName: 'English' }
];

interface Translation {
  id: string;
  key: string;
  category: string;
  translations: Record<Language, string>;
}

interface TranslationContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, category?: string) => string;
  supportedLanguages: SupportedLanguage[];
  translations: Translation[];
  isLoading: boolean;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [language, setLanguage] = useState<Language>('TR');
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.language) {
      setLanguage(user.language as Language);
    }
  }, [user]);

  useEffect(() => {
    const fetchTranslations = async () => {
      try {
        const response = await api.get('/translations');
        setTranslations(response.data);
      } catch (error) {
        console.error('Error fetching translations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTranslations();
  }, []);

  useEffect(() => {
    const updateUserLanguage = async () => {
      if (user) {
        try {
          await api.patch(`/users/${user.id}`, { language });
        } catch (error) {
          console.error('Error updating user language:', error);
        }
      }
    };

    updateUserLanguage();
  }, [language, user]);

  const t = (key: string, category: string = 'common'): string => {
    const translation = translations.find(t => t.key === key && t.category === category);
    if (!translation) {
      console.warn(`Translation not found for key: ${key} in category: ${category}`);
      return key;
    }
    return translation.translations[language] || translation.translations['EN'] || key;
  };

  const value = {
    language,
    setLanguage,
    t,
    supportedLanguages: SUPPORTED_LANGUAGES,
    translations,
    isLoading
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
} 