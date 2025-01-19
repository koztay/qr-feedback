const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const defaultTranslations = [
  // Feedback Status
  {
    key: 'PENDING',
    category: 'feedback_status',
    translations: {
      TR: 'Beklemede',
      EN: 'Pending'
    }
  },
  {
    key: 'IN_PROGRESS',
    category: 'feedback_status',
    translations: {
      TR: 'İşleniyor',
      EN: 'In Progress'
    }
  },
  {
    key: 'RESOLVED',
    category: 'feedback_status',
    translations: {
      TR: 'Çözüldü',
      EN: 'Resolved'
    }
  },
  // Add more translations here...
  {
    key: 'language',
    category: 'users',
    translations: {
      TR: 'Dil',
      EN: 'Language'
    }
  },
  {
    key: 'language_required',
    category: 'users',
    translations: {
      TR: 'Dil seçimi zorunludur',
      EN: 'Language selection is required'
    }
  },
  {
    key: 'language_updated',
    category: 'users',
    translations: {
      TR: 'Dil tercihi güncellendi',
      EN: 'Language preference updated'
    }
  }
];

async function seedTranslations() {
  try {
    for (const translation of defaultTranslations) {
      await prisma.translation.upsert({
        where: {
          key_category: {
            key: translation.key,
            category: translation.category
          }
        },
        update: { translations: translation.translations },
        create: translation
      });
    }
    console.log('Translations seeded successfully');
  } catch (error) {
    console.error('Error seeding translations:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedTranslations(); 