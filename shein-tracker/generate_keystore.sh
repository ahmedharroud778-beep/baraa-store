#!/bin/bash

# Generate Android Keystore for Shein Tracker
# This script creates a new keystore for signing the release APK

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
KEYSTORE_FILE="release.keystore"
KEY_ALIAS="shein_tracker"
APP_NAME="Shein Tracker"
VALIDITY=10000  # 10,000 days (~27 years)

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

# Check if keytool is available
if ! command -v keytool &> /dev/null; then
    print_error "keytool not found. Please install JDK."
    exit 1
fi

print_header "Android Keystore Generator"

# Check if keystore already exists
if [ -f "$KEYSTORE_FILE" ]; then
    print_warning "Keystore already exists: $KEYSTORE_FILE"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Keeping existing keystore"
        exit 0
    fi
    print_info "Backing up existing keystore..."
    mv "$KEYSTORE_FILE" "$KEYSTORE_FILE.backup.$(date +%s)"
fi

print_info "Generating new keystore..."
print_info "Please provide the following information:"
print_info ""

# Prompt for keystore password
read -s -p "Enter keystore password (min 6 characters): " KEYSTORE_PASSWORD
echo
if [ ${#KEYSTORE_PASSWORD} -lt 6 ]; then
    print_error "Password must be at least 6 characters"
    exit 1
fi

read -s -p "Confirm keystore password: " KEYSTORE_PASSWORD_CONFIRM
echo
if [ "$KEYSTORE_PASSWORD" != "$KEYSTORE_PASSWORD_CONFIRM" ]; then
    print_error "Passwords do not match"
    exit 1
fi

# Prompt for key password
read -s -p "Enter key password (press Enter to use same as keystore): " KEY_PASSWORD
echo
if [ -z "$KEY_PASSWORD" ]; then
    KEY_PASSWORD="$KEYSTORE_PASSWORD"
fi

# Prompt for Distinguished Name
print_info ""
print_info "Distinguished Name (DN) information:"
read -p "First and Last Name (CN) [$APP_NAME]: " DN_CN
DN_CN=${DN_CN:-$APP_NAME}

read -p "Organizational Unit (OU) [Development]: " DN_OU
DN_OU=${DN_OU:-Development}

read -p "Organization (O) [Shein Tracker]: " DN_O
DN_O=${DN_O:-Shein Tracker}

read -p "City or Locality (L) [Tripoli]: " DN_L
DN_L=${DN_L:-Tripoli}

read -p "State or Province (ST) [Tripoli]: " DN_ST
DN_ST=${DN_ST:-Tripoli}

read -p "Country Code (C) [LY]: " DN_C
DN_C=${DN_C:-LY}

# Generate the keystore
print_info ""
print_info "Generating keystore..."

keytool -genkey -v \
    -keystore "$KEYSTORE_FILE" \
    -alias "$KEY_ALIAS" \
    -keyalg RSA \
    -keysize 2048 \
    -validity "$VALIDITY" \
    -storepass "$KEYSTORE_PASSWORD" \
    -keypass "$KEY_PASSWORD" \
    -dname "CN=$DN_CN, OU=$DN_OU, O=$DN_O, L=$DN_L, ST=$DN_ST, C=$DN_C"

if [ $? -eq 0 ]; then
    print_success "Keystore generated successfully: $KEYSTORE_FILE"
    print_info ""
    print_info "IMPORTANT SECURITY NOTES:"
    print_info "1. Keep this keystore file safe and secure!"
    print_info "2. You will need it for all future app updates."
    print_info "3. If you lose this keystore, you cannot update your app."
    print_info "4. Add $KEYSTORE_FILE to .gitignore"
    print_info ""
    print_info "To use this keystore with Gradle, create keystore.properties:"
    print_info "KEYSTORE_FILE=$KEYSTORE_FILE"
    print_info "KEYSTORE_PASSWORD=$KEYSTORE_PASSWORD"
    print_info "KEY_ALIAS=$KEY_ALIAS"
    print_info "KEY_PASSWORD=$KEY_PASSWORD"
else
    print_error "Failed to generate keystore"
    exit 1
fi
