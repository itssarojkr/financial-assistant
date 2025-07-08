import { ExpenseItem, BudgetItem, AlertItem } from '../../application/services/UserDataService';

export interface ExportFormat {
  type: 'json' | 'csv' | 'xlsx' | 'pdf';
  includeMetadata?: boolean;
  includeCalculations?: boolean;
  dateRange?: { start: Date; end: Date };
}

export interface ExportData {
  expenses: ExpenseItem[];
  budgets: BudgetItem[];
  alerts: AlertItem[];
  metadata: Record<string, unknown>;
}

export interface ExportResult {
  data: string | Blob;
  filename: string;
  mimeType: string;
}

export class DataExportService {
  private static instance: DataExportService;

  static getInstance(): DataExportService {
    if (!DataExportService.instance) {
      DataExportService.instance = new DataExportService();
    }
    return DataExportService.instance;
  }

  /**
   * Export data in specified format
   */
  async exportData(data: ExportData, format: ExportFormat): Promise<ExportResult> {
    switch (format.type) {
      case 'json':
        return this.exportAsJSON(data, format);
      case 'csv':
        return this.exportAsCSV(data, format);
      case 'xlsx':
        return this.exportAsXLSX(data, format);
      case 'pdf':
        return this.exportAsPDF(data, format);
      default:
        throw new Error(`Unsupported export format: ${format.type}`);
    }
  }

  /**
   * Export as JSON
   */
  private async exportAsJSON(data: ExportData, format: ExportFormat): Promise<ExportResult> {
    const exportData: Record<string, unknown> = {
      exportDate: new Date().toISOString(),
      version: '1.0',
      data: {
        expenses: data.expenses,
        budgets: data.budgets,
        alerts: data.alerts
      }
    };

    if (format.includeMetadata) {
      exportData.metadata = data.metadata;
    }

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });

    return {
      data: blob,
      filename: `financial-data-${new Date().toISOString().split('T')[0]}.json`,
      mimeType: 'application/json'
    };
  }

  /**
   * Export as CSV
   */
  private async exportAsCSV(data: ExportData, format: ExportFormat): Promise<ExportResult> {
    const csvLines: string[] = [];
    
    // Add expenses
    if (data.expenses.length > 0) {
      csvLines.push('EXPENSES');
      csvLines.push('ID,Category,Amount,Currency,Date,Description,Location');
      data.expenses.forEach(expense => {
        csvLines.push(`${expense.id},${expense.category_id},${expense.amount},${expense.currency},${expense.date},"${expense.description || ''}","${expense.location || ''}"`);
      });
      csvLines.push('');
    }

    // Add budgets
    if (data.budgets.length > 0) {
      csvLines.push('BUDGETS');
      csvLines.push('ID,Category,Amount,Period,StartDate,EndDate');
      data.budgets.forEach(budget => {
        csvLines.push(`${budget.id},${budget.category_id},${budget.amount},${budget.period},"${budget.start_date || ''}","${budget.end_date || ''}"`);
      });
      csvLines.push('');
    }

    // Add alerts
    if (data.alerts.length > 0) {
      csvLines.push('ALERTS');
      csvLines.push('ID,Category,Threshold,Period,Active');
      data.alerts.forEach(alert => {
        csvLines.push(`${alert.id},${alert.category_id},${alert.threshold},${alert.period},${alert.active}`);
      });
    }

    const csvContent = csvLines.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });

    return {
      data: blob,
      filename: `financial-data-${new Date().toISOString().split('T')[0]}.csv`,
      mimeType: 'text/csv'
    };
  }

  /**
   * Export as XLSX
   */
  private async exportAsXLSX(data: ExportData, format: ExportFormat): Promise<ExportResult> {
    // This would require a library like 'xlsx' or 'exceljs'
    // For now, we'll return a placeholder
    const placeholder = 'XLSX export not implemented';
    const blob = new Blob([placeholder], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    return {
      data: blob,
      filename: `financial-data-${new Date().toISOString().split('T')[0]}.xlsx`,
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    };
  }

  /**
   * Export as PDF
   */
  private async exportAsPDF(data: ExportData, format: ExportFormat): Promise<ExportResult> {
    // This would require a library like 'jsPDF' or 'puppeteer'
    // For now, we'll return a placeholder
    const placeholder = 'PDF export not implemented';
    const blob = new Blob([placeholder], { type: 'application/pdf' });

    return {
      data: blob,
      filename: `financial-data-${new Date().toISOString().split('T')[0]}.pdf`,
      mimeType: 'application/pdf'
    };
  }

  /**
   * Download exported data
   */
  downloadExport(result: ExportResult): void {
    const url = URL.createObjectURL(result.data);
    const link = document.createElement('a');
    link.href = url;
    link.download = result.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Generate export preview
   */
  generatePreview(data: ExportData, format: ExportFormat): string {
    const preview: Record<string, unknown> = {
      totalExpenses: data.expenses.length,
      totalBudgets: data.budgets.length,
      totalAlerts: data.alerts.length,
      dateRange: this.getDateRange(data),
      totalAmount: this.calculateTotalAmount(data)
    };

    return JSON.stringify(preview, null, 2);
  }

  /**
   * Get date range from data
   */
  private getDateRange(data: ExportData): { start: string; end: string } | null {
    const allDates: Date[] = [];

    data.expenses.forEach(expense => {
      allDates.push(new Date(expense.date));
    });

    data.budgets.forEach(budget => {
      if (budget.start_date) allDates.push(new Date(budget.start_date));
      if (budget.end_date) allDates.push(new Date(budget.end_date));
    });

    if (allDates.length === 0) return null;

    const start = new Date(Math.min(...allDates.map(d => d.getTime())));
    const end = new Date(Math.max(...allDates.map(d => d.getTime())));

    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    };
  }

  /**
   * Calculate total amount from data
   */
  private calculateTotalAmount(data: ExportData): Record<string, number> {
    const totals: Record<string, number> = {};

    // Sum expenses by currency
    data.expenses.forEach(expense => {
      totals[expense.currency] = (totals[expense.currency] || 0) + expense.amount;
    });

    return totals;
  }

  /**
   * Validate export data
   */
  validateExportData(data: ExportData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate expenses
    data.expenses.forEach((expense, index) => {
      if (!expense.id) errors.push(`Expense ${index}: Missing ID`);
      if (!expense.amount || expense.amount <= 0) errors.push(`Expense ${index}: Invalid amount`);
      if (!expense.currency) errors.push(`Expense ${index}: Missing currency`);
      if (!expense.date) errors.push(`Expense ${index}: Missing date`);
    });

    // Validate budgets
    data.budgets.forEach((budget, index) => {
      if (!budget.id) errors.push(`Budget ${index}: Missing ID`);
      if (!budget.amount || budget.amount <= 0) errors.push(`Budget ${index}: Invalid amount`);
      if (!budget.period) errors.push(`Budget ${index}: Missing period`);
    });

    // Validate alerts
    data.alerts.forEach((alert, index) => {
      if (!alert.id) errors.push(`Alert ${index}: Missing ID`);
      if (!alert.threshold || alert.threshold <= 0) errors.push(`Alert ${index}: Invalid threshold`);
      if (!alert.period) errors.push(`Alert ${index}: Missing period`);
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }
} 