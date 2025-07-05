import { createClient } from '@supabase/supabase-js';

// Test Supabase connection and basic auth functionality
const SUPABASE_URL = "https://legeedxixsmtenquuxza.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxlZ2VlZHhpeHNtdGVucXV1eHphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1Mjk2MDQsImV4cCI6MjA2NzEwNTYwNH0.ZpVntuKx0rHyVHzilDzcZQPrgdrOcHAzB7DE5tGO88A";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testConnection() {
  console.log('🔍 Testing Supabase connection...');
  
  try {
    // Test basic connection
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error) {
      console.log('❌ Connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Connection successful!');
    console.log('📊 Profiles table accessible');
    return true;
  } catch (err) {
    console.log('❌ Connection error:', err.message);
    return false;
  }
}

async function testAuth() {
  console.log('\n🔐 Testing authentication...');
  
  try {
    // Test sign up (this will fail if email already exists, which is expected)
    const testEmail = `test-${Date.now()}@example.com`;
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: 'testpassword123',
      options: {
        data: {
          first_name: 'Test',
          last_name: 'User'
        }
      }
    });
    
    if (error) {
      if (error.message.includes('already registered')) {
        console.log('✅ Auth signup working (email already exists - expected)');
      } else {
        console.log('❌ Auth signup failed:', error.message);
        return false;
      }
    } else {
      console.log('✅ Auth signup successful!');
    }
    
    return true;
  } catch (err) {
    console.log('❌ Auth test error:', err.message);
    return false;
  }
}

async function testDatabaseTables() {
  console.log('\n🗄️ Testing database tables...');
  
  const tables = ['profiles', 'user_data', 'user_sessions'];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      
      if (error) {
        console.log(`❌ Table ${table} not accessible:`, error.message);
        return false;
      }
      
      console.log(`✅ Table ${table} accessible`);
    } catch (err) {
      console.log(`❌ Table ${table} error:`, err.message);
      return false;
    }
  }
  
  return true;
}

async function runTests() {
  console.log('🚀 Starting Supabase integration tests...\n');
  
  const connectionOk = await testConnection();
  const authOk = await testAuth();
  const tablesOk = await testDatabaseTables();
  
  console.log('\n📋 Test Results:');
  console.log(`Connection: ${connectionOk ? '✅' : '❌'}`);
  console.log(`Authentication: ${authOk ? '✅' : '❌'}`);
  console.log(`Database Tables: ${tablesOk ? '✅' : '❌'}`);
  
  if (connectionOk && authOk && tablesOk) {
    console.log('\n🎉 All tests passed! Your Supabase setup is working correctly.');
    console.log('\nNext steps:');
    console.log('1. Open http://localhost:8081 in your browser');
    console.log('2. Try registering a new user');
    console.log('3. Test saving a tax calculation');
    console.log('4. Check the user dashboard');
  } else {
    console.log('\n⚠️ Some tests failed. Please check your Supabase configuration.');
  }
}

runTests().catch(console.error); 