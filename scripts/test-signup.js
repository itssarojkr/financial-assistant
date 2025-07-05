import { createClient } from '@supabase/supabase-js';

console.log('🔍 Testing signup process...');

const SUPABASE_URL = "https://legeedxixsmtenquuxza.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxlZ2VlZHhpeHNtdGVucXV1eHphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1Mjk2MDQsImV4cCI6MjA2NzEwNTYwNH0.ZpVntuKx0rHyVHzilDzcZQPrgdrOcHAzB7DE5tGO88A";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testSignup() {
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'testpassword123';
  
  console.log(`📧 Testing signup with email: ${testEmail}`);
  
  try {
    // Test signup
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          first_name: 'Test',
          last_name: 'User'
        }
      }
    });
    
    if (error) {
      console.log('❌ Signup failed:', error.message);
      return false;
    }
    
    console.log('✅ Signup successful!');
    console.log('👤 User ID:', data.user?.id);
    
    // Check if profile was created
    if (data.user) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
      
      if (profileError) {
        console.log('❌ Profile not found:', profileError.message);
        return false;
      }
      
      console.log('✅ Profile created successfully!');
      console.log('📝 Profile data:', {
        id: profile.id,
        email: profile.email,
        first_name: profile.first_name,
        last_name: profile.last_name
      });
    }
    
    return true;
    
  } catch (err) {
    console.log('❌ Signup test error:', err.message);
    return false;
  }
}

async function runTest() {
  console.log('🚀 Starting signup test...\n');
  
  const success = await testSignup();
  
  if (success) {
    console.log('\n🎉 Signup test passed!');
    console.log('✅ RLS policies are working correctly');
    console.log('✅ Trigger function is creating profiles');
    console.log('\n📱 You can now test signup in your app at http://localhost:8081');
  } else {
    console.log('\n⚠️ Signup test failed');
    console.log('🔧 Please run the fix-rls.sql script in your Supabase SQL editor');
  }
}

runTest().catch(console.error); 