/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ItemATK } from '../types';
import { AlertTriangle, Bell, PlusCircle, X, Volume2, CheckCircle2 } from 'lucide-react';
import { playAlertChime } from '../utils/audioAlert';

interface LowStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  lowStockItems: ItemATK[];
  onQuickRestock: (item: ItemATK) => void;
}

export const LowStockAlertModal: React.FC<LowStockModalProps> = ({
  isOpen,
  onClose,
  lowStockItems,
  onQuickRestock,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-rose-950 text-white p-5 flex items-center justify-between border-b border-rose-900">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-900/80 rounded-xl text-rose-300">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">
                Peringatan Stok Minimum ATK
              </h3>
              <p className="text-xs text-rose-200">
                {lowStockItems.length > 0
                  ? `${lowStockItems.length} item ATK telah mencapai atau di bawah batas minimum.`
                  : 'Semua stok persediaan saat ini dalam batas aman.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-rose-300 hover:text-white rounded-lg hover:bg-rose-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="text-xs font-semibold text-slate-700">
              Daftar Barang Perlu Pengadaan / Restock
            </span>
            <button
              type="button"
              onClick={() => playAlertChime()}
              className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-emerald-800 bg-slate-100 hover:bg-emerald-50 px-2.5 py-1 rounded-md transition-colors font-medium"
            >
              <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>Uji Bunyi Lonceng</span>
            </button>
          </div>

          {lowStockItems.length === 0 ? (
            <div className="py-8 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-800">Persediaan Sangat Aman</p>
              <p className="text-xs text-slate-500">
                Tidak ada barang ATK yang mendekati atau di bawah batas minimum pengamanan.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {lowStockItems.map((item) => {
                const isZero = item.stok <= 0;
                return (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isZero
                        ? 'bg-rose-50/80 border-rose-300'
                        : 'bg-amber-50/80 border-amber-300'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-600">
                          {item.kodeBarang}
                        </span>
                        <span className="text-xs text-slate-400">·</span>
                        <span className="text-xs text-slate-500">{item.kategori}</span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 leading-snug">
                        {item.namaBarang}
                      </h4>
                      <div className="flex items-center gap-3 text-xs text-slate-600 pt-0.5">
                        <span>
                          Sisa Stok:{' '}
                          <strong
                            className={`font-mono text-sm tabular-nums ${
                              isZero ? 'text-rose-700' : 'text-amber-700'
                            }`}
                          >
                            {item.stok} {item.satuan}
                          </strong>
                        </span>
                        <span>·</span>
                        <span>
                          Batas Minimum: <strong>{item.stokMinimum} {item.satuan}</strong>
                        </span>
                        <span>·</span>
                        <span className="text-slate-500">{item.lokasiRak}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onQuickRestock(item);
                        onClose();
                      }}
                      className="px-3.5 py-2 bg-slate-900 hover:bg-emerald-800 text-white font-bold rounded-lg text-xs transition-colors shrink-0 flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
                      <span>Input Barang Masuk</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Sistem otomatis membunyikan lonceng dan menampilkan banner saat stok kritis.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg text-xs transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
