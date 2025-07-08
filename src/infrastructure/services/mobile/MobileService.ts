import { Device } from '@capacitor/device';
import { Network } from '@capacitor/network';
import { App } from '@capacitor/app';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export interface DeviceInfo {
  name: string;
  model: string;
  platform: string;
  operatingSystem: string;
  osVersion: string;
  manufacturer: string;
  isVirtual: boolean;
  webViewVersion: string;
}

export interface NetworkStatus {
  connected: boolean;
  connectionType: string;
}

/**
 * MobileService for handling mobile-specific functionality
 * 
 * This service provides device information, network status,
 * and mobile-specific features like haptic feedback.
 */
export class MobileService {
  private static instance: MobileService;
  private static isMobilePlatform = false;
  private isInitialized = false;

  /**
   * Gets the singleton instance of MobileService
   */
  static getInstance(): MobileService {
    if (!MobileService.instance) {
      MobileService.instance = new MobileService();
    }
    return MobileService.instance;
  }

  /**
   * Initialize the mobile service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      const info = await Device.getInfo();
      MobileService.isMobilePlatform = info.platform !== 'web';
      console.log('Platform detected:', info.platform);
      this.isInitialized = true;
    } catch (error) {
      console.log('Running on web platform');
      MobileService.isMobilePlatform = false;
      this.isInitialized = true;
    }
  }

  /**
   * Check if running on mobile platform
   */
  static isMobile(): boolean {
    return this.isMobilePlatform;
  }

  /**
   * Check if service is initialized
   */
  isServiceInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Get device information
   */
  async getDeviceInfo(): Promise<DeviceInfo | null> {
    if (!MobileService.isMobile()) return null;
    
    try {
      const info = await Device.getInfo();
      return {
        name: info.name || '',
        model: info.model || '',
        platform: info.platform || '',
        operatingSystem: info.operatingSystem || '',
        osVersion: info.osVersion || '',
        manufacturer: info.manufacturer || '',
        isVirtual: info.isVirtual || false,
        webViewVersion: info.webViewVersion || ''
      };
    } catch (error) {
      console.error('Error getting device info:', error);
      return null;
    }
  }

  /**
   * Get current network status
   */
  async getNetworkStatus(): Promise<NetworkStatus> {
    try {
      const status = await Network.getStatus();
      return {
        connected: status.connected,
        connectionType: status.connectionType
      };
    } catch (error) {
      console.error('Error getting network status:', error);
      return {
        connected: navigator.onLine,
        connectionType: 'unknown'
      };
    }
  }

  /**
   * Add network status change listener
   */
  async addNetworkListener(callback: (status: NetworkStatus) => void): Promise<void> {
    if (!MobileService.isMobile()) return;

    try {
      await Network.addListener('networkStatusChange', (status) => {
        callback({
          connected: status.connected,
          connectionType: status.connectionType
        });
      });
    } catch (error) {
      console.error('Error adding network listener:', error);
    }
  }

  /**
   * Add app state change listener
   */
  async addAppStateListener(callback: (state: string) => void): Promise<void> {
    if (!MobileService.isMobile()) return;

    try {
      await App.addListener('appStateChange', ({ isActive }) => {
        callback(isActive ? 'active' : 'background');
      });
    } catch (error) {
      console.error('Error adding app state listener:', error);
    }
  }

  /**
   * Trigger haptic feedback
   */
  async hapticFeedback(type: 'light' | 'medium' | 'heavy' = 'light'): Promise<void> {
    if (!MobileService.isMobile()) return;

    try {
      switch (type) {
        case 'light':
          await Haptics.impact({ style: ImpactStyle.Light });
          break;
        case 'medium':
          await Haptics.impact({ style: ImpactStyle.Medium });
          break;
        case 'heavy':
          await Haptics.impact({ style: ImpactStyle.Heavy });
          break;
      }
    } catch (error) {
      console.error('Error triggering haptic feedback:', error);
    }
  }

  /**
   * Trigger device vibration
   */
  async vibrate(duration: number = 100): Promise<void> {
    if (!MobileService.isMobile()) return;

    try {
      await Haptics.vibrate({ duration });
    } catch (error) {
      console.error('Error triggering vibration:', error);
    }
  }

  /**
   * Get app information
   */
  async getAppInfo(): Promise<any> {
    if (!MobileService.isMobile()) return null;

    try {
      const info = await App.getInfo();
      return info;
    } catch (error) {
      console.error('Error getting app info:', error);
      return null;
    }
  }

  /**
   * Exit the app
   */
  async exitApp(): Promise<void> {
    if (!MobileService.isMobile()) return;

    try {
      await App.exitApp();
    } catch (error) {
      console.error('Error exiting app:', error);
    }
  }

} 