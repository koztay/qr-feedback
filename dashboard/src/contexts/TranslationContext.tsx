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
  const missingTranslationsRef = React.useRef<Set<string>>(new Set());

  // Initialize language from user preferences or localStorage
  useEffect(() => {
    const initializeLanguage = async () => {
      if (isInitialized) return;
      
      try {
        if (user?.id) {
          const response = await api.get(`/users/${user.id}`);
          const userLanguage = response.data.language || 'TR';
          setLanguage(userLanguage);
        } else {
          // Use localStorage for non-authenticated users
          const savedLanguage = localStorage.getItem('preferredLanguage') || 'TR';
          setLanguage(savedLanguage);
        }
      } catch (error) {
        console.error('Error fetching user language:', error);
      } finally {
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
          const category = item.category;
          
          if (!organized[category]) {
            organized[category] = {};
          }
          organized[category][item.key] = item.translations;
        });
        
        setTranslations(organized);
        // Clear missing translations cache when we get new translations
        missingTranslationsRef.current.clear();
      } catch (error) {
        console.error('Error fetching translations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isInitialized) {
      fetchTranslations();
    }
  }, [isInitialized]); // Only fetch when initialized

  // Update language preference
  const handleLanguageChange = async (newLanguage: string) => {
    setLanguage(newLanguage);
    // Clear missing translations cache when language changes
    missingTranslationsRef.current.clear();
    
    if (user?.id) {
      try {
        await api.patch(`/users/${user.id}`, { language: newLanguage });
      } catch (error) {
        console.error('Error updating user language:', error);
      }
    } else {
      // Store in localStorage for non-authenticated users
      localStorage.setItem('preferredLanguage', newLanguage);
    }
  };

  const t = (key: string, category: string = 'common') => {
    try {
      // Create a unique key for caching missing translations
      const cacheKey = `${category}:${key}:${language}`;

      // Handle nested keys (e.g., 'common.view_details')
      if (key.includes('.')) {
        const [nestedCategory, nestedKey] = key.split('.');
        const translation = translations[nestedCategory]?.[nestedKey]?.[language];
        if (!translation && !missingTranslationsRef.current.has(cacheKey) && translations[nestedCategory]) {
          missingTranslationsRef.current.add(cacheKey);
          console.warn(`Missing translation: ${key} for language ${language}`);
        }
        return translation || nestedKey;
      }

      // Handle regular keys
      const translation = translations[category]?.[key]?.[language];
      if (!translation && !missingTranslationsRef.current.has(cacheKey) && translations[category]) {
        missingTranslationsRef.current.add(cacheKey);
        console.warn(`Missing translation: ${key} in category ${category} for language ${language}`);
      }
      return translation || key;
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