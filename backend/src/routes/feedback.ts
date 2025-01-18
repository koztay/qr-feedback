import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../index';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// Validation schemas
const createFeedbackSchema = z.object({
  description: z.string().min(1),
  category: z.enum(['INFRASTRUCTURE', 'SAFETY', 'CLEANLINESS', 'OTHER']),
  location: z.object({
    latitude: z.number(),
    longitude: z.number()
  }),
  address: z.string(),
  municipalityId: z.string().uuid(),
  images: z.array(z.string().url()).optional()
});

const commentSchema = z.object({
  comment: z.string().min(1)
});

// Create feedback
router.post('/', authenticateToken, async (req, res) => {
  try {
    const validatedData = createFeedbackSchema.parse(req.body);

    const feedback = await prisma.feedback.create({
      data: {
        ...validatedData,
        userId: req.user.id,
        status: 'PENDING'
      },
      include: {
        user: {
          select: {
            id: true,
            email: true
          }
        },
        municipality: true
      }
    });

    res.status(201).json(feedback);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Create feedback error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get feedback list with pagination and filters
router.get('/', authenticateToken, async (req, res) => {
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

    // Regular users can only see their own feedback
    if (req.user.role === 'USER') {
      where.userId = req.user.id;
    }

    const [feedback, total] = await Promise.all([
      prisma.feedback.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              email: true
            }
          },
          municipality: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.feedback.count({ where })
    ]);

    res.json({
      data: feedback,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit
      }
    });
  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single feedback
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const feedback = await prisma.feedback.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        },
        municipality: true,
        comments: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    // Check if user has access to this feedback
    if (req.user.role === 'USER' && feedback.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(feedback);
  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add comment to feedback
router.post('/:id/comments', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = commentSchema.parse(req.body);

    const feedback = await prisma.feedback.findUnique({
      where: { id },
      select: { municipalityId: true }
    });

    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    const feedbackComment = await prisma.feedbackComment.create({
      data: {
        feedbackId: id,
        userId: req.user.id,
        comment
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    });

    res.status(201).json(feedbackComment);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Create comment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get feedback comments
router.get('/:id/comments', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const feedback = await prisma.feedback.findUnique({
      where: { id },
      select: { id: true }
    });

    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    const [comments, total] = await Promise.all([
      prisma.feedbackComment.findMany({
        where: { feedbackId: id },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.feedbackComment.count({
        where: { feedbackId: id }
      })
    ]);

    res.json({
      data: comments,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit
      }
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update feedback status (admin and municipality admin)
router.patch('/:id/status', authenticateToken, requireRole(['ADMIN', 'MUNICIPALITY_ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // For municipality admin, check if they have access to this feedback
    if (req.user.role === 'MUNICIPALITY_ADMIN') {
      const feedback = await prisma.feedback.findUnique({
        where: { id },
        select: { municipalityId: true }
      });

      if (!feedback || feedback.municipalityId !== req.user.municipalityId) {
        return res.status(403).json({ error: 'Access denied to this feedback' });
      }
    }

    // If status is being set to RESOLVED, set resolvedAt timestamp
    const updateData: any = { status };
    if (status === 'RESOLVED') {
      updateData.resolvedAt = new Date();
    } else {
      // If changing from RESOLVED to another status, clear resolvedAt
      updateData.resolvedAt = null;
    }

    const feedback = await prisma.feedback.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            email: true
          }
        },
        municipality: true
      }
    });

    res.json(feedback);
  } catch (error) {
    console.error('Update feedback status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Upload feedback images
router.post('/:id/images', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { images } = req.body;

    if (!Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ error: 'Images array is required' });
    }

    const feedback = await prisma.feedback.findUnique({
      where: { id },
      select: { userId: true }
    });

    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    // Only allow the feedback creator to add images
    if (feedback.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updatedFeedback = await prisma.feedback.update({
      where: { id },
      data: {
        images: {
          push: images
        }
      }
    });

    res.json(updatedFeedback);
  } catch (error) {
    console.error('Upload images error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update feedback
router.patch('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { category } = req.body;

    if (!['INFRASTRUCTURE', 'SAFETY', 'CLEANLINESS', 'OTHER'].includes(category)) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    const feedback = await prisma.feedback.update({
      where: { id },
      data: { category },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        },
        municipality: true,
        comments: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    res.json(feedback);
  } catch (error) {
    console.error('Update feedback error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 