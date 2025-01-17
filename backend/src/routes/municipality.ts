import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../index';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// Validation schema for creating/updating municipality
const municipalitySchema = z.object({
  name: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  country: z.string().min(1),
  contactEmail: z.string().email(),
  contactPhone: z.string().optional(),
  subscriptionStatus: z.enum(['ACTIVE', 'INACTIVE', 'PENDING']).optional()
});

// Create municipality (admin only)
router.post('/', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const validatedData = municipalitySchema.parse(req.body);

    const municipality = await prisma.municipality.create({
      data: validatedData
    });

    res.status(201).json(municipality);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Create municipality error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get municipalities list with pagination and filters
router.get('/', authenticateToken, async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const city = req.query.city as string;
    const subscriptionStatus = req.query.subscriptionStatus as string;

    const where: any = {};
    if (city) {
      where.city = city;
    }
    if (subscriptionStatus) {
      where.subscriptionStatus = subscriptionStatus;
    }

    const [municipalities, total] = await Promise.all([
      prisma.municipality.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          _count: {
            select: {
              feedback: true,
              users: true
            }
          }
        },
        orderBy: {
          name: 'asc'
        }
      }),
      prisma.municipality.count({ where })
    ]);

    res.json({
      data: municipalities,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit
      }
    });
  } catch (error) {
    console.error('Get municipalities error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get municipality by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const municipality = await prisma.municipality.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            feedback: true,
            users: true
          }
        }
      }
    });

    if (!municipality) {
      return res.status(404).json({ error: 'Municipality not found' });
    }

    res.json(municipality);
  } catch (error) {
    console.error('Get municipality error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update municipality (admin only)
router.patch('/:id', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = municipalitySchema.partial().parse(req.body);

    const municipality = await prisma.municipality.update({
      where: { id },
      data: validatedData
    });

    res.json(municipality);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Update municipality error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 