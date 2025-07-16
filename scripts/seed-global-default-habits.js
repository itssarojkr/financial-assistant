import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://legeedxixsmtenquuxza.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxlZ2VlZHhpeHNtdGVucXV1eHphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1Mjk2MDQsImV4cCI6MjA2NzEwNTYwNH0.ZpVntuKx0rHyVHzilDzcZQPrgdrOcHAzB7DE5tGO88A";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const globalDefaults = [
  {
    user_id: 'default',
    name: 'Conservative',
    country_code: 'GLOBAL',
    state_code: null,
    habit_type: 'conservative',
    expense_multiplier: 0.85,
    description: 'Minimal spending, maximum savings',
    is_default: true
  },
  {
    user_id: 'default',
    name: 'Moderate',
    country_code: 'GLOBAL',
    state_code: null,
    habit_type: 'moderate',
    expense_multiplier: 1.0,
    description: 'Balanced spending and savings',
    is_default: true
  },
  {
    user_id: 'default',
    name: 'Liberal',
    country_code: 'GLOBAL',
    state_code: null,
    habit_type: 'liberal',
    expense_multiplier: 1.25,
    description: 'Comfortable lifestyle, moderate savings',
    is_default: true
  }
];

async function seedGlobalDefaults() {
  for (const habit of globalDefaults) {
    const { data, error } = await supabase
      .from('spending_habits')
      .insert(habit);
    if (error) {
      console.error(`Error inserting ${habit.name}:`, error);
    } else {
      console.log(`Inserted global default: ${habit.name}`);
    }
  }
  console.log('Done seeding global defaults.');
}

seedGlobalDefaults().catch(console.error); 