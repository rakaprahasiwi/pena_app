/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { KejaksaanLogo } from './KejaksaanLogo';
import { Lock, User, KeyRound, AlertCircle, X, ShieldCheck } from 'lucide-react';
import { AdminUser } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessLogin: (user: AdminUser) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSuccessLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fillQuickDemo = () => {
    // Mengisi otomatis dengan akun superadmin untuk mempermudah testing
    setUsername('superadmin');
    setPassword('superadmin123');
    setError(null);
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();

      if (data.success) {
        setError(null);
        onSuccessLogin(data.user);
        onClose();
        setPassword('');
      } else {
        setError(data.message || 'Username atau password salah.');
      }
    } catch (err) {
      setError('Koneksi ke server gagal.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 text-center relative border-b border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex justify-center mb-2">
            <KejaksaanLogo size={48} />
          </div>
          <h3 className="font-extrabold text-base text-white tracking-wide">
            LOGIN ADMINISTRATOR PENA
          </h3>
          <p className="text-xs text-emerald-300/90 mt-1">
            Pengelolaan Master Sistem Pencatatan Inventarisasi ATK
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>Username Administrator</span>
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              placeholder="admin"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-slate-400" />
              <span>Kata Sandi (Password)</span>
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          {/* Quick Demo Helper */}
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Akun Demo: <strong>admin</strong> / <strong>admin123</strong></span>
            </div>
            <button
              type="button"
              onClick={fillQuickDemo}
              className="text-emerald-800 font-semibold hover:underline"
            >
              Isi Otomatis
            </button>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm transition-colors text-xs flex items-center justify-center gap-2"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Masuk ke Dashboard Admin</span>
          </button>
        </form>
      </div>
    </div>
  );
};
