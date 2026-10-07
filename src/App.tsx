/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ItemATK,
  TransaksiMasuk,
  TransaksiKeluar,
  PengaturanSatker,
  AdminUser,
} from './types';
import {
  getStoredItems,
  saveSingleItem,
  deleteStoredItem,
  getStoredTransaksiMasuk,
  addStoredTransaksiMasuk,
  getStoredTransaksiKeluar,
  addStoredTransaksiKeluar,
  getStoredSatker,
  saveStoredSatker,
  resetAllDataToDefault,
} from './utils/storage';
import { playAlertChime, getAudioMuted, setAudioMuted } from './utils/audioAlert';
import { Header } from './components/Header';
import { KioskPengambilan } from './components/KioskPengambilan';
import { DashboardAdmin } from './components/DashboardAdmin';
import { LoginModal } from './components/LoginModal';
import { LowStockAlertModal } from './components/LowStockAlertModal';
import { KejaksaanLogo } from './components/KejaksaanLogo';
import { AlertTriangle, CheckCircle2, Volume2, Shield } from 'lucide-react';

export default function App() {
  const [items, setItems] = useState<ItemATK[]>([]);
  const [transaksiMasuk, setTransaksiMasuk] = useState<TransaksiMasuk[]>([]);
  const [transaksiKeluar, setTransaksiKeluar] = useState<TransaksiKeluar[]>([]);
  const [satker, setSatker] = useState<PengaturanSatker | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Current main view tab: 'kiosk' (Public / No login) or 'admin' (Admin Dashboard)
  const [currentTab, setCurrentTab] = useState<'kiosk' | 'admin'>('kiosk');

  // Admin authentication state
  const [loggedInUser, setLoggedInUser] = useState<AdminUser | null>(() => {
    const saved = localStorage.getItem('sim_atk_current_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const isAdminLoggedIn = loggedInUser !== null;

  // Audio mute state
  const [isAudioMuted, setIsAudioMutedState] = useState<boolean>(() => getAudioMuted());

  // Low stock modal state
  const [isLowStockModalOpen, setIsLowStockModalOpen] = useState(false);

  // Quick restock target item when navigating from alert modal
  const [initialRestockItem, setInitialRestockItem] = useState<ItemATK | null>(null);

  // Toast notification state
  const [toast, setToast] = useState<{ type: 'success' | 'alert'; message: string } | null>(null);

  // Refresh data on mount
  const loadSemuaData = async () => {
    try {
      const [resItems, resMasuk, resKeluar, resSatker] = await Promise.all([
        fetch('http://localhost:3001/api/items').then(r => r.json()),
        fetch('http://localhost:3001/api/masuk').then(r => r.json()),
        fetch('http://localhost:3001/api/keluar').then(r => r.json()),
        fetch('http://localhost:3001/api/satker').then(r => r.json()),
      ]);
      setItems(resItems);
      setTransaksiMasuk(resMasuk);
      setTransaksiKeluar(resKeluar);
      setSatker(resSatker);
    } catch (error) {
      console.error("Gagal terhubung ke database", error);
      showToast('alert', 'Gagal terhubung ke database server.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSemuaData();
  }, []);

  // Calculate low stock items
  const lowStockItems = items.filter((item) => item.stok <= item.stokMinimum);

  const showToast = (type: 'success' | 'alert', message: string) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Toggle audio mute
  const handleToggleAudioMute = () => {
    const nextState = !isAudioMuted;
    setIsAudioMutedState(nextState);
    setAudioMuted(nextState);
    if (!nextState) {
      playAlertChime();
      showToast('success', 'Suara peringatan lonceng diaktifkan.');
    } else {
      showToast('alert', 'Suara peringatan lonceng dibisukan.');
    }
  };

  // Admin Login success
  const handleAdminLoginSuccess = (user: AdminUser) => {
    setLoggedInUser(user);
    localStorage.setItem('sim_atk_current_user', JSON.stringify(user));
    setCurrentTab('admin');
    showToast('success', `Berhasil login sebagai ${user.namaLengkap} (${user.role}).`);
  };

  // Admin Logout
  const handleAdminLogout = () => {
    setLoggedInUser(null);
    localStorage.removeItem('sim_atk_current_user');
    setCurrentTab('kiosk');
    showToast('alert', 'Telah keluar dari sesi Dashboard.');
  };

  // Handle Taking ATK (Public Kiosk)
  const handleTakeItem = async (tx: TransaksiKeluar) => {
    try {
      const res = await fetch('http://localhost:3001/api/keluar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tx)
      });
      const data = await res.json();

      if (data.success) {
        // Refresh data dari DB
        await loadSemuaData();

        if (data.isLowStockNow) {
          playAlertChime();
          showToast('alert', `PERINGATAN: Stok "${tx.namaBarang}" kini mencapai batas minimum!`);
        } else {
          showToast('success', `Pengambilan ${tx.jumlah} ${tx.satuan} berhasil dicatat.`);
        }
      }
      return data; // { success: true/false, message?, isLowStockNow? }
    } catch (e) {
      return { success: false, message: 'Koneksi ke server terputus.' };
    }
  };

  // CRUD Item Handlers
  const handleSaveItem = async (item: ItemATK) => {
    await fetch('http://localhost:3001/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    await loadSemuaData();
    showToast('success', `Data barang "${item.namaBarang}" berhasil disimpan ke Database.`);
  };

  const handleDeleteItem = async (id: string) => {
    await fetch(`http://localhost:3001/api/items/${id}`, { method: 'DELETE' });
    await loadSemuaData();
    showToast('alert', 'Barang berhasil dihapus dari database.');
  };

  // Add Incoming Stock (Barang Masuk)
  const handleAddMasuk = async (tx: TransaksiMasuk) => {
    await fetch('http://localhost:3001/api/masuk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tx)
    });
    await loadSemuaData();
    showToast('success', `Penerimaan stok masuk berhasil disimpan.`);
  };

  // Save Satker Profile
  const handleSaveSatker = async (newSatker: PengaturanSatker) => {
    await fetch('http://localhost:3001/api/satker', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSatker)
    });
    setSatker(newSatker);
    showToast('success', 'Identitas Satker berhasil diperbarui di database.');
  };

  // Reset Demo Data
  const handleResetData = () => {
    resetAllDataToDefault();
    setItems(getStoredItems());
    setTransaksiMasuk(getStoredTransaksiMasuk());
    setTransaksiKeluar(getStoredTransaksiKeluar());
    setSatker(getStoredSatker());
    showToast('success', 'Semua data contoh berhasil dikembalikan ke default.');
  };

  // Quick Restock from Low Stock Alert Modal
  const handleQuickRestock = (item: ItemATK) => {
    setInitialRestockItem(item);
    if (!isAdminLoggedIn) {
      setIsLoginModalOpen(true);
    } else {
      setCurrentTab('admin');
    }
  };

  // Tampilkan loading screen sementara data MySQL ditarik
  if (isLoading || !satker) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50">Memuat Sistem Database MySQL...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      {/* Top Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        isAdminLoggedIn={isAdminLoggedIn}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onAdminLogout={handleAdminLogout}
        lowStockCount={lowStockItems.length}
        onOpenLowStockModal={() => setIsLowStockModalOpen(true)}
        isAudioMuted={isAudioMuted}
        onToggleAudioMute={handleToggleAudioMute}
        satker={satker}
      />

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 max-w-md animate-in slide-in-from-bottom-5 duration-200">
          <div
            className={`p-4 rounded-xl shadow-xl border flex items-start gap-3 ${toast.type === 'alert'
              ? 'bg-rose-900 text-white border-rose-700'
              : 'bg-emerald-900 text-white border-emerald-700'
              }`}
          >
            {toast.type === 'alert' ? (
              <AlertTriangle className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0 mt-0.5" />
            )}
            <div className="text-xs leading-relaxed font-medium">
              {toast.message}
            </div>
          </div>
        </div>
      )}

      {/* Main Viewport Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentTab === 'kiosk' ? (
          <KioskPengambilan items={items} onTakeItem={handleTakeItem} />
        ) : isAdminLoggedIn ? (
          <DashboardAdmin
            items={items}
            transaksiMasuk={transaksiMasuk}
            transaksiKeluar={transaksiKeluar}
            satker={satker}
            currentUser={loggedInUser}
            onSaveItem={handleSaveItem}
            onDeleteItem={handleDeleteItem}
            onAddMasuk={handleAddMasuk}
            onSaveSatker={handleSaveSatker}
            onResetData={handleResetData}
            initialRestockItem={initialRestockItem}
            onClearInitialRestockItem={() => setInitialRestockItem(null)}
          />
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center max-w-md mx-auto space-y-4 my-12">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto border border-amber-200">
              <Shield className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Akses Khusus Administrator BMN
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Halaman ini diperuntukkan bagi Pengelola Barang Milik Negara (BMN) dan Urusan Perlengkapan
              Kejaksaan Negeri untuk mengelola master data, barang masuk, dan laporan bulanan dinas.
            </p>
            <button
              type="button"
              onClick={() => setIsLoginModalOpen(true)}
              className="w-full py-2.5 px-4 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow-xs transition-colors"
            >
              Masuk dengan Akun Admin
            </button>
          </div>
        )}
      </main>

      {/* Footer Official */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <KejaksaanLogo size={24} />
            <span className="font-semibold text-slate-700">
              SIM-ATK Kejaksaan Negeri · Subbagian Pembinaan
            </span>
          </div>
          <p className="text-slate-400 text-[11px]">
            Sistem Informasi Mutasi & Persediaan Barang Milik Negara (BMN)
          </p>
        </div>
      </footer>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccessLogin={handleAdminLoginSuccess} // Sekarang menerima user object
      />

      {/* Low Stock Alert Modal */}
      <LowStockAlertModal
        isOpen={isLowStockModalOpen}
        onClose={() => setIsLowStockModalOpen(false)}
        lowStockItems={lowStockItems}
        onQuickRestock={handleQuickRestock}
      />
    </div>
  );
}
