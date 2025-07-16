import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://legeedxixsmtenquuxza.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxlZ2VlZHhpeHNtdGVucXV1eHphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1Mjk2MDQsImV4cCI6MjA2NzEwNTYwNH0.ZpVntuKx0rHyVHzilDzcZQPrgdrOcHAzB7DE5tGO88A";
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Define supported countries and states with their multipliers
const defaultMultipliers = {
  country: {
    conservative: 0.85,
    moderate: 1.0,
    liberal: 1.25,
  },
  US: {
    CA: { conservative: 0.8, moderate: 1.1, liberal: 1.35 },
    TX: { conservative: 0.9, moderate: 0.95, liberal: 1.15 },
  },
  IN: {
    '16': { conservative: 0.8, moderate: 1.1, liberal: 1.35 }, // Maharashtra
    '07': { conservative: 0.75, moderate: 1.15, liberal: 1.4 }, // Delhi
    '29': { conservative: 0.85, moderate: 1.0, liberal: 1.2 }, // Karnataka
  },
};

const supportedCountries = [
  'US', 'IN', 'CA', 'GB', 'AU', 'DE', 'FR', 'JP', 'SG'
];

const statesByCountry = {
  US: ['CA', 'TX'],
  IN: ['16', '07', '29'], // Added Karnataka (29)
};

const habitTypes = [
  { type: 'conservative', desc: 'Save more, spend less - reduction in expenses' },
  { type: 'moderate', desc: 'Balanced approach - standard expense levels' },
  { type: 'liberal', desc: 'Enjoy life, spend more - increase in expenses' },
];

async function ensureHabits() {
  for (const country of supportedCountries) {
    // Country-level defaults
    for (const habit of habitTypes) {
      const multiplier = defaultMultipliers[country]?.[habit.type] || defaultMultipliers.country[habit.type];
      const { data, error } = await supabase
        .from('spending_habits')
        .select('id')
        .eq('user_id', 'default')
        .eq('country_code', country)
        .is('state_code', null)
        .eq('habit_type', habit.type)
        .eq('is_default', true)
        .maybeSingle();
      if (!data) {
        // Insert
        const { error: insertError } = await supabase
          .from('spending_habits')
          .insert({
            user_id: 'default',
            name: habit.type.charAt(0).toUpperCase() + habit.type.slice(1),
            country_code: country,
            state_code: null,
            habit_type: habit.type,
            expense_multiplier: multiplier,
            description: habit.desc,
            is_default: true,
          });
        if (insertError) {
          console.error(`Failed to insert ${habit.type} for ${country}:`, insertError.message);
        } else {
          console.log(`Inserted ${habit.type} for ${country}`);
        }
      } else {
        console.log(`Exists: ${habit.type} for ${country}`);
      }
    }
    // State-level defaults
    if (statesByCountry[country]) {
      for (const state of statesByCountry[country]) {
        for (const habit of habitTypes) {
          const multiplier = defaultMultipliers[country]?.[state]?.[habit.type] || defaultMultipliers.country[habit.type];
          const { data, error } = await supabase
            .from('spending_habits')
            .select('id')
            .eq('user_id', 'default')
            .eq('country_code', country)
            .eq('state_code', state)
            .eq('habit_type', habit.type)
            .eq('is_default', true)
            .maybeSingle();
          if (!data) {
            const { error: insertError } = await supabase
              .from('spending_habits')
              .insert({
                user_id: 'default',
                name: habit.type.charAt(0).toUpperCase() + habit.type.slice(1),
                country_code: country,
                state_code: state,
                habit_type: habit.type,
                expense_multiplier: multiplier,
                description: habit.desc,
                is_default: true,
              });
            if (insertError) {
              console.error(`Failed to insert ${habit.type} for ${country}-${state}:`, insertError.message);
            } else {
              console.log(`Inserted ${habit.type} for ${country}-${state}`);
            }
          } else {
            console.log(`Exists: ${habit.type} for ${country}-${state}`);
          }
        }
      }
    }
  }
  console.log('Done.');
}

ensureHabits(); 