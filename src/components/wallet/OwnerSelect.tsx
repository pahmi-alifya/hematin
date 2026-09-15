"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface OwnerOption {
  id: string;
  label: string;
  roleLabel: string;
}

interface OwnerSelectProps {
  options: OwnerOption[];
  value: string | undefined;
  onChange: (id: string) => void;
  placeholder: string;
}

/** Dropdown custom (bukan native <select>, lihat catatan di MemberRoleSelect.tsx) - pilih anggota mana yang jadi owner baru. */
export function OwnerSelect({
  options,
  value,
  onChange,
  placeholder,
}: OwnerSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const current = options.find((o) => o.id === value);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "w-full flex items-center justify-between gap-2 text-sm font-medium border rounded-xl px-3 py-2.5 transition-colors",
          current
            ? "border-sky-200 dark:border-sky-800/60 bg-sky-50 dark:bg-sky-900/20 text-slate-800 dark:text-slate-100"
            : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500",
        )}
      >
        <span className="truncate">
          {current ? `${current.label} · ${current.roleLabel}` : placeholder}
        </span>
        <ChevronDown
          className={cn(
            "w-4 h-4 shrink-0 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.12 }}
            className="absolute left-0 right-0 top-full mt-1 z-50 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg overflow-hidden"
          >
            {options.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  onChange(opt.id);
                  setOpen(false);
                }}
                className="w-full flex items-center justify-between gap-2 px-3 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-slate-700 transition-colors text-left"
              >
                <span className="truncate">
                  {opt.label}{" "}
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    · {opt.roleLabel}
                  </span>
                </span>
                {opt.id === value && (
                  <Check className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
