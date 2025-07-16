import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://legeedxixsmtenquuxza.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxlZ2VlZHhpeHNtdGVucXV1eHphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1Mjk2MDQsImV4cCI6MjA2NzEwNTYwNH0.ZpVntuKx0rHyVHzilDzcZQPrgdrOcHAzB7DE5tGO88A";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkAndInsertDefaultHabits() {
  console.log('Checking for default spending habits...');

  const countries = ['US', 'IN', 'CA', 'GB', 'AU', 'DE', 'FR'];
  const states = {
    'US': ['CA', 'TX', 'NY', 'FL'],
    'IN': ['16', '07', '29'], // Maharashtra, Delhi, Karnataka
    'CA': ['ON', 'BC', 'AB'],
    'GB': ['ENG', 'SCT', 'WLS'],
    'AU': ['NSW', 'VIC', 'QLD'],
    'DE': ['BY', 'NW', 'BW'],
    'FR': ['IDF', 'ARA', 'OCC']
  };

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

  let totalInserted = 0;

  for (const countryCode of countries) {
    console.log(`\nProcessing country: ${countryCode}`);
    
    // Check country-level defaults
    const { data: existingCountryHabits, error: countryError } = await supabase
      .from('spending_habits')
      .select('*')
      .eq('user_id', 'default')
      .eq('country_code', countryCode)
      .is('state_code', null);

    if (countryError) {
      console.error(`Error checking country habits for ${countryCode}:`, countryError);
      continue;
    }

    console.log(`Found ${existingCountryHabits?.length || 0} existing country-level habits for ${countryCode}`);

    // Insert country-level defaults if they don't exist
    if (!existingCountryHabits || existingCountryHabits.length === 0) {
      console.log(`Inserting country-level defaults for ${countryCode}...`);
      
      for (const habit of defaultHabits) {
        const { error: insertError } = await supabase
          .from('spending_habits')
          .insert({
            user_id: 'default',
            name: habit.name,
            country_code: countryCode,
            state_code: null,
            habit_type: habit.habit_type,
            expense_multiplier: habit.expense_multiplier,
            description: habit.description,
            is_default: true
          });

        if (insertError) {
          console.error(`Error inserting ${habit.name} for ${countryCode}:`, insertError);
        } else {
          console.log(`✓ Inserted ${habit.name} for ${countryCode}`);
          totalInserted++;
        }
      }
    }

    // Process state-level defaults
    const countryStates = states[countryCode] || [];
    for (const stateCode of countryStates) {
      console.log(`\nProcessing state: ${countryCode}-${stateCode}`);
      
      const { data: existingStateHabits, error: stateError } = await supabase
        .from('spending_habits')
        .select('*')
        .eq('user_id', 'default')
        .eq('country_code', countryCode)
        .eq('state_code', stateCode);

      if (stateError) {
        console.error(`Error checking state habits for ${countryCode}-${stateCode}:`, stateError);
        continue;
      }

      console.log(`Found ${existingStateHabits?.length || 0} existing state-level habits for ${countryCode}-${stateCode}`);

      // Insert state-level defaults if they don't exist
      if (!existingStateHabits || existingStateHabits.length === 0) {
        console.log(`Inserting state-level defaults for ${countryCode}-${stateCode}...`);
        
        for (const habit of defaultHabits) {
          const { error: insertError } = await supabase
            .from('spending_habits')
            .insert({
              user_id: 'default',
              name: habit.name,
              country_code: countryCode,
              state_code: stateCode,
              habit_type: habit.habit_type,
              expense_multiplier: habit.expense_multiplier,
              description: habit.description,
              is_default: true
            });

          if (insertError) {
            console.error(`Error inserting ${habit.name} for ${countryCode}-${stateCode}:`, insertError);
          } else {
            console.log(`✓ Inserted ${habit.name} for ${countryCode}-${stateCode}`);
            totalInserted++;
          }
        }
      }
    }
  }

  console.log(`\n✅ Total habits inserted: ${totalInserted}`);
  
  // Verify the results
  console.log('\nVerifying results...');
  const { data: allHabits, error: verifyError } = await supabase
    .from('spending_habits')
    .select('*')
    .eq('user_id', 'default')
    .order('country_code', { ascending: true })
    .order('state_code', { ascending: true })
    .order('habit_type', { ascending: true });

  if (verifyError) {
    console.error('Error verifying results:', verifyError);
  } else {
    console.log(`Total default habits in database: ${allHabits?.length || 0}`);
    
    // Group by country and state
    const grouped = {};
    allHabits?.forEach(habit => {
      const key = habit.state_code ? `${habit.country_code}-${habit.state_code}` : habit.country_code;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(habit);
    });

    console.log('\nHabits by location:');
    Object.entries(grouped).forEach(([location, habits]) => {
      console.log(`${location}: ${habits.length} habits`);
    });
  }
}

checkAndInsertDefaultHabits().catch(console.error); 