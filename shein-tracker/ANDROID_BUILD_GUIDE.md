# Android App Build Guide

## Current Status

✅ **Web App**: Running at http://localhost:5173
✅ **Backend API**: Running at http://localhost:5000/api
✅ **Database**: PostgreSQL running with test orders
✅ **Android Code**: Complete and ready to build
⚠️ **Android Build Environment**: Needs setup

## Test Orders Created

| Order ID | City | Mode | Total (LYD) | Status |
|----------|------|------|------------|--------|
| WEB-TEST-001 | Tripoli | Price | 590 | not_confirmed |
| WEB-TEST-002 | Benghazi | Price | 1170 | not_confirmed |
| WEB-TEST-003 | Misrata | Weight | 108 | not_confirmed |

## Step 3: Building Android APK

### Prerequisites

To build the Android APK, you need:

1. **Android Studio** (includes Android SDK and Gradle)
   - Download: https://developer.android.com/studio
   - Install with default settings

2. **Java JDK** (already installed)
   - Version: 25.0.1 ✅

### Quick Build with Android Studio

1. Open Android Studio
2. Click "Open" and select: `android-webview-prototype`
3. Wait for Gradle sync to complete
4. Click **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**
5. Find the APK at: `app/build/outputs/apk/debug/app-debug.apk`

### Command Line Build

After installing Android Studio:

```bash
cd android-webview-prototype

# First time - let Gradle download dependencies
./gradlew assembleDebug

# Output: app/build/outputs/apk/debug/app-debug.apk
```

### Release Build (Signed APK)

1. Generate keystore:
```bash
./generate_keystore.sh
```

2. Build release APK:
```bash
./build_and_sign_apk.sh
```

3. Output: `downloads/app-release.apk`

## Step 4: Upload to Server

### Option A: Local Testing (No Server)

For testing on your device without a server:

1. **Enable USB Debugging** on your Android device
2. **Install the APK**:
   ```bash
   adb install app-debug.apk
   ```
3. **Update the app URL** in MainActivity.kt:
   - Change `WEB_URL` to `http://YOUR_COMPUTER_IP:5173`
   - Find your IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)

### Option B: Deploy to Server

1. **Prepare your server** with:
   - Node.js installed
   - PostgreSQL database
   - Nginx or Apache web server

2. **Upload the app files**:
   ```bash
   # Upload backend
   scp -r backend/ user@server.com:/var/www/shein-tracker/
   
   # Upload frontend
   scp -r frontend/ user@server.com:/var/www/shein-tracker/
   
   # Upload APK
   scp downloads/app-release.apk user@server.com:/var/www/downloads/
   
   # Upload latest.json
   scp downloads/latest.json user@server.com:/var/www/downloads/
   ```

3. **Configure Nginx** (example):
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       # Frontend
       location / {
           proxy_pass http://localhost:5173;
       }
       
       # Backend API
       location /api {
           proxy_pass http://localhost:5000;
       }
       
       # Downloads
       location /downloads {
           alias /var/www/downloads;
           autoindex off;
       }
   }
   ```

4. **Update Android app URL**:
   - Edit `android-webview-prototype/app/src/main/java/com/shein/tracker/MainActivity.kt`
   - Change: `private val WEB_URL = "https://your-domain.com"`
   - Rebuild the APK

### Testing on Real Device

1. **Enable installation from unknown sources** in device settings
2. **Download the APK** from your server or transfer via USB
3. **Install the APK**
4. **Test the app**:
   - Open the app
   - Verify splash screen appears
   - Check if web content loads
   - Test offline mode (turn off WiFi)
   - Verify update check works

## Troubleshooting

### Build Errors

**"SDK not found"**
- Install Android Studio
- Set ANDROID_HOME environment variable
- Run `sdkmanager` to install required SDK platforms

**"Gradle sync failed"**
- Check internet connection
- Delete `.gradle` folder and retry
- Update Android Studio

**"Keystore not found"**
- Run `./generate_keystore.sh` first
- Check keystore file exists in project root

### App Not Loading

**"Web page not available"**
- Check WEB_URL in MainActivity.kt
- Verify backend is running
- Check network connection

**"Offline mode showing"**
- Check network connection
- Verify server is accessible
- Check firewall settings

## Next Steps

1. ✅ Test web app at http://localhost:5173
2. ✅ Create test orders (3 orders created)
3. ⏳ Build Android APK (requires Android Studio)
4. ⏳ Upload to server and test on device

## Quick Reference

| Task | Command |
|------|---------|
| Start backend | `cd backend && npm run dev` |
| Start frontend | `cd frontend && npm run dev` |
| Build debug APK | `cd android-webview-prototype && ./gradlew assembleDebug` |
| Build release APK | `./build_and_sign_apk.sh` |
| Install on device | `adb install app-debug.apk` |
| View logs | `adb logcat` |

---

**Status**: Ready for Android Studio setup and build
