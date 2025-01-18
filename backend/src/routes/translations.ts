import { Router } from 'express';
import { prisma } from '../index';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Get all translations
router.get('/', authenticateToken, async (req, res) => {
  try {
    const translations = await prisma.translation.findMany();
    res.json(translations);
  } catch (error) {
    console.error('Error fetching translations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Initialize default translations
const defaultTranslations = [
  // Feedback Status
  {
    key: 'PENDING',
    category: 'feedback_status',
    tr: 'Beklemede',
    en: 'Pending'
  },
  {
    key: 'IN_PROGRESS',
    category: 'feedback_status',
    tr: 'İşleniyor',
    en: 'In Progress'
  },
  {
    key: 'RESOLVED',
    category: 'feedback_status',
    tr: 'Çözüldü',
    en: 'Resolved'
  },
  {
    key: 'REJECTED',
    category: 'feedback_status',
    tr: 'Reddedildi',
    en: 'Rejected'
  },
  // Feedback Categories
  {
    key: 'INFRASTRUCTURE',
    category: 'feedback_category',
    tr: 'Altyapı',
    en: 'Infrastructure'
  },
  {
    key: 'SAFETY',
    category: 'feedback_category',
    tr: 'Güvenlik',
    en: 'Safety'
  },
  {
    key: 'CLEANLINESS',
    category: 'feedback_category',
    tr: 'Temizlik',
    en: 'Cleanliness'
  },
  {
    key: 'OTHER',
    category: 'feedback_category',
    tr: 'Diğer',
    en: 'Other'
  },
  // Common UI Elements
  {
    key: 'total_feedback',
    category: 'dashboard',
    tr: 'Toplam Geri Bildirim',
    en: 'Total Feedback'
  },
  {
    key: 'open_issues',
    category: 'dashboard',
    tr: 'Açık Konular',
    en: 'Open Issues'
  },
  {
    key: 'resolved_issues',
    category: 'dashboard',
    tr: 'Çözülen Konular',
    en: 'Resolved Issues'
  },
  {
    key: 'avg_resolution_time',
    category: 'dashboard',
    tr: 'Ortalama Çözüm Süresi',
    en: 'Avg. Resolution Time'
  }
];

// Seed translations if they don't exist
router.post('/seed', authenticateToken, async (req, res) => {
  try {
    for (const translation of defaultTranslations) {
      await prisma.translation.upsert({
        where: {
          key_category: {
            key: translation.key,
            category: translation.category
          }
        },
        update: translation,
        create: translation
      });
    }
    res.json({ message: 'Translations seeded successfully' });
  } catch (error) {
    console.error('Error seeding translations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 