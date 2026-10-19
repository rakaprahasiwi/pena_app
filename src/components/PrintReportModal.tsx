/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { MutasiBarang, PengaturanSatker } from "../types";
import { KejaksaanLogo } from "./KejaksaanLogo";
import { Printer, X, Download } from "lucide-react";
import { NAMA_BULAN } from "../utils/exportUtils";

interface PrintReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  mutasiList: MutasiBarang[];
  selectedMonth: number;
  selectedYear: number;
  satker: PengaturanSatker;
  onExportExcel: () => void;
}

export const PrintReportModal: React.FC<PrintReportModalProps> = ({
  isOpen,
  onClose,
  mutasiList,
  selectedMonth,
  selectedYear,
  satker,
  onExportExcel,
}) => {
  if (!isOpen) return null;

  const monthName = NAMA_BULAN[selectedMonth];
  const currentDateFormatted = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const totalStokAwal = mutasiList.reduce((sum, m) => sum + m.stokAwal, 0);
  const totalMasuk = mutasiList.reduce((sum, m) => sum + m.totalMasuk, 0);
  const totalKeluar = mutasiList.reduce((sum, m) => sum + m.totalKeluar, 0);
  const totalStokAkhir = mutasiList.reduce((sum, m) => sum + m.stokAkhir, 0);

  // FUNGSI PRINT YANG DIPERBARUI: Menggunakan metode jendela terpisah
  const handlePrint = () => {
    const printContent = document.getElementById("print-area");
    if (!printContent) return;

    // Buka tab/jendela baru khusus untuk cetak
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    // Tulis struktur dokumen dengan menyuntikkan script Tailwind CSS
    // agar tabel tidak hancur dan mendukung paginasi otomatis
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Laporan Mutasi ATK - ${monthName} ${selectedYear}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            /* Aturan cetak agar tabel terpecah rapi ke halaman berikutnya */
            @media print {
              @page { margin: 1cm; size: A4 portrait; }
              body { -webkit-print-color-adjust: exact; color-adjust: exact; }
              table { page-break-inside: auto; width: 100%; }
              tr { page-break-inside: avoid; page-break-after: auto; }
              thead { display: table-header-group; }
              tfoot { display: table-footer-group; }
              /* Sembunyikan URL & Date bawaan browser jika memungkinkan */
              @page { size: auto; margin: 10mm; }
            }
          </style>
        </head>
        <body class="bg-white text-black font-sans p-6 text-[11px]">
          ${printContent.innerHTML}
          <script>
            // Beri jeda 800ms agar script Tailwind selesai membaca dan menerapkan style 
            // sebelum dialog print browser muncul.
            setTimeout(() => {
              window.print();
              window.close();
            }, 800);
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-300 max-w-5xl w-full flex flex-col max-h-[96vh] my-auto overflow-hidden">
        {/* Modal Top Control Bar (Hidden when printing) */}
        <div className="bg-slate-900 text-white px-6 py-3.5 flex items-center justify-between no-print shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <Printer className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-bold text-sm text-white">
                Review Dokumen Cetak / Format PDF Resmi
              </h3>
              <p className="text-xs text-slate-400">
                Laporan Bulanan Mutasi ATK Kejaksaan Negeri Batang
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onExportExcel}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Excel</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / Simpan PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Container - TAMBAHKAN ID "print-area" DISINI */}
        <div
          id="print-area"
          className="p-8 sm:p-12 overflow-y-auto bg-white text-black font-sans text-xs selection:bg-amber-100"
        >
          {/* KOP SURAT DINAS RESMI KEJAKSAAN */}
          <div className="text-center relative pb-3 border-b-[3px] border-black">
            <div className="flex items-center justify-center gap-5">
              <div className="shrink-0">
                <KejaksaanLogo size={76} />
              </div>
              <div className="space-y-0.5">
                <h2 className="text-base font-bold tracking-wider uppercase text-black font-serif">
                  KEJAKSAAN REPUBLIK INDONESIA
                </h2>
                <h3 className="text-sm font-bold tracking-wider uppercase text-black font-serif">
                  {satker.instansiInduk}
                </h3>
                <h1 className="text-lg font-black tracking-wider uppercase text-black font-serif">
                  {satker.namaKejari}
                </h1>
                <p className="text-[11px] text-gray-700">
                  {satker.alamat} · Telp: {satker.telepon}
                </p>
              </div>
            </div>
            {/* Garis Ganda Kop Surat Resmi */}
            <div className="w-full h-0.5 bg-black mt-2" />
          </div>

          {/* JUDUL LAPORAN */}
          <div className="text-center my-6 space-y-1">
            <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-wide underline underline-offset-4">
              LAPORAN MUTASI BARANG PERSEDIAAN ALAT TULIS KANTOR (ATK)
            </h2>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-800">
              BULAN: {monthName} TAHUN {selectedYear}
            </p>
          </div>

          {/* TABEL MUTASI RESMI */}
          <table className="w-full border-collapse border border-black text-[11px]">
            <thead>
              <tr className="bg-gray-100 text-center font-bold">
                <th className="border border-black py-2 px-1 w-8">NO</th>
                <th className="border border-black py-2 px-2 w-24">
                  KODE BARANG
                </th>
                <th className="border border-black py-2 px-3 text-left">
                  NAMA BARANG / SPESIFIKASI
                </th>
                <th className="border border-black py-2 px-2 w-16">SATUAN</th>
                <th className="border border-black py-2 px-2 w-16">
                  STOK AWAL
                </th>
                <th className="border border-black py-2 px-2 w-16">MASUK</th>
                <th className="border border-black py-2 px-2 w-16">KELUAR</th>
                <th className="border border-black py-2 px-2 w-16">
                  SISA AKHIR
                </th>
                <th className="border border-black py-2 px-2 w-20">KONDISI</th>
              </tr>
            </thead>
            <tbody>
              {mutasiList.map((m, idx) => (
                <tr key={m.item.id} className="hover:bg-gray-50">
                  <td className="border border-black py-1.5 px-1 text-center font-mono">
                    {idx + 1}
                  </td>
                  <td className="border border-black py-1.5 px-2 text-center font-mono text-[10px]">
                    {m.item.kodeBarang}
                  </td>
                  <td className="border border-black py-1.5 px-3">
                    <span className="font-semibold block">
                      {m.item.namaBarang}
                    </span>
                    {m.item.spesifikasi && (
                      <span className="text-[10px] text-gray-600 block">
                        {m.item.spesifikasi}
                      </span>
                    )}
                  </td>
                  <td className="border border-black py-1.5 px-2 text-center">
                    {m.item.satuan}
                  </td>
                  <td className="border border-black py-1.5 px-2 text-center font-mono tabular-nums">
                    {m.stokAwal}
                  </td>
                  <td className="border border-black py-1.5 px-2 text-center font-mono tabular-nums font-semibold">
                    {m.totalMasuk}
                  </td>
                  <td className="border border-black py-1.5 px-2 text-center font-mono tabular-nums font-semibold">
                    {m.totalKeluar}
                  </td>
                  <td className="border border-black py-1.5 px-2 text-center font-mono tabular-nums font-bold">
                    {m.stokAkhir}
                  </td>
                  <td className="border border-black py-1.5 px-2 text-center font-medium">
                    {m.kondisi}
                  </td>
                </tr>
              ))}
              {/* TOTAL ROW */}
              <tr className="bg-gray-100 font-bold text-center">
                <td
                  colSpan={4}
                  className="border border-black py-2 px-3 text-right"
                >
                  TOTAL REKAPITULASI:
                </td>
                <td className="border border-black py-2 px-2 font-mono tabular-nums">
                  {totalStokAwal}
                </td>
                <td className="border border-black py-2 px-2 font-mono tabular-nums">
                  {totalMasuk}
                </td>
                <td className="border border-black py-2 px-2 font-mono tabular-nums">
                  {totalKeluar}
                </td>
                <td className="border border-black py-2 px-2 font-mono tabular-nums font-black">
                  {totalStokAkhir}
                </td>
                <td className="border border-black py-2 px-2 text-center">
                  Lengkap
                </td>
              </tr>
            </tbody>
          </table>

          {/* CATATAN PENGESAHAN DAN TANDA TANGAN */}
          <table className="w-full mt-10 text-center text-xs border-none">
            <tbody>
              {/* Baris 1: Tanggal & Jabatan (Tersedia ruang untuk tanda tangan di bawahnya) */}
              <tr>
                <td className="w-1/2 align-top px-4 pb-20 border-none">
                  <p className="font-normal text-gray-800">Mengetahui,</p>
                  <p className="font-bold uppercase leading-snug">
                    {satker.jabatanKasubbag}
                  </p>
                </td>
                <td className="w-1/2 align-top px-4 pb-20 border-none">
                  <p className="font-normal text-gray-800">
                    {satker.kota}, {currentDateFormatted}
                  </p>
                  <p className="font-bold uppercase leading-snug">
                    {satker.jabatanPengelola}
                  </p>
                </td>
              </tr>
              {/* Baris 2: Nama & NIP (Otomatis sejajar di bagian bawah) */}
              <tr>
                <td className="w-1/2 align-bottom px-4 border-none">
                  <p className="font-bold uppercase underline underline-offset-2">
                    {satker.namaKasubbag}
                  </p>
                  <p className="font-mono text-[11px]">
                    NIP. {satker.nipKasubbag}
                  </p>
                </td>
                <td className="w-1/2 align-bottom px-4 border-none">
                  <p className="font-bold uppercase underline underline-offset-2">
                    {satker.namaPengelola}
                  </p>
                  <p className="font-mono text-[11px]">
                    NIP. {satker.nipPengelola}
                  </p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
