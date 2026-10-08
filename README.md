# 🎬 Honglog

> **Digital Camera Report & Slate Log for Film Production**  
> An official Hong Films mobile platform application. Built for iOS and Android.

Honglog is a tactile, offline-first digital camera report and slate logging app built specifically for film sets, camera crews (1st AC, 2nd AC, Clapper, Loader, DIT, and DOP).

---

## ⚡ Features

- **Tactile Slate Steppers:** Quick +/- stepper for Slate, Scene, Shot, and Take with native haptic vibration feedback.
- **Scene Suffixes:** Instant +A, +B, +C, +D chips and quick suffix clear.
- **Good Take Tracking (⭐):** One-tap Good Take toggle with distinct emerald visual glow and report highlighting.
- **Quick Camera Presets:** Pre-configured and customizable presets for Cameras, Media Cards/Rolls, Lenses (mm), Shutter Speeds, ISOs, and ND Filters.
- **Offline-First Resilience:** Works 100% offline in remote locations or sound stages with local persistence via AsyncStorage.
- **Industry Standard PDF Camera Reports:** Generates professional A4 landscape camera reports matching industry post-production and DIT delivery standards.
- **Native Sharing:** One-tap export directly via AirDrop, WhatsApp, Google Drive, or Save to Files.
- **CSV / Spreadsheet Export:** Raw data export for editorial and post-production logging.

---

## 🛠️ Tech Stack

- **Framework:** [React Native](https://reactnative.dev/) + [Expo](https://expo.dev/) (SDK 57)
- **Language:** TypeScript
- **State Management:** [Zustand](https://github.com/pmndrs/zustand)
- **Local Storage:** `@react-native-async-storage/async-storage`
- **Native Haptics:** `expo-haptics`
- **Document & PDF Engine:** `expo-print` + `expo-sharing`

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npx expo start
```

### 3. Run on Mobile Device
- **iOS:** Open Camera app and scan the QR code to open in **Expo Go**.
- **Android:** Open the **Expo Go** app and scan the QR code.
- **Simulator:** Press `i` for iOS Simulator or `a` for Android Emulator.

---

## 📁 Project Structure

```text
honglog/
├── legacy/                  # Original prototype reference (ShinoLog.html)
├── src/
│   ├── types/               # TypeScript interfaces (TakeEntry, ProductionMeta)
│   ├── store/               # Zustand persistent store (useHonglogStore)
│   ├── services/            # PDF Camera Report generator & share service
│   └── components/
│       ├── SlateControl.tsx # Steppers, slate controls & Good Take toggle
│       ├── QuickPresets.tsx # Preset selectors for Lens, ISO, Shutter, ND
│       ├── TakesList.tsx    # Takes log list, search, and statistics
│       ├── ProjectSetup.tsx # Production info & camera configuration
│       └── ExportScreen.tsx # Camera report PDF generator & CSV export
├── App.tsx                  # Main tabbed mobile application
├── app.json                 # Expo configuration & theme
└── package.json
```

---

&copy; 2026 **Hong Films** (hongfilms.com). All rights reserved.
