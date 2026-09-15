'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import { joinWalletByKey } from '@/lib/sharing'
import { toast } from '@/components/ui/Toast'
import { useTranslation } from '@/hooks/useTranslation'

/** Owns alur "gabung dompet pakai key" - termasuk gate login untuk Guest. */
export function useJoinWallet(onSuccess: () => void) {
  const t = useTranslation()
  const router = useRouter()
  const isGuest = useAuthStore((s) => s.isGuest)
  const [key, setKey] = useState('')
  const [loading, setLoading] = useState(false)

  function redirectToLogin() {
    toast(t.wallets.join.needsAccountToast, 'error')
    router.push(`/login?redirect=${encodeURIComponent('/wallets?join=1')}`)
  }

  async function handleJoin() {
    if (isGuest) {
      redirectToLogin()
      return
    }
    const trimmed = key.trim()
    if (!trimmed) {
      toast(t.wallets.join.emptyKeyToast, 'error')
      return
    }
    setLoading(true)
    try {
      const result = await joinWalletByKey(trimmed)
      if (!result.success) {
        toast(result.error ?? t.wallets.join.genericErrorToast, 'error')
        return
      }
      toast(t.wallets.join.successToast, 'success')
      setKey('')
      onSuccess()
    } catch {
      toast(t.wallets.join.errorToast, 'error')
    } finally {
      setLoading(false)
    }
  }

  return { key, setKey, loading, isGuest, handleJoin, redirectToLogin }
}
