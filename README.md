# Honglog

> **Digital Camera Report & Slate Log for Professional Film Production**  
> Aplikasi mobile resmi dari **Hong Films** (`hongfilms.com`) untuk iOS dan Android.

Honglog adalah aplikasi laporan kamera digital (*camera report*) dan pencatatan slate (*slate log*) yang dirancang khusus untuk kebutuhan kru kamera di lokasi syuting film: **1st AC, 2nd AC, Clapper Loader, DIT (Digital Intermediate Technician), Script Supervisor, dan Director of Photography (DP)**.

Aplikasi ini beroperasi secara **100% offline-first**, tahan banting di lokasi syuting terpencil tanpa sinyal internet, responsif dengan feedback haptik fisik, dan mengadopsi standar alur kerja industri perfilman internasional.

---

## 🎯 Filosofi Desain & Standar Industri (Anti-AI Slop)

Honglog dibangun dengan prinsip estetika industri perfilman profesional:
- **Bebas AI Slop**: Tidak ada emoji/emoticon dekoratif receh di antarmuka. Seluruh ikonografi menggunakan icon teknis ringkas dari `@expo/vector-icons/Feather`.
- **Identitas Visual Hong Films**: Aksen **Scarlet Red** (`#FF3838`) dipadukan dengan **Deep Black** (`#000000`) dan abu-abu slate industrial berdaya kontras tinggi untuk visibilitas maksimal di bawah terik matahari maupun kegelapan set syuting.
- **Standar Status Take Film**:
  * **PRINT**: Take lingkar terpilih untuk diedit (*Circle Take*).
  * **HOLD**: Take cadangan yang layak dipertahankan.
  * **NG (No Good)**: Take rusak/batal akibat masalah teknis, fokus meleset, atau kendala performa.
- **Logika Alur Slate Nyata**: Ketika sebuah take disimpan, nomor **Slate otomatis bertambah +1** dan nomor **Take otomatis kembali ke 1** untuk kesiapan clapper take berikutnya.

---

## ⚡ Fitur Utama

### 1. Kontrol Slate & Clapperboard Cepat
- **Stepper Haptik**: Tombol +/- intuitif untuk Slate, Scene, Shot, dan Take dengan getaran haptik native (`expo-haptics`).
- **Scene Suffix Sekali Sentuh**: Tombol cepat penambah suffix `+A`, `+B`, `+C`, `+D` untuk shot baru dalam scene yang sama, serta tombol reset suffix.
- **Metadata Lokasi & Pencahayaan (Clapper Standard)**:
  * **LOC**: `INT` (Interior) atau `EXT` (Exterior).
  * **LIGHT**: `DAY` (Siang) atau `NIGHT` (Malam).
- **Audio Sync Identifier**: Kolom input **Sound Roll** (misal `SR01`) untuk sinkronisasi audio post-production.
- **Penamaan Klip Otomatis (Auto Clip Naming)**: Format cerdas `<CARD>_<PADDED_3_DIGIT>` (misal `A001_001`, `B001_004`) yang otomatis beradaptasi saat roll media berpindah.

### 2. Multi-Kamera Independen Penuh
- Mendukung konfigurasi syuting **Single-Cam** maupun **Multi-Cam** (Kamera A, B, C, dst.).
- Setiap kamera memiliki parameter spesifikasi teknis mandiri:
  * **Roll / Media Card** (misal `A001` untuk Cam A, `B001` untuk Cam B)
  * **Lensa / Focal Length (mm)** (misal `35mm` di Cam A, `85mm` di Cam B)
  * **T-Stop / Bukaan Aperture**
  * **Shutter Angle / Speed**
  * **ISO / Exposure Index**
  * **Optical Filter / ND** (`Clear`, `ND.3`, `ND.6`, `ND.9`, `Diffusion`, dll.)
  * **Sensor Frame Rate (FPS)** (misal `24 FPS` untuk normal, `60 FPS` untuk slow-motion)

### 3. Log Takes & Modal Edit Adaptif
- **Daftar Log Harian**: Dikelompokkan rapi berdasarkan **Day Syuting**, dilengkapi counter jumlah take dan statistik *PRINT / HOLD / NG*.
- **Pencarian Cepat**: Filter pencarian real-time berdasarkan scene, shot, slate, nama klip, atau catatan.
- **Modal Edit Take Komprehensif**:
  * **Mode Multi-Cam**: Jika take memiliki lebih dari satu kamera, form single-cam dihilangkan secara otomatis. Pengguna disajikan kotak editor spesifik per-kamera tanpa ada input yang tertumpuk atau membingungkan.
  * **Mode Single-Cam**: Form fokus pada satu kamera dengan chip pilihan preset Roll dan Filter optik.
  * Mampu mengedit seluruh metadata: Slate, Scene, Shot, Take, Loc (INT/EXT), Light (DAY/NIGHT), Sound Roll, dan Remarks.

### 4. Manajemen Multi-Project Terpusat
- Mendukung banyak judul produksi film sekaligus.
- **Sinkronisasi Ganti Nama (Rename)**: Tombol *Ganti Nama* langsung di kartu project mengupdate nama secara serentak ke:
  * Header topbar aplikasi
  * Kartu daftar project aktif
  * Kolom judul produksi di form setup
  * Ringkasan ekspor
  * Dokumen resmi PDF dan CSV
- Konfigurasi kru lengkap: Sutradara, DoP, 1st AC, 2nd AC, aspect ratio, LUT preview, format file, dan FPS project.

### 5. Ekspor Dokumen Standar Industri
- **Laporan Kamera PDF (A4 Landscape)**:
  * Format template tabel formal standar industri pascaproduksi dan DIT lab.
  * **Urutan Kronologis Menaik (Ascending)**: Diurutkan secara pasti dari Slate 1 hingga slate terakhir (`Slate 1 -> Slate N`).
  * Kolom terpisah untuk **Loc** (`INT`/`EXT`) dan **Light** (`DAY`/`NIGHT`).
  * Spesifikasi kamera bertingkat untuk take multi-kamera.
  * Catatan bebas dari tag sintetis, hanya menampilkan catatan kru yang sebenarnya.
- **Ekspor CSV Fisik (Excel / Spreadsheet)**:
  * Menggunakan `expo-file-system/legacy` dan native share sheet (`expo-sharing`).
  * Header kolom lengkap: `Slate, Scene, Shot, Take, Location, Lighting, Status, Clip Name, Camera, Roll/Card, Lens, T-Stop, Shutter, ISO, Filter, FPS, Sound Roll, Notes, Timestamp, Date`.
  * Siap diimpor langsung ke software editing dan database post-production (DaVinci Resolve, Avid, Silverstack, Excel).

### 6. Tampilan & Pengalaman Pengguna (UX)
- **Tema Ganda (Dark / Light Mode)**: Toggle cepat di header atas dengan penyimpanan preferensi di storage lokal.
- **Bottom Navigation Rapat Bezel**: Menggunakan inset safe area dinamis dari `react-native-safe-area-context` agar navbar menempel presisi di bezel bawah tanpa ruang kosong mengambang.
- **Animated Splash Screen**: Transisi buka aplikasi bernuansa bioskop dengan logo Hong Films berlatar hitam dan efek fade-out halus.

---

## 🛠️ Tech Stack & Dependensi

| Layer | Teknologi / Library | Keterangan |
| :--- | :--- | :--- |
| **Framework** | [React Native](https://reactnative.dev/) & [Expo](https://expo.dev/) (SDK 52+) | Cross-platform iOS & Android |
| **Bahasa** | TypeScript | Strict type safety tanpa kompromi |
| **State Store** | [Zustand](https://github.com/pmndrs/zustand) | State reaktif offline-first |
| **Penyimpanan Lokal** | `@react-native-async-storage/async-storage` | Persistensi data lokal perangkat |
| **Haptics** | `expo-haptics` | Feedback getaran fisik tombol slate |
| **PDF Engine** | `expo-print` | Render HTML ke format file PDF A4 |
| **File Sharing** | `expo-sharing` & `expo-file-system/legacy` | AirDrop, WhatsApp, Files, Cloud |
| **Safe Area** | `react-native-safe-area-context` | Penyesuaian bezel layar iOS & Android |
| **Iconography** | `@expo/vector-icons/Feather` | Ikon industrial bersih non-slop |

---

## 📁 Struktur Direktori Proyek

```text
Honglog/
├── assets/                  # Logo Hong Films, icon, & splash asset
│   ├── logo.jpeg
│   ├── icon.png
│   └── adaptive-icon.png
├── src/
│   ├── types/
│   │   └── index.ts         # Definisi TypeScript (TakeEntry, Project, ThemeColors, dsb)
│   ├── store/
│   │   └── useHonglogStore.ts # Zustand Store (CRUD project, takes, multi-cam, theme)
│   ├── services/
│   │   └── pdfGenerator.ts  # Engine HTML-to-PDF Camera Report A4 Landscape
│   └── components/
│       ├── SlateControl.tsx # Kontrol stepper slate, INT/EXT, DAY/NIGHT, PRINT/HOLD/NG
│       ├── QuickPresets.tsx # Kontrol independen Roll, Lens, Shutter, ISO, ND per kamera
│       ├── TakesList.tsx    # Daftar riwayat takes, filter status, & Modal Edit Take
│       ├── ProjectSetup.tsx # Manajemen project, ganti nama, kru, & konfigurasi preset
│       └── ExportScreen.tsx # Engine ekspor PDF resmi & pembuatan file fisik CSV
├── App.tsx                  # Shell utama, splash screen animasi, tab navigation rapat bezel
├── app.json                 # Konfigurasi runtime Expo
├── package.json             # Manifest dependensi & script
└── tsconfig.json            # Konfigurasi TypeScript compiler
```

---

## 🚀 Panduan Memulai (Getting Started)

### Prasyarat
- [Node.js](https://nodejs.org/) (versi 18 ke atas)
- Ponsel pintar dengan aplikasi **Expo Go** terpasang dari App Store (iOS) atau Google Play Store (Android).

### 1. Kloning Repository
```bash
git clone https://github.com/HongFilm/honglog.git
cd honglog
```

### 2. Pasang Dependensi
```bash
npm install
```

### 3. Jalankan Development Server
```bash
npx expo start
```

### 4. Buka di Perangkat Fisik
- **iOS**: Buka aplikasi Kamera bawaan iPhone, arahkan ke QR code terminal, lalu ketuk untuk membuka di **Expo Go**.
- **Android**: Buka aplikasi **Expo Go**, pilih *Scan QR Code*, lalu pindai kode di terminal.

### 5. Verifikasi Type Checking
Untuk memastikan tidak ada kesalahan tipe pada codebase:
```bash
npx tsc --noEmit
```

---

## 🎬 Alur Kerja Standar di Set Syuting (Field Workflow)

1. **Setup Awal Hari**:
   - Buka tab **SETUP**, masukkan judul film, nama Sutradara, DoP, dan nomor hari syuting (`DAY 1`).
   - Atur kamera yang digunakan (misal `A, B`) beserta nomor media card awal (`A001, B001`).
2. **Pengecekan Lensa & Exposure**:
   - Buka tab **PRESETS**, pilih sub-tab kamera (Cam A / Cam B).
   - Tentukan Lensa (mm), Shutter, ISO, Optical Filter, dan FPS yang sedang terpasang di kamera bersangkutan.
3. **Pencatatan Slate Saat Action**:
   - Buka tab **SLATE**.
   - Tentukan status lokasi (`INT`/`EXT`) dan waktu (`DAY`/`NIGHT`).
   - Masukkan nomor Scene, Shot, dan Take (gunakan tombol `+A`, `+B` jika ada sub-shot).
   - Masukkan ID Sound Roll audio recording.
4. **Evaluasi Sutradara / DP**:
   - Pilih status take: **PRINT** (take terpilih), **HOLD** (cadangan), atau **NG** (rusak).
   - Tambahkan catatan singkat jika perlu (*misal: "fokus meleset di ujung", "acting terbaik"*).
   - Tekan **SIMPAN TAKE**. Nomor Slate otomatis naik +1 dan Take kembali ke 1.
5. **Koreksi Data (Bila Ada)**:
   - Buka tab **TAKES**, ketuk ikon pensil pada kartu take terkait untuk mengedit data take. Pada mode multi-kamera, sesuaikan spesifikasi tiap kamera secara mandiri.
6. **Wrap Day & Distribusi**:
   - Buka tab **EXPORT**.
   - Tekan **BAGIKAN PDF REPORT** untuk mengirim lembar laporan A4 terurut ascending langsung via AirDrop ke DIT, Asisten Editor, atau Sutradara.
   - Tekan **EKSPOR CSV** untuk file mentah spreadsheet ke tim post-production.

---

## 🔒 Privasi & Keamanan Data
- Seluruh data syuting disimpan secara eksklusif di memori lokal perangkat (*Local AsyncStorage*).
- Tidak ada data audio, metadata video, maupun informasi film yang dikirim ke server pihak ketiga manapun tanpa persetujuan operator.

---

## 📄 Hak Cipta & Lisensi
Hak Cipta &copy; 2026 **Hong Films** (`hongfilms.com`). Seluruh hak cipta dilindungi undang-undang.  
Didesain dan dikembangkan secara mandiri untuk standar produksi perfilman Hong Films.
