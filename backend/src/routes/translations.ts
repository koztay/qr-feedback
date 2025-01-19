import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get all translations
router.get('/', async (req: Request, res: Response) => {
  try {
    const translations = await prisma.translation.findMany({
      orderBy: [
        { category: 'asc' },
        { key: 'asc' },
      ],
    });

    res.json({ data: translations });
  } catch (error) {
    console.error('Error fetching translations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get translations by language
router.get('/:language', async (req: Request, res: Response) => {
  try {
    const { language } = req.params;
    const translations = await prisma.translation.findMany({
      orderBy: [
        { category: 'asc' },
        { key: 'asc' },
      ],
    });

    // Transform translations into a nested object structure
    const transformedTranslations = translations.reduce((acc, translation) => {
      if (!acc[translation.category]) {
        acc[translation.category] = {};
      }
      acc[translation.category][translation.key] = translation.translations[language as keyof typeof translation.translations];
      return acc;
    }, {} as Record<string, Record<string, string>>);

    res.json(transformedTranslations);
  } catch (error) {
    console.error('Error fetching translations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create or update translation
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { key, category, translations } = req.body;

    const translation = await prisma.translation.upsert({
      where: {
        key_category: {
          key,
          category,
        },
      },
      update: {
        translations,
      },
      create: {
        key,
        category,
        translations,
      },
    });

    res.status(201).json(translation);
  } catch (error) {
    console.error('Error creating/updating translation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete translation
router.delete('/:key/:category', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { key, category } = req.params;
    await prisma.translation.delete({
      where: {
        key_category: {
          key,
          category,
        },
      },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting translation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 