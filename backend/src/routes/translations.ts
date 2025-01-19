import { Router } from 'express';
import type { Request, Response, RequestHandler } from 'express';
import { prisma } from '../index';
import { authenticateToken, requireRole } from '../middleware/auth';
import { z } from 'zod';
import { UserRole } from '@prisma/client';

const router = Router();

// Get all translations
const getAllTranslations: RequestHandler = async (req, res) => {
  try {
    const translations = await prisma.translation.findMany();
    res.json(translations);
  } catch (error) {
    console.error('Error fetching translations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Initialize default translations
export const defaultTranslations = [
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
      EN: 'Avg. Resolution Time'
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
    key: 'status_distribution',
    category: 'dashboard',
    translations: {
      TR: 'Durum Dağılımı',
      EN: 'Status Distribution'
    }
  },
  {
    key: 'no_categories_available',
    category: 'dashboard',
    translations: {
      TR: 'Kategori verisi bulunmamaktadır',
      EN: 'No feedback categories available'
    }
  },
  {
    key: 'no_status_data',
    category: 'dashboard',
    translations: {
      TR: 'Durum verisi bulunmamaktadır',
      EN: 'No status data available'
    }
  },
  {
    key: 'please_select_municipality',
    category: 'dashboard',
    translations: {
      TR: 'Lütfen panel görüntülemek için bir belediye seçin',
      EN: 'Please select a municipality to view its dashboard'
    }
  },
  {
    key: 'failed_to_load_dashboard_data',
    category: 'dashboard',
    translations: {
      TR: 'Panel verisi yüklenirken hata oluştu',
      EN: 'Failed to load dashboard data'
    }
  },
  // Common
  {
    key: 'app_name',
    category: 'common',
    translations: {
      TR: 'QR Geri Bildirim',
      EN: 'QR Feedback'
    }
  },
  {
    key: 'logout',
    category: 'common',
    translations: {
      TR: 'Çıkış',
      EN: 'Logout'
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
    key: 'not_available',
    category: 'common',
    translations: {
      TR: 'Mevcut değil',
      EN: 'N/A'
    }
  },

  // Navigation
  {
    key: 'feedback',
    category: 'navigation',
    translations: {
      TR: 'Geri Bildirimler',
      EN: 'Feedback'
    }
  },
  {
    key: 'municipalities',
    category: 'navigation',
    translations: {
      TR: 'Belediyeler',
      EN: 'Municipalities'
    }
  },
  {
    key: 'users',
    category: 'navigation',
    translations: {
      TR: 'Kullanıcılar',
      EN: 'Users'
    }
  },
  {
    key: 'translations',
    category: 'navigation',
    translations: {
      TR: 'Çeviriler',
      EN: 'Translations'
    }
  },

  // Translations Management
  {
    key: 'key',
    category: 'translations',
    translations: {
      TR: 'Anahtar',
      EN: 'Key'
    }
  },
  {
    key: 'category',
    category: 'translations',
    translations: {
      TR: 'Kategori',
      EN: 'Category'
    }
  },
  {
    key: 'turkish',
    category: 'translations',
    translations: {
      TR: 'Türkçe',
      EN: 'Turkish'
    }
  },
  {
    key: 'english',
    category: 'translations',
    translations: {
      TR: 'İngilizce',
      EN: 'English'
    }
  },
  {
    key: 'actions',
    category: 'translations',
    translations: {
      TR: 'İşlemler',
      EN: 'Actions'
    }
  },
  {
    key: 'add_translation',
    category: 'translations',
    translations: {
      TR: 'Çeviri Ekle',
      EN: 'Add Translation'
    }
  },
  {
    key: 'new_category',
    category: 'translations',
    translations: {
      TR: 'Yeni Kategori',
      EN: 'New Category'
    }
  },
  {
    key: 'new_category_name',
    category: 'translations',
    translations: {
      TR: 'Yeni Kategori Adı',
      EN: 'New Category Name'
    }
  },
  {
    key: 'search_translations',
    category: 'translations',
    translations: {
      TR: 'Çevirileri ara...',
      EN: 'Search translations...'
    }
  },
  {
    key: 'show_missing_only',
    category: 'translations',
    translations: {
      TR: 'Sadece eksik çevirileri göster',
      EN: 'Show missing translations only'
    }
  },
  {
    key: 'all_categories',
    category: 'translations',
    translations: {
      TR: 'Tüm Kategoriler',
      EN: 'All Categories'
    }
  },
  {
    key: 'translation_required',
    category: 'translations',
    translations: {
      TR: 'Bu çeviri gereklidir',
      EN: 'This translation is required'
    }
  },
  {
    key: 'error_loading_translations',
    category: 'translations',
    translations: {
      TR: 'Çeviriler yüklenirken hata oluştu',
      EN: 'Error loading translations'
    }
  },
  {
    key: 'access_denied',
    category: 'common',
    translations: {
      TR: 'Erişim reddedildi',
      EN: 'Access denied'
    }
  },

  // Common Actions
  {
    key: 'save',
    category: 'common',
    translations: {
      TR: 'Kaydet',
      EN: 'Save'
    }
  },
  {
    key: 'cancel',
    category: 'common',
    translations: {
      TR: 'İptal',
      EN: 'Cancel'
    }
  },
  {
    key: 'edit',
    category: 'common',
    translations: {
      TR: 'Düzenle',
      EN: 'Edit'
    }
  },
  {
    key: 'add',
    category: 'common',
    translations: {
      TR: 'Ekle',
      EN: 'Add'
    }
  },

  // Feedback Management
  {
    key: 'feedback_management',
    category: 'feedback',
    translations: {
      TR: 'Geri Bildirim Yönetimi',
      EN: 'Feedback Management'
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
    key: 'submitted_by',
    category: 'feedback',
    translations: {
      TR: 'Gönderen',
      EN: 'Submitted By'
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
    key: 'actions',
    category: 'feedback',
    translations: {
      TR: 'İşlemler',
      EN: 'Actions'
    }
  },
  {
    key: 'view_details',
    category: 'feedback',
    translations: {
      TR: 'Detayları Gör',
      EN: 'View Details'
    }
  },
  {
    key: 'municipality_suffix',
    category: 'feedback',
    translations: {
      TR: 'Belediyesi',
      EN: 'Municipality'
    }
  },
  // Dashboard Additional
  {
    key: 'days_suffix',
    category: 'dashboard',
    translations: {
      TR: 'gün',
      EN: 'days'
    }
  },
  {
    key: 'feedback_details',
    category: 'feedback',
    translations: {
      TR: 'Geri Bildirim Detayları',
      EN: 'Feedback Details'
    }
  },
  {
    key: 'comments',
    category: 'feedback',
    translations: {
      TR: 'Yorumlar',
      EN: 'Comments'
    }
  },
  {
    key: 'add_comment',
    category: 'feedback',
    translations: {
      TR: 'Yorum Ekle',
      EN: 'Add Comment'
    }
  },
  {
    key: 'no_comments',
    category: 'feedback',
    translations: {
      TR: 'Henüz yorum yok',
      EN: 'No comments yet'
    }
  },
  {
    key: 'update_status',
    category: 'feedback',
    translations: {
      TR: 'Durumu Güncelle',
      EN: 'Update Status'
    }
  },
  {
    key: 'update_category',
    category: 'feedback',
    translations: {
      TR: 'Kategoriyi Güncelle',
      EN: 'Update Category'
    }
  },
  // Dashboard translations
  {
    key: 'dashboard',
    category: 'dashboard',
    translations: {
      TR: 'Gösterge Paneli',
      EN: 'Dashboard'
    }
  },
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
  {
    key: 'resolved_issues',
    category: 'dashboard',
    translations: {
      TR: 'Çözülen Konular',
      EN: 'Resolved Issues'
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
    key: 'no_status_data',
    category: 'dashboard',
    translations: {
      TR: 'Durum verisi mevcut değil',
      EN: 'No status data available'
    }
  },
  // Feedback Management Additional Translations
  {
    key: 'images',
    category: 'feedback',
    translations: {
      TR: 'Görseller',
      EN: 'Images'
    }
  },
  {
    key: 'image_alt',
    category: 'feedback',
    translations: {
      TR: 'Geri bildirim görseli',
      EN: 'Feedback image'
    }
  },
  {
    key: 'comment_date_format',
    category: 'feedback',
    translations: {
      TR: 'Yorum tarihi',
      EN: 'Comment date'
    }
  },
  {
    key: 'comment_by',
    category: 'feedback',
    translations: {
      TR: 'Yorum yapan',
      EN: 'Commented by'
    }
  },
  {
    key: 'status_updated',
    category: 'feedback',
    translations: {
      TR: 'Durum güncellendi',
      EN: 'Status updated'
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
    key: 'comment_added',
    category: 'feedback',
    translations: {
      TR: 'Yorum eklendi',
      EN: 'Comment added'
    }
  },
  {
    key: 'error_updating_status',
    category: 'feedback',
    translations: {
      TR: 'Durum güncellenirken hata oluştu',
      EN: 'Error updating status'
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
    key: 'error_adding_comment',
    category: 'feedback',
    translations: {
      TR: 'Yorum eklenirken hata oluştu',
      EN: 'Error adding comment'
    }
  },
  {
    key: 'error_loading_feedback',
    category: 'feedback',
    translations: {
      TR: 'Geri bildirimler yüklenirken hata oluştu',
      EN: 'Error loading feedback'
    }
  },
  {
    key: 'no_permission',
    category: 'feedback',
    translations: {
      TR: 'Bu geri bildirimi güncelleme yetkiniz yok',
      EN: 'You do not have permission to update this feedback'
    }
  },
  {
    key: 'close_dialog',
    category: 'feedback',
    translations: {
      TR: 'Kapat',
      EN: 'Close'
    }
  },
  {
    key: 'status_to',
    category: 'feedback',
    translations: {
      TR: 'durumuna',
      EN: 'to'
    }
  },
  {
    key: 'category_to',
    category: 'feedback',
    translations: {
      TR: 'kategorisine',
      EN: 'to'
    }
  },
  {
    key: 'loading',
    category: 'common',
    translations: {
      TR: 'Yükleniyor...',
      EN: 'Loading...'
    }
  },
  // Municipalities Management
  {
    key: 'municipalities_management',
    category: 'municipalities',
    translations: {
      TR: 'Belediye Yönetimi',
      EN: 'Municipalities Management'
    }
  },
  {
    key: 'add_municipality',
    category: 'municipalities',
    translations: {
      TR: 'Belediye Ekle',
      EN: 'Add Municipality'
    }
  },
  {
    key: 'edit_municipality',
    category: 'municipalities',
    translations: {
      TR: 'Belediye Düzenle',
      EN: 'Edit Municipality'
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
    key: 'qr_code_count',
    category: 'municipalities',
    translations: {
      TR: 'QR Kod Sayısı',
      EN: 'QR Code Count'
    }
  },
  {
    key: 'error_loading_municipalities',
    category: 'municipalities',
    translations: {
      TR: 'Belediyeler yüklenirken hata oluştu',
      EN: 'Error loading municipalities'
    }
  },
  {
    key: 'error_adding_municipality',
    category: 'municipalities',
    translations: {
      TR: 'Belediye eklenirken hata oluştu',
      EN: 'Error adding municipality'
    }
  },
  {
    key: 'error_updating_municipality',
    category: 'municipalities',
    translations: {
      TR: 'Belediye güncellenirken hata oluştu',
      EN: 'Error updating municipality'
    }
  },
  {
    key: 'municipality_added',
    category: 'municipalities',
    translations: {
      TR: 'Belediye başarıyla eklendi',
      EN: 'Municipality added successfully'
    }
  },
  {
    key: 'municipality_updated',
    category: 'municipalities',
    translations: {
      TR: 'Belediye başarıyla güncellendi',
      EN: 'Municipality updated successfully'
    }
  },

  // Users Management
  {
    key: 'users_management',
    category: 'users',
    translations: {
      TR: 'Kullanıcı Yönetimi',
      EN: 'Users Management'
    }
  },
  {
    key: 'add_user',
    category: 'users',
    translations: {
      TR: 'Kullanıcı Ekle',
      EN: 'Add User'
    }
  },
  {
    key: 'edit_user',
    category: 'users',
    translations: {
      TR: 'Kullanıcı Düzenle',
      EN: 'Edit User'
    }
  },
  {
    key: 'name',
    category: 'users',
    translations: {
      TR: 'Ad Soyad',
      EN: 'Full Name'
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
    key: 'role',
    category: 'users',
    translations: {
      TR: 'Rol',
      EN: 'Role'
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
  {
    key: 'confirm_password',
    category: 'users',
    translations: {
      TR: 'Şifre Tekrar',
      EN: 'Confirm Password'
    }
  },
  {
    key: 'select_municipality',
    category: 'users',
    translations: {
      TR: 'Belediye Seç',
      EN: 'Select Municipality'
    }
  },
  {
    key: 'error_loading_users',
    category: 'users',
    translations: {
      TR: 'Kullanıcılar yüklenirken hata oluştu',
      EN: 'Error loading users'
    }
  },
  {
    key: 'error_adding_user',
    category: 'users',
    translations: {
      TR: 'Kullanıcı eklenirken hata oluştu',
      EN: 'Error adding user'
    }
  },
  {
    key: 'error_updating_user',
    category: 'users',
    translations: {
      TR: 'Kullanıcı güncellenirken hata oluştu',
      EN: 'Error updating user'
    }
  },
  {
    key: 'user_added',
    category: 'users',
    translations: {
      TR: 'Kullanıcı başarıyla eklendi',
      EN: 'User added successfully'
    }
  },
  {
    key: 'user_updated',
    category: 'users',
    translations: {
      TR: 'Kullanıcı başarıyla güncellendi',
      EN: 'User updated successfully'
    }
  },
  {
    key: 'passwords_dont_match',
    category: 'users',
    translations: {
      TR: 'Şifreler eşleşmiyor',
      EN: 'Passwords do not match'
    }
  },

  // User Roles
  {
    key: 'ADMIN',
    category: 'user_roles',
    translations: {
      TR: 'Yönetici',
      EN: 'Admin'
    }
  },
  {
    key: 'MUNICIPALITY_ADMIN',
    category: 'user_roles',
    translations: {
      TR: 'Belediye Yöneticisi',
      EN: 'Municipality Admin'
    }
  },
  {
    key: 'USER',
    category: 'user_roles',
    translations: {
      TR: 'Kullanıcı',
      EN: 'User'
    }
  },

  // Form Actions
  {
    key: 'submit',
    category: 'common',
    translations: {
      TR: 'Gönder',
      EN: 'Submit'
    }
  },
  {
    key: 'delete',
    category: 'common',
    translations: {
      TR: 'Sil',
      EN: 'Delete'
    }
  },
  {
    key: 'confirm_delete',
    category: 'common',
    translations: {
      TR: 'Silmeyi Onayla',
      EN: 'Confirm Delete'
    }
  },
  {
    key: 'delete_confirmation',
    category: 'common',
    translations: {
      TR: 'Bu işlemi geri alamazsınız. Devam etmek istediğinize emin misiniz?',
      EN: 'This action cannot be undone. Are you sure you want to continue?'
    }
  },
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
  },
  // Login Page
  {
    key: 'login',
    category: 'common',
    translations: {
      TR: 'Giriş',
      EN: 'Login'
    }
  },
  {
    key: 'sign_in',
    category: 'common',
    translations: {
      TR: 'Giriş Yap',
      EN: 'Sign In'
    }
  },
  {
    key: 'signing_in',
    category: 'common',
    translations: {
      TR: 'Giriş yapılıyor...',
      EN: 'Signing in...'
    }
  },
  {
    key: 'invalid_credentials',
    category: 'common',
    translations: {
      TR: 'Geçersiz e-posta veya şifre',
      EN: 'Invalid email or password'
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
      TR: 'Panel',
      EN: 'Dashboard'
    }
  },
  {
    key: 'feedback',
    category: 'navigation',
    translations: {
      TR: 'Geri Bildirimler',
      EN: 'Feedback'
    }
  },
  {
    key: 'municipalities',
    category: 'navigation',
    translations: {
      TR: 'Belediyeler',
      EN: 'Municipalities'
    }
  },
  {
    key: 'users',
    category: 'navigation',
    translations: {
      TR: 'Kullanıcılar',
      EN: 'Users'
    }
  },
  {
    key: 'translations',
    category: 'navigation',
    translations: {
      TR: 'Çeviriler',
      EN: 'Translations'
    }
  }
];

// Seed translations if they don't exist
const seedTranslations: RequestHandler = async (req, res) => {
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
    res.json({ message: 'Translations seeded successfully' });
  } catch (error) {
    console.error('Error seeding translations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Validation schemas
const translationSchema = z.object({
  key: z.string().min(1),
  category: z.string().min(1),
  translations: z.record(z.string(), z.string())
});

// Add new translation
const createTranslation: RequestHandler = async (req, res) => {
  try {
    const validatedData = translationSchema.parse(req.body);
    
    const translation = await prisma.translation.create({
      data: validatedData
    });

    res.status(201).json(translation);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Error creating translation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update translation
const updateTranslation: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = translationSchema.partial().parse(req.body);

    const translation = await prisma.translation.update({
      where: { id },
      data: validatedData
    });

    res.json(translation);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Error updating translation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete translation
const deleteTranslation: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.translation.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting translation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Routes
router.get('/', authenticateToken, getAllTranslations);
router.post('/seed', authenticateToken, requireRole(['ADMIN']), seedTranslations);
router.post('/', authenticateToken, requireRole(['ADMIN']), createTranslation);
router.patch('/:id', authenticateToken, requireRole(['ADMIN']), updateTranslation);
router.delete('/:id', authenticateToken, requireRole(['ADMIN']), deleteTranslation);

export default router; 