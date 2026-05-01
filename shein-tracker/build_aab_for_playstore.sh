#!/bin/bash

# Build Android App Bundle (AAB) for Google Play Store
# This script builds the release AAB and copies it to the playstore directory

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
ANDROID_PROJECT_DIR="android-webview-prototype"
PLAYSTORE_DIR="playstore"
KEYSTORE_FILE="release.keystore"
KEY_ALIAS="shein_tracker"

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

# Check requirements
print_header "Checking Requirements"

if [ ! -d "$ANDROID_PROJECT_DIR" ]; then
    print_error "Android project not found: $ANDROID_PROJECT_DIR"
    exit 1
fi

if [ ! -f "$KEYSTORE_FILE" ]; then
    print_error "Keystore not found: $KEYSTORE_FILE"
    print_info "Run ./generate_keystore.sh first"
    exit 1
fi

print_success "All requirements met"

# Build AAB
print_header "Building Android App Bundle (AAB)"

cd "$ANDROID_PROJECT_DIR"

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
    read -s -p "Enter key password (same as keystore): " KEY_PASSWORD
    echo
    export KEY_PASSWORD
fi

print_info "Building release bundle..."
./gradlew bundleRelease

cd ..

print_success "AAB built successfully"

# Copy AAB to playstore directory
print_header "Copying AAB to Play Store Directory"

SOURCE_AAB="$ANDROID_PROJECT_DIR/app/build/outputs/bundle/release/app-release.aab"
DEST_AAB="$PLAYSTORE_DIR/app-release.aab"

if [ ! -f "$SOURCE_AAB" ]; then
    print_error "AAB not found: $SOURCE_AAB"
    exit 1
fi

mkdir -p "$PLAYSTORE_DIR"
cp "$SOURCE_AAB" "$DEST_AAB"

print_success "AAB copied to: $DEST_AAB"

# Display file info
print_header "Build Summary"

echo -e "AAB File: $DEST_AAB"
echo -e ""
ls -lh "$DEST_AAB"
echo -e ""
echo -e "${GREEN}Build completed successfully!${NC}"
echo -e ""
echo -e "Next steps:"
echo -e "1. Add app icons to $PLAYSTORE_DIR/icons/"
echo -e "2. Add graphics to $PLAYSTORE_DIR/graphics/"
echo -e "3. Add screenshots to $PLAYSTORE_DIR/graphics/"
echo -e "4. Review metadata in $PLAYSTORE_DIR/metadata/"
echo -e "5. Upload AAB to Google Play Console"

print_info "Completed at: $(date)"
