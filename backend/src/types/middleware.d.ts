import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
import { AsyncRequestHandler } from './express';

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    role: UserRole;
    municipalityId: string | null;
  };
}

export type AuthenticatedHandler<
  P = any,
  ResBody = any,
  ReqBody = any,
  ReqQuery = any
> = AsyncRequestHandler<P, ResBody, ReqBody, ReqQuery>;

export interface UnauthenticatedRequest extends Request {
  user?: never;
}

// Type guard to check if a request is authenticated
export function isAuthenticatedRequest(req: Request): req is AuthenticatedRequest {
  return req.user !== undefined && 
         'id' in req.user && 
         'role' in req.user && 
         'municipalityId' in req.user;
} 