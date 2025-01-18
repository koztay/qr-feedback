import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../index';
import { authenticateToken, requireRole, requireMunicipalityAccess } from '../middleware/auth';

const router = Router();

// Validation schema for date range
const dateRangeSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional()
}).optional();

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
      console.log('Fetching statistics for municipality:', id);
      console.log('Query params:', req.query);
      
      const parsedQuery = dateRangeSchema.safeParse(req.query);
      if (!parsedQuery.success) {
        console.error('Validation error:', parsedQuery.error);
        return res.status(400).json({ error: parsedQuery.error.errors });
      }

      const data = parsedQuery.data || {};
      const startDate = data.startDate;
      const endDate = data.endDate;

      const whereClause: any = {
        municipalityId: id
      };

      if (startDate || endDate) {
        whereClause.createdAt = {};
        if (startDate) whereClause.createdAt.gte = new Date(startDate);
        if (endDate) whereClause.createdAt.lte = new Date(endDate);
      }

      console.log('Using where clause:', whereClause);

      // Get total feedback count
      const totalFeedback = await prisma.feedback.count({
        where: whereClause
      });

      // Get open issues (PENDING and IN_PROGRESS)
      const openIssues = await prisma.feedback.count({
        where: {
          ...whereClause,
          status: {
            in: ['PENDING', 'IN_PROGRESS']
          }
        }
      });

      // Get resolved issues
      const resolvedIssues = await prisma.feedback.count({
        where: {
          ...whereClause,
          status: 'RESOLVED'
        }
      });

      // Get feedback by status
      const feedbackByStatus = await prisma.feedback.findMany({
        where: whereClause,
        select: {
          status: true,
        }
      });

      // Get feedback by category
      const feedbackByCategory = await prisma.feedback.findMany({
        where: whereClause,
        select: {
          category: true,
        }
      });

      // Calculate average resolution time
      const resolvedFeedback = await prisma.feedback.findMany({
        where: {
          ...whereClause,
          status: 'RESOLVED'
        },
        select: {
          createdAt: true,
          updatedAt: true
        }
      });

      const averageResolutionTime = resolvedFeedback.length === 0 ? 0 :
        resolvedFeedback.reduce((sum, f) => 
          sum + (f.updatedAt.getTime() - f.createdAt.getTime()), 0) / 
        resolvedFeedback.length / (1000 * 60 * 60 * 24); // Convert to days

      // Count status occurrences
      const statusCounts = feedbackByStatus.reduce((acc: Record<string, number>, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1;
        return acc;
      }, {});

      // Count category occurrences
      const categoryCounts = feedbackByCategory.reduce((acc: Record<string, number>, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
      }, {});

      console.log('Statistics results:', {
        totalFeedback,
        openIssues,
        resolvedIssues,
        statusCounts,
        categoryCounts,
        averageResolutionTime
      });

      res.json({
        totalFeedback,
        openIssues,
        resolvedIssues,
        statusDistribution: statusCounts,
        feedbackByCategory: categoryCounts,
        averageResolutionTime: Math.round(averageResolutionTime)
      });
    } catch (error) {
      console.error('Error fetching statistics:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
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
          _count: {
            _all: 'desc'
          }
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