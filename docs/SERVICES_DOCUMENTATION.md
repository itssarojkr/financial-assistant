# Services & Functions Documentation

This document provides a comprehensive overview of all services and functions in the Financial Assistant codebase, including their methods, parameters, and usage locations.

## 📋 **Table of Contents**

1. [Application Services](#application-services)
2. [Infrastructure Services](#infrastructure-services)
3. [Missing/Incorrect Function Calls](#missingincorrect-function-calls)
4. [Service Usage Analysis](#service-usage-analysis)

---

## 🏗️ **Application Services**

### **1. UserDataService** (`src/application/services/UserDataService.ts`)

**Purpose**: Manages user data storage and retrieval operations

**Available Methods**:
- ✅ `createUserData(params: CreateUserDataParams)` - Creates new user data
- ✅ `getUserDataById(id: string)` - Gets user data by ID
- ✅ `getUserDataByUserId(userId: string)` - Gets all user data for a specific user
- ✅ `getUserDataByType(userId: string, dataType: string)` - Gets user data by type
- ✅ `updateUserData(id: string, updates: UpdateUserDataParams)` - Updates user data
- ✅ `deleteUserData(id: string)` - Deletes user data
- ✅ `getFavoriteUserData(userId: string)` - Gets favorite user data
- ✅ `toggleFavorite(id: string)` - Toggles favorite status

**Missing Methods** (being called but don't exist):
- ❌ `getTaxCalculations(userId: string)` - Should use `getUserDataByType(userId, 'tax_calculation')`
- ❌ `getFavorites(userId: string)` - Should use `getFavoriteUserData(userId)`
- ❌ `updateFavoriteStatus(id: string, isFavorite: boolean)` - Should use `updateUserData(id, { isFavorite })`
- ❌ `deleteSavedData(id: string)` - Should use `deleteUserData(id)`
- ❌ `exportUserData(userId: string)` - Does not exist
- ❌ `importUserData(userId: string, data: unknown)` - Does not exist

### **2. TaxCalculationService** (`src/application/services/TaxCalculationService.ts`)

**Purpose**: Handles tax calculations and tax-related data operations

**Available Methods**:
- ✅ `calculateTax(params: TaxCalculationParams)` - Calculates tax for different countries
- ✅ `saveTaxCalculation(userId: string, calculation: TaxCalculationResult, metadata: TaxCalculationMetadata)` - Saves tax calculation
- ✅ `getUserTaxCalculations(userId: string)` - Gets user's tax calculations

**Missing Methods**:
- ❌ `updateTaxCalculation(userId: string, existingId: string, calculationData: unknown)` - Does not exist

**Private Methods**:
- `calculateIndiaTax(salary: number, regime: 'old' | 'new', deductions: number)`
- `calculateUSTax(salary: number, filingStatus: 'single' | 'married' | 'head', state: string, deductions: number)`
- `calculateCanadaTax(salary: number, province: string, deductions: number)`
- `calculateUKTax(salary: number, deductions: number)`
- `calculateAustraliaTax(salary: number, deductions: number)`
- `calculateGermanyTax(salary: number, deductions: number)`
- `calculateFranceTax(salary: number, deductions: number)`
- `calculateBrazilTax(salary: number, deductions: number)`
- `calculateSouthAfricaTax(salary: number, deductions: number)`
- `calculateGenericTax(salary: number, deductions: number)`

### **3. UserService** (`src/application/services/UserService.ts`)

**Purpose**: Manages user account operations and user-related business logic

**Available Methods**:
- ✅ `createUser(email: string, profile?: Partial<UserProfile>, preferences?: Partial<UserPreferences>)`
- ✅ `getUserById(userId: string)`
- ✅ `getUserByEmail(email: string)`
- ✅ `updateUserProfile(userId: string, profileData: Partial<UserProfile>)`
- ✅ `updateUserPreferences(userId: string, preferencesData: Partial<UserPreferences>)`
- ✅ `deleteUser(userId: string)`
- ✅ `recordUserLogin(userId: string)`
- ✅ `verifyUserEmail(userId: string)`
- ✅ `updateUserActiveStatus(userId: string, isActive: boolean)`
- ✅ `getUsers(pagination?: PaginationParams, filters?: object)`
- ✅ `getInactiveUsers(since: Date, pagination?: PaginationParams)`
- ✅ `getUserStatistics()`
- ✅ `validateUserCanPerformAction(userId: string)`

### **4. BudgetService** (`src/application/services/BudgetService.ts`)

**Purpose**: Manages budget operations and budget-related business logic

**Available Methods**:
- ✅ `createBudget(params: CreateBudgetParams)`
- ✅ `getBudgetById(id: string)`
- ✅ `getBudgetsByUserId(userId: string)`
- ✅ `updateBudget(id: string, updates: UpdateBudgetParams)`
- ✅ `deleteBudget(id: string)`
- ✅ `getBudgetStatistics(userId: string)`

### **5. AlertService** (`src/application/services/AlertService.ts`)

**Purpose**: Manages spending alerts and notifications

**Available Methods**:
- ✅ `createAlert(params: CreateAlertParams)`
- ✅ `getAlertById(id: string)`
- ✅ `getAlertsByUserId(userId: string)`
- ✅ `updateAlert(id: string, updates: UpdateAlertParams)`
- ✅ `deleteAlert(id: string)`
- ✅ `checkAlertThresholds(userId: string)`

### **6. AnalyticsService** (`src/application/services/AnalyticsService.ts`)

**Purpose**: Provides analytics and reporting functionality

**Available Methods**:
- ✅ `getExpenseAnalytics(userId: string, period: string)`
- ✅ `getBudgetAnalytics(userId: string, period: string)`
- ✅ `getSpendingTrends(userId: string, period: string)`

### **7. ExpenseService** (`src/application/services/ExpenseService.ts`)

**Purpose**: Manages expense operations and expense-related business logic

**Available Methods**:
- ✅ `createExpense(params: CreateExpenseParams)`
- ✅ `getExpenseById(id: string)`
- ✅ `getExpensesByUserId(userId: string)`
- ✅ `updateExpense(id: string, updates: UpdateExpenseParams)`
- ✅ `deleteExpense(id: string)`
- ✅ `getExpenseStatistics(userId: string)`

### **8. CalculationStorageService** (`src/application/services/CalculationStorageService.ts`)

**Purpose**: Manages local storage of calculation data for anonymous users

**Available Methods**:
- ✅ `saveCalculation(calculationData: unknown)`
- ✅ `getSavedCalculation()`
- ✅ `clearSavedCalculation()`

### **9. PreferencesService** (`src/application/services/PreferencesService.ts`)

**Purpose**: Manages user preferences and settings

**Available Methods**:
- ✅ `getUserPreferences(userId: string)`
- ✅ `updateUserPreferences(userId: string, preferences: UserPreferences)`
- ✅ `resetUserPreferences(userId: string)`

### **10. VerificationService** (`src/application/services/VerificationService.ts`)

**Purpose**: Handles verification and validation operations

**Available Methods**:
- ✅ `verifyEmail(token: string)`
- ✅ `verifyPhone(phone: string, code: string)`
- ✅ `sendVerificationEmail(email: string)`
- ✅ `sendVerificationSMS(phone: string)`

---

## 🔧 **Infrastructure Services**

### **1. AutoSyncService** (`src/infrastructure/services/AutoSyncService.ts`)

**Purpose**: Handles automatic background synchronization

**Available Methods**:
- ✅ `initialize()` - Initializes the auto-sync service
- ✅ `startSync()` - Starts automatic synchronization
- ✅ `stopSync()` - Stops automatic synchronization
- ✅ `forceSync()` - Forces immediate synchronization
- ✅ `getSyncStatus()` - Gets current sync status

### **2. OptimizedExpenseService** (`src/infrastructure/services/OptimizedExpenseService.ts`)

**Purpose**: Provides optimized expense operations with caching

**Available Methods**:
- ✅ `getExpenses(userId: string, options?: ExpenseOptions)`
- ✅ `addExpense(expense: Expense)`
- ✅ `updateExpense(id: string, updates: Partial<Expense>)`
- ✅ `deleteExpense(id: string)`
- ✅ `getCategories()` - Gets expense categories
- ✅ `clearCache()` - Clears the cache

### **3. WidgetsService** (`src/infrastructure/services/WidgetsService.ts`)

**Purpose**: Manages dashboard widgets and quick actions

**Available Methods**:
- ✅ `createWidget(widget: Widget)`
- ✅ `getWidgets(userId: string)`
- ✅ `updateWidget(id: string, updates: Partial<Widget>)`
- ✅ `deleteWidget(id: string)`
- ✅ `refreshWidget(id: string)`

### **4. AdvancedSearchService** (`src/infrastructure/services/AdvancedSearchService.ts`)

**Purpose**: Provides comprehensive search functionality

**Available Methods**:
- ✅ `search(query: string, options?: SearchOptions)`
- ✅ `buildSearchIndex()` - Builds search index
- ✅ `saveSearch(search: SavedSearch)`
- ✅ `getSavedSearches(userId: string)`

### **5. OfflineSyncService** (`src/infrastructure/services/OfflineSyncService.ts`)

**Purpose**: Handles offline data synchronization

**Available Methods**:
- ✅ `initialize()` - Initializes offline sync
- ✅ `addToSyncQueue(item: SyncItem)` - Adds item to sync queue
- ✅ `syncOfflineData()` - Syncs offline data
- ✅ `getSyncStatus()` - Gets sync status
- ✅ `forceSync()` - Forces sync

### **6. PerformanceService** (`src/infrastructure/services/PerformanceService.ts`)

**Purpose**: Monitors and manages application performance

**Available Methods**:
- ✅ `startMonitoring()` - Starts performance monitoring
- ✅ `stopMonitoring()` - Stops performance monitoring
- ✅ `getMetrics()` - Gets performance metrics
- ✅ `setThresholds(thresholds: PerformanceThreshold[])` - Sets performance thresholds

### **7. AccessibilityService** (`src/infrastructure/services/AccessibilityService.ts`)

**Purpose**: Manages accessibility features

**Available Methods**:
- ✅ `initialize()` - Initializes accessibility service
- ✅ `announce(message: string)` - Announces message to screen readers
- ✅ `setSettings(settings: AccessibilitySettings)` - Sets accessibility settings
- ✅ `getSettings()` - Gets current accessibility settings

### **8. DataExportService** (`src/infrastructure/services/DataExportService.ts`)

**Purpose**: Handles data export operations

**Available Methods**:
- ✅ `exportUserData(userId: string, format: ExportFormat)`
- ✅ `exportCalculations(userId: string, format: ExportFormat)`
- ✅ `exportExpenses(userId: string, format: ExportFormat)`

---

## ❌ **Missing/Incorrect Function Calls**

### **Files with Incorrect Function Calls**

#### **1. LoadCalculationModal.tsx (Line 67)**
```typescript
// ❌ INCORRECT
const { data, error } = await UserDataService.getTaxCalculations(userId);

// ✅ CORRECT
const { data, error } = await UserDataService.getUserDataByType(userId, 'tax_calculation');
```

#### **2. UserDashboard.tsx (Line 46)**
```typescript
// ❌ INCORRECT
UserDataService.getTaxCalculations(user.id),

// ✅ CORRECT
UserDataService.getUserDataByType(user.id, 'tax_calculation'),
```

#### **3. FinancialDashboard.tsx (Lines 748, 785)**
```typescript
// ❌ INCORRECT
const savedCalculationsData = await UserDataService.getTaxCalculations(userId)

// ✅ CORRECT
const savedCalculationsData = await UserDataService.getUserDataByType(userId, 'tax_calculation')
```

#### **4. MobileIndex.tsx (Line 439)**
```typescript
// ❌ INCORRECT
const { error } = await TaxCalculationService.updateTaxCalculation(user.id, existingId, calculationData);

// ✅ CORRECT
const { error } = await UserDataService.updateUserData(existingId, { dataContent: calculationData });
```

#### **5. UserDashboard.tsx (Line 47)**
```typescript
// ❌ INCORRECT
UserDataService.getFavorites(user.id)

// ✅ CORRECT
UserDataService.getFavoriteUserData(user.id)
```

#### **6. UserDashboard.tsx (Line 95)**
```typescript
// ❌ INCORRECT
const { error } = await UserDataService.updateFavoriteStatus(dataId, !isFavorite);

// ✅ CORRECT
const { error } = await UserDataService.updateUserData(dataId, { isFavorite: !isFavorite });
```

#### **7. UserDashboard.tsx (Line 115)**
```typescript
// ❌ INCORRECT
const { error } = await UserDataService.deleteSavedData(dataId);

// ✅ CORRECT
const { error } = await UserDataService.deleteUserData(dataId);
```

#### **8. UserDashboard.tsx (Line 135)**
```typescript
// ❌ INCORRECT
const { data, error } = await UserDataService.exportUserData(user.id);

// ✅ CORRECT
// This method doesn't exist - need to implement or use DataExportService
const { data, error } = await DataExportService.exportUserData(user.id, 'json');
```

#### **9. FinancialDashboard.tsx (Line 820)**
```typescript
// ❌ INCORRECT
const { error } = await UserDataService.updateFavoriteStatus(calculationId, !isFavorite);

// ✅ CORRECT
const { error } = await UserDataService.updateUserData(calculationId, { isFavorite: !isFavorite });
```

#### **10. FinancialDashboard.tsx (Line 840)**
```typescript
// ❌ INCORRECT
const { error } = await UserDataService.deleteSavedData(calculationId);

// ✅ CORRECT
const { error } = await UserDataService.deleteUserData(calculationId);
```

---

## 📊 **Service Usage Analysis**

### **Most Used Services**
1. **UserDataService** - Used in 8+ files for data persistence
2. **TaxCalculationService** - Used in 3+ files for tax calculations
3. **UserService** - Used in 2+ files for user management

### **Services with Missing Methods**
1. **UserDataService** - 6 missing methods being called
2. **TaxCalculationService** - 1 missing method being called

### **Services with Incorrect Method Names**
- `getTaxCalculations()` → `getUserDataByType(userId, 'tax_calculation')`
- `getFavorites()` → `getFavoriteUserData()`
- `updateFavoriteStatus()` → `updateUserData(id, { isFavorite })`
- `deleteSavedData()` → `deleteUserData()`
- `updateTaxCalculation()` → `updateUserData()`

### **Services Needing Implementation**
- `exportUserData()` - Should use DataExportService
- `importUserData()` - Should use DataExportService or implement in UserDataService

---

## 🔧 **Recommended Fixes**

### **Immediate Fixes Needed**
1. Replace all `getTaxCalculations()` calls with `getUserDataByType(userId, 'tax_calculation')`
2. Replace all `updateFavoriteStatus()` calls with `updateUserData(id, { isFavorite })`
3. Replace all `deleteSavedData()` calls with `deleteUserData(id)`
4. Replace all `getFavorites()` calls with `getFavoriteUserData()`
5. Replace all `updateTaxCalculation()` calls with `updateUserData()`

### **Methods to Implement**
1. Add `exportUserData()` to UserDataService or use DataExportService
2. Add `importUserData()` to UserDataService or use DataExportService
3. Add `updateTaxCalculation()` to TaxCalculationService (if needed)

### **Data Transformation Needed**
- Transform UserDataService response format to match expected SavedCalculation format
- Handle data structure differences between services
- Ensure proper type casting and validation 