"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  List,
  BarChart2,
  Target,
  Plus,
  CreditCard,
  Camera,
  X,
  Settings,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useDebtStore } from "@/stores/debtStore";

const leftItems = [
  { href: "/", icon: Home, label: "Beranda" },
  { href: "/transactions", icon: List, label: "Transaksi" },
];

const rightItems = [
  { href: "/reports", icon: BarChart2, label: "Laporan" },
  { href: "/goals", icon: Target, label: "Goals" },
];

// Radial layout config
// Angles in degrees, measured from right (counter-clockwise = upward on screen)
const FAB_ITEMS = [
  {
    icon: Camera,
    label: "Scan",
    color: "#10B981",
    shadow: "rgba(16,185,129,0.45)",
    angle: 150, // upper-left
    href: "/scan",
  },
  {
    icon: CreditCard,
    label: "Utang",
    color: "#F59E0B",
    shadow: "rgba(245,158,11,0.45)",
    angle: 90, // straight up
    href: "/debts",
  },
  {
    icon: Settings,
    label: "Setting",
    color: "#6366F1",
    shadow: "rgba(99,102,241,0.45)",
    angle: 30, // upper-right
    href: "/settings",
  },
];

// Radius of radial spread in px
const RADIUS = 82;

function NavItem({
  href,
  icon: Icon,
  label,
  isActive,
  badge,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  isActive: boolean;
  badge?: number;
}) {
  return (
    <Link
      href={href}
      className="flex-1 flex flex-col items-center justify-center gap-0.5"
    >
      <div className="relative">
        <Icon
          className={cn(
            "w-5 h-5 transition-colors",
            isActive ? "text-sky-500" : "text-slate-400 dark:text-slate-500",
          )}
          strokeWidth={isActive ? 2.5 : 2}
        />
        {badge != null && badge > 0 && (
          <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
            {badge > 9 ? "9+" : badge}
          </span>
        )}
      </div>
      <span
        className={cn(
          "text-[10px] font-medium transition-colors",
          isActive ? "text-sky-500" : "text-slate-400 dark:text-slate-500",
        )}
      >
        {label}
      </span>
    </Link>
  );
}

interface BottomNavProps {
  onFabClick?: () => void;
}

export function BottomNav({ onFabClick: _onFabClick }: BottomNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const overdueCount = useDebtStore((s) => s.getOverdueCount());
  const [fabOpen, setFabOpen] = useState(false);

  function handleItemClick(href: string) {
    setFabOpen(false);
    router.push(href);
  }

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {fabOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-20 bg-black/40 backdrop-blur-[3px]"
            onClick={() => setFabOpen(false)}
          />
        )}
      </AnimatePresence>

      {/*
        Radial item container anchored at the FAB center.
        FAB: fixed bottom-0 nav (h-16=64px) + -top-5 (-20px) = top at 84px from bottom.
        FAB h-14 (56px) → center at 84 + 28 = 112px from bottom.
        Container: bottom: (112 - 24)px = 88px (accounts for half button size 24px)
        so that translate(0,0) = button center lines up with FAB center.
      */}
      <div
        className="fixed z-30 pointer-events-none"
        style={{ bottom: "88px", left: "50%", width: 0, height: 0 }}
      >
        <AnimatePresence>
          {fabOpen &&
            FAB_ITEMS.map((item, i) => {
              const rad = (item.angle * Math.PI) / 180;
              const tx = Math.round(Math.cos(rad) * RADIUS);
              // Negative because screen y is inverted (up = negative y)
              const ty = Math.round(-Math.sin(rad) * RADIUS);

              return (
                <motion.div
                  key={item.label}
                  className="absolute flex flex-col items-center gap-1.5 pointer-events-auto"
                  style={{
                    // -24px centers the 48px button at the container origin
                    marginLeft: -24,
                    marginTop: -24,
                  }}
                  initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
                  animate={{ x: tx, y: ty, scale: 1, opacity: 1 }}
                  exit={{
                    x: 0,
                    y: 0,
                    scale: 0,
                    opacity: 0,
                    transition: { delay: (FAB_ITEMS.length - 1 - i) * 0.04 },
                  }}
                  transition={{
                    delay: i * 0.06,
                    type: "spring",
                    stiffness: 300,
                    damping: 22,
                  }}
                >
                  {/* Circle button */}
                  <motion.button
                    whileTap={{ scale: 0.88 }}
                    onClick={() => handleItemClick(item.href)}
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: item.color,
                      boxShadow: `0 4px 18px ${item.shadow}`,
                    }}
                  >
                    <item.icon className="w-5 h-5 text-white" strokeWidth={2} />
                  </motion.button>

                  {/* Label */}
                  <motion.span
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.7 }}
                    transition={{ delay: i * 0.06 + 0.1 }}
                    className="text-[10px] font-bold text-white leading-none whitespace-nowrap"
                    style={{ textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}
                  >
                    {item.label}
                  </motion.span>
                </motion.div>
              );
            })}
        </AnimatePresence>
      </div>

      {/* Bottom Nav Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white dark:bg-slate-900 border-t border-sky-100 dark:border-slate-800 safe-bottom">
        <div className="relative h-16 max-w-xl mx-auto px-2">
          <div className="flex items-center h-full">
            {/* LEFT */}
            <div className="flex flex-1 items-center h-full">
              {leftItems.map((item) => (
                <NavItem
                  key={item.href}
                  {...item}
                  isActive={pathname === item.href}
                />
              ))}
            </div>

            {/* FAB SPACER */}
            <div className="w-16 shrink-0" />

            {/* RIGHT */}
            <div className="flex flex-1 items-center h-full">
              {rightItems.map((item) => (
                <NavItem
                  key={item.href}
                  {...item}
                  isActive={pathname === item.href}
                  badge={item.href === "/debts" ? overdueCount : undefined}
                />
              ))}
            </div>
          </div>

          {/* FLOATING ACTION BUTTON */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setFabOpen((v) => !v)}
            aria-label="Menu aksi"
            className="absolute -top-5 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full flex items-center justify-center z-40"
            style={{
              background: fabOpen
                ? "linear-gradient(135deg, #475569 0%, #334155 100%)"
                : "linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)",
              boxShadow: fabOpen
                ? "0 4px 20px rgba(71,85,105,0.5)"
                : "0 4px 20px rgba(14,165,233,0.45)",
              transition: "background 0.25s, box-shadow 0.25s",
            }}
          >
            <motion.div
              animate={{ rotate: fabOpen ? 45 : 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 24 }}
            >
              {fabOpen ? (
                <X className="w-6 h-6 text-white" strokeWidth={2.5} />
              ) : (
                <Plus className="w-7 h-7 text-white" strokeWidth={2.5} />
              )}
            </motion.div>
          </motion.button>
        </div>
      </nav>
    </>
  );
}
