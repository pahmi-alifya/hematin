"use client";

import { create } from "zustand";

export type TourId = "onboarding" | "wallet";

const STORAGE_KEYS: Record<TourId, string> = {
  onboarding: "hematin-tour-completed",
  wallet: "hematin-wallet-tour-completed",
};

interface TourStore {
  activeTour: TourId | null;
  isRunning: boolean;
  hasSeenTour: Record<TourId, boolean>;
  startTour: (tour: TourId) => void;
  stopTour: () => void;
  resetAllTours: () => void;
}

function readHasSeenTour(tour: TourId): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(STORAGE_KEYS[tour]) === "1";
}

export const useTourStore = create<TourStore>((set, get) => ({
  activeTour: null,
  isRunning: false,
  hasSeenTour: {
    onboarding: readHasSeenTour("onboarding"),
    wallet: readHasSeenTour("wallet"),
  },

  startTour: (tour) => {
    if (get().activeTour !== null) return;
    set({ activeTour: tour, isRunning: true });
  },

  stopTour: () => {
    const tour = get().activeTour;
    if (tour && typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS[tour], "1");
    }
    set((s) => ({
      activeTour: null,
      isRunning: false,
      hasSeenTour: tour ? { ...s.hasSeenTour, [tour]: true } : s.hasSeenTour,
    }));
  },

  resetAllTours: () => {
    if (typeof window !== "undefined") {
      Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
    }
    set({ hasSeenTour: { onboarding: false, wallet: false } });
  },
}));
