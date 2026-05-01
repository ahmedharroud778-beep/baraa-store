#!/bin/bash

# Generate latest.json for App Updates
# This script creates the latest.json file that the Android app checks for updates

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
DOWNLOADS_DIR="downloads"
JSON_FILE="$DOWNLOADS_DIR/latest.json"
VERSION_NAME="${1:-1.0.0}"
VERSION_CODE="${2:-1}"
DOWNLOAD_BASE_URL="${3:-https://your-domain.com/downloads}"
RELEASE_NOTES="${4:-Initial release of Shein Tracker app}"
FORCE_UPDATE="${5:-false}"
MIN_SUPPORTED_VERSION="${6:-1}"

print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_header "latest.json Generator"

# Check if APK exists
APK_FILE="$DOWNLOADS_DIR/app-release.apk"
if [ ! -f "$APK_FILE" ]; then
    print_warning "APK not found: $APK_FILE"
    print_info "The download URL will still be generated, but make sure the APK exists"
fi

# Get SHA-256 checksum if APK exists
CHECKSUM=""
if [ -f "$APK_FILE" ]; then
    if [ -f "$APK_FILE.sha256" ]; then
        CHECKSUM=$(cat "$APK_FILE.sha256")
    else
        if command -v sha256sum &> /dev/null; then
            CHECKSUM=$(sha256sum "$APK_FILE" | awk '{print $1}')
        elif command -v shasum &> /dev/null; then
            CHECKSUM=$(shasum -a 256 "$APK_FILE" | awk '{print $1}')
        fi
    fi
fi

if [ -z "$CHECKSUM" ]; then
    print_warning "Could not determine SHA-256 checksum"
    print_info "You'll need to update the sha256 field manually"
    CHECKSUM="PLACEHOLDER_SHA256_HERE"
fi

# Create downloads directory
mkdir -p "$DOWNLOADS_DIR"

# Generate JSON
cat > "$JSON_FILE" <<EOF
{
  "versionName": "$VERSION_NAME",
  "versionCode": $VERSION_CODE,
  "downloadUrl": "$DOWNLOAD_BASE_URL/app-release.apk",
  "sha256": "$CHECKSUM",
  "releaseNotes": "$RELEASE_NOTES",
  "forceUpdate": $FORCE_UPDATE,
  "minSupportedVersion": $MIN_SUPPORTED_VERSION
}
EOF

print_success "latest.json generated: $JSON_FILE"
print_info ""
print_info "Configuration:"
print_info "  Version Name: $VERSION_NAME"
print_info "  Version Code: $VERSION_CODE"
print_info "  Download URL: $DOWNLOAD_BASE_URL/app-release.apk"
print_info "  SHA-256: $CHECKSUM"
print_info "  Release Notes: $RELEASE_NOTES"
print_info "  Force Update: $FORCE_UPDATE"
print_info "  Min Supported Version: $MIN_SUPPORTED_VERSION"
print_info ""
print_info "Contents:"
cat "$JSON_FILE"
print_info ""
print_info "Usage:"
print_info "  $0 [version_name] [version_code] [download_base_url] [release_notes] [force_update] [min_supported_version]"
print_info ""
print_info "Example:"
print_info "  $0 \"1.0.1\" 2 \"https://example.com/downloads\" \"Bug fixes\" false 1"
