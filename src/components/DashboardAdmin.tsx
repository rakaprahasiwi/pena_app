import React, { useState } from "react";
import {
  ItemATK,
  TransaksiMasuk,
  TransaksiKeluar,
  PengaturanSatker,
  KategoriATK,
  MutasiBarang,
  AdminUser,
  BidangKejaksaan,
} from "../types";
import {
  Package,
  Layers,
  ArrowDownToLine,
  ArrowUpFromLine,
  AlertTriangle,
  Plus,
  Edit2,
  Trash2,
  Search,
  FileSpreadsheet,
  Printer,
  Settings,
  Image,
  CheckCircle2,
  X,
  Volume2,
  Calendar,
  Save,
  Eye,
  Building,
  UserCheck,
  Users,
} from "lucide-react";
import { playAlertChime } from "../utils/audioAlert";
import {
  calculateMonthlyMutation,
  exportMonthlyReportToExcel,
  NAMA_BULAN,
} from "../utils/exportUtils";
import { PrintReportModal } from "./PrintReportModal";
import { TableSkeleton } from "./SkeletonScreens";
import LoadingModal from "./LoadingModal";

interface DashboardAdminProps {
  items: ItemATK[];
  transaksiMasuk: TransaksiMasuk[];
  transaksiKeluar: TransaksiKeluar[];
  satker: PengaturanSatker;
  currentUser: AdminUser;
  onSaveItem: (item: ItemATK) => void;
  onDeleteItem: (id: string) => void;
  onAddMasuk: (transaksi: TransaksiMasuk) => void;
  onSaveSatker: (data: PengaturanSatker) => void;
  onResetData: () => void;
  initialRestockItem?: ItemATK | null;
  onClearInitialRestockItem?: () => void;
}

//tab 'manajemen-admin'
type AdminSubTab =
  | "ringkasan"
  | "master"
  | "masuk"
  | "keluar"
  | "laporan"
  | "pengaturan"
  | "manajemen-admin";

const KATEGORI_LIST: KategoriATK[] = [
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
  "Seksi Pengelolaan Barang Bukti dan Barang Rampasan (PAPBB)",
];

export const DashboardAdmin: React.FC<DashboardAdminProps> = ({
  items,
  transaksiMasuk,
  transaksiKeluar,
  satker,
  onSaveItem,
  onDeleteItem,
  onAddMasuk,
  onSaveSatker,
  initialRestockItem,
  onClearInitialRestockItem,
  currentUser,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<AdminSubTab>(
    initialRestockItem ? "masuk" : "ringkasan",
  );

  //search dan filter
  const [searchQuery, setSearchQuery] = useState("");
  const [searchKeluar, setSearchKeluar] = useState("");
  const [searchMasuk, setSearchMasuk] = useState("");
  const [searchAdmin, setSearchAdmin] = useState("");

  //set search dan filter kategori
  const [categoryFilter, setCategoryFilter] = useState<"Semua" | KategoriATK>(
    "Semua",
  );
  const [bidangFilter, setBidangFilter] = useState<"Semua" | BidangKejaksaan>(
    "Semua",
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  // State baru untuk Manajemen Admin
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [isAdminUsersLoading, setIsAdminUsersLoading] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [adminForm, setAdminForm] = useState<Partial<AdminUser>>({
    username: "",
    password: "",
    role: "admin",
    namaLengkap: "",
    status: "aktif",
  });

  // Fetch daftar admin jika role adalah superadmin dan sedang di tab manajemen-admin
  React.useEffect(() => {
    if (
      activeSubTab === "manajemen-admin" &&
      currentUser.role === "superadmin"
    ) {
      setIsAdminUsersLoading(true);
      fetch("/api/admins")
        .then((res) => res.json())
        .then((data) => setAdminUsers(data))
        .catch((err) => console.error(err))
        .finally(() => setIsAdminUsersLoading(false));
    }
  }, [activeSubTab, currentUser.role]);

  // Month & Year selection for report
  const now = new Date();
  const [reportMonth, setReportMonth] = useState<number>(now.getMonth());
  const [reportYear, setReportYear] = useState<number>(now.getFullYear());
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // CRUD Item Modal State
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ItemATK | null>(null);
  const [itemFormData, setItemFormData] = useState({
    kodeBarang: "",
    namaBarang: "",
    kategori: "Kertas & Buku" as KategoriATK,
    satuan: "Rim",
    stok: 0,
    stokMinimum: 5,
    lokasiRak: "",
    spesifikasi: "",
  });

  const [masterPage, setMasterPage] = useState(1);
  const [masukPage, setMasukPage] = useState(1);
  const [keluarPage, setKeluarPage] = useState(1);
  const [laporanPage, setLaporanPage] = useState(1);
  const [adminPage, setadminPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Fungsi Simpan/Edit Admin
  const handleSaveAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const url = editingAdmin ? `/api/admins/${editingAdmin.id}` : "/api/admins";
    const method = editingAdmin ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(adminForm),
      });
      const data = await res.json();
      if (data.success) {
        setIsAdminModalOpen(false);
        // Refresh table
        const refreshed = await fetch("/api/admins").then((r) => r.json());
        setAdminUsers(refreshed);
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("Gagal menyimpan akun admin");
    } finally {
      setIsSubmitting(false);
    }
  };

  //pagination 10/10
  const Pagination = ({
    current,
    total,
    onPageChange,
  }: {
    current: number;
    total: number;
    onPageChange: (p: number) => void;
  }) => {
    const maxPage = Math.ceil(total / ITEMS_PER_PAGE) || 1;
    if (total <= ITEMS_PER_PAGE) return null; // Sembunyikan jika tidak perlu pagination
    return (
      <div className="flex items-center justify-between p-4 bg-slate-50 border-t border-slate-200">
        <span className="text-xs text-slate-500">
          Halaman {current} dari {maxPage} (Total: {total} data)
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={current === 1}
            onClick={() => onPageChange(current - 1)}
            className="px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white disabled:opacity-50 hover:bg-slate-100"
          >
            Sebelumnya
          </button>
          <button
            type="button"
            disabled={current >= maxPage}
            onClick={() => onPageChange(current + 1)}
            className="px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white disabled:opacity-50 hover:bg-slate-100"
          >
            Selanjutnya
          </button>
        </div>
      </div>
    );
  };

  // Incoming Stock (Barang Masuk) Form State
  const [masukFormData, setMasukFormData] = useState({
    itemId: initialRestockItem ? initialRestockItem.id : items[0]?.id || "",
    jumlah: 10,
    tanggal: new Date().toISOString().split("T")[0],
    dicatatOleh: currentUser.namaLengkap,
    keterangan: "Penerimaan persediaan ATK kantor",
  });
  const [masukSuccessMessage, setMasukSuccessMessage] = useState<string | null>(
    null,
  );

  // Lightbox Photo Modal State
  const [previewPhoto, setPreviewPhoto] = useState<{
    url: string;
    nama: string;
    bidang: string;
    tanggal: string;
  } | null>(null);

  // Satker profile editing state
  const [satkerForm, setSatkerForm] = useState<PengaturanSatker>({ ...satker });
  const [satkerSavedNotice, setSatkerSavedNotice] = useState(false);

  // Calculated low stock items
  const lowStockItems = items.filter((i) => i.stok <= i.stokMinimum);
  const totalPhysicalStock = items.reduce((sum, i) => sum + i.stok, 0);

  // Calculate current period mutations
  const monthlyMutations: MutasiBarang[] = calculateMonthlyMutation(
    items,
    transaksiMasuk,
    transaksiKeluar,
    reportMonth,
    reportYear,
  );

  // Open item modal for creation
  const handleOpenCreateItem = () => {
    setEditingItem(null);
    setItemFormData({
      kodeBarang: `ATK-${Date.now().toString().slice(-4)}`,
      namaBarang: "",
      kategori: "Kertas & Buku",
      satuan: "Rim",
      stok: 10,
      stokMinimum: 5,
      lokasiRak: "",
      spesifikasi: "",
    });
    setIsItemModalOpen(true);
  };

  // Open item modal for edit
  const handleOpenEditItem = (item: ItemATK) => {
    setEditingItem(item);
    setItemFormData({
      kodeBarang: item.kodeBarang,
      namaBarang: item.namaBarang,
      kategori: item.kategori,
      satuan: item.satuan,
      stok: item.stok,
      stokMinimum: item.stokMinimum,
      lokasiRak: item.lokasiRak,
      spesifikasi: item.spesifikasi || "",
    });
    setIsItemModalOpen(true);
  };

  // Save Item (Create or Update)
  const handleSaveItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    if (!itemFormData.namaBarang.trim()) return;

    const saved: ItemATK = {
      id: editingItem
        ? editingItem.id
        : `atk-${Date.now().toString().slice(-6)}`,
      kodeBarang: itemFormData.kodeBarang.trim(),
      namaBarang: itemFormData.namaBarang.trim(),
      kategori: itemFormData.kategori,
      satuan: itemFormData.satuan.trim(),
      stok: Number(itemFormData.stok),
      stokMinimum: Number(itemFormData.stokMinimum),
      lokasiRak: itemFormData.lokasiRak.trim(),
      spesifikasi: itemFormData.spesifikasi.trim() || undefined,
      updatedAt: new Date().toISOString(),
    };

    onSaveItem(saved);
    setIsItemModalOpen(false);
    setIsSubmitting(false);
  };

  // Submit Incoming Stock
  const handleMasukSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const targetItem = items.find((i) => i.id === masukFormData.itemId);
    if (!targetItem) return;

    const tx: TransaksiMasuk = {
      id: `IN-${Date.now().toString().slice(-6)}`,
      itemId: targetItem.id,
      kodeBarang: targetItem.kodeBarang,
      namaBarang: targetItem.namaBarang,
      kategori: targetItem.kategori,
      satuan: targetItem.satuan,
      jumlah: Number(masukFormData.jumlah),
      tanggal: masukFormData.tanggal,
      dicatatOleh: masukFormData.dicatatOleh.trim(),
      keterangan: masukFormData.keterangan.trim(),
    };

    onAddMasuk(tx);
    setMasukSuccessMessage(
      `Berhasil menambahkan ${tx.jumlah} ${tx.satuan} untuk "${tx.namaBarang}".`,
    );
    setTimeout(() => setMasukSuccessMessage(null), 4000);
    setIsSubmitting(false);

    if (onClearInitialRestockItem) {
      onClearInitialRestockItem();
    }
  };

  // Save Satker profile
  const handleSaveSatkerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    onSaveSatker(satkerForm);
    setSatkerSavedNotice(true);
    setTimeout(() => setSatkerSavedNotice(false), 3000);
    setIsSubmitting(false);
  };

  // Filter items in master view
  const filteredMasterItems = items.filter((item) => {
    const matchCat =
      categoryFilter === "Semua" || item.kategori === categoryFilter;
    const matchQ =
      item.namaBarang.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.kodeBarang.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.lokasiRak.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.satuan.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchQ;
  });

  // Filter Riwayat Penerimaan Barang Masuk
  const filteredMasuk = transaksiMasuk.filter((trx) => {
    const formattedDate = trx.tanggal
      ? new Date(trx.tanggal)
          .toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })
          .toLowerCase()
      : "";

    const match =
      trx.namaBarang.toLowerCase().includes(searchMasuk.toLowerCase()) ||
      trx.kodeBarang.toLowerCase().includes(searchMasuk.toLowerCase()) ||
      trx.dicatatOleh.toLowerCase().includes(searchMasuk.toLowerCase()) ||
      formattedDate.includes(searchMasuk.toLowerCase());

    return match;
  });

  // Filter Log Transaksi Pengeluaran
  const filteredKeluar = transaksiKeluar.filter((trx) => {
    const matchBid = bidangFilter === "Semua" || trx.bidang === bidangFilter;

    const formattedDate = trx.tanggal
      ? new Date(trx.tanggal)
          .toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })
          .toLowerCase()
      : "";

    const match =
      trx.namaBarang.toLowerCase().includes(searchKeluar.toLowerCase()) ||
      trx.namaPengambil.toLowerCase().includes(searchKeluar.toLowerCase()) ||
      trx.keperluan.toLowerCase().includes(searchKeluar.toLowerCase()) ||
      formattedDate.includes(searchKeluar.toLowerCase());
    return matchBid && match;
  });

  // Filter Kelola Akses Administrator
  const filteredAdmins = adminUsers.filter((admin) => {
    const match =
      admin.username.toLowerCase().includes(searchAdmin.toLowerCase()) ||
      admin.role.toLowerCase().includes(searchAdmin.toLowerCase()) ||
      admin.status.toLowerCase().includes(searchAdmin.toLowerCase()) ||
      admin.namaLengkap.toLowerCase().includes(searchAdmin.toLowerCase());
    return match;
  });

  const paginatedMaster = filteredMasterItems.slice(
    (masterPage - 1) * ITEMS_PER_PAGE,
    masterPage * ITEMS_PER_PAGE,
  );
  const paginatedMasuk = filteredMasuk.slice(
    (masukPage - 1) * ITEMS_PER_PAGE,
    masukPage * ITEMS_PER_PAGE,
  );
  const paginatedKeluar = filteredKeluar.slice(
    (keluarPage - 1) * ITEMS_PER_PAGE,
    keluarPage * ITEMS_PER_PAGE,
  );
  const paginatedLaporan = monthlyMutations.slice(
    (laporanPage - 1) * ITEMS_PER_PAGE,
    laporanPage * ITEMS_PER_PAGE,
  );
  const paginatedAdmin = filteredAdmins.slice(
    (adminPage - 1) * ITEMS_PER_PAGE,
    adminPage * ITEMS_PER_PAGE,
  );

  return (
    <div className="space-y-6">
      {/* PRIORITY LOW STOCK ALERT BANNER (If items <= minimum) */}
      {lowStockItems.length > 0 && (
        <div className="bg-linear-to-r from-rose-900 via-rose-800 to-amber-900 border-2 border-rose-500/80 rounded-2xl p-5 text-white shadow-lg animate-in slide-in-from-top-2 duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-rose-950/80 rounded-xl text-rose-200 border border-rose-700/60 shrink-0">
                <AlertTriangle className="w-6 h-6 text-amber-300 animate-pulse" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-base tracking-tight">
                    PERINGATAN STOK MINIMUM OTOMATIS
                  </span>
                  <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-rose-950 text-amber-300 border border-rose-700 font-bold tabular-nums">
                    {lowStockItems.length} ITEM PERLU RESTOCK
                  </span>
                </div>
                <p className="text-xs text-rose-100 max-w-2xl leading-relaxed">
                  Terdapat barang ATK yang telah mencapai batas minimum
                  pengamanan persediaan dinas. Segera ajukan nota dinas
                  pengadaan atau catat penambahan stok masuk agar kegiatan
                  persidangan dan administrasi tidak terhambat.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => playAlertChime()}
                className="px-3 py-2 bg-slate-900/60 hover:bg-slate-900 text-rose-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-rose-700/60 transition-colors"
              >
                <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Bunyikan Lonceng</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (lowStockItems[0]) {
                    setMasukFormData((prev) => ({
                      ...prev,
                      itemId: lowStockItems[0].id,
                    }));
                  }
                  setActiveSubTab("masuk");
                }}
                className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <ArrowDownToLine className="w-3.5 h-3.5" />
                <span>Restock Cepat Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DASHBOARD TOP TABS NAVIGATION */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-1.5">
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveSubTab("ringkasan")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap ${
              activeSubTab === "ringkasan"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Ringkasan Dashboard</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab("master")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap ${
              activeSubTab === "master"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Master Data ATK</span>
            <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-200 tabular-nums">
              {items.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab("masuk")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap ${
              activeSubTab === "masuk"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <ArrowDownToLine className="w-4 h-4 text-emerald-500" />
            <span>Barang Masuk</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab("keluar")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap ${
              activeSubTab === "keluar"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <ArrowUpFromLine className="w-4 h-4 text-rose-500" />
            <span>Riwayat & Foto Pengambil</span>
            <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-200 tabular-nums">
              {transaksiKeluar.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab("laporan")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap ${
              activeSubTab === "laporan"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Laporan Bulanan</span>
          </button>

          {/* Hanya tampilkan untuk Superadmin */}
          {currentUser.role === "superadmin" && (
            <>
              <button
                type="button"
                onClick={() => setActiveSubTab("pengaturan")}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap ${
                  activeSubTab === "pengaturan"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Pengaturan Satker</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSubTab("manajemen-admin")}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap ${
                  activeSubTab === "manajemen-admin"
                    ? "bg-amber-600 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Manajemen Admin</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* SUBTAB 1: RINGKASAN OVERVIEW */}
      {activeSubTab === "ringkasan" && (
        <div className="space-y-6">
          {/* 4 Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Total Katalog ATK</span>
                <Package className="w-4 h-4 text-slate-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold font-mono text-slate-900 tabular-nums">
                  {items.length}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Jenis Barang
                </span>
              </div>
              <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 flex items-center justify-between">
                <span>Total Stok Fisik:</span>
                <strong className="font-mono text-slate-800">
                  {totalPhysicalStock} unit/satuan
                </strong>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Pengeluaran Bulan Ini</span>
                <ArrowUpFromLine className="w-4 h-4 text-rose-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold font-mono text-slate-900 tabular-nums">
                  {
                    transaksiKeluar.filter((t) => {
                      const d = new Date(t.tanggal);
                      return (
                        d.getMonth() === now.getMonth() &&
                        d.getFullYear() === now.getFullYear()
                      );
                    }).length
                  }
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Kali Pengambilan
                </span>
              </div>
              <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 flex items-center justify-between">
                <span>Total Transaksi Keluar:</span>
                <strong className="font-mono text-slate-800">
                  {transaksiKeluar.length} riwayat
                </strong>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Penerimaan Masuk</span>
                <ArrowDownToLine className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold font-mono text-slate-900 tabular-nums">
                  {transaksiMasuk.length}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Batch Droping
                </span>
              </div>
              <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 flex items-center justify-between">
                <span>Status:</span>
                <strong className="truncate max-w-35 text-slate-800">
                  Penambahan
                </strong>
              </div>
            </div>

            <div
              className={`p-5 rounded-xl border shadow-xs space-y-2 ${
                lowStockItems.length > 0
                  ? "bg-rose-50/70 border-rose-300 ring-1 ring-rose-200"
                  : "bg-white border-slate-200"
              }`}
            >
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Stok Di Bawah Minimum</span>
                <AlertTriangle
                  className={`w-4 h-4 ${lowStockItems.length > 0 ? "text-rose-600" : "text-slate-400"}`}
                />
              </div>
              <div className="flex items-baseline gap-2">
                <span
                  className={`text-3xl font-extrabold font-mono tabular-nums ${
                    lowStockItems.length > 0
                      ? "text-rose-700"
                      : "text-emerald-700"
                  }`}
                >
                  {lowStockItems.length}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Item Perlu Restock
                </span>
              </div>
              <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200 flex items-center justify-between">
                <span>Status Pengamanan:</span>
                <strong
                  className={
                    lowStockItems.length > 0
                      ? "text-rose-700"
                      : "text-emerald-700"
                  }
                >
                  {lowStockItems.length > 0
                    ? "Perlu Pengadaan Segera"
                    : "Semua Stok Aman"}
                </strong>
              </div>
            </div>
          </div>

          {/* Quick Actions & Recent Outgoing Logs with Photos */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Transaksi Pengambilan Terkini */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 sm:px-6 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Pengambilan ATK Terkini (Dengan Bukti Foto)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Verifikasi foto penerima barang yang tercatat otomatis
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveSubTab("keluar")}
                  className="text-xs font-semibold text-emerald-800 hover:underline"
                >
                  Lihat Semua
                </button>
              </div>

              <div className="divide-y divide-slate-100 overflow-x-auto">
                {transaksiKeluar.slice(0, 5).map((tx) => (
                  <div
                    key={tx.id}
                    className="p-4 sm:px-6 flex items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Photo Thumbnail */}
                      <button
                        type="button"
                        onClick={() =>
                          setPreviewPhoto({
                            url: tx.fotoPengambil,
                            nama: tx.namaPengambil,
                            bidang: tx.bidang,
                            tanggal: new Date(tx.tanggal).toLocaleString(
                              "id-ID",
                            ),
                          })
                        }
                        className="relative group shrink-0"
                        title="Klik untuk melihat foto resolusi penuh"
                      >
                        <img
                          src={tx.fotoPengambil}
                          alt={tx.namaPengambil}
                          className="w-12 h-12 rounded-lg object-cover border border-slate-200 group-hover:border-emerald-600 transition-colors"
                        />
                        <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Eye className="w-4 h-4 text-white" />
                        </div>
                      </button>

                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                            {tx.namaPengambil}
                          </span>
                          <span className="text-slate-400">·</span>
                          <span className="text-[11px] text-slate-500 truncate max-w-37.5">
                            {tx.bidang}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 truncate">
                          Mengambil{" "}
                          <strong>
                            {tx.jumlah} {tx.satuan}
                          </strong>{" "}
                          {tx.namaBarang}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Keperluan: {tx.keperluan}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-mono text-xs text-slate-500 block">
                        {new Date(tx.tanggal).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {new Date(tx.tanggal).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right 1 Col: Monitoring Stok Kritis */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-sm text-slate-900">
                  Daftar Stok Kritis ({lowStockItems.length})
                </h3>
                <span className="text-[11px] text-slate-400">
                  Ambang Batas Minimum
                </span>
              </div>

              {lowStockItems.length === 0 ? (
                <div className="py-8 text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <p className="text-xs font-semibold text-slate-800">
                    Semua Stok Aman
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Tidak ada barang yang memerlukan restock mendesak.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {lowStockItems.slice(0, 5).map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-lg border border-slate-200 bg-slate-50/70 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-mono text-slate-500 block">
                            {item.kodeBarang}
                          </span>
                          <h4 className="text-xs font-bold text-slate-800 leading-snug">
                            {item.namaBarang}
                          </h4>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs font-bold font-mono text-rose-700">
                            {item.stok} / {item.stokMinimum}
                          </span>
                          <span className="text-[10px] text-slate-500 block">
                            {item.satuan}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                        <span className="text-[11px] text-slate-500">
                          {item.lokasiRak}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setMasukFormData((prev) => ({
                              ...prev,
                              itemId: item.id,
                            }));
                            setActiveSubTab("masuk");
                          }}
                          className="text-[11px] font-bold text-emerald-800 hover:text-emerald-900"
                        >
                          + Tambah Stok
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: MASTER DATA ATK */}
      {activeSubTab === "master" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-5">
          {/* Header Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Master Data Alat Tulis Kantor (ATK)
              </h3>
              <p className="text-xs text-slate-500">
                Kelola katalog barang, lokasi penyimpanan rak, dan batas minimum
                pengingat stok
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenCreateItem}
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Barang Baru</span>
            </button>
          </div>

          {/* Search & Category Filter Bar */}
          <div className="flex flex-col md:flex-row gap-3 pt-2 border-t border-slate-100">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama barang, kode SKU, atau rak penyimpanan..."
                className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) =>
                setCategoryFilter(e.target.value as "Semua" | KategoriATK)
              }
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium text-slate-700"
            >
              <option value="Semua">Semua Kategori</option>
              {KATEGORI_LIST.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>

          {/* Master Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3 w-10 text-center">No</th>
                  <th className="py-3 px-3 w-28">Kode Barang</th>
                  <th className="py-3 px-4">Nama Barang & Spesifikasi</th>
                  <th className="py-3 px-3">Kategori</th>
                  <th className="py-3 px-3">Satuan</th>
                  <th className="py-3 px-3 text-right">Stok Fisik</th>
                  <th className="py-3 px-3 text-right">Batas Min</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Lokasi Rak</th>
                  <th className="py-3 px-3 text-center w-24">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {paginatedMaster.map((item, idx) => {
                  const isZero = item.stok <= 0;
                  const isLow = !isZero && item.stok <= item.stokMinimum;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-3 px-3 text-center font-mono text-slate-500">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-700">
                        {item.kodeBarang}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block">
                          {item.namaBarang}
                        </span>
                        {item.spesifikasi && (
                          <span className="text-[11px] text-slate-500 block">
                            {item.spesifikasi}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {item.kategori}
                      </td>
                      <td className="py-3 px-3 text-slate-600 font-medium">
                        {item.satuan}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-sm tabular-nums">
                        <span
                          className={
                            isZero
                              ? "text-rose-600"
                              : isLow
                                ? "text-amber-600"
                                : "text-emerald-700"
                          }
                        >
                          {item.stok}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-600 tabular-nums">
                        {item.stokMinimum}
                      </td>
                      <td className="py-3 px-3">
                        {isZero ? (
                          <span className="text-rose-600 font-bold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />{" "}
                            Habis
                          </span>
                        ) : isLow ? (
                          <span className="text-amber-600 font-semibold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />{" "}
                            Menipis
                          </span>
                        ) : (
                          <span className="text-emerald-700 font-medium flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />{" "}
                            Aman
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {item.lokasiRak || "-"}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEditItem(item)}
                            title="Edit Data Barang"
                            className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (
                                confirm(
                                  `Hapus barang "${item.namaBarang}" dari daftar inventaris?`,
                                )
                              ) {
                                onDeleteItem(item.id);
                              }
                            }}
                            title="Hapus Barang"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <Pagination
              current={masterPage}
              total={filteredMasterItems.length}
              onPageChange={setMasterPage}
            />
          </div>
        </div>
      )}

      {/* SUBTAB 3: PENERIMAAN BARANG MASUK (RESTOCK) */}
      {activeSubTab === "masuk" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Input Barang Masuk */}
          <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <ArrowDownToLine className="w-4 h-4 text-emerald-600" />
                <span>Form Input Barang Masuk (Restock)</span>
              </h3>
              <p className="text-xs text-slate-500">Penambahan persediaan</p>
            </div>

            {masukSuccessMessage && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{masukSuccessMessage}</span>
              </div>
            )}

            <form onSubmit={handleMasukSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">
                  Pilih Barang ATK *
                </label>
                <select
                  required
                  value={masukFormData.itemId}
                  onChange={(e) =>
                    setMasukFormData({
                      ...masukFormData,
                      itemId: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                >
                  {items.map((it) => (
                    <option key={it.id} value={it.id}>
                      {it.namaBarang} (Stok Saat Ini: {it.stok} {it.satuan})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">
                  Jumlah Penambahan *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={masukFormData.jumlah}
                  onChange={(e) =>
                    setMasukFormData({
                      ...masukFormData,
                      jumlah: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none font-mono font-bold"
                />
              </div>
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">
                  Tanggal Penerimaan *
                </label>
                <input
                  type="date"
                  required
                  value={masukFormData.tanggal}
                  onChange={(e) =>
                    setMasukFormData({
                      ...masukFormData,
                      tanggal: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">
                  Petugas Penerima
                </label>
                <input
                  type="text"
                  value={currentUser.namaLengkap}
                  onChange={(e) =>
                    setMasukFormData({
                      ...masukFormData,
                      dicatatOleh: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">
                  Keterangan Tambahan
                </label>
                <textarea
                  rows={2}
                  value={masukFormData.keterangan}
                  onChange={(e) =>
                    setMasukFormData({
                      ...masukFormData,
                      keterangan: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  placeholder="Keterangan kondisi kemasan/kelengkapan"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1.5 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {isSubmitting ? "Memproses..." : "Simpan Penerimaan Barang"}
                </span>
              </button>
            </form>
            <LoadingModal isOpen={isSubmitting} message="Menyimpan barang..." />
          </div>

          {/* Tabel Riwayat Penerimaan */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  Riwayat Penerimaan Barang Masuk ({transaksiMasuk.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Daftar transaksi penambahan stok persediaan barang ATK
                </p>
              </div>
            </div>

            {/* Search Filter Bar */}
            <div className="flex flex-col md:flex-row gap-3 pt-2 border-t border-slate-100">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchMasuk}
                  onChange={(e) => setSearchMasuk(e.target.value)}
                  placeholder="Cari nama barang, penerima atau kode barang..."
                  className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                />
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3 w-10 text-center">No</th>
                    <th className="py-2.5 px-3">Tanggal</th>
                    <th className="py-2.5 px-3">Nama Barang</th>
                    <th className="py-2.5 px-3 text-right">Jumlah Masuk</th>
                    <th className="py-2.5 px-3">Penerima</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {paginatedMasuk.map((t, idx) => (
                    <tr key={t.id} className="hover:bg-slate-50/80">
                      <td className="py-2.5 px-3 text-center font-mono text-slate-500">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-600 whitespace-nowrap">
                        {new Date(t.tanggal).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-bold text-slate-900 block">
                          {t.namaBarang}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400">
                          {t.kodeBarang}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-800 tabular-nums">
                        +{t.jumlah} {t.satuan}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">
                        {t.dicatatOleh}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Pagination
                current={masukPage}
                total={filteredMasuk.length}
                onPageChange={setMasukPage}
              />
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 4: RIWAYAT PENGELUARAN & GALERI FOTO PENGAMBIL */}
      {activeSubTab === "keluar" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Log Transaksi Pengeluaran ATK & Dokumentasi Foto
              </h3>
              <p className="text-xs text-slate-500">
                Pencatatan lengkap penerima barang dengan bukti foto
                selfie/webcam dan peruntukan seksi
              </p>
            </div>
            <div className="text-xs text-slate-500 font-mono">
              Total Pengambilan: <strong>{transaksiKeluar.length}</strong>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-3 pt-2 border-t border-slate-100">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchKeluar}
                onChange={(e) => setSearchKeluar(e.target.value)}
                placeholder="Cari nama barang atau penerima..."
                className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
              />
            </div>
            <select
              value={bidangFilter}
              onChange={(e) =>
                setBidangFilter(e.target.value as "Semua" | BidangKejaksaan)
              }
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium text-slate-700"
            >
              <option value="Semua">Semua Bidang</option>
              {BIDANG_LIST.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3 w-10 text-center">No</th>
                  <th className="py-3 px-3 text-center w-16">Foto</th>
                  <th className="py-3 px-3">Waktu & Tanggal</th>
                  <th className="py-3 px-4">Nama Pengambil & NIP</th>
                  <th className="py-3 px-3">Seksi / Bidang</th>
                  <th className="py-3 px-4">Barang ATK</th>
                  <th className="py-3 px-3 text-right">Jumlah</th>
                  <th className="py-3 px-4">Keperluan Penggunaan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {paginatedKeluar.map((tx, idx) => (
                  <tr
                    key={tx.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-2.5 px-3 text-center font-mono text-slate-500">
                      {idx + 1}
                    </td>
                    {/* Foto Thumbnail */}
                    <td className="py-3 px-3 text-center">
                      <button
                        type="button"
                        onClick={() =>
                          setPreviewPhoto({
                            url: tx.fotoPengambil,
                            nama: tx.namaPengambil,
                            bidang: tx.bidang,
                            tanggal: new Date(tx.tanggal).toLocaleString(
                              "id-ID",
                            ),
                          })
                        }
                        className="group relative inline-block"
                        title="Klik untuk perbesar foto"
                      >
                        <img
                          src={tx.fotoPengambil}
                          alt={tx.namaPengambil}
                          className="w-10 h-10 rounded-lg object-cover border border-slate-300 group-hover:ring-2 group-hover:ring-emerald-600 transition-all"
                        />
                        <div className="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Eye className="w-3.5 h-3.5 text-white" />
                        </div>
                      </button>
                    </td>

                    {/* Timestamp */}
                    <td className="py-3 px-3 font-mono text-slate-600 whitespace-nowrap">
                      <div>
                        {new Date(tx.tanggal).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(tx.tanggal).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </td>

                    {/* Nama Pengambil */}
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 block">
                        {tx.namaPengambil}
                      </span>
                      {tx.nipPengambil && (
                        <span className="font-mono text-[11px] text-slate-500 block">
                          NIP: {tx.nipPengambil}
                        </span>
                      )}
                    </td>

                    {/* Bidang */}
                    <td className="py-3 px-3">
                      <span className="text-slate-800 font-medium block">
                        {tx.bidang}
                      </span>
                    </td>

                    {/* Barang */}
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-900 block">
                        {tx.namaBarang}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400">
                        {tx.kodeBarang}
                      </span>
                    </td>

                    {/* Jumlah */}
                    <td className="py-3 px-3 text-right font-mono font-bold text-rose-700 text-sm tabular-nums">
                      -{tx.jumlah} {tx.satuan}
                    </td>

                    {/* Keperluan */}
                    <td className="py-3 px-4 text-slate-600 max-w-xs">
                      {tx.keperluan}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination
              current={keluarPage}
              total={filteredKeluar.length}
              onPageChange={setKeluarPage}
            />
          </div>
        </div>
      )}

      {/* SUBTAB 5: LAPORAN BULANAN & EKSPOR (EXCEL & CETAK PDF) */}
      {activeSubTab === "laporan" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Laporan Bulanan Mutasi Persediaan ATK (BMN)
              </h3>
              <p className="text-xs text-slate-500">
                Rekapitulasi stok awal, penerimaan pengadaan, pemakaian keluar,
                dan sisa stok akhir
              </p>
            </div>

            {/* Filter Periode Bulan & Tahun */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
                <Calendar className="w-4 h-4 text-slate-500 ml-1.5" />
                <select
                  value={reportMonth}
                  onChange={(e) => setReportMonth(Number(e.target.value))}
                  className="text-xs font-semibold bg-transparent border-0 focus:ring-0 text-slate-800 pr-2"
                >
                  {NAMA_BULAN.map((m, idx) => (
                    <option key={m} value={idx}>
                      {m}
                    </option>
                  ))}
                </select>

                <select
                  value={reportYear}
                  onChange={(e) => setReportYear(Number(e.target.value))}
                  className="text-xs font-semibold bg-transparent border-0 focus:ring-0 text-slate-800 pr-2 font-mono"
                >
                  {[2024, 2025, 2026, 2027].map((yr) => (
                    <option key={yr} value={yr}>
                      {yr}
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Buttons: Export Excel and Print PDF */}
              <button
                type="button"
                onClick={() =>
                  exportMonthlyReportToExcel(
                    monthlyMutations,
                    transaksiKeluar,
                    reportMonth,
                    reportYear,
                    satker,
                  )
                }
                className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow-xs transition-colors whitespace-nowrap"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
                <span>Unduh Excel (.xlsx)</span>
              </button>

              <button
                type="button"
                onClick={() => setIsPrintModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs shadow-xs transition-colors whitespace-nowrap"
              >
                <Printer className="w-4 h-4 text-amber-400" />
                <span>Cetak PDF</span>
              </button>
            </div>
          </div>

          {/* Laporan Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3 w-10 text-center">No</th>
                  <th className="py-3 px-3 w-28">Kode Barang</th>
                  <th className="py-3 px-4">Nama Barang</th>
                  <th className="py-3 px-3">Satuan</th>
                  <th className="py-3 px-3 text-right">Stok Awal</th>
                  <th className="py-3 px-3 text-right">Masuk</th>
                  <th className="py-3 px-3 text-right">Keluar</th>
                  <th className="py-3 px-3 text-right">Sisa Akhir</th>
                  <th className="py-3 px-3">Status Fisik</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {paginatedLaporan.map((m, idx) => (
                  <tr key={m.item.id} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-3 text-center font-mono text-slate-500">
                      {idx + 1}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-medium text-slate-600">
                      {m.item.kodeBarang}
                    </td>
                    <td className="py-2.5 px-4 font-bold text-slate-900">
                      {m.item.namaBarang}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {m.item.satuan}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-700">
                      {m.stokAwal}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-emerald-700 tabular-nums">
                      {m.totalMasuk > 0 ? `+${m.totalMasuk}` : "-"}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-rose-700 tabular-nums">
                      {m.totalKeluar > 0 ? `-${m.totalKeluar}` : "-"}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-extrabold text-sm tabular-nums text-slate-900">
                      {m.stokAkhir}
                    </td>
                    <td className="py-2.5 px-3">
                      {m.stokAkhir <= 0 ? (
                        <span className="text-rose-600 font-bold">Habis</span>
                      ) : m.stokAkhir <= m.item.stokMinimum ? (
                        <span className="text-amber-600 font-semibold">
                          Menipis
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-medium">
                          Tersedia Baik
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination
              current={laporanPage}
              total={monthlyMutations.length}
              onPageChange={setLaporanPage}
            />
          </div>
        </div>
      )}

      {/* SUBTAB 6: PENGATURAN SATKER & PROFIL KANTOR */}
      {activeSubTab === "pengaturan" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Pengaturan Identitas Satuan Kerja & Pejabat Penandatangan
              </h3>
              <p className="text-xs text-slate-500">
                Data ini akan tercetak otomatis pada Kop Surat dan Laporan
                Bulanan
              </p>
            </div>
            {satkerSavedNotice && (
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Pengaturan Tersimpan
              </span>
            )}
          </div>

          <form
            onSubmit={handleSaveSatkerSubmit}
            className="space-y-6 text-xs max-w-3xl"
          >
            {/* Satker identity */}
            <div className="space-y-4">
              <h4 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                <Building className="w-4 h-4 text-emerald-800" />
                <span>Identitas Kantor Kejaksaan</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">
                    Nama Satuan Kerja Kejaksaan *
                  </label>
                  <input
                    type="text"
                    required
                    value={satkerForm.namaKejari}
                    onChange={(e) =>
                      setSatkerForm({
                        ...satkerForm,
                        namaKejari: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none font-bold"
                    placeholder="KEJAKSAAN NEGERI KOTA MALANG"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">
                    Instansi Induk (Kejati) *
                  </label>
                  <input
                    type="text"
                    required
                    value={satkerForm.instansiInduk}
                    onChange={(e) =>
                      setSatkerForm({
                        ...satkerForm,
                        instansiInduk: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    placeholder="KEJAKSAAN TINGGI JAWA TIMUR"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="font-semibold text-slate-700">
                    Alamat Lengkap Kantor *
                  </label>
                  <input
                    type="text"
                    required
                    value={satkerForm.alamat}
                    onChange={(e) =>
                      setSatkerForm({ ...satkerForm, alamat: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">
                    Kota / Kabupaten *
                  </label>
                  <input
                    type="text"
                    required
                    value={satkerForm.kota}
                    onChange={(e) =>
                      setSatkerForm({ ...satkerForm, kota: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Pejabat Penandatangan */}
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <h4 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-emerald-800" />
                <span>Pejabat Penandatangan Laporan Mutasi ATK</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
                {/* Kasubbag Pembinaan */}
                <div className="space-y-3">
                  <span className="font-bold text-slate-900 block border-b pb-1 border-slate-200">
                    Atasan Langsung (Mengetahui)
                  </span>
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-700">
                      Jabatan
                    </label>
                    <input
                      type="text"
                      value={satkerForm.jabatanKasubbag}
                      onChange={(e) =>
                        setSatkerForm({
                          ...satkerForm,
                          jabatanKasubbag: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-700">
                      Nama Pejabat & Gelar
                    </label>
                    <input
                      type="text"
                      value={satkerForm.namaKasubbag}
                      onChange={(e) =>
                        setSatkerForm({
                          ...satkerForm,
                          namaKasubbag: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none font-bold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-700">NIP</label>
                    <input
                      type="text"
                      value={satkerForm.nipKasubbag}
                      onChange={(e) =>
                        setSatkerForm({
                          ...satkerForm,
                          nipKasubbag: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                {/* Pengelola ATK / BMN */}
                <div className="space-y-3">
                  <span className="font-bold text-slate-900 block border-b pb-1 border-slate-200">
                    Petugas Pembuat Laporan
                  </span>
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-700">
                      Jabatan
                    </label>
                    <input
                      type="text"
                      value={satkerForm.jabatanPengelola}
                      onChange={(e) =>
                        setSatkerForm({
                          ...satkerForm,
                          jabatanPengelola: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-700">
                      Nama Pengelola ATK
                    </label>
                    <input
                      type="text"
                      value={satkerForm.namaPengelola}
                      onChange={(e) =>
                        setSatkerForm({
                          ...satkerForm,
                          namaPengelola: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none font-bold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-700">NIP</label>
                    <input
                      type="text"
                      value={satkerForm.nipPengelola}
                      onChange={(e) =>
                        setSatkerForm({
                          ...satkerForm,
                          nipPengelola: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow-xs flex items-center gap-2 transition-colors ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}"
              >
                <Save className="w-4 h-4" />
                <span>
                  {isSubmitting ? "Memproses..." : "Simpan Perubahan Satker"}
                </span>
              </button>
            </div>
          </form>
          <LoadingModal isOpen={isSubmitting} message="Menyimpan..." />
        </div>
      )}

      {/* SUBTAB 7: MANAJEMEN ADMIN (KHUSUS SUPERADMIN) */}
      {activeSubTab === "manajemen-admin" &&
        currentUser.role === "superadmin" && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Kelola Akses Administrator
                </h3>
                <p className="text-xs text-slate-500">
                  Tambah atau ubah pengguna yang dapat masuk ke dashboard (Admin
                  BMN).
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingAdmin(null);
                  setAdminForm({ role: "admin", status: "aktif" });
                  setIsAdminModalOpen(true);
                }}
                className="px-4 py-2 bg-emerald-800 text-white text-xs font-bold rounded-lg flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Tambah Akun Baru
              </button>
            </div>

            {/* Search Filter Bar */}
            <div className="flex flex-col md:flex-row gap-3 pt-2 border-t border-slate-100">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchAdmin}
                  onChange={(e) => setSearchAdmin(e.target.value)}
                  placeholder="Cari nama, username, level, atau status..."
                  className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                />
              </div>
            </div>

            {isAdminUsersLoading ? (
              <div className="p-4">
                <TableSkeleton rows={4} cols={6} />
              </div>
            ) : (
              <>
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-3 w-10 text-center">No</th>
                      <th className="py-3 px-3">Username</th>
                      <th className="py-3 px-3">Nama Lengkap</th>
                      <th className="py-3 px-3">Level Akses</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedAdmin.map((adm, idx) => (
                      <tr key={adm.id} className="border-b border-slate-100">
                        <td className="py-2.5 px-3 text-center font-mono text-slate-500">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-800">
                          {adm.username}
                        </td>
                        <td className="py-3 px-3">{adm.namaLengkap}</td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-1 rounded-md ${adm.role === "superadmin" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-800"}`}
                          >
                            {adm.role.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={
                              adm.status === "aktif"
                                ? "text-emerald-600 font-bold"
                                : "text-rose-600"
                            }
                          >
                            {adm.status === "aktif" ? "Aktif" : "Nonaktif"}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => {
                              setEditingAdmin(adm);
                              setAdminForm({ ...adm, password: "" });
                              setIsAdminModalOpen(true);
                            }}
                            className="text-emerald-700 hover:bg-emerald-50 p-1.5 rounded-md"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {adm.id !== currentUser.id && (
                            <button
                              onClick={async () => {
                                if (confirm("Hapus akun ini?")) {
                                  await fetch(`/api/admins/${adm.id}`, {
                                    method: "DELETE",
                                  });
                                  setAdminUsers((prev) =>
                                    prev.filter((a) => a.id !== adm.id),
                                  );
                                }
                              }}
                              className="text-rose-600 hover:bg-rose-50 p-1.5 rounded-md ml-2"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <Pagination
                  current={adminPage}
                  total={filteredAdmins.length}
                  onPageChange={setadminPage}
                />
              </>
            )}
          </div>
        )}

      {/* MODAL CRUD MASTER ITEM */}
      {isItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
              <h3 className="font-bold text-sm text-white">
                {editingItem
                  ? "Edit Data Barang ATK"
                  : "Tambah Barang ATK Baru"}
              </h3>
              <button
                type="button"
                onClick={() => setIsItemModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={handleSaveItemSubmit}
              className="p-6 space-y-4 text-xs"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">
                    Kode Barang / SKU *
                  </label>
                  <input
                    type="text"
                    required
                    value={itemFormData.kodeBarang}
                    onChange={(e) =>
                      setItemFormData({
                        ...itemFormData,
                        kodeBarang: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none font-mono"
                    placeholder="ATK-KRT-001"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">
                    Kategori *
                  </label>
                  <select
                    value={itemFormData.kategori}
                    onChange={(e) =>
                      setItemFormData({
                        ...itemFormData,
                        kategori: e.target.value as KategoriATK,
                      })
                    }
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  >
                    {KATEGORI_LIST.map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">
                  Nama Barang ATK *
                </label>
                <input
                  type="text"
                  required
                  value={itemFormData.namaBarang}
                  onChange={(e) =>
                    setItemFormData({
                      ...itemFormData,
                      namaBarang: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none font-bold"
                  placeholder="Kertas HVS F4 75gr SIDU"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">
                    Satuan *
                  </label>
                  <input
                    type="text"
                    required
                    value={itemFormData.satuan}
                    onChange={(e) =>
                      setItemFormData({
                        ...itemFormData,
                        satuan: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    placeholder="Rim, Kotak, Pcs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">
                    Stok Saat Ini
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={itemFormData.stok}
                    onChange={(e) =>
                      setItemFormData({
                        ...itemFormData,
                        stok: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none font-mono font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">
                    Batas Min *
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={itemFormData.stokMinimum}
                    onChange={(e) =>
                      setItemFormData({
                        ...itemFormData,
                        stokMinimum: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none font-mono text-amber-700 font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">
                  Lokasi Rak / Penyimpanan
                </label>
                <input
                  type="text"
                  value={itemFormData.lokasiRak}
                  onChange={(e) =>
                    setItemFormData({
                      ...itemFormData,
                      lokasiRak: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  placeholder="Gudang ATK - Rak B1"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">
                  Spesifikasi Detail (Opsional)
                </label>
                <textarea
                  rows={2}
                  value={itemFormData.spesifikasi}
                  onChange={(e) =>
                    setItemFormData({
                      ...itemFormData,
                      spesifikasi: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  placeholder="75 gsm, Warna Hitam, Isi 12 pcs"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsItemModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-xs ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}"
                >
                  {editingItem ? "Simpan Perubahan" : "Tambahkan Barang"}
                </button>
              </div>
            </form>
            <LoadingModal
              isOpen={isSubmitting}
              message={editingItem ? "Simpan Perubahan" : "Tambahkan Barang"}
            />
          </div>
        </div>
      )}

      {isAdminModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
            <div className="bg-slate-900 text-white p-4 flex justify-between">
              <h3 className="font-bold">
                {editingAdmin ? "Edit Akun Admin" : "Tambah Akun Admin Baru"}
              </h3>
              <button onClick={() => setIsAdminModalOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveAdmin} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-semibold block mb-1">Username *</label>
                <input
                  required
                  type="text"
                  value={adminForm.username || ""}
                  onChange={(e) =>
                    setAdminForm({ ...adminForm, username: e.target.value })
                  }
                  className="w-full border p-2 rounded-lg"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  value={adminForm.namaLengkap || ""}
                  onChange={(e) =>
                    setAdminForm({ ...adminForm, namaLengkap: e.target.value })
                  }
                  className="w-full border p-2 rounded-lg"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">
                  Password{" "}
                  {editingAdmin && "(Isi hanya jika ingin mengubah password)"}
                </label>
                <input
                  type={editingAdmin ? "text" : "password"}
                  required={!editingAdmin}
                  value={adminForm.password}
                  onChange={(e) =>
                    setAdminForm({ ...adminForm, password: e.target.value })
                  }
                  className="w-full border p-2 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold block mb-1">Role</label>
                  <select
                    value={adminForm.role}
                    onChange={(e) =>
                      setAdminForm({
                        ...adminForm,
                        role: e.target.value as any,
                      })
                    }
                    className="w-full border p-2 rounded-lg"
                  >
                    <option value="admin">Admin Biasa</option>
                    <option value="superadmin">Superadmin</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1">Status</label>
                  <select
                    value={adminForm.status}
                    onChange={(e) =>
                      setAdminForm({
                        ...adminForm,
                        status: e.target.value as any,
                      })
                    }
                    className="w-full border p-2 rounded-lg"
                  >
                    <option value="aktif">Aktif</option>
                    <option value="nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-emerald-800 text-white py-2 rounded-lg font-bold ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}"
              >
                {isSubmitting ? "Memproses..." : "Simpan Akun"}
              </button>
            </form>
            <LoadingModal isOpen={isSubmitting} message="Menyimpan akun..." />
          </div>
        </div>
      )}

      {/* LIGHTBOX PREVIEW FOTO PENGAMBIL */}
      {previewPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Image className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-xs text-white">
                  Dokumentasi Bukti Pengambilan ATK
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewPhoto(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-slate-950 flex justify-center">
              <img
                src={previewPhoto.url}
                alt={previewPhoto.nama}
                className="max-h-[60vh] rounded-lg object-contain border border-slate-800"
              />
            </div>

            <div className="p-4 bg-white text-xs space-y-1">
              <div className="flex justify-between items-baseline">
                <span className="font-bold text-slate-900 text-sm">
                  {previewPhoto.nama}
                </span>
                <span className="font-mono text-slate-500 text-[11px]">
                  {previewPhoto.tanggal}
                </span>
              </div>
              <p className="text-slate-600">{previewPhoto.bidang}</p>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setPreviewPhoto(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-lg transition-colors"
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRINT REPORT MODAL */}
      <PrintReportModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        mutasiList={monthlyMutations}
        selectedMonth={reportMonth}
        selectedYear={reportYear}
        satker={satker}
        onExportExcel={() =>
          exportMonthlyReportToExcel(
            monthlyMutations,
            transaksiKeluar,
            reportMonth,
            reportYear,
            satker,
          )
        }
      />
    </div>
  );
};
