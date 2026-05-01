import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const admins = await prisma.admin.findMany();
  console.log('Current admins:', admins);

  if (admins.length > 0) {
    const admin = admins[0];
    const hashedPassword = await bcrypt.hash('password', 10);
    await prisma.admin.update({
      where: { id: admin.id },
      data: { password: hashedPassword, email: 'admin@example.com' }
    });
    console.log('Updated password for admin:', admin.email);
  } else {
    const hashedPassword = await bcrypt.hash('password', 10);
    await prisma.admin.create({
      data: {
        email: 'admin@example.com',
        password: hashedPassword
      }
    });
    console.log('Created new admin.');
  }
}

main().finally(() => prisma.$disconnect());
