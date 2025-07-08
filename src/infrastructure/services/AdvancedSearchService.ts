import { supabase } from '@/integrations/supabase/client';
import { ExpenseItem, BudgetItem, AlertItem } from '../../application/services/UserDataService';

export interface SearchResult<T> {
  item: T;
  score: number;
  matchedFields: string[];
}

export interface SearchFilters {
  dateRange?: { start: Date; end: Date };
  categoryIds?: number[];
  amountRange?: { min: number; max: number };
  currency?: string;
  tags?: string[];
}

export interface SearchOptions {
  limit?: number;
  offset?: number;
  sortBy?: 'relevance' | 'date' | 'amount' | 'name';
  sortOrder?: 'asc' | 'desc';
  includeArchived?: boolean;
}

export interface SavedSearch {
  id: string;
  name: string;
  description?: string;
  options: SearchOptions;
  isDefault?: boolean;
  createdAt: Date;
  lastUsed?: Date;
  useCount: number;
}

export interface SearchHistory {
  id: string;
  query: string;
  filters: SearchFilters[];
  resultCount: number;
  searchTime: number;
  timestamp: Date;
}

/**
 * AdvancedSearchService for comprehensive search functionality
 * 
 * This service provides advanced search capabilities including
 * full-text search, filtering, saved searches, and search history.
 */
export class AdvancedSearchService {
  private static instance: AdvancedSearchService;
  private searchIndex: Map<string, Map<string, unknown>> = new Map();
  private isIndexed = false;

  /**
   * Gets the singleton instance of AdvancedSearchService
   */
  static getInstance(): AdvancedSearchService {
    if (!AdvancedSearchService.instance) {
      AdvancedSearchService.instance = new AdvancedSearchService();
    }
    return AdvancedSearchService.instance;
  }

  /**
   * Initialize the advanced search service
   */
  async initialize(): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      // Build search index
      await this.buildIndex(user.id);
      console.log('Advanced search service initialized');
    } catch (error) {
      console.error('Failed to initialize advanced search service:', error);
    }
  }

  /**
   * Build search index for all data
   */
  async buildIndex(userId: string): Promise<void> {
    try {
      // Clear existing index
      this.searchIndex.clear();

      // Index expenses
      const expenses = await this.getExpenses(userId);
      this.indexExpenses(expenses);

      // Index budgets
      const budgets = await this.getBudgets(userId);
      this.indexBudgets(budgets);

      // Index alerts
      const alerts = await this.getAlerts(userId);
      this.indexAlerts(alerts);

      this.isIndexed = true;
    } catch (error) {
      console.error('Failed to build search index:', error);
      throw error;
    }
  }

  /**
   * Search across all data types
   */
  async search<T extends ExpenseItem | BudgetItem | AlertItem>(
    query: string,
    filters?: SearchFilters,
    options?: SearchOptions
  ): Promise<SearchResult<T>[]> {
    if (!this.isIndexed) {
      await this.buildIndex(this.getCurrentUserId());
    }

    const normalizedQuery = this.normalizeQuery(query);
    const results: SearchResult<T>[] = [];

    // Search in expenses
    const expenseResults = await this.searchExpenses(normalizedQuery, filters, options);
    results.push(...(expenseResults as SearchResult<T>[]));

    // Search in budgets
    const budgetResults = await this.searchBudgets(normalizedQuery, filters, options);
    results.push(...(budgetResults as SearchResult<T>[]));

    // Search in alerts
    const alertResults = await this.searchAlerts(normalizedQuery, filters, options);
    results.push(...(alertResults as SearchResult<T>[]));

    // Sort by relevance score
    results.sort((a, b) => b.score - a.score);

    // Apply limit and offset
    const limit = options?.limit || 50;
    const offset = options?.offset || 0;
    return results.slice(offset, offset + limit);
  }

  /**
   * Search specifically in expenses
   */
  async searchExpenses(
    query: string,
    filters?: SearchFilters,
    options?: SearchOptions
  ): Promise<SearchResult<ExpenseItem>[]> {
    const expenses = await this.getExpenses(this.getCurrentUserId());
    return this.performSearch(expenses, query, filters, options, this.calculateExpenseScore);
  }

  /**
   * Search specifically in budgets
   */
  async searchBudgets(
    query: string,
    filters?: SearchFilters,
    options?: SearchOptions
  ): Promise<SearchResult<BudgetItem>[]> {
    const budgets = await this.getBudgets(this.getCurrentUserId());
    return this.performSearch(budgets, query, filters, options, this.calculateBudgetScore);
  }

  /**
   * Search specifically in alerts
   */
  async searchAlerts(
    query: string,
    filters?: SearchFilters,
    options?: SearchOptions
  ): Promise<SearchResult<AlertItem>[]> {
    const alerts = await this.getAlerts(this.getCurrentUserId());
    return this.performSearch(alerts, query, filters, options, this.calculateAlertScore);
  }

  /**
   * Perform fuzzy search with filters
   */
  private performSearch<T>(
    items: T[],
    query: string,
    filters?: SearchFilters,
    options?: SearchOptions,
    scoreCalculator?: (item: T, query: string) => number
  ): SearchResult<T>[] {
    const results: SearchResult<T>[] = [];

    for (const item of items) {
      // Apply filters
      if (filters && !this.matchesFilters(item, filters)) {
        continue;
      }

      // Calculate relevance score
      const score = scoreCalculator ? scoreCalculator(item, query) : this.calculateDefaultScore(item, query);
      
      if (score > 0) {
        const matchedFields = this.getMatchedFields(item, query);
        results.push({
          item,
          score,
          matchedFields
        });
      }
    }

    // Sort results
    const sortBy = options?.sortBy || 'relevance';
    const sortOrder = options?.sortOrder || 'desc';

    results.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'relevance':
          comparison = b.score - a.score;
          break;
        case 'date':
          comparison = this.compareDates(a.item, b.item);
          break;
        case 'amount':
          comparison = this.compareAmounts(a.item, b.item);
          break;
        case 'name':
          comparison = this.compareNames(a.item, b.item);
          break;
      }

      return sortOrder === 'asc' ? -comparison : comparison;
    });

    return results;
  }

  /**
   * Check if item matches filters
   */
  private matchesFilters<T>(item: T, filters: SearchFilters): boolean {
    if (filters.dateRange) {
      const itemDate = this.getItemDate(item);
      if (itemDate < filters.dateRange.start || itemDate > filters.dateRange.end) {
        return false;
      }
    }

    if (filters.categoryIds && filters.categoryIds.length > 0) {
      const itemCategory = this.getItemCategory(item);
      if (!filters.categoryIds.includes(itemCategory)) {
        return false;
      }
    }

    if (filters.amountRange) {
      const itemAmount = this.getItemAmount(item);
      if (itemAmount < filters.amountRange.min || itemAmount > filters.amountRange.max) {
        return false;
      }
    }

    if (filters.currency) {
      const itemCurrency = this.getItemCurrency(item);
      if (itemCurrency !== filters.currency) {
        return false;
      }
    }

    return true;
  }

  /**
   * Calculate default relevance score
   */
  private calculateDefaultScore<T>(item: T, query: string): number {
    const itemText = this.getItemText(item).toLowerCase();
    const normalizedQuery = query.toLowerCase();
    
    let score = 0;
    
    // Exact match gets highest score
    if (itemText.includes(normalizedQuery)) {
      score += 100;
    }
    
    // Partial word matches
    const queryWords = normalizedQuery.split(/\s+/);
    for (const word of queryWords) {
      if (itemText.includes(word)) {
        score += 10;
      }
    }
    
    // Character-based similarity
    score += this.calculateSimilarity(itemText, normalizedQuery) * 50;
    
    return score;
  }

  /**
   * Calculate expense-specific score
   */
  private calculateExpenseScore(item: ExpenseItem, query: string): number {
    let score = this.calculateDefaultScore(item, query);
    
    // Boost score for description matches
    if (item.description && item.description.toLowerCase().includes(query.toLowerCase())) {
      score += 20;
    }
    
    // Boost score for location matches
    if (item.location && item.location.toLowerCase().includes(query.toLowerCase())) {
      score += 15;
    }
    
    return score;
  }

  /**
   * Calculate budget-specific score
   */
  private calculateBudgetScore(item: BudgetItem, query: string): number {
    let score = this.calculateDefaultScore(item, query);
    
    // Boost score for period matches
    if (item.period.toLowerCase().includes(query.toLowerCase())) {
      score += 15;
    }
    
    return score;
  }

  /**
   * Calculate alert-specific score
   */
  private calculateAlertScore(item: AlertItem, query: string): number {
    let score = this.calculateDefaultScore(item, query);
    
    // Boost score for period matches
    if (item.period.toLowerCase().includes(query.toLowerCase())) {
      score += 15;
    }
    
    return score;
  }

  /**
   * Get matched fields for result
   */
  private getMatchedFields<T>(item: T, query: string): string[] {
    const matchedFields: string[] = [];
    const normalizedQuery = query.toLowerCase();
    
    const itemText = this.getItemText(item);
    if (itemText.toLowerCase().includes(normalizedQuery)) {
      matchedFields.push('name');
    }
    
    // Check specific fields based on item type
    if ('description' in item && (item as unknown as { description?: string }).description) {
      const description = (item as unknown as { description: string }).description;
      if (description.toLowerCase().includes(normalizedQuery)) {
        matchedFields.push('description');
      }
    }
    
    if ('location' in item && (item as unknown as { location?: string }).location) {
      const location = (item as unknown as { location: string }).location;
      if (location.toLowerCase().includes(normalizedQuery)) {
        matchedFields.push('location');
      }
    }
    
    return matchedFields;
  }

  /**
   * Calculate string similarity using Levenshtein distance
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const matrix: number[][] = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    const maxLength = Math.max(str1.length, str2.length);
    return maxLength === 0 ? 1 : (maxLength - matrix[str2.length][str1.length]) / maxLength;
  }

  /**
   * Normalize search query
   */
  private normalizeQuery(query: string): string {
    return query
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s]/g, '');
  }

  /**
   * Index expenses for search
   */
  private indexExpenses(expenses: ExpenseItem[]): void {
    for (const expense of expenses) {
      const key = `expense_${expense.id}`;
      this.searchIndex.set(key, new Map([
        ['type', 'expense'],
        ['id', expense.id],
        ['text', this.getItemText(expense)],
        ['date', expense.date],
        ['amount', expense.amount],
        ['category', expense.category_id],
        ['currency', expense.currency]
      ]));
    }
  }

  /**
   * Index budgets for search
   */
  private indexBudgets(budgets: BudgetItem[]): void {
    for (const budget of budgets) {
      const key = `budget_${budget.id}`;
      this.searchIndex.set(key, new Map([
        ['type', 'budget'],
        ['id', budget.id],
        ['text', this.getItemText(budget)],
        ['amount', budget.amount],
        ['period', budget.period],
        ['category', budget.category_id]
      ]));
    }
  }

  /**
   * Index alerts for search
   */
  private indexAlerts(alerts: AlertItem[]): void {
    for (const alert of alerts) {
      const key = `alert_${alert.id}`;
      this.searchIndex.set(key, new Map([
        ['type', 'alert'],
        ['id', alert.id],
        ['text', this.getItemText(alert)],
        ['threshold', alert.threshold],
        ['period', alert.period],
        ['category', alert.category_id]
      ]));
    }
  }

  /**
   * Get item text for search
   */
  private getItemText<T>(item: T): string {
    if ('description' in item && (item as unknown as { description?: string }).description) {
      return (item as unknown as { description: string }).description;
    }
    return '';
  }

  /**
   * Get item date
   */
  private getItemDate<T>(item: T): Date {
    if ('date' in item && (item as unknown as { date: string }).date) {
      return new Date((item as unknown as { date: string }).date);
    }
    if ('created_at' in item && (item as unknown as { created_at?: string }).created_at) {
      return new Date((item as unknown as { created_at: string }).created_at);
    }
    return new Date();
  }

  /**
   * Get item category
   */
  private getItemCategory<T>(item: T): number {
    if ('category_id' in item) {
      return (item as unknown as { category_id: number }).category_id;
    }
    return 0;
  }

  /**
   * Get item amount
   */
  private getItemAmount<T>(item: T): number {
    if ('amount' in item) {
      return (item as unknown as { amount: number }).amount;
    }
    if ('threshold' in item) {
      return (item as unknown as { threshold: number }).threshold;
    }
    return 0;
  }

  /**
   * Get item currency
   */
  private getItemCurrency<T>(item: T): string {
    if ('currency' in item) {
      return (item as unknown as { currency: string }).currency;
    }
    return 'USD';
  }

  /**
   * Compare dates for sorting
   */
  private compareDates<T>(a: T, b: T): number {
    const dateA = this.getItemDate(a);
    const dateB = this.getItemDate(b);
    return dateA.getTime() - dateB.getTime();
  }

  /**
   * Compare amounts for sorting
   */
  private compareAmounts<T>(a: T, b: T): number {
    const amountA = this.getItemAmount(a);
    const amountB = this.getItemAmount(b);
    return amountA - amountB;
  }

  /**
   * Compare names for sorting
   */
  private compareNames<T>(a: T, b: T): number {
    const textA = this.getItemText(a).toLowerCase();
    const textB = this.getItemText(b).toLowerCase();
    return textA.localeCompare(textB);
  }

  /**
   * Get current user ID (placeholder - implement based on your auth system)
   */
  private getCurrentUserId(): string {
    // This should be implemented based on your authentication system
    return 'current-user-id';
  }

  /**
   * Get expenses (placeholder - implement based on your data service)
   */
  private async getExpenses(userId: string): Promise<ExpenseItem[]> {
    // This should be implemented based on your data service
    return [];
  }

  /**
   * Get budgets (placeholder - implement based on your data service)
   */
  private async getBudgets(userId: string): Promise<BudgetItem[]> {
    // This should be implemented based on your data service
    return [];
  }

  /**
   * Get alerts (placeholder - implement based on your data service)
   */
  private async getAlerts(userId: string): Promise<AlertItem[]> {
    // This should be implemented based on your data service
    return [];
  }

  /**
   * Clear search index
   */
  clearIndex(): void {
    this.searchIndex.clear();
    this.isIndexed = false;
  }

  /**
   * Get search statistics
   */
  getSearchStats(): { indexedItems: number; indexSize: number } {
    return {
      indexedItems: this.searchIndex.size,
      indexSize: JSON.stringify(this.searchIndex).length
    };
  }

  /**
   * Save a search for later use
   */
  async saveSearch(name: string, options: SearchOptions, description?: string): Promise<string> {
    const id = `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const savedSearch: SavedSearch = {
      id,
      name,
      description,
      options,
      createdAt: new Date(),
      useCount: 0
    };
    
    const savedSearches = await this.getSavedSearches();
    savedSearches.push(savedSearch);
    localStorage.setItem('savedSearches', JSON.stringify(savedSearches));
    
    return id;
  }

  /**
   * Get all saved searches
   */
  async getSavedSearches(): Promise<SavedSearch[]> {
    try {
      const saved = localStorage.getItem('savedSearches');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Failed to get saved searches:', error);
      return [];
    }
  }

  /**
   * Update a saved search
   */
  async updateSavedSearch(id: string, updates: Partial<SavedSearch>): Promise<void> {
    const savedSearches = await this.getSavedSearches();
    const index = savedSearches.findIndex(search => search.id === id);
    
    if (index !== -1) {
      savedSearches[index] = { ...savedSearches[index], ...updates };
      localStorage.setItem('savedSearches', JSON.stringify(savedSearches));
    }
  }

  /**
   * Delete a saved search
   */
  async deleteSavedSearch(id: string): Promise<void> {
    const savedSearches = await this.getSavedSearches();
    const filtered = savedSearches.filter(search => search.id !== id);
    localStorage.setItem('savedSearches', JSON.stringify(filtered));
  }

  /**
   * Execute a saved search
   */
  async executeSavedSearch(id: string): Promise<SearchResult<ExpenseItem | BudgetItem | AlertItem>[] | null> {
    const savedSearches = await this.getSavedSearches();
    const savedSearch = savedSearches.find(search => search.id === id);
    
    if (!savedSearch) return null;
    
    // Update usage stats
    savedSearch.lastUsed = new Date();
    savedSearch.useCount++;
    await this.updateSavedSearch(id, savedSearch);
    
    // Execute the search
    return this.searchExpenses(savedSearch.options.query || '', savedSearch.options.filters, savedSearch.options);
  }

  /**
   * Save search to history
   */
  private async saveSearchHistory(options: SearchOptions, resultCount: number): Promise<void> {
    try {
      const history: SearchHistory = {
        id: `history_${Date.now()}`,
        query: options.query || '',
        filters: options.filters || [],
        resultCount,
        searchTime: 0,
        timestamp: new Date()
      };
      
      const searchHistory = await this.getSearchHistory();
      searchHistory.unshift(history);
      
      // Keep only last 50 searches
      if (searchHistory.length > 50) {
        searchHistory.splice(50);
      }
      
      localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
    } catch (error) {
      console.error('Failed to save search history:', error);
    }
  }

  /**
   * Get search history
   */
  async getSearchHistory(): Promise<SearchHistory[]> {
    try {
      const saved = localStorage.getItem('searchHistory');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Failed to get search history:', error);
      return [];
    }
  }

  /**
   * Clear search history
   */
  async clearSearchHistory(): Promise<void> {
    localStorage.removeItem('searchHistory');
  }

  /**
   * Get search suggestions based on history and index
   */
  async getSearchSuggestions(query: string): Promise<string[]> {
    const suggestions: string[] = [];
    const term = query.toLowerCase();
    
    // Get suggestions from search history
    const history = await this.getSearchHistory();
    history.forEach(item => {
      if (item.query.toLowerCase().includes(term) && !suggestions.includes(item.query)) {
        suggestions.push(item.query);
      }
    });
    
    // Get suggestions from saved searches
    const savedSearches = await this.getSavedSearches();
    savedSearches.forEach(search => {
      if (search.name.toLowerCase().includes(term) && !suggestions.includes(search.name)) {
        suggestions.push(search.name);
      }
    });
    
    // Get suggestions from search index
    const categories = new Set<string>();
    for (const item of this.searchIndex.values()) {
      if (item.category && item.category.toLowerCase().includes(term)) {
        categories.add(item.category);
      }
    }
    
    categories.forEach(category => {
      if (!suggestions.includes(category)) {
        suggestions.push(category);
      }
    });
    
    return suggestions.slice(0, 10); // Limit to 10 suggestions
  }

  /**
   * Get available filters for search
   */
  getAvailableFilters(): { field: string; label: string; type: string; options?: string[] }[] {
    return [
      { field: 'category', label: 'Category', type: 'select' },
      { field: 'amount', label: 'Amount', type: 'number' },
      { field: 'date', label: 'Date', type: 'date' },
      { field: 'description', label: 'Description', type: 'text' },
      { field: 'tags', label: 'Tags', type: 'multiselect' }
    ];
  }

  /**
   * Export search results
   */
  async exportSearchResults(searchResult: SearchResult<ExpenseItem | BudgetItem | AlertItem>[], format: 'csv' | 'json' = 'csv'): Promise<string> {
    if (format === 'json') {
      return JSON.stringify(searchResult, null, 2);
    }
    
    // Generate CSV
    if (searchResult.length === 0) return '';
    
    const headers = Object.keys(searchResult[0].item);
    const csvRows = [headers.join(',')];
    
    searchResult.forEach(item => {
      const values = headers.map(header => {
        const value = (item.item as Record<string, unknown>)[header];
        return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
      });
      csvRows.push(values.join(','));
    });
    
    return csvRows.join('\n');
  }
} 