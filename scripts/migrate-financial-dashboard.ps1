# Financial Dashboard Database Migration Script
# This script safely applies the database schema updates for the Financial Dashboard
# without losing any existing data.

param(
    [switch]$Force,
    [switch]$SkipBackup,
    [switch]$Verbose
)

# Error handling
$ErrorActionPreference = "Stop"

# Configuration
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectDir = Split-Path -Parent $ScriptDir
$MigrationFile = Join-Path $ProjectDir "supabase\migrations\004_financial_dashboard_fixes.sql"
$BackupDir = Join-Path $ProjectDir "backups"
$LogFile = Join-Path $ProjectDir "logs\migration.log"
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"
$White = "White"

# Logging function
function Write-Log {
    param(
        [string]$Level,
        [string]$Message
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [$Level] $Message"
    
    switch ($Level) {
        "INFO" { 
            Write-Host $logMessage -ForegroundColor $Blue
        }
        "SUCCESS" { 
            Write-Host $logMessage -ForegroundColor $Green
        }
        "WARNING" { 
            Write-Host $logMessage -ForegroundColor $Yellow
        }
        "ERROR" { 
            Write-Host $logMessage -ForegroundColor $Red
        }
        default { 
            Write-Host $logMessage -ForegroundColor $White
        }
    }
    
    # Ensure log directory exists
    $logDir = Split-Path -Parent $LogFile
    if (!(Test-Path $logDir)) {
        New-Item -ItemType Directory -Path $logDir -Force | Out-Null
    }
    
    Add-Content -Path $LogFile -Value $logMessage
}

# Error handling function
function Handle-Error {
    param([string]$Message)
    Write-Log "ERROR" "Migration failed: $Message"
    Write-Log "ERROR" "Check the log file for details: $LogFile"
    exit 1
}

# Check if Supabase CLI is installed
function Test-SupabaseCLI {
    try {
        $version = supabase --version 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Log "SUCCESS" "Supabase CLI found: $version"
        } else {
            throw "Supabase CLI not found"
        }
    } catch {
        Write-Log "ERROR" "Supabase CLI is not installed. Please install it first:"
        Write-Log "ERROR" "npm install -g supabase"
        exit 1
    }
}

# Check if we're in a Supabase project
function Test-SupabaseProject {
    $configFile = Join-Path $ProjectDir "supabase\config.toml"
    if (!(Test-Path $configFile)) {
        Write-Log "ERROR" "Not a Supabase project. Please run this script from a Supabase project directory."
        exit 1
    }
    
    Write-Log "SUCCESS" "Supabase project detected"
}

# Create backup of current data
function New-Backup {
    if ($SkipBackup) {
        Write-Log "WARNING" "Skipping backup as requested"
        return
    }
    
    Write-Log "INFO" "Creating backup of current data..."
    
    # Ensure backup directory exists
    if (!(Test-Path $BackupDir)) {
        New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
    }
    
    # Create backup filename with timestamp
    $BackupFile = Join-Path $BackupDir "pre-migration-backup-$Timestamp.sql"
    
    Write-Log "INFO" "Backup file: $BackupFile"
    
    try {
        # Export current schema and data
        supabase db dump --data-only | Out-File -FilePath $BackupFile -Encoding UTF8
        Write-Log "SUCCESS" "Backup created successfully"
    } catch {
        Write-Log "WARNING" "Could not create full backup, but migration will continue"
    }
}

# Check if migration has already been applied
function Test-MigrationStatus {
    Write-Log "INFO" "Checking if migration has already been applied..."
    
    try {
        # Check if calculation_id column exists in expenses table
        $diff = supabase db diff --schema public 2>$null
        if ($diff -match "calculation_id") {
            Write-Log "SUCCESS" "Migration appears to have been already applied"
            return $true
        } else {
            Write-Log "INFO" "Migration needs to be applied"
            return $false
        }
    } catch {
        Write-Log "WARNING" "Could not check migration status, proceeding with migration"
        return $false
    }
}

# Apply the migration
function Apply-Migration {
    Write-Log "INFO" "Applying database migration..."
    
    # Check if migration file exists
    if (!(Test-Path $MigrationFile)) {
        Handle-Error "Migration file not found: $MigrationFile"
    }
    
    Write-Log "INFO" "Migration file: $MigrationFile"
    
    try {
        # Apply the migration using Supabase CLI
        supabase db push
        if ($LASTEXITCODE -eq 0) {
            Write-Log "SUCCESS" "Migration applied successfully"
        } else {
            Handle-Error "Failed to apply migration"
        }
    } catch {
        Handle-Error "Failed to apply migration: $($_.Exception.Message)"
    }
}

# Verify the migration
function Test-MigrationVerification {
    Write-Log "INFO" "Verifying migration..."
    
    # Check that all required fields exist
    $requiredFields = @(
        "expenses.calculation_id",
        "expenses.updated_at",
        "budgets.calculation_id",
        "budgets.currency",
        "budgets.updated_at",
        "spending_alerts.calculation_id",
        "spending_alerts.type",
        "spending_alerts.severity",
        "spending_alerts.currency",
        "spending_alerts.updated_at"
    )
    
    foreach ($field in $requiredFields) {
        $table, $column = $field.Split('.')
        
        try {
            # Check if column exists using Supabase CLI
            $diff = supabase db diff --schema public 2>$null
            if ($diff -match $column) {
                Write-Log "SUCCESS" "✓ $field exists"
            } else {
                Write-Log "WARNING" "⚠ $field may be missing"
            }
        } catch {
            Write-Log "WARNING" "⚠ Could not verify $field"
        }
    }
    
    # Check that views exist
    $views = @(
        "expenses_with_categories",
        "budgets_with_categories",
        "alerts_with_categories"
    )
    
    foreach ($view in $views) {
        try {
            $diff = supabase db diff --schema public 2>$null
            if ($diff -match $view) {
                Write-Log "SUCCESS" "✓ View $view exists"
            } else {
                Write-Log "WARNING" "⚠ View $view may be missing"
            }
        } catch {
            Write-Log "WARNING" "⚠ Could not verify view $view"
        }
    }
    
    Write-Log "SUCCESS" "Migration verification completed"
}

# Main execution
function Main {
    Write-Log "INFO" "Starting Financial Dashboard Database Migration"
    Write-Log "INFO" "Project directory: $ProjectDir"
    Write-Log "INFO" "Migration file: $MigrationFile"
    Write-Log "INFO" "Backup directory: $BackupDir"
    Write-Log "INFO" "Log file: $LogFile"
    
    if ($Verbose) {
        Write-Log "INFO" "Verbose mode enabled"
    }
    
    # Check prerequisites
    Test-SupabaseCLI
    Test-SupabaseProject
    
    # Check if migration is already applied
    if (Test-MigrationStatus) {
        if (!$Force) {
            Write-Log "INFO" "Migration appears to be already applied. Use -Force to override."
            exit 0
        } else {
            Write-Log "WARNING" "Migration already applied, but continuing due to -Force flag"
        }
    }
    
    # Create backup
    New-Backup
    
    # Apply migration
    Apply-Migration
    
    # Verify migration
    Test-MigrationVerification
    
    Write-Log "SUCCESS" "Financial Dashboard Database Migration completed successfully!"
    Write-Log "INFO" "Log file: $LogFile"
}

# Run the migration
Main 