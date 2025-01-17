import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../index';
import { authenticateToken, requireRole, requireMunicipalityAccess } from '../middleware/auth';

const router = Router();

// Validation schema for date range
const dateRangeSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional()
});

/**
 * @swagger
 * /api/v1/analytics/municipalities/{id}/statistics:
 *   get:
 *     summary: Get municipality statistics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: Municipality statistics
 */
router.get('/municipalities/:id/statistics', 
  authenticateToken, 
  requireMunicipalityAccess,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { startDate, endDate } = dateRangeSchema.parse(req.query);

      const whereClause: any = {
        municipalityId: id
      };

      if (startDate || endDate) {
        whereClause.createdAt = {};
        if (startDate) whereClause.createdAt.gte = new Date(startDate);
        if (endDate) whereClause.createdAt.lte = new Date(endDate);
      }

      const [
        totalFeedback,
        feedbackByStatus,
        feedbackByCategory,
        averageResolutionTime
      ] = await Promise.all([
        // Total feedback count
        prisma.feedback.count({
          where: whereClause
        }),

        // Feedback count by status
        prisma.feedback.groupBy({
          by: ['status'],
          where: whereClause,
          _count: true
        }),

        // Feedback count by category
        prisma.feedback.groupBy({
          by: ['category'],
          where: whereClause,
          _count: true
        }),

        // Average resolution time for resolved feedback
        prisma.feedback.findMany({
          where: {
            ...whereClause,
            status: 'RESOLVED'
          },
          select: {
            createdAt: true,
            updatedAt: true
          }
        }).then(feedback => {
          if (feedback.length === 0) return 0;
          const totalTime = feedback.reduce((sum, f) => 
            sum + (f.updatedAt.getTime() - f.createdAt.getTime()), 0);
          return totalTime / feedback.length / (1000 * 60 * 60); // Convert to hours
        })
      ]);

      res.json({
        totalFeedback,
        feedbackByStatus: Object.fromEntries(
          feedbackByStatus.map(f => [f.status, f._count])
        ),
        feedbackByCategory: Object.fromEntries(
          feedbackByCategory.map(f => [f.category, f._count])
        ),
        averageResolutionTime: Math.round(averageResolutionTime * 100) / 100, // Round to 2 decimal places
        dateRange: {
          startDate: startDate ? new Date(startDate) : null,
          endDate: endDate ? new Date(endDate) : null
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error('Get statistics error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * @swagger
 * /api/v1/analytics/municipalities/{id}/feedback/summary:
 *   get:
 *     summary: Get municipality feedback summary with trends
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: Municipality feedback summary
 */
router.get('/municipalities/:id/feedback/summary',
  authenticateToken,
  requireMunicipalityAccess,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { startDate, endDate } = dateRangeSchema.parse(req.query);

      const whereClause: any = {
        municipalityId: id
      };

      if (startDate || endDate) {
        whereClause.createdAt = {};
        if (startDate) whereClause.createdAt.gte = new Date(startDate);
        if (endDate) whereClause.createdAt.lte = new Date(endDate);
      }

      // Get daily feedback counts
      const dailyFeedback = await prisma.feedback.groupBy({
        by: ['status'],
        where: whereClause,
        _count: true,
        orderBy: {
          _count: 'desc'
        }
      });

      // Get most active areas (based on feedback locations)
      const feedbackLocations = await prisma.feedback.findMany({
        where: whereClause,
        select: {
          location: true,
          category: true
        },
        take: 5
      });

      // Get response time trends
      const responseTimeTrend = await prisma.feedback.findMany({
        where: {
          ...whereClause,
          status: 'RESOLVED'
        },
        select: {
          createdAt: true,
          updatedAt: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 10
      });

      res.json({
        summary: {
          dailyFeedback: Object.fromEntries(
            dailyFeedback.map(f => [f.status, f._count])
          ),
          mostActiveAreas: feedbackLocations.reduce((acc: any, f) => {
            const loc = f.location as { latitude: number; longitude: number };
            const key = `${loc.latitude.toFixed(4)},${loc.longitude.toFixed(4)}`;
            if (!acc[key]) acc[key] = { count: 0, categories: {} };
            acc[key].count++;
            acc[key].categories[f.category] = (acc[key].categories[f.category] || 0) + 1;
            return acc;
          }, {}),
          responseTimeTrend: responseTimeTrend.map(f => ({
            date: f.createdAt,
            responseTime: (f.updatedAt.getTime() - f.createdAt.getTime()) / (1000 * 60 * 60) // hours
          }))
        },
        dateRange: {
          startDate: startDate ? new Date(startDate) : null,
          endDate: endDate ? new Date(endDate) : null
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error('Get feedback summary error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
});

export default router; 