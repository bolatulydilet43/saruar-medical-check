// One-off: pushes the demo dataset (seed.js) into Supabase tables.
// Run after applying supabase/schema.sql, with SUPABASE_URL and
// SUPABASE_SERVICE_KEY set:  node scripts/seed-supabase.js
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import ws from 'ws';
import { STAFF, PATIENTS, APPOINTMENTS_WEEK } from '../src/data/seed.js';

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_KEY before running this script.');
  process.exit(1);
}

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, { realtime: { transport: ws } });

async function seedTable(table, records) {
  const rows = records.map((record) => ({ id: record.id, data: record }));
  const { error } = await supabase.from(table).upsert(rows);
  if (error) throw new Error(`Failed to seed ${table}: ${error.message}`);
  console.log(`Seeded ${rows.length} rows into ${table}`);
}

await seedTable('staff', STAFF);
await seedTable('patients', PATIENTS);
await seedTable('appointments_week', APPOINTMENTS_WEEK);

console.log('Done.');
