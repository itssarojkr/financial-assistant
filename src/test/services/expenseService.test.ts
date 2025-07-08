import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ExpenseService } from '@/application/services/ExpenseService'
import { Expense } from '@/core/domain/entities/Expense'
import { ExpenseCategory } from '@/core/domain/enums/ExpenseCategory'

// Mock the ExpenseRepository
const mockExpenseRepository = {
  create: vi.fn(),
  findById: vi.fn(),
  findByUserId: vi.fn(),
  findByCategory: vi.fn(),
  findByDateRange: vi.fn(),
  findByAmountRange: vi.fn(),
  findRecurringExpenses: vi.fn(),
  findByTags: vi.fn(),
  searchByDescription: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  getCategoryTotals: vi.fn(),
  getMonthlyTotals: vi.fn(),
  getMostExpensiveExpenses: vi.fn(),
  getUserTags: vi.fn(),
  getUserExpenseStatistics: vi.fn(),
}

vi.mock('@/infrastructure/database/repositories/ExpenseRepository', () => ({
  ExpenseRepository: vi.fn().mockImplementation(() => mockExpenseRepository)
}))

describe('ExpenseService', () => {
  let expenseService: ExpenseService;

  beforeEach(() => {
    vi.clearAllMocks()
    expenseService = new ExpenseService(mockExpenseRepository as any);
  })

  describe('createExpense', () => {
    it('creates expense successfully', async () => {
      const mockExpense = Expense.create({
        userId: 'user123',
        amount: 75,
        currency: 'USD',
        category: ExpenseCategory.FOOD_AND_DRINKS,
        description: 'New Expense',
        date: new Date('2024-01-01'),
        tags: ['groceries'],
        location: 'Supermarket'
      }, 'expense123');

      vi.mocked(mockExpenseRepository.create).mockResolvedValue(mockExpense);

      const result = await expenseService.createExpense(
        'user123',
        75,
        'USD',
        ExpenseCategory.FOOD_AND_DRINKS,
        'New Expense',
        new Date('2024-01-01'),
        ['groceries'],
        false,
        undefined,
        'Supermarket',
        undefined,
        'Weekly groceries'
      );

      expect(result).toEqual(mockExpense);
      expect(mockExpenseRepository.create).toHaveBeenCalledWith(expect.any(Expense));
    })

    it('handles validation errors for negative amount', async () => {
      await expect(expenseService.createExpense(
        'user123',
        -50,
        'USD',
        ExpenseCategory.FOOD_AND_DRINKS,
        'Invalid Expense',
        new Date('2024-01-01')
      )).rejects.toThrow('Expense amount must be greater than zero');
    })

    it('handles validation errors for future date', async () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      await expect(expenseService.createExpense(
        'user123',
        50,
        'USD',
        ExpenseCategory.FOOD_AND_DRINKS,
        'Future Expense',
        futureDate
      )).rejects.toThrow('Expense date cannot be in the future');
    })

    it('handles missing required fields', async () => {
      await expect(expenseService.createExpense(
        '',
        50,
        'USD',
        ExpenseCategory.FOOD_AND_DRINKS,
        'Test Expense',
        new Date('2024-01-01')
      )).rejects.toThrow('Missing required fields for expense creation');
    })
  })

  describe('getExpenseById', () => {
    it('fetches expense successfully', async () => {
      const mockExpense = Expense.create({
        userId: 'user123',
        amount: 100,
        currency: 'USD',
        category: ExpenseCategory.FOOD_AND_DRINKS,
        description: 'Test Expense',
        date: new Date('2024-01-01'),
      }, 'expense123');

      vi.mocked(mockExpenseRepository.findById).mockResolvedValue(mockExpense);

      const result = await expenseService.getExpenseById('expense123');

      expect(result).toEqual(mockExpense);
      expect(mockExpenseRepository.findById).toHaveBeenCalledWith('expense123');
    })

    it('returns null when expense not found', async () => {
      vi.mocked(mockExpenseRepository.findById).mockResolvedValue(null);

      const result = await expenseService.getExpenseById('nonexistent');

      expect(result).toBeNull();
    })
  })

  describe('getUserExpenses', () => {
    it('fetches user expenses successfully', async () => {
      const mockExpenses = [
        Expense.create({
          userId: 'user123',
          amount: 100,
          currency: 'USD',
          category: ExpenseCategory.FOOD_AND_DRINKS,
          description: 'Expense 1',
          date: new Date('2024-01-01'),
        }, 'expense1')
      ];

      const mockPaginatedResult = {
        data: mockExpenses,
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1
      };

      vi.mocked(mockExpenseRepository.findByUserId).mockResolvedValue(mockPaginatedResult);

      const result = await expenseService.getUserExpenses('user123');

      expect(result).toEqual(mockPaginatedResult);
      expect(mockExpenseRepository.findByUserId).toHaveBeenCalledWith('user123', undefined);
    })
  })

  describe('updateExpense', () => {
    it('updates expense successfully', async () => {
      const mockExpense = Expense.create({
        userId: 'user123',
        amount: 150,
        currency: 'USD',
        category: ExpenseCategory.FOOD_AND_DRINKS,
        description: 'Updated Expense',
        date: new Date('2024-01-01'),
      }, 'expense123');

      // Mock both findById and update methods
      vi.mocked(mockExpenseRepository.findById).mockResolvedValue(mockExpense);
      vi.mocked(mockExpenseRepository.update).mockResolvedValue(mockExpense);

      const result = await expenseService.updateExpense('expense123', { amount: 150, description: 'Updated Expense' } as any);

      expect(result).toEqual(mockExpense);
      expect(mockExpenseRepository.findById).toHaveBeenCalledWith('expense123');
      expect(mockExpenseRepository.update).toHaveBeenCalledWith('expense123', expect.objectContaining({
        amount: expect.objectContaining({
          currency: 'USD',
          value: 150
        }),
        description: 'Updated Expense'
      }));
    })
  })

  describe('deleteExpense', () => {
    it('deletes expense successfully', async () => {
      const mockExpense = Expense.create({
        userId: 'user123',
        amount: 100,
        currency: 'USD',
        category: ExpenseCategory.FOOD_AND_DRINKS,
        description: 'Test Expense',
        date: new Date('2024-01-01'),
      }, 'expense123');

      // Mock both findById and delete methods
      vi.mocked(mockExpenseRepository.findById).mockResolvedValue(mockExpense);
      vi.mocked(mockExpenseRepository.delete).mockResolvedValue(true);

      const result = await expenseService.deleteExpense('expense123');

      expect(result).toBe(true);
      expect(mockExpenseRepository.findById).toHaveBeenCalledWith('expense123');
      expect(mockExpenseRepository.delete).toHaveBeenCalledWith('expense123');
    })

    it('throws error when expense not found for deletion', async () => {
      vi.mocked(mockExpenseRepository.findById).mockResolvedValue(null);

      await expect(expenseService.deleteExpense('nonexistent'))
        .rejects.toThrow('Expense not found');
    })
  })

  describe('getExpensesByDateRange', () => {
    it('fetches expenses by date range successfully', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');
      const mockPaginatedResult = {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
      };

      vi.mocked(mockExpenseRepository.findByDateRange).mockResolvedValue(mockPaginatedResult);

      const result = await expenseService.getExpensesByDateRange('user123', startDate, endDate);

      expect(result).toEqual(mockPaginatedResult);
      expect(mockExpenseRepository.findByDateRange).toHaveBeenCalledWith('user123', startDate, endDate, undefined);
    })

    it('handles invalid date range', async () => {
      const startDate = new Date('2024-01-31');
      const endDate = new Date('2024-01-01');

      await expect(expenseService.getExpensesByDateRange('user123', startDate, endDate))
        .rejects.toThrow('Start date cannot be after end date');
    })
  })

  describe('getExpensesByAmountRange', () => {
    it('fetches expenses by amount range successfully', async () => {
      const mockPaginatedResult = {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
      };

      vi.mocked(mockExpenseRepository.findByAmountRange).mockResolvedValue(mockPaginatedResult);

      const result = await expenseService.getExpensesByAmountRange('user123', 10, 100, 'USD');

      expect(result).toEqual(mockPaginatedResult);
      expect(mockExpenseRepository.findByAmountRange).toHaveBeenCalledWith('user123', 10, 100, 'USD', undefined);
    })

    it('handles negative amount values', async () => {
      await expect(expenseService.getExpensesByAmountRange('user123', -10, 100, 'USD'))
        .rejects.toThrow('Amount values cannot be negative');
    })

    it('handles invalid amount range', async () => {
      await expect(expenseService.getExpensesByAmountRange('user123', 100, 10, 'USD'))
        .rejects.toThrow('Minimum amount cannot be greater than maximum amount');
    })
  })

  describe('getExpensesByTags', () => {
    it('fetches expenses by tags successfully', async () => {
      const mockPaginatedResult = {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
      };

      vi.mocked(mockExpenseRepository.findByTags).mockResolvedValue(mockPaginatedResult);

      const result = await expenseService.getExpensesByTags('user123', ['groceries', 'food']);

      expect(result).toEqual(mockPaginatedResult);
      expect(mockExpenseRepository.findByTags).toHaveBeenCalledWith('user123', ['groceries', 'food'], undefined);
    })

    it('handles empty tags array', async () => {
      await expect(expenseService.getExpensesByTags('user123', []))
        .rejects.toThrow('At least one tag must be provided');
    })
  })

  describe('searchExpensesByDescription', () => {
    it('searches expenses by description successfully', async () => {
      const mockPaginatedResult = {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
      };

      vi.mocked(mockExpenseRepository.searchByDescription).mockResolvedValue(mockPaginatedResult);

      const result = await expenseService.searchExpensesByDescription('user123', 'groceries');

      expect(result).toEqual(mockPaginatedResult);
      expect(mockExpenseRepository.searchByDescription).toHaveBeenCalledWith('user123', 'groceries', undefined);
    })

    it('handles empty search term', async () => {
      await expect(expenseService.searchExpensesByDescription('user123', ''))
        .rejects.toThrow('Search term cannot be empty');
    })
  })
}) 