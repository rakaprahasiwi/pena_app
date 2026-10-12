/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ItemATK, TransaksiMasuk, TransaksiKeluar, PengaturanSatker } from '../types';

const STORAGE_KEYS = {
  ITEMS: 'sim_atk_items_v2',
  MASUK: 'sim_atk_transaksi_masuk_v2',
  KELUAR: 'sim_atk_transaksi_keluar_v2',
  SATKER: 'sim_atk_satker_v2',
  ADMIN_AUTH: 'sim_atk_admin_auth_v2',
};

// Default sample recipient avatar SVG encoded as data URL
const SAMPLE_FOTO_PENGAMBIL = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="%230F5132"/><circle cx="100" cy="75" r="35" fill="%23E2E8F0"/><path d="M40 170 C40 125, 160 125, 160 170 Z" fill="%23E2E8F0"/><text x="100" y="190" text-anchor="middle" fill="%23F8FAFC" font-size="11" font-family="sans-serif">DOKUMENTASI DINAS KEJARI</text></svg>`;

export const DEFAULT_SATKER: PengaturanSatker = {
  namaKejari: 'KEJAKSAAN NEGERI KOTA MALANG',
  instansiInduk: 'KEJAKSAAN TINGGI JAWA TIMUR',
  alamat: 'Jl. Simpang Panji Suroso No. 5, Polowijen, Kec. Blimbing',
  telepon: '(0341) 491234 / Fax: (0341) 491235',
  kota: 'Kota Malang',
  namaKasubbag: 'BAMBANG HERMANTO, S.H., M.H.',
  nipKasubbag: '19780512 200212 1 002',
  jabatanKasubbag: 'Kepala Subbagian Pembinaan',
  namaPengelola: 'SITI NURHALIZA, A.Md.Kom.',
  nipPengelola: '19950314 201902 2 004',
  jabatanPengelola: 'Pengelola Barang Milik Negara / Urusan ATK',
};

export const INITIAL_ITEMS: ItemATK[] = [
  {
    id: 'atk-01',
    kodeBarang: 'ATK-KRT-001',
    namaBarang: 'Kertas HVS F4 75 GSM (SIDU)',
    kategori: 'Kertas & Buku',
    satuan: 'Rim',
    stok: 4, // DI BAWAH BATAS MINIMUM (Warning)
    stokMinimum: 10,
    lokasiRak: 'Gudang ATK - Rak A1',
    spesifikasi: 'Ukuran 21.5 x 33 cm, 75 gsm, 500 lembar/rim',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'atk-02',
    kodeBarang: 'ATK-KRT-002',
    namaBarang: 'Kertas HVS A4 80 GSM (PaperOne)',
    kategori: 'Kertas & Buku',
    satuan: 'Rim',
    stok: 16,
    stokMinimum: 8,
    lokasiRak: 'Gudang ATK - Rak A1',
    spesifikasi: 'Ukuran 21.0 x 29.7 cm, 80 gsm untuk berkas persidangan',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'atk-03',
    kodeBarang: 'ATK-TNA-001',
    namaBarang: 'Tinta Printer Epson 003 Black (Original)',
    kategori: 'Tinta & Toner Printer',
    satuan: 'Botol',
    stok: 1, // SANGAT KRITIS (Warning)
    stokMinimum: 4,
    lokasiRak: 'Lemari Besi BMN - B2',
    spesifikasi: 'Tinta hitam untuk printer berkas L5190/L3110',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'atk-04',
    kodeBarang: 'ATK-TNA-002',
    namaBarang: 'Tinta Printer Epson 003 CMY (Warna Set)',
    kategori: 'Tinta & Toner Printer',
    satuan: 'Set',
    stok: 3, // PAS BATAS MINIMUM
    stokMinimum: 3,
    lokasiRak: 'Lemari Besi BMN - B2',
    spesifikasi: 'Cyan, Magenta, Yellow original Epson',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'atk-05',
    kodeBarang: 'ATK-PLP-001',
    namaBarang: 'Pulpen Faster C600 Tinta Hitam 0.7mm',
    kategori: 'Alat Tulis & Pena',
    satuan: 'Kotak',
    stok: 2, // DI BAWAH BATAS MINIMUM
    stokMinimum: 6,
    lokasiRak: 'Gudang ATK - Rak B1',
    spesifikasi: 'Isi 12 pcs per kotak, tinta pekat tanda tangan',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'atk-06',
    kodeBarang: 'ATK-MAP-001',
    namaBarang: 'Map Gantung Folio Berkas Perkara (Pendaflex)',
    kategori: 'Pengarsipan & Map',
    satuan: 'Pak',
    stok: 12,
    stokMinimum: 5,
    lokasiRak: 'Gudang ATK - Rak C1',
    spesifikasi: 'Dilengkapi tab plastik & kertas penanda indeks',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'atk-07',
    kodeBarang: 'ATK-MAP-002',
    namaBarang: 'Map Snelhefter Karton Hijau Adhyaksa',
    kategori: 'Pengarsipan & Map',
    satuan: 'Lusin',
    stok: 18,
    stokMinimum: 8,
    lokasiRak: 'Gudang ATK - Rak C2',
    spesifikasi: 'Warna Hijau standar instansi Kejaksaan RI',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'atk-08',
    kodeBarang: 'ATK-BNR-001',
    namaBarang: 'Binder Clip No. 260 (Ukuran 2 Inch)',
    kategori: 'Binder & Penjepit',
    satuan: 'Kotak',
    stok: 15,
    stokMinimum: 5,
    lokasiRak: 'Gudang ATK - Rak D1',
    spesifikasi: 'Isi 12 buah per kotak, baja pegas anti karat',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'atk-09',
    kodeBarang: 'ATK-BNR-002',
    namaBarang: 'Trigonal Paper Clips No. 3 (Joyko)',
    kategori: 'Binder & Penjepit',
    satuan: 'Kotak',
    stok: 30,
    stokMinimum: 10,
    lokasiRak: 'Gudang ATK - Rak D1',
    spesifikasi: 'Penjepit kertas lembaran perkara',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'atk-10',
    kodeBarang: 'ATK-BKU-001',
    namaBarang: 'Buku Ekspedisi Surat Dinas / Register Perkara',
    kategori: 'Kertas & Buku',
    satuan: 'Buku',
    stok: 8,
    stokMinimum: 4,
    lokasiRak: 'Gudang ATK - Rak A2',
    spesifikasi: 'Hardcover 100 lembar bergaris kolom tanda tangan',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'atk-11',
    kodeBarang: 'ATK-TNR-001',
    namaBarang: 'Toner Cartridge HP LaserJet 85A (CE285A)',
    kategori: 'Tinta & Toner Printer',
    satuan: 'Buah',
    stok: 4,
    stokMinimum: 2,
    lokasiRak: 'Lemari Besi BMN - B1',
    spesifikasi: 'Untuk printer HP LaserJet P1102 ruang Pidum & Pidsus',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'atk-12',
    kodeBarang: 'ATK-AMP-001',
    namaBarang: 'Amplop Coklat Folio Dinas Kejaksaan RI',
    kategori: 'Perlengkapan Kantor Lainnya',
    satuan: 'Pak',
    stok: 22,
    stokMinimum: 10,
    lokasiRak: 'Gudang ATK - Rak E1',
    spesifikasi: 'Isi 100 lembar dengan kop lambang Kejaksaan RI',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'atk-13',
    kodeBarang: 'ATK-STP-001',
    namaBarang: 'Stapler Heavy Duty HD-50 & Isi Staples No. 3',
    kategori: 'Perlengkapan Kantor Lainnya',
    satuan: 'Set',
    stok: 7,
    stokMinimum: 3,
    lokasiRak: 'Gudang ATK - Rak D2',
    spesifikasi: 'Kapasitas jilid tebal berkas dakwaan',
    updatedAt: new Date().toISOString(),
  },
];

export const INITIAL_MASUK: TransaksiMasuk[] = [
  {
    id: 'in-001',
    itemId: 'atk-01',
    kodeBarang: 'ATK-KRT-001',
    namaBarang: 'Kertas HVS F4 75 GSM (SIDU)',
    kategori: 'Kertas & Buku',
    satuan: 'Rim',
    jumlah: 20,
    tanggal: '2026-01-15',
    dicatatOleh: 'Siti Nurhaliza (Pengelola BMN)',
    keterangan: 'Penerimaan droping awal triwulan',
  },
  {
    id: 'in-002',
    itemId: 'atk-03',
    kodeBarang: 'ATK-TNA-001',
    namaBarang: 'Tinta Printer Epson 003 Black (Original)',
    kategori: 'Tinta & Toner Printer',
    satuan: 'Botol',
    jumlah: 10,
    tanggal: '2026-01-15',
    dicatatOleh: 'Siti Nurhaliza (Pengelola BMN)',
    keterangan: 'Penerimaan tinta printer',
  },
  {
    id: 'in-003',
    itemId: 'atk-05',
    kodeBarang: 'ATK-PLP-001',
    namaBarang: 'Pulpen Faster C600 Tinta Hitam 0.7mm',
    kategori: 'Alat Tulis & Pena',
    satuan: 'Kotak',
    jumlah: 15,
    tanggal: '2026-02-10',
    dicatatOleh: 'Siti Nurhaliza (Pengelola BMN)',
    keterangan: 'Stok administrasi persidangan',
  },
  {
    id: 'in-004',
    itemId: 'atk-02',
    kodeBarang: 'ATK-KRT-002',
    namaBarang: 'Kertas HVS A4 80 GSM (PaperOne)',
    kategori: 'Kertas & Buku',
    satuan: 'Rim',
    jumlah: 25,
    tanggal: '2026-03-05',
    dicatatOleh: 'Siti Nurhaliza (Pengelola BMN)',
    keterangan: 'Pengadaan kertas surat dinas dan SK',
  },
];

export const INITIAL_KELUAR: TransaksiKeluar[] = [
  {
    id: 'out-001',
    itemId: 'atk-01',
    kodeBarang: 'ATK-KRT-001',
    namaBarang: 'Kertas HVS F4 75 GSM (SIDU)',
    kategori: 'Kertas & Buku',
    satuan: 'Rim',
    jumlah: 6,
    namaPengambil: 'Ahmad Fauzi, S.H.',
    nipPengambil: '19890214 201403 1 003',
    bidang: 'Seksi Tindak Pidana Umum (Pidum)',
    keperluan: 'Pemberkasan Perkara Pidana Umum Tahap II dan Surat Dakwaan',
    fotoPengambil: SAMPLE_FOTO_PENGAMBIL,
    tanggal: '2026-02-18T09:30:00.000Z',
    status: 'Diterima Langsung',
  },
  {
    id: 'out-002',
    itemId: 'atk-01',
    kodeBarang: 'ATK-KRT-001',
    namaBarang: 'Kertas HVS F4 75 GSM (SIDU)',
    kategori: 'Kertas & Buku',
    satuan: 'Rim',
    jumlah: 5,
    namaPengambil: 'Dian Permatasari, S.H.',
    nipPengambil: '19920708 201801 2 001',
    bidang: 'Seksi Tindak Pidana Khusus (Pidsus)',
    keperluan: 'Penyidikan Dugaan Tindak Pidana Korupsi & BAP Saksi',
    fotoPengambil: SAMPLE_FOTO_PENGAMBIL,
    tanggal: '2026-02-25T14:15:00.000Z',
    status: 'Diterima Langsung',
  },
  {
    id: 'out-003',
    itemId: 'atk-03',
    kodeBarang: 'ATK-TNA-001',
    namaBarang: 'Tinta Printer Epson 003 Black (Original)',
    kategori: 'Tinta & Toner Printer',
    satuan: 'Botol',
    jumlah: 4,
    namaPengambil: 'Rendra Prasetyo, A.Md.',
    nipPengambil: '19941120 202012 1 002',
    bidang: 'Seksi Intelijen',
    keperluan: 'Pencetakan Laporan Intelijen Khusus (LINSUS) Mingguan',
    fotoPengambil: SAMPLE_FOTO_PENGAMBIL,
    tanggal: '2026-03-02T10:00:00.000Z',
    status: 'Diterima Langsung',
  },
  {
    id: 'out-004',
    itemId: 'atk-05',
    kodeBarang: 'ATK-PLP-001',
    namaBarang: 'Pulpen Faster C600 Tinta Hitam 0.7mm',
    kategori: 'Alat Tulis & Pena',
    satuan: 'Kotak',
    jumlah: 5,
    namaPengambil: 'Wahyu Hidayat',
    nipPengambil: '19870503 201012 1 001',
    bidang: 'Seksi Perdata dan Tata Usaha Negara (Datun)',
    keperluan: 'Pelayanan Publik & Tanda Tangan Buku Tamu PTSP',
    fotoPengambil: SAMPLE_FOTO_PENGAMBIL,
    tanggal: '2026-03-10T11:45:00.000Z',
    status: 'Diterima Langsung',
  },
  {
    id: 'out-005',
    itemId: 'atk-01',
    kodeBarang: 'ATK-KRT-001',
    namaBarang: 'Kertas HVS F4 75 GSM (SIDU)',
    kategori: 'Kertas & Buku',
    satuan: 'Rim',
    jumlah: 5,
    namaPengambil: 'Nurul Azizah, S.H.',
    nipPengambil: '19910419 201503 2 002',
    bidang: 'Seksi Perdata dan Tata Usaha Negara (Datun)',
    keperluan: 'Penyusunan Surat Kuasa Khusus (SKK) & Pendampingan Hukum',
    fotoPengambil: SAMPLE_FOTO_PENGAMBIL,
    tanggal: '2026-03-18T13:20:00.000Z',
    status: 'Diterima Langsung',
  },
];

// Helper functions
export function getStoredItems(): ItemATK[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ITEMS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(INITIAL_ITEMS));
      return INITIAL_ITEMS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_ITEMS;
  }
}

export function saveStoredItems(items: ItemATK[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save items to localStorage:', e);
  }
}

export function saveSingleItem(item: ItemATK): void {
  const items = getStoredItems();
  const existingIdx = items.findIndex((i) => i.id === item.id);
  if (existingIdx >= 0) {
    items[existingIdx] = { ...item, updatedAt: new Date().toISOString() };
  } else {
    items.unshift({ ...item, updatedAt: new Date().toISOString() });
  }
  saveStoredItems(items);
}

export function deleteStoredItem(id: string): void {
  const items = getStoredItems().filter((i) => i.id !== id);
  saveStoredItems(items);
}

export function getStoredTransaksiMasuk(): TransaksiMasuk[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MASUK);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.MASUK, JSON.stringify(INITIAL_MASUK));
      return INITIAL_MASUK;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_MASUK;
  }
}

export function addStoredTransaksiMasuk(transaksi: TransaksiMasuk): void {
  const list = getStoredTransaksiMasuk();
  list.unshift(transaksi);
  localStorage.setItem(STORAGE_KEYS.MASUK, JSON.stringify(list));

  // Automatically increment current stock for that item
  const items = getStoredItems();
  const targetItem = items.find((i) => i.id === transaksi.itemId);
  if (targetItem) {
    targetItem.stok += transaksi.jumlah;
    targetItem.updatedAt = new Date().toISOString();
    saveStoredItems(items);
  }
}

export function getStoredTransaksiKeluar(): TransaksiKeluar[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.KELUAR);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.KELUAR, JSON.stringify(INITIAL_KELUAR));
      return INITIAL_KELUAR;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_KELUAR;
  }
}

export function addStoredTransaksiKeluar(
  transaksi: TransaksiKeluar
): { success: boolean; message?: string; isLowStockNow?: boolean } {
  const items = getStoredItems();
  const targetItem = items.find((i) => i.id === transaksi.itemId);

  if (!targetItem) {
    return { success: false, message: 'Barang tidak ditemukan di sistem inventaris.' };
  }

  if (targetItem.stok < transaksi.jumlah) {
    return {
      success: false,
      message: `Stok tidak mencukupi! Sisa stok saat ini hanya ${targetItem.stok} ${targetItem.satuan}.`,
    };
  }

  // Deduct stock
  targetItem.stok -= transaksi.jumlah;
  targetItem.updatedAt = new Date().toISOString();
  saveStoredItems(items);

  // Save transaction log
  const list = getStoredTransaksiKeluar();
  list.unshift(transaksi);
  localStorage.setItem(STORAGE_KEYS.KELUAR, JSON.stringify(list));

  const isLowStockNow = targetItem.stok <= targetItem.stokMinimum;

  return { success: true, isLowStockNow };
}

export function getStoredSatker(): PengaturanSatker {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SATKER);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SATKER, JSON.stringify(DEFAULT_SATKER));
      return DEFAULT_SATKER;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_SATKER;
  }
}

export function saveStoredSatker(data: PengaturanSatker): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SATKER, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save satker profile:', e);
  }
}

export function getLowStockItems(): ItemATK[] {
  const items = getStoredItems();
  return items.filter((item) => item.stok <= item.stokMinimum);
}

export function resetAllDataToDefault(): void {
  localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(INITIAL_ITEMS));
  localStorage.setItem(STORAGE_KEYS.MASUK, JSON.stringify(INITIAL_MASUK));
  localStorage.setItem(STORAGE_KEYS.KELUAR, JSON.stringify(INITIAL_KELUAR));
  localStorage.setItem(STORAGE_KEYS.SATKER, JSON.stringify(DEFAULT_SATKER));
}
