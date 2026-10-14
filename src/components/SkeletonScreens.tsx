'use client';

import React from 'react';

// Single Item Card Skeleton for Kiosk Grid
export const CardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between shadow-xs animate-pulse">
      <div className="space-y-3.5">
        {/* Kode barang & Kategori */}
        <div className="flex items-center justify-between">
          <div className="h-3.5 w-20 bg-slate-200 rounded" />
          <div className="h-3 w-16 bg-slate-100 rounded" />
        </div>

        {/* Nama barang (2 baris) */}
        <div className="space-y-2 pt-1">
          <div className="h-4.5 w-5/6 bg-slate-200 rounded" />
          <div className="h-3.5 w-3/5 bg-slate-100 rounded" />
        </div>

        {/* Lokasi rak */}
        <div className="flex items-center gap-2 pt-1">
          <div className="w-3.5 h-3.5 rounded bg-slate-200" />
          <div className="h-3 w-28 bg-slate-100 rounded" />
        </div>
      </div>

      {/* Sisa stok & Tombol */}
      <div className="pt-4 mt-4 border-t border-slate-100 space-y-3.5">
        <div className="flex items-baseline justify-between">
          <div className="h-3 w-16 bg-slate-100 rounded" />
          <div className="flex items-baseline gap-1.5">
            <div className="h-6 w-10 bg-slate-200 rounded" />
            <div className="h-3 w-6 bg-slate-100 rounded" />
          </div>
        </div>

        {/* Status badge */}
        <div className="h-3.5 w-28 bg-slate-100 rounded" />

        {/* Action button */}
        <div className="h-10 w-full bg-slate-200 rounded-lg" />
      </div>
    </div>
  );
};

// Table Rows Skeleton for Dashboard Admin
export const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({ rows = 5, cols = 6 }) => {
  return (
    <div className="w-full bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs animate-pulse">
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
        <div className="h-5 w-36 bg-slate-200 rounded" />
        <div className="h-8 w-44 bg-slate-200 rounded-lg" />
      </div>
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div key={rIdx} className="p-4 flex items-center gap-4">
            {Array.from({ length: cols }).map((_, cIdx) => (
              <div
                key={cIdx}
                className="h-4 bg-slate-200 rounded"
                style={{
                  width: cIdx === 0 ? '40px' : cIdx === 1 ? '140px' : cIdx === 2 ? '220px' : '100px',
                  flexShrink: cIdx === 2 ? 1 : 0,
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

// Full App Skeleton Screen during initial load
export const AppLoadingSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      
      {/* 1. Header Skeleton */}
      <header className="sticky top-0 z-40 bg-slate-900 border-b border-emerald-900/60 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 animate-pulse">
            {/* Logo & Title */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-800 border border-emerald-700/40" />
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-14 bg-slate-700 rounded" />
                  <div className="h-4 w-40 bg-slate-800 rounded hidden md:block" />
                </div>
                <div className="h-2.5 w-48 bg-slate-800 rounded hidden sm:block" />
              </div>
            </div>

            {/* Navigation Tabs Pill */}
            <div className="flex items-center bg-slate-800/90 p-1 rounded-lg border border-slate-700/80 gap-1">
              <div className="h-8 w-32 sm:w-40 bg-emerald-900/60 rounded-md" />
              <div className="h-8 w-28 sm:w-36 bg-slate-700/50 rounded-md" />
            </div>

            {/* Right Action Icons */}
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-slate-800" />
              <div className="w-9 h-9 rounded-lg bg-slate-800" />
              <div className="h-9 w-24 rounded-lg bg-slate-800 hidden sm:block" />
            </div>
          </div>
        </div>
      </header>

      {/* 2. Main Content Skeleton */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Hero / Banner Skeleton */}
        <div className="bg-linear-to-r from-emerald-950 via-slate-900 to-slate-950 rounded-2xl p-6 sm:p-8 border border-emerald-800/30 shadow-md animate-pulse">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="h-5 w-44 bg-emerald-800/50 rounded-full" />
              <div className="h-8 sm:h-9 w-3/4 bg-slate-700 rounded-lg" />
              <div className="h-4 w-5/6 bg-slate-800 rounded" />
            </div>
            <div className="flex items-center gap-4 bg-slate-900/80 p-4 rounded-xl border border-emerald-700/30 shrink-0">
              <div className="space-y-1.5 text-center px-3">
                <div className="h-7 w-12 bg-slate-700 rounded mx-auto" />
                <div className="h-2.5 w-16 bg-slate-800 rounded" />
              </div>
              <div className="w-px h-8 bg-slate-800" />
              <div className="space-y-1.5 text-center px-3">
                <div className="h-7 w-12 bg-slate-700 rounded mx-auto" />
                <div className="h-2.5 w-16 bg-slate-800 rounded" />
              </div>
            </div>
          </div>
        </div>

        {/* Search & Categories Bar Skeleton */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 space-y-4 animate-pulse">
          {/* Search Input Skeleton */}
          <div className="h-11 w-full bg-slate-100 rounded-lg border border-slate-200/60" />

          {/* Category Chips Skeleton */}
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="h-8 w-20 bg-emerald-900/20 rounded-lg shrink-0" />
            <div className="h-8 w-28 bg-slate-100 rounded-lg shrink-0" />
            <div className="h-8 w-32 bg-slate-100 rounded-lg shrink-0" />
            <div className="h-8 w-36 bg-slate-100 rounded-lg shrink-0" />
            <div className="h-8 w-32 bg-slate-100 rounded-lg shrink-0" />
            <div className="h-8 w-40 bg-slate-100 rounded-lg shrink-0" />
            <div className="h-8 w-36 bg-slate-100 rounded-lg shrink-0" />
          </div>
        </div>

        {/* 3. Katalog Grid Cards Skeleton (8 Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, idx) => (
            <CardSkeleton key={idx} />
          ))}
        </div>
      </main>
    </div>
  );
};

