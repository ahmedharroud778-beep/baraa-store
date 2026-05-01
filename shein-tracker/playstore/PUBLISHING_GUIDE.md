# Google Play Store Publishing Guide

This guide walks you through publishing the Shein Tracker app to the Google Play Store.

## Prerequisites

Before publishing, ensure you have:

- [ ] Google Play Developer account ($25 one-time fee)
- [ ] Signed AAB file (use `build_aab_for_playstore.sh`)
- [ ] App icons in required sizes
- [ ] Feature graphic (1024x500)
- [ ] At least 2 screenshots (1080x1920 or 1080x2400)
- [ ] Privacy policy URL
- [ ] App content rating completed

## Step 1: Prepare the AAB

Build the Android App Bundle:

```bash
./build_aab_for_playstore.sh
```

This will create `playstore/app-release.aab`

## Step 2: Create Google Play Developer Account

1. Go to [Google Play Console](https://play.google.com/console)
2. Sign in with your Google account
3. Pay the $25 registration fee
4. Complete your developer profile

## Step 3: Create a New App

1. In Play Console, click "Create app"
2. Enter app name: "Shein Tracker"
3. Select language: English
4. Select whether it's free or paid
5. Click "Create app"

## Step 4: Complete Store Listing

### Main Store Listing

Navigate to: **Store Listing** > **Main store listing**

#### App Details

- **App name**: Shein Tracker
- **Short description**: (80 chars max)
  ```
  Track and estimate Shein cart prices with delivery to Libyan cities.
  ```
- **Full description**: (4000 chars max)
  - Copy from `metadata/full_description.txt`

#### Graphic Assets

Upload the following:

| Asset | Size | Location |
|-------|------|----------|
| App icon | 512x512 | `icons/icon_512.png` |
| Feature graphic | 1024x500 | `graphics/feature.png` |
| Promo image | 180x120 | `graphics/promo.png` |
| Screenshots | 1080x1920 | `graphics/screenshot_*.png` |

**Screenshots Required:**
- Minimum: 2 screenshots
- Recommended: 4-8 screenshots

### Categorization

- **Category**: Shopping
- **Tags**: shopping, tracker, shein, libya, delivery

## Step 5: Content Rating

Navigate to: **Policy** > **Content rating questionnaire**

Complete the questionnaire based on your app's content. For Shein Tracker:

- Does your app contain user-generated content? No
- Does your app share or collect user-generated content? No
- Does your app allow users to find other users? No
- Does your app facilitate the purchase of physical goods? Yes
- Does your app contain or display ads? No
- Does your app contain or display sexual content? No
- Does your app contain or display violence? No
- Does your app contain or display hate speech? No
- Does your app contain or display other inappropriate content? No

## Step 6: Privacy Policy

Navigate to: **Policy** > **Privacy policy**

1. Host your privacy policy on your website
2. Use the template from `metadata/privacy_policy.txt`
3. Enter the URL in the Play Console

**Privacy Policy URL Example:**
```
https://your-domain.com/privacy-policy
```

## Step 7: Upload the AAB

Navigate to: **Release** > **Production** or **Internal Testing**

1. Click "Create new release"
2. Upload `playstore/app-release.aab`
3. Wait for processing
4. Review the release notes

## Step 8: Add Release Notes

Copy from `metadata/release_notes.txt`:

```
Version 1.0.0

Initial release of Shein Tracker!

Features:
- Price estimation for Shein carts
- Delivery to Libyan cities
- Order tracking with unique IDs
- Direct contact via WhatsApp and Messenger
- Offline support
- Secure token storage
- Automatic app updates
```

## Step 9: Review and Publish

1. Review all information
2. Check that all required fields are filled
3. Click "Save" and then "Start rollout to Production"
4. Wait for Google Play review (typically 1-3 days)

## Step 10: Post-Publishing

After your app is published:

1. Monitor user reviews and ratings
2. Respond to user feedback
3. Track crash reports and ANRs
4. Plan for future updates

## Store Listing Checklist

Use this checklist before submitting:

### Required
- [ ] App name (30 chars max)
- [ ] Short description (80 chars max)
- [ ] Full description (4000 chars max)
- [ ] App icon (512x512)
- [ ] Feature graphic (1024x500)
- [ ] At least 2 screenshots
- [ ] Privacy policy URL
- [ ] Content rating completed
- [ ] Signed AAB uploaded

### Recommended
- [ ] Promo image (180x120)
- [ ] 4-8 screenshots
- [ ] YouTube video link (optional)
- [ ] Contact email
- [ ] Support website

## Troubleshooting

### Rejection Reasons

Common rejection reasons and solutions:

1. **Missing Privacy Policy**
   - Solution: Host a privacy policy and add the URL

2. **Inappropriate Content**
   - Solution: Review your app content and screenshots

3. **Missing Permissions**
   - Solution: Document why each permission is needed

4. **Copyright Issues**
   - Solution: Ensure you have rights to all assets

### Build Issues

If the AAB build fails:

1. Check keystore configuration
2. Verify signing credentials
3. Ensure all dependencies are up to date
4. Check for ProGuard/R8 errors

## Updates and Maintenance

### Releasing Updates

1. Increment version code in `build.gradle.kts`
2. Build new AAB
3. Create new release in Play Console
4. Add release notes
5. Submit for review

### Version Code Format

Recommended format: `MAJOR * 10000 + MINOR * 100 + PATCH`

- 1.0.0 → 10000
- 1.0.1 → 10001
- 1.1.0 → 10100
- 2.0.0 → 20000

## Resources

- [Google Play Console](https://play.google.com/console)
- [Play Store Asset Specifications](https://developer.android.com/distribute/google-play/resources/icon-design-specifications)
- [Content Rating Guidelines](https://support.google.com/googleplay/android-developer/answer/188189)
- [Publishing Checklist](https://support.google.com/googleplay/android-developer/answer/113469)

## Support

For issues with publishing:
- Google Play Console Help Center
- Android Developer Community
- Contact Google Play Developer Support

---

Good luck with your app launch!
