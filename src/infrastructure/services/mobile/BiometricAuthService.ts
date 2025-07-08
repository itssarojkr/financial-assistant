import { BiometricAuth } from '@aparajita/capacitor-biometric-auth';

export interface BiometricConfig {
  title: string;
  subtitle: string;
  description: string;
  fallbackTitle: string;
  allowDeviceCredential: boolean;
}

export interface BiometricResult {
  success: boolean;
  error?: string;
  biometricType?: 'fingerprint' | 'face' | 'iris' | 'none';
}

/**
 * BiometricAuthService for handling biometric authentication
 * 
 * This service provides biometric authentication functionality including
 * fingerprint, face ID, and iris scanning capabilities.
 */
export class BiometricAuthService {
  private static instance: BiometricAuthService;
  private isInitialized = false;
  private isAvailable = false;
  private biometricType: 'fingerprint' | 'face' | 'iris' | 'none' = 'none';

  /**
   * Gets the singleton instance of BiometricAuthService
   */
  static getInstance(): BiometricAuthService {
    if (!BiometricAuthService.instance) {
      BiometricAuthService.instance = new BiometricAuthService();
    }
    return BiometricAuthService.instance;
  }

  /**
   * Initialize the biometric authentication service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Check if biometric authentication is available
      const availability = await BiometricAuth.checkBiometry();
      this.isAvailable = availability.isAvailable;
      this.biometricType = this.mapBiometricType(availability.biometryType);
      
      console.log('Biometric availability:', {
        isAvailable: this.isAvailable,
        type: this.biometricType,
        details: availability
      });

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize biometric auth:', error);
      this.isAvailable = false;
      this.isInitialized = true;
    }
  }

  /**
   * Map biometric type to standardized format
   */
  private mapBiometricType(type: any): 'fingerprint' | 'face' | 'iris' | 'none' {
    const typeString = String(type).toLowerCase();
    switch (typeString) {
      case 'fingerprint':
      case 'touchid':
        return 'fingerprint';
      case 'face':
      case 'faceid':
        return 'face';
      case 'iris':
        return 'iris';
      default:
        return 'none';
    }
  }

  /**
   * Authenticate using biometrics
   */
  async authenticate(config?: Partial<BiometricConfig>): Promise<BiometricResult> {
    if (!this.isAvailable) {
      return {
        success: false,
        error: 'Biometric authentication is not available on this device'
      };
    }

    try {
      const defaultConfig: BiometricConfig = {
        title: 'Financial Assistant',
        subtitle: 'Secure Access',
        description: 'Please authenticate to access your financial data',
        fallbackTitle: 'Use Passcode',
        allowDeviceCredential: true
      };

      const authConfig = { ...defaultConfig, ...config };

      await BiometricAuth.authenticate({
        reason: authConfig.description
      });

      return {
        success: true,
        biometricType: this.biometricType
      };
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Authentication failed',
        biometricType: this.biometricType
      };
    }
  }

  /**
   * Authenticate for sensitive actions
   */
  async authenticateForSensitiveAction(action: string): Promise<BiometricResult> {
    return this.authenticate({
      title: 'Security Check',
      subtitle: action,
      description: `Please authenticate to ${action.toLowerCase()}`,
      fallbackTitle: 'Use Passcode'
    });
  }

  /**
   * Authenticate for payment operations
   */
  async authenticateForPayment(amount: number, currency: string = 'USD'): Promise<BiometricResult> {
    return this.authenticate({
      title: 'Payment Authorization',
      subtitle: `${currency} ${amount.toFixed(2)}`,
      description: 'Please authenticate to complete this payment',
      fallbackTitle: 'Use Passcode'
    });
  }

  /**
   * Authenticate for data export
   */
  async authenticateForDataExport(): Promise<BiometricResult> {
    return this.authenticate({
      title: 'Data Export',
      subtitle: 'Security Verification',
      description: 'Please authenticate to export your financial data',
      fallbackTitle: 'Use Passcode'
    });
  }

  /**
   * Authenticate for settings access
   */
  async authenticateForSettings(): Promise<BiometricResult> {
    return this.authenticate({
      title: 'Settings Access',
      subtitle: 'Security Check',
      description: 'Please authenticate to access app settings',
      fallbackTitle: 'Use Passcode'
    });
  }

  /**
   * Check if biometric authentication is available
   */
  isBiometricAvailable(): boolean {
    return this.isAvailable;
  }

  /**
   * Get the type of biometric authentication available
   */
  getBiometricType(): 'fingerprint' | 'face' | 'iris' | 'none' {
    return this.biometricType;
  }

  /**
   * Get user-friendly biometric type name
   */
  getBiometricTypeName(): string {
    switch (this.biometricType) {
      case 'fingerprint':
        return 'Fingerprint';
      case 'face':
        return 'Face ID';
      case 'iris':
        return 'Iris Scan';
      default:
        return 'None';
    }
  }

  /**
   * Check if biometric authentication is enabled for the app
   */
  async isBiometricEnabled(): Promise<boolean> {
    try {
      const settings = localStorage.getItem('biometricSettings');
      if (!settings) return false;
      
      const { enabled } = JSON.parse(settings);
      return enabled === true;
    } catch (error) {
      console.error('Failed to check biometric settings:', error);
      return false;
    }
  }

  /**
   * Enable or disable biometric authentication
   */
  async setBiometricEnabled(enabled: boolean): Promise<void> {
    try {
      const settings = {
        enabled,
        enabledAt: enabled ? new Date().toISOString() : null,
        biometricType: this.biometricType
      };
      
      localStorage.setItem('biometricSettings', JSON.stringify(settings));
      console.log('Biometric settings updated:', settings);
    } catch (error) {
      console.error('Failed to update biometric settings:', error);
      throw error;
    }
  }

  /**
   * Get biometric settings
   */
  async getBiometricSettings(): Promise<{
    enabled: boolean;
    enabledAt: string | null;
    biometricType: string;
  }> {
    try {
      const settings = localStorage.getItem('biometricSettings');
      if (!settings) {
        return {
          enabled: false,
          enabledAt: null,
          biometricType: this.biometricType
        };
      }
      
      return JSON.parse(settings);
    } catch (error) {
      console.error('Failed to get biometric settings:', error);
      return {
        enabled: false,
        enabledAt: null,
        biometricType: this.biometricType
      };
    }
  }

  /**
   * Check if device has biometric hardware
   */
  async hasBiometricHardware(): Promise<boolean> {
    try {
      const availability = await BiometricAuth.checkBiometry();
      return availability.isAvailable;
    } catch (error) {
      console.error('Failed to check biometric hardware:', error);
      return false;
    }
  }

  /**
   * Get comprehensive biometric information
   */
  async getBiometricInfo(): Promise<{
    isAvailable: boolean;
    biometricType: string;
    hardwareAvailable: boolean;
    settingsEnabled: boolean;
  }> {
    const hardwareAvailable = await this.hasBiometricHardware();
    const settingsEnabled = await this.isBiometricEnabled();
    
    return {
      isAvailable: this.isAvailable,
      biometricType: this.biometricType,
      hardwareAvailable,
      settingsEnabled
    };
  }

  /**
   * Reset biometric settings
   */
  async resetBiometricSettings(): Promise<void> {
    try {
      localStorage.removeItem('biometricSettings');
      console.log('Biometric settings reset');
    } catch (error) {
      console.error('Failed to reset biometric settings:', error);
      throw error;
    }
  }
} 