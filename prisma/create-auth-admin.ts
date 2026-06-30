import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load env variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function createAdmin() {
  const email = 'khabarcutnews@gmail.com';
  const password = 'Khabar@2026';

  console.log(`🚀 Setting up Admin account for ${email}...`);

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Supabase URL or Service Role Key missing in .env');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    // 1. Check if user already exists in Supabase Auth using admin API
    console.log('🔍 Checking Supabase Auth...');
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      throw new Error(`Failed to list users: ${listError.message}`);
    }

    let authUser = users.find(u => u.email === email);

    if (!authUser) {
      console.log('➕ User not found in Auth. Creating new user...');
      const { data: { user }, error: createError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: 'Super Admin' }
      });

      if (createError || !user) {
        throw new Error(`Failed to create Auth user: ${createError?.message || 'Unknown error'}`);
      }

      authUser = user;
      console.log('✅ Supabase Auth user created successfully.');
    } else {
      console.log('ℹ️ User already exists in Supabase Auth. Updating password...');
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        authUser.id,
        { password }
      );
      if (updateError) {
        throw new Error(`Failed to update Auth password: ${updateError.message}`);
      }
      console.log('✅ Auth password updated successfully.');
    }

    // 2. Assign Super Admin role in Prisma database
    console.log('🔍 Syncing with database...');
    const adminRole = await prisma.role.findUnique({
      where: { slug: 'super-admin' }
    });

    if (!adminRole) {
      throw new Error('Super Admin role not found in database. Please run npm run db:seed first.');
    }

    const dbUser = await prisma.user.upsert({
      where: { email },
      update: {
        authId: authUser.id,
        roleId: adminRole.id,
        isActive: true,
        isVerified: true
      },
      create: {
        authId: authUser.id,
        email,
        fullName: 'Super Admin',
        roleId: adminRole.id,
        isActive: true,
        isVerified: true,
        authProvider: 'email'
      }
    });

    console.log('\n==================================================');
    console.log(`🎉 SUCCESS! Admin account is set up.`);
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password: ${password}`);
    console.log(`🔗 Dashboard: https://khabar-cut.vercel.app/admin`);
    console.log('==================================================');

  } catch (error: any) {
    console.error('❌ Operation failed:', error.message || error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
