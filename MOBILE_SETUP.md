# Mobile App Setup Guide

## Overview
This project now supports cross-platform development using **Capacitor**, allowing you to build both web and mobile apps from a single codebase.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Installation
```bash
# Install dependencies
npm install

# Build the project
npm run build

# Add Android platform
npm run cap:add:android

# Sync changes
npm run cap:build
```

## 📱 Development Workflow

### Web Development
```bash
# Start web development server
npm run dev
```

### Mobile Development
```bash
# Build and sync to mobile
npm run cap:build

# Open in Android Studio
npm run cap:open:android

# Run on Android device/emulator
npm run cap:run:android
```

## 🏗️ Project Structure

```
financial-assistant/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── MobileLayout.tsx    # Mobile-specific layout
│   │   │   └── Header.tsx          # Web header
│   │   │
│   │   ├── pages/
│   │   │   ├── Index.tsx               # Web version
│   │   │   └── MobileIndex.tsx         # Mobile version
│   │   │
│   │   ├── services/
│   │   │   └── mobileService.ts        # Mobile platform services
│   │   │
│   │   └── hooks/
│   │       └── use-mobile.tsx          # Mobile detection hook
│   │
│   ├── android/                        # Android native project
│   │
│   ├── capacitor.config.ts             # Capacitor configuration
│   │
│   └── package.json                    # Build scripts
│
```

## 🔧 Configuration

### Capacitor Config (`capacitor.config.ts`)
```typescript
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
```

## 📱 Mobile Features

### Platform Detection
The app automatically detects the platform and renders the appropriate UI:

```typescript
import { useMobile } from '@/hooks/use-mobile';

const { isMobile, isLoading, deviceInfo, hapticFeedback } = useMobile();
```

### Mobile Services
Access native device capabilities:

```typescript
import { MobileService } from '@/services/mobileService';

// Device information
const deviceInfo = await MobileService.getDeviceInfo();

// Network status
const networkStatus = await MobileService.getNetworkStatus();

// Haptic feedback
await MobileService.hapticFeedback('light');
```

### Mobile Layout Components
Use mobile-optimized components:

```typescript
import { MobileLayout, MobileCard } from '@/components/layout/MobileLayout';

<MobileLayout title="My App" showBackButton onBack={handleBack}>
  <MobileCard onClick={handleClick}>
    Content here
  </MobileCard>
</MobileLayout>
```

## 🛠️ Available Scripts

| Script | Description |
|--------|-------------|
| `npm run cap:add:android` | Add Android platform |
| `npm run cap:add:ios` | Add iOS platform |
| `npm run cap:build` | Build and sync to mobile |
| `npm run cap:open:android` | Open in Android Studio |
| `npm run cap:open:ios` | Open in Xcode |
| `npm run cap:run:android` | Run on Android |
| `npm run cap:run:ios` | Run on iOS |

## 📋 Platform-Specific Features

### Android
- ✅ SMS reading (for transaction scanning)
- ✅ Native notifications
- ✅ Haptic feedback
- ✅ Device information
- ✅ Network status monitoring

### iOS
- ✅ Native notifications
- ✅ Haptic feedback
- ✅ Device information
- ✅ Network status monitoring
- ❌ SMS reading (iOS limitation)

### Web
- ✅ Progressive Web App (PWA) features
- ✅ Service worker for offline functionality
- ✅ Responsive design
- ❌ Native device features

## 🔌 Capacitor Plugins

### Installed Plugins
- `@capacitor/device` - Device information
- `@capacitor/network` - Network status
- `@capacitor/app` - App lifecycle
- `@capacitor/haptics` - Haptic feedback

### Planned Plugins
- `@capacitor/local-notifications` - Local notifications
- `@capacitor/camera` - Camera access
- `@capacitor/storage` - Local storage
- `@capacitor/sms` - SMS reading (Android only)

## 📱 Building for Production

### Android APK
```bash
# Build the web app
npm run build

# Sync to Android
npx cap sync android

# Open Android Studio
npx cap open android

# In Android Studio: Build > Build Bundle(s) / APK(s) > Build APK(s)
```

### iOS App
```bash
# Build the web app
npm run build

# Sync to iOS
npx cap sync ios

# Open Xcode
npx cap open ios

# In Xcode: Product > Archive
```

## 🧪 Testing

### Web Testing
```bash
npm run test
npm run test:ui
```

### Mobile Testing
- Use Android Studio's built-in emulator
- Test on physical devices
- Use Firebase Test Lab for automated testing

## 🚨 Troubleshooting

### Common Issues

1. **Build fails**
   ```bash
   # Clear cache and rebuild
   npm run build
   npx cap sync
   ```

2. **Android Studio not opening**
   ```bash
   # Ensure Android Studio is installed
   # Check ANDROID_HOME environment variable
   ```

3. **Plugin not working**
   ```bash
   # Reinstall plugins
   npm install @capacitor/plugin-name
   npx cap sync
   ```

### Platform-Specific Issues

#### Android
- Ensure Android SDK is installed
- Check device/emulator is connected
- Verify USB debugging is enabled

#### iOS
- Requires macOS
- Xcode must be installed
- iOS Simulator or physical device needed

## 📚 Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Android Development Guide](https://developer.android.com/guide)
- [iOS Development Guide](https://developer.apple.com/develop/)
- [React Native vs Capacitor Comparison](https://capacitorjs.com/docs/vs/react-native)

## 🎯 Next Steps

1. **Add SMS scanning** for Android
2. **Implement push notifications**
3. **Add offline functionality**
4. **Create app store listings**
5. **Set up CI/CD for mobile builds**

## 🤝 Contributing

When adding mobile features:
1. Test on both web and mobile
2. Use platform detection for conditional code
3. Follow mobile UI/UX best practices
4. Add appropriate error handling
5. Update this documentation 