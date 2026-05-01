# Shein Tracker Android WebView App

A native Android application that wraps the Shein Tracker web application in a WebView with offline support, automatic updates, and secure token storage.

## Features

- **WebView Integration**: Full web application experience in native app
- **Splash Screen**: Professional splash screen on app launch
- **Offline Support**: Caches content for offline viewing with fallback UI
- **Automatic Updates**: Checks for app updates against `/downloads/latest.json`
- **Secure Storage**: Uses Android Keystore for token storage (no DB credentials in app)
- **Network Detection**: Automatically detects network state changes
- **SHA-256 Verification**: Verifies update downloads with checksums

## Project Structure

```
android-webview-prototype/
├── app/
│   ├── src/main/
│   │   ├── java/com/shein/tracker/
│   │   │   ├── MainActivity.kt          # Main WebView activity
│   │   │   ├── SplashActivity.kt        # Splash screen
│   │   │   ├── UpdateActivity.kt        # Update dialog
│   │   │   ├── KeystoreHelper.kt        # Secure storage using Keystore
│   │   │   ├── UpdateChecker.kt         # Update checking logic
│   │   │   └── NetworkHelper.kt         # Network connectivity helper
│   │   ├── res/
│   │   │   ├── layout/                  # XML layouts
│   │   │   ├── values/                  # Strings, colors, themes
│   │   │   └── xml/                     # Backup rules
│   │   └── AndroidManifest.xml
│   ├── build.gradle.kts                 # App-level build config
│   └── proguard-rules.pro               # ProGuard rules
├── build.gradle.kts                     # Project-level build config
├── settings.gradle.kts                  # Gradle settings
└── gradle.properties                    # Gradle properties
```

## Requirements

- Android Studio Hedgehog (2023.1.1) or later
- JDK 17
- Android SDK 34
- Minimum SDK: 24 (Android 7.0)

## Building the App

### Debug Build

```bash
cd android-webview-prototype
./gradlew assembleDebug
```

Output: `app/build/outputs/apk/debug/app-debug.apk`

### Release Build

First, set up signing configuration:

1. Create a keystore:
```bash
keytool -genkey -v -keystore release.keystore -alias shein_tracker -keyalg RSA -keysize 2048 -validity 10000
```

2. Set environment variables or create `keystore.properties`:
```bash
export KEYSTORE_FILE=release.keystore
export KEYSTORE_PASSWORD=your_password
export KEY_ALIAS=shein_tracker
export KEY_PASSWORD=your_key_password
```

3. Build release APK:
```bash
./gradlew assembleRelease
```

Output: `app/build/outputs/apk/release/app-release.apk`

### Build AAB for Play Store

```bash
./gradlew bundleRelease
```

Output: `app/build/outputs/bundle/release/app-release.aab`

## Configuration

### Update Server URL

Update the `UPDATE_CHECK_URL` in `UpdateChecker.kt`:

```kotlin
private const val UPDATE_CHECK_URL = "https://your-domain.com/downloads/latest.json"
```

### Web App URL

Update the `WEB_URL` in `MainActivity.kt`:

```kotlin
private val WEB_URL = "https://your-domain.com"
```

## Update Server Format

The app expects a JSON file at `/downloads/latest.json` with the following format:

```json
{
  "versionName": "1.0.1",
  "versionCode": 2,
  "downloadUrl": "https://your-domain.com/downloads/app-release.apk",
  "sha256": "abc123def456...",
  "releaseNotes": "Bug fixes and improvements",
  "forceUpdate": false,
  "minSupportedVersion": 1
}
```

### Fields

- `versionName`: Display version name (e.g., "1.0.1")
- `versionCode`: Integer version code (must be higher than current)
- `downloadUrl`: URL to download the APK
- `sha256`: SHA-256 checksum of the APK file
- `releaseNotes`: Optional release notes
- `forceUpdate`: If true, user cannot skip the update
- `minSupportedVersion`: Minimum version code that can still use the app

## Security Features

### Android Keystore

The app uses Android Keystore for secure storage:

- **EncryptedSharedPreferences**: All sensitive data is encrypted
- **AES-256-GCM**: Encryption algorithm
- **Hardware-backed**: Uses hardware security when available

### Stored Data

The following data is stored securely:

- Authentication tokens
- User IDs
- Session data
- Last update check timestamp

### What's NOT Stored

- Database credentials (never in the app)
- API secrets (never in the app)
- Passwords (never in the app)

All database access remains server-side only.

## Permissions

The app requires the following permissions:

- `INTERNET`: Required for WebView and update checks
- `ACCESS_NETWORK_STATE`: Required for network detection
- `REQUEST_INSTALL_PACKAGES`: Required for installing updates

## Testing

### Run on Emulator/Device

```bash
./gradlew installDebug
```

### Run Tests

```bash
./gradlew test
./gradlew connectedAndroidTest
```

## Troubleshooting

### Build Fails with Signing Error

Make sure keystore environment variables are set:

```bash
export KEYSTORE_FILE=path/to/keystore
export KEYSTORE_PASSWORD=your_password
export KEY_ALIAS=your_alias
export KEY_PASSWORD=your_key_password
```

### WebView Shows Blank Screen

1. Check that `WEB_URL` is correct
2. Verify internet connection
3. Check if the web server is running
4. Enable WebView debugging in `MainActivity.kt` for troubleshooting

### Update Not Showing

1. Verify `UPDATE_CHECK_URL` is accessible
2. Check that `versionCode` in `latest.json` is higher than current
3. Verify SHA-256 checksum matches the APK
4. Check logs for errors

## License

[Your License Here]
