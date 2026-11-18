# Android Build & Deployment Guide

This guide details how to build, test, and package the **Smart Finance Collection Android Application** for field deployment.

---

## 1. Prerequisites

* **Node.js**: v20 or v24
* **EAS CLI**:
  ```bash
  npm install -g eas-cli
  eas login
  ```
* **Android Studio & SDK**: (Only required if compiling natively on a local PC instead of Expo Cloud)
  * Android SDK Build-Tools 34.0.0+
  * Java Development Kit (JDK 17+)
  * `ANDROID_HOME` configured in environment variables.

---

## 2. Testing in Development

### Option A: Local Development Server
```bash
cd apps/mobile
npm install
npm run start
```
* Press `a` in the terminal to launch on a connected Android device or emulator.
* Scan the QR code using the Expo Go client (compatible for rapid UI & layout verification).

### Option B: Local Android Native Emulator Run
```bash
cd apps/mobile
npx expo run:android
```
This performs `expo prebuild`, configures the `android/` directory with `com.smartfinance.collection` bundle ID, and launches an Android emulator with full native SQLite binding.

---

## 3. Generating a Standalone Installable APK (Preview Profile)

For sideloading directly onto field collection agents' Android smartphones without publishing to Google Play:

### Cloud Build via Expo Application Services (EAS):
```bash
cd apps/mobile
eas build --profile preview --platform android
```
* **Configuration**: Defined in `apps/mobile/eas.json` under the `preview` profile with `"buildType": "apk"`.
* **Output**: EAS provides a public/internal download link for the `.apk` file upon build completion.
* **Installation**: Download the `.apk` directly on Android devices and allow "Install from Unknown Sources".

### Local Offline APK Compilation (via Gradle):
If you have Android Studio and Gradle installed locally:
```bash
cd apps/mobile
npx expo prebuild --platform android
cd android
./gradlew assembleRelease
```
* The generated release APK will be located at:
  `apps/mobile/android/app/build/outputs/apk/release/app-release.apk`

---

## 4. Production Google Play Store Build (.AAB)

When deploying to Google Play Store:
```bash
cd apps/mobile
eas build --profile production --platform android
```
* **Configuration**: Defined under `production` profile with `"buildType": "app-bundle"`.
* **Output**: Optimized `.aab` (Android App Bundle) with Google Play Dynamic Delivery and symbol mapping.

---

## 5. Security & Verification Checklist Before Release

1. **Verify No Sensitive Keys Embedded**: Ensure `SUPABASE_SERVICE_ROLE_KEY` is **never** included in `app.json` or client bundle. Only `EXPO_PUBLIC_SUPABASE_ANON_KEY` is permissible.
2. **Offline Outbox Persistence**: Verify that payments recorded with network disabled survive an app restart and dispatch automatically once network connectivity is resumed.
3. **Idempotency Guarantee**: Validate that duplicate retry events with identical UUIDv4 idempotency keys are acknowledged without duplicate ledger updates.

