"use client";

import { useRouter } from "next/navigation";
import { UserCircle2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { toast } from "@/components/ui/Toast";
import { useAuthStore } from "@/stores/authStore";

export function AccountSection() {
  const router = useRouter();
  const { user, isGuest, isLoading, signOut } = useAuthStore();

  if (isLoading) return null;

  async function handleSignOut() {
    await signOut();
    toast("Berhasil keluar", "success");
  }

  return (
    <div className="bg-white dark:bg-slate-800/60 rounded-2xl shadow-sm border border-sky-100 dark:border-slate-700/60 p-4">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-full bg-sky-100 dark:bg-sky-900/40 flex items-center justify-center text-sky-600 dark:text-sky-400 shrink-0">
          <UserCircle2 className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
            {isGuest ? "Guest" : (user?.user_metadata?.name as string) || user?.email}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
            {isGuest ? "Data tersimpan lokal di perangkat ini" : user?.email}
          </p>
        </div>
        {isGuest ? (
          <Button size="sm" variant="secondary" onClick={() => router.push("/login")}>
            Masuk
          </Button>
        ) : (
          <Button size="sm" variant="ghost" onClick={handleSignOut}>
            <LogOut className="w-4 h-4" />
          </Button>
        )}
      </div>
      {isGuest && (
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-3 leading-relaxed">
          Daftar/masuk untuk bisa membagikan dompet ke orang lain. Data lokal kamu tetap aman &
          otomatis ikut tersimpan begitu kamu daftar.
        </p>
      )}
    </div>
  );
}
