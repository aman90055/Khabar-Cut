import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function promote(email: string) {
  if (!email) {
    console.error('❌ Please provide an email address.');
    process.exit(1);
  }

  console.log(`🔍 Promoting user with email: ${email} to Super Admin...`);

  try {
    // 1. Find the user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.error(`❌ User not found with email: ${email}`);
      console.log('💡 Note: The user must first sign in/sign up once on the website so that their account record is created in the database.');
      process.exit(1);
    }

    // 2. Find the Super Admin role
    const adminRole = await prisma.role.findUnique({
      where: { slug: 'super-admin' },
    });

    if (!adminRole) {
      console.error('❌ Super Admin role not found in database. Did you run npm run db:seed?');
      process.exit(1);
    }

    // 3. Update the user's role
    await prisma.user.update({
      where: { id: user.id },
      data: { roleId: adminRole.id },
    });

    console.log(`\n🎉 Success! User ${email} has been promoted to Super Admin.`);
    console.log('💡 Action: Please refresh the website or re-login to access the Admin Dashboard (/admin).');
  } catch (error: any) {
    console.error('❌ Promotion failed:', error.message || error);
  } finally {
    await prisma.$disconnect();
  }
}

const targetEmail = process.argv[2];
promote(targetEmail);
