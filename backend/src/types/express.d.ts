import { UserRole } from '@prisma/client';

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

// Need to be exported to be treated as a module
export {}; 