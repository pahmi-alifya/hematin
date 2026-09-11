"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { LogIn } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { useLoginForm } from "@/hooks/useLoginForm";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  );
}

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";
  const { register, errors, isSubmitting, onSubmit } = useLoginForm(redirectTo);

  return (
    <AuthLayout>
      <div className="w-full p-6 sm:px-6 max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <div
            className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center text-white"
            style={{ background: "linear-gradient(135deg, #0EA5E9, #0284C7)" }}
          >
            <LogIn className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            Masuk ke HEMATIN
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Akses dompet yang kamu bagikan atau lanjutkan di device lain
          </p>
        </motion.div>

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <Input
            label="Email"
            type="email"
            placeholder="nama@email.com"
            autoComplete="email"
            error={errors.email?.message}
            {...register("email")}
          />
          <Input
            label="Password"
            type="password"
            placeholder="Password kamu"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register("password")}
          />

          <Button
            type="submit"
            fullWidth
            loading={isSubmitting}
            className="mt-2"
          >
            Masuk
          </Button>
        </form>

        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
          Belum punya akun?{" "}
          <Link
            href={`/register?redirect=${encodeURIComponent(redirectTo)}`}
            className="text-sky-600 dark:text-sky-400 font-semibold"
          >
            Daftar
          </Link>
        </p>

        <button
          onClick={() => router.push("/")}
          className="text-center text-sm text-slate-400 dark:text-slate-500 mt-3 mx-auto block"
        >
          Lanjutkan sebagai Guest
        </button>
      </div>
    </AuthLayout>
  );
}
