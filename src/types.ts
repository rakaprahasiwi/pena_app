/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type KategoriATK =
  | 'Kertas & Buku'
  | 'Alat Tulis & Pena'
  | 'Pengarsipan & Map'
  | 'Binder & Penjepit'
  | 'Tinta & Toner Printer'
  | 'Perlengkapan Kantor Lainnya';

export type BidangKejaksaan =
  | 'Subbagian Pembinaan'
  | 'Seksi Intelijen'
  | 'Seksi Tindak Pidana Umum (Pidum)'
  | 'Seksi Tindak Pidana Khusus (Pidsus)'
  | 'Seksi Perdata dan Tata Usaha Negara (Datun)'
  | 'Seksi Pengelolaan Barang Bukti & Barang Rampasan (PBBR)'
  | 'Kelompok Jabatan Fungsional'
  | 'Pos Pelayanan Hukum & PTSP';

export interface ItemATK {
  id: string;
  kodeBarang: string;
  namaBarang: string;
  kategori: KategoriATK;
  satuan: string; // Rim, Kotak, Pcs, Lusin, Rol, Botol, Buah
  stok: number;
  stokMinimum: number;
  lokasiRak: string; // misal: Lemari A-1, Rak B-3
  spesifikasi?: string; // misal: 75 gsm, Warna Hitam, Ukuran F4
  updatedAt: string;
}

export interface TransaksiMasuk {
  id: string;
  itemId: string;
  kodeBarang: string;
  namaBarang: string;
  kategori: KategoriATK;
  satuan: string;
  jumlah: number;
  // sumberPengadaan: string; // misal: DIPA Satker 2026, Droping Kejati, Rekanan Pengadaan
  // nomorDokumen: string; // misal: SPK/04/BMN/2026, BAST/01/ATK/2026
  tanggal: string; // YYYY-MM-DD
  dicatatOleh: string;
  keterangan?: string;
}

export interface TransaksiKeluar {
  id: string;
  itemId: string;
  kodeBarang: string;
  namaBarang: string;
  kategori: KategoriATK;
  satuan: string;
  jumlah: number;
  namaPengambil: string;
  nipPengambil?: string;
  bidang: BidangKejaksaan;
  keperluan: string; // misal: Persidangan Perkara Pidum, Administrasi Intelijen
  fotoPengambil: string; // Base64 data URL
  tanggal: string; // ISO string with date & time
  status: 'Diterima Langsung' | 'Diverifikasi';
}

export interface PengaturanSatker {
  namaKejari: string; // misal: "KEJAKSAAN NEGERI KOTA MALANG"
  instansiInduk: string; // misal: "KEJAKSAAN TINGGI JAWA TIMUR"
  alamat: string;
  telepon: string;
  kota: string;
  namaKasubbag: string;
  nipKasubbag: string;
  jabatanKasubbag: string;
  namaPengelola: string;
  nipPengelola: string;
  jabatanPengelola: string;
}

export interface MutasiBarang {
  item: ItemATK;
  stokAwal: number;
  totalMasuk: number;
  totalKeluar: number;
  stokAkhir: number;
  kondisi: string;
}

export interface AdminUser {
  id: number;
  username: string;
  role: 'superadmin' | 'admin';
  namaLengkap: string;
  status: 'aktif' | 'nonaktif';
  createdAt?: string;
  password?: string; // Hanya digunakan saat form input/edit
}
