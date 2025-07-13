# Database Migration Scripts

This directory contains scripts for safely applying database migrations to the Financial Assistant project.

## Migration Scripts

### Financial Dashboard Migration

The `migrate-financial-dashboard.ps1` script applies the database schema updates needed for the Financial Dashboard functionality.

#### Prerequisites

1. **Supabase CLI**: Install the Supabase CLI globally
   ```bash
   npm install -g supabase
   ```

2. **Supabase Project**: Ensure you're in a Supabase project directory with `supabase/config.toml`

3. **Environment Variables**: Set up your Supabase environment variables:
   - `SUPABASE_URL` or `VITE_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY` or `VITE_SUPABASE_ANON_KEY`

#### Usage

##### Using npm scripts (Recommended)

```bash
# Apply migration with backup
npm run migrate:financial-dashboard

# Force apply migration (even if already applied)
npm run migrate:financial-dashboard:force

# Skip backup (not recommended for production)
npm run migrate:financial-dashboard:skip-backup

# Verbose output
npm run migrate:financial-dashboard:verbose
```

##### Direct PowerShell execution

```powershell
# Basic migration
.\scripts\migrate-financial-dashboard.ps1

# With options
.\scripts\migrate-financial-dashboard.ps1 -Force -Verbose
```

#### What the Migration Does

The Financial Dashboard migration adds the following to your database:

1. **New Columns**:
   - `calculation_id` in `expenses`, `budgets`, and `spending_alerts` tables
   - `currency` in `budgets` and `spending_alerts` tables
   - `type`, `severity` in `spending_alerts` table
   - `updated_at` timestamps in all tables

2. **Indexes**:
   - Performance indexes on frequently queried columns
   - Composite indexes for efficient joins

3. **RLS Policies**:
   - Enhanced security policies for data access
   - User-specific data isolation

4. **Views**:
   - `expenses_with_categories`: Joined expense and category data
   - `budgets_with_categories`: Joined budget and category data
   - `alerts_with_categories`: Joined alert and category data

5. **Triggers**:
   - Automatic `updated_at` timestamp updates
   - Data validation triggers

#### Safety Features

- **Automatic Backup**: Creates a timestamped backup before applying changes
- **Migration Status Check**: Detects if migration has already been applied
- **Error Handling**: Comprehensive error handling with detailed logging
- **Verification**: Post-migration verification of all changes
- **Rollback Capability**: Backup files can be used to restore data if needed

#### Files Created

- **Backup**: `backups/pre-migration-backup-YYYYMMDD_HHMMSS.sql`
- **Logs**: `logs/migration.log`

#### Troubleshooting

1. **Migration already applied**: Use `-Force` flag to reapply
2. **Supabase CLI not found**: Install with `npm install -g supabase`
3. **Permission errors**: Run PowerShell as Administrator
4. **Connection errors**: Check your Supabase environment variables

#### Rollback

If you need to rollback the migration:

1. Stop your application
2. Restore from backup: `supabase db reset --linked`
3. Apply the backup SQL manually or use Supabase dashboard

#### Support

For issues with the migration:
1. Check the log file: `logs/migration.log`
2. Verify Supabase CLI installation: `supabase --version`
3. Check environment variables are set correctly
4. Ensure you have proper database permissions 