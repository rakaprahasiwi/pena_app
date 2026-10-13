# PENA - Aplikasi Inventarisasi ATK Kejaksaan Negeri

Aplikasi Sistem Informasi & Inventarisasi ATK (Alat Tulis Kantor) berbasis **Next.js Full Stack** (Frontend & Backend terintegrasi).

---

## 🚀 Fitur Utama

- **Kiosk Pengambilan ATK Mandiri:** Pengambilan ATK dilengkapi pengambilan foto bukti kamera secara otomatis.
- **Dashboard Admin:**
  - Manajemen Master Barang ATK (Tambah, Edit, Hapus, Filter Kategori).
  - Pencatatan Barang Masuk & Keluar.
  - Peringatan Stok Minimum dengan notifikasi suara bel.
  - Laporan Mutasi Bulanan & Ekspor ke Excel (`xlsx`) dan Cetak Dokumen Resmi.
  - Manajemen Pengguna Admin & Superadmin.
  - Pengaturan Identitas Satuan Kerja (Satker) Kejaksaan.
- **Full Stack Next.js:** Backend API Route Handlers dan Frontend React tergabung dalam satu aplikasi tanpa perlu menjalankan server terpisah.

---

## 📁 Struktur Full Stack

```
pena_app/
├── public/                 # File statis (logo, gambar, icon)
│   └── logo.png
├── src/
│   ├── app/                # Next.js App Router (Frontend & Backend)
│   │   ├── api/            # Backend API Endpoints (Migrasi dari server.js)
│   │   │   ├── items/      # /api/items (GET, POST, DELETE)
│   │   │   ├── masuk/      # /api/masuk (GET, POST)
│   │   │   ├── keluar/     # /api/keluar (GET, POST)
│   │   │   ├── satker/     # /api/satker (GET, POST)
│   │   │   ├── login/      # /api/login (POST)
│   │   │   └── admins/     # /api/admins (GET, POST, PUT, DELETE)
│   │   ├── globals.css     # Styling Tailwind CSS
│   │   ├── layout.tsx      # Root HTML Layout & Metadata
│   │   └── page.tsx        # Halaman Utama Kiosk & Dashboard
│   ├── components/         # Komponen UI React (Kiosk, Dashboard, Modal, dll.)
│   ├── lib/
│   │   └── db.ts           # Koneksi Pool MySQL Terpusat
│   ├── utils/              # Helper audio, export Excel, format tanggal
│   └── types.ts            # Definisi tipe TypeScript
├── server.js               # File server Express lama (disimpan sebagai referensi)
├── .env.local              # Konfigurasi database MySQL lokal
└── package.json
```

---

## 🛠️ Persiapan & Instalasi

### 1. Database MySQL
Pastikan MySQL (misal melalui XAMPP / MariaDB / Laragon) telah aktif dan database `pena_db` sudah dibuat:

```sql
CREATE DATABASE IF NOT EXISTS pena_db;
```

### 2. Konfigurasi Environment (`.env.local`)
Sesuaikan konfigurasi database jika diperlukan pada `.env.local`:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=pena_db
DB_PORT=3306
```

### 3. Jalankan Aplikasi
Jalankan server Next.js (frontend dan backend berjalan bersamaan di port 3000):

```bash
# Mode Development
npm run dev

# Atau Mode Production Build
npm run build
npm run start
```

Buka browser di: [http://localhost:3000](http://localhost:3000)
