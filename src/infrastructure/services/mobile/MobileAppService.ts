import { App } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Device } from '@capacitor/device';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Network } from '@capacitor/network';
import { NotificationService } from '@/infrastructure/notifications/NotificationService';
import { SecurityService } from '@/infrastructure/security/SecurityService';

export interface MobileAppConfig {
  enableNotifications: boolean;
  enableHaptics: boolean;
  enableOfflineSync: boolean;
  enableCamera: boolean;
  enableBiometricAuth: boolean;
  enableVoiceInput: boolean;
  enableAdvancedSearch: boolean;
  enableWidgets: boolean;
  enableThemeSupport: boolean;
  enableAccessibility: boolean;
  enablePerformanceMonitoring: boolean;
  enableSecurityFeatures: boolean;
  statusBarStyle: 'light' | 'dark';
  splashScreenDuration: number;
}

/**
 * MobileAppService for managing mobile app lifecycle and features
 * 
 * This service coordinates all mobile-specific functionality including
 * app lifecycle management, device features, and mobile-specific services.
 */
export class MobileAppService {
  private static instance: MobileAppService;
  private isInitialized = false;
  private config: MobileAppConfig = {
    enableNotifications: true,
    enableHaptics: true,
    enableOfflineSync: true,
    enableCamera: true,
    enableBiometricAuth: true,
    enableVoiceInput: true,
    enableAdvancedSearch: true,
    enableWidgets: true,
    enableThemeSupport: true,
    enableAccessibility: true,
    enablePerformanceMonitoring: true,
    enableSecurityFeatures: true,
    statusBarStyle: 'dark',
    splashScreenDuration: 3000
  };

  private notificationService: NotificationService;
  private securityService: SecurityService;

  private constructor() {
    this.notificationService = NotificationService.getInstance();
    this.securityService = SecurityService.getInstance();
  }

  /**
   * Gets the singleton instance of MobileAppService
   */
  static getInstance(): MobileAppService {
    if (!MobileAppService.instance) {
      MobileAppService.instance = new MobileAppService();
    }
    return MobileAppService.instance;
  }

  /**
   * Initialize the mobile app service
   */
  async initialize(config?: Partial<MobileAppConfig>): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log('Initializing mobile app services...');

      // Update config with provided options
      if (config) {
        this.config = { ...this.config, ...config };
      }

      // Initialize core services
      await this.initializeCoreServices();
      
      // Initialize feature services
      await this.initializeFeatureServices();
      
      // Set up app lifecycle listeners
      await this.setupAppLifecycle();
      
      // Configure status bar
      await this.configureStatusBar();
      
      // Hide splash screen after initialization
      setTimeout(async () => {
        await SplashScreen.hide();
      }, this.config.splashScreenDuration);

      this.isInitialized = true;
      console.log('Mobile app services initialized successfully');
    } catch (error) {
      console.error('Failed to initialize mobile app services:', error);
      // Hide splash screen even if initialization fails
      await SplashScreen.hide();
    }
  }

  /**
   * Initialize core mobile services
   */
  private async initializeCoreServices(): Promise<void> {
    // Initialize device info
    const deviceInfo = await Device.getInfo();
    console.log('Device info:', deviceInfo);

    // Check network status
    const networkStatus = await Network.getStatus();
    console.log('Network status:', networkStatus);

    // Set up network listener
    Network.addListener('networkStatusChange', (status) => {
      console.log('Network status changed:', status);
      this.handleNetworkChange(status.connected);
    });
  }

  /**
   * Initialize feature-specific services
   */
  private async initializeFeatureServices(): Promise<void> {
    const promises: Promise<void>[] = [];

    // Initialize notifications
    if (this.config.enableNotifications) {
      promises.push(this.notificationService.initialize());
    }

    // Initialize security features
    if (this.config.enableSecurityFeatures) {
      promises.push(this.securityService.initialize());
    }

    // Wait for all services to initialize
    await Promise.allSettled(promises);
  }

  /**
   * Set up app lifecycle event listeners
   */
  private async setupAppLifecycle(): Promise<void> {
    // App state change listener
    App.addListener('appStateChange', ({ isActive }) => {
      console.log('App state changed:', isActive);
      this.handleAppStateChange(isActive);
    });

    // App URL open listener (for deep links)
    App.addListener('appUrlOpen', (data) => {
      console.log('App opened with URL:', data.url);
      this.handleDeepLink(data.url);
    });

    // App resume listener
    App.addListener('resume', () => {
      console.log('App resumed');
      this.handleAppResume();
    });

    // App pause listener
    App.addListener('pause', () => {
      console.log('App paused');
      this.handleAppPause();
    });
  }

  /**
   * Configure status bar appearance
   */
  private async configureStatusBar(): Promise<void> {
    try {
      await StatusBar.setStyle({
        style: this.config.statusBarStyle === 'dark' ? Style.Dark : Style.Light
      });
    } catch (error) {
      console.error('Failed to configure status bar:', error);
    }
  }

  /**
   * Handle network connectivity changes
   */
  private handleNetworkChange(isConnected: boolean): void {
    console.log('Network connectivity changed:', isConnected);
    // Implement network change handling logic
  }

  /**
   * Handle app state changes
   */
  private handleAppStateChange(isActive: boolean): void {
    console.log('App state changed:', isActive);
    // Implement app state change handling logic
  }

  /**
   * Handle deep link navigation
   */
  private handleDeepLink(url: string): void {
    console.log('Deep link received:', url);
    
    // Parse deep link and navigate accordingly
    if (url.includes('expense')) {
      this.navigateToAddExpense();
    } else if (url.includes('dashboard')) {
      this.navigateToDashboard();
    } else if (url.includes('tax')) {
      this.navigateToTaxCalculator();
    } else if (url.includes('budget')) {
      this.navigateToBudgetOverview();
    }
  }

  /**
   * Handle app resume events
   */
  private handleAppResume(): void {
    console.log('App resumed');
    // Implement resume logic (e.g., refresh data, check for updates)
  }

  /**
   * Handle app pause events
   */
  private handleAppPause(): void {
    console.log('App paused');
    // Implement pause logic (e.g., save state, pause background tasks)
  }

  /**
   * Navigate to add expense screen
   */
  private async navigateToAddExpense(): Promise<void> {
    // Implement navigation logic
    console.log('Navigating to add expense');
  }

  /**
   * Navigate to dashboard
   */
  private async navigateToDashboard(): Promise<void> {
    // Implement navigation logic
    console.log('Navigating to dashboard');
  }

  /**
   * Navigate to tax calculator
   */
  private async navigateToTaxCalculator(): Promise<void> {
    // Implement navigation logic
    console.log('Navigating to tax calculator');
  }

  /**
   * Navigate to budget overview
   */
  private async navigateToBudgetOverview(): Promise<void> {
    // Implement navigation logic
    console.log('Navigating to budget overview');
  }

  /**
   * Trigger haptic feedback
   */
  async triggerHapticFeedback(style: ImpactStyle = ImpactStyle.Light): Promise<void> {
    if (!this.config.enableHaptics) return;

    try {
      await Haptics.impact({ style });
    } catch (error) {
      console.error('Failed to trigger haptic feedback:', error);
    }
  }

  /**
   * Get device information
   */
  async getDeviceInfo(): Promise<DeviceInfo> {
    try {
      const info = await Device.getInfo();
      return {
        name: info.name,
        model: info.model,
        platform: info.platform,
        operatingSystem: info.operatingSystem,
        osVersion: info.osVersion,
        manufacturer: info.manufacturer,
        isVirtual: info.isVirtual,
        webViewVersion: info.webViewVersion
      };
    } catch (error) {
      console.error('Failed to get device info:', error);
      return {
        name: 'Unknown',
        model: 'Unknown',
        platform: 'unknown',
        operatingSystem: 'unknown',
        osVersion: 'unknown',
        manufacturer: 'Unknown',
        isVirtual: false,
        webViewVersion: 'unknown'
      };
    }
  }

  /**
   * Get network status
   */
  async getNetworkStatus(): Promise<NetworkStatus> {
    try {
      const status = await Network.getStatus();
      return {
        connected: status.connected,
        connectionType: status.connectionType
      };
    } catch (error) {
      console.error('Failed to get network status:', error);
      return {
        connected: false,
        connectionType: 'unknown'
      };
    }
  }

  /**
   * Get battery information
   */
  async getBatteryInfo(): Promise<BatteryInfo> {
    try {
      const battery = await Device.getBatteryInfo();
      return {
        batteryLevel: battery.batteryLevel,
        isCharging: battery.isCharging
      };
    } catch (error) {
      console.error('Failed to get battery info:', error);
      return {
        batteryLevel: 0,
        isCharging: false
      };
    }
  }

  /**
   * Get app information
   */
  async getAppInfo(): Promise<AppInfo> {
    try {
      const info = await App.getInfo();
      return {
        name: info.name,
        id: info.id,
        version: info.version,
        build: info.build
      };
    } catch (error) {
      console.error('Failed to get app info:', error);
      return {
        name: 'Financial Assistant',
        id: 'com.financialassistant.app',
        version: '1.0.0',
        build: '1'
      };
    }
  }

  /**
   * Get app state
   */
  async getAppState(): Promise<AppState> {
    try {
      const state = await App.getState();
      return {
        isActive: state.isActive
      };
    } catch (error) {
      console.error('Failed to get app state:', error);
      return {
        isActive: true
      };
    }
  }

  /**
   * Get app URL
   */
  async getAppUrl(): Promise<AppUrl> {
    try {
      const url = await App.getLaunchUrl();
      return {
        url: url?.url || null
      };
    } catch (error) {
      console.error('Failed to get app URL:', error);
      return {
        url: null
      };
    }
  }

  /**
   * Get app path
   */
  async getAppPath(): Promise<AppPath> {
    try {
      const path = await App.getPath();
      return {
        path: path.path
      };
    } catch (error) {
      console.error('Failed to get app path:', error);
      return {
        path: '/'
      };
    }
  }

  /**
   * Get app build info
   */
  async getAppBuildInfo(): Promise<AppBuildInfo> {
    try {
      const info = await App.getBuildInfo();
      return {
        version: info.version,
        build: info.build
      };
    } catch (error) {
      console.error('Failed to get app build info:', error);
      return {
        version: '1.0.0',
        build: '1'
      };
    }
  }

  /**
   * Exit the app
   */
  async exitApp(): Promise<void> {
    try {
      await App.exitApp();
    } catch (error) {
      console.error('Failed to exit app:', error);
    }
  }

  /**
   * Update mobile app configuration
   */
  updateConfig(newConfig: Partial<MobileAppConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  getConfig(): MobileAppConfig {
    return { ...this.config };
  }

  /**
   * Check if app is initialized
   */
  isAppInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Get biometric authentication info
   */
  async getBiometricInfo(): Promise<unknown> {
    if (!this.config.enableBiometricAuth) return null;
    // Implement biometric info retrieval
    return { available: false, type: 'none' };
  }

  /**
   * Get available voice commands
   */
  async getVoiceCommands(): Promise<unknown[]> {
    if (!this.config.enableVoiceInput) return [];
    // Implement voice commands retrieval
    return [];
  }

  /**
   * Get available widgets
   */
  async getWidgets(): Promise<unknown[]> {
    if (!this.config.enableWidgets) return [];
    // Implement widgets retrieval
    return [];
  }

  /**
   * Get quick actions
   */
  async getQuickActions(): Promise<unknown[]> {
    return [
      { id: 'add-expense', title: 'Add Expense', icon: 'plus' },
      { id: 'view-dashboard', title: 'Dashboard', icon: 'home' },
      { id: 'tax-calculator', title: 'Tax Calculator', icon: 'calculator' },
      { id: 'budget-overview', title: 'Budget', icon: 'pie-chart' }
    ];
  }

  /**
   * Get theme information
   */
  async getThemeInfo(): Promise<unknown> {
    if (!this.config.enableThemeSupport) return null;
    return { current: 'system', available: ['light', 'dark', 'system'] };
  }

  /**
   * Get accessibility information
   */
  async getAccessibilityInfo(): Promise<unknown> {
    if (!this.config.enableAccessibility) return null;
    return { enabled: false, features: [] };
  }

  /**
   * Get performance report
   */
  async getPerformanceReport(): Promise<unknown> {
    if (!this.config.enablePerformanceMonitoring) return null;
    return { status: 'good', metrics: {} };
  }

  /**
   * Get security audit
   */
  async getSecurityAudit(): Promise<unknown> {
    if (!this.config.enableSecurityFeatures) return null;
    return { status: 'secure', issues: [] };
  }
} 