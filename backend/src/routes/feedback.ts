import { Router } from 'express';
import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get all feedback
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const feedback = await prisma.feedback.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        municipality: {
          select: {
            id: true,
            name: true,
            city: true,
          },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                role: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({ data: feedback });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get feedback by ID
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const feedback = await prisma.feedback.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        municipality: {
          select: {
            id: true,
            name: true,
            city: true,
          },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    res.json(feedback);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create feedback
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const feedback = await prisma.feedback.create({
      data: {
        ...req.body,
        userId: req.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        municipality: {
          select: {
            id: true,
            name: true,
            city: true,
          },
        },
      },
    });

    res.status(201).json(feedback);
  } catch (error) {
    console.error('Error creating feedback:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update feedback
router.put('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, ...otherData } = req.body;

    // If status is being updated to RESOLVED, set resolvedAt
    const updateData = {
      ...otherData,
      status,
      ...(status === 'RESOLVED' ? { resolvedAt: new Date() } : {}),
      ...(status !== 'RESOLVED' ? { resolvedAt: null } : {}),
    };

    const feedback = await prisma.feedback.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        municipality: {
          select: {
            id: true,
            name: true,
            city: true,
          },
        },
      },
    });

    res.json(feedback);
  } catch (error) {
    console.error('Error updating feedback:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete feedback
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.feedback.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting feedback:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add comment to feedback
router.post('/:id/comments', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;

    const feedback = await prisma.feedback.findUnique({
      where: { id },
      include: { municipality: true }
    });

    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    // Create the comment
    const newComment = await prisma.feedbackComment.create({
      data: {
        comment,
        feedbackId: id,
        userId: req.user.id
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true
          }
        }
      }
    });

    res.status(201).json(newComment);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 