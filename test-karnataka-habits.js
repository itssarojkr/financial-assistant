import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://legeedxixsmtenquuxza.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxlZ2VlZHhpeHNtdGVucXV1eHphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1Mjk2MDQsImV4cCI6MjA2NzEwNTYwNH0.ZpVntuKx0rHyVHzilDzcZQPrgdrOcHAzB7DE5tGO88A";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function testKarnatakaHabits() {
  console.log('Testing Karnataka (India) spending habits...');
  
  try {
    // Check for Karnataka state code (common codes: 29, KA, or 29)
    const stateCodes = ['29', 'KA', '29'];
    
    for (const stateCode of stateCodes) {
      console.log(`\nChecking state code: ${stateCode}`);
      
      const { data: habits, error } = await supabase
        .from('spending_habits')
        .select('*')
        .eq('user_id', 'default')
        .eq('country_code', 'IN')
        .eq('state_code', stateCode)
        .eq('is_default', true);
      
      if (error) {
        console.error(`Error checking state ${stateCode}:`, error);
        continue;
      }
      
      console.log(`Found ${habits?.length || 0} habits for Karnataka (${stateCode}):`);
      if (habits && habits.length > 0) {
        habits.forEach(habit => {
          console.log(`- ${habit.habit_type}: ${habit.expense_multiplier}x (${habit.name})`);
        });
      } else {
        console.log('No habits found for this state code');
      }
    }
    
    // Also check country-level defaults for India
    console.log('\nChecking India country-level defaults:');
    const { data: countryHabits, error: countryError } = await supabase
      .from('spending_habits')
      .select('*')
      .eq('user_id', 'default')
      .eq('country_code', 'IN')
      .is('state_code', null)
      .eq('is_default', true);
    
    if (countryError) {
      console.error('Error checking India country defaults:', countryError);
    } else {
      console.log(`Found ${countryHabits?.length || 0} country-level habits for India:`);
      if (countryHabits && countryHabits.length > 0) {
        countryHabits.forEach(habit => {
          console.log(`- ${habit.habit_type}: ${habit.expense_multiplier}x (${habit.name})`);
        });
      }
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testKarnatakaHabits(); 