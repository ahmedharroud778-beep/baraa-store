# Play Store Assets

This directory contains all assets needed for publishing the Shein Tracker app to the Google Play Store.

## Directory Structure

```
playstore/
├── icons/              # App icons in various sizes
├── graphics/           # Feature graphics and promotional images
├── metadata/           # Store listing text and descriptions
├── app-release.aab     # Android App Bundle for Play Store
└── README.md           # This file
```

## Required Assets

### Icons
- **Launcher Icon**: 512x512 PNG (adaptive icon)
- **High-res Icon**: 1024x1024 PNG

### Graphics
- **Feature Graphic**: 1024x500 PNG
- **Promo Image**: 180x120 PNG

### Screenshots
- **Phone Screenshots**: 
  - Minimum 2 screenshots
  - Recommended: 4-8 screenshots
  - Size: 1080x1920 or 1080x2400 (portrait)
  - Format: PNG or JPG

### Metadata
- **Short Description**: 80 characters max
- **Full Description**: 4000 characters max
- **Title**: 30 characters max
- **Privacy Policy URL**: Required

## Building the AAB

To build the Android App Bundle for Play Store:

```bash
cd android-webview-prototype
./gradlew bundleRelease
```

Output: `app/build/outputs/bundle/release/app-release.aab`

Copy to playstore directory:
```bash
cp app/build/outputs/bundle/release/app-release.aab ../playstore/
```

## Uploading to Play Store

1. Go to [Google Play Console](https://play.google.com/console)
2. Create a new app or select existing app
3. Navigate to "Release" > "Production" or "Testing"
4. Click "Create new release"
5. Upload the AAB file
6. Add screenshots and graphics
7. Fill in store listing information
8. Review and publish

## Store Listing Information

See `metadata/` directory for:
- Short description
- Full description
- Privacy policy template
- Release notes

## Next Steps

1. Generate actual app icons using design tools
2. Create screenshots showing the app in use
3. Write compelling descriptions
4. Build and upload the AAB
5. Submit for review
