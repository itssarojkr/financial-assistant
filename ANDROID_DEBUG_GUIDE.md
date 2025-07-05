# Android Device Debugging Guide

## 🔍 **Current Status Check**

### ✅ What's Working:
- ✅ Project builds successfully
- ✅ Capacitor sync works
- ✅ Android Studio is installed at: `C:\Program Files\Android\Android Studio\bin\studio64.exe`
- ✅ Android project structure is correct

### ❌ What Needs Setup:
- ❌ ANDROID_HOME environment variable not set
- ❌ ADB (Android Debug Bridge) not in PATH
- ❌ Device connection not verified

## 🛠️ **Step-by-Step Debugging**

### **Step 1: Set Up Environment Variables**

#### Option A: Set ANDROID_HOME (Recommended)
1. **Find Android SDK location:**
   - Open Android Studio
   - Go to **File** → **Settings** → **Appearance & Behavior** → **System Settings** → **Android SDK**
   - Copy the "Android SDK Location" path (usually `C:\Users\[username]\AppData\Local\Android\Sdk`)

2. **Set Environment Variable:**
   ```powershell
   # Set ANDROID_HOME (replace with your actual path)
   $env:ANDROID_HOME = "C:\Users\$env:USERNAME\AppData\Local\Android\Sdk"
   
   # Add to PATH
   $env:PATH += ";$env:ANDROID_HOME\platform-tools"
   ```

3. **Verify ADB is available:**
   ```powershell
   adb version
   ```

#### Option B: Use Android Studio Directly
If environment setup is complex, we can use Android Studio's built-in tools.

### **Step 2: Device Connection Setup**

#### On Your Android Device:
1. **Enable Developer Options:**
   - Go to **Settings** → **About Phone**
   - Tap **Build Number** 7 times
   - You'll see "You are now a developer!"

2. **Enable USB Debugging:**
   - Go to **Settings** → **Developer Options**
   - Enable **USB Debugging**
   - Enable **USB Debugging (Security Settings)** if available

3. **Connect Device:**
   - Connect via USB cable
   - Select **File Transfer** or **MTP** mode
   - Accept the "Allow USB Debugging" prompt on your phone

### **Step 3: Verify Device Connection**

#### Using Android Studio:
1. **Open Android Studio** (should have opened from our command)
2. **Check Device Dropdown:**
   - Look at the top toolbar
   - You should see a dropdown with available devices
   - Your phone should appear in the list

3. **If device doesn't appear:**
   - Click the dropdown
   - Select **"Troubleshoot Device Connections"**
   - Follow the troubleshooting steps

#### Using Command Line (if ADB is set up):
```powershell
adb devices
```
You should see something like:
```
List of devices attached
ABCD1234    device
```

### **Step 4: Build and Deploy**

#### Method 1: Android Studio (Recommended)
1. **In Android Studio:**
   - Click the green **"Run"** button (▶️)
   - Select your device from the dropdown
   - Click **"OK"**
   - Wait for build and installation

2. **Monitor Build Process:**
   - Watch the bottom "Build" tab for progress
   - Check "Logcat" tab for any errors

#### Method 2: Command Line (if everything is set up)
```powershell
# Build and run
npm run cap:run:android
```

### **Step 5: Troubleshooting Common Issues**

#### Issue 1: "No devices found"
**Solutions:**
- Check USB cable connection
- Try different USB ports
- Enable USB debugging on device
- Install device drivers (if needed)

#### Issue 2: "Build failed"
**Solutions:**
```powershell
# Clean and rebuild
npm run cap:build
npm run cap:open:android
```

#### Issue 3: "App crashes on launch"
**Solutions:**
- Check Android Studio Logcat for error details
- Verify all permissions are granted
- Check if Supabase connection works

#### Issue 4: "Gradle sync failed"
**Solutions:**
- Check internet connection (for dependency downloads)
- Verify Android SDK is properly installed
- Try "File" → "Invalidate Caches and Restart"

## 📱 **Testing Checklist**

### **Device Connection:**
- [ ] Device appears in Android Studio device dropdown
- [ ] USB debugging is enabled
- [ ] Device is authorized for debugging

### **Build Process:**
- [ ] Gradle sync completes successfully
- [ ] Build process finishes without errors
- [ ] APK is generated and installed

### **App Launch:**
- [ ] App icon appears on device
- [ ] App launches without crashes
- [ ] Mobile layout renders correctly
- [ ] Platform detection works

### **Core Features:**
- [ ] Country selection works
- [ ] Salary input works
- [ ] Tax calculation works
- [ ] Save functionality works

### **Native Features:**
- [ ] Haptic feedback works
- [ ] Device info is logged
- [ ] Network status is detected

## 🚨 **Emergency Debugging Commands**

```powershell
# Force rebuild everything
npm run build
npx cap sync android
npm run cap:open:android

# Check Capacitor status
npx cap doctor

# List all devices (if ADB is available)
adb devices

# Check Android project structure
ls android/app/src/main/
```

## 📞 **Next Steps**

1. **Try opening Android Studio** (should have opened from our command)
2. **Check if your device appears** in the device dropdown
3. **Try building and running** the app
4. **Let me know what specific error** you encounter

## 🎯 **Success Indicators**

You'll know it's working when:
- ✅ Android Studio opens the project
- ✅ Your device appears in the device list
- ✅ App builds and installs successfully
- ✅ App launches with mobile layout
- ✅ All features work as expected

**What's the current status? Did Android Studio open? Can you see your device in the dropdown?** 