import { useState, useEffect } from 'react';
import { MobileService } from '@/services/mobileService';

export const useMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [deviceInfo, setDeviceInfo] = useState<any>(null);

  useEffect(() => {
    const initializeMobile = async () => {
      await MobileService.initialize();
      const mobile = MobileService.isMobile();
      setIsMobile(mobile);
      
      if (mobile) {
        const info = await MobileService.getDeviceInfo();
        setDeviceInfo(info);
      }
      
      setIsLoading(false);
    };

    initializeMobile();
  }, []);

  return {
    isMobile,
    isLoading,
    deviceInfo,
    hapticFeedback: MobileService.hapticFeedback,
    vibrate: MobileService.vibrate
  };
};
