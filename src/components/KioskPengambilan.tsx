/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  ItemATK,
  KategoriATK,
  BidangKejaksaan,
  TransaksiKeluar,
} from "../types";
import {
  Search,
  Camera,
  Upload,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Printer,
  X,
  Package,
  Layers,
  Sparkles,
  MapPin,
  Clock,
  User,
  Building2,
  FileText,
  RotateCcw,
} from "lucide-react";
import { KejaksaanLogo } from "./KejaksaanLogo";
import { CardSkeleton } from "./SkeletonScreens";
import LoadingModal from "./LoadingModal";

interface KioskProps {
  items: ItemATK[];
  onTakeItem: (
    transaction: TransaksiKeluar,
  ) => Promise<{ success: boolean; message?: string; isLowStockNow?: boolean }>;
  isLoading?: boolean;
}

const KATEGORI_OPTIONS: Array<"Semua" | KategoriATK> = [
  "Semua",
  "Kertas & Buku",
  "Alat Tulis & Pena",
  "Pengarsipan & Map",
  "Binder & Penjepit",
  "Tinta & Toner Printer",
  "Perlengkapan Kantor Lainnya",
];

const BIDANG_LIST: BidangKejaksaan[] = [
  "Subbagian Pembinaan",
  "Seksi Intelijen",
  "Seksi Tindak Pidana Umum (Pidum)",
  "Seksi Tindak Pidana Khusus (Pidsus)",
  "Seksi Perdata dan Tata Usaha Negara (Datun)",
  "Seksi Pengelolaan Barang Bukti & Barang Rampasan (PBBR)",
  // 'Kelompok Jabatan Fungsional',
  // 'Pos Pelayanan Hukum & PTSP',
];

const compressImage = (
  base64Str: string,
  maxWidth = 800,
  quality = 0.7,
): Promise<string> => {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      } else {
        resolve(base64Str);
      }
    };
    img.onerror = () => resolve(base64Str);
  });
};

export const KioskPengambilan: React.FC<KioskProps> = ({
  items,
  onTakeItem,
  isLoading = false,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    "Semua" | KategoriATK
  >("Semua");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Selected item to take
  const [selectedItem, setSelectedItem] = useState<ItemATK | null>(null);

  // Form states
  const [namaPengambil, setNamaPengambil] = useState("");
  const [nipPengambil, setNipPengambil] = useState("");
  const [bidang, setBidang] = useState<BidangKejaksaan>(
    "Seksi Tindak Pidana Umum (Pidum)",
  );
  const [keperluan, setKeperluan] = useState("");
  const [jumlah, setJumlah] = useState<number>(1);

  // Photo mode: 'camera' | 'upload'
  const [photoMode, setPhotoMode] = useState<"camera" | "upload">("camera");
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");

  // Success receipt modal state
  const [lastReceipt, setLastReceipt] = useState<TransaksiKeluar | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Filter items
  const filteredItems = Array.isArray(items)
    ? items.filter((item) => {
        const matchCategory =
          selectedCategory === "Semua" || item.kategori === selectedCategory;
        const matchSearch =
          item.namaBarang.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.kodeBarang.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.lokasiRak &&
            item.lokasiRak.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchCategory && matchSearch;
      })
    : [];

  // TAMBAHAN: Urutkan agar stok yang habis tampil paling belakang
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (a.stok <= 0 && b.stok > 0) return 1;
    if (a.stok > 0 && b.stok <= 0) return -1;
    return 0; // Pertahankan urutan asli jika status stok sama
  });

  // Start camera stream
  const startCamera = useCallback(async () => {
    stopCamera();
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Browser tidak mendukung akses kamera langsung.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current
          .play()
          .catch((e) => console.log("Video play interrupted:", e));
      }
      setIsCameraActive(true);
    } catch (err: unknown) {
      console.warn("Camera access failed:", err);
      const msg =
        err instanceof Error
          ? err.message
          : "Izin kamera ditolak atau perangkat kamera tidak tersedia.";
      setCameraError(msg + ' Silakan gunakan opsi "Unggah Berkas Foto".');
      setIsCameraActive(false);
    }
  }, [facingMode]);

  // Stop camera stream
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  }, []);

  // When modal opens with camera mode
  useEffect(() => {
    if (selectedItem && photoMode === "camera" && !capturedPhoto) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [selectedItem, photoMode, capturedPhoto, startCamera, stopCamera]);

  // Take snapshot from video
  const takeSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Flip horizontally if front camera for natural selfie look
    if (facingMode === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Add watermark timestamp on snapshot
    ctx.font = "14px sans-serif";
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.fillRect(0, canvas.height - 28, canvas.width, 28);
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(
      `PENGAMBILAN ATK - KEJAKSAAN NEGERI · ${new Date().toLocaleString("id-ID")}`,
      12,
      canvas.height - 10,
    );

    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    setCapturedPhoto(dataUrl);
    stopCamera();
  };

  // Handle uploaded file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Cek format gambar
    if (!file.type.startsWith("image/")) {
      alert("Mohon unggah file format gambar (JPG/PNG/WebP).");
      return;
    }

    // Cek batas ukuran 2MB
    const MAX_FILE_SIZE = 2 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      alert(
        "Ukuran foto terlalu besar! Maksimal ukuran file adalah 2MB. Silakan pilih foto lain atau gunakan opsi Kamera.",
      );
      e.target.value = ""; // Reset input
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;

      try {
        // Panggil fungsi kompresi sebelum masuk ke state
        const compressedDataUrl = await compressImage(dataUrl, 800, 0.7);
        setCapturedPhoto(compressedDataUrl);
      } catch (error) {
        console.error("Gagal melakukan kompresi gambar", error);
        setCapturedPhoto(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  // Open item request modal
  const handleOpenModal = (item: ItemATK) => {
    setSelectedItem(item);
    setJumlah(1);
    setNamaPengambil("");
    setNipPengambil("");
    setKeperluan("");
    setCapturedPhoto(null);
    setCameraError(null);
    setSubmitError(null);
    setPhotoMode("camera");
  };

  // Close item request modal
  const handleCloseModal = () => {
    stopCamera();
    setSelectedItem(null);
  };

  // Submit request
  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    if (!namaPengambil.trim()) {
      setSubmitError("Nama Pengambil wajib diisi.");
      return;
    }

    if (!keperluan.trim()) {
      setSubmitError("Keperluan penggunaan ATK wajib diisi.");
      return;
    }

    if (jumlah <= 0 || jumlah > selectedItem.stok) {
      setSubmitError(
        `Jumlah tidak valid (Maksimal: ${selectedItem.stok} ${selectedItem.satuan}).`,
      );
      return;
    }

    if (!capturedPhoto) {
      setSubmitError(
        "Wajib menyertakan foto pengambil barang (foto webcam atau unggahan berkas).",
      );
      return;
    }

    const newTx: TransaksiKeluar = {
      id: `OUT-${Date.now().toString().slice(-6)}`,
      itemId: selectedItem.id,
      kodeBarang: selectedItem.kodeBarang,
      namaBarang: selectedItem.namaBarang,
      kategori: selectedItem.kategori,
      satuan: selectedItem.satuan,
      jumlah: Number(jumlah),
      namaPengambil: namaPengambil.trim(),
      nipPengambil: nipPengambil.trim() || undefined,
      bidang: bidang,
      keperluan: keperluan.trim(),
      fotoPengambil: capturedPhoto,
      tanggal: new Date().toISOString(),
      status: "Diterima Langsung",
    };

    const res = await onTakeItem(newTx);
    setIsSubmitting(true);
    if (res.success) {
      stopCamera();
      setSelectedItem(null);
      setLastReceipt(newTx);
    } else {
      setSubmitError(res.message || "Gagal mencatat transaksi.");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner for Kiosk */}
      <div className="bg-linear-to-r from-emerald-900 via-emerald-800 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg border border-emerald-700/50">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-300 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-600/40">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Layanan PENA Kejari Batang</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Portal Pengambilan ATK Kantor
            </h1>
            <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed">
              Silahkan cari barang ATK yang dibutuhkan, isi data seksi/bidang
              pemohon, dan ambil foto dokumentasi penerima untuk Akuntabilitas
              Berita Acara Mutasi Barang Milik Negara (BMN).
            </p>
          </div>
          <div className="flex items-center gap-4 bg-slate-900/60 p-4 rounded-xl border border-emerald-600/30 backdrop-blur-sm shrink-0">
            <div className="text-center px-2">
              <span className="block text-2xl font-bold font-mono text-emerald-300 tabular-nums">
                {items.length}
              </span>
              <span className="text-[11px] text-slate-300">Total Katalog</span>
            </div>
            <div className="w-px h-8 bg-emerald-700/40" />
            <div className="text-center px-2">
              <span className="block text-2xl font-bold font-mono text-amber-400 tabular-nums">
                {Array.isArray(items)
                  ? items.filter((i) => i.stok > 0).length
                  : 0}
              </span>
              <span className="text-[11px] text-slate-300">Siap Diambil</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama barang ATK, kode barang, atau lokasi rak..."
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Categories as clean segmented control buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {KATEGORI_OPTIONS.map((kat) => (
            <button
              key={kat}
              type="button"
              onClick={() => setSelectedCategory(kat)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedCategory === kat
                  ? "bg-emerald-800 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
              }`}
            >
              {kat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Katalog ATK */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 8 }).map((_, idx) => (
              <CardSkeleton key={idx} />
            ))
          : sortedItems.map((item) => {
              const isOutOfStock = item.stok <= 0;
              const isLowStock = !isOutOfStock && item.stok <= item.stokMinimum;

              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-xl border p-5 flex flex-col justify-between transition-all duration-200 hover:shadow-md ${
                    isOutOfStock
                      ? "border-slate-200 bg-slate-50/50 opacity-75"
                      : isLowStock
                        ? "border-amber-300 ring-1 ring-amber-200 hover:border-amber-400"
                        : "border-slate-200 hover:border-emerald-500"
                  }`}
                >
                  <div className="space-y-3">
                    {/* Header metadata unboxed with separators */}
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="font-mono text-slate-600 font-medium">
                        {item.kodeBarang}
                      </span>
                      <span>·</span>
                      <span className="truncate max-w-30">
                        {item.kategori}
                      </span>
                    </div>

                    {/* Title */}
                    <div>
                      <h3 className="font-semibold text-slate-900 text-base leading-snug line-clamp-2">
                        {item.namaBarang}
                      </h3>
                      {item.spesifikasi && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                          {item.spesifikasi}
                        </p>
                      )}
                    </div>

                    {/* Location indicator */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">
                        {item.lokasiRak || "Gudang Utama"}
                      </span>
                    </div>
                  </div>

                  {/* Stock and Action */}
                  <div className="pt-4 mt-4 border-t border-slate-100 space-y-3">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-slate-500 font-medium">
                        Sisa Stok:
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span
                          className={`text-xl font-bold font-mono tabular-nums ${
                            isOutOfStock
                              ? "text-rose-600"
                              : isLowStock
                                ? "text-amber-600"
                                : "text-emerald-700"
                          }`}
                        >
                          {item.stok}
                        </span>
                        <span className="text-xs text-slate-600 font-medium">
                          {item.satuan}
                        </span>
                      </div>
                    </div>

                    {/* Status indicator line */}
                    <div className="text-[11px] font-medium flex items-center gap-1">
                      {isOutOfStock ? (
                        <span className="text-rose-600 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" /> Stok Habis
                        </span>
                      ) : isLowStock ? (
                        <span className="text-amber-600 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" /> Stok Menipis
                          (Min: {item.stokMinimum})
                        </span>
                      ) : (
                        <span className="text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Tersedia
                        </span>
                      )}
                    </div>

                    {/* Take item button */}
                    <button
                      type="button"
                      disabled={isOutOfStock}
                      onClick={() => handleOpenModal(item)}
                      className={`w-full py-2.5 px-4 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
                        isOutOfStock
                          ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                          : isLowStock
                            ? "bg-amber-600 text-white hover:bg-amber-700 shadow-xs"
                            : "bg-emerald-800 text-white hover:bg-emerald-700 shadow-xs"
                      }`}
                    >
                      <Package className="w-4 h-4" />
                      <span>
                        {isOutOfStock
                          ? "Stok Tidak Tersedia"
                          : "Ambil Barang Ini"}
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
      </div>

      {!isLoading && filteredItems.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
          <Layers className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-semibold text-slate-800">
            Barang tidak ditemukan
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Tidak ada item ATK yang sesuai dengan kata kunci &quot;{searchQuery}
            &quot;. Coba cari kata kunci lain atau periksa ejaan.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("Semua");
            }}
            className="px-4 py-2 text-xs font-medium text-emerald-800 bg-emerald-50 rounded-lg hover:bg-emerald-100"
          >
            Reset Pencarian
          </button>
        </div>
      )}

      {/* MODAL PENGAMBILAN ATK DENGAN KAMERA & FORM */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden my-auto animate-in fade-in duration-200">
            {/* Header Modal */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <KejaksaanLogo size={32} />
                <div>
                  <h3 className="text-base font-bold text-white">
                    Formulir Pengambilan ATK
                  </h3>
                  <p className="text-xs text-emerald-300">
                    {selectedItem.namaBarang} ({selectedItem.kodeBarang})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form
              onSubmit={handleSubmitRequest}
              className="p-6 overflow-y-auto space-y-5"
            >
              {submitError && (
                <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Info Barang & Jumlah Input */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">
                    Stok Tersedia Saat Ini:
                  </span>
                  <span className="font-mono font-bold text-emerald-800 text-sm">
                    {selectedItem.stok} {selectedItem.satuan}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-200">
                  <label
                    htmlFor="jumlahInput"
                    className="text-sm font-semibold text-slate-800"
                  >
                    Jumlah yang Diambil:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      id="jumlahInput"
                      type="number"
                      min={1}
                      max={selectedItem.stok}
                      value={jumlah}
                      onChange={(e) =>
                        setJumlah(
                          Math.max(
                            1,
                            Math.min(selectedItem.stok, Number(e.target.value)),
                          ),
                        )
                      }
                      className="w-24 text-center py-1.5 px-3 bg-white border border-slate-300 rounded-lg font-mono font-bold text-slate-900 text-base focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                    <span className="text-sm font-medium text-slate-600">
                      {selectedItem.satuan}
                    </span>
                  </div>
                </div>
              </div>

              {/* Data Pengambil */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Nama Pegawai Pengambil *</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Galih Nur Hidayat, S.Ak."
                    value={namaPengambil}
                    onChange={(e) => setNamaPengambil(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    NIP / NRP / No. Identitas (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 20010517 202404 1 002"
                    value={nipPengambil}
                    onChange={(e) => setNipPengambil(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Bidang Kejaksaan */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Seksi / Bidang Satker Kejaksaan *</span>
                </label>
                <select
                  value={bidang}
                  onChange={(e) => setBidang(e.target.value as BidangKejaksaan)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                >
                  {BIDANG_LIST.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              {/* Keperluan */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span>Keperluan Penggunaan *</span>
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Contoh: Mengisi tinta printer Pembinaan"
                  value={keperluan}
                  onChange={(e) => setKeperluan(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              {/* SEKSI FOTO PENGAMBIL (KAMERA LANGSUNG ATAU UPLOAD) */}
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-emerald-700" />
                    <span>Foto Dokumentasi Pengambil Barang *</span>
                  </label>

                  {/* Mode switcher tabs */}
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                    <button
                      type="button"
                      onClick={() => {
                        setPhotoMode("camera");
                        setCapturedPhoto(null);
                        startCamera();
                      }}
                      className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                        photoMode === "camera"
                          ? "bg-white text-emerald-900 shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Kamera Langsung
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPhotoMode("upload");
                        stopCamera();
                      }}
                      className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                        photoMode === "upload"
                          ? "bg-white text-emerald-900 shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Unggah File
                    </button>
                  </div>
                </div>

                {/* Subview: Kamera Langsung */}
                {photoMode === "camera" && (
                  <div className="space-y-3">
                    {cameraError ? (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800 space-y-2">
                        <div className="flex items-center gap-2 font-medium">
                          <AlertCircle className="w-4 h-4 text-amber-600" />
                          <span>Peringatan Kamera</span>
                        </div>
                        <p>{cameraError}</p>
                        <button
                          type="button"
                          onClick={() => {
                            setPhotoMode("upload");
                          }}
                          className="px-3 py-1.5 bg-amber-600 text-white rounded-md text-xs font-medium hover:bg-amber-700 transition-colors"
                        >
                          Gunakan Unggah Berkas Foto Saja
                        </button>
                      </div>
                    ) : capturedPhoto ? (
                      /* Preview hasil jepretan kamera */
                      <div className="relative rounded-xl overflow-hidden border border-emerald-300 bg-slate-900 max-w-sm mx-auto">
                        <img
                          src={capturedPhoto}
                          alt="Hasil Jepretan Pengambil"
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between bg-slate-900/80 backdrop-blur-xs p-2 rounded-lg text-xs text-white">
                          <span className="flex items-center gap-1 text-emerald-400 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Foto
                            Tersimpan
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setCapturedPhoto(null);
                              startCamera();
                            }}
                            className="flex items-center gap-1 text-amber-300 hover:text-amber-200 font-medium"
                          >
                            <RotateCcw className="w-3.5 h-3.5" /> Ambil Ulang
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Live Camera Viewport */
                      <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-700 max-w-sm mx-auto">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className={`w-full h-48 object-cover ${
                            facingMode === "user" ? "scale-x-[-1]" : ""
                          }`}
                        />
                        <canvas ref={canvasRef} className="hidden" />

                        {/* Camera Controls Overlay */}
                        <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-4">
                          <button
                            type="button"
                            onClick={() => {
                              setFacingMode((prev) =>
                                prev === "user" ? "environment" : "user",
                              );
                            }}
                            title="Beralih Kamera Depan/Belakang"
                            className="p-2 bg-slate-900/80 hover:bg-slate-800 text-white rounded-full backdrop-blur-xs border border-white/20"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={takeSnapshot}
                            disabled={!isCameraActive}
                            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-full shadow-lg border-2 border-white transition-all transform active:scale-95 text-xs"
                          >
                            <Camera className="w-4 h-4" />
                            <span>Jepret Foto</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Subview: Unggah Berkas Foto */}
                {photoMode === "upload" && (
                  <div className="space-y-3">
                    {capturedPhoto ? (
                      <div className="relative rounded-xl overflow-hidden border border-emerald-300 bg-slate-900 max-w-sm mx-auto">
                        <img
                          src={capturedPhoto}
                          alt="Foto Pengambil Diunggah"
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between bg-slate-900/80 backdrop-blur-xs p-2 rounded-lg text-xs text-white">
                          <span className="flex items-center gap-1 text-emerald-400 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" /> File
                            Terpilih
                          </span>
                          <button
                            type="button"
                            onClick={() => setCapturedPhoto(null)}
                            className="text-rose-300 hover:text-rose-200 font-medium"
                          >
                            Hapus & Ganti
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="border-2 border-dashed border-slate-300 hover:border-emerald-600 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50 hover:bg-emerald-50/30">
                        <Upload className="w-8 h-8 text-slate-400 mb-2" />
                        <span className="text-xs font-semibold text-slate-700">
                          Klik untuk memilih foto dari galeri / komputer
                        </span>
                        <span className="text-[11px] text-slate-400 mt-1">
                          Format JPG, PNG, atau WebP (Foto wajah pengambil)
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-700 rounded-lg shadow-sm transition-all flex items-center gap-2 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {isSubmitting
                      ? "Memproses..."
                      : "Konfirmasi Pengambilan ATK"}
                  </span>
                </button>
              </div>
            </form>
            <LoadingModal
              isOpen={isSubmitting}
              message="Mencatat pengambilan barang..."
            />
          </div>
        </div>
      )}

      {/* MODAL STRUK / BUKTI DIGITAL PENGAMBILAN */}
      {lastReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Kop struk */}
            <div className="bg-emerald-900 text-white p-5 text-center space-y-2">
              <div className="flex justify-center">
                <KejaksaanLogo size={48} />
              </div>
              <h3 className="font-extrabold text-base tracking-wide">
                BUKTI SERAH TERIMA ATK
              </h3>
              <p className="text-[11px] text-emerald-200">
                KEJAKSAAN REPUBLIK INDONESIA
              </p>
            </div>

            {/* Receipt Details */}
            <div className="p-6 space-y-4 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-dashed border-slate-300">
                <span className="text-slate-500">No. Transaksi:</span>
                <span className="font-mono font-bold text-slate-800">
                  {lastReceipt.id}
                </span>
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-dashed border-slate-300">
                <span className="text-slate-500">Waktu:</span>
                <span className="font-mono text-slate-800">
                  {new Date(lastReceipt.tanggal).toLocaleString("id-ID")}
                </span>
              </div>

              <div className="space-y-1 pb-3 border-b border-dashed border-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-500">Nama Pengambil:</span>
                  <span className="font-bold text-slate-900">
                    {lastReceipt.namaPengambil}
                  </span>
                </div>
                {lastReceipt.nipPengambil && (
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">NIP/Identitas:</span>
                    <span className="font-mono text-slate-600">
                      {lastReceipt.nipPengambil}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Bidang/Seksi:</span>
                  <span className="text-slate-800 font-medium">
                    {lastReceipt.bidang}
                  </span>
                </div>
              </div>

              {/* Barang Yang Diambil */}
              <div className="bg-emerald-50/70 p-3 rounded-lg border border-emerald-200 space-y-1">
                <span className="text-[10px] text-emerald-800 font-semibold uppercase tracking-wider block">
                  Barang Diterima:
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="font-bold text-slate-900 text-sm">
                    {lastReceipt.namaBarang}
                  </span>
                  <span className="font-mono font-extrabold text-emerald-900 text-base">
                    {lastReceipt.jumlah} {lastReceipt.satuan}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 pt-1">
                  Keperluan: {lastReceipt.keperluan}
                </p>
              </div>

              {/* Foto Pengambil Thumbnail */}
              {lastReceipt.fotoPengambil && (
                <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg border border-slate-200">
                  <img
                    src={lastReceipt.fotoPengambil}
                    alt="Foto Pengambil"
                    className="w-14 h-14 object-cover rounded-md border border-slate-300"
                  />
                  <div className="text-[11px] text-slate-600 space-y-0.5">
                    <span className="font-semibold text-slate-800 block">
                      Dokumentasi Digital Tersimpan
                    </span>
                    <span className="text-slate-500">
                      Telah diverifikasi kamera sistem inventaris Kejaksaan.
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Struk</span>
              </button>

              <button
                type="button"
                onClick={() => setLastReceipt(null)}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-700 rounded-lg transition-colors"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
