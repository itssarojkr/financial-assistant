#!/bin/bash

# Financial Dashboard Database Migration Script
# This script safely applies the database schema updates for the Financial Dashboard
# without losing any existing data.

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
MIGRATION_FILE="$PROJECT_DIR/supabase/migrations/004_financial_dashboard_fixes.sql"
BACKUP_DIR="$PROJECT_DIR/backups"
LOG_FILE="$PROJECT_DIR/logs/migration.log"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Logging function
log() {
    local level=$1
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    case $level in
        "INFO")
            echo -e "${BLUE}[$timestamp] [INFO]${NC} $message"
            ;;
        "SUCCESS")
            echo -e "${GREEN}[$timestamp] [SUCCESS]${NC} $message"
            ;;
        "WARNING")
            echo -e "${YELLOW}[$timestamp] [WARNING]${NC} $message"
            ;;
        "ERROR")
            echo -e "${RED}[$timestamp] [ERROR]${NC} $message"
            ;;
    esac
    
    # Ensure log directory exists
    mkdir -p "$(dirname "$LOG_FILE")"
    echo "[$timestamp] [$level] $message" >> "$LOG_FILE"
}

# Error handling
handle_error() {
    log "ERROR" "Migration failed: $1"
    log "ERROR" "Check the log file for details: $LOG_FILE"
    exit 1
}

# Check if Supabase CLI is installed
check_supabase_cli() {
    if ! command -v supabase &> /dev/null; then
        log "ERROR" "Supabase CLI is not installed. Please install it first:"
        log "ERROR" "npm install -g supabase"
        exit 1
    fi
    
    log "SUCCESS" "Supabase CLI found: $(supabase --version)"
}

# Check if we're in a Supabase project
check_supabase_project() {
    if [ ! -f "$PROJECT_DIR/supabase/config.toml" ]; then
        log "ERROR" "Not a Supabase project. Please run this script from a Supabase project directory."
        exit 1
    fi
    
    log "SUCCESS" "Supabase project detected"
}

# Create backup of current data
create_backup() {
    log "INFO" "Creating backup of current data..."
    
    # Ensure backup directory exists
    mkdir -p "$BACKUP_DIR"
    
    # Create backup filename with timestamp
    BACKUP_FILE="$BACKUP_DIR/pre-migration-backup-$TIMESTAMP.sql"
    
    log "INFO" "Backup file: $BACKUP_FILE"
    
    # Export current schema and data
    if supabase db dump --data-only > "$BACKUP_FILE" 2>/dev/null; then
        log "SUCCESS" "Backup created successfully"
    else
        log "WARNING" "Could not create full backup, but migration will continue"
    fi
}

# Check if migration has already been applied
check_migration_status() {
    log "INFO" "Checking if migration has already been applied..."
    
    # Check if calculation_id column exists in expenses table
    if supabase db diff --schema public | grep -q "calculation_id"; then
        log "SUCCESS" "Migration appears to have been already applied"
        return 0
    else
        log "INFO" "Migration needs to be applied"
        return 1
    fi
}

# Apply the migration
apply_migration() {
    log "INFO" "Applying database migration..."
    
    # Check if migration file exists
    if [ ! -f "$MIGRATION_FILE" ]; then
        handle_error "Migration file not found: $MIGRATION_FILE"
    fi
    
    log "INFO" "Migration file: $MIGRATION_FILE"
    
    # Apply the migration using Supabase CLI
    if supabase db push; then
        log "SUCCESS" "Migration applied successfully"
    else
        handle_error "Failed to apply migration"
    fi
}

# Verify the migration
verify_migration() {
    log "INFO" "Verifying migration..."
    
    # Check that all required fields exist
    local required_fields=(
        "expenses.calculation_id"
        "expenses.updated_at"
        "budgets.calculation_id"
        "budgets.currency"
        "budgets.updated_at"
        "spending_alerts.calculation_id"
        "spending_alerts.type"
        "spending_alerts.severity"
        "spending_alerts.currency"
        "spending_alerts.updated_at"
    )
    
    for field in "${required_fields[@]}"; do
        local table="${field%.*}"
        local column="${field#*.}"
        
        # Check if column exists using Supabase CLI
        if supabase db diff --schema public | grep -q "$column"; then
            log "SUCCESS" "✓ $field exists"
        else
            log "WARNING" "⚠ $field may be missing"
        fi
    done
    
    # Check that views exist
    local views=(
        "expenses_with_categories"
        "budgets_with_categories"
        "alerts_with_categories"
    )
    
    for view in "${views[@]}"; do
        if supabase db diff --schema public | grep -q "$view"; then
            log "SUCCESS" "✓ View $view exists"
        else
            log "WARNING" "⚠ View $view may be missing"
        fi
    done
    
    log "SUCCESS" "Migration verification completed"
}

# Main execution
main() {
    log "INFO" "Starting Financial Dashboard Database Migration"
    log "INFO" "Project directory: $PROJECT_DIR"
    log "INFO" "Migration file: $MIGRATION_FILE"
    log "INFO" "Backup directory: $BACKUP_DIR"
    log "INFO" "Log file: $LOG_FILE"
    
    # Check prerequisites
    check_supabase_cli
    check_supabase_project
    
    # Check if migration is already applied
    if check_migration_status; then
        log "INFO" "Migration appears to be already applied. Exiting."
        exit 0
    fi
    
    # Create backup
    create_backup
    
    # Apply migration
    apply_migration
    
    # Verify migration
    verify_migration
    
    log "SUCCESS" "Financial Dashboard Database Migration completed successfully!"
    log "INFO" "Backup file: $BACKUP_FILE"
    log "INFO" "Log file: $LOG_FILE"
}

# Run the migration
main "$@" 