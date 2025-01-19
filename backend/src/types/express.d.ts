import { UserRole } from '@prisma/client';
import { Request, Response, NextFunction, RequestHandler } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';

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

export type TypedRequestHandler<
  P = ParamsDictionary,
  ResBody = any,
  ReqBody = any,
  ReqQuery = ParsedQs,
  Locals extends Record<string, any> = Record<string, any>
> = (
  req: Request<P, ResBody, ReqBody, ReqQuery> & { user: { id: string; role: UserRole; municipalityId: string | null } },
  res: Response<ResBody, Locals>,
  next: NextFunction
) => Promise<void | Response<ResBody>> | void | Response<ResBody>;

export type UnauthenticatedRequestHandler<
  P = ParamsDictionary,
  ResBody = any,
  ReqBody = any,
  ReqQuery = ParsedQs,
  Locals extends Record<string, any> = Record<string, any>
> = (
  req: Request<P, ResBody, ReqBody, ReqQuery>,
  res: Response<ResBody, Locals>,
  next: NextFunction
) => Promise<void | Response<ResBody>> | void | Response<ResBody>;

// Need to be exported to be treated as a module
export {}; 