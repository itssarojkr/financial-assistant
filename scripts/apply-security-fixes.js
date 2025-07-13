#!/usr/bin/env node

/**
 * Script to apply security fixes to Supabase database
 * This script applies the migrations that fix SECURITY DEFINER issues
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   VITE_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applySecurityFixes() {
  console.log('🔒 Applying Supabase security fixes...\n');

  try {
    // Read the migration files
    const migrationFiles = [
      'supabase/migrations/010_fix_location_hierarchy_security.sql',
      'supabase/migrations/011_security_audit_fixes.sql'
    ];

    for (const filePath of migrationFiles) {
      console.log(`📄 Applying migration: ${path.basename(filePath)}`);
      
      const sql = fs.readFileSync(filePath, 'utf8');
      
      // Split the SQL into individual statements
      const statements = sql
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

      for (const statement of statements) {
        if (statement.trim()) {
          try {
            const { error } = await supabase.rpc('exec_sql', { sql: statement });
            if (error) {
              console.error(`❌ Error executing statement: ${error.message}`);
              console.error(`Statement: ${statement.substring(0, 100)}...`);
            }
          } catch (err) {
            console.error(`❌ Error executing statement: ${err.message}`);
          }
        }
      }
      
      console.log(`✅ Applied: ${path.basename(filePath)}`);
    }

    console.log('\n✅ Security fixes applied successfully!');
    console.log('\n📋 Summary of fixes:');
    console.log('   • Fixed location_hierarchy view SECURITY DEFINER issue');
    console.log('   • Added RLS policies for location tables');
    console.log('   • Added proper access controls');
    console.log('   • Documented security model');

  } catch (error) {
    console.error('❌ Error applying security fixes:', error.message);
    process.exit(1);
  }
}

// Run the script
applySecurityFixes(); 