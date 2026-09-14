'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginFormValues } from '@/lib/validation/schemas'
import { useAuthStore } from '@/stores/authStore'
import { toast } from '@/components/ui/Toast'
import { useTranslation } from '@/hooks/useTranslation'

export function useLoginForm(redirectTo = '/') {
  const t = useTranslation()
  const router = useRouter()
  const signIn = useAuthStore((s) => s.signIn)
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  async function onSubmit(values: LoginFormValues) {
    const result = await signIn(values)
    if (!result.success) {
      toast(result.error ?? t.auth.login.errorToast, 'error')
      return
    }
    toast(t.auth.login.successToast, 'success')
    router.push(redirectTo)
  }

  return {
    register: form.register,
    errors: form.formState.errors,
    isSubmitting: form.formState.isSubmitting,
    onSubmit: form.handleSubmit(onSubmit),
  }
}
