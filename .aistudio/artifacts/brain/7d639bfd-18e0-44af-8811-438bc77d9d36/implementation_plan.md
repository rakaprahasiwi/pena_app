# Sistem Informasi Manajemen ATK Kejaksaan Negeri (SIM-ATK Adhyaksa)

Sistem inventaris dan pencatatan keluar-masuk Alat Tulis Kantor (ATK) berbasis web yang dirancang khusus untuk satuan kerja Kejaksaan Negeri (Kejari), menghadirkan portal mandiri tanpa login bagi pegawai dengan verifikasi foto webcam/unggah berkas, dashboard admin terproteksi, sistem peringatan dini stok minimum audio-visual, serta generator laporan mutasi bulanan yang dapat diekspor ke Excel (.xlsx) dan dicetak format PDF resmi ber-kop dinas Kejaksaan RI.

## User Review & Critical Decisions

> [!IMPORTANT]
> Berdasarkan jawaban klarifikasi yang telah Anda berikan:
> - **Identitas Satuan Kerja**: Kejaksaan Negeri (Kejari), dilengkapi opsi kustomisasi nama Kejari kabupaten/kota dan pejabat penandatangan di menu Pengaturan.
> - **Verifikasi Pengambil ATK**: Terintegrasi kamera langsung (live webcam snapshot) dengan opsi alternatif unggah berkas foto dari perangkat.
> - **Notifikasi Stok Menipis**: Pop-up alert interaktif, bunyi lonceng peringatan (audio bell synthesizer), dan kartu banner prioritas di dashboard admin.
> - **Format Laporan Bulanan**: Ekspor spreadsheet Excel (.xlsx) rapi dan format cetak langsung (Print-Ready / PDF) dengan kop surat resmi dinas Kejaksaan RI serta lembar pengesahan tanda tangan.

---

## 1. Overview & Core Concept

- **Tujuan Aplikasi**: Menghilangkan kekacauan pencatatan manual buku tamu/buku ekspedisi ATK di kejaksaan, mencegah kehilangan barang tanpa bukti penerima, dan mendeteksi krisis kehabisan kertas/tinta sebelum mengganggu persidangan atau administrasi perkara.
- **Dua Portal Terintegrasi**:
  1. **Portal Publik / Kiosk Pengambilan ATK (Tanpa Login)**: Pegawai dari berbagai bidang (Pembinaan, Intelijen, Pidum, Pidsus, Datun, PBBR) dapat langsung memilih barang, memasukkan jumlah, mengisi nama & bidang, serta mengambil foto selfie / bukti pengambilan secara instan dalam 30 detik.
  2. **Portal Admin Kejaksaan (Terproteksi Login)**: Digunakan oleh pengelola BMN / urusan perlengkapan untuk mengelola master barang (CRUD), menambah stok barang masuk (pengadaan/drop), memantau log transaksi lengkap dengan foto pengambil, memonitor stok kritis, dan mencetak laporan bulanan.

---

## 2. User Experience & Visual Design

- **Identitas Visual Kejaksaan (Adhyaksa Modern)**:
  - **Palet Warna**: Dominan Forest Green Kejaksaan (`#0A382C` & `#0F5132`) dipadukan aksen Emas Kejaksaan (`#C59B27` / `#D4AF37`) dan kanvas netral bersih (`#F8FAFC` / `#FFFFFF`) dengan kontras tinggi standar WCAG AA.
  - **Tipografi**: Display typography tegas dan bersih (`Plus Jakarta Sans`) dipadukan dengan angka tabular (`font-mono tabular-nums`) pada jumlah kuantitas, tanggal, dan kode barang.
  - **Zero-Pill Discipline**: Metadata status barang dan bidang pemohon disajikan elegan dengan teks rapi berpemisah tipografis (`·`), bukan pill badge yang bertumpuk.
- **Struktur Antarmuka & Alur Pengguna**:
  - **Header 3-Zone**: Identitas Satker Kejari di kiri, toggle cepat mode Kiosk Pengambilan vs Dashboard Admin di tengah, dan status login admin di kanan.
  - **Kiosk Pengambilan ATK**:
    - Tampilan kartu katalog barang dengan visual stok real-time (Tersedia, Kritis, Habis).
    - Modal Pengambilan Interaktif: Input nama pegawai, NIP/Jabatan, Seksi/Bidang, jumlah barang.
    - Kamera Capture Viewport: Preview kamera langsung dengan tombol "Ambil Foto", timer 3 detik opsional, tombol "Beralih Kamera", serta opsi beralih ke "Unggah Berkas Foto".
    - Struk konfirmasi digital setelah pengambilan berhasil.
  - **Dashboard Admin**:
    - Kartu Statistik: Total Aset ATK, Transaksi Bulan Ini, Kategori Barang, Jumlah Item Stok Menipis.
    - Banner Alert & Chime Audio: Peringatan otomatis jika terdapat barang $\le$ batas minimum dengan tombol "Lihat Detail" dan "Restock Cepat".
    - Tab Master Data ATK: Tambah/edit/hapus barang, setting batas minimum stok, kategori, dan satuan (Rim, Box, Pcs, dsb).
    - Tab Barang Masuk (Restock): Form pencatatan pengadaan/penerimaan barang dari DIPA/droping dengan nama supplier/sumber dana.
    - Tab Riwayat & Galeri Pengambilan: Tabel riwayat pengeluaran barang dengan thumbnail foto pengambil yang dapat diklik untuk pratinjau resolusi tinggi.
    - Tab Laporan Bulanan & Ekspor: Filter per bulan/tahun, tabel mutasi lengkap (Stok Awal, Masuk, Keluar, Stok Akhir), tombol ekspor Excel (.xlsx), dan tombol "Cetak PDF Laporan Resmi" yang membuka pratinjau cetak lengkap dengan Kop Surat Kejaksaan Negeri, tanggal pelaporan, dan tanda tangan Pengelola Barang & Kasubbag Pembinaan.

---

## 3. Key Product Decisions & Trade-Offs

- **Pengambilan Barang Tanpa Hambatan (Kiosk Self-Service)**:
  - *Keputusan*: Tidak mewajibkan login bagi staf yang mengambil ATK agar tidak memperlambat aktivitas harian staf jaksa/tata usaha.
  - *Mitigasi Keamanan*: Diwajibkan menyertakan foto wajah pengambil langsung dan pencatatan seksi/bidang, serta log timestamp presisi yang otomatis tersimpan ke sistem.
- **Kamera Langsung & Fallback File Upload**:
  - *Keputusan*: Menggunakan WebRTC `navigator.mediaDevices.getUserMedia` dengan kanvas HTML5 untuk memotret langsung, plus fallback input file standar (`accept="image/*"`). Foto dioptimasi menjadi format WebP/JPEG terkompresi ringan untuk menjaga responsivitas penyimpanan.
- **Sistem Suara & Alert Stok Menipis**:
  - *Keputusan*: Menggunakan Web Audio API native (audio synthesizer chime) sehingga tidak memerlukan file audio eksternal yang rentan gagal dimuat. Suara berbunyi saat mendeteksi stok $\le$ batas minimum di sesi admin dengan tombol mute yang fleksibel.
- **Ekspor Dokumen Ganda (Excel + Print-Ready PDF)**:
  - *Keputusan*: Pembuatan file Excel (.xlsx) dengan pustaka spreadsheet murni di sisi browser tanpa server eksternal, dan format cetak CSS `@media print` berstandar kertas A4 resmi tata naskah dinas Kejaksaan RI.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        SIM-ATK KEJAKSAAN NEGERI                        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
         ┌──────────────────────────┴──────────────────────────┐
         ▼                                                     ▼
┌──────────────────────────────┐              ┌──────────────────────────────┐
│   KIOSK PENGAMBILAN ATK      │              │      DASHBOARD ADMIN         │
│   (Publik / Tanpa Login)     │              │      (Terproteksi Login)     │
├──────────────────────────────┤              ├──────────────────────────────┤
│ • Pilih Barang & Cek Stok    │              │ • Master Barang (CRUD)       │
│ • Form Pegawai & Bidang      │              │ • Input Barang Masuk         │
│ • Live Camera Snapshot /     │              │ • Galeri Foto & Log Keluar   │
│   Unggah Berkas Foto         │              │ • Audio & Banner Alert Stok  │
│ • Pengurangan Stok Instan    │              │ • Laporan Bulanan (XLSX/PDF) │
└──────────────┬───────────────┘              └──────────────┬───────────────┘
               │                                             │
               └──────────────────────┬──────────────────────┘
                                      │
                                      ▼
                      ┌──────────────────────────────┐
                      │    STATE & STORAGE LAYER     │
                      ├──────────────────────────────┤
                      │ • LocalStorage & IndexedDB   │
                      │ • Master Items, Logs, Alerts │
                      │ • Office Profile & Config    │
                      │ • Seed Data ATK Standar Kejari│
                      └──────────────────────────────┘
```

### Struktur Entitas Data:
- **ItemATK**: `id`, `kodeBarang`, `namaBarang`, `kategori`, `satuan`, `stok`, `stokMinimum`, `lokasiRak`, `updatedAt`
- **TransaksiMasuk**: `id`, `itemId`, `namaBarang`, `jumlah`, `sumberPengadaan`, `nomorSurat`, `tanggal`, `keterangan`
- **TransaksiKeluar**: `id`, `itemId`, `namaBarang`, `jumlah`, `namaPengambil`, `nipPengambil`, `bidang`, `keperluan`, `fotoPengambil` (Base64 data URL), `tanggal`
- **PengaturanSatker**: `namaKejari`, `alamat`, `kota`, `namaKasubbag`, `nipKasubbag`, `namaPengelola`, `nipPengelola`

---

## 5. Verification & Acceptance Checklist

1. [ ] Pengambilan ATK mandiri dapat dijalankan tanpa login dengan validasi sisa stok.
2. [ ] Kamera aktif dan dapat mengambil foto penerima barang, atau memilih unggah foto.
3. [ ] CRUD Master Barang dan Barang Masuk berfungsi sempurna di portal admin.
4. [ ] Notifikasi otomatis (banner dan audio chime) berbunyi/muncul saat barang mencapai atau di bawah batas minimum.
5. [ ] Riwayat transaksi menampilkan rincian nama, bidang, waktu, dan foto pengambil.
6. [ ] Laporan bulanan dapat difilter per periode, diekspor ke Excel (.xlsx), dan dicetak ke PDF dengan kop dinas resmi Kejaksaan Negeri.
