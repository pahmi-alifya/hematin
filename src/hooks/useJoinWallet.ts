'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import { joinWalletByKey } from '@/lib/sharing'
import { toast } from '@/components/ui/Toast'

/** Owns alur "gabung dompet pakai key" — termasuk gate login untuk Guest. */
export function useJoinWallet(onSuccess: () => void) {
  const router = useRouter()
  const isGuest = useAuthStore((s) => s.isGuest)
  const [key, setKey] = useState('')
  const [loading, setLoading] = useState(false)

  function redirectToLogin() {
    toast('Sharing dompet butuh akun, silakan masuk atau daftar dulu', 'error')
    router.push(`/login?redirect=${encodeURIComponent('/wallets?join=1')}`)
  }

  async function handleJoin() {
    if (isGuest) {
      redirectToLogin()
      return
    }
    const trimmed = key.trim()
    if (!trimmed) {
      toast('Masukkan key dompet', 'error')
      return
    }
    setLoading(true)
    try {
      const result = await joinWalletByKey(trimmed)
      if (!result.success) {
        toast(result.error ?? 'Gagal bergabung, cek kembali key-nya', 'error')
        return
      }
      toast('Berhasil bergabung ke dompet', 'success')
      setKey('')
      onSuccess()
    } catch {
      toast('Gagal bergabung', 'error')
    } finally {
      setLoading(false)
    }
  }

  return { key, setKey, loading, isGuest, handleJoin, redirectToLogin }
}
