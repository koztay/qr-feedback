import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';
import { prisma } from '../index';

// Middleware to authenticate JWT token
export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token is required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string;
      role: UserRole;
    };

    // Get user from database to ensure they still exist and have the same role
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        role: true,
        municipalityId: true
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'User no longer exists' });
    }

    if (user.role !== decoded.role) {
      return res.status(401).json({ error: 'User role has changed' });
    }

    req.user = {
      id: user.id,
      role: user.role,
      municipalityId: user.municipalityId || undefined
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Middleware to check user role
export const requireRole = (allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

// Middleware to check municipality access
export const requireMunicipalityAccess = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // System admins have access to all municipalities
    if (req.user.role === 'ADMIN') {
      return next();
    }

    const municipalityId = req.params.municipalityId || req.body.municipalityId;

    if (!municipalityId) {
      return res.status(400).json({ error: 'Municipality ID is required' });
    }

    // Municipality admins can only access their own municipality
    if (req.user.role === 'MUNICIPALITY_ADMIN') {
      if (req.user.municipalityId !== municipalityId) {
        return res.status(403).json({ error: 'Access denied to this municipality' });
      }
    }

    // Regular users can only access their own municipality
    if (req.user.role === 'USER') {
      if (!req.user.municipalityId || req.user.municipalityId !== municipalityId) {
        return res.status(403).json({ error: 'Access denied to this municipality' });
      }
    }

    next();
  } catch (error) {
    console.error('Municipality access check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 