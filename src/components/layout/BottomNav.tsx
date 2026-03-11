"use client";

import React from "react";
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
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useDebtStore } from "@/stores/debtStore";

const leftItems = [
  { href: "/", icon: Home, label: "Beranda" },
  { href: "/transactions", icon: List, label: "Transaksi" },
  { href: "/scan", icon: Camera, label: "Scan" },
];

const rightItems = [
  { href: "/debts", icon: CreditCard, label: "Utang" },
  { href: "/reports", icon: BarChart2, label: "Laporan" },
  { href: "/goals", icon: Target, label: "Goals" },
];

interface BottomNavProps {
  onFabClick?: () => void;
}

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

export function BottomNav({ onFabClick }: BottomNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const overdueCount = useDebtStore((s) => s.getOverdueCount());

  function handleFab() {
    if (onFabClick) {
      onFabClick();
    } else {
      router.push("/transactions");
    }
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white dark:bg-slate-900 border-t border-sky-100 dark:border-slate-800 safe-bottom">
      <div className="relative h-16 max-w-xl mx-auto px-2">
        <div className="flex items-center h-full">
          {/* LEFT ITEMS — flex-1 agar simetris dengan right */}
          <div className="flex flex-1 items-center h-full">
            {leftItems.map((item) => (
              <NavItem
                key={item.href}
                {...item}
                isActive={pathname === item.href}
              />
            ))}
          </div>

          {/* FAB SPACER — ruang kosong di tengah untuk FAB */}
          <div className="w-16 shrink-0" />

          {/* RIGHT ITEMS — flex-1 agar simetris dengan left */}
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
          whileTap={{ scale: 0.92 }}
          onClick={handleFab}
          aria-label="Tambah transaksi"
          className="absolute -top-5 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)",
            boxShadow: "0 4px 20px rgba(14,165,233,0.4)",
          }}
        >
          <Plus className="w-7 h-7 text-white" strokeWidth={2.5} />
        </motion.button>
      </div>
    </nav>
  );
}
