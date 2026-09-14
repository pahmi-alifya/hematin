"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { useLanguageStore, LANGUAGE_STORAGE_KEY } from "@/stores/languageStore";

/** Baca preferensi bahasa dari localStorage setelah mount (menghindari hydration mismatch). */
export function LanguageProvider() {
  const setLanguage = useLanguageStore((s) => s.setLanguage);

  useEffect(() => {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (saved === "en") setLanguage("en");
  }, [setLanguage]);

  return null;
}

/** Tombol toggle bahasa Indonesia/English */
export function LanguageToggle({ className }: { className?: string }) {
  const { language, toggle } = useLanguageStore();
  const isId = language === "id";

  return (
    <motion.button
      type="button"
      aria-label={isId ? "Switch to English" : "Ganti ke Bahasa Indonesia"}
      whileTap={{ scale: 0.94 }}
      onClick={toggle}
      className={`h-9 px-3 rounded-full flex items-center justify-center gap-1.5 text-xs font-bold transition-colors
        bg-slate-100 text-slate-600 hover:bg-slate-200
        dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600
        ${className ?? ""}`}
    >
      <motion.span
        key={language}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15 }}
      >
        {isId ? "🇮🇩 ID" : "🇬🇧 EN"}
      </motion.span>
    </motion.button>
  );
}
