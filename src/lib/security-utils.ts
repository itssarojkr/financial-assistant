
// Security utility functions for input validation and sanitization

export const SECURITY_LIMITS = {
  MAX_SALARY: 10000000, // $10M max salary
  MIN_SALARY: 0,
  MAX_STRING_LENGTH: 1000,
  MAX_DESCRIPTION_LENGTH: 2000,
} as const;

export const validateSalaryInput = (salary: number): { isValid: boolean; error?: string } => {
  if (isNaN(salary) || !isFinite(salary)) {
    return { isValid: false, error: 'Please enter a valid salary amount' };
  }
  
  if (salary < SECURITY_LIMITS.MIN_SALARY) {
    return { isValid: false, error: 'Salary cannot be negative' };
  }
  
  if (salary > SECURITY_LIMITS.MAX_SALARY) {
    return { isValid: false, error: 'Salary amount exceeds maximum limit ($10,000,000)' };
  }
  
  return { isValid: true };
};

export const sanitizeStringInput = (input: string, maxLength = SECURITY_LIMITS.MAX_STRING_LENGTH): string => {
  if (!input || typeof input !== 'string') return '';
  
  // Remove potentially dangerous characters and limit length
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, ''); // Basic XSS prevention
};

export const validateNumericInput = (value: number, min = 0, max = Number.MAX_SAFE_INTEGER): { isValid: boolean; error?: string } => {
  if (isNaN(value) || !isFinite(value)) {
    return { isValid: false, error: 'Please enter a valid number' };
  }
  
  if (value < min) {
    return { isValid: false, error: `Value must be at least ${min}` };
  }
  
  if (value > max) {
    return { isValid: false, error: `Value exceeds maximum limit of ${max}` };
  }
  
  return { isValid: true };
};

// Rate limiting for API calls
class SimpleRateLimit {
  private requests: Map<string, number[]> = new Map();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests = 10, windowMs = 60000) { // 10 requests per minute default
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  isAllowed(key: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    
    // Remove expired requests
    const validRequests = requests.filter(time => now - time < this.windowMs);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(key, validRequests);
    
    return true;
  }
}

export const apiRateLimit = new SimpleRateLimit();
