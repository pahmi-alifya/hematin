"use client";

import { useEffect, useMemo, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Joyride,
  EVENTS,
  STATUS,
  type Controls,
  type EventData,
  type Step,
} from "react-joyride";
import { useTourStore } from "@/stores/tourStore";
import { getTourSteps } from "@/lib/tour-steps";
import { getWalletTourSteps } from "@/lib/wallet-tour-steps";
import { TourTooltip } from "@/components/tour/TourTooltip";
import { useLanguageStore } from "@/stores/languageStore";
import { useAuthStore } from "@/stores/authStore";
import { useWalletStore, isSharedWithMe } from "@/stores/walletStore";

const PATHNAME_POLL_INTERVAL_MS = 50;
const PATHNAME_POLL_TIMEOUT_MS = 2000;

function waitForPathname(route: string) {
  return new Promise<void>((resolve) => {
    if (window.location.pathname === route) {
      resolve();
      return;
    }
    const start = Date.now();
    const interval = setInterval(() => {
      if (
        window.location.pathname === route ||
        Date.now() - start > PATHNAME_POLL_TIMEOUT_MS
      ) {
        clearInterval(interval);
        resolve();
      }
    }, PATHNAME_POLL_INTERVAL_MS);
  });
}

export function TourController() {
  const router = useRouter();
  const pathname = usePathname();
  const { activeTour, hasSeenTour, isRunning, startTour, stopTour } = useTourStore();
  const language = useLanguageStore((s) => s.language);
  const isGuest = useAuthStore((s) => s.isGuest);
  const ownedWalletId = useWalletStore(
    (s) => s.wallets.find((w) => !isSharedWithMe(w))?.id ?? null,
  );
  const onboardingAutoStartedRef = useRef(false);
  const walletAutoStartedRef = useRef(false);

  useEffect(() => {
    if (onboardingAutoStartedRef.current || hasSeenTour.onboarding) return;
    onboardingAutoStartedRef.current = true;
    const timer = setTimeout(() => startTour("onboarding"), 800);
    return () => clearTimeout(timer);
  }, [hasSeenTour.onboarding, startTour]);

  useEffect(() => {
    if (walletAutoStartedRef.current || hasSeenTour.wallet) return;
    if (pathname !== "/wallets") return;
    walletAutoStartedRef.current = true;
    const timer = setTimeout(() => startTour("wallet"), 1000);
    return () => clearTimeout(timer);
  }, [pathname, hasSeenTour.wallet, startTour]);

  const steps: Step[] = useMemo(() => {
    const raw =
      activeTour === "wallet"
        ? getWalletTourSteps(language, isGuest, ownedWalletId)
        : getTourSteps(language);

    return raw.map(({ route, icon, ...step }) => ({
      ...step,
      data: { icon },
      before: async () => {
        if (window.location.pathname !== route) {
          router.push(route);
          await waitForPathname(route);
        }
      },
    }));
  }, [activeTour, language, isGuest, ownedWalletId, router]);

  function handleEvent(data: EventData, controls: Controls) {
    if (data.type === EVENTS.TARGET_NOT_FOUND) {
      controls.next();
      return;
    }
    if (
      data.type === EVENTS.TOUR_END &&
      (data.status === STATUS.FINISHED || data.status === STATUS.SKIPPED)
    ) {
      stopTour();
    }
  }

  return (
    <Joyride
      steps={steps}
      run={isRunning}
      continuous
      scrollToFirstStep
      onEvent={handleEvent}
      tooltipComponent={TourTooltip}
      floatingOptions={{ hideArrow: true }}
      locale={{
        back: "Kembali",
        close: "Tutup",
        last: "Selesai",
        next: "Lanjut",
        skip: "Lewati",
      }}
      options={{
        overlayColor: "rgba(8, 14, 28, 0.65)",
        zIndex: 10000,
        targetWaitTimeout: 3000,
        spotlightPadding: 6,
        spotlightRadius: 14,
        skipBeacon: true,
      }}
      styles={{
        spotlight: {
          stroke: "#0EA5E9",
          strokeWidth: 2,
          filter: "drop-shadow(0 0 10px rgba(14, 165, 233, 0.65))",
        },
      }}
    />
  );
}
