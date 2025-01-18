'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from '@/lib/api';

interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

interface TranslationContextType {
  language: 'TR' | 'EN';
  setLanguage: (lang: 'TR' | 'EN') => void;
  t: (key: string, category?: string) => string;
  isLoading: boolean;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [language, setLanguage] = useState<'TR' | 'EN'>('TR');
  const [translations, setTranslations] = useState<Translations>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Single effect to handle both initialization and updates
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
        const translationData = response.data;
        
        const organized: Translations = {};
        translationData.forEach((item: any) => {
          if (!organized[item.category]) {
            organized[item.category] = {};
          }
          organized[item.category][item.key] = item[language.toLowerCase()];
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
  const handleLanguageChange = async (newLanguage: 'TR' | 'EN') => {
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
      return translations[category]?.[key] || key;
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
        isLoading 
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