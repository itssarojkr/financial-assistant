import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://legeedxixsmtenquuxza.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxlZ2VlZHhpeHNtdGVucXV1eHphIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTUyOTYwNCwiZXhwIjoyMDY3MTA1NjA0fQ.McN6pjEUYt9yCLbdBnVXh5e0SlJa8-VfNl58lCqHhz8';
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const supportedCountries = [
  'US', 'IN', 'CA', 'GB', 'AU', 'DE', 'FR', 'JP', 'SG', 'BR', 'ZA'
];

const defaultHabits = [
  {
    name: 'Conservative',
    habit_type: 'conservative',
    expense_multiplier: 0.85,
    description: 'Minimal spending, maximum savings'
  },
  {
    name: 'Moderate',
    habit_type: 'moderate',
    expense_multiplier: 1.0,
    description: 'Balanced spending and savings'
  },
  {
    name: 'Liberal',
    habit_type: 'liberal',
    expense_multiplier: 1.25,
    description: 'Comfortable lifestyle, moderate savings'
  }
];

async function insertCityLevelDefaults() {
  // Fetch all countries and build a code->id map
  const { data: countries, error: countryError } = await supabase
    .from('countries')
    .select('id, code');
  if (countryError) {
    console.error('Error fetching countries:', countryError);
    return;
  }
  const countryCodeToId = Object.fromEntries(countries.map(c => [c.code, c.id]));

  for (const countryCode of supportedCountries) {
    const countryId = countryCodeToId[countryCode];
    if (!countryId) {
      console.error(`No country_id found for code ${countryCode}`);
      continue;
    }
    console.log(`\nProcessing country: ${countryCode}`);
    // Get all states for the country by country_id
    const { data: states, error: stateError } = await supabase
      .from('states')
      .select('id, code, name')
      .eq('country_id', countryId);
    if (stateError) {
      console.error(`Error fetching states for ${countryCode}:`, stateError);
      continue;
    }
    for (const state of states) {
      console.log(`  State: ${state.name} (${state.code})`);
      // Get top 5 cities by population for the state
      const { data: cities, error: cityError } = await supabase
        .from('cities')
        .select('id, name')
        .eq('state_id', state.id)
        .order('population', { ascending: false })
        .limit(5);
      if (cityError) {
        console.error(`    Error fetching cities for state ${state.code}:`, cityError);
        continue;
      }
      for (const city of cities) {
        console.log(`    City: ${city.name}`);
        for (const habit of defaultHabits) {
          // Check if already exists
          const { data: existing, error: checkError } = await supabase
            .from('spending_habits')
            .select('id')
            .eq('user_id', 'default')
            .eq('country_code', countryCode)
            .eq('state_code', state.code)
            .eq('city_code', city.id)
            .eq('habit_type', habit.habit_type)
            .eq('is_default', true)
            .maybeSingle();
          if (checkError) {
            console.error(`      Error checking existing for ${habit.name}:`, checkError);
            continue;
          }
          if (existing) {
            console.log(`      ✓ ${habit.name} already exists`);
            continue;
          }
          // Insert default habit
          const { error: insertError } = await supabase
            .from('spending_habits')
            .insert({
              user_id: 'default',
              name: habit.name,
              country_code: countryCode,
              state_code: state.code,
              city_code: city.id,
              habit_type: habit.habit_type,
              expense_multiplier: habit.expense_multiplier,
              description: habit.description,
              is_default: true
            });
          if (insertError) {
            console.error(`      Error inserting ${habit.name}:`, insertError);
          } else {
            console.log(`      + Inserted ${habit.name}`);
          }
        }
      }
    }
  }
  console.log('\nDone inserting city-level default spending habits.');
}

insertCityLevelDefaults().catch(console.error); 