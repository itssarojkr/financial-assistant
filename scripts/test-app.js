import { createClient } from '@supabase/supabase-js';

console.log('🔍 Testing app imports and basic functionality...');

// Test Supabase client creation
try {
  const SUPABASE_URL = "https://legeedxixsmtenquuxza.supabase.co";
  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxlZ2VlZHhpeHNtdGVucXV1eHphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1Mjk2MDQsImV4cCI6MjA2NzEwNTYwNH0.ZpVntuKx0rHyVHzilDzcZQPrgdrOcHAzB7DE5tGO88A";
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  console.log('✅ Supabase client created successfully');
  
  // Test basic connection
  const testConnection = async () => {
    try {
      const { data, error } = await supabase.from('profiles').select('count').limit(1);
      if (error) {
        console.log('❌ Database connection failed:', error.message);
        return false;
      }
      console.log('✅ Database connection successful');
      return true;
    } catch (err) {
      console.log('❌ Database connection error:', err.message);
      return false;
    }
  };
  
  testConnection().then(success => {
    if (success) {
      console.log('\n🎉 App is ready!');
      console.log('📱 Open http://localhost:8081 (or the port shown in your terminal)');
      console.log('🔐 Try the authentication features:');
      console.log('   - Sign up with a real email');
      console.log('   - Sign in');
      console.log('   - Save a tax calculation');
      console.log('   - Check the user dashboard');
    } else {
      console.log('\n⚠️ Database connection failed. Check your Supabase configuration.');
    }
  });
  
} catch (error) {
  console.log('❌ Error creating Supabase client:', error.message);
} 