import { PrismaClient, FeedbackCategory, FeedbackStatus, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create test municipalities
  const municipalities = await Promise.all([
    prisma.municipality.upsert({
      where: { id: '1' },
      update: {},
      create: {
        id: '1',
        name: 'Kadıköy Municipality',
        city: 'Istanbul',
        state: 'Marmara',
        country: 'Turkey',
        contactEmail: 'contact@kadikoy.bel.tr',
        contactPhone: '+90 216 542 50 00',
        subscriptionStatus: 'ACTIVE',
      },
    }),
    prisma.municipality.upsert({
      where: { id: '2' },
      update: {},
      create: {
        id: '2',
        name: 'Üsküdar Municipality',
        city: 'Istanbul',
        state: 'Marmara',
        country: 'Turkey',
        contactEmail: 'contact@uskudar.bel.tr',
        contactPhone: '+90 216 531 30 00',
        subscriptionStatus: 'ACTIVE',
      },
    }),
    prisma.municipality.upsert({
      where: { id: '3' },
      update: {},
      create: {
        id: '3',
        name: 'Beşiktaş Municipality',
        city: 'Istanbul',
        state: 'Marmara',
        country: 'Turkey',
        contactEmail: 'contact@besiktas.bel.tr',
        contactPhone: '+90 212 236 10 00',
        subscriptionStatus: 'PENDING',
      },
    }),
  ]);

  // Create different types of users
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const users = await Promise.all([
    // Admin user
    prisma.user.upsert({
      where: { email: 'admin@test.com' },
      update: { password: hashedPassword },
      create: {
        email: 'admin@test.com',
        password: hashedPassword,
        name: 'Admin User',
        role: 'ADMIN',
      },
    }),
    // Municipality admin users
    prisma.user.upsert({
      where: { email: 'kadikoy@admin.com' },
      update: { password: hashedPassword },
      create: {
        email: 'kadikoy@admin.com',
        password: hashedPassword,
        name: 'Kadıköy Admin',
        role: 'MUNICIPALITY_ADMIN',
        municipalityId: municipalities[0].id,
      },
    }),
    prisma.user.upsert({
      where: { email: 'uskudar@admin.com' },
      update: { password: hashedPassword },
      create: {
        email: 'uskudar@admin.com',
        password: hashedPassword,
        name: 'Üsküdar Admin',
        role: 'MUNICIPALITY_ADMIN',
        municipalityId: municipalities[1].id,
      },
    }),
    // Regular users
    prisma.user.upsert({
      where: { email: 'user1@test.com' },
      update: { password: hashedPassword },
      create: {
        email: 'user1@test.com',
        password: hashedPassword,
        name: 'Test User 1',
        role: 'USER',
      },
    }),
    prisma.user.upsert({
      where: { email: 'user2@test.com' },
      update: { password: hashedPassword },
      create: {
        email: 'user2@test.com',
        password: hashedPassword,
        name: 'Test User 2',
        role: 'USER',
      },
    }),
  ]);

  // Create feedback entries
  const feedbacks = await Promise.all([
    // Kadıköy feedbacks
    prisma.feedback.create({
      data: {
        description: 'Broken street light on Bahariye Avenue',
        category: 'INFRASTRUCTURE',
        location: { latitude: 40.9923, longitude: 29.0275 },
        address: 'Bahariye Caddesi, Kadıköy',
        images: ['streetlight1.jpg', 'streetlight2.jpg'],
        status: 'PENDING',
        userId: users[3].id, // user1
        municipalityId: municipalities[0].id,
      },
    }),
    prisma.feedback.create({
      data: {
        description: 'Garbage collection needed at Moda Park',
        category: 'CLEANLINESS',
        location: { latitude: 40.9850, longitude: 29.0261 },
        address: 'Moda Parkı, Kadıköy',
        images: ['garbage1.jpg'],
        status: 'IN_PROGRESS',
        userId: users[4].id, // user2
        municipalityId: municipalities[0].id,
      },
    }),
    // Üsküdar feedbacks
    prisma.feedback.create({
      data: {
        description: 'Damaged sidewalk near Üsküdar Square',
        category: 'INFRASTRUCTURE',
        location: { latitude: 41.0270, longitude: 29.0150 },
        address: 'Üsküdar Meydanı',
        images: ['sidewalk1.jpg', 'sidewalk2.jpg'],
        status: 'RESOLVED',
        userId: users[3].id, // user1
        municipalityId: municipalities[1].id,
      },
    }),
    prisma.feedback.create({
      data: {
        description: 'Street safety concern - insufficient lighting',
        category: 'SAFETY',
        location: { latitude: 41.0280, longitude: 29.0160 },
        address: 'Validebağ Caddesi, Üsküdar',
        images: ['safety1.jpg'],
        status: 'PENDING',
        userId: users[4].id, // user2
        municipalityId: municipalities[1].id,
      },
    }),
    // Beşiktaş feedbacks
    prisma.feedback.create({
      data: {
        description: 'Park maintenance needed',
        category: 'OTHER',
        location: { latitude: 41.0422, longitude: 29.0093 },
        address: 'Yıldız Parkı, Beşiktaş',
        images: ['park1.jpg'],
        status: 'REJECTED',
        userId: users[3].id, // user1
        municipalityId: municipalities[2].id,
      },
    }),
  ]);

  // Add some comments to feedbacks
  await Promise.all([
    prisma.feedbackComment.create({
      data: {
        comment: 'Maintenance team has been notified',
        feedbackId: feedbacks[0].id,
        userId: users[1].id, // Kadıköy admin
      },
    }),
    prisma.feedbackComment.create({
      data: {
        comment: 'Cleaning crew scheduled for tomorrow',
        feedbackId: feedbacks[1].id,
        userId: users[1].id, // Kadıköy admin
      },
    }),
    prisma.feedbackComment.create({
      data: {
        comment: 'Issue has been fixed',
        feedbackId: feedbacks[2].id,
        userId: users[2].id, // Üsküdar admin
      },
    }),
  ]);

  console.log('Database seeded with test data!');
  console.log('Test users created:');
  users.forEach(user => {
    console.log(`- ${user.email} (${user.role})`);
  });
  console.log('\nTest municipalities created:');
  municipalities.forEach(municipality => {
    console.log(`- ${municipality.name}`);
  });
  console.log('\nTest feedbacks created:', feedbacks.length);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 