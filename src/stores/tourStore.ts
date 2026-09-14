"use client";

import { create } from "zustand";

const STORAGE_KEY = "hematin-tour-completed";

interface TourStore {
  hasSeenTour: boolean;
  isRunning: boolean;
  startTour: () => void;
  stopTour: () => void;
}

function readHasSeenTour(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(STORAGE_KEY) === "1";
}

export const useTourStore = create<TourStore>((set) => ({
  hasSeenTour: readHasSeenTour(),
  isRunning: false,

  startTour: () => set({ isRunning: true }),

  stopTour: () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, "1");
    }
    set({ isRunning: false, hasSeenTour: true });
  },
}));
