# Unused Functions Documentation

This document lists all functions that are declared but never used throughout the codebase.

## 📋 **Unused Functions by File**

### **1. src/pages/Index.tsx**

#### **❌ `loadSavedCalculations` (Lines 1131-1168)**
```typescript
const loadSavedCalculations = async () => {
  if (!user) return;
  
  setIsLoadingSavedCalculations(true);
  try {
    const { data, error } = await UserDataService.getUserDataByType(user.id, 'tax_calculation');
    // ... implementation
  } catch (error) {
    // ... error handling
  } finally {
    setIsLoadingSavedCalculations(false);
  }
};
```
**Status**: ❌ **UNUSED** - Function is declared but never called
**Reason**: This function was likely intended to load saved calculations for the LoadCalculationModal, but the modal has its own `loadSavedCalculations` function.

#### **✅ `checkExistingCalculation` (Lines 913-932)**
**Status**: ✅ **USED** - Called in `handleSaveCalculation` (Line 1002)

#### **✅ `validateCalculationForSave` (Lines 939-976)**
**Status**: ✅ **USED** - Called in `handleSaveCalculation` (Line 982)

#### **✅ `handleSaveCalculation` (Lines 975-1021)**
**Status**: ✅ **USED** - Called in Header component and save button

#### **✅ `saveCalculationAsNew` (Lines 1022-1096)**
**Status**: ✅ **USED** - Called in SaveCalculationModal

#### **✅ `handleTabChange` (Lines 1097-1130)**
**Status**: ✅ **USED** - Called by Tabs component

#### **✅ `loadCalculation` (Lines 1169-1247)**
**Status**: ✅ **USED** - Called by LoadCalculationModal

#### **✅ `convertToExistingCalculation` (Lines 1248-1287)**
**Status**: ✅ **USED** - Called in SaveCalculationModal props

### **2. src/pages/MobileIndex.tsx**

#### **✅ `loadSavedCalculations` (Lines 260-310)**
**Status**: ✅ **USED** - Called in useEffect (Line 484)

#### **✅ `loadCalculation` (Lines 311-348)**
**Status**: ✅ **USED** - Called by LoadCalculationModal

#### **✅ `checkExistingCalculation` (Lines 349-388)**
**Status**: ✅ **USED** - Called in `handleSaveCalculation` (Line 405)

#### **✅ `handleSaveCalculation` (Lines 389-414)**
**Status**: ✅ **USED** - Called by save button

#### **✅ `saveCalculationAsNew` (Lines 415-463)**
**Status**: ✅ **USED** - Called in save logic

### **3. src/components/modals/LoadCalculationModal.tsx**

#### **✅ `loadSavedCalculations` (Lines 62-100)**
**Status**: ✅ **USED** - Called in useEffect (Line 101)

### **4. src/components/dashboard/UserDashboard.tsx**

#### **✅ `loadUserData` (Lines 38-75)**
**Status**: ✅ **USED** - Called in useEffect (Line 77)

#### **✅ `handleToggleFavorite` (Lines 77-115)**
**Status**: ✅ **USED** - Called by favorite button

#### **✅ `handleDeleteCalculation` (Lines 117-135)**
**Status**: ✅ **USED** - Called by delete button

#### **✅ `handleExportData` (Lines 137-165)**
**Status**: ✅ **USED** - Called by export button

#### **✅ `handleImportData` (Lines 167-185)**
**Status**: ✅ **USED** - Called by import button

### **5. src/components/dashboard/FinancialDashboard.tsx**

#### **✅ `loadDashboardData` (Lines 472-515)**
**Status**: ✅ **USED** - Called in useEffect (Line 520)

#### **✅ `refreshDashboardData` (Lines 517-555)**
**Status**: ✅ **USED** - Called by refresh button

#### **✅ `handleDataUpdate` (Lines 557-559)**
**Status**: ✅ **USED** - Called by data update events

#### **✅ `handleRefresh` (Lines 561-566)**
**Status**: ✅ **USED** - Called by refresh button

#### **✅ `handleDeleteCalculation` (Lines 568-590)**
**Status**: ✅ **USED** - Called by delete button

#### **✅ `confirmDeleteCalculation` (Lines 592-598)**
**Status**: ✅ **USED** - Called by delete confirmation

#### **✅ `executeDeleteCalculation` (Lines 600-604)**
**Status**: ✅ **USED** - Called by delete confirmation dialog

#### **✅ `handleToggleFavorite` (Lines 606-630)**
**Status**: ✅ **USED** - Called by favorite button

#### **✅ `getCurrencySymbol` (Lines 632-642)**
**Status**: ✅ **USED** - Called in currency formatting

#### **✅ `handleSaveCalculation` (Lines 650-654)**
**Status**: ✅ **USED** - Called by save button

#### **✅ `getExistingCalculation` (Lines 656-680)**
**Status**: ✅ **USED** - Called in SaveCalculationModal

## 🧹 **Recommended Actions**

### **1. Remove Unused Function**
- **File**: `src/pages/Index.tsx`
- **Function**: `loadSavedCalculations` (Lines 1131-1168)
- **Action**: Delete the function as it's not used anywhere
- **Impact**: No impact - function is unused

### **2. Code Cleanup Benefits**
- **Reduced bundle size**: Removing unused code reduces JavaScript bundle size
- **Improved maintainability**: Less code to maintain and understand
- **Better code organization**: Cleaner codebase without dead code
- **Reduced confusion**: Developers won't be confused by unused functions

## 📊 **Summary**

**Total Unused Functions Found**: 1
- `loadSavedCalculations` in `src/pages/Index.tsx`

**Total Functions Analyzed**: 25+
- Most functions are properly used throughout the codebase
- Only one function is confirmed to be unused
- The codebase is generally well-maintained with minimal dead code

## 🎯 **Next Steps**

1. **Remove the unused function** from `src/pages/Index.tsx`
2. **Run a comprehensive test** to ensure no functionality is broken
3. **Consider adding ESLint rules** to detect unused functions automatically
4. **Regular code audits** to maintain clean codebase 