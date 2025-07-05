import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://legeedxixsmtenquuxza.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxlZ2VlZHhpeHNtdGVucXV1eHphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1Mjk2MDQsImV4cCI6MjA2NzEwNTYwNH0.ZpVntuKx0rHyVHzilDzcZQPrgdrOcHAzB7DE5tGO88A";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function checkDatabase() {
  console.log('Checking database tables...');
  
  try {
    // Check if expense_categories table exists
    const { data: categories, error: categoriesError } = await supabase
      .from('expense_categories')
      .select('*')
      .limit(1);
    
    if (categoriesError) {
      console.error('❌ expense_categories table error:', categoriesError.message);
    } else {
      console.log('✅ expense_categories table exists');
    }
    
    // Check if expenses table exists
    const { data: expenses, error: expensesError } = await supabase
      .from('expenses')
      .select('*')
      .limit(1);
    
    if (expensesError) {
      console.error('❌ expenses table error:', expensesError.message);
    } else {
      console.log('✅ expenses table exists');
    }
    
    // Check if budgets table exists
    const { data: budgets, error: budgetsError } = await supabase
      .from('budgets')
      .select('*')
      .limit(1);
    
    if (budgetsError) {
      console.error('❌ budgets table error:', budgetsError.message);
    } else {
      console.log('✅ budgets table exists');
    }
    
    // Check if spending_alerts table exists
    const { data: alerts, error: alertsError } = await supabase
      .from('spending_alerts')
      .select('*')
      .limit(1);
    
    if (alertsError) {
      console.error('❌ spending_alerts table error:', alertsError.message);
    } else {
      console.log('✅ spending_alerts table exists');
    }
    
    // Check if user_preferences table exists
    const { data: preferences, error: preferencesError } = await supabase
      .from('user_preferences')
      .select('*')
      .limit(1);
    
    if (preferencesError) {
      console.error('❌ user_preferences table error:', preferencesError.message);
    } else {
      console.log('✅ user_preferences table exists');
    }
    
  } catch (error) {
    console.error('❌ Database check failed:', error.message);
  }
}

checkDatabase(); 