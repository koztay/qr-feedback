import { UserRole } from '@prisma/client';
import { Request, Response, NextFunction, RequestHandler } from 'express';

declare global {
  namespace Express {
    // This is for unauthenticated requests
    interface Request {
      user?: {
        id: string;
        role: UserRole;
        municipalityId: string | null;
      };
    }
  }
}

export type AsyncRequestHandler<
  P = any,
  ResBody = any,
  ReqBody = any,
  ReqQuery = any
> = RequestHandler<P, ResBody, ReqBody, ReqQuery>;

// Need to be exported to be treated as a module
export {}; 