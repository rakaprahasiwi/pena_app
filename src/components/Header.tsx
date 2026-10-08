/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { KejaksaanLogo } from './KejaksaanLogo';
import { Bell, Volume2, VolumeX, ShieldCheck, LogOut, ArrowRight, PackageOpen } from 'lucide-react';
import { AdminUser, PengaturanSatker } from '../types';

interface HeaderProps {
  currentTab: 'kiosk' | 'admin';
  setCurrentTab: (tab: 'kiosk' | 'admin') => void;
  isAdminLoggedIn: boolean;
  onOpenLoginModal: () => void;
  onAdminLogout: () => void;
  lowStockCount: number;
  onOpenLowStockModal: () => void;
  isAudioMuted: boolean;
  onToggleAudioMute: () => void;
  satker: PengaturanSatker;
  currentUser: AdminUser | null;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  isAdminLoggedIn,
  onOpenLoginModal,
  onAdminLogout,
  lowStockCount,
  onOpenLowStockModal,
  isAudioMuted,
  onToggleAudioMute,
  satker,
  currentUser
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-emerald-900/60 shadow-md text-white no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Brand Wordmark & Official Identity */}
          <div className="flex items-center gap-3 min-w-0">
            <KejaksaanLogo size={40} />
            <div className="truncate">
              <div className="flex items-center gap-2">
                <span className="font-bold text-base sm:text-lg tracking-tight text-white whitespace-nowrap">
                  PENA
                </span>
                <span className="hidden md:inline text-xs text-amber-400 font-medium px-1.5 py-0.5 rounded bg-amber-400/10 border border-amber-400/20">
                  {satker.namaKejari}
                </span>
              </div>
              <p className="text-[11px] text-emerald-300/80 truncate hidden sm:block">
                Sistem Pencatatan Inventarisasi ATK
              </p>
            </div>
          </div>

          {/* Zone 2: Navigation Switcher between Kiosk Mode & Admin Dashboard */}
          <nav className="flex items-center bg-slate-800/90 p-1 rounded-lg border border-slate-700">
            <button
              type="button"
              onClick={() => setCurrentTab('kiosk')}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-all whitespace-nowrap ${currentTab === 'kiosk'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                }`}
            >
              <PackageOpen className="w-4 h-4" />
              <span>Kiosk Pengambilan ATK</span>
              <span className="hidden lg:inline text-[10px] text-emerald-200/90 font-normal">
                (Publik)
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (isAdminLoggedIn) {
                  setCurrentTab('admin');
                } else {
                  onOpenLoginModal();
                }
              }}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-all whitespace-nowrap ${currentTab === 'admin'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Dashboard Admin</span>
              {isAdminLoggedIn ? (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              ) : (
                <span className="hidden lg:inline text-[10px] text-slate-400">
                  (Perlu Login)
                </span>
              )}
            </button>
          </nav>

          {/* Zone 3: Primary Actions (Audio Mute, Low Stock Alert, Admin Auth) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Audio chime mute toggle */}
            <button
              type="button"
              onClick={onToggleAudioMute}
              title={isAudioMuted ? 'Aktifkan Suara Peringatan' : 'Bisukan Suara Peringatan'}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-700"
            >
              {isAudioMuted ? (
                <VolumeX className="w-4 h-4 text-slate-500" />
              ) : (
                <Volume2 className="w-4 h-4 text-emerald-400" />
              )}
            </button>

            {/* Low stock alert badge & notification trigger */}
            <button
              type="button"
              onClick={onOpenLowStockModal}
              title={`${lowStockCount} barang mencapai batas minimum stok`}
              className={`relative p-2 rounded-lg transition-colors border ${lowStockCount > 0
                ? 'text-rose-300 bg-rose-950/40 border-rose-800 hover:bg-rose-900/60'
                : 'text-slate-400 hover:text-white bg-slate-800/60 border-slate-700'
                }`}
            >
              <Bell className="w-4 h-4" />
              {lowStockCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white ring-2 ring-slate-900 tabular-nums">
                  {lowStockCount}
                </span>
              )}
            </button>

            {/* Admin session button */}
            {isAdminLoggedIn ? (
              <div className="flex items-center gap-2 pl-1 border-l border-slate-700">
                <span className="hidden xl:inline text-xs text-emerald-300 font-medium truncate max-w-[120px]">
                  {currentUser?.namaLengkap || "Admin"}
                </span>
                <button
                  type="button"
                  onClick={onAdminLogout}
                  title="Keluar dari sesi Admin"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-200 bg-rose-950/60 border border-rose-800/80 rounded-lg hover:bg-rose-900 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenLoginModal}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition-colors whitespace-nowrap"
              >
                <span>Login Admin</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
