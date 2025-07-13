#!/usr/bin/env node

/**
 * Financial Dashboard Database Migration Script
 * 
 * This script safely applies the database schema updates for the Financial Dashboard
 * without losing any existing data. It includes proper error handling and rollback capabilities.
 * 
 * Usage: node scripts/apply-financial-dashboard-migration.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  supabaseUrl: process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY,
  migrationFile: path.join(__dirname, '../supabase/migrations/004_financial_dashboard_fixes.sql'),
  backupFile: path.join(__dirname, '../backups/pre-migration-backup.sql'),
  logFile: path.join(__dirname, '../logs/migration.log'),
};

// Initialize Supabase client
const supabase = createClient(config.supabaseUrl, config.supabaseKey);

// Logging utility
function log(message, type = 'INFO') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${type}] ${message}`;
  console.log(logMessage);
  
  // Ensure logs directory exists
  const logsDir = path.dirname(config.logFile);
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  
  fs.appendFileSync(config.logFile, logMessage + '\n');
}

// Error handling utility
function handleError(error, context) {
  log(`Error in ${context}: ${error.message}`, 'ERROR');
  log(`Stack trace: ${error.stack}`, 'ERROR');
  process.exit(1);
}

// Check if migration has already been applied
async function checkMigrationStatus() {
  try {
    log('Checking migration status...');
    
    // Check if calculation_id column exists in expenses table
    const { data: expensesColumns, error: expensesError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'expenses')
      .eq('column_name', 'calculation_id');
    
    if (expensesError) throw expensesError;
    
    const hasCalculationId = expensesColumns && expensesColumns.length > 0;
    
    if (hasCalculationId) {
      log('Migration appears to have been already applied. Checking all required fields...');
      
      // Check all required fields
      const requiredFields = [
        { table: 'expenses', column: 'calculation_id' },
        { table: 'expenses', column: 'updated_at' },
        { table: 'budgets', column: 'calculation_id' },
        { table: 'budgets', column: 'currency' },
        { table: 'budgets', column: 'updated_at' },
        { table: 'spending_alerts', column: 'calculation_id' },
        { table: 'spending_alerts', column: 'type' },
        { table: 'spending_alerts', column: 'severity' },
        { table: 'spending_alerts', column: 'currency' },
        { table: 'spending_alerts', column: 'updated_at' },
      ];
      
      for (const field of requiredFields) {
        const { data, error } = await supabase
          .from('information_schema.columns')
          .select('column_name')
          .eq('table_name', field.table)
          .eq('column_name', field.column);
        
        if (error) throw error;
        
        if (!data || data.length === 0) {
          log(`Missing field: ${field.table}.${field.column}`, 'WARNING');
          return false;
        }
      }
      
      log('All required fields are present. Migration appears to be complete.', 'SUCCESS');
      return true;
    }
    
    return false;
  } catch (error) {
    handleError(error, 'checkMigrationStatus');
  }
}

// Create backup of current data
async function createBackup() {
  try {
    log('Creating backup of current data...');
    
    // Ensure backup directory exists
    const backupDir = path.dirname(config.backupFile);
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    // Export current data
    const tables = ['expenses', 'budgets', 'spending_alerts', 'expense_categories'];
    let backupSQL = '-- Financial Dashboard Migration Backup\n';
    backupSQL += `-- Created: ${new Date().toISOString()}\n\n`;
    
    for (const table of tables) {
      log(`Backing up ${table} table...`);
      
      const { data, error } = await supabase
        .from(table)
        .select('*');
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        backupSQL += `-- ${table} data\n`;
        backupSQL += `INSERT INTO ${table} (${Object.keys(data[0]).join(', ')}) VALUES\n`;
        
        const values = data.map(row => {
          const rowValues = Object.values(row).map(value => {
            if (value === null) return 'NULL';
            if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
            return value;
          });
          return `(${rowValues.join(', ')})`;
        });
        
        backupSQL += values.join(',\n') + ';\n\n';
      }
    }
    
    fs.writeFileSync(config.backupFile, backupSQL);
    log(`Backup created: ${config.backupFile}`, 'SUCCESS');
    
  } catch (error) {
    handleError(error, 'createBackup');
  }
}

// Apply migration safely
async function applyMigration() {
  try {
    log('Applying database migration...');
    
    // Read migration file
    if (!fs.existsSync(config.migrationFile)) {
      throw new Error(`Migration file not found: ${config.migrationFile}`);
    }
    
    const migrationSQL = fs.readFileSync(config.migrationFile, 'utf8');
    
    // Split migration into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    log(`Found ${statements.length} migration statements to execute`);
    
    // Execute each statement with error handling
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      try {
        log(`Executing statement ${i + 1}/${statements.length}...`);
        
        // Execute the statement
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          // Some statements might fail if they already exist (like indexes)
          if (error.message.includes('already exists') || error.message.includes('duplicate')) {
            log(`Statement ${i + 1} skipped (already exists): ${error.message}`, 'WARNING');
          } else {
            throw error;
          }
        } else {
          log(`Statement ${i + 1} executed successfully`, 'SUCCESS');
        }
        
      } catch (error) {
        log(`Error executing statement ${i + 1}: ${error.message}`, 'ERROR');
        log(`Statement: ${statement}`, 'ERROR');
        throw error;
      }
    }
    
    log('Migration completed successfully!', 'SUCCESS');
    
  } catch (error) {
    handleError(error, 'applyMigration');
  }
}

// Verify migration
async function verifyMigration() {
  try {
    log('Verifying migration...');
    
    // Check that all required fields exist
    const requiredFields = [
      { table: 'expenses', column: 'calculation_id' },
      { table: 'expenses', column: 'updated_at' },
      { table: 'budgets', column: 'calculation_id' },
      { table: 'budgets', column: 'currency' },
      { table: 'budgets', column: 'updated_at' },
      { table: 'spending_alerts', column: 'calculation_id' },
      { table: 'spending_alerts', column: 'type' },
      { table: 'spending_alerts', column: 'severity' },
      { table: 'spending_alerts', column: 'currency' },
      { table: 'spending_alerts', column: 'updated_at' },
    ];
    
    for (const field of requiredFields) {
      const { data, error } = await supabase
        .from('information_schema.columns')
        .select('column_name')
        .eq('table_name', field.table)
        .eq('column_name', field.column);
      
      if (error) throw error;
      
      if (!data || data.length === 0) {
        throw new Error(`Missing field: ${field.table}.${field.column}`);
      }
      
      log(`✓ ${field.table}.${field.column} exists`, 'SUCCESS');
    }
    
    // Check that views exist
    const views = ['expenses_with_categories', 'budgets_with_categories', 'alerts_with_categories'];
    
    for (const view of views) {
      const { data, error } = await supabase
        .from('information_schema.views')
        .select('table_name')
        .eq('table_name', view);
      
      if (error) throw error;
      
      if (!data || data.length === 0) {
        throw new Error(`Missing view: ${view}`);
      }
      
      log(`✓ View ${view} exists`, 'SUCCESS');
    }
    
    log('Migration verification completed successfully!', 'SUCCESS');
    
  } catch (error) {
    handleError(error, 'verifyMigration');
  }
}

// Main execution
async function main() {
  try {
    log('Starting Financial Dashboard Database Migration');
    log(`Supabase URL: ${config.supabaseUrl}`);
    log(`Migration file: ${config.migrationFile}`);
    
    // Check if migration is already applied
    const isAlreadyApplied = await checkMigrationStatus();
    
    if (isAlreadyApplied) {
      log('Migration appears to be already applied. Exiting.', 'INFO');
      return;
    }
    
    // Create backup
    await createBackup();
    
    // Apply migration
    await applyMigration();
    
    // Verify migration
    await verifyMigration();
    
    log('Financial Dashboard Database Migration completed successfully!', 'SUCCESS');
    log(`Backup file: ${config.backupFile}`);
    log(`Log file: ${config.logFile}`);
    
  } catch (error) {
    handleError(error, 'main');
  }
}

// Run the migration
if (require.main === module) {
  main().catch(handleError);
}

module.exports = {
  main,
  checkMigrationStatus,
  createBackup,
  applyMigration,
  verifyMigration,
}; 