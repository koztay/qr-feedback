import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create test municipality
  const municipality = await prisma.municipality.upsert({
    where: { id: '1' },
    update: {},
    create: {
      id: '1',
      name: 'Test Municipality',
      city: 'Test City',
      state: 'Test State',
      country: 'Test Country',
      contactEmail: 'contact@test-municipality.com',
    },
  });

  // Create test admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {
      password: hashedPassword,
    },
    create: {
      email: 'admin@test.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'ADMIN',
      municipalityId: municipality.id,
    },
  });

  console.log('Seeded test user:', {
    email: user.email,
    role: user.role,
    municipalityId: user.municipalityId,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 