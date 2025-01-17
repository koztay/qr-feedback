import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { prisma } from '../index';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// Validation schema for creating/updating user
const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['USER', 'ADMIN', 'MUNICIPALITY_ADMIN']),
  municipalityId: z.string().uuid().optional(),
  name: z.string().min(1),
  phone: z.string().optional()
});

// Create user (admin only)
router.post('/', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const validatedData = userSchema.parse(req.body);

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    const user = await prisma.user.create({
      data: {
        ...validatedData,
        password: hashedPassword
      },
      select: {
        id: true,
        email: true,
        role: true,
        municipalityId: true,
        name: true,
        phone: true,
        createdAt: true
      }
    });

    res.status(201).json(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get users list with pagination and filters
router.get('/', authenticateToken, requireRole(['ADMIN', 'MUNICIPALITY_ADMIN']), async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const role = req.query.role as string;
    const municipalityId = req.query.municipalityId as string;

    const where: any = {};
    if (role) {
      where.role = role;
    }
    if (municipalityId) {
      where.municipalityId = municipalityId;
    }

    // Municipality admins can only see users from their municipality
    if (req.user.role === 'MUNICIPALITY_ADMIN') {
      where.municipalityId = req.user.municipalityId;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          role: true,
          municipalityId: true,
          name: true,
          phone: true,
          createdAt: true,
          municipality: {
            select: {
              name: true
            }
          }
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.user.count({ where })
    ]);

    res.json({
      data: users,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Users can only view their own profile
    if (req.user.role === 'USER' && req.user.id !== id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Municipality admins can only view users from their municipality
    if (req.user.role === 'MUNICIPALITY_ADMIN') {
      const user = await prisma.user.findUnique({ where: { id } });
      if (!user || user.municipalityId !== req.user.municipalityId) {
        return res.status(403).json({ error: 'Forbidden' });
      }
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        role: true,
        municipalityId: true,
        name: true,
        phone: true,
        createdAt: true,
        municipality: {
          select: {
            name: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user
router.patch('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Users can only update their own profile
    if (req.user.role === 'USER' && req.user.id !== id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Municipality admins can only update users from their municipality
    if (req.user.role === 'MUNICIPALITY_ADMIN') {
      const user = await prisma.user.findUnique({ where: { id } });
      if (!user || user.municipalityId !== req.user.municipalityId) {
        return res.status(403).json({ error: 'Forbidden' });
      }
    }

    const validatedData = userSchema.partial().parse(req.body);

    // If password is being updated, hash it
    if (validatedData.password) {
      validatedData.password = await bcrypt.hash(validatedData.password, 10);
    }

    // Regular users can't change their role or municipality
    if (req.user.role === 'USER') {
      delete validatedData.role;
      delete validatedData.municipalityId;
    }

    const user = await prisma.user.update({
      where: { id },
      data: validatedData,
      select: {
        id: true,
        email: true,
        role: true,
        municipalityId: true,
        name: true,
        phone: true,
        createdAt: true,
        municipality: {
          select: {
            name: true
          }
        }
      }
    });

    res.json(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 