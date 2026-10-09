# Honglog

> **Digital Camera Report & Slate Log for Professional Film Production**  
> Aplikasi mobile resmi dari **Hong Films** (`hongfilms.com`) untuk iOS dan Android.

Honglog adalah aplikasi laporan kamera digital (*camera report*) dan pencatatan slate (*slate log*) yang dirancang khusus untuk kebutuhan kru kamera di lokasi syuting film: **1st AC, 2nd AC, Clapper Loader, DIT (Digital Intermediate Technician), Script Supervisor, dan Director of Photography (DP)**.

Aplikasi ini beroperasi secara **100% offline-first**, tahan banting di lokasi syuting terpencil tanpa sinyal internet, responsif dengan feedback haptik fisik, dan mengadopsi standar alur kerja industri perfilman internasional.

---

## 🎯 Filosofi Desain & Standar Industri (Anti-AI Slop)

Honglog dibangun dengan prinsip estetika industri perfilman profesional yang selaras dengan identitas web [Hong Films](https://hongfilms.com):
- **Bebas AI Slop**: Tidak ada emoji/emoticon dekoratif receh di antarmuka. Seluruh ikonografi menggunakan icon teknis ringkas dari `@expo/vector-icons/Feather`.
- **Identitas Visual Hong Films**:
  * **Background Utama**: Obsidian `#0E0E12` (gelap pekat standar ruang monitor set).
  * **Surface / Container**: Deep Charcoal `#14151B` dan `#1C1D24`.
  * **Border & Dividers**: Slate Muted `#2C2C36` dan `#3D3D49`.
  * **Aksen Utama**: Scarlet REC `#E53935`.
  * **Status PRINT / Good Take**: Emerald Film `#00BB7F`.
  * **Tipografi**: `DM Sans` & `DM Mono` (industrial readability).
- **Standar Status Take Film**:
  * **PRINT**: Take lingkar terpilih untuk diedit (*Circle Take*).
  * **HOLD**: Take cadangan yang layak dipertahankan.
  * **NG (No Good)**: Take rusak/batal akibat masalah teknis, fokus meleset, atau kendala performa.
- **Logika Alur Slate Nyata**: Ketika sebuah take disimpan, nomor **Slate otomatis bertambah +1** dan nomor **Take otomatis kembali ke 1** untuk kesiapan clapper take berikutnya.

---

## ⚡ Fitur Utama

### 1. Kontrol Slate & Clapperboard Cepat
- **Stepper Haptik**: Tombol +/- intuitif untuk Slate, Scene, Shot, dan Take dengan getaran haptik native (`expo-haptics`).
- **Scene Suffix Sekali Sentuh**: Tombol shortcut `+A`, `+B`, `+C`, `+D` untuk shot baru dalam scene yang sama.
- **Metadata Lokasi & Pencahayaan (Clapper Standard)**:
  * **LOC**: `INT` (Interior) atau `EXT` (Exterior).
  * **LIGHT**: `DAY` (Siang) atau `NIGHT` (Malam).
- **Penamaan Klip Otomatis (Auto Clip Naming)**: Format cerdas `<CARD>_<PADDED_3_DIGIT>` (misal `A001_001`, `B001_004`) yang otomatis sinkron saat roll media berpindah.

### 2. Multi-Kamera Independen Penuh
- Mendukung konfigurasi syuting **Single-Cam** maupun **Multi-Cam** (Kamera A, B, C, dst.).
- Setiap kamera memiliki parameter spesifikasi teknis mandiri:
  * **Roll / Media Card** (misal `A001` untuk Cam A, `B001` untuk Cam B)
  * **Lensa / Focal Length (mm)** (misal `35mm` di Cam A, `85mm` di Cam B)
  * **T-Stop / Bukaan Aperture** (misal `T2.8`)
  * **Shutter Angle / Speed** (misal `180°`, `1/50`)
  * **ISO / Exposure Index** (misal `800`, `3200`)
  * **Optical Filter / ND** (`Clear`, `ND.3`, `ND.6`, `ND.9`, `Diffusion`, dll.)
  * **Sensor Frame Rate (FPS)** (misal `24 FPS`, `60 FPS`)

### 3. Log Takes & Modal Edit Adaptif (Dropdown 1-Tap)
- **Daftar Log Harian**: Dikelompokkan rapi berdasarkan **Day Syuting**, dilengkapi counter jumlah take dan statistik *PRINT / HOLD / NG*.
- **Pencarian Cepat**: Filter pencarian real-time berdasarkan scene, shot, slate, nama klip, atau catatan.
- **Modal Edit Take Komprehensif Tanpa Ketik Manual**:
  * Seluruh spesifikasi kamera dipilih menggunakan **Sheet Dropdown 1-Tap** (Lensa, T-Stop, Shutter, ISO, FPS, Filter ND, Roll Card, Kamera).
  * **Mode Multi-Cam**: Form single-cam dihilangkan secara otomatis. Kotak spesifikasi tiap kamera tampil mandiri tanpa input yang tumpang-tindih.
  * Mampu mengedit seluruh metadata take: Slate, Day, Scene, Shot, Take, Loc (INT/EXT), Light (DAY/NIGHT), dan Catatan/Remarks.

### 4. Manajemen Multi-Project Terpusat
- Mendukung banyak judul produksi film sekaligus.
- **Sinkronisasi Ganti Nama (Rename)**: Tombol *Ganti Nama* langsung di kartu project mengupdate nama secara serentak ke topbar header, kartu project, ringkasan ekspor, lembar PDF, dan CSV.
- Konfigurasi kru lengkap: Sutradara, DoP, 1st AC, 2nd AC, aspect ratio, LUT preview, format file, dan FPS project.

### 5. Ekspor Dokumen Standar Industri
- **Laporan Kamera PDF (A4 Landscape)**:
  * Format template tabel formal standar industri pascaproduksi dan DIT lab.
  * **Urutan Kronologis Menaik (Ascending)**: Diurutkan pasti dari Slate 1 hingga slate terakhir (`Slate 1 -> Slate N`).
  * Kolom terpisah untuk **Loc** (`INT`/`EXT`) dan **Light** (`DAY`/`NIGHT`).
  * Spesifikasi kamera bertingkat untuk take multi-kamera.
  * Catatan bebas dari tag sintetis, hanya menampilkan catatan kru yang sebenarnya.
- **Ekspor CSV Fisik (Excel / Spreadsheet)**:
  * Menggunakan `expo-file-system/legacy` dan native share sheet (`expo-sharing`).
  * Header kolom lengkap: `Slate, Scene, Shot, Take, Location, Lighting, Status, Clip Name, Camera, Roll/Card, Lens, T-Stop, Shutter, ISO, Filter, FPS, Notes, Timestamp, Date`.
  * Siap diimpor langsung ke software editing dan database post-production (DaVinci Resolve, Avid, Silverstack, Excel).

### 6. Tampilan & Pengalaman Pengguna (UX)
- **Animasi Navigasi Halus**: Transisi slide horizontal dan cross-fade antar tab dashboard yang mulus dengan directional feedback haptik.
- **Tema Ganda (Dark / Light Mode)**: Toggle cepat di header atas dengan penyimpanan preferensi di storage lokal.
- **Bottom Navigation Rapat Bezel**: Menggunakan inset safe area dinamis dari `react-native-safe-area-context` agar navbar menempel presisi di bezel bawah tanpa celah mengambang.
- **Animated Splash Screen**: Transisi buka aplikasi bernuansa bioskop dengan logo Hong Films berlatar hitam dan efek fade-out halus.

---

## 🛠️ Tech Stack & Dependensi

| Layer | Teknologi / Library | Keterangan |
| :--- | :--- | :--- |
| **Framework** | [React Native](https://reactnative.dev/) & [Expo](https://expo.dev/) (SDK 57) | Cross-platform iOS & Android |
| **Bahasa** | TypeScript (Strict Mode) | Type safety penuh tanpa `any` liar |
| **State Store** | [Zustand](https://github.com/pmndrs/zustand) | State management reaktif offline-first |
| **Penyimpanan Lokal** | `@react-native-async-storage/async-storage` | Persistensi data lokal perangkat |
| **Haptics** | `expo-haptics` | Feedback getaran fisik tombol slate |
| **PDF Engine** | `expo-print` | Render HTML ke format file PDF A4 |
| **File Sharing** | `expo-sharing` & `expo-file-system/legacy` | AirDrop, WhatsApp, Files, Cloud |
| **Safe Area** | `react-native-safe-area-context` | Penyesuaian bezel layar iOS & Android |
| **Iconography** | `@expo/vector-icons/Feather` | Ikon industrial bersih non-slop |
| **Native iOS** | Swift & Xcode Workspace (`ios/Honglog.xcworkspace`) | Mendukung arsitektur AppDelegate & SceneDelegate iOS 27+ |

---

## 📁 Struktur Direktori Proyek

```text
Honglog/
├── assets/                       # Aset visual & icon resmi Hong Films
│   ├── logo.jpeg                 # Logo clapper Honglog
│   ├── icon.png                  # Master icon 1024x1024
│   ├── splash-icon.png           # Icon splash screen
│   └── android-icon-foreground.png
├── ios/                          # Project native iOS (Xcode)
│   ├── Honglog.xcworkspace       # Workspace Xcode utama (buka ini di Mac)
│   ├── Honglog.xcodeproj         # Project Xcode
│   ├── Honglog/
│   │   ├── AppDelegate.swift     # Entry point native iOS (Dual lifecycle support)
│   │   ├── Info.plist            # Metadata iOS & scene manifest
│   │   └── Images.xcassets/      # AppIcon & visual native assets
│   └── Podfile                   # CocoaPods dependency spec
├── src/
│   ├── types/
│   │   └── index.ts              # Definisi TypeScript (TakeEntry, Project, ThemeColors, dsb)
│   ├── store/
│   │   └── useHonglogStore.ts    # Zustand Store (CRUD project, takes, multi-cam, theme)
│   ├── services/
│   │   └── pdfGenerator.ts       # Engine HTML-to-PDF Camera Report A4 Landscape
│   └── components/
│       ├── SlateControl.tsx      # Kontrol stepper slate, INT/EXT, DAY/NIGHT, PRINT/HOLD/NG
│       ├── QuickPresets.tsx      # Kontrol independen Roll, Lens, Shutter, ISO, ND per kamera
│       ├── TakesList.tsx         # Daftar riwayat takes, filter status, & Modal Edit Take
│       ├── ProjectSetup.tsx      # Manajemen project, ganti nama, kru, & konfigurasi preset
│       └── ExportScreen.tsx      # Engine ekspor PDF resmi & pembuatan file fisik CSV
├── App.tsx                       # Shell utama, splash screen animasi, tab navigation rapat bezel
├── app.json                      # Konfigurasi runtime Expo & EAS
├── eas.json                      # Konfigurasi build cloud EAS (APK Android & IPA iOS)
├── package.json                  # Manifest dependensi & script npm
└── tsconfig.json                 # Konfigurasi TypeScript compiler
```

---

## 💻 Panduan Developer: Cara Oprek & Menjalankan Proyek

Panduan ini dibuat agar siapapun (kamu atau rekan tim) bisa langsung mengkloning dan memodifikasi proyek ini tanpa bingung.

### 1. Prasyarat Environment
- [Node.js](https://nodejs.org/) v18+ (disarankan v20 LTS)
- npm / yarn
- **Untuk iOS**: macOS dengan Xcode terpasang (jika ingin build ke iPhone fisik atau iOS Simulator) serta CocoaPods (`sudo gem install cocoapods` atau `brew install cocoapods`).
- **Untuk Android**: Android Studio (jika ingin menjalankan Android Emulator lokal).

### 2. Kloning & Install Dependensi
```bash
git clone https://github.com/HongFilm/honglog.git
cd honglog
npm install
```

### 3. Menjalankan di Expo Go (Paling Cepat & Ringan)
Untuk preview cepat langsung di iPhone atau HP Android tanpa perlu compile native:
```bash
npx expo start
```
- Buka aplikasi **Expo Go** di HP kamu, lalu scan QR Code yang muncul di terminal.

### 4. Menjalankan di iOS Simulator (Mac)
```bash
npx expo run:ios
```
*Atau langsung buka lewat Xcode:*
```bash
cd ios && pod install
open Honglog.xcworkspace
```
Di Xcode, pilih target simulator (misal: *iPhone 16 Pro* / *iPhone 17*), lalu tekan tombol **Play ▶ (Run)**.

### 5. Menjalankan di Android Emulator / Device
```bash
npx expo run:android
```

### 6. Memeriksa Type Safety (TypeScript)
Sebelum melakukan commit perubahan kode, pastikan tidak ada type error:
```bash
npx tsc --noEmit
```

---

## 📦 Panduan Build Standalone (APK & IPA)

### 🤖 Build Android (.apk)
Proyek ini sudah dikonfigurasi dengan EAS profile `preview` yang menghasilkan file `.apk` mandiri (bisa langsung di-install di HP Android manapun tanpa perlu Expo Go):
```bash
npx eas-cli build -p android --profile preview
```
Link download APK akan muncul di terminal begitu build selesai.

### 🍎 Build iOS (.ipa Standalone)
Untuk mengemas file `.ipa` secara offline di Mac:
1. Buka Xcode:
   ```bash
   open ios/Honglog.xcworkspace
   ```
2. Di bar atas Xcode, pilih target perangkat: **Any iOS Device (arm64)**.
3. Di menu bar Mac, klik **Product > Archive**.
4. Begitu selesai (*Archive Succeeded*), buka Terminal dan jalankan perintah satu baris ini:
   ```bash
   LATEST_ARCHIVE=$(ls -td ~/Library/Developer/Xcode/Archives/*/*.xcarchive | head -1)
   mkdir -p /tmp/FreshIPA/Payload
   cp -r "$LATEST_ARCHIVE/Products/Applications/Honglog.app" /tmp/FreshIPA/Payload/
   rm -f /tmp/FreshIPA/Payload/Honglog.app/embedded.mobileprovision
   find /tmp/FreshIPA/Payload/Honglog.app -name "_CodeSignature" -exec rm -rf {} +
   cd /tmp/FreshIPA && zip -qr ~/Desktop/Honglog.ipa Payload && rm -rf /tmp/FreshIPA
   echo "Selesai! File Honglog.ipa siap di Desktop kamu!"
   ```
5. File `Honglog.ipa` bersih (unsigned) siap dibagikan ke teman untuk di-install via **Sideloadly** menggunakan Apple ID masing-masing.

---

## 🧩 Arsitektur Kode & Tips Memodifikasi (Hacking Guide)

Jika kamu atau temanmu ingin menambah fitur baru, berikut titik masuk yang paling sering dioprek:

1. **Menambah / Mengubah Data Take (`src/types/index.ts`)**:
   - Struktur data take ada di interface `TakeEntry`.
   - Data kamera spesifik multi-cam ada di interface `CameraTakeItem`.
2. **State Management (`src/store/useHonglogStore.ts`)**:
   - Menggunakan **Zustand** dengan key storage `@honglog_projects_v2` dan `@honglog_active_project_id`.
   - Logika auto-increment slate & take reset ada di fungsi `saveTake()`.
   - Logika auto clip naming ada di fungsi `getNextClipName()`.
   - Logika sinkronisasi ganti nama project ada di fungsi `renameProject()`.
3. **Template PDF Camera Report (`src/services/pdfGenerator.ts`)**:
   - Template A4 landscape dibangun menggunakan HTML/CSS inline yang dikonversi ke PDF oleh `expo-print`.
   - Pengurutan data wajib ascending: `[...takes].sort((a, b) => a.slate !== b.slate ? a.slate - b.slate : a.take - b.take)`.
4. **Modal Edit Take (`src/components/TakesList.tsx`)**:
   - Menggunakan sistem modal overlay internal (`pickerOverlay`) agar tidak bertabrakan dengan batasan modal bersarang di iOS.
   - Preset opsi lensa, bukaan T-stop, shutter, ISO, dan filter optik bisa disesuaikan di variabel `standardTstops`, `lensOptions`, dsb.

---

## 🔒 Privasi & Keamanan Data
- Seluruh data syuting disimpan secara eksklusif di memori lokal perangkat (*Local AsyncStorage*).
- Tidak ada data video, audio, maupun informasi film yang dikirim ke server pihak ketiga manapun tanpa persetujuan operator.

---

## 📄 Hak Cipta & Lisensi
Hak Cipta &copy; 2026 **Hong Films** (`hongfilms.com`). Seluruh hak cipta dilindungi undang-undang.  
Didesain dan dikembangkan secara mandiri untuk standar produksi perfilman Hong Films.
