# APK Signing and Publishing Guide

This directory contains scripts and documentation for building, signing, and publishing the Shein Tracker Android app.

## Quick Start

### One-Command Build and Sign

```bash
./build_and_sign_apk.sh
```

This script will:
1. Check requirements
2. Generate a keystore (if needed)
3. Build the release APK
4. Copy APK to downloads directory
5. Calculate SHA-256 checksum
6. Generate latest.json

## Individual Scripts

### 1. Generate Keystore

Creates a new Android keystore for signing the app.

```bash
./generate_keystore.sh
```

**Output:** `release.keystore`

**Important:**
- Keep this file safe and secure
- You'll need it for all future app updates
- If you lose it, you cannot update your app
- Add it to `.gitignore`

### 2. Calculate Checksum

Calculates the SHA-256 checksum of an APK file.

```bash
./calculate_checksum.sh [path/to/apk]
```

**Example:**
```bash
./calculate_checksum.sh downloads/app-release.apk
```

**Output:** `downloads/app-release.apk.sha256`

### 3. Generate latest.json

Creates the `latest.json` file that the Android app checks for updates.

```bash
./generate_latest_json.sh [version_name] [version_code] [download_base_url] [release_notes] [force_update] [min_supported_version]
```

**Example:**
```bash
./generate_latest_json.sh "1.0.1" 2 "https://example.com/downloads" "Bug fixes and improvements" false 1
```

**Output:** `downloads/latest.json`

## Manual Build Process

If you prefer to build manually:

### Step 1: Generate Keystore

```bash
keytool -genkey -v \
  -keystore release.keystore \
  -alias shein_tracker \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -dname "CN=Shein Tracker, OU=Development, O=Shein Tracker, L=Tripoli, ST=Tripoli, C=LY"
```

### Step 2: Configure Gradle

Create `keystore.properties`:

```properties
KEYSTORE_FILE=../release.keystore
KEYSTORE_PASSWORD=your_password
KEY_ALIAS=shein_tracker
KEY_PASSWORD=your_password
```

### Step 3: Build Release APK

```bash
cd android-webview-prototype
./gradlew assembleRelease
```

### Step 4: Copy APK

```bash
cp android-webview-prototype/app/build/outputs/apk/release/app-release.apk downloads/
```

### Step 5: Calculate Checksum

```bash
sha256sum downloads/app-release.apk > downloads/app-release.apk.sha256
```

### Step 6: Generate latest.json

```bash
./generate_latest_json.sh "1.0.0" 1 "https://your-domain.com/downloads" "Initial release" false 1
```

## latest.json Format

The `latest.json` file has the following structure:

```json
{
  "versionName": "1.0.0",
  "versionCode": 1,
  "downloadUrl": "https://your-domain.com/downloads/app-release.apk",
  "sha256": "abc123def456...",
  "releaseNotes": "Initial release of Shein Tracker app",
  "forceUpdate": false,
  "minSupportedVersion": 1
}
```

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `versionName` | string | Display version name (e.g., "1.0.0") |
| `versionCode` | integer | Integer version code (must be higher than current) |
| `downloadUrl` | string | Full URL to download the APK |
| `sha256` | string | SHA-256 checksum of the APK file |
| `releaseNotes` | string | Optional release notes |
| `forceUpdate` | boolean | If true, user cannot skip the update |
| `minSupportedVersion` | integer | Minimum version code that can still use the app |

## Publishing to Server

After building, upload the contents of `downloads/` to your server:

```bash
# Example using scp
scp downloads/* user@your-server.com:/var/www/html/downloads/

# Example using rsync
rsync -avz downloads/ user@your-server.com:/var/www/html/downloads/
```

Make sure:
1. The `latest.json` file is accessible at `https://your-domain.com/downloads/latest.json`
2. The APK is accessible at `https://your-domain.com/downloads/app-release.apk`
3. The server has proper MIME types configured

### Nginx Configuration Example

```nginx
location /downloads/ {
    alias /var/www/html/downloads/;
    autoindex off;

    # JSON files
    location ~ \.json$ {
        add_header Content-Type application/json;
    }

    # APK files
    location ~ \.apk$ {
        add_header Content-Type application/vnd.android.package-archive;
        add_header Content-Disposition attachment;
    }
}
```

## Version Management

### Incrementing Versions

When releasing a new version:

1. Update `versionName` and `versionCode` in `android-webview-prototype/app/build.gradle.kts`
2. Build and sign the new APK
3. Calculate the new SHA-256 checksum
4. Update `latest.json` with the new version info
5. Upload to server

### Version Code Rules

- Must be a positive integer
- Each new version must have a higher code than the previous
- Recommended format: `MAJOR * 10000 + MINOR * 100 + PATCH`
  - 1.0.0 → 10000
  - 1.0.1 → 10001
  - 1.1.0 → 10100
  - 2.0.0 → 20000

## Security Best Practices

### Keystore Security

1. **Never commit keystore to version control**
   ```bash
   echo "release.keystore" >> .gitignore
   echo "keystore.properties" >> .gitignore
   ```

2. **Use strong passwords** (at least 12 characters)

3. **Backup the keystore** in multiple secure locations

4. **Use different passwords** for keystore and key (optional but recommended)

5. **Consider using a hardware security module** for production

### Checksum Verification

Always verify the SHA-256 checksum after download:

```bash
# On Linux/Mac
sha256sum -c downloads/app-release.apk.sha256

# On Windows
certutil -hashfile downloads\app-release.apk SHA256
```

## Troubleshooting

### Build Fails with Signing Error

**Problem:** Gradle can't find the keystore

**Solution:** Make sure `keystore.properties` exists with correct paths:

```properties
KEYSTORE_FILE=../release.keystore
KEYSTORE_PASSWORD=your_password
KEY_ALIAS=shein_tracker
KEY_PASSWORD=your_password
```

### APK Won't Install

**Problem:** "App not installed" error

**Possible causes:**
1. Version code not higher than installed version
2. Signing key different from previous version
3. APK corrupted during download

**Solution:** Verify checksum and ensure version code is incremented

### Update Not Showing in App

**Problem:** App doesn't detect new version

**Solution:**
1. Verify `latest.json` is accessible via browser
2. Check that `versionCode` is higher than current
3. Verify SHA-256 checksum matches the APK
4. Check app logs for errors

## Files Generated

After running the build scripts, you'll have:

```
downloads/
├── app-release.apk          # Signed release APK
├── app-release.apk.sha256    # SHA-256 checksum
└── latest.json              # Version info for update check
```

## Next Steps

After completing Phase 5, proceed to **Phase 6: Play Store Assets** to prepare for publishing to the Google Play Store.
