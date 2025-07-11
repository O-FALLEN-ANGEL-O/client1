// src/lib/seed.ts
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { schools, courses, payments } from './mock-data';

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
  // Seeding a large number of payments might be slow or hit limits.
  // We'll insert them in chunks to be safe.
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
