/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as XLSX from 'xlsx';
import { ItemATK, TransaksiMasuk, TransaksiKeluar, PengaturanSatker, MutasiBarang } from '../types';

export const NAMA_BULAN = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

/**
 * Calculates stock mutation for all items within a specific month and year
 */
export function calculateMonthlyMutation(
  items: ItemATK[],
  transaksiMasuk: TransaksiMasuk[],
  transaksiKeluar: TransaksiKeluar[],
  selectedMonth: number, // 0-indexed (0 = Januari, 11 = Desember)
  selectedYear: number
): MutasiBarang[] {
  return items.map((item) => {
    // Current stock in system
    const currentStock = item.stok;

    // Filter incoming transactions for selected period
    const incomingInPeriod = transaksiMasuk
      .filter((t) => {
        if (t.itemId !== item.id) return false;
        const d = new Date(t.tanggal);
        return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
      })
      .reduce((sum, t) => sum + t.jumlah, 0);

    // Filter outgoing transactions for selected period
    const outgoingInPeriod = transaksiKeluar
      .filter((t) => {
        if (t.itemId !== item.id) return false;
        const d = new Date(t.tanggal);
        return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
      })
      .reduce((sum, t) => sum + t.jumlah, 0);

    // Calculate outgoing after selected period (to back-calculate historical stock if viewing a past month)
    const afterPeriodStart = new Date(selectedYear, selectedMonth + 1, 1).getTime();
    
    const incomingAfter = transaksiMasuk
      .filter((t) => t.itemId === item.id && new Date(t.tanggal).getTime() >= afterPeriodStart)
      .reduce((sum, t) => sum + t.jumlah, 0);

    const outgoingAfter = transaksiKeluar
      .filter((t) => t.itemId === item.id && new Date(t.tanggal).getTime() >= afterPeriodStart)
      .reduce((sum, t) => sum + t.jumlah, 0);

    // Stok akhir pada akhir bulan yang dipilih
    // currentStock = stockAtEndOfPeriod + incomingAfter - outgoingAfter
    // => stockAtEndOfPeriod = currentStock - incomingAfter + outgoingAfter
    const stokAkhirPeriode = Math.max(0, currentStock - incomingAfter + outgoingAfter);

    // Stok awal pada awal bulan yang dipilih
    // stokAkhirPeriode = stokAwal + incomingInPeriod - outgoingInPeriod
    // => stokAwal = stokAkhirPeriode - incomingInPeriod + outgoingInPeriod
    const stokAwalPeriode = Math.max(0, stokAkhirPeriode - incomingInPeriod + outgoingInPeriod);

    return {
      item,
      stokAwal: stokAwalPeriode,
      totalMasuk: incomingInPeriod,
      totalKeluar: outgoingInPeriod,
      stokAkhir: stokAkhirPeriode,
      kondisi: stokAkhirPeriode === 0 ? 'Habis' : stokAkhirPeriode <= item.stokMinimum ? 'Menipis' : 'Baik/Tersedia',
    };
  });
}

/**
 * Generates an official Excel (.xlsx) file with multi-sheet support
 */
export function exportMonthlyReportToExcel(
  mutasiList: MutasiBarang[],
  transaksiKeluar: TransaksiKeluar[],
  selectedMonth: number,
  selectedYear: number,
  satker: PengaturanSatker
): void {
  const monthName = NAMA_BULAN[selectedMonth];
  const workbook = XLSX.utils.book_new();

  // 1. Data Sheet: Rekap Mutasi Bulanan
  const headers = [
    [`KEJAKSAAN REPUBLIK INDONESIA`],
    [satker.instansiInduk.toUpperCase()],
    [satker.namaKejari.toUpperCase()],
    [`LAPORAN MUTASI BARANG PERSEDIAAN ALAT TULIS KANTOR (ATK)`],
    [`PERIODE: ${monthName.toUpperCase()} ${selectedYear}`],
    [],
    [
      'No',
      'Kode Barang',
      'Nama Barang ATK',
      'Kategori',
      'Satuan',
      'Stok Awal',
      'Masuk',
      'Keluar',
      'Sisa Stok Akhir',
      'Batas Minimum',
      'Status Stok',
      'Lokasi Penyimpanan',
    ],
  ];

  const rows = mutasiList.map((m, idx) => [
    idx + 1,
    m.item.kodeBarang,
    m.item.namaBarang,
    m.item.kategori,
    m.item.satuan,
    m.stokAwal,
    m.totalMasuk,
    m.totalKeluar,
    m.stokAkhir,
    m.item.stokMinimum,
    m.stokAkhir <= 0 ? 'HABIS' : m.stokAkhir <= m.item.stokMinimum ? 'PERLU RESTOCK' : 'AMAN',
    m.item.lokasiRak,
  ]);

  // Totals row
  const totalStokAwal = mutasiList.reduce((acc, m) => acc + m.stokAwal, 0);
  const totalMasuk = mutasiList.reduce((acc, m) => acc + m.totalMasuk, 0);
  const totalKeluar = mutasiList.reduce((acc, m) => acc + m.totalKeluar, 0);
  const totalStokAkhir = mutasiList.reduce((acc, m) => acc + m.stokAkhir, 0);

  const footerRow = [
    'TOTAL',
    '',
    '',
    '',
    '',
    totalStokAwal,
    totalMasuk,
    totalKeluar,
    totalStokAkhir,
    '',
    '',
    '',
  ];

  const signatures = [
    [],
    [],
    ['', '', '', '', 'Mengetahui,', '', '', '', satker.kota + `, ${new Date().toLocaleDateString('id-ID')}`],
    ['', '', '', '', satker.jabatanKasubbag, '', '', '', satker.jabatanPengelola],
    [],
    [],
    [],
    ['', '', '', '', satker.namaKasubbag, '', '', '', satker.namaPengelola],
    ['', '', '', '', `NIP. ${satker.nipKasubbag}`, '', '', '', `NIP. ${satker.nipPengelola}`],
  ];

  const fullSheetData = [...headers, ...rows, footerRow, ...signatures];
  const worksheet = XLSX.utils.aoa_to_sheet(fullSheetData);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 5 },  // No
    { wch: 15 }, // Kode
    { wch: 38 }, // Nama
    { wch: 22 }, // Kategori
    { wch: 10 }, // Satuan
    { wch: 12 }, // Stok Awal
    { wch: 14 }, // Masuk
    { wch: 14 }, // Keluar
    { wch: 14 }, // Sisa
    { wch: 14 }, // Minimum
    { wch: 16 }, // Status
    { wch: 22 }, // Lokasi
  ];

  XLSX.utils.book_append_sheet(workbook, worksheet, `Mutasi ${monthName}`);

  // 2. Sheet 2: Rincian Pengambilan ATK dalam Periode Tersebut
  const keluarInPeriod = transaksiKeluar.filter((t) => {
    const d = new Date(t.tanggal);
    return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
  });

  const detailHeaders = [
    [`RINCIAN PENGELUARAN ATK PERIODE: ${monthName.toUpperCase()} ${selectedYear}`],
    [],
    ['No', 'Waktu Pengambilan', 'Nama Pengambil', 'NIP / Identitas', 'Seksi / Bidang', 'Nama Barang ATK', 'Jumlah', 'Satuan', 'Keperluan Penggunaan'],
  ];

  const detailRows = keluarInPeriod.map((t, idx) => {
    const dt = new Date(t.tanggal);
    const formattedDate = `${dt.getDate()} ${NAMA_BULAN[dt.getMonth()]} ${dt.getFullYear()} ${dt.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;
    return [
      idx + 1,
      formattedDate,
      t.namaPengambil,
      t.nipPengambil || '-',
      t.bidang,
      t.namaBarang,
      t.jumlah,
      t.satuan,
      t.keperluan,
    ];
  });

  const detailSheet = XLSX.utils.aoa_to_sheet([...detailHeaders, ...detailRows]);
  detailSheet['!cols'] = [
    { wch: 5 },
    { wch: 22 },
    { wch: 25 },
    { wch: 22 },
    { wch: 30 },
    { wch: 35 },
    { wch: 10 },
    { wch: 10 },
    { wch: 40 },
  ];

  XLSX.utils.book_append_sheet(workbook, detailSheet, `Detail Pengambilan`);

  // Download the Excel file
  const fileName = `Laporan_Mutasi_ATK_${satker.namaKejari.replace(/\s+/g, '_')}_${monthName}_${selectedYear}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}
