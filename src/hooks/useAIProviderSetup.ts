'use client'

import { useEffect, useRef, useState } from 'react'
import { useSettingsStore, type CachedModel } from '@/stores/settingsStore'
import { toast } from '@/components/ui/Toast'
import { AI_PROVIDERS, isValidKeyFormat, type AIProviderKey } from '@/lib/ai-providers'
import { buildAIHeaders } from '@/lib/utils'
import { useTranslation } from '@/hooks/useTranslation'

/** Owns seluruh alur pilih provider AI, simpan API key, dan pilih model untuk halaman Settings. */
export function useAIProviderSetup() {
  const t = useTranslation()
  const { aiSettings, isConfigured, loadSettings, saveSettings, clearSettings, cachedModelsByProvider, setCachedModels } =
    useSettingsStore()

  const [selectedProvider, setSelectedProvider] = useState<AIProviderKey>('gemini')
  const [selectedModel, setSelectedModel] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [saving, setSaving] = useState(false)
  const [clearing, setClearing] = useState(false)
  const [fetchingModels, setFetchingModels] = useState(false)
  const [keyStep, setKeyStep] = useState<'input' | 'model'>('input')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Read from per-provider cache — persists across navigations & tab switches
  const dynamicModels: CachedModel[] | null = cachedModelsByProvider[selectedProvider] ?? null

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  useEffect(() => {
    if (!aiSettings) return
    setSelectedProvider(aiSettings.provider as AIProviderKey)
    setSelectedModel(aiSettings.model)
    setKeyStep('model')
    // Auto-fetch if this provider has no cache yet
    if (!cachedModelsByProvider[aiSettings.provider]) {
      fetchModels(aiSettings.provider as AIProviderKey, aiSettings.apiKey)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiSettings])

  // Debounced auto-fetch when user types a new API key (preloads model list)
  useEffect(() => {
    if (!apiKey.trim()) return
    if (!isValidKeyFormat(selectedProvider, apiKey.trim())) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      fetchModels(selectedProvider, apiKey.trim())
    }, 700)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey, selectedProvider])

  /** notify=true dipakai saat user klik "Perbarui model" manual — tampilkan toast hasil/error. */
  async function fetchModels(provider: AIProviderKey, key: string, opts: { notify?: boolean } = {}) {
    if (!key) return
    setFetchingModels(true)
    try {
      const res = await fetch('/api/models', { headers: buildAIHeaders({ provider, apiKey: key }) })
      const json = (await res.json()) as { models?: CachedModel[]; error?: string }
      if (!res.ok || !json.models) {
        throw new Error(json.error ?? t.settings.toast.fetchModelsListError)
      }
      setCachedModels(json.models, provider)
      setSelectedModel((prev) => (json.models!.find((m) => m.id === prev) ? prev : (json.models![0]?.id ?? '')))
      if (opts.notify) toast(t.settings.toast.modelsFound(json.models.length), 'success')
    } catch (err) {
      if (opts.notify) toast(err instanceof Error ? err.message : t.settings.toast.fetchModelsError, 'error')
      // auto-fetch (notify=false) gagal secara diam — user bisa retry manual
    } finally {
      setFetchingModels(false)
    }
  }

  function handleFetchModels() {
    const activeKey = aiSettings?.apiKey
    if (!activeKey) {
      toast(t.settings.toast.enterApiKeyFirst, 'error')
      return
    }
    fetchModels(selectedProvider, activeKey, { notify: true })
  }

  function handleProviderChange(p: AIProviderKey) {
    setSelectedProvider(p)
    const cached = cachedModelsByProvider[p]
    setSelectedModel(cached?.[0]?.id ?? '')
    setApiKey('')
    setKeyStep('input')
  }

  async function handleSaveKey() {
    if (!apiKey.trim()) {
      toast(t.settings.toast.enterApiKeyFirst, 'error')
      return
    }
    if (!isValidKeyFormat(selectedProvider, apiKey.trim())) {
      toast(t.settings.toast.invalidKeyFormat(AI_PROVIDERS[selectedProvider].name), 'error')
      return
    }
    const trimmedKey = apiKey.trim()
    setSaving(true)
    try {
      await saveSettings({ provider: selectedProvider, model: '', apiKey: trimmedKey })
      setApiKey('')
      await fetchModels(selectedProvider, trimmedKey)
      setKeyStep('model')
      toast(t.settings.toast.keySaved, 'success')
    } catch {
      toast(t.settings.toast.keySaveError, 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveSettings() {
    if (!aiSettings) return
    setSaving(true)
    try {
      await saveSettings({ provider: selectedProvider, model: selectedModel, apiKey: aiSettings.apiKey })
      toast(t.settings.toast.settingsSaved, 'success')
    } catch {
      toast(t.settings.toast.settingsSaveError, 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleClear() {
    setClearing(true)
    try {
      await clearSettings()
      setKeyStep('input')
      toast(t.settings.toast.settingsCleared, 'success')
      setApiKey('')
    } catch {
      toast(t.settings.toast.settingsClearError, 'error')
    } finally {
      setClearing(false)
    }
  }

  return {
    aiSettings,
    isConfigured,
    selectedProvider,
    selectedModel,
    setSelectedModel,
    apiKey,
    setApiKey,
    showKey,
    setShowKey,
    saving,
    clearing,
    fetchingModels,
    keyStep,
    setKeyStep,
    dynamicModels,
    handleFetchModels,
    handleProviderChange,
    handleSaveKey,
    handleSaveSettings,
    handleClear,
  }
}
