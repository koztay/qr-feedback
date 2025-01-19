import { Request } from 'express';
import { UserRole } from '@prisma/client';

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    role: UserRole;
    municipalityId: string | null;
  };
}

export interface UnauthenticatedRequest extends Request {
  user?: never;
}

// Type guard to check if a request is authenticated
export function isAuthenticatedRequest(req: Request): req is AuthenticatedRequest {
  return req.user !== undefined;
} 