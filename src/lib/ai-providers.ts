export const AI_PROVIDERS = {
  anthropic: {
    name: 'Anthropic',
    logo: '🟣',
    models: [
      { id: 'claude-sonnet-4-6', name: 'Claude Sonnet 4.6', desc: 'Recommended — cerdas & cepat', vision: true },
      { id: 'claude-opus-4-6', name: 'Claude Opus 4.6', desc: 'Paling cerdas', vision: true },
      { id: 'claude-haiku-4-5-20251001', name: 'Claude Haiku 4.5', desc: 'Paling hemat & cepat', vision: true },
    ],
    keyPrefix: 'sk-ant-',
    keyPlaceholder: 'sk-ant-api03-...',
    docsUrl: 'https://console.anthropic.com/settings/keys',
  },
  openai: {
    name: 'OpenAI',
    logo: '⚫',
    models: [
      { id: 'gpt-4o', name: 'GPT-4o', desc: 'Recommended — multimodal terbaik', vision: true },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', desc: 'Lebih hemat, tetap cerdas', vision: true },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', desc: 'Versi turbo GPT-4', vision: true },
    ],
    keyPrefix: 'sk-',
    keyPlaceholder: 'sk-proj-...',
    docsUrl: 'https://platform.openai.com/api-keys',
  },
  gemini: {
    name: 'Google Gemini',
    logo: '🔵',
    models: [
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', desc: 'Recommended — konteks panjang', vision: true },
      { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', desc: 'Cepat & efisien', vision: true },
      { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', desc: 'Terbaru & tercepat', vision: true },
    ],
    keyPrefix: 'AIza',
    keyPlaceholder: 'AIzaSy...',
    docsUrl: 'https://aistudio.google.com/app/apikey',
  },
} as const

export type AIProviderKey = keyof typeof AI_PROVIDERS

export function getModelsForProvider(provider: AIProviderKey) {
  return AI_PROVIDERS[provider].models
}

export function getDefaultModel(provider: AIProviderKey): string {
  return AI_PROVIDERS[provider].models[0].id
}

export function isValidKeyFormat(provider: AIProviderKey, key: string): boolean {
  return key.startsWith(AI_PROVIDERS[provider].keyPrefix)
}
