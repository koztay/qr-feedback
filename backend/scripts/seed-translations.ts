import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Default translations
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
  {
    key: 'REJECTED',
    category: 'feedback_status',
    translations: {
      TR: 'Reddedildi',
      EN: 'Rejected'
    }
  },
  // Feedback Categories
  {
    key: 'INFRASTRUCTURE',
    category: 'feedback_category',
    translations: {
      TR: 'Altyapı',
      EN: 'Infrastructure'
    }
  },
  {
    key: 'SAFETY',
    category: 'feedback_category',
    translations: {
      TR: 'Güvenlik',
      EN: 'Safety'
    }
  },
  {
    key: 'CLEANLINESS',
    category: 'feedback_category',
    translations: {
      TR: 'Temizlik',
      EN: 'Cleanliness'
    }
  },
  {
    key: 'OTHER',
    category: 'feedback_category',
    translations: {
      TR: 'Diğer',
      EN: 'Other'
    }
  },
  // Common UI Elements
  {
    key: 'total_feedback',
    category: 'dashboard',
    translations: {
      TR: 'Toplam Geri Bildirim',
      EN: 'Total Feedback'
    }
  },
  {
    key: 'open_issues',
    category: 'dashboard',
    translations: {
      TR: 'Açık Konular',
      EN: 'Open Issues'
    }
  },
  // Authentication
  {
    key: 'sign_in',
    category: 'common',
    translations: {
      TR: 'Giriş Yap',
      EN: 'Sign In'
    }
  },
  {
    key: 'login',
    category: 'common',
    translations: {
      TR: 'Giriş',
      EN: 'Login'
    }
  },
  {
    key: 'email',
    category: 'users',
    translations: {
      TR: 'E-posta',
      EN: 'Email'
    }
  },
  {
    key: 'password',
    category: 'users',
    translations: {
      TR: 'Şifre',
      EN: 'Password'
    }
  },
  // Navigation Menu Items
  {
    key: 'dashboard',
    category: 'navigation',
    translations: {
      TR: 'PANEL',
      EN: 'DASHBOARD'
    }
  },
  {
    key: 'feedback',
    category: 'navigation',
    translations: {
      TR: 'GERİ BİLDİRİMLER',
      EN: 'FEEDBACK'
    }
  },
  {
    key: 'municipalities',
    category: 'navigation',
    translations: {
      TR: 'BELEDİYELER',
      EN: 'MUNICIPALITIES'
    }
  },
  {
    key: 'users',
    category: 'navigation',
    translations: {
      TR: 'KULLANICILAR',
      EN: 'USERS'
    }
  },
  {
    key: 'translations',
    category: 'navigation',
    translations: {
      TR: 'ÇEVİRİLER',
      EN: 'TRANSLATIONS'
    }
  },
  // Common Actions
  {
    key: 'logout',
    category: 'common',
    translations: {
      TR: 'ÇIKIŞ YAP',
      EN: 'LOGOUT'
    }
  },
  {
    key: 'app_name',
    category: 'common',
    translations: {
      TR: 'QR Geri Bildirim',
      EN: 'QR Feedback'
    }
  },
  {
    key: 'view_details',
    category: 'common',
    translations: {
      TR: 'DETAYLARI GÖR',
      EN: 'VIEW DETAILS'
    }
  },
  {
    key: 'actions',
    category: 'common',
    translations: {
      TR: 'İşlemler',
      EN: 'Actions'
    }
  },
  // Feedback Table Headers and Columns
  {
    key: 'submitted_by',
    category: 'feedback',
    translations: {
      TR: 'Gönderen',
      EN: 'Submitted By'
    }
  },
  {
    key: 'municipality',
    category: 'feedback',
    translations: {
      TR: 'Belediye',
      EN: 'Municipality'
    }
  },
  {
    key: 'category',
    category: 'feedback',
    translations: {
      TR: 'Kategori',
      EN: 'Category'
    }
  },
  {
    key: 'description',
    category: 'feedback',
    translations: {
      TR: 'Açıklama',
      EN: 'Description'
    }
  },
  {
    key: 'status',
    category: 'feedback',
    translations: {
      TR: 'Durum',
      EN: 'Status'
    }
  },
  {
    key: 'location',
    category: 'feedback',
    translations: {
      TR: 'Konum',
      EN: 'Location'
    }
  },
  {
    key: 'date',
    category: 'feedback',
    translations: {
      TR: 'Tarih',
      EN: 'Date'
    }
  },
  {
    key: 'feedback_management',
    category: 'feedback',
    translations: {
      TR: 'Geri Bildirim Yönetimi',
      EN: 'Feedback Management'
    }
  },
  {
    key: 'view_dashboard',
    category: 'common',
    translations: {
      TR: 'PANELE GİT',
      EN: 'VIEW DASHBOARD'
    }
  },
  {
    key: 'error_loading_stats',
    category: 'dashboard',
    translations: {
      TR: 'İstatistikler yüklenirken hata oluştu',
      EN: 'Error loading statistics'
    }
  },
  {
    key: 'resolved_issues',
    category: 'dashboard',
    translations: {
      TR: 'Çözülen Konular',
      EN: 'Resolved Issues'
    }
  },
  {
    key: 'avg_resolution_time',
    category: 'dashboard',
    translations: {
      TR: 'Ortalama Çözüm Süresi',
      EN: 'Average Resolution Time'
    }
  },
  {
    key: 'status_distribution',
    category: 'dashboard',
    translations: {
      TR: 'Durum Dağılımı',
      EN: 'Status Distribution'
    }
  },
  {
    key: 'feedback_by_category',
    category: 'dashboard',
    translations: {
      TR: 'Kategoriye Göre Geri Bildirimler',
      EN: 'Feedback by Category'
    }
  },
  {
    key: 'feedback_count',
    category: 'dashboard',
    translations: {
      TR: 'Geri Bildirim Sayısı',
      EN: 'Feedback Count'
    }
  },
  {
    key: 'days',
    category: 'common',
    translations: {
      TR: 'gün',
      EN: 'days'
    }
  },
  {
    key: 'welcome',
    category: 'common',
    translations: {
      TR: 'Hoş Geldiniz',
      EN: 'Welcome'
    }
  },
  {
    key: 'welcome_message',
    category: 'common',
    translations: {
      TR: 'QR Geri Bildirim sistemine hoş geldiniz. Sol menüden istediğiniz bölüme gidebilirsiniz.',
      EN: 'Welcome to QR Feedback system. You can navigate to any section using the left menu.'
    }
  },
  {
    key: 'no_data',
    category: 'common',
    translations: {
      TR: 'Veri bulunamadı',
      EN: 'No data available'
    }
  },
  {
    key: 'municipality_name',
    category: 'municipalities',
    translations: {
      TR: 'Belediye Adı',
      EN: 'Municipality Name'
    }
  },
  {
    key: 'city',
    category: 'municipalities',
    translations: {
      TR: 'Şehir',
      EN: 'City'
    }
  },
  {
    key: 'feedback_count',
    category: 'municipalities',
    translations: {
      TR: 'Geri Bildirim Sayısı',
      EN: 'Feedback Count'
    }
  },
  {
    key: 'edit',
    category: 'common',
    translations: {
      TR: 'DÜZENLE',
      EN: 'EDIT'
    }
  },
  {
    key: 'add_municipality',
    category: 'municipalities',
    translations: {
      TR: 'BELEDİYE EKLE',
      EN: 'ADD MUNICIPALITY'
    }
  },
  {
    key: 'municipality_management',
    category: 'municipalities',
    translations: {
      TR: 'Belediye Yönetimi',
      EN: 'Municipality Management'
    }
  },
  {
    key: 'status_update_success',
    category: 'feedback',
    translations: {
      TR: 'Durum başarıyla güncellendi',
      EN: 'Status updated successfully'
    }
  },
  {
    key: 'category_update_success',
    category: 'feedback',
    translations: {
      TR: 'Kategori başarıyla güncellendi',
      EN: 'Category updated successfully'
    }
  },
  {
    key: 'category_updated',
    category: 'feedback',
    translations: {
      TR: 'Kategori güncellendi',
      EN: 'Category updated'
    }
  },
  {
    key: 'category_to',
    category: 'feedback',
    translations: {
      TR: 'yeni kategori:',
      EN: 'to:'
    }
  },
  {
    key: 'error_updating_category',
    category: 'feedback',
    translations: {
      TR: 'Kategori güncellenirken hata oluştu',
      EN: 'Error updating category'
    }
  },
  {
    key: 'admin_dashboard',
    category: 'dashboard',
    translations: {
      TR: 'Yönetici Paneli',
      EN: 'Admin Dashboard'
    }
  },
  // User Management
  {
    key: 'municipality',
    category: 'users',
    translations: {
      TR: 'Belediye',
      EN: 'Municipality'
    }
  }
];

async function seedTranslations() {
  try {
    console.log('Starting to seed translations...');
    
    for (const translation of defaultTranslations) {
      await prisma.translation.upsert({
        where: {
          key_category: {
            key: translation.key,
            category: translation.category
          }
        },
        update: { translations: translation.translations },
        create: {
          key: translation.key,
          category: translation.category,
          translations: translation.translations
        }
      });
      console.log(`Upserted translation: ${translation.category}.${translation.key}`);
    }
    
    console.log('Translations seeded successfully');
  } catch (error) {
    console.error('Error seeding translations:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedTranslations(); 