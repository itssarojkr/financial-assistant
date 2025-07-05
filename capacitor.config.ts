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
      spinnerColor: "#3b82f6"
    },
    StatusBar: {
      style: 'dark'
    }
  }
};

export default config; 