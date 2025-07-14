
// src/lib/seed.ts
import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';
import { schools, courses, payments, users as mockUsers } from './mock-data';

// Explicitly load .env.local
config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase URL or service key. Make sure to set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env.local file or Vercel environment variables.');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedData() {
  console.log('Starting to seed data...');

  // --- Clean up existing data ---
  console.log('Deleting existing data...');
  const { error: deletePaymentsError } = await supabase.from('payments').delete().neq('id', 'placeholder');
  if (deletePaymentsError) console.error('Error deleting payments:', deletePaymentsError.message);

  const { error: deleteCoursesError } = await supabase.from('courses').delete().neq('id', 'placeholder');
  if (deleteCoursesError) console.error('Error deleting courses:', deleteCoursesError.message);
  
  const { error: deleteSchoolsError } = await supabase.from('schools').delete().neq('id', 'placeholder');
  if (deleteSchoolsError) console.error('Error deleting schools:', deleteSchoolsError.message);

  const { data: authUsers, error: listUsersError } = await supabase.auth.admin.listUsers();
    if (listUsersError) {
        console.error('Error listing users:', listUsersError.message);
    } else {
        for (const user of authUsers.users) {
            // Don't delete the default supabase user
            if (user.email !== 'supabase_admin@supabase.io') {
                 const { error: deleteProfileError } = await supabase.from('users').delete().eq('id', user.id);
                 if (deleteProfileError) console.error(`Error deleting profile for ${user.email}:`, deleteProfileError.message);

                const { error: deleteAuthUserError } = await supabase.auth.admin.deleteUser(user.id);
                if (deleteAuthUserError) console.error(`Error deleting auth user ${user.email}:`, deleteAuthUserError.message);
            }
        }
    }
  console.log('Finished deleting data.');
  // -----------------------------


  // Seed users
  console.log('Seeding users...');
  for (const user of mockUsers) {
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: { name: user.name }
    });

    if (authError) {
      console.error(`Error creating auth user ${user.email}:`, authError.message);
    } else if (authData.user) {
      console.log(`Auth user ${user.email} created successfully.`);
      const { error: profileError } = await supabase.from('users').insert({
        id: authData.user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      });

      if (profileError) {
        console.error(`Error creating profile for ${user.email}:`, profileError.message);
      } else {
        console.log(`Profile for ${user.email} created successfully.`);
      }
    }
  }


  // Seed schools
  console.log('Seeding schools...');
  const { error: schoolsError } = await supabase.from('schools').insert(schools);
  if (schoolsError) {
    console.error('Error seeding schools:', schoolsError.message);
  } else {
    console.log('Successfully seeded schools.');
  }

  // Seed courses
  console.log('Seeding courses...');
  const { error: coursesError } = await supabase.from('courses').insert(courses);
  if (coursesError) {
    console.error('Error seeding courses:', coursesError.message);
  } else {
    console.log('Successfully seeded courses.');
  }

  // Seed payments
  console.log('Seeding payments...');
  const chunkSize = 100;
  for (let i = 0; i < payments.length; i += chunkSize) {
    const chunk = payments.slice(i, i + chunkSize);
    const { error: paymentsError } = await supabase.from('payments').insert(chunk);
    if (paymentsError) {
      console.error(`Error seeding payments chunk ${i / chunkSize + 1}:`, paymentsError.message);
      // Optional: stop on first error
      // break; 
    }
  }
  console.log('Successfully seeded payments.');

  console.log('Data seeding complete.');
}

seedData().catch(console.error);
