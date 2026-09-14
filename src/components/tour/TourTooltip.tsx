"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";
import type { TooltipRenderProps } from "react-joyride";

export function TourTooltip({
  backProps,
  closeProps,
  continuous,
  index,
  isLastStep,
  primaryProps,
  size,
  skipProps,
  step,
  tooltipProps,
}: TooltipRenderProps) {
  const Icon = (step.data as { icon?: React.ComponentType<{ className?: string }> } | undefined)
    ?.icon;

  return (
    <motion.div
      {...tooltipProps}
      initial={{ opacity: 0, scale: 0.94, y: 6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 340, damping: 28 }}
      className="relative w-[320px] max-w-[86vw] rounded-2xl bg-white dark:bg-slate-800 border border-sky-100 dark:border-slate-700/60 shadow-xl shadow-sky-950/10 dark:shadow-black/40 overflow-hidden"
    >
      <div
        className="h-1.5 w-full"
        style={{
          background: "linear-gradient(90deg, #0EA5E9, #38BDF8, #7DD3FC)",
        }}
      />

      <button
        {...closeProps}
        aria-label="Tutup"
        className="absolute top-3.5 right-3.5 w-6 h-6 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-500 hover:text-slate-500 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      <div className="p-5 pt-4">
        <div className="flex items-center gap-2.5 mb-2 pr-6">
          {Icon && (
            <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-900/40 flex items-center justify-center shrink-0">
              <Icon className="w-4 h-4 text-sky-500" />
            </div>
          )}
          {step.title && (
            <h4
              id="joyride-tooltip-title"
              className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight"
            >
              {step.title}
            </h4>
          )}
        </div>

        {step.content && (
          <div className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
            {step.content}
          </div>
        )}

        {continuous && size > 1 && (
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1">
              {Array.from({ length: size }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    i === index
                      ? "w-5 bg-sky-500"
                      : i < index
                        ? "w-1 bg-sky-300 dark:bg-sky-700"
                        : "w-1 bg-slate-200 dark:bg-slate-700"
                  }`}
                />
              ))}
            </div>
            <span className="text-[10px] font-semibold text-slate-300 dark:text-slate-600 tabular-nums">
              {index + 1}/{size}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between">
          {!isLastStep ? (
            <button
              {...skipProps}
              className="text-xs font-semibold text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              Lewati
            </button>
          ) : (
            <span />
          )}

          <div className="flex items-center gap-3">
            {index > 0 && (
              <button
                {...backProps}
                className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              >
                Kembali
              </button>
            )}
            <motion.button
              {...primaryProps}
              whileTap={{ scale: 0.96 }}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md shadow-sky-500/30"
              style={{
                background: "linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)",
              }}
            >
              {isLastStep ? "Selesai 🎉" : "Lanjut"}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
