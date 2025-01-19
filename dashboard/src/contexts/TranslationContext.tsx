'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import type { Language } from './AuthContext';
import api from '@/lib/api';

export interface SupportedLanguage {
  code: Language;
  name: string;
  nativeName: string;
}

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  { code: 'TR', name: 'Turkish', nativeName: 'Türkçe' },
  { code: 'EN', name: 'English', nativeName: 'English' },
  // Easy to add new languages:
  // { code: 'RU', name: 'Russian', nativeName: 'Русский' },
];

interface Translations {
  [key: string]: {
    [key: string]: Record<string, string>;
  };
}

interface TranslationContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string, category?: string) => string;
  isLoading: boolean;
  supportedLanguages: SupportedLanguage[];
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [language, setLanguage] = useState<string>('TR');
  const [translations, setTranslations] = useState<Translations>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize language from user preferences
  useEffect(() => {
    const initializeLanguage = async () => {
      if (!user?.id || isInitialized) return;
      
      try {
        const response = await api.get(`/users/${user.id}`);
        const userLanguage = response.data.language || 'TR';
        setLanguage(userLanguage);
        setIsInitialized(true);
      } catch (error) {
        console.error('Error fetching user language:', error);
        setIsInitialized(true);
      }
    };

    initializeLanguage();
  }, [user?.id]);

  // Fetch translations
  useEffect(() => {
    const fetchTranslations = async () => {
      try {
        const response = await api.get('/translations');
        const translationData = Array.isArray(response.data) ? response.data : response.data.data;
        
        const organized: Translations = {};
        translationData.forEach((item: any) => {
          if (!organized[item.category]) {
            organized[item.category] = {};
          }
          organized[item.category][item.key] = item.translations;
        });
        
        setTranslations(organized);
      } catch (error) {
        console.error('Error fetching translations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isInitialized) {
      fetchTranslations();
    }
  }, [language, isInitialized]);

  // Update user's language preference
  const handleLanguageChange = async (newLanguage: string) => {
    if (!user?.id || !isInitialized) return;
    
    setLanguage(newLanguage);
    try {
      await api.patch(`/users/${user.id}`, { language: newLanguage });
    } catch (error) {
      console.error('Error updating user language:', error);
    }
  };

  const t = (key: string, category: string = 'common') => {
    try {
      const translation = translations[category]?.[key]?.[language];
      if (!translation) {
        console.warn(`Missing translation: ${category}.${key} for language ${language}`);
        return key;
      }
      return translation;
    } catch (error) {
      console.error(`Translation error for key: ${key}`, error);
      return key;
    }
  };

  return (
    <TranslationContext.Provider 
      value={{ 
        language, 
        setLanguage: handleLanguageChange, 
        t, 
        isLoading,
        supportedLanguages: SUPPORTED_LANGUAGES
      }}
    >
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