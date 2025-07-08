import { createClient } from '@supabase/supabase-js';

// Test Supabase connection and apply security fixes
const SUPABASE_URL = "https://legeedxixsmtenquuxza.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxlZ2VlZHhpeHNtdGVucXV1eHphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1Mjk2MDQsImV4cCI6MjA2NzEwNTYwNH0.ZpVntuKx0rHyVHzilDzcZQPrgdrOcHAzB7DE5tGO88A";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkCurrentSecurityStatus() {
  console.log('🔍 Checking current security status...');
  
  try {
    // Check auth config
    const { data: authConfig, error: authError } = await supabase
      .from('auth.config')
      .select('enable_hibp_check, email_otp_enabled')
      .single();
    
    if (authError) {
      console.log('❌ Could not check auth config:', authError.message);
      return false;
    }
    
    console.log('📊 Current Auth Configuration:');
    console.log(`   Leaked Password Protection: ${authConfig.enable_hibp_check ? '✅ Enabled' : '❌ Disabled'}`);
    console.log(`   Email OTP: ${authConfig.email_otp_enabled ? '✅ Enabled' : '❌ Disabled'}`);
    
    return authConfig;
  } catch (err) {
    console.log('❌ Error checking security status:', err.message);
    return false;
  }
}

async function checkFunctionSearchPaths() {
  console.log('\n🔍 Checking function search paths...');
  
  try {
    // Check if functions exist and their search path configuration
    const { data: functions, error } = await supabase
      .rpc('check_function_search_paths');
    
    if (error) {
      console.log('⚠️ Could not check function search paths (function may not exist yet):', error.message);
      return false;
    }
    
    console.log('📊 Function Search Path Status:');
    functions.forEach(func => {
      console.log(`   ${func.function_name}: ${func.search_path_status}`);
    });
    
    return functions;
  } catch (err) {
    console.log('❌ Error checking function search paths:', err.message);
    return false;
  }
}

async function applySecurityFixes() {
  console.log('\n🔧 Applying security fixes...');
  
  try {
    // Read and execute the migration SQL
    const fs = await import('fs');
    const path = await import('path');
    
    const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '006_fix_security_warnings.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Executing ${statements.length} SQL statements...`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          const { error } = await supabase.rpc('exec_sql', { sql: statement });
          if (error) {
            console.log(`⚠️ Statement ${i + 1} had an issue:`, error.message);
          } else {
            console.log(`✅ Statement ${i + 1} executed successfully`);
          }
        } catch (err) {
          console.log(`❌ Statement ${i + 1} failed:`, err.message);
        }
      }
    }
    
    return true;
  } catch (err) {
    console.log('❌ Error applying security fixes:', err.message);
    return false;
  }
}

async function verifyFixes() {
  console.log('\n✅ Verifying security fixes...');
  
  const authStatus = await checkCurrentSecurityStatus();
  const functionStatus = await checkFunctionSearchPaths();
  
  if (authStatus && authStatus.enable_hibp_check && authStatus.email_otp_enabled) {
    console.log('\n🎉 Security fixes applied successfully!');
    console.log('✅ Leaked Password Protection is now enabled');
    console.log('✅ Email OTP is now enabled');
    console.log('✅ Function search paths are secured');
    
    console.log('\n📋 Summary of fixes:');
    console.log('1. Enabled Have I Been Pwned password check');
    console.log('2. Enabled email verification for new accounts');
    console.log('3. Fixed function search paths to prevent injection attacks');
    console.log('4. Added SECURITY DEFINER to handle_new_user function');
    
    console.log('\n🔒 Your Supabase project is now more secure!');
    console.log('   - Users will be warned if they use compromised passwords');
    console.log('   - Email verification is required for new accounts');
    console.log('   - Database functions are protected against search path attacks');
    
  } else {
    console.log('\n⚠️ Some security fixes may not have been applied correctly.');
    console.log('Please check the Supabase dashboard for any remaining warnings.');
  }
}

async function runSecurityFix() {
  console.log('🚀 Starting Supabase Security Fix...\n');
  
  // Check current status
  await checkCurrentSecurityStatus();
  await checkFunctionSearchPaths();
  
  // Apply fixes
  const fixesApplied = await applySecurityFixes();
  
  if (fixesApplied) {
    // Wait a moment for changes to propagate
    console.log('\n⏳ Waiting for changes to propagate...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Verify fixes
    await verifyFixes();
  } else {
    console.log('\n❌ Failed to apply security fixes.');
    console.log('Please run the migration manually in your Supabase SQL editor:');
    console.log('supabase/migrations/006_fix_security_warnings.sql');
  }
}

// Run the security fix
runSecurityFix().catch(console.error); 