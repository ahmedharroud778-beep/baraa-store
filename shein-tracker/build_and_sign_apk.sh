#!/bin/bash

# Shein Tracker APK Build and Signing Script
# This script builds the release APK, signs it, and generates the latest.json

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ANDROID_PROJECT_DIR="android-webview-prototype"
DOWNLOADS_DIR="downloads"
KEYSTORE_FILE="release.keystore"
KEY_ALIAS="shein_tracker"
VERSION_NAME="1.0.0"
VERSION_CODE=1
APP_NAME="Shein Tracker"
DOWNLOAD_BASE_URL="https://your-domain.com/downloads"

# Helper functions
print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

print_step() {
    echo -e "${YELLOW}[STEP]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Check if required tools are available
check_requirements() {
    print_header "Checking Requirements"

    if ! command -v keytool &> /dev/null; then
        print_error "keytool not found. Please install JDK."
        exit 1
    fi

    if ! command -v sha256sum &> /dev/null && ! command -v shasum &> /dev/null; then
        print_error "sha256sum or shasum not found. Please install coreutils."
        exit 1
    fi

    if [ ! -d "$ANDROID_PROJECT_DIR" ]; then
        print_error "Android project directory not found: $ANDROID_PROJECT_DIR"
        exit 1
    fi

    print_success "All requirements met"
}

# Generate keystore if it doesn't exist
generate_keystore() {
    print_header "Generating Keystore"

    if [ -f "$KEYSTORE_FILE" ]; then
        print_info "Keystore already exists: $KEYSTORE_FILE"
        read -p "Do you want to generate a new keystore? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_info "Using existing keystore"
            return
        fi
        print_info "Backing up existing keystore..."
        mv "$KEYSTORE_FILE" "$KEYSTORE_FILE.backup.$(date +%s)"
    fi

    print_info "Generating new keystore..."
    print_info "Please provide the following information:"

    keytool -genkey -v \
        -keystore "$KEYSTORE_FILE" \
        -alias "$KEY_ALIAS" \
        -keyalg RSA \
        -keysize 2048 \
        -validity 10000 \
        -dname "CN=$APP_NAME, OU=Development, O=Shein Tracker, L=Tripoli, ST=Tripoli, C=LY"

    print_success "Keystore generated: $KEYSTORE_FILE"
    print_info "IMPORTANT: Keep this keystore file safe and secure!"
    print_info "You will need it for all future app updates."
}

# Build release APK
build_apk() {
    print_header "Building Release APK"

    cd "$ANDROID_PROJECT_DIR"

    # Check if gradlew exists
    if [ ! -f "./gradlew" ]; then
        print_error "gradlew not found. Please run: gradle wrapper"
        exit 1
    fi

    # Make gradlew executable
    chmod +x ./gradlew

    # Set environment variables for signing
    export KEYSTORE_FILE="../$KEYSTORE_FILE"
    export KEYSTORE_PASSWORD="$KEYSTORE_PASSWORD"
    export KEY_ALIAS="$KEY_ALIAS"
    export KEY_PASSWORD="$KEY_PASSWORD"

    # Prompt for keystore password if not set
    if [ -z "$KEYSTORE_PASSWORD" ]; then
        read -s -p "Enter keystore password: " KEYSTORE_PASSWORD
        echo
        export KEYSTORE_PASSWORD
    fi

    if [ -z "$KEY_PASSWORD" ]; then
        read -s -p "Enter key password (same as keystore password): " KEY_PASSWORD
        echo
        export KEY_PASSWORD
    fi

    print_info "Building release APK..."
    ./gradlew assembleRelease

    cd ..

    print_success "APK built successfully"
}

# Copy APK to downloads directory
copy_apk() {
    print_header "Copying APK to Downloads"

    SOURCE_APK="$ANDROID_PROJECT_DIR/app/build/outputs/apk/release/app-release.apk"
    DEST_APK="$DOWNLOADS_DIR/app-release.apk"

    if [ ! -f "$SOURCE_APK" ]; then
        print_error "APK not found: $SOURCE_APK"
        exit 1
    fi

    mkdir -p "$DOWNLOADS_DIR"
    cp "$SOURCE_APK" "$DEST_APK"

    print_success "APK copied to: $DEST_APK"
}

# Calculate SHA-256 checksum
calculate_checksum() {
    print_header "Calculating SHA-256 Checksum"

    APK_PATH="$DOWNLOADS_DIR/app-release.apk"

    if [ -f "$APK_PATH" ]; then
        if command -v sha256sum &> /dev/null; then
            CHECKSUM=$(sha256sum "$APK_PATH" | awk '{print $1}')
        else
            CHECKSUM=$(shasum -a 256 "$APK_PATH" | awk '{print $1}')
        fi

        print_success "SHA-256: $CHECKSUM"
        echo "$CHECKSUM" > "$DOWNLOADS_DIR/app-release.apk.sha256"
        print_success "Checksum saved to: $DOWNLOADS_DIR/app-release.apk.sha256"
    else
        print_error "APK not found: $APK_PATH"
        exit 1
    fi
}

# Generate latest.json
generate_latest_json() {
    print_header "Generating latest.json"

    JSON_FILE="$DOWNLOADS_DIR/latest.json"

    cat > "$JSON_FILE" <<EOF
{
  "versionName": "$VERSION_NAME",
  "versionCode": $VERSION_CODE,
  "downloadUrl": "$DOWNLOAD_BASE_URL/app-release.apk",
  "sha256": "$CHECKSUM",
  "releaseNotes": "Initial release of Shein Tracker app",
  "forceUpdate": false,
  "minSupportedVersion": 1
}
EOF

    print_success "latest.json generated: $JSON_FILE"
    print_info "Contents:"
    cat "$JSON_FILE"
}

# Display summary
display_summary() {
    print_header "Build Summary"

    echo -e "Version: $VERSION_NAME (code: $VERSION_CODE)"
    echo -e "APK: $DOWNLOADS_DIR/app-release.apk"
    echo -e "SHA-256: $CHECKSUM"
    echo -e "latest.json: $DOWNLOADS_DIR/latest.json"
    echo -e ""
    echo -e "${GREEN}Build completed successfully!${NC}"
    echo -e ""
    echo -e "Next steps:"
    echo -e "1. Upload the contents of $DOWNLOADS_DIR to your server"
    echo -e "2. Update DOWNLOAD_BASE_URL in this script to match your server"
    echo -e "3. Test the update check in the Android app"
}

# Main execution
main() {
    print_header "Shein Tracker APK Build and Signing"
    print_info "Started at: $(date)"

    check_requirements
    generate_keystore
    build_apk
    copy_apk
    calculate_checksum
    generate_latest_json
    display_summary

    print_info "Completed at: $(date)"
}

# Run main function
main
