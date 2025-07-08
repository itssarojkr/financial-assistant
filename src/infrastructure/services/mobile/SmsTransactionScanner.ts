/**
 * Stub service for SMS transaction scanning (Android only)
 * Replace with real implementation using a Cordova/Capacitor plugin for SMS access.
 */
export interface SmsTransaction {
  id: string;
  date: Date;
  amount: number;
  merchant: string;
  type: 'debit' | 'credit';
  raw: string;
}

export class SmsTransactionScanner {
  private static instance: SmsTransactionScanner;
  private isInitialized = false;

  static getInstance(): SmsTransactionScanner {
    if (!SmsTransactionScanner.instance) {
      SmsTransactionScanner.instance = new SmsTransactionScanner();
    }
    return SmsTransactionScanner.instance;
  }

  async initialize(): Promise<void> {
    // STUB: No real initialization
    this.isInitialized = true;
  }

  async requestSmsPermissions(): Promise<boolean> {
    // STUB: Always grant
    return true;
  }

  async scanForTransactions(): Promise<SmsTransaction[]> {
    // STUB: Simulate scanning with fake data after a delay
    await new Promise(res => setTimeout(res, 1200));
    return [
      {
        id: 'txn1',
        date: new Date(),
        amount: 123.45,
        merchant: 'Demo Merchant',
        type: 'debit',
        raw: 'Your account is debited by $123.45 at Demo Merchant.'
      },
      {
        id: 'txn2',
        date: new Date(),
        amount: 200.00,
        merchant: 'Sample Store',
        type: 'credit',
        raw: 'You received $200.00 from Sample Store.'
      }
    ];
  }
}

export const smsTransactionScanner = SmsTransactionScanner.getInstance(); 