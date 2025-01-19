import { Request } from 'express';
import { UserRole } from '@prisma/client';

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    role: UserRole;
    municipalityId: string | null;
  };
} 