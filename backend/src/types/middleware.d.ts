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

export type AuthenticatedHandler<P = any, ResBody = any, ReqBody = any> = (
  req: AuthenticatedRequest,
  res: Response<ResBody>,
  next: NextFunction
) => Promise<void | any> | void | any;

export interface UnauthenticatedRequest extends Request {
  user?: never;
}

// Type guard to check if a request is authenticated
export function isAuthenticatedRequest(req: Request): req is AuthenticatedRequest {
  return req.user !== undefined && req.user.id !== undefined;
} 