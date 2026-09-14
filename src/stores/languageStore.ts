"use client";

import { create } from "zustand";

export type Language = "id" | "en";

const STORAGE_KEY = "hematin-language";

interface LanguageStore {
  language: Language;
  setLanguage: (language: Language) => void;
  toggle: () => void;
}

// Selalu mulai dari 'id' baik di server maupun render pertama di client (sebelum hydration) —
// menghindari mismatch hydration Next.js, karena localStorage cuma bisa dibaca setelah mount
// (lihat LanguageProvider di components/ui/LanguageToggle.tsx, pola sama seperti ThemeProvider).
export const useLanguageStore = create<LanguageStore>((set) => ({
  language: "id",

  setLanguage: (language) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, language);
    }
    set({ language });
  },

  toggle: () =>
    set((s) => {
      const next: Language = s.language === "id" ? "en" : "id";
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, next);
      }
      return { language: next };
    }),
}));

export { STORAGE_KEY as LANGUAGE_STORAGE_KEY };
