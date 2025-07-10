#!/usr/bin/env node

/**
 * Android Sync Script
 * Syncs web app changes with Android app and builds the updated version
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔄 Starting Android sync process...');

// Configuration
const ANDROID_DIR = path.join(__dirname, '..', 'android');
const WEB_APP_DIR = path.join(__dirname, '..', 'src');
const CAPACITOR_CONFIG = path.join(__dirname, '..', 'capacitor.config.ts');

// Colors for console output
const colors = {
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    blue: '\x1b[34m',
    reset: '\x1b[0m'
};

function log(message, color = 'blue') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
    log(`✅ ${message}`, 'green');
}

function logWarning(message) {
    log(`⚠️  ${message}`, 'yellow');
}

function logError(message) {
    log(`❌ ${message}`, 'red');
}

function logStep(message) {
    log(`🔄 ${message}`, 'blue');
}

// Check if required directories exist
function checkPrerequisites() {
    logStep('Checking prerequisites...');
    
    if (!fs.existsSync(ANDROID_DIR)) {
        logError('Android directory not found. Please ensure the Android project is set up.');
        process.exit(1);
    }
    
    if (!fs.existsSync(WEB_APP_DIR)) {
        logError('Web app directory not found.');
        process.exit(1);
    }
    
    if (!fs.existsSync(CAPACITOR_CONFIG)) {
        logError('Capacitor config not found.');
        process.exit(1);
    }
    
    logSuccess('Prerequisites check passed');
}

// Build the web app
function buildWebApp() {
    logStep('Building web app...');
    
    try {
        execSync('npm run build', { 
            cwd: path.join(__dirname, '..'),
            stdio: 'inherit'
        });
        logSuccess('Web app built successfully');
    } catch (error) {
        logError('Failed to build web app');
        process.exit(1);
    }
}

// Sync web app with Capacitor
function syncCapacitor() {
    logStep('Syncing with Capacitor...');
    
    try {
        execSync('npx cap sync android', { 
            cwd: path.join(__dirname, '..'),
            stdio: 'inherit'
        });
        logSuccess('Capacitor sync completed');
    } catch (error) {
        logError('Failed to sync with Capacitor');
        process.exit(1);
    }
}

// Build Android app
function buildAndroidApp() {
    logStep('Building Android app...');
    
    try {
        // Change to Android directory
        process.chdir(ANDROID_DIR);
        
        // Clean build
        logStep('Cleaning previous build...');
        execSync('./gradlew clean', { stdio: 'inherit' });
        
        // Build debug APK
        logStep('Building debug APK...');
        execSync('./gradlew assembleDebug', { stdio: 'inherit' });
        
        logSuccess('Android app built successfully');
    } catch (error) {
        logError('Failed to build Android app');
        process.exit(1);
    }
}

// Copy built APK to dist directory
function copyAPK() {
    logStep('Copying APK to dist directory...');
    
    const apkPath = path.join(ANDROID_DIR, 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
    const distDir = path.join(__dirname, '..', 'dist');
    const distAPK = path.join(distDir, 'financial-assistant-debug.apk');
    
    try {
        if (!fs.existsSync(distDir)) {
            fs.mkdirSync(distDir, { recursive: true });
        }
        
        if (fs.existsSync(apkPath)) {
            fs.copyFileSync(apkPath, distAPK);
            logSuccess(`APK copied to ${distAPK}`);
        } else {
            logWarning('APK not found at expected location');
        }
    } catch (error) {
        logError('Failed to copy APK');
        console.error(error);
    }
}

// Update Android manifest with new features
function updateAndroidManifest() {
    logStep('Updating Android manifest...');
    
    const manifestPath = path.join(ANDROID_DIR, 'app', 'src', 'main', 'AndroidManifest.xml');
    
    try {
        let manifest = fs.readFileSync(manifestPath, 'utf8');
        
        // Add new permissions if needed
        const newPermissions = [
            'android.permission.INTERNET',
            'android.permission.ACCESS_NETWORK_STATE',
            'android.permission.WAKE_LOCK',
            'android.permission.RECEIVE_BOOT_COMPLETED'
        ];
        
        // Add new intent filters for deep linking
        const newIntentFilters = `
        <intent-filter android:autoVerify="true">
            <action android:name="android.intent.action.VIEW" />
            <category android:name="android.intent.category.DEFAULT" />
            <category android:name="android.intent.category.BROWSABLE" />
            <data android:scheme="https" android:host="financial-assistant.app" />
        </intent-filter>
        <intent-filter>
            <action android:name="android.intent.action.VIEW" />
            <category android:name="android.intent.category.DEFAULT" />
            <category android:name="android.intent.category.BROWSABLE" />
            <data android:scheme="financial-assistant" />
        </intent-filter>`;
        
        // Check if intent filters already exist
        if (!manifest.includes('android:scheme="financial-assistant"')) {
            // Find the activity tag and add intent filters
            const activityPattern = /(<activity[^>]*android:name=".MainActivity"[^>]*>)/;
            if (activityPattern.test(manifest)) {
                manifest = manifest.replace(
                    activityPattern,
                    `$1${newIntentFilters}`
                );
            }
        }
        
        fs.writeFileSync(manifestPath, manifest);
        logSuccess('Android manifest updated');
    } catch (error) {
        logError('Failed to update Android manifest');
        console.error(error);
    }
}

// Update build.gradle with new dependencies
function updateBuildGradle() {
    logStep('Updating build.gradle...');
    
    const buildGradlePath = path.join(ANDROID_DIR, 'app', 'build.gradle');
    
    try {
        let buildGradle = fs.readFileSync(buildGradlePath, 'utf8');
        
        // Add new dependencies if needed
        const newDependencies = [
            'implementation "androidx.work:work-runtime:2.8.1"',
            'implementation "androidx.lifecycle:lifecycle-service:2.6.1"',
            'implementation "androidx.concurrent:concurrent-futures:1.1.0"'
        ];
        
        // Check if dependencies section exists
        if (buildGradle.includes('dependencies {')) {
            // Add new dependencies before the closing brace
            const dependenciesPattern = /(dependencies \{[\s\S]*?)(\})/;
            if (dependenciesPattern.test(buildGradle)) {
                const existingDependencies = buildGradle.match(dependenciesPattern)[1];
                const newDepsString = newDependencies.join('\n    ');
                
                buildGradle = buildGradle.replace(
                    dependenciesPattern,
                    `${existingDependencies}    ${newDepsString}\n$2`
                );
            }
        }
        
        fs.writeFileSync(buildGradlePath, buildGradle);
        logSuccess('build.gradle updated');
    } catch (error) {
        logError('Failed to update build.gradle');
        console.error(error);
    }
}

// Main sync process
async function syncAndroid() {
    try {
        log('🚀 Starting Android sync process...');
        
        // Step 1: Check prerequisites
        checkPrerequisites();
        
        // Step 2: Build web app
        buildWebApp();
        
        // Step 3: Update Android configuration
        updateAndroidManifest();
        updateBuildGradle();
        
        // Step 4: Sync with Capacitor
        syncCapacitor();
        
        // Step 5: Build Android app
        buildAndroidApp();
        
        // Step 6: Copy APK
        copyAPK();
        
        logSuccess('🎉 Android sync completed successfully!');
        log('📱 APK is ready in the dist directory');
        
    } catch (error) {
        logError('Android sync failed');
        console.error(error);
        process.exit(1);
    }
}

// Run the sync process
if (import.meta.url === `file://${process.argv[1]}`) {
    syncAndroid();
}

export { syncAndroid }; 