# Mobile Setup Guide

This document covers how to set up the Financial Assistant mobile app for development and testing.

## Prerequisites
- Node.js and npm installed
- Android Studio (for Android)
- Xcode (for iOS, macOS only)
- Capacitor CLI installed globally (`npm install -g @capacitor/cli`)

## Setup Steps
1. Clone the repository: `git clone <repository-url>`
2. Install dependencies: `npm install`
3. Build the web app: `npm run build`
4. Add the mobile platform:
   - Android: `npx cap add android`
   - iOS: `npx cap add ios`
5. Sync changes: `npx cap sync`
6. Open in IDE:
   - Android: `npx cap open android`
   - iOS: `npx cap open ios`

## Testing
- Use Android Studio or Xcode emulators for testing.
- Test on real devices for best results.

---

For mobile features, see [Mobile Features](./features.md).
For coding standards, see [Coding Guidelines](../CODING_GUIDELINES.md). 