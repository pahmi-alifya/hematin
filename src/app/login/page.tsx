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
import { useTranslation } from "@/hooks/useTranslation";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  );
}

function LoginPageContent() {
  const t = useTranslation();
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
            {t.auth.login.title}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t.auth.login.subtitle}
          </p>
        </motion.div>

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <Input
            label={t.auth.login.emailLabel}
            type="email"
            placeholder={t.auth.login.emailPlaceholder}
            autoComplete="email"
            error={errors.email?.message}
            {...register("email")}
          />
          <Input
            label={t.auth.login.passwordLabel}
            type="password"
            placeholder={t.auth.login.passwordPlaceholder}
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
            {t.auth.login.submitButton}
          </Button>
        </form>

        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
          {t.auth.login.noAccountPrompt}{" "}
          <Link
            href={`/register?redirect=${encodeURIComponent(redirectTo)}`}
            className="text-sky-600 dark:text-sky-400 font-semibold"
          >
            {t.auth.login.registerLink}
          </Link>
        </p>

        <button
          onClick={() => router.push("/")}
          className="text-center text-sm text-slate-400 dark:text-slate-500 mt-3 mx-auto block"
        >
          {t.auth.login.continueAsGuest}
        </button>
      </div>
    </AuthLayout>
  );
}
