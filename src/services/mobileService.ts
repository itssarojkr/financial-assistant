import { Device } from '@capacitor/device';
import { Network } from '@capacitor/network';
import { App } from '@capacitor/app';
import { Haptics } from '@capacitor/haptics';

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

export class MobileService {
  private static isMobilePlatform = false;

  static async initialize() {
    try {
      const info = await Device.getInfo();
      this.isMobilePlatform = info.platform !== 'web';
      console.log('Platform detected:', info.platform);
    } catch (error) {
      console.log('Running on web platform');
      this.isMobilePlatform = false;
    }
  }

  static isMobile(): boolean {
    return this.isMobilePlatform;
  }

  static async getDeviceInfo(): Promise<DeviceInfo | null> {
    if (!this.isMobile()) return null;
    
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
      console.error('Error getting device info:', error);
      return null;
    }
  }

  static async getNetworkStatus(): Promise<NetworkStatus> {
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

  static async addNetworkListener(callback: (status: NetworkStatus) => void) {
    if (!this.isMobile()) return;

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

  static async addAppStateListener(callback: (state: string) => void) {
    if (!this.isMobile()) return;

    try {
      await App.addListener('appStateChange', ({ isActive }) => {
        callback(isActive ? 'active' : 'background');
      });
    } catch (error) {
      console.error('Error adding app state listener:', error);
    }
  }

  static async hapticFeedback(type: 'light' | 'medium' | 'heavy' = 'light') {
    if (!this.isMobile()) return;

    try {
      switch (type) {
        case 'light':
          await Haptics.impact({ style: 'light' });
          break;
        case 'medium':
          await Haptics.impact({ style: 'medium' });
          break;
        case 'heavy':
          await Haptics.impact({ style: 'heavy' });
          break;
      }
    } catch (error) {
      console.error('Error triggering haptic feedback:', error);
    }
  }

  static async vibrate(duration: number = 100) {
    if (!this.isMobile()) return;

    try {
      await Haptics.vibrate({ duration });
    } catch (error) {
      console.error('Error triggering vibration:', error);
    }
  }

  static async getAppInfo() {
    if (!this.isMobile()) return null;

    try {
      const info = await App.getInfo();
      return info;
    } catch (error) {
      console.error('Error getting app info:', error);
      return null;
    }
  }

  static async exitApp() {
    if (!this.isMobile()) return;

    try {
      await App.exitApp();
    } catch (error) {
      console.error('Error exiting app:', error);
    }
  }
} 