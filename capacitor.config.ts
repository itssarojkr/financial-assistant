import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.financialassistant.app',
  appName: 'Financial Assistant',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      backgroundColor: "#ffffff",
      showSpinner: true,
      spinnerColor: "#3b82f6",
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      splashFullScreen: true,
      splashImmersive: true
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#ffffff'
    },
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#3B82F6",
      sound: "default",
      vibrate: true
    },
    App: {
      url: 'financialassistant://',
      appLinks: {
        ios: {
          appId: 'com.financialassistant.app',
          appName: 'Financial Assistant'
        },
        android: {
          packageName: 'com.financialassistant.app',
          scheme: 'financialassistant'
        }
      }
    },
    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true
    },
    Haptics: {
      enabled: true
    }
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
      keystorePassword: undefined
    }
  }
};

export default config; 