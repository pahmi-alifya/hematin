'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerFormSchema, type RegisterFormValues } from '@/lib/validation/schemas'
import { useAuthStore } from '@/stores/authStore'
import { toast } from '@/components/ui/Toast'

export function useRegisterForm(redirectTo = '/') {
  const router = useRouter()
  const signUp = useAuthStore((s) => s.signUp)
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  })

  async function onSubmit(values: RegisterFormValues) {
    const result = await signUp(values)
    if (!result.success) {
      toast(result.error ?? 'Gagal mendaftar', 'error')
      return
    }
    toast('Akun berhasil dibuat, selamat datang!', 'success')
    router.push(redirectTo)
  }

  return {
    register: form.register,
    errors: form.formState.errors,
    isSubmitting: form.formState.isSubmitting,
    onSubmit: form.handleSubmit(onSubmit),
  }
}
