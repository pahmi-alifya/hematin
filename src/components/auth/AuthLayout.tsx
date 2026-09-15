"use client";

import { AuthScene } from "./AuthScene";

interface AuthLayoutProps {
  children: React.ReactNode;
}

/**
 * Shell bersama halaman login/register: split-screen di desktop (form kiri, scene
 * kanan), scene jadi background blur penuh layar di mobile dengan form mengambang
 * di atasnya.
 */
export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="relative min-h-dvh bg-sky-50 dark:bg-[#0B1120] overflow-hidden md:flex md:flex-row-reverse">
      {/* Scene: background penuh layar di mobile, panel kanan di desktop */}
      <div className="absolute inset-0 md:relative md:inset-auto md:w-1/2 md:h-dvh">
        <AuthScene />
      </div>

      {/* Scrim mobile - supaya form tetap kebaca di atas scene, tetap di keluarga biru yang sama */}
      <div className="absolute inset-0 md:hidden bg-linear-to-b from-[#075985]/10 via-[#075985]/45 to-[#075985]/80" />

      {/* Form panel */}
      <div className="relative z-10 flex-1 min-h-dvh flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-md rounded-3xl bg-white/90 dark:bg-slate-900/80 backdrop-blur-md md:backdrop-blur-none md:bg-transparent border border-white/60 dark:border-slate-700/40 md:border-none shadow-xl md:shadow-none p-6 md:p-0">
          {children}
        </div>
      </div>
    </div>
  );
}
