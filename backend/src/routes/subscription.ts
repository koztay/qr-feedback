import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../index';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// Validation schema for creating/updating subscription
const subscriptionSchema = z.object({
  municipalityId: z.string().uuid(),
  plan: z.enum(['BASIC', 'PREMIUM', 'ENTERPRISE']),
  validUntil: z.string().datetime(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'PENDING', 'CANCELLED']).optional(),
  paymentStatus: z.enum(['PAID', 'PENDING', 'FAILED']).optional(),
  paymentMethod: z.string().optional(),
  amount: z.number().positive()
});

// Create subscription (admin only)
router.post('/', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const validatedData = subscriptionSchema.parse(req.body);

    const subscription = await prisma.subscription.create({
      data: {
        ...validatedData,
        status: validatedData.status || 'PENDING',
        paymentStatus: validatedData.paymentStatus || 'PENDING'
      },
      include: {
        municipality: {
          select: {
            name: true,
            city: true
          }
        }
      }
    });

    // Update municipality subscription status
    await prisma.municipality.update({
      where: { id: validatedData.municipalityId },
      data: {
        subscriptionStatus: subscription.status
      }
    });

    res.status(201).json(subscription);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Create subscription error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get subscriptions list with pagination and filters
router.get('/', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const status = req.query.status as string;
    const municipalityId = req.query.municipalityId as string;

    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (municipalityId) {
      where.municipalityId = municipalityId;
    }

    const [subscriptions, total] = await Promise.all([
      prisma.subscription.findMany({
        where,
        include: {
          municipality: {
            select: {
              name: true,
              city: true
            }
          }
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.subscription.count({ where })
    ]);

    res.json({
      data: subscriptions,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit
      }
    });
  } catch (error) {
    console.error('Get subscriptions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get subscription by ID
router.get('/:id', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;

    const subscription = await prisma.subscription.findUnique({
      where: { id },
      include: {
        municipality: {
          select: {
            name: true,
            city: true
          }
        }
      }
    });

    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    res.json(subscription);
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update subscription status (admin only)
router.patch('/:id', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = subscriptionSchema.partial().parse(req.body);

    const subscription = await prisma.subscription.update({
      where: { id },
      data: validatedData,
      include: {
        municipality: {
          select: {
            name: true,
            city: true
          }
        }
      }
    });

    // Update municipality subscription status if subscription status changes
    if (validatedData.status) {
      await prisma.municipality.update({
        where: { id: subscription.municipalityId },
        data: {
          subscriptionStatus: validatedData.status
        }
      });
    }

    res.json(subscription);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Update subscription error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 