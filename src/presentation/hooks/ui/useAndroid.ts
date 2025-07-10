import { useState, useEffect } from 'react';
import { MobileService } from '@/infrastructure/services/mobile/MobileService';

/**
 * Android detection hook result interface
 */
export interface UseAndroidResult {
  isAndroid: boolean;
  isInitialized: boolean;
  deviceInfo: {
    platform: string;
    operatingSystem: string;
    osVersion: string;
    model: string;
    manufacturer: string;
  } | null;
}

/**
 * Custom hook for Android platform detection
 * 
 * This hook provides Android-specific detection and device information
 * for features that should only work on Android devices.
 */
export function useAndroid(): UseAndroidResult {
  const [isAndroid, setIsAndroid] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<UseAndroidResult['deviceInfo']>(null);

  useEffect(() => {
    const detectAndroid = async () => {
      try {
        const mobileService = MobileService.getInstance();
        await mobileService.initialize();
        
        const info = await mobileService.getDeviceInfo();
        
        if (info) {
          const isAndroidPlatform = info.platform === 'android';
          setIsAndroid(isAndroidPlatform);
          setDeviceInfo({
            platform: info.platform,
            operatingSystem: info.operatingSystem,
            osVersion: info.osVersion,
            model: info.model,
            manufacturer: info.manufacturer,
          });
        } else {
          // Fallback for web platform
          setIsAndroid(false);
          setDeviceInfo(null);
        }
      } catch (error) {
        console.log('Error detecting Android platform:', error);
        setIsAndroid(false);
        setDeviceInfo(null);
      } finally {
        setIsInitialized(true);
      }
    };

    detectAndroid();
  }, []);

  return {
    isAndroid,
    isInitialized,
    deviceInfo,
  };
} 