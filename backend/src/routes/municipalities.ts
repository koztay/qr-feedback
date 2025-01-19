import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get all municipalities
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const municipalities = await prisma.municipality.findMany({
      include: {
        _count: {
          select: {
            users: true,
            feedback: true,
          },
        },
      },
    });

    res.json({ data: municipalities });
  } catch (error) {
    console.error('Error fetching municipalities:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get municipality by ID
router.get('/:id', authenticateToken, async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    const municipality = await prisma.municipality.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
            feedback: true,
          },
        },
      },
    });

    if (!municipality) {
      return res.status(404).json({ error: 'Municipality not found' });
    }

    res.json(municipality);
  } catch (error) {
    console.error('Error fetching municipality:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create municipality
router.post('/', authenticateToken, requireRole(['ADMIN']), async (req: express.Request, res: express.Response) => {
  try {
    const municipality = await prisma.municipality.create({
      data: req.body,
    });

    res.status(201).json(municipality);
  } catch (error) {
    console.error('Error creating municipality:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update municipality
router.put('/:id', authenticateToken, requireRole(['ADMIN']), async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    const municipality = await prisma.municipality.update({
      where: { id },
      data: req.body,
    });

    res.json(municipality);
  } catch (error) {
    console.error('Error updating municipality:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete municipality
router.delete('/:id', authenticateToken, requireRole(['ADMIN']), async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    await prisma.municipality.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting municipality:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get municipality statistics
router.get('/:id/statistics', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Get municipality details
    const municipality = await prisma.municipality.findUnique({
      where: { id },
      select: {
        name: true,
        city: true,
      },
    });

    if (!municipality) {
      return res.status(404).json({ error: 'Municipality not found' });
    }

    // Get total feedback count
    const totalFeedback = await prisma.feedback.count({
      where: { municipalityId: id },
    });

    // Get open issues count (PENDING + IN_PROGRESS)
    const openIssues = await prisma.feedback.count({
      where: {
        municipalityId: id,
        status: { in: ['PENDING', 'IN_PROGRESS'] },
      },
    });

    // Get resolved issues count
    const resolvedIssues = await prisma.feedback.count({
      where: {
        municipalityId: id,
        status: 'RESOLVED',
      },
    });

    // Get status distribution
    const statusDistribution = await prisma.feedback.groupBy({
      by: ['status'],
      where: { municipalityId: id },
      _count: true,
    });

    // Get feedback by category
    const feedbackByCategory = await prisma.feedback.groupBy({
      by: ['category'],
      where: { municipalityId: id },
      _count: true,
    });

    // Calculate average resolution time for resolved issues
    const resolvedFeedback = await prisma.feedback.findMany({
      where: {
        municipalityId: id,
        status: 'RESOLVED',
        resolvedAt: { not: null },
      },
      select: {
        createdAt: true,
        resolvedAt: true,
      },
    });

    let averageResolutionTime = 0;
    if (resolvedFeedback.length > 0) {
      const totalResolutionTime = resolvedFeedback.reduce((acc, feedback) => {
        const resolutionTime = feedback.resolvedAt!.getTime() - feedback.createdAt.getTime();
        return acc + resolutionTime;
      }, 0);
      averageResolutionTime = Math.round(totalResolutionTime / resolvedFeedback.length / (1000 * 60 * 60 * 24)); // Convert to days
    }

    // Format the response
    const formattedStatusDistribution = statusDistribution.reduce((acc, curr) => {
      acc[curr.status] = curr._count;
      return acc;
    }, {} as Record<string, number>);

    const formattedCategoryDistribution = feedbackByCategory.reduce((acc, curr) => {
      acc[curr.category] = curr._count;
      return acc;
    }, {} as Record<string, number>);

    res.json({
      municipality,
      totalFeedback,
      openIssues,
      resolvedIssues,
      averageResolutionTime,
      statusDistribution: formattedStatusDistribution,
      feedbackByCategory: formattedCategoryDistribution,
    });
  } catch (error) {
    console.error('Error fetching municipality statistics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 