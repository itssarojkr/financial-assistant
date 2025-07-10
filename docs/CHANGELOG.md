# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased] - 2024-12-19

### 🚀 **Major Android App Improvements**

### 🔧 **UI/UX Improvements**
- **Fixed Automatic Currency Selection**: Resolved critical issue where automatic currency selection based on country was not working properly. Fixed conflicting useEffect hooks that were interfering with each other and enhanced the `getDefaultCurrencyForCountry` function to handle both country codes and country names.
- **Moved Load Button**: Relocated the "Load Saved" button from the CountrySelector component to be alongside the Reset button in the main layout for better accessibility and consistency.
- **Enhanced Location Data Population**: Fixed critical issue where loading saved calculations was not populating location details (state, city, locality) completely. Updated the data structure to include all location fields and properly populate them when loading calculations.
- **Fixed TypeScript Errors**: Resolved type compatibility issues with SaveCalculationModal and LoadCalculationModal components by updating interfaces to include location data fields.
- **Improved Data Persistence**: Enhanced the TaxCalculationData interface to include complete location information (countryCode, state, stateId, city, cityId, locality, localityId, isNative) ensuring all location details are saved and restored properly.
- **Fixed Expense Categories Loading**: Added missing `getCategories()` method to OptimizedExpenseService to properly load expense categories from the database. Categories are now cached for better performance.
- **Enhanced Financial Dashboard UI**: Completely redesigned the Expense, Budget, and Alerts tabs with modern, responsive UI improvements:
  - **Expenses Tab**: Added search functionality, category filters, time period filters, improved table styling with hover effects, action buttons, and better empty state with call-to-action.
  - **Budgets Tab**: Added overview cards showing total budget, spent amount, and remaining budget. Enhanced table with progress bars, color-coded status indicators, and improved empty state.
  - **Alerts Tab**: Redesigned as a card-based layout with severity color coding, overview statistics, improved visual hierarchy, and better empty state messaging.
- **Improved Form Dialogs**: Enhanced all form dialogs with proper headers, descriptions, and better responsive design for mobile devices.

### 🚀 **Major Android App Improvements**

#### **Authentication & Data Management**
- ✅ **Added comprehensive authentication system** to mobile app
  - Sign-in modal integration with proper user state management
  - Save/load calculation functionality with user authentication
  - Automatic calculation saving after successful sign-in
  - User status indicators showing signed-in state

#### **Mobile-Specific Features**
- ✅ **Enhanced mobile notification system**
  - Comprehensive notification settings with 8 different categories
  - Permission management for device notifications
  - Test notification functionality
  - Tax reminders, expense tracking, financial insights, budget alerts
  - Market updates, weekly/monthly reports, custom reminders
  - Reset to default settings option

- ✅ **Advanced mobile expense form**
  - Camera integration for receipt capture
  - Location services with current location detection
  - Multi-currency support (USD, EUR, GBP, CAD, AUD, INR, JPY, CHF)
  - Tag system for expense categorization
  - Recurring expense support (weekly/monthly/yearly)
  - File upload for receipt images
  - Real-time validation and error handling
  - Mobile-optimized UI with touch-friendly controls

#### **Type Safety & Error Handling**
- ✅ **Fixed all critical TypeScript errors**
  - Resolved React Hooks conditional calls
  - Fixed type compatibility issues between country-specific tax data
  - Proper type assertions for data structures
  - Eliminated all `any` type usage
  - Fixed component prop type mismatches

#### **User Experience Improvements**
- ✅ **Enhanced mobile navigation**
  - Quick action cards for new calculations and saved history
  - Tab-based navigation (Location & Salary, Tax Calculation, Analysis)
  - User status indicators with authentication prompts
  - Floating save button for calculations

- ✅ **Improved data persistence**
  - Save calculation modal with overwrite/new options
  - Load calculation modal with user's saved calculations
  - Automatic calculation loading with proper type conversion
  - Expense data integration with saved calculations

#### **Mobile-Optimized Components**
- ✅ **Mobile notification settings component**
  - Permission status display with enable/disable functionality
  - Category-based notification toggles
  - Report frequency controls
  - Test notification capability
  - Helpful tips and guidance

- ✅ **Mobile expense form component**
  - Camera capture for receipts
  - Location services integration
  - Multi-currency support
  - Tag management system
  - Recurring expense configuration
  - Real-time validation
  - Mobile-optimized layout

### 🔧 **Technical Improvements**

#### **Type System Enhancements**
- Fixed type compatibility between different tax data structures
- Proper interface definitions for saved calculations
- Type-safe modal prop handling
- Eliminated conditional React Hooks calls

#### **Mobile Services Integration**
- Geolocation services for expense tracking
- Camera API integration for receipt capture
- File upload handling for receipt images
- Notification permission management

#### **Performance Optimizations**
- Proper state management for mobile components
- Efficient data loading and caching
- Optimized re-renders with proper dependencies
- Mobile-specific UI optimizations

### 📱 **Android-Specific Features**

#### **Missing Features Now Implemented**
1. **Authentication System** - Complete sign-in/sign-up flow
2. **Save/Load Calculations** - Full CRUD operations for user data
3. **Mobile Notifications** - Comprehensive notification management
4. **Camera Integration** - Receipt capture and image upload
5. **Location Services** - GPS integration for expense tracking
6. **Multi-Currency Support** - 8 major currencies supported
7. **Tag System** - Flexible expense categorization
8. **Recurring Expenses** - Automated expense tracking
9. **Mobile-Optimized UI** - Touch-friendly interface design
10. **Real-time Validation** - Form validation with user feedback

#### **Enhanced Mobile Experience**
- Responsive design optimized for mobile screens
- Touch-friendly controls and gestures
- Offline-capable functionality
- Native mobile features integration
- Performance optimizations for mobile devices

### 🐛 **Bug Fixes**
- Fixed React Hooks conditional calls causing build failures
- Resolved type compatibility issues between tax data structures
- Fixed component prop type mismatches
- Eliminated all TypeScript `any` type usage
- Fixed notification permission handling
- Resolved camera API integration issues
- **Savings Analysis Graphs for Loaded Calculations**: Fixed critical issue where graphs in the savings analysis tab were not displaying for loaded calculations. The problem was that `memoizedTaxData` was not properly updating when tax data was loaded from saved calculations. Added all individual tax data states to the dependency array to ensure proper reactivity.
- **Navigation Flow for Loaded Calculations**: Fixed navigation to start from the "Location & Salary" tab (basics) instead of going directly to the analysis tab when loading a calculation. This provides a better user experience by allowing users to review and modify the loaded data before proceeding.
- **Tax Data Reactivity**: Enhanced the `memoizedTaxData` calculation to directly compute the current tax data based on country instead of relying on mutable variables, ensuring proper reactivity when tax data is loaded from saved calculations.
- **Tax Calculation Tab for Unauthenticated Users**: Fixed issue where tax calculation tab was not showing calculations for unauthenticated users. The problem was caused by the `hasCalculation` logic using `currentTaxData` instead of `memoizedTaxData`. Updated all references to use the correct reactive tax data source.
- **Tax Data Consistency**: Ensured all functions (`checkExistingCalculation`, `saveCalculationAsNew`, `hasCalculation`) use `memoizedTaxData` for consistency and proper reactivity.
- **Debug Information**: Added development-only debug information to the tax calculation tab to help identify calculation issues.
- **Tax Calculation Values Showing as 0**: Fixed issue where tax brackets and calculated tax values were showing as 0 for unauthenticated users. The problem was that the `setTaxData` function was not properly updating the country-specific tax data states. Added debug logging to track tax calculation flow and ensure proper state updates.

### Changed
- **Tax Calculation Logic**: Updated `hasCalculation` logic to use `memoizedTaxData` instead of `currentTaxData` for better reactivity and consistency across authenticated and unauthenticated users.
- **Debug Logging**: Added comprehensive debug logging to track tax calculation flow and identify issues with state updates.
- **State Management**: Replaced mutable `setTaxData` reassignment with a proper `useCallback` implementation that correctly handles country-specific tax data updates.

### 📚 **Documentation**
- Updated mobile features documentation
- Added comprehensive changelog entries
- Documented Android-specific improvements
- Added troubleshooting guides for mobile issues

### UI/UX Improvements
- **Button Layout**: Reorganized the three action buttons (Continue, Load, Reset) into a centered, compact layout without horizontal dividers for a cleaner appearance.
- **Text Box Sizing**: Shortened all form input fields by adding `max-w-md` constraints to create a more organized and compact form layout.
- **Form Organization**: Improved the visual hierarchy by making input fields more proportional and reducing visual clutter.
- **Responsive Design**: Optimized the 2-column layout to be visible on screens with a minimum width of 768px (md breakpoint), providing better usability on medium-sized screens and tablets.
- **Vertical Divider Positioning**: Fixed the vertical divider positioning by using absolute positioning with proper centering (`left-1/2` and `transform -translate-x-1/2`) to ensure it appears correctly between the two columns on medium screens and above.

### Added
- **Database Table Migration**: Migrated expenses, budgets, and alerts from JSON storage to proper database tables
  - Expenses now stored in `expenses` table with proper relationships
  - Budgets now stored in `budgets` table with proper relationships  
  - Alerts now stored in `spending_alerts` table with proper relationships
  - Added proper foreign key relationships to `expense_categories` table
  - Data now persists across page refreshes and browser sessions
- **Enhanced UserDataService**: Added new methods for database table operations
  - `getUserExpenses()` - Load expenses from database table
  - `addExpense()` - Add expense to database table
  - `updateExpense()` - Update existing expense
  - `deleteExpense()` - Delete expense from database
  - `getUserBudgets()` - Load budgets from database table
  - `addBudget()` - Add budget to database table
  - `updateBudget()` - Update existing budget
  - `deleteBudget()` - Delete budget from database
  - `getUserAlerts()` - Load alerts from database table
  - `addAlert()` - Add alert to database table
  - `updateAlert()` - Update existing alert
  - `deleteAlert()` - Delete alert from database
  - `getExpenseCategories()` - Load categories from database table
- **Android-specific sync features**: Added automatic background synchronization for Android devices only
  - Created `useAndroid` hook for Android platform detection
  - Created `AutoSyncService` for automatic background sync when internet is available
  - Sync status card now only appears on Android devices
  - Manual sync controls removed from web app, only available on Android
  - Automatic sync queue management for offline operations
- **Enhanced Financial Dashboard UI**: Improved expense, budget, and alert management
  - Added category name display instead of category IDs in all tabs
  - Implemented proper budget progress calculation and correlation with expenses
  - Added triggered alerts detection and display
  - Enhanced search functionality to include category names
  - Improved budget progress bars with color-coded status indicators
  - Added real-time correlation between budgets, expenses, and alerts
  - Fixed budget progress calculation to show actual spending vs budget amounts
  - Added triggered alerts count in summary cards

### Changed
- **Data Persistence**: Expenses, budgets, and alerts now persist in database tables instead of JSON storage
- **Sync Logic**: Moved manual sync controls to Android-only, web app now uses immediate sync
- **Category Display**: All category IDs now display as readable category names
- **Budget Progress**: Progress bars now accurately reflect spending vs budget amounts
- **Alert System**: Alerts now properly trigger based on actual spending vs thresholds

### Fixed
- **Data Persistence Issue**: Fixed expenses, budgets, and alerts disappearing on page refresh by migrating to proper database tables
- **Budget-Expense Correlation**: Fixed issue where budget progress bars weren't updating with actual expenses
- **Alert Triggering**: Fixed alerts not triggering when spending thresholds were exceeded
- **Category Display**: Fixed category IDs showing instead of category names
- **TypeScript Errors**: Fixed various type mismatches in the dashboard components

### Technical
- Added `src/presentation/hooks/ui/useAndroid.ts` for Android platform detection
- Added `src/infrastructure/services/AutoSyncService.ts` for background sync management
- Enhanced `UserDataService` with proper database table methods
- Updated `FinancialDashboard` component to use database tables instead of JSON storage
- Database tables already exist in schema: `expenses`, `budgets`, `spending_alerts`, `expense_categories`

## [Unreleased]

### Added
- **Financial Dashboard Overview Correlation**: Connected the overview page with actual budget, expense, and alert data from the database
  - Overview now displays real total spending, average daily spending, and transaction counts
  - Top spending categories are calculated and displayed with progress bars
  - Budget performance shows actual spending vs budget limits with color-coded progress bars
  - Recent activity section shows latest expenses and triggered alerts
  - Empty states with helpful guidance when no data is available

### Enhanced
- **Edit/Delete Functionality**: Added working edit and delete buttons for expenses, budgets, and alerts
  - Delete buttons now properly remove items from the database and update local state
  - Edit buttons are prepared for future modal implementation (currently log to console)
  - All buttons include proper accessibility labels and hover states
  - Confirmation dialogs for destructive actions
- **Budget Overview Cards**: Fixed budget overview cards to display real calculated data
  - Total Budget now shows sum of all budget amounts
  - Spent amount shows actual spending from expenses
  - Remaining amount shows budget minus spent
  - Percentage calculation shows actual spending vs budget ratio
- **Alert Table Display**: Converted alert display from grid to table format for consistency
  - Alerts now display in a table similar to budgets and expenses
  - Added columns for Category, Threshold, Type, Severity, Status, and Actions
  - Shows triggered status with visual indicators
  - Consistent styling with other tables in the dashboard

### Fixed
- **React Hooks Error**: Fixed "Rendered more hooks than during the previous render" error in FinancialDashboard
  - Moved all useMemo hooks before the conditional return statement
  - Ensured consistent hook ordering across all renders
  - Resolved violation of Rules of Hooks
- **Data Persistence**: Migrated from JSON storage to proper database tables for financial data
  - Expenses, budgets, and alerts now use dedicated database tables instead of JSON storage
  - Data persists across page refreshes and browser sessions
  - Proper foreign key relationships with expense categories
  - Added UserDataService methods for CRUD operations on financial data

### Technical
- **Type Safety**: Enhanced TypeScript interfaces for financial data structures
- **Performance**: Added useMemo hooks for expensive calculations (summary data, top categories, budget performance)
- **Error Handling**: Improved error handling for database operations with user-friendly messages

## [Previous Versions]

### [1.0.0] - 2024-12-18
- Initial release with basic tax calculation functionality
- Web app with core features
- Basic mobile detection and routing 

### Fixed
- **Country Selection Bug**: Fixed critical issue where selecting a country in the CountrySelector component was not properly updating `salaryData.country`. The `onValueChange` handler was only updating `selectedCountryId` but not calling the `handleCountryChange` function that actually updates the salary data. This caused the debug console to show empty `salaryDataCountry` values even after country selection.
- **State and City Selection**: Fixed similar issues with state and city selection handlers to ensure proper data flow and validation.
- **Tax Calculator Button Visibility**: Fixed issue where unauthenticated users couldn't see the "Next" button to proceed with calculations even after entering all required values. The button now properly validates that tax calculations have been completed before enabling navigation to the analysis tab.
- **Savings Analysis Graphs for Loaded Calculations**: Fixed critical issue where graphs in the savings analysis tab were not displaying for loaded calculations. The problem was that `memoizedTaxData` was not properly updating when tax data was loaded from saved calculations. Added all individual tax data states to the dependency array to ensure proper reactivity.
- **Navigation Flow for Loaded Calculations**: Fixed navigation to start from the "Location & Salary" tab (basics) instead of going directly to the analysis tab when loading a calculation. This provides a better user experience by allowing users to review and modify the loaded data before proceeding.
- **Tax Data Reactivity**: Enhanced the `memoizedTaxData` calculation to directly compute the current tax data based on country instead of relying on mutable variables, ensuring proper reactivity when tax data is loaded from saved calculations.

### Added
- **Enhanced User Experience**: Improved button state management with visual feedback (disabled state with gray styling) when calculations are incomplete.
- **Validation Logic**: Added comprehensive validation to ensure tax calculations are complete before allowing progression to the next step.
- **Proper Event Handling**: Updated all location selection handlers to use the correct functions that update both the UI state and the underlying salary data.
- **Unified Card Layout**: Redesigned the Location & Salary section to use a single card with a vertical divider separating location and salary information, providing a cleaner and more cohesive user interface.

### Technical Improvements
- **Type Safety**: Enhanced type safety in tax calculation components with proper prop validation.
- **Component Props**: Updated component interfaces to match expected prop types for better type safety.
- **Data Flow**: Fixed data flow issues in CountrySelector component to ensure proper state synchronization between UI components and salary data.
- **UI Layout**: Improved the layout structure with better visual hierarchy, responsive design, and cleaner button placement outside the divided content area.
- **Responsive Design**: Optimized the 2-column layout to be visible on screens with a minimum width of 768px (md breakpoint), providing better usability on medium-sized screens and tablets.
- **Vertical Divider Positioning**: Fixed the vertical divider positioning by using absolute positioning with proper centering (`left-1/2` and `transform -translate-x-1/2`) to ensure it appears correctly between the two columns on medium screens and above. 

### Fixed
- **UserDashboard Null Reference Error**: Fixed "Cannot read properties of null (reading 'toFixed')" error in the UserDashboard component. Added null checks for `effectiveTaxRate` and other data fields to prevent crashes when saved calculation data contains null values.
- **Financial Dashboard Button Navigation**: Fixed issue where the "Financial Dashboard" button in the navigation bar was redirecting to the homepage instead of the dashboard. Changed the navigation path from `/` to `/dashboard` in both the main navigation and dropdown menu.
- **Dynamic Import Error**: Fixed "Failed to fetch dynamically imported module" error that was preventing the application from loading. The issue was caused by trying to reassign a `const` variable (`setTaxData`) in useEffect blocks. Replaced the reassignment logic with a proper `useCallback` implementation that handles country-specific tax data updates correctly.
- **Tax Calculation Values Showing as 0**: Fixed issue where tax brackets and calculated tax values were showing as 0 for unauthenticated users. The problem was that the `setTaxData` function was not properly updating the country-specific tax data states. Added debug logging to track tax calculation flow and ensure proper state updates.
- **Tax Calculation Tab for Unauthenticated Users**: Fixed issue where tax calculation tab was not showing calculations for unauthenticated users. The problem was caused by the `hasCalculation` logic using `currentTaxData` instead of `memoizedTaxData`. Updated all references to use the correct reactive tax data source.
- **Tax Data Consistency**: Ensured all functions (`checkExistingCalculation`, `saveCalculationAsNew`, `hasCalculation`) use `memoizedTaxData` for consistency and proper reactivity.
- **Debug Information**: Added development-only debug information to the tax calculation tab to help identify calculation issues. 

### Changed
- **Financial Dashboard Page Consistency**: Updated the Financial Dashboard page to have the same structure and styling as the tax calculator page for better consistency across the application. This includes using the same background gradient, header component, and container structure. 
- **Clickable Financial Assistant Logo**: Made the Financial Assistant logo in the header clickable to navigate to the home page. Added hover effects and proper styling for better user experience.

### Added
- **Save Calculation Validation**: Added comprehensive validation to prevent users from saving calculations unless they have entered complete details. Required fields include country, state/province, valid salary amount, and currency. City and locality remain optional. Tax calculation must also be complete before saving is allowed. 

### Fixed
- **Alert Overview Cards**: Fixed alert overview cards in Financial Dashboard to show proper calculated values instead of hardcoded data
  - "Triggered Today" now shows alerts that have exceeded their threshold based on today's expenses
  - "This Week" now shows alerts that have exceeded their threshold based on the last 7 days of expenses
  - Both cards now properly filter active alerts and calculate spending against thresholds
  - Improved accuracy of alert monitoring and reporting
- **Edit Buttons**: Fixed edit buttons for budgets, expenses, and alerts that were previously only logging to console
  - Added proper state management for edit modals
  - Implemented edit functionality with pre-populated forms
  - Added edit modals for all three item types (expenses, budgets, alerts)
  - Edit buttons now open appropriate edit forms with existing data
- **Alert Type Column**: Fixed empty alert type column in the alerts table
  - Added default value 'amount' for alerts that don't have a type specified
  - Updated alert creation to include type and severity fields in database
  - Improved data consistency for alert type and severity display
  - Enhanced alert form integration to properly save all alert fields
- **Alert Status Display**: Fixed alert status not reflecting correctly in the alerts table
  - Fixed mapping between database 'active' field and Alert interface 'is_active' field
  - Added proper data transformation when loading alerts from database
  - Ensured alert status (Active/Inactive) displays correctly in the UI
  - Fixed alert filtering logic to properly check active status
- **Database Optimization**: Implemented efficient calculation-specific database queries
  - Added calculation_id fields to expenses, budgets, and alerts tables via migration
  - Created efficient database queries that filter by calculation_id instead of client-side filtering
  - Added proper indexes for calculation_id fields to improve query performance
  - Updated UserDataService with calculation-specific methods (getCalculationExpenses, getCalculationBudgets, getCalculationAlerts)
  - Improved data loading performance by eliminating client-side filtering
  - Added proper RLS policies for calculation-linked data
  - Enhanced data organization with calculation-specific isolation 
- **UI Improvements**: Enhanced Financial Dashboard calculation selection and header design
  - Redesigned calculation selection header with gradient background and improved styling
  - Added detailed calculation info card showing salary, tax, and currency information
  - Improved button styling with color-coded actions (blue for new calculation, green for refresh)
  - Enhanced calculation dropdown with better formatting and favorite star indicators
  - Added visual hierarchy with icons and better spacing for improved user experience
  - Improved responsive design for mobile and desktop layouts 
- **Calculation Overview**: Merged selected calculation and overview cards for better UX
  - Combined calculation details and financial overview into a single comprehensive card
  - Added financial overview section showing spending, budgets, alerts, and categories
  - Improved visual organization with clear sections and better data presentation
  - Enhanced calculation info display with better formatting and currency indicators
- **Data Visibility Fix**: Fixed issue where budget/expense/alert items were not visible after adding
  - Added automatic data refresh after adding new items to ensure immediate visibility
  - Improved data consistency by refreshing from database after item creation
  - Enhanced user experience with immediate feedback when adding financial items 

### Fixed
- Fixed syntax error in FinancialDashboard component where conditional rendering was missing proper indentation
- Fixed TypeScript error in Index.tsx where existingCalculation prop type mismatch was causing compilation issues
- Fixed missing closing parenthesis in conditional rendering blocks
- Improved type safety for SaveCalculationModal props
- **CRITICAL**: Fixed database migration issues that were preventing calculation_id columns from being created
- Made all migration files idempotent by adding DROP POLICY IF EXISTS and DROP TRIGGER IF EXISTS statements
- Removed problematic indexes that used CURRENT_DATE in predicates (PostgreSQL requires immutable functions)
- Removed performance monitoring views that depended on pg_stat_statements extension
- Successfully applied all database migrations including calculation_id columns and currency columns
- **IMPORTANT**: Fixed FinancialDashboard loading issues after adding budget/expense items
- Fixed infinite loading state caused by refresh logic conflicts
- Improved UX by removing full page refreshes after adding items
- Added proper success feedback with toast notifications instead of page reloads
- Enhanced data loading efficiency with separate refresh function
- Fixed missing currency columns in budgets and spending_alerts tables
- **DATABASE**: Fixed missing severity and type columns in spending_alerts table that were causing 400 errors
- Added proper constraints and indexes for alert severity and type columns
- **UI**: Fixed alerts always showing as inactive due to incorrect field mapping from database 'active' to interface 'is_active' 

### Changed
- Enhanced calculation overview card with comprehensive financial summary
- Improved data visibility by adding automatic refresh after adding items
- Merged selected calculation and overview cards for better UX
- Added proper error handling for calculation-specific data loading
- **DATABASE**: Added calculation_id columns to expenses, budgets, and spending_alerts tables
- **DATABASE**: Created indexes for calculation_id fields for efficient querying
- **DATABASE**: Updated RLS policies to be idempotent and optimized for performance
- **DATABASE**: Added helper functions for calculation currency and ownership validation

### Added
- Database migration for calculation_id fields with indexes and RLS policies
- Enhanced UserDataService with calculation-specific queries
- Optimized data loading in the dashboard with calculation-specific filtering
- Comprehensive calculation overview card with financial summary
- Automatic refresh after adding budget/expense/alert items
- Toast notifications for better user feedback
- **ANDROID**: New FinancialDataService for handling calculation-specific data operations
- **ANDROID**: AutoSyncService for background synchronization of financial data
- **ANDROID**: Enhanced MainActivity with improved deep linking and lifecycle management
- **ANDROID**: Updated Android manifest with new permissions and intent filters
- **ANDROID**: Enhanced build.gradle with new dependencies for background services
- **ANDROID**: Comprehensive sync script for building and deploying updated Android app
- **ANDROID**: Support for calculation-specific navigation and data management
- **ANDROID**: Background alert checking and notification system 