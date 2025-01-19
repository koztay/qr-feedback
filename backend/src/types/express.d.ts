import { UserRole } from '@prisma/client';
import { RequestHandler } from 'express';

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

export type TypedRequestHandler<P = any> = RequestHandler<
  any,
  any,
  P,
  any,
  Record<string, any>
>;

// Need to be exported to be treated as a module
export {}; 