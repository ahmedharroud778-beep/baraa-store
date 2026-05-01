#!/bin/bash

# Calculate SHA-256 Checksum for APK
# This script calculates and displays the SHA-256 checksum of an APK file

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
APK_FILE="${1:-downloads/app-release.apk}"

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

print_header "SHA-256 Checksum Calculator"

# Check if file exists
if [ ! -f "$APK_FILE" ]; then
    print_error "APK file not found: $APK_FILE"
    print_info "Usage: $0 [path/to/apk]"
    exit 1
fi

print_info "Calculating SHA-256 for: $APK_FILE"

# Calculate checksum
if command -v sha256sum &> /dev/null; then
    CHECKSUM=$(sha256sum "$APK_FILE" | awk '{print $1}')
elif command -v shasum &> /dev/null; then
    CHECKSUM=$(shasum -a 256 "$APK_FILE" | awk '{print $1}')
else
    print_error "Neither sha256sum nor shasum found"
    exit 1
fi

print_success "SHA-256: $CHECKSUM"

# Save to file
CHECKSUM_FILE="${APK_FILE}.sha256"
echo "$CHECKSUM" > "$CHECKSUM_FILE"
print_success "Checksum saved to: $CHECKSUM_FILE"

# Display file info
print_info ""
print_info "File information:"
ls -lh "$APK_FILE"
