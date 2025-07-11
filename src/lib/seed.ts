
// src/lib/seed.ts
import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';
import { schools, courses, payments, users as mockUsers } from './mock-data';

// Explicitly load .env.local
config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase URL or service key. Make sure to set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY in your .env.local file.');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedData() {
  console.log('Starting to seed data...');

  // Note: This script assumes you have tables named 'schools', 'courses', and 'payments'.
  // You must create these tables in your Supabase dashboard before running the seed script.
  // The columns should match the structure of the mock data objects.

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
        console.error(`Error creating profile for ${user.email}:`, profileError);
      } else {
        console.log(`Profile for ${user.email} created successfully.`);
      }
    }
  }


  // Seed schools
  console.log('Seeding schools...');
  const { error: schoolsError } = await supabase.from('schools').insert(schools);
  if (schoolsError) {
    console.error('Error seeding schools:', schoolsError);
  } else {
    console.log('Successfully seeded schools.');
  }

  // Seed courses
  console.log('Seeding courses...');
  const { error: coursesError } = await supabase.from('courses').insert(courses);
  if (coursesError) {
    console.error('Error seeding courses:', coursesError);
  } else {
    console.log('Successfully seeded courses.');
  }

  // Seed payments
  // Seeding a large number of payments might be slow or hit limits.
  // We'll insert them in chunks to be safe.
  console.log('Seeding payments...');
  const chunkSize = 100;
  for (let i = 0; i < payments.length; i += chunkSize) {
    const chunk = payments.slice(i, i + chunkSize);
    const { error: paymentsError } = await supabase.from('payments').insert(chunk);
    if (paymentsError) {
      console.error(`Error seeding payments chunk ${i / chunkSize + 1}:`, paymentsError);
      // Optional: stop on first error
      // break; 
    }
  }
  console.log('Successfully seeded payments.');

  console.log('Data seeding complete.');
}

seedData().catch(console.error);
