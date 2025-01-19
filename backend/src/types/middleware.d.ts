import { Request } from 'express';
import { UserRole } from '@prisma/client';
import { TypedRequestHandler, UnauthenticatedRequestHandler } from './express';

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    role: UserRole;
    municipalityId: string | null;
  };
}

export type AuthMiddleware = UnauthenticatedRequestHandler;
export type RoleMiddleware = TypedRequestHandler;

// Type guard to check if a request is authenticated
export function isAuthenticatedRequest(req: Request): req is AuthenticatedRequest {
  return req.user !== undefined && 
         'id' in req.user && 
         'role' in req.user && 
         'municipalityId' in req.user;
} 