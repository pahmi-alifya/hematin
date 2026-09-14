"use client";

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
  Key,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { BottomNav } from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/Button";
import { useAIProviderSetup } from "@/hooks/useAIProviderSetup";
import { AI_PROVIDERS } from "@/lib/ai-providers";
import { maskApiKey } from "@/lib/utils";
import { ConnectionTest } from "@/components/settings/ConnectionTest";
import { DataBackupSection } from "@/components/settings/DataBackupSection";
import { useTranslation } from "@/hooks/useTranslation";
import type { AIProviderKey } from "@/lib/ai-providers";

export default function SettingsPage() {
  const t = useTranslation();
  const {
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
  } = useAIProviderSetup();

  const currentProviderConfig = AI_PROVIDERS[selectedProvider];

  return (
    <div className="min-h-screen bg-sky-50 dark:bg-[#0B1120]">
      <Header title={t.settings.pageTitle} showBack hideWalletSwitcher />

      <PageWrapper>
        <div className="pb-28 space-y-4">
          {/* Support */}
          <div className="bg-white dark:bg-slate-800/60 rounded-2xl shadow-sm border border-sky-100 dark:border-slate-700/60 p-4">
            <div className="flex items-center gap-2 mb-1">
              <Heart className="w-4 h-4 text-rose-500" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {t.settings.support.title}
              </p>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-3 leading-relaxed">
              {t.settings.support.description}
            </p>
            <a
              href="https://trakteer.id/pahmi_alifya/tip"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 active:bg-rose-700 transition-colors text-white text-sm font-semibold"
            >
              <Heart className="w-4 h-4" />
              {t.settings.support.cta}
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </a>
          </div>

          {/* Status Card */}
          <AnimatePresence>
            {isConfigured && aiSettings && keyStep === "model" && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40 rounded-2xl p-4 flex items-start gap-3"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-emerald-700">
                    {t.settings.status.active}
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
              {t.settings.provider.title}
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
                  <span
                    className={`text-xs font-semibold ${selectedProvider === p ? "text-sky-600 dark:text-sky-400" : "text-slate-600 dark:text-slate-400"}`}
                  >
                    {AI_PROVIDERS[p].name}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* API Key Input */}
          <div className="bg-white dark:bg-slate-800/60 rounded-2xl shadow-sm border border-sky-100 dark:border-slate-700/60 p-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {t.settings.apiKey.title}
              </p>
              <a
                href={currentProviderConfig.docsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-sky-600 dark:text-sky-400 font-medium"
              >
                {t.settings.apiKey.getKey} <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-3">
              {t.settings.apiKey.hint}
            </p>

            {keyStep === "input" ? (
              <>
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
                  onClick={handleSaveKey}
                >
                  {t.settings.apiKey.save}
                </Button>
              </>
            ) : (
              <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="text-sm font-mono text-slate-600 dark:text-slate-400">
                    {maskApiKey(aiSettings?.apiKey ?? "")}
                  </span>
                </div>
                <button
                  onClick={() => setKeyStep("input")}
                  className="text-xs text-sky-600 dark:text-sky-400 font-semibold"
                >
                  {t.settings.apiKey.change}
                </button>
              </div>
            )}
          </div>

          {/* Model Selector — muncul setelah API key tersimpan */}
          <AnimatePresence>
            {keyStep === "model" && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                className="bg-white dark:bg-slate-800/60 rounded-2xl shadow-sm border border-sky-100 dark:border-slate-700/60 p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {t.settings.model.title}
                    </p>
                    {dynamicModels && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400">
                        {t.settings.model.live}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={handleFetchModels}
                    disabled={fetchingModels}
                    className="flex items-center gap-1 text-xs text-sky-600 dark:text-sky-400 font-medium disabled:opacity-50"
                  >
                    <RefreshCw
                      className={`w-3 h-3 ${fetchingModels ? "animate-spin" : ""}`}
                    />
                    {fetchingModels
                      ? t.settings.model.loadingModels
                      : t.settings.model.refresh}
                  </button>
                </div>

                {fetchingModels ? (
                  <div className="flex items-center justify-center gap-2 py-6 text-slate-400 dark:text-slate-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">{t.settings.model.loadingList}</span>
                  </div>
                ) : dynamicModels === null ? (
                  <div className="flex flex-col items-center gap-2 py-6 text-center">
                    <p className="text-sm text-slate-400 dark:text-slate-500">
                      {t.settings.model.loadingList}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
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

                <Button
                  variant="primary"
                  fullWidth
                  className="mt-4"
                  loading={saving}
                  onClick={handleSaveSettings}
                >
                  {t.settings.model.save}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Test Koneksi */}
          {isConfigured && aiSettings && keyStep === "model" && (
            <div className="bg-white dark:bg-slate-800/60 rounded-2xl shadow-sm border border-sky-100 dark:border-slate-700/60 p-4">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t.settings.connectionTest.sectionTitle}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mb-3">
                {t.settings.connectionTest.sectionDescription}
              </p>
              <ConnectionTest settings={aiSettings} />
            </div>
          )}

          {/* Danger Zone */}
          {isConfigured && (
            <div className="bg-white dark:bg-slate-800/60 rounded-2xl shadow-sm border border-red-100 dark:border-red-900/40 p-4">
              <p className="text-sm font-semibold text-red-600 dark:text-red-400 mb-1">
                {t.settings.dangerZone.title}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                {t.settings.dangerZone.description}
              </p>
              <Button
                variant="danger"
                fullWidth
                loading={clearing}
                onClick={handleClear}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {t.settings.dangerZone.button}
              </Button>
            </div>
          )}

          {/* Data & Backup */}
          {/* <DataBackupSection /> */}

          {/* Info Note */}
          <div className="bg-sky-50 dark:bg-sky-900/20 rounded-2xl border border-sky-100 dark:border-sky-800/40 p-4">
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              <span className="font-semibold text-sky-700 dark:text-sky-400">
                {t.settings.securityNote.label}
              </span>{" "}
              {t.settings.securityNote.text}{" "}
              <span className="font-medium">
                {t.settings.securityNote.bold}
              </span>
              {t.settings.securityNote.suffix}
            </p>
          </div>

          {/* Created by */}
          <div className="bg-white dark:bg-slate-800/60 rounded-2xl shadow-sm border border-sky-100 dark:border-slate-700/60 p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                {t.settings.createdBy.label}
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
