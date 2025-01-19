import { Language } from '@/TranslationContext';

export type Role = 'ADMIN' | 'MUNICIPALITY_ADMIN' | 'USER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  municipalityId?: string;
  language: Language;
  createdAt: string;
  updatedAt: string;
} 