import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://legeedxixsmtenquuxza.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxlZ2VlZHhpeHNtdGVucXV1eHphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1Mjk2MDQsImV4cCI6MjA2NzEwNTYwNH0.ZpVntuKx0rHyVHzilDzcZQPrgdrOcHAzB7DE5tGO88A";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function testSpendingHabits() {
  console.log('Testing spending habits table...');
  
  try {
    // Test 1: Check if table exists and has data
    const { data: allHabits, error: allError } = await supabase
      .from('spending_habits')
      .select('*')
      .limit(10);
    
    if (allError) {
      console.error('Error accessing spending_habits table:', allError);
      return;
    }
    
    console.log('Total habits in table:', allHabits?.length || 0);
    console.log('Sample habits:', allHabits?.slice(0, 3));
    
    // Test 2: Check US defaults
    const { data: usHabits, error: usError } = await supabase
      .from('spending_habits')
      .select('*')
      .eq('user_id', 'default')
      .eq('country_code', 'US')
      .eq('is_default', true);
    
    if (usError) {
      console.error('Error accessing US habits:', usError);
      return;
    }
    
    console.log('US default habits:', usHabits?.length || 0);
    console.log('US habits:', usHabits);
    
    // Test 3: Check India defaults
    const { data: inHabits, error: inError } = await supabase
      .from('spending_habits')
      .select('*')
      .eq('user_id', 'default')
      .eq('country_code', 'IN')
      .eq('is_default', true);
    
    if (inError) {
      console.error('Error accessing India habits:', inError);
      return;
    }
    
    console.log('India default habits:', inHabits?.length || 0);
    console.log('India habits:', inHabits);
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testSpendingHabits(); 