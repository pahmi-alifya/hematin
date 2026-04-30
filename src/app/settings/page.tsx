"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  ExternalLink,
  Eye,
  EyeOff,
  RefreshCw,
  Trash2,
  Loader2,
  Heart,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { BottomNav } from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/Button";
import { toast } from "@/components/ui/Toast";
import { useSettingsStore } from "@/stores/settingsStore";
import {
  AI_PROVIDERS,
  getDefaultModel,
  isValidKeyFormat,
} from "@/lib/ai-providers";
import { maskApiKey } from "@/lib/utils";
import { ConnectionTest } from "@/components/settings/ConnectionTest";
import { DataBackupSection } from "@/components/settings/DataBackupSection";
import type { AIProviderKey } from "@/lib/ai-providers";
import type { CachedModel } from "@/stores/settingsStore";

export default function SettingsPage() {
  const {
    aiSettings,
    isConfigured,
    loadSettings,
    saveSettings,
    clearSettings,
    cachedModelsByProvider,
    setCachedModels,
  } = useSettingsStore();

  const [selectedProvider, setSelectedProvider] =
    useState<AIProviderKey>("anthropic");
  const [selectedModel, setSelectedModel] = useState(
    getDefaultModel("anthropic"),
  );
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [fetchingModels, setFetchingModels] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Read from per-provider cache — persists across navigations & tab switches
  const dynamicModels: CachedModel[] | null =
    cachedModelsByProvider[selectedProvider] ?? null;

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    if (!aiSettings) return;
    setSelectedProvider(aiSettings.provider as AIProviderKey);
    setSelectedModel(aiSettings.model);
    // Auto-fetch if this provider has no cache yet
    if (!cachedModelsByProvider[aiSettings.provider]) {
      fetchModels(aiSettings.provider as AIProviderKey, aiSettings.apiKey);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiSettings]);

  // Debounced auto-fetch when user types a new API key
  useEffect(() => {
    if (!apiKey.trim()) return;
    if (!isValidKeyFormat(selectedProvider, apiKey.trim())) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchModels(selectedProvider, apiKey.trim());
    }, 700);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey, selectedProvider]);

  async function fetchModels(provider: AIProviderKey, key: string) {
    if (!key) return;
    setFetchingModels(true);
    try {
      const res = await fetch("/api/models", {
        headers: {
          "X-AI-Provider": provider,
          "X-AI-Key": key,
        },
      });
      const json = (await res.json()) as {
        models?: CachedModel[];
        error?: string;
      };
      if (!res.ok || !json.models) {
        throw new Error(json.error ?? "Gagal mengambil daftar model");
      }
      // Save to Zustand store so it persists across navigations
      setCachedModels(json.models, provider);
      setSelectedModel((prev) =>
        json.models!.find((m) => m.id === prev)
          ? prev
          : (json.models![0]?.id ?? getDefaultModel(provider)),
      );
    } catch {
      // silently fail on auto-fetch; user can retry manually
    } finally {
      setFetchingModels(false);
    }
  }

  async function handleFetchModels() {
    const activeKey = apiKey.trim() || aiSettings?.apiKey;
    if (!activeKey) {
      toast("Masukkan API key terlebih dahulu", "error");
      return;
    }
    setFetchingModels(true);
    try {
      const res = await fetch("/api/models", {
        headers: {
          "X-AI-Provider": selectedProvider,
          "X-AI-Key": activeKey,
        },
      });
      const json = (await res.json()) as {
        models?: CachedModel[];
        error?: string;
      };
      if (!res.ok || !json.models) {
        throw new Error(json.error ?? "Gagal mengambil daftar model");
      }
      setCachedModels(json.models, selectedProvider);
      if (!json.models.find((m) => m.id === selectedModel)) {
        setSelectedModel(
          json.models[0]?.id ?? getDefaultModel(selectedProvider),
        );
      }
      toast(`${json.models.length} model ditemukan`, "success");
    } catch (err) {
      toast(
        err instanceof Error ? err.message : "Gagal mengambil model",
        "error",
      );
    } finally {
      setFetchingModels(false);
    }
  }

  function handleProviderChange(p: AIProviderKey) {
    setSelectedProvider(p);
    // Restore saved model for this provider if cached, else default
    const cached = cachedModelsByProvider[p];
    setSelectedModel(cached?.[0]?.id ?? getDefaultModel(p));
    setApiKey("");
    // If this provider has no cache AND we have saved credentials, auto-fetch
    if (!cached && aiSettings?.apiKey && aiSettings.provider === p) {
      fetchModels(p, aiSettings.apiKey);
    }
  }

  async function handleSave() {
    if (!apiKey.trim()) {
      toast("Masukkan API key terlebih dahulu", "error");
      return;
    }
    if (!isValidKeyFormat(selectedProvider, apiKey.trim())) {
      toast(
        `Format API key tidak valid untuk ${AI_PROVIDERS[selectedProvider].name}`,
        "error",
      );
      return;
    }
    setSaving(true);
    try {
      await saveSettings({
        provider: selectedProvider,
        model: selectedModel,
        apiKey: apiKey.trim(),
      });
      toast("Pengaturan AI berhasil disimpan", "success");
      setApiKey("");
    } catch {
      toast("Gagal menyimpan pengaturan", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleClear() {
    setClearing(true);
    try {
      await clearSettings();
      toast("Pengaturan AI dihapus", "success");
      setApiKey("");
    } catch {
      toast("Gagal menghapus pengaturan", "error");
    } finally {
      setClearing(false);
    }
  }

  const currentProviderConfig = AI_PROVIDERS[selectedProvider];
  const canFetchModels = !!(apiKey.trim() || aiSettings?.apiKey);

  return (
    <div className="min-h-screen bg-sky-50 dark:bg-[#0B1120]">
      <Header title="Pengaturan AI" showBack />

      <PageWrapper>
        <div className="pb-28 space-y-4">
          {/* Support */}
          <div className="bg-white dark:bg-slate-800/60 rounded-2xl shadow-sm border border-sky-100 dark:border-slate-700/60 p-4">
            <div className="flex items-center gap-2 mb-1">
              <Heart className="w-4 h-4 text-rose-500" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Dukung Pengembangan
              </p>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-3 leading-relaxed">
              HEMATIN gratis selamanya. Jika aplikasi ini membantu keuanganmu,
              kamu bisa support pengembang lewat Trakteer — secara sukarela 🙏
            </p>
            <a
              href="https://trakteer.id/pahmi_alifya/tip"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 active:bg-rose-700 transition-colors text-white text-sm font-semibold"
            >
              <Heart className="w-4 h-4" />
              Support di Trakteer
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </a>
          </div>
          {/* Status Card */}
          <AnimatePresence>
            {isConfigured && aiSettings && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40 rounded-2xl p-4 flex items-start gap-3"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-emerald-700">
                    AI Aktif
                  </p>
                  <p className="text-xs text-emerald-600 mt-0.5">
                    {AI_PROVIDERS[aiSettings.provider as AIProviderKey]?.name} —{" "}
                    {aiSettings.model}
                  </p>
                  <p className="text-xs text-emerald-500 font-mono mt-0.5">
                    {maskApiKey(aiSettings.apiKey)}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Provider Selector */}
          <div className="bg-white dark:bg-slate-800/60 rounded-2xl shadow-sm border border-sky-100 dark:border-slate-700/60 p-4">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
              Pilih Provider AI
            </p>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(AI_PROVIDERS) as AIProviderKey[]).map((p) => (
                <motion.button
                  key={p}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleProviderChange(p)}
                  className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 transition-colors ${
                    selectedProvider === p
                      ? "border-sky-500 bg-sky-50 dark:bg-sky-900/40"
                      : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  }`}
                >
                  {/* <span className="text-xl">{AI_PROVIDERS[p].logo}</span> */}
                  <span
                    className={`text-xs font-semibold ${selectedProvider === p ? "text-sky-600 dark:text-sky-400" : "text-slate-600 dark:text-slate-400"}`}
                  >
                    {AI_PROVIDERS[p].name}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Model Selector */}
          <div className="bg-white dark:bg-slate-800/60 rounded-2xl shadow-sm border border-sky-100 dark:border-slate-700/60 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Pilih Model
                </p>
                {dynamicModels && (
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400">
                    Live
                  </span>
                )}
              </div>
              {canFetchModels && (
                <button
                  onClick={handleFetchModels}
                  disabled={fetchingModels}
                  className="flex items-center gap-1 text-xs text-sky-600 dark:text-sky-400 font-medium disabled:opacity-50"
                >
                  <RefreshCw
                    className={`w-3 h-3 ${fetchingModels ? "animate-spin" : ""}`}
                  />
                  {fetchingModels ? "Memuat..." : "Perbarui model"}
                </button>
              )}
            </div>
            {fetchingModels ? (
              <div className="flex items-center justify-center gap-2 py-6 text-slate-400 dark:text-slate-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Memuat daftar model...</span>
              </div>
            ) : dynamicModels === null ? (
              <div className="flex flex-col items-center gap-2 py-6 text-center">
                <p className="text-sm text-slate-400 dark:text-slate-500">
                  Masukkan API key untuk memuat daftar model
                </p>
                <p className="text-xs text-slate-300 dark:text-slate-600">
                  Model akan otomatis terdeteksi setelah key valid
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {dynamicModels.map((m) => (
                  <motion.button
                    key={m.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedModel(m.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-colors ${
                      selectedModel === m.id
                        ? "border-sky-500 bg-sky-50 dark:bg-sky-900/40"
                        : "border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        selectedModel === m.id
                          ? "border-sky-500"
                          : "border-slate-300 dark:border-slate-600"
                      }`}
                    >
                      {selectedModel === m.id && (
                        <div className="w-2 h-2 rounded-full bg-sky-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-semibold ${selectedModel === m.id ? "text-sky-700 dark:text-sky-400" : "text-slate-700 dark:text-slate-300"}`}
                      >
                        {m.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {m.desc}
                      </p>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </div>

          {/* API Key Input */}
          <div className="bg-white dark:bg-slate-800/60 rounded-2xl shadow-sm border border-sky-100 dark:border-slate-700/60 p-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                API Key
              </p>
              <a
                href={currentProviderConfig.docsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-sky-600 dark:text-sky-400 font-medium"
              >
                Dapatkan key <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-3">
              Key disimpan hanya di perangkat kamu, tidak dikirim ke server
              kami.
            </p>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={currentProviderConfig.keyPlaceholder}
                className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-mono text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-sky-400 focus:bg-white dark:focus:bg-slate-700 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowKey((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
              >
                {showKey ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>

            <Button
              variant="primary"
              fullWidth
              className="mt-3"
              loading={saving}
              onClick={handleSave}
            >
              Simpan Pengaturan
            </Button>
          </div>

          {/* Test Koneksi */}
          {isConfigured && aiSettings && (
            <div className="bg-white dark:bg-slate-800/60 rounded-2xl shadow-sm border border-sky-100 dark:border-slate-700/60 p-4">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Test Koneksi
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mb-3">
                Pastikan API key dan model yang dipilih bisa terhubung ke
                provider.
              </p>
              <ConnectionTest settings={aiSettings} />
            </div>
          )}

          {/* Danger Zone */}
          {isConfigured && (
            <div className="bg-white dark:bg-slate-800/60 rounded-2xl shadow-sm border border-red-100 dark:border-red-900/40 p-4">
              <p className="text-sm font-semibold text-red-600 dark:text-red-400 mb-1">
                Hapus Konfigurasi
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                API key akan dihapus dari perangkat ini.
              </p>
              <Button
                variant="danger"
                fullWidth
                loading={clearing}
                onClick={handleClear}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Hapus API Key
              </Button>
            </div>
          )}

          {/* Data & Backup */}
          <DataBackupSection />

          {/* Info Note */}
          <div className="bg-sky-50 dark:bg-sky-900/20 rounded-2xl border border-sky-100 dark:border-sky-800/40 p-4">
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              <span className="font-semibold text-sky-700 dark:text-sky-400">
                Keamanan:
              </span>{" "}
              API key disimpan secara lokal di perangkat menggunakan IndexedDB
              dan{" "}
              <span className="font-medium">
                tidak pernah dikirim ke server HEMATIN
              </span>
              . Key hanya digunakan untuk komunikasi langsung ke provider AI
              pilihanmu.
            </p>
          </div>

          {/* Created by */}
          <div className="bg-white dark:bg-slate-800/60 rounded-2xl shadow-sm border border-sky-100 dark:border-slate-700/60 p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Dibuat oleh
              </p>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Pahmi Alifya Bahri
              </p>
            </div>
            <a
              href="https://www.linkedin.com/in/pahmi-alifya-bahri-479a0919a/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0A66C2] hover:bg-[#0958A8] active:bg-[#084d93] transition-colors text-white text-xs font-semibold"
            >
              LinkedIn
              <ExternalLink className="w-3 h-3 opacity-80" />
            </a>
          </div>
        </div>
      </PageWrapper>

      <BottomNav />
    </div>
  );
}
