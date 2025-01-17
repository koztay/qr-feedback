import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../index';
import { redis } from '../index';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Validation schemas
const subscriptionSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string()
  })
});

const notificationSchema = z.object({
  title: z.string(),
  body: z.string(),
  icon: z.string().url().optional(),
  data: z.record(z.any()).optional()
});

/**
 * @swagger
 * /api/v1/notifications/subscribe:
 *   post:
 *     summary: Subscribe to push notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - endpoint
 *               - keys
 *             properties:
 *               endpoint:
 *                 type: string
 *               keys:
 *                 type: object
 *                 properties:
 *                   p256dh:
 *                     type: string
 *                   auth:
 *                     type: string
 */
router.post('/subscribe', authenticateToken, async (req, res) => {
  try {
    const subscription = subscriptionSchema.parse(req.body);

    // Store subscription in Redis with user ID
    const key = `push:${req.user.id}`;
    await redis.set(key, JSON.stringify(subscription));

    res.json({ message: 'Successfully subscribed to notifications' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Subscribe error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/v1/notifications/unsubscribe:
 *   post:
 *     summary: Unsubscribe from push notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 */
router.post('/unsubscribe', authenticateToken, async (req, res) => {
  try {
    const key = `push:${req.user.id}`;
    await redis.del(key);

    res.json({ message: 'Successfully unsubscribed from notifications' });
  } catch (error) {
    console.error('Unsubscribe error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/v1/notifications:
 *   get:
 *     summary: Get user's notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: {
          userId: req.user.id
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.notification.count({
        where: {
          userId: req.user.id
        }
      })
    ]);

    res.json({
      data: notifications,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/v1/notifications/{id}/read:
 *   patch:
 *     summary: Mark notification as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.patch('/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await prisma.notification.findUnique({
      where: { id }
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    if (notification.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updatedNotification = await prisma.notification.update({
      where: { id },
      data: {
        read: true,
        readAt: new Date()
      }
    });

    res.json(updatedNotification);
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 