import { Router } from 'express';
import { prisma } from '../index';
import { authenticateToken } from '../middleware/auth';
import bcrypt from 'bcrypt';
import { Request, Response } from 'express';

const router = Router();

// Update user
router.patch('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, password, role, municipalityId, language } = req.body;

    // Check if the user exists
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Only ADMIN can update other users
    if (req.user.role !== 'ADMIN' && req.user.id !== id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Prepare update data
    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (password) updateData.password = await bcrypt.hash(password, 10);
    if (language) updateData.language = language;

    // Only ADMIN can update role and municipalityId
    if (req.user.role === 'ADMIN') {
      if (role) updateData.role = role;
      if (municipalityId !== undefined) updateData.municipalityId = municipalityId;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        municipalityId: true,
        language: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 