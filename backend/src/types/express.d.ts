import { UserRole } from '@prisma/client';
import { RequestHandler, Request } from 'express';

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
  ReqBody = any
> = (
  ...args: Parameters<RequestHandler<P, ResBody, ReqBody>>
) => Promise<void | any> | void | any;

// Need to be exported to be treated as a module
export {}; 