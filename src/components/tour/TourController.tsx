"use client";

import { useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Joyride,
  EVENTS,
  STATUS,
  type Controls,
  type EventData,
  type Step,
} from "react-joyride";
import { useTourStore } from "@/stores/tourStore";
import { TOUR_STEPS } from "@/lib/tour-steps";
import { TourTooltip } from "@/components/tour/TourTooltip";

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
  const { hasSeenTour, isRunning, startTour, stopTour } = useTourStore();
  const autoStartedRef = useRef(false);

  useEffect(() => {
    if (autoStartedRef.current || hasSeenTour) return;
    autoStartedRef.current = true;
    const timer = setTimeout(() => startTour(), 800);
    return () => clearTimeout(timer);
  }, [hasSeenTour, startTour]);

  const steps: Step[] = useMemo(
    () =>
      TOUR_STEPS.map(({ route, icon, ...step }) => ({
        ...step,
        data: { icon },
        before: async () => {
          if (window.location.pathname !== route) {
            router.push(route);
            await waitForPathname(route);
          }
        },
      })),
    [router],
  );

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
